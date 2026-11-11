import { constants as fsConstants, promises as fsp } from 'node:fs'
import { dirname, join } from 'node:path'
import { appendJsonl, atomicWriteBuffer, ensureDir, newId, nowIso, readFileBounded, readJsonSafe, resolveWithin, sha256Buffer, statSafe } from './util.js'
import { scanText } from './rules.js'
import { readZip, writeZip } from './zip.js'

const MAX_PACKAGE_BYTES = 256 * 1024 * 1024
const VERSION = '0.1.0'

export class MigrationService {
  constructor({ dataRoot, sources, log }) {
    this.dataRoot = dataRoot
    this.sources = sources
    this.log = log ?? (() => {})
    this.auditFile = join(dataRoot, 'audit', 'console.actions.jsonl')
  }

  async exportPackage({ sourceId, mode = 'full', includeCheckpoints = false }) {
    const state = this.sources.get(sourceId)
    if (!state || !state.adapter || !state.description) throw migrationError('fishkeeper/source-not-found', 'Source not found.')
    const description = state.description
    const packageId = newId('pkg')
    const entries = []
    const contents = []
    const full = mode !== 'share'
    const fishStatus = await state.adapter.readStatus().catch(() => undefined)
    const identityHash = description.identityHash ?? sha256Buffer(Buffer.from(`${sourceId}\0${description.displayName}`))
    const plugin = state.config?.options?.plugin ?? (description.preset === 'fishtank' ? 'dsh-fishtank' : undefined)
    const pathConventions = {
      root: 'payload',
      status: (description.files ?? []).find(file => file.role === 'status')?.path,
      diary: (description.files ?? []).filter(file => file.role === 'diary').map(file => file.path),
      events: (description.files ?? []).find(file => file.role === 'memory')?.path,
    }
    const manifest = {
      schemaVersion: 1,
      packageId,
      exportedAt: nowIso(),
      exporter: { name: 'dsh-fishkeeper', version: VERSION },
      source: {
        adapter: description.adapter,
        plugin,
        pluginVersion: state.config?.options?.pluginVersion,
        dshVersion: process.env.DSH_VERSION,
        profile: process.env.DSH_PROFILE_NAME,
        pathConventions,
      },
      fish: {
        id: sourceId,
        displayName: description.displayName,
        identityHash,
      },
      privacy: {
        mode: full ? 'full' : 'share',
        includesCredentials: false,
        redactions: full ? [] : ['diary.text', 'memory.text', 'checkpoint.blobs', 'channel.credentials'],
      },
      compatibility: {
        dsh: '>=0.0.0',
        requires: plugin
          ? [{ kind: 'plugin', name: plugin, range: '>=0.0.0' }]
          : [],
      },
      contents,
      checkpoints: { count: 0, ids: [] },
    }

    if (full) {
      for (const file of description.files ?? []) {
        const absolute = join(description.root, ...file.path.split('/'))
        const read = await readFileBounded(absolute, 64 * 1024 * 1024)
        if (read.truncated || !read.buffer) continue
        const name = `payload/${file.path}`
        entries.push({ name, data: read.buffer })
        contents.push({ path: name, kind: 'data', bytes: read.buffer.length, sha256: sha256Buffer(read.buffer), redacted: false, role: file.role })
      }
    } else {
      const [diary, external] = await Promise.all([
        state.adapter.readDiary ? state.adapter.readDiary().catch(() => ({ items: [] })) : { items: [] },
        state.adapter.readExternalEvents ? state.adapter.readExternalEvents().catch(() => ({ items: [] })) : { items: [] },
      ])
      const timeline = [...(diary.items ?? []), ...(external.items ?? [])]
        .sort((left, right) => String(right.occurredAt).localeCompare(String(left.occurredAt)))
        .slice(0, 5000)
        .map(entry => {
          const scan = scanText(entry.text)
          return {
            at: entry.occurredAt,
            kind: entry.kind,
            channel: entry.channel,
            visibility: entry.visibility,
            length: entry.text.length,
            riskRuleIds: [...new Set(scan.hits.map(hit => hit.ruleId))],
          }
        })
      const summary = {
        fish: { id: sourceId, displayName: description.displayName },
        status: fishStatus
          ? {
              lastActiveAt: fishStatus.lastActiveAt,
              mood: fishStatus.mood,
              energy: fishStatus.energy,
              channels: (fishStatus.channels ?? []).map(channel => ({ channel: channel.channel, state: channel.state })),
            }
          : undefined,
        timeline,
      }
      const data = Buffer.from(`${JSON.stringify(summary, null, 2)}\n`, 'utf8')
      entries.push({ name: 'payload/summary.json', data })
      contents.push({ path: 'payload/summary.json', kind: 'data', bytes: data.length, sha256: sha256Buffer(data), redacted: true, role: 'summary' })
    }

    if (full && includeCheckpoints && state.checkpoints) {
      const checkpointDir = join(this.dataRoot, 'checkpoints', sourceId)
      const checkpointIds = state.checkpoints.list().map(item => item.id)
      const files = await listFilesRecursive(checkpointDir)
      for (const relative of files) {
        if (relative.startsWith('.staging/') || relative.includes('/.staging/')) continue
        const absolute = join(checkpointDir, ...relative.split('/'))
        const read = await readFileBounded(absolute, 64 * 1024 * 1024)
        if (read.truncated || !read.buffer) continue
        const name = `checkpoints/${relative}`
        entries.push({ name, data: read.buffer })
        contents.push({ path: name, kind: 'checkpoint', bytes: read.buffer.length, sha256: sha256Buffer(read.buffer), redacted: false })
      }
      manifest.checkpoints = { count: checkpointIds.length, ids: checkpointIds }
    }

    const readme = buildReadme(manifest, contents)
    const readmeBuffer = Buffer.from(readme, 'utf8')
    entries.push({ name: 'README.md', data: readmeBuffer })
    entries.push({ name: 'manifest.json', data: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8') })
    const checksumLines = entries
      .filter(entry => entry.name !== 'checksums.sha256')
      .map(entry => `${sha256Buffer(entry.data)}  ${entry.name}`)
      .join('\n')
    entries.push({ name: 'checksums.sha256', data: Buffer.from(`${checksumLines}\n`, 'utf8') })

    const buffer = writeZip(entries)
    const packagePath = join(this.dataRoot, 'exports', `${packageId}.fishkeeper`)
    await ensureDir(dirname(packagePath))
    await atomicWriteBuffer(packagePath, buffer)
    await this.audit({ action: 'export', sourceId, packageId, mode, bytes: buffer.length, path: packagePath })
    return {
      packageId,
      path: packagePath,
      bytes: buffer.length,
      sha256: sha256Buffer(buffer),
      contents: contents.length,
      checkpoints: manifest.checkpoints.count,
      mode: manifest.privacy.mode,
    }
  }

  async preflight(packagePath, options = {}) {
    const mode = options.mode === 'write' ? 'write' : 'reference'
    const targetSourceId = typeof options.targetSourceId === 'string' ? options.targetSourceId : undefined
    const result = {
      verdict: 'ok',
      mode,
      packageId: undefined,
      findings: [],
      plan: undefined,
      manifest: undefined,
    }
    const add = (code, severity, message, remediation) => {
      result.findings.push({ code, severity, message, remediation })
      if (severity === 'blocker') result.verdict = verdictFor(code)
    }
    let buffer
    try {
      const stat = await statSafe(packagePath)
      if (!stat || !stat.isFile()) {
        add('package-missing', 'blocker', `Package not found: ${packagePath}`, 'Check the path.')
        return result
      }
      if (stat.size > MAX_PACKAGE_BYTES) {
        add('package-too-large', 'blocker', 'Package exceeds the size limit.', 'Export a smaller package.')
        return result
      }
      buffer = await fsp.readFile(packagePath)
    } catch (error) {
      add('package-unreadable', 'blocker', error.message, undefined)
      return result
    }
    let entries
    try {
      entries = readZip(buffer)
    } catch (error) {
      add(error.code ?? 'zip-invalid', 'blocker', error.message, 'Re-export the package.')
      return result
    }
    const byName = new Map(entries.map(entry => [entry.name, entry]))
    const manifestEntry = byName.get('manifest.json')
    if (!manifestEntry) {
      add('manifest-missing', 'blocker', 'manifest.json is missing.', undefined)
      return result
    }
    let manifest
    try {
      manifest = JSON.parse(manifestEntry.data.toString('utf8'))
    } catch {
      add('manifest-invalid', 'blocker', 'manifest.json is not valid JSON.', undefined)
      return result
    }
    result.manifest = manifest
    result.packageId = manifest.packageId
    if (!isSafePackageId(manifest.packageId)) {
      add('package-id-unsafe', 'blocker', 'Package id is missing or contains unsafe characters.', 'Re-export the package.')
      result.packageId = undefined
    }
    if (manifest.schemaVersion !== 1) {
      add('schema-incompatible', 'blocker', `Unsupported package schema ${manifest.schemaVersion}.`, 'Upgrade the console.')
    }
    if (manifest.privacy?.includesCredentials === true) {
      add('credentials-included', 'blocker', 'The package includes credentials, which this build refuses.', undefined)
    }
    const checksums = byName.get('checksums.sha256')
    if (!checksums) {
      add('checksums-missing', 'blocker', 'checksums.sha256 is missing.', undefined)
    } else {
      for (const line of checksums.data.toString('utf8').split(/\r?\n/u)) {
        const match = /^([0-9a-f]{64})\s{2}(.+)$/u.exec(line.trim())
        if (!match) continue
        const [, expected, name] = match
        const entry = byName.get(name)
        if (!entry) {
          add('checksum-missing-entry', 'blocker', `Checksum named a missing entry: ${name}`, undefined)
          continue
        }
        if (sha256Buffer(entry.data) !== expected) {
          add('checksum-mismatch', 'blocker', `Checksum mismatch: ${name}`, undefined)
        }
      }
    }
    if (Array.isArray(manifest.compatibility?.requires)) {
      const profile = await this.readProfile()
      for (const requirement of manifest.compatibility.requires) {
        if (requirement.kind !== 'plugin') continue
        const found = profile?.dependencies?.[requirement.name] || profile?.bundles?.includes(requirement.name)
        if (!found) {
          if (mode === 'write') {
            add('target-profile-missing-plugin', 'warning', `Plugin ${requirement.name} is not installed in this profile; write-back targets its data directory directly.`, 'Reload the plugin in the target profile after writing.')
          } else {
            add('missing-dependency', 'blocker', `Missing plugin: ${requirement.name}`, `Install ${requirement.name} in this profile.`)
          }
        }
      }
    }
    if (manifest.compatibility?.dsh && process.env.DSH_VERSION && !satisfies(process.env.DSH_VERSION, manifest.compatibility.dsh)) {
      add('dsh-incompatible', 'blocker', `Package requires DSH ${manifest.compatibility.dsh}.`, 'Upgrade or downgrade the console/DSH.')
    }
    if (result.verdict === 'ok' && result.findings.some(finding => finding.severity === 'warning')) {
      result.verdict = 'ok'
    }
    if (result.verdict === 'ok') {
      const total = (manifest.contents ?? []).reduce((sum, item) => sum + (item.bytes ?? 0), 0)
      result.plan = { packageId: manifest.packageId, files: manifest.contents?.length ?? 0, bytes: total, checkpoints: manifest.checkpoints?.count ?? 0 }
      if (mode === 'write') {
        result.plan.target = await this.targetPlan(manifest, byName, targetSourceId, add)
        if (!result.plan.target) delete result.plan.target
      }
    }
    return result
  }

  async targetPlan(manifest, byName, targetSourceId, add) {
    const state = targetSourceId ? this.sources.get(targetSourceId) : undefined
    if (!targetSourceId || !state) {
      add('target-not-found', 'blocker', 'Choose a target data source for write-back.', 'Select an existing file source.')
      return undefined
    }
    const description = state.description
    if (!description || !state.adapter) {
      add('target-unavailable', 'blocker', 'The target source is not available.', 'Fix the source error first.')
      return undefined
    }
    if (description.adapter !== 'file') {
      add('target-unsupported', 'blocker', 'Write-back requires a file data source.', 'Use a file source as the target.')
      return undefined
    }
    if (!description.capabilities?.import) {
      add('target-import-unsupported', 'blocker', 'This source does not support write-back.', 'Set options.preset to fishtank or options.allowImport: true.')
      return undefined
    }
    if (description.preset === 'fishtank' && manifest.source?.plugin !== 'dsh-fishtank') {
      add('target-plugin-mismatch', 'blocker', 'This package was not exported from dsh-fishtank.', 'Import into a matching fishtank source.')
      return undefined
    }
    if (state.readOnly) {
      add('target-locked', 'blocker', 'The target source is read-only because another console holds its lock.', 'Close the other console instance.')
      return undefined
    }
    try {
      await fsp.access(description.root, fsConstants.W_OK)
    } catch {
      add('target-unwritable', 'blocker', `The target directory is not writable: ${description.root}`, 'Fix directory permissions.')
      return undefined
    }
    const files = []
    const payload = (manifest.contents ?? []).filter(item => (
      item.kind === 'data'
      && item.role !== 'summary'
      && typeof item.path === 'string'
      && item.path.startsWith('payload/')
    ))
    for (const item of payload) {
      const relative = item.path.slice('payload/'.length)
      const targetFile = (description.files ?? []).find(file => file.path === relative)
      if (!targetFile || (!targetFile.restorable && targetFile.role !== 'status')) {
        add('target-path-skipped', 'warning', `Skipping non-writable target file: ${relative}`, 'Write-back only writes files the target declares restorable.')
        continue
      }
      let destination
      try {
        destination = await resolveWithin(description.root, relative)
      } catch {
        add('target-path-unsafe', 'blocker', `Package entry escapes the target directory: ${item.path}`, 'Re-export the package.')
        continue
      }
      const stat = await statSafe(destination)
      if (stat && !stat.isFile()) {
        add('target-path-conflict', 'blocker', `Target path is not a file: ${relative}`, 'Move the conflicting directory away.')
        continue
      }
      files.push({
        from: item.path,
        to: relative,
        bytes: item.bytes ?? 0,
        exists: Boolean(stat),
        sha256: item.sha256,
      })
    }
    if (files.length === 0) {
      add('target-empty-payload', 'blocker', 'The package contains no data files to write.', 'Use a full-mode package.')
      return undefined
    }
    const statusPath = (description.files ?? []).find(file => file.role === 'status')?.path
    const statusFile = files.find(file => file.to === statusPath)
    let identity = 'unknown'
    if (statusFile) {
      const entry = byName.get(statusFile.from)
      if (entry) {
        try {
          const data = JSON.parse(entry.data.toString('utf8'))
          if (data && (typeof data.createdAt === 'number' || typeof data.createdAt === 'string')) {
            const hash = sha256Buffer(Buffer.from(`fishtank\0${data.createdAt}`))
            identity = description.identityHash ? (hash === description.identityHash ? 'match' : 'mismatch') : 'unknown'
          }
        } catch {
          identity = 'unknown'
        }
      }
    }
    if (identity === 'mismatch' && state.config?.options?.allowIdentityMismatch !== true) {
      add('target-identity-mismatch', 'blocker', 'The package belongs to a different fish.', 'Import only into the same fish, or set options.allowIdentityMismatch.')
      return undefined
    }
    return {
      sourceId: state.config.id,
      displayName: state.config.displayName,
      root: description.root,
      files,
      overwrite: files.some(file => file.exists),
      identity,
    }
  }

  async importPackage(request) {
    const options = typeof request === 'string' ? { path: request } : (request ?? {})
    const packagePath = options.path
    const mode = options.mode === 'write' ? 'write' : 'reference'
    const targetSourceId = typeof options.targetSourceId === 'string' ? options.targetSourceId : undefined
    const preflight = await this.preflight(packagePath, { mode, targetSourceId })
    if (preflight.verdict !== 'ok') {
      throw migrationError('fishkeeper/import-incompatible', 'Package did not pass preflight.', preflight)
    }
    const buffer = await fsp.readFile(packagePath)
    const entries = readZip(buffer)
    const packageId = preflight.manifest.packageId
    if (!isSafePackageId(packageId)) {
      throw migrationError('fishkeeper/import-unsafe', 'Package id is missing or unsafe.')
    }
    if (mode === 'write') {
      return await this.writeBack({ packagePath, buffer, entries, preflight, packageId, targetSourceId, overwrite: options.overwrite === true })
    }
    const target = join(this.dataRoot, 'imports', packageId)
    const staging = join(this.dataRoot, 'imports', `.staging-${packageId}`)
    await fsp.rm(staging, { recursive: true, force: true })
    await ensureDir(staging)
    let files = 0
    for (const entry of entries) {
      if (entry.name === 'checksums.sha256') continue
      const parts = entry.name.split('/')
      if (parts.some(part => part === '..' || part === '')) continue
      const path = join(staging, ...parts)
      await ensureDir(dirname(path))
      await atomicWriteBuffer(path, entry.data)
      files += 1
    }
    await fsp.rm(target, { recursive: true, force: true })
    await ensureDir(dirname(target))
    await fsp.rename(staging, target)
    await this.audit({ action: 'import', mode: 'reference', packageId, path: packagePath, target, files })
    return { ok: true, mode: 'reference', packageId, importedPath: target, files, identity: 'match' }
  }

  async writeBack({ packagePath, buffer, entries, preflight, packageId, targetSourceId, overwrite }) {
    const state = this.sources.get(targetSourceId)
    const plan = preflight.plan?.target
    if (!state || !plan) throw migrationError('fishkeeper/import-incompatible', 'Write-back target is unavailable.', preflight)
    if (state.readOnly) throw migrationError('fishkeeper/lock-held', 'The target source is read-only.')
    if (plan.overwrite && !overwrite) {
      throw migrationError('fishkeeper/import-overwrite-required', 'The target already holds data; confirm overwrite first.', { target: plan })
    }
    const byName = new Map(entries.map(entry => [entry.name, entry]))
    const missing = plan.files.filter(file => !byName.has(file.from))
    if (missing.length > 0) {
      throw migrationError('fishkeeper/import-incomplete', 'Package data is incomplete.', { missing: missing.map(file => file.from) })
    }
    const stamp = nowIso().replace(/[:.]/gu, '-')
    const backupRoot = join(this.dataRoot, 'imports', `.backup-${packageId}-${stamp}`)
    const backups = []
    for (const file of plan.files) {
      if (!file.exists) continue
      const destination = await resolveWithin(plan.root, file.to)
      const backup = join(backupRoot, ...file.to.split('/'))
      await ensureDir(dirname(backup))
      await fsp.copyFile(destination, backup)
      backups.push({ relative: file.to, backup })
    }
    let safety
    try {
      safety = await state.checkpoints?.create({ kind: 'pre-import' }, undefined, { snapshotCurrent: true })
    } catch (error) {
      this.log('warn', 'pre-import checkpoint failed', error)
    }
    const written = []
    try {
      for (const file of plan.files) {
        const destination = await resolveWithin(plan.root, file.to)
        await ensureDir(dirname(destination))
        const existing = await statSafe(destination)
        await atomicWriteBuffer(destination, byName.get(file.from).data, (existing?.mode & 0o777) || 0o600)
        written.push({ relative: file.to, bytes: file.bytes })
      }
    } catch (error) {
      await this.rollbackWriteBack(plan, backups, written)
      throw migrationError('fishkeeper/import-write-failed', `Write-back failed and was rolled back: ${error.message}`, { target: plan.root })
    }
    await state.checkpoints?.baseline().catch(error => this.log('warn', 'refreshing checkpoint tracking after write-back failed', error))
    await this.audit({
      action: 'import',
      mode: 'write',
      packageId,
      path: packagePath,
      target: plan.root,
      targetSourceId,
      files: written.length,
      backupPath: backups.length > 0 ? backupRoot : undefined,
      identity: plan.identity,
      safetyCheckpointId: safety?.id,
    })
    return {
      ok: true,
      mode: 'write',
      packageId,
      importedPath: plan.root,
      files: written.length,
      bytes: buffer.length,
      backupPath: backups.length > 0 ? backupRoot : undefined,
      identity: plan.identity,
      safetyCheckpointId: safety?.id,
      reloadRequired: true,
    }
  }

  async rollbackWriteBack(plan, backups, written) {
    const backupByRelative = new Map(backups.map(item => [item.relative, item.backup]))
    for (const file of written) {
      const destination = await resolveWithin(plan.root, file.relative).catch(() => undefined)
      if (!destination) continue
      const backup = backupByRelative.get(file.relative)
      try {
        if (backup) await fsp.copyFile(backup, destination)
        else await fsp.rm(destination, { force: true })
      } catch (error) {
        this.log('error', `rollback failed for ${file.relative}`, error)
      }
    }
  }

  async readProfile() {
    const dir = process.env.DSH_PROFILE_DIR
    if (!dir) return undefined
    const pkg = await readJsonSafe(join(dir, 'package.json'))
    if (!pkg) return undefined
    const bundles = pkg.dsh?.profile?.bundles ?? pkg.dsh?.bundles ?? pkg.profile?.bundles ?? []
    return {
      dependencies: pkg.dependencies ?? {},
      bundles: Array.isArray(bundles) ? bundles : [],
    }
  }

  async audit(event) {
    try {
      await appendJsonl(this.auditFile, { schemaVersion: 1, at: nowIso(), ...event })
    } catch (error) {
      this.log('warn', 'migration audit failed', error)
    }
  }
}

function buildReadme(manifest, contents) {
  const lines = [
    `# Fish Keeper package ${manifest.packageId}`,
    '',
    `- Exported: ${manifest.exportedAt}`,
    `- Fish: ${manifest.fish.displayName} (${manifest.fish.id})`,
    `- Mode: ${manifest.privacy.mode}`,
    `- Adapter: ${manifest.source.adapter}`,
    `- DSH: ${manifest.source.dshVersion ?? 'unknown'}`,
    `- Plugin: ${manifest.source.plugin ?? 'unknown'}`,
    '',
    '## Contents',
    '',
    ...contents.map(item => `- ${item.path} (${item.bytes} bytes, ${item.kind}${item.redacted ? ', redacted' : ''})`),
    '',
    'Share-mode packages omit diary text, memory text, credentials, and checkpoint blobs.',
    'Reference import extracts into the console data root only. Write-back must be selected explicitly and is confirmed with a preflight token.',
    '',
  ]
  return lines.join('\n')
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

function satisfies(version, range) {
  const target = parseVersion(version)
  if (!target) return true
  const match = /^(>=|<=|>|<|=)?\s*(\d+)\.(\d+)\.(\d+)/u.exec(String(range))
  if (!match) return true
  const [, operator = '=', major, minor, patch] = match
  const compare = compareVersions(target, [Number(major), Number(minor), Number(patch)])
  if (operator === '>=') return compare >= 0
  if (operator === '<=') return compare <= 0
  if (operator === '>') return compare > 0
  if (operator === '<') return compare < 0
  return compare === 0
}

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)/u.exec(String(value))
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index]
  }
  return 0
}

function verdictFor(code) {
  if (String(code).startsWith('target-')) return 'blocked'
  if (code === 'missing-dependency') return 'missing-dependencies'
  if (code === 'dsh-incompatible' || code === 'schema-incompatible') return 'incompatible'
  if (code === 'credentials-included' || code?.includes('unsafe')) return 'unsafe'
  return 'corrupt'
}

function migrationError(code, message, details) {
  const error = new Error(message)
  error.code = code
  error.details = details
  return error
}

function isSafePackageId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/u.test(value)
}
