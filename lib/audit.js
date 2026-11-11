import { DEFAULT_RULES, maskText, scanText } from './rules.js'

const SEVERITY_ORDER = { high: 3, medium: 2, low: 1 }
const MAX_PAGE = 200

export class AuditService {
  constructor({ sources, log }) {
    this.sources = sources
    this.log = log ?? (() => {})
  }

  async timeline(query = {}) {
    const sourceIds = query.source ? [query.source] : [...this.sources.keys()]
    const collected = []
    let truncated = false
    const errors = []
    await Promise.all(sourceIds.map(async sourceId => {
      const state = this.sources.get(sourceId)
      if (!state || !state.adapter) {
        errors.push({ sourceId, code: 'fishkeeper/source-not-found' })
        return
      }
      try {
        const [diary, external] = await Promise.all([
          state.adapter.readDiary ? state.adapter.readDiary() : { items: [] },
          state.adapter.readExternalEvents ? state.adapter.readExternalEvents() : { items: [] },
        ])
        truncated ||= Boolean(diary.truncated || external.truncated)
        for (const entry of [...(diary.items ?? []), ...(external.items ?? [])]) {
          collected.push({ ...entry, sourceName: state.description.displayName })
        }
      } catch (error) {
        errors.push({ sourceId, code: error.code ?? 'fishkeeper/source-unreadable', message: error.message })
        this.log('warn', `timeline source failed: ${sourceId}`, error)
      }
    }))

    const scanned = collected.map(entry => this.withRisk(entry, false))
    const queryText = String(query.q ?? '').trim().toLowerCase()
    const riskFilter = String(query.risk ?? 'all')
    const filtered = scanned.filter(entry => {
      if (queryText && !entry.text.toLowerCase().includes(queryText)) return false
      if (riskFilter === 'any' && entry.hits.length === 0) return false
      if (riskFilter === 'high' && !entry.hits.some(hit => hit.severity === 'high')) return false
      if (riskFilter === 'medium' && !entry.hits.some(hit => hit.severity === 'medium' || hit.severity === 'high')) return false
      if (riskFilter === 'low' && entry.hits.length === 0) return false
      return true
    })
    filtered.sort(compareEntries)
    const limit = Math.min(MAX_PAGE, Math.max(1, Number(query.limit) || 50))
    const offset = query.cursor ? Number(Buffer.from(String(query.cursor), 'base64url').toString('utf8')) : 0
    const start = Number.isFinite(offset) && offset > 0 ? offset : 0
    const page = filtered.slice(start, start + limit).map(entry => this.toPublic(entry, false))
    const nextCursor = start + limit < filtered.length
      ? Buffer.from(String(start + limit), 'utf8').toString('base64url')
      : undefined
    return { items: page, nextCursor, truncated, errors, total: filtered.length }
  }

  async entry({ source, id, reveal }) {
    const state = this.sources.get(source)
    if (!state || !state.adapter) throw apiError('fishkeeper/source-not-found', 'Source not found.')
    if (!state.adapter.findEntry) throw apiError('fishkeeper/source-unreadable', 'This source cannot return a single entry.')
    const entry = await state.adapter.findEntry(id)
    if (!entry) throw apiError('fishkeeper/entry-not-found', 'Entry not found.')
    const scanned = this.withRisk({ ...entry, sourceName: state.description.displayName }, false)
    return this.toPublic(scanned, Boolean(reveal))
  }

  withRisk(entry, reveal) {
    const scan = scanText(entry.text, DEFAULT_RULES)
    return { ...entry, hits: scan.hits, scanTruncated: scan.truncated, reveal }
  }

  toPublic(entry, reveal) {
    const hits = (entry.hits ?? []).map(hit => ({
      ruleId: hit.ruleId,
      category: hit.category,
      severity: hit.severity,
      start: hit.start,
      end: hit.end,
      masked: hit.masked,
    }))
    const risk = hits.reduce((max, hit) => Math.max(max, SEVERITY_ORDER[hit.severity] ?? 0), 0)
    return {
      id: entry.id,
      sourceId: entry.sourceId,
      sourceName: entry.sourceName,
      occurredAt: entry.occurredAt,
      unknownTime: Boolean(entry.unknownTime),
      kind: entry.kind,
      channel: entry.channel,
      visibility: entry.visibility,
      url: entry.url,
      text: reveal ? entry.text : undefined,
      textMasked: reveal ? entry.text : maskText(entry.text, hits),
      hits,
      risk,
      scanTruncated: Boolean(entry.scanTruncated),
    }
  }
}

function compareEntries(left, right) {
  if (left.unknownTime !== right.unknownTime) return left.unknownTime ? 1 : -1
  const byTime = String(right.occurredAt).localeCompare(String(left.occurredAt))
  if (byTime !== 0) return byTime
  return String(right.id).localeCompare(String(left.id))
}

function apiError(code, message, details) {
  const error = new Error(message)
  error.code = code
  error.details = details
  return error
}
