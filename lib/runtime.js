import { randomBytes } from 'node:crypto'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AuditService } from './audit.js'
import { CheckpointManager } from './checkpoints.js'
import { runDoctor } from './doctor.js'
import { maskText, scanText } from './rules.js'
import { acquireSourceLock } from './lock.js'
import { MigrationService } from './migrate.js'
import { createAdapter } from './sources.js'
import { defaultDataRoot, ensureDir, nowIso, withTimeout } from './util.js'

export class ConsoleRuntime {
  constructor(ctx, rawConfig) {
    this.ctx = ctx
    this.config = normalizeConfig(rawConfig)
    this.dataRoot = this.config.dataRoot
    this.sources = new Map()
    this.confirmTokens = new Map()
    this.started = false
    this.disposed = false
    this.startError = undefined
    this.ready = undefined
    this.readyResolve = undefined
    this.readyReject = undefined
    this.ready = new Promise((resolve, reject) => {
      this.readyResolve = resolve
      this.readyReject = reject
    })
  }

  log(level, ...args) {
    const logger = this.ctx.logger
    if (!logger) return
    const fn = typeof logger[level] === 'function' ? logger[level] : logger.info
    try {
      fn.call(logger, `[fishkeeper] ${args.map(value => value instanceof Error ? value.message : String(value)).join(' ')}`)
    } catch {
      // Logging must never break the console.
    }
  }

  async start() {
    try {
      await ensureDir(this.dataRoot)
      for (const source of this.config.sources) {
        if (source.enabled === false) continue
        if (source.rawId && source.rawId !== source.id) {
          this.log('warn', `source id "${source.rawId}" is unsafe; using "${source.id}" instead`)
        }
        const state = {
          config: source,
          adapter: undefined,
          description: undefined,
          checkpoints: undefined,
          lock: undefined,
          readOnly: false,
          error: undefined,
        }
        try {
          const adapter = await createAdapter(source, this.config, {
            credentials: this.ctx.get?.('credentials'),
          })
          const description = await adapter.describe()
          const manager = new CheckpointManager({
            dataRoot: this.dataRoot,
            source,
            describe: description,
            retention: this.config.retention,
            log: (level, ...args) => this.log(level, ...args),
          })
          await manager.init()
          const lock = await acquireSourceLock(this.dataRoot, source.id)
          state.adapter = adapter
          state.description = description
          state.checkpoints = manager
          state.lock = lock
          state.readOnly = !lock.acquired
          if (!state.readOnly) {
            await manager.baseline()
            await manager.ensureBaselineCheckpoint()
            await manager.startWatching()
          }
        } catch (error) {
          state.error = error
          this.log('warn', `source ${source.id} failed`, error)
        }
        this.sources.set(source.id, state)
      }
      this.auditService = new AuditService({ sources: this.sources, log: (...args) => this.log('warn', ...args) })
      this.migration = new MigrationService({
        dataRoot: this.dataRoot,
        sources: this.sources,
        log: (...args) => this.log('warn', ...args),
      })
      this.started = true
      this.readyResolve()
      this.log('info', `started with ${this.sources.size} source(s)`)
    } catch (error) {
      this.startError = error
      this.readyReject(error)
      this.log('error', 'startup failed', error)
    }
  }

  async whenReady() {
    if (this.startError) throw this.startError
    if (this.started) return
    await withTimeout(this.ready, 30_000, 'console startup')
  }

  mode() {
    if (!this.started) return 'starting'
    const states = [...this.sources.values()]
    if (states.length === 0) return 'writer'
    return states.every(state => state.readOnly) ? 'read-only' : 'writer'
  }

  sourceList() {
    return [...this.sources.values()].map(state => ({
      id: state.config.id,
      displayName: state.config.displayName,
      adapter: state.config.adapter,
      location: state.config.location,
      enabled: state.config.enabled !== false,
      preset: state.config.options?.preset,
      readOnly: state.readOnly,
      status: state.error ? 'error' : 'ok',
      error: state.error ? { code: state.error.code ?? 'fishkeeper/source-unreadable', message: state.error.message } : undefined,
      capabilities: state.description?.capabilities,
    }))
  }

  configuration() {
    return {
      dataRoot: this.dataRoot,
      sources: this.config.sources.map(source => ({
        id: source.id,
        displayName: source.displayName,
        adapter: source.adapter,
        location: source.rawLocation || source.location,
        enabled: source.enabled !== false,
        options: source.options ?? {},
      })),
    }
  }

  async saveSources(input) {
    const editor = this.ctx.get?.('configEditor')
    const entry = this.ctx.fiber?.entry
    if (!editor || typeof editor.edit !== 'function' || !entry) {
      throw runtimeError('fishkeeper/config-unavailable', 'Configuration editing is unavailable in this host; edit cordis.patch.yml instead.')
    }
    const sources = validateSources(input?.sources)
    await editor.edit(entry, current => ({ ...(current ?? {}), sources }))
    return { ok: true, sources: sources.map(source => ({ ...source })), reloading: true }
  }

  async overview() {
    const cards = []
    for (const state of this.sources.values()) {
      const base = {
        id: state.config.id,
        displayName: state.config.displayName,
        adapter: state.config.adapter,
        readOnly: state.readOnly,
        preset: state.description?.preset,
        capabilities: state.description?.capabilities,
        warnings: state.description?.warnings,
      }
      if (state.error) {
        cards.push({
          ...base,
          status: 'error',
          error: { code: state.error.code ?? 'fishkeeper/source-unreadable', message: state.error.message },
        })
        continue
      }
      try {
        const fish = await withTimeout(state.adapter.readStatus(), 3000, 'source status')
        cards.push({ ...base, status: 'ok', fish: maskStatus(fish) })
      } catch (error) {
        cards.push({
          ...base,
          status: 'error',
          error: { code: error.code ?? 'fishkeeper/source-timeout', message: error.message },
        })
      }
    }
    return { generatedAt: nowIso(), mode: this.mode(), sources: cards }
  }

  async timeline(query) {
    return await this.auditService.timeline(query)
  }

  async entry(query) {
    return await this.auditService.entry(query)
  }

  checkpoints(sourceId) {
    const state = this.sources.get(sourceId)
    if (!state) throw runtimeError('fishkeeper/source-not-found', 'Source not found.')
    if (!state.checkpoints) throw runtimeError('fishkeeper/checkpoints-unsupported', 'This source does not support checkpoints.')
    return {
      sourceId,
      readOnly: state.readOnly,
      restoreSupported: Boolean(state.description?.capabilities?.restore),
      items: state.checkpoints.list(),
    }
  }

  async createCheckpoint(sourceId) {
    const state = this.sources.get(sourceId)
    if (!state) throw runtimeError('fishkeeper/source-not-found', 'Source not found.')
    if (!state.checkpoints) throw runtimeError('fishkeeper/checkpoints-unsupported', 'This source does not support checkpoints.')
    if (state.readOnly) throw runtimeError('fishkeeper/lock-held', 'This source is read-only.')
    const manifest = await state.checkpoints.create({ kind: 'manual' }, undefined, { snapshotCurrent: true })
    if (!manifest) throw runtimeError('fishkeeper/checkpoint-empty', 'Nothing to snapshot.')
    return { checkpoint: summaryOf(manifest) }
  }

  findCheckpoint(id) {
    for (const state of this.sources.values()) {
      const manifest = state.checkpoints?.get(id)
      if (manifest) return { state, manifest }
    }
    return undefined
  }

  checkpointDetail(id) {
    const found = this.findCheckpoint(id)
    if (!found) throw runtimeError('fishkeeper/checkpoint-not-found', 'Checkpoint not found.')
    return { sourceId: found.manifest.sourceId, manifest: found.manifest }
  }

  async checkpointDiff(id, path) {
    const found = this.findCheckpoint(id)
    if (!found) throw runtimeError('fishkeeper/checkpoint-not-found', 'Checkpoint not found.')
    return await found.state.checkpoints.diff(id, path)
  }

  async restoreDryRun(id, paths) {
    const found = this.findCheckpoint(id)
    if (!found) throw runtimeError('fishkeeper/checkpoint-not-found', 'Checkpoint not found.')
    if (found.state.readOnly) throw runtimeError('fishkeeper/lock-held', 'This source is read-only.')
    if (!found.state.description?.capabilities?.restore) throw runtimeError('fishkeeper/restore-unsupported', 'This source does not support restore.')
    const plan = await found.state.checkpoints.preflightRestore(id, paths)
    const token = this.makeToken('restore', id)
    return { ...plan, confirmToken: token, sourceName: found.state.config.displayName }
  }

  async restoreExecute({ id, paths, confirmToken, overrideStale }) {
    const found = this.findCheckpoint(id)
    if (!found) throw runtimeError('fishkeeper/checkpoint-not-found', 'Checkpoint not found.')
    if (!this.consumeToken(confirmToken, 'restore', id)) throw runtimeError('fishkeeper/confirm-invalid', 'Confirmation expired or invalid; run the preflight again.')
    return await found.state.checkpoints.restore(id, paths, { overrideStale })
  }

  async pinCheckpoint(id, pinned) {
    const found = this.findCheckpoint(id)
    if (!found) throw runtimeError('fishkeeper/checkpoint-not-found', 'Checkpoint not found.')
    if (found.state.readOnly) throw runtimeError('fishkeeper/lock-held', 'This source is read-only.')
    return await found.state.checkpoints.pin(id, pinned)
  }

  async deleteCheckpoint(id) {
    const found = this.findCheckpoint(id)
    if (!found) throw runtimeError('fishkeeper/checkpoint-not-found', 'Checkpoint not found.')
    if (found.state.readOnly) throw runtimeError('fishkeeper/lock-held', 'This source is read-only.')
    return await found.state.checkpoints.remove(id)
  }

  async doctor() {
    return await runDoctor({ ctx: this.ctx, dataRoot: this.dataRoot, sources: this.sources, mode: this.mode() })
  }

  async exportPackage(request) {
    return await this.migration.exportPackage(request)
  }

  async preflightImport(request) {
    const options = typeof request === 'string' ? { path: request } : (request ?? {})
    const mode = options.mode === 'write' ? 'write' : 'reference'
    const targetSourceId = typeof options.targetSourceId === 'string' ? options.targetSourceId : undefined
    const result = await this.migration.preflight(options.path, { mode, targetSourceId })
    if (mode === 'write') {
      if (result.verdict === 'ok' && targetSourceId) {
        result.confirmToken = this.makeToken('import', targetSourceId)
      }
      result.targetSourceId = targetSourceId
    }
    return result
  }

  async importPackage(request) {
    const options = typeof request === 'string' ? { path: request, mode: 'reference' } : (request ?? {})
    const mode = options.mode === 'write' ? 'write' : 'reference'
    if (mode === 'write') {
      const targetSourceId = typeof options.targetSourceId === 'string' ? options.targetSourceId : undefined
      if (!this.consumeToken(options.confirmToken, 'import', targetSourceId)) {
        throw runtimeError('fishkeeper/confirm-invalid', 'Confirmation expired or invalid; run the preflight again.')
      }
      const state = targetSourceId ? this.sources.get(targetSourceId) : undefined
      if (state?.readOnly) throw runtimeError('fishkeeper/lock-held', 'This source is read-only.')
    }
    return await this.migration.importPackage({ ...options, mode })
  }

  makeToken(action, target) {
    const value = randomBytes(18).toString('base64url')
    this.confirmTokens.set(value, { action, target, expiresAt: Date.now() + 5 * 60 * 1000 })
    return value
  }

  consumeToken(value, action, target) {
    if (typeof value !== 'string') return false
    const token = this.confirmTokens.get(value)
    if (!token) return false
    this.confirmTokens.delete(value)
    return token.action === action && token.target === target && token.expiresAt > Date.now()
  }

  async dispose() {
    if (this.disposed) return
    this.disposed = true
    for (const state of this.sources.values()) {
      await state.checkpoints?.dispose().catch(() => {})
      await state.lock?.release?.().catch(() => {})
    }
    this.confirmTokens.clear()
  }
}

function normalizeConfig(raw) {
  const config = raw && typeof raw === 'object' ? raw : {}
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const sources = Array.isArray(config.sources)
    ? config.sources
      .filter(source => source && typeof source === 'object')
      .map((source, index) => {
        const adapter = typeof source.adapter === 'string' && source.adapter ? source.adapter : 'file'
        const rawLocation = typeof source.location === 'string' ? source.location : ''
        const location = adapter !== 'http' && rawLocation && !isAbsolute(rawLocation)
          ? resolve(packageRoot, rawLocation)
          : rawLocation
        const rawId = typeof source.id === 'string' ? source.id.trim() : ''
        const id = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u.test(rawId) ? rawId : `src_${index + 1}`
        return {
          id,
          rawId,
          displayName: typeof source.displayName === 'string' && source.displayName ? source.displayName : `Fish ${index + 1}`,
          adapter,
          location,
          rawLocation,
          enabled: source.enabled !== false,
          options: source.options && typeof source.options === 'object' ? source.options : {},
        }
      })
    : []
  const rawRoot = typeof config.dataRoot === 'string' ? config.dataRoot.trim() : ''
  return {
    dataRoot: rawRoot
      ? (isAbsolute(rawRoot) ? rawRoot : resolve(packageRoot, rawRoot))
      : defaultDataRoot(),
    sources,
    retention: {
      maxCheckpointsPerSource: Number(config.retention?.maxCheckpointsPerSource) || 200,
      maxAgeDays: Number(config.retention?.maxAgeDays) || 90,
      maxBytesPerSource: Number(config.retention?.maxBytesPerSource) || 512 * 1024 * 1024,
      maxFileBytes: Number(config.retention?.maxFileBytes) || 8 * 1024 * 1024,
    },
  }
}

function validateSources(input) {
  if (!Array.isArray(input)) {
    throw runtimeError('fishkeeper/config-invalid', 'sources must be an array.', { field: 'sources' })
  }
  const ids = new Set()
  return input.map((source, index) => {
    const field = `sources.${index}`
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      throw runtimeError('fishkeeper/config-invalid', `${field} must be an object.`, { field })
    }
    const id = typeof source.id === 'string' ? source.id.trim() : ''
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u.test(id)) {
      throw runtimeError('fishkeeper/config-invalid', `${field}.id must start with a letter or digit, then 0-63 letters, digits, dots, underscores or dashes.`, { field: `${field}.id` })
    }
    if (ids.has(id)) throw runtimeError('fishkeeper/config-invalid', `Duplicate source id: ${id}.`, { field: `${field}.id` })
    ids.add(id)
    const displayName = typeof source.displayName === 'string' ? source.displayName.trim() : ''
    if (displayName === '') throw runtimeError('fishkeeper/config-invalid', `${field}.displayName is required.`, { field: `${field}.displayName` })
    if (displayName.length > 120) throw runtimeError('fishkeeper/config-invalid', `${field}.displayName is too long.`, { field: `${field}.displayName` })
    const adapter = source.adapter
    if (adapter !== 'file' && adapter !== 'http') {
      throw runtimeError('fishkeeper/config-invalid', `${field}.adapter must be "file" or "http".`, { field: `${field}.adapter` })
    }
    const location = typeof source.location === 'string' ? source.location.trim() : ''
    if (location === '') throw runtimeError('fishkeeper/config-invalid', `${field}.location is required.`, { field: `${field}.location` })
    if (location.length > 2048) throw runtimeError('fishkeeper/config-invalid', `${field}.location is too long.`, { field: `${field}.location` })
    const options = source.options === undefined ? {} : source.options
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
      throw runtimeError('fishkeeper/config-invalid', `${field}.options must be an object.`, { field: `${field}.options` })
    }
    return { id, displayName, adapter, location, enabled: source.enabled !== false, options }
  })
}

function maskStatus(fish) {
  if (!fish || typeof fish !== 'object') return fish
  const maskTextValue = value => {
    if (!value || typeof value.text !== 'string') return value
    const scan = scanText(value.text)
    return { ...value, text: maskText(value.text, scan.hits) }
  }
  return {
    ...fish,
    latestDiary: maskTextValue(fish.latestDiary),
    latestWhisper: maskTextValue(fish.latestWhisper),
  }
}

function summaryOf(manifest) {
  return {
    id: manifest.id,
    sourceId: manifest.sourceId,
    createdAt: manifest.createdAt,
    trigger: manifest.trigger?.kind ?? 'manual',
    baseline: Boolean(manifest.baseline),
    pinned: Boolean(manifest.pinned),
    files: manifest.files?.length ?? 0,
    storedBytes: manifest.totals?.storedBytes ?? 0,
  }
}

function runtimeError(code, message, details) {
  const error = new Error(message)
  error.code = code
  error.details = details
  return error
}
