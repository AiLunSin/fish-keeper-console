import { promises as fsp, watch as fsWatch } from 'node:fs'
import { join } from 'node:path'
import { appendJsonl, atomicWriteBuffer, atomicWriteJson, ensureDir, gzipBuffer, gunzipBuffer, newId, nowIso, readFileBounded, readJsonSafe, resolveWithin, sha256Buffer, sha256File, statSafe, unifiedDiff } from './util.js'

const MAX_LAST_KNOWN_BYTES = 32 * 1024 * 1024
const DEFAULT_MAX_FILE_BYTES = 8 * 1024 * 1024

export class CheckpointManager {
  constructor(options) {
    this.dataRoot = options.dataRoot
    this.source = options.source
    this.description = options.describe
    this.log = options.log ?? (() => {})
    this.retention = {
      maxCheckpointsPerSource: options.retention?.maxCheckpointsPerSource ?? 200,
      maxAgeDays: options.retention?.maxAgeDays ?? 90,
      maxBytesPerSource: options.retention?.maxBytesPerSource ?? 512 * 1024 * 1024,
      maxFileBytes: options.retention?.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES,
    }
    this.dir = join(this.dataRoot, 'checkpoints', this.source.id)
    this.blobsDir = join(this.dir, 'blobs')
    this.diffsDir = join(this.dir, 'diffs')
    this.indexFile = join(this.dir, 'index.jsonl')
    this.auditFile = join(this.dataRoot, 'audit', `${this.source.id}.actions.jsonl`)
    this.manifests = new Map()
    this.lastKnown = new Map()
    this.lastKnownBytes = 0
    this.statCache = new Map()
    this.watchers = []
    this.debounce = undefined
    this.pendingPaths = new Set()
    this.reconcileTimer = undefined
    this.closed = false
    this.queue = Promise.resolve()
  }

  async init() {
    await ensureDir(this.dir)
    await ensureDir(this.blobsDir)
    await ensureDir(this.diffsDir)
    await ensureDir(join(this.dataRoot, 'audit'))
    await this.loadManifests()
    await this.cleanStaging()
  }

  async loadManifests() {
    this.manifests.clear()
    let entries = []
    try {
      entries = await fsp.readdir(this.dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith('ck_')) continue
      const manifest = await readJsonSafe(join(this.dir, entry.name, 'manifest.json'))
      if (manifest && manifest.id === entry.name) this.manifests.set(manifest.id, manifest)
    }
  }

  async cleanStaging() {
    const staging = join(this.dir, '.staging')
    let entries = []
    try {
      entries = await fsp.readdir(staging, { withFileTypes: true })
    } catch {
      return
    }
    const cutoff = Date.now() - 60 * 60 * 1000
    for (const entry of entries) {
      const path = join(staging, entry.name)
      const stat = await statSafe(path)
      if (stat && stat.mtimeMs < cutoff) await fsp.rm(path, { recursive: true, force: true })
    }
  }

  async baseline() {
    const files = this.description.files ?? []
    for (const file of files) {
      await this.refreshKnown(file, { readContent: true })
    }
  }

  async refreshKnown(file, { readContent = false } = {}) {
    const absolute = join(this.source.location, ...file.path.split('/'))
    const stat = await statSafe(absolute)
    if (!stat || !stat.isFile()) return
    this.statCache.set(file.path, { size: stat.size, mtimeMs: stat.mtimeMs })
    if (file.restorable && readContent && stat.size <= this.retention.maxFileBytes) {
      const read = await readFileBounded(absolute, this.retention.maxFileBytes)
      if (!read.truncated && read.buffer) {
        const hash = sha256Buffer(read.buffer)
        this.setKnown(file.path, { hash, content: read.buffer, size: stat.size, mtimeMs: stat.mtimeMs })
        return
      }
    }
    const hash = await sha256File(absolute)
    this.setKnown(file.path, { hash, content: null, size: stat.size, mtimeMs: stat.mtimeMs })
  }

  setKnown(path, value) {
    const previous = this.lastKnown.get(path)
    if (previous?.content) this.lastKnownBytes -= previous.content.length
    this.lastKnown.set(path, value)
    if (value.content) this.lastKnownBytes += value.content.length
    while (this.lastKnownBytes > MAX_LAST_KNOWN_BYTES) {
      let removed = false
      for (const [key, entry] of this.lastKnown) {
        if (entry.content) {
          this.lastKnownBytes -= entry.content.length
          this.lastKnown.set(key, { ...entry, content: null })
          removed = true
          break
        }
      }
      if (!removed) break
    }
  }

  runExclusive(fn) {
    const next = this.queue.then(fn, fn)
    this.queue = next.catch(() => {})
    return next
  }

  async create(trigger, targetPaths, options = {}) {
    return await this.runExclusive(() => this.createUnlocked(trigger, targetPaths, options))
  }

  async createUnlocked(trigger, targetPaths, options = {}) {
    if (this.closed) return null
    const filter = targetPaths ? new Set(targetPaths) : undefined
    const files = []
    const auto = trigger?.kind === 'auto'
    const triggerRoles = new Set(['diary', 'persona', 'memory'])
    const filesToScan = (this.description.files ?? [])
      .filter(file => !filter || filter.has(file.path))
      .filter(file => !auto || triggerRoles.has(file.role))
    const snapshotCurrent = Boolean(options.snapshotCurrent)
      for (const file of filesToScan) {
        const absolute = join(this.source.location, ...file.path.split('/'))
        const stat = await statSafe(absolute)
        if (!stat || !stat.isFile()) continue
        if (snapshotCurrent && file.restorable && stat.size <= this.retention.maxFileBytes) {
          const read = await readFileBounded(absolute, this.retention.maxFileBytes)
          if (read.truncated || !read.buffer) continue
          const hash = sha256Buffer(read.buffer)
          const blob = await this.putBlob(read.buffer)
          files.push({
            path: file.path,
            role: file.role,
            restorable: true,
            changed: true,
            before: { sha256: hash, bytes: read.buffer.length, blob: blob.path, mode: stat.mode & 0o777 },
            after: { sha256: hash, bytes: stat.size, mtimeMs: stat.mtimeMs },
            mode: 'snapshot',
            storedBytes: blob.storedBytes,
          })
          this.statCache.set(file.path, { size: stat.size, mtimeMs: stat.mtimeMs })
          this.setKnown(file.path, { hash, content: read.buffer, size: stat.size, mtimeMs: stat.mtimeMs })
          continue
        }
        if (file.appendOnly || !file.restorable) {
          const hash = await sha256File(absolute)
          const previous = this.lastKnown.get(file.path)
          if (previous?.hash === hash) continue
          files.push({
            path: file.path,
            role: file.role,
            restorable: false,
            changed: true,
            before: null,
            after: { sha256: hash, bytes: stat.size, mtimeMs: stat.mtimeMs },
            storedBytes: 0,
          })
          this.statCache.set(file.path, { size: stat.size, mtimeMs: stat.mtimeMs })
          this.setKnown(file.path, { hash, content: null, size: stat.size, mtimeMs: stat.mtimeMs })
          continue
        }
        if (stat.size > this.retention.maxFileBytes) {
          const hash = await sha256File(absolute)
          const previous = this.lastKnown.get(file.path)
          if (previous?.hash === hash) continue
          files.push({
            path: file.path,
            role: file.role,
            restorable: file.restorable,
            changed: true,
            before: null,
            after: { sha256: hash, bytes: stat.size, mtimeMs: stat.mtimeMs },
            skipped: 'file-too-large',
            storedBytes: 0,
          })
          this.statCache.set(file.path, { size: stat.size, mtimeMs: stat.mtimeMs })
          this.setKnown(file.path, { hash, content: null, size: stat.size, mtimeMs: stat.mtimeMs })
          continue
        }
        const read = await readFileBounded(absolute, this.retention.maxFileBytes)
        if (read.truncated || !read.buffer) continue
        const hash = sha256Buffer(read.buffer)
        const previous = this.lastKnown.get(file.path)
        if (previous?.hash === hash) continue
        if (!previous || !previous.content) {
          this.statCache.set(file.path, { size: stat.size, mtimeMs: stat.mtimeMs })
          this.setKnown(file.path, { hash, content: read.buffer, size: stat.size, mtimeMs: stat.mtimeMs })
          files.push({
            path: file.path,
            role: file.role,
            restorable: true,
            changed: true,
            before: null,
            after: { sha256: hash, bytes: stat.size, mtimeMs: stat.mtimeMs },
            baselineReset: true,
            storedBytes: 0,
          })
          continue
        }
        const beforeBuffer = previous.content
        const beforeHash = sha256Buffer(beforeBuffer)
        if (beforeHash !== previous.hash) {
          this.statCache.set(file.path, { size: stat.size, mtimeMs: stat.mtimeMs })
          this.setKnown(file.path, { hash, content: read.buffer, size: stat.size, mtimeMs: stat.mtimeMs })
          files.push({
            path: file.path,
            role: file.role,
            restorable: true,
            changed: true,
            before: null,
            after: { sha256: hash, bytes: stat.size, mtimeMs: stat.mtimeMs },
            baselineReset: true,
            storedBytes: 0,
          })
          continue
        }
        const blob = await this.putBlob(beforeBuffer)
        const diff = unifiedDiff(beforeBuffer.toString('utf8'), read.buffer.toString('utf8'), file.path)
        files.push({
          path: file.path,
          role: file.role,
          restorable: true,
          changed: true,
          before: { sha256: beforeHash, bytes: beforeBuffer.length, blob: blob.path, mode: stat.mode & 0o777 },
          after: { sha256: hash, bytes: stat.size, mtimeMs: stat.mtimeMs },
          diff: diff.text ? await this.putDiff(diff.text, file.path) : undefined,
          added: diff.added,
          removed: diff.removed,
          mode: 'change',
          storedBytes: blob.storedBytes,
        })
        this.statCache.set(file.path, { size: stat.size, mtimeMs: stat.mtimeMs })
        this.setKnown(file.path, { hash, content: read.buffer, size: stat.size, mtimeMs: stat.mtimeMs })
      }
      if (files.length === 0) return null
      const id = newId('ck')
      const manifest = {
        schemaVersion: 1,
        id,
        sourceId: this.source.id,
        createdAt: nowIso(),
        trigger: normalizeTrigger(trigger, files),
        baseline: trigger?.kind === 'baseline',
        pinned: false,
        tool: { name: 'dsh-fishkeeper', version: '0.1.0' },
        files,
        totals: {
          logicalBytes: files.reduce((sum, file) => sum + (file.after?.bytes ?? 0), 0),
          storedBytes: files.reduce((sum, file) => sum + (file.storedBytes ?? 0), 0),
        },
      }
      const staging = join(this.dir, '.staging', id)
      await ensureDir(staging)
      await atomicWriteJson(join(staging, 'manifest.json'), manifest)
      const final = join(this.dir, id)
      await fsp.rename(staging, final)
      await appendJsonl(this.indexFile, {
        schemaVersion: 1,
        id,
        createdAt: manifest.createdAt,
        trigger: manifest.trigger.kind,
        files: files.length,
        storedBytes: manifest.totals.storedBytes,
        pinned: false,
      })
      this.manifests.set(id, manifest)
      if (!options.skipGc) await this.gc().catch(error => this.log('warn', 'checkpoint gc failed', error))
      return manifest
  }

  async ensureBaselineCheckpoint() {
    const existing = [...this.manifests.values()].some(manifest => manifest.baseline)
    if (existing) return null
    return await this.create({ kind: 'baseline' }, undefined, { snapshotCurrent: true })
  }

  async putBlob(buffer) {
    const hash = sha256Buffer(buffer)
    const relative = `blobs/${hash.slice(0, 2)}/${hash}.gz`
    const absolute = join(this.dir, ...relative.split('/'))
    const stat = await statSafe(absolute)
    if (stat && stat.isFile()) return { path: relative, storedBytes: stat.size }
    const compressed = gzipBuffer(buffer)
    await atomicWriteBuffer(absolute, compressed)
    const finalStat = await statSafe(absolute)
    return { path: relative, storedBytes: finalStat?.size ?? compressed.length }
  }

  async putDiff(text, path) {
    const name = sha256Buffer(Buffer.from(path)).slice(0, 16)
    const relative = `diffs/${name}.patch`
    await ensureDir(this.diffsDir)
    await atomicWriteBuffer(join(this.dir, ...relative.split('/')), Buffer.from(text, 'utf8'))
    return relative
  }

  async readBlob(relative) {
    const absolute = await resolveWithin(this.dir, relative)
    const buffer = await fsp.readFile(absolute)
    const content = gunzipBuffer(buffer)
    if (content.length > this.retention.maxFileBytes) {
      throw checkpointError('fishkeeper/checkpoint-corrupt', 'Checkpoint blob exceeds the configured file limit.')
    }
    return content
  }

  list() {
    return [...this.manifests.values()]
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
      .map(manifest => ({
        id: manifest.id,
        sourceId: manifest.sourceId,
        createdAt: manifest.createdAt,
        trigger: manifest.trigger?.kind ?? 'manual',
        baseline: Boolean(manifest.baseline),
        pinned: Boolean(manifest.pinned),
        files: manifest.files?.length ?? 0,
        storedBytes: manifest.totals?.storedBytes ?? 0,
        logicalBytes: manifest.totals?.logicalBytes ?? 0,
      }))
  }

  get(id) {
    return this.manifests.get(id)
  }

  async diff(id, path) {
    const manifest = this.manifests.get(id)
    if (!manifest) throw checkpointError('fishkeeper/checkpoint-not-found', `Checkpoint not found: ${id}`)
    const file = manifest.files?.find(entry => entry.path === path)
    if (!file) throw checkpointError('fishkeeper/checkpoint-not-found', `File not in checkpoint: ${path}`)
    if (!file.diff) return { path, patch: '', binary: true, added: 0, removed: 0 }
    const patch = await fsp.readFile(await resolveWithin(this.dir, file.diff), 'utf8')
    return { path, patch, binary: false, added: file.added ?? 0, removed: file.removed ?? 0 }
  }

  async preflightRestore(id, paths) {
    const manifest = this.manifests.get(id)
    if (!manifest) throw checkpointError('fishkeeper/checkpoint-not-found', `Checkpoint not found: ${id}`)
    const selected = paths?.length ? new Set(paths) : undefined
    const files = []
    const warnings = []
    for (const file of manifest.files ?? []) {
      if (selected && !selected.has(file.path)) continue
      if (!file.restorable || !file.before) {
        files.push({ path: file.path, role: file.role, action: 'skip', reason: 'not-restorable' })
        continue
      }
      const absolute = await resolveWithin(this.source.location, file.path)
      const stat = await statSafe(absolute)
      const currentSha256 = stat && stat.isFile() ? await sha256File(absolute) : undefined
      const stale = currentSha256 !== file.after?.sha256
      if (stale) warnings.push(`${file.path} changed after the checkpoint.`)
      files.push({
        path: file.path,
        role: file.role,
        action: 'restore',
        stale,
        currentSha256,
        expectedAfterSha256: file.after?.sha256,
        beforeSha256: file.before.sha256,
        bytes: file.before.bytes,
      })
    }
    return { checkpointId: id, sourceId: this.source.id, files, warnings }
  }

  async restore(id, paths, options = {}) {
    return await this.runExclusive(async () => {
      const plan = await this.preflightRestore(id, paths)
      const restoreFiles = plan.files.filter(file => file.action === 'restore')
      if (restoreFiles.length === 0) throw checkpointError('fishkeeper/restore-unsupported', 'This checkpoint has no restorable files.')
      const stale = restoreFiles.filter(file => file.stale)
      if (stale.length > 0 && !options.overrideStale) {
        throw checkpointError('fishkeeper/restore-stale', 'Files changed after the checkpoint; confirm overwrite to continue.', {
          files: stale.map(file => file.path),
        })
      }
      const manifest = this.manifests.get(id)
      const safety = await this.createUnlocked({ kind: 'pre-restore', path: restoreFiles[0].path }, restoreFiles.map(file => file.path), { snapshotCurrent: true, skipGc: true })
      const results = []
      const written = []
      try {
        for (const file of restoreFiles) {
          const entry = manifest.files.find(item => item.path === file.path)
          const content = await this.readBlob(entry.before.blob)
          const actual = sha256Buffer(content)
          if (actual !== entry.before.sha256) {
            throw checkpointError('fishkeeper/checkpoint-corrupt', `Blob checksum mismatch for ${file.path}`)
          }
          const absolute = await resolveWithin(this.source.location, file.path)
          await atomicWriteBuffer(absolute, content, entry.before.mode ?? 0o600)
          written.push(file.path)
          const afterWrite = await sha256File(absolute)
          const afterStat = await statSafe(absolute)
          this.setKnown(file.path, {
            hash: entry.before.sha256,
            content,
            size: content.length,
            mtimeMs: afterStat?.mtimeMs ?? Date.now(),
          })
          this.statCache.set(file.path, {
            size: content.length,
            mtimeMs: afterStat?.mtimeMs ?? Date.now(),
          })
          results.push({ path: file.path, ok: afterWrite === entry.before.sha256, sha256: afterWrite })
        }
      } catch (error) {
        if (safety) {
          await this.restoreFromManifest(safety, written).catch(() => {})
        }
        await this.audit({ action: 'restore', checkpointId: id, result: 'failed', error: error.message, files: restoreFiles.map(file => file.path) })
        throw error
      }
      await this.audit({
        action: 'restore',
        checkpointId: id,
        result: 'ok',
        safetyCheckpointId: safety?.id,
        files: results.map(result => result.path),
      })
      return {
        ok: results.every(result => result.ok),
        checkpointId: id,
        safetyCheckpointId: safety?.id,
        restored: results.filter(result => result.ok).length,
        files: results,
      }
    })
  }

  async restoreFromManifest(manifest, paths) {
    const selected = new Set(paths)
    for (const entry of manifest?.files ?? []) {
      if (!selected.has(entry.path) || !entry.before?.blob) continue
      const content = await this.readBlob(entry.before.blob)
      const absolute = await resolveWithin(this.source.location, entry.path)
      await atomicWriteBuffer(absolute, content, entry.before.mode ?? 0o600)
    }
  }

  async pin(id, pinned) {
    const manifest = this.manifests.get(id)
    if (!manifest) throw checkpointError('fishkeeper/checkpoint-not-found', `Checkpoint not found: ${id}`)
    manifest.pinned = Boolean(pinned)
    await atomicWriteJson(join(this.dir, id, 'manifest.json'), manifest)
    await this.audit({ action: pinned ? 'pin' : 'unpin', checkpointId: id })
    return { id, pinned: manifest.pinned }
  }

  async remove(id) {
    const manifest = this.manifests.get(id)
    if (!manifest) throw checkpointError('fishkeeper/checkpoint-not-found', `Checkpoint not found: ${id}`)
    await fsp.rm(join(this.dir, id), { recursive: true, force: true })
    this.manifests.delete(id)
    await this.audit({ action: 'delete-checkpoint', checkpointId: id })
    await this.gc().catch(() => {})
    return { id, deleted: true }
  }

  async audit(event) {
    try {
      await appendJsonl(this.auditFile, { schemaVersion: 1, at: nowIso(), sourceId: this.source.id, ...event })
    } catch (error) {
      this.log('warn', 'audit append failed', error)
    }
  }

  async gc() {
    const manifests = [...this.manifests.values()]
    const now = Date.now()
    const ageLimit = this.retention.maxAgeDays * 24 * 60 * 60 * 1000
    const pinned = manifests.filter(manifest => manifest.pinned)
    const candidates = manifests
      .filter(manifest => !manifest.pinned)
      .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))
    let remaining = [...pinned, ...candidates]
    const removeIds = new Set()
    for (const manifest of candidates) {
      const age = now - Date.parse(manifest.createdAt)
      if (age > ageLimit) removeIds.add(manifest.id)
    }
    let active = remaining.filter(manifest => !removeIds.has(manifest.id))
    let totalBytes = active.reduce((sum, manifest) => sum + (manifest.totals?.storedBytes ?? 0), 0)
    while (active.length > this.retention.maxCheckpointsPerSource) {
      const victim = active.find(manifest => !manifest.pinned)
      if (!victim) break
      removeIds.add(victim.id)
      active = active.filter(manifest => manifest.id !== victim.id)
    }
    for (const manifest of [...active].sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))) {
      if (totalBytes <= this.retention.maxBytesPerSource) break
      if (manifest.pinned) continue
      removeIds.add(manifest.id)
      totalBytes -= manifest.totals?.storedBytes ?? 0
    }
    for (const id of removeIds) {
      const manifest = this.manifests.get(id)
      if (!manifest || manifest.pinned) continue
      await fsp.rm(join(this.dir, id), { recursive: true, force: true })
      this.manifests.delete(id)
    }
    if (removeIds.size > 0) await this.sweepBlobs()
  }

  async sweepBlobs() {
    const referenced = new Set()
    for (const manifest of this.manifests.values()) {
      for (const file of manifest.files ?? []) {
        if (file.before?.blob) referenced.add(file.before.blob)
      }
    }
    const blobs = await listFilesRecursive(this.blobsDir)
    for (const relative of blobs) {
      if (!referenced.has(`blobs/${relative}`)) {
        await fsp.rm(join(this.dir, ...relative.split('/')), { force: true }).catch(() => {})
      }
    }
  }

  async startWatching() {
    if (this.closed) return
    const dirs = new Set()
    for (const file of this.description.files ?? []) {
      const parts = file.path.split('/')
      parts.pop()
      dirs.add(parts.length === 0 ? this.source.location : join(this.source.location, ...parts))
    }
    for (const dir of dirs) {
      try {
        const watcher = fsWatch(dir, { persistent: false }, (_event, filename) => {
          if (!filename) return
          const base = String(filename)
          const matched = (this.description.files ?? []).some(file => file.path.split('/').at(-1) === base)
          if (matched) this.schedule()
        })
        watcher.on('error', error => this.log('warn', 'file watcher failed', error))
        this.watchers.push(watcher)
      } catch (error) {
        this.log('warn', 'cannot watch source directory', error)
      }
    }
    this.reconcileTimer = setInterval(() => {
      void this.reconcile().catch(error => this.log('warn', 'reconcile failed', error))
    }, 15_000)
    if (typeof this.reconcileTimer.unref === 'function') this.reconcileTimer.unref()
  }

  schedule() {
    this.pendingPaths.add('*')
    if (this.debounce) clearTimeout(this.debounce)
    this.debounce = setTimeout(() => {
      this.debounce = undefined
      this.pendingPaths.clear()
      void this.create({ kind: 'auto' }).catch(error => this.log('warn', 'automatic checkpoint failed', error))
    }, 750)
  }

  async reconcile() {
    for (const file of this.description.files ?? []) {
      const absolute = join(this.source.location, ...file.path.split('/'))
      const stat = await statSafe(absolute)
      if (!stat || !stat.isFile()) continue
      const cached = this.statCache.get(file.path)
      if (!cached || cached.size !== stat.size || cached.mtimeMs !== stat.mtimeMs) {
        this.schedule()
        return
      }
    }
  }

  async dispose() {
    this.closed = true
    if (this.debounce) clearTimeout(this.debounce)
    if (this.reconcileTimer) clearInterval(this.reconcileTimer)
    for (const watcher of this.watchers) {
      try {
        watcher.close()
      } catch {
        // Already closed.
      }
    }
    this.watchers = []
    await this.queue.catch(() => {})
  }
}

function normalizeTrigger(trigger, files) {
  if (trigger && typeof trigger === 'object' && trigger.kind) {
    if (trigger.kind === 'auto') {
      const role = files.find(file => file.role === 'diary')?.role
        ?? files.find(file => file.role === 'persona')?.role
        ?? files.find(file => file.role === 'memory')?.role
        ?? 'manual'
      return { kind: role, path: trigger.path ?? files[0]?.path }
    }
    return { kind: trigger.kind, path: trigger.path ?? files[0]?.path }
  }
  const role = files.find(file => file.role === 'diary')?.role
    ?? files.find(file => file.role === 'persona')?.role
    ?? files.find(file => file.role === 'memory')?.role
    ?? 'manual'
  return { kind: role, path: files[0]?.path }
}

function checkpointError(code, message, details) {
  const error = new Error(message)
  error.code = code
  error.details = details
  return error
}

async function listFilesRecursive(root, prefix = '') {
  let entries
  try {
    entries = await fsp.readdir(join(root, prefix), { withFileTypes: true })
  } catch {
    return []
  }
  const result = []
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) result.push(...await listFilesRecursive(root, relative))
    else result.push(relative)
  }
  return result
}
