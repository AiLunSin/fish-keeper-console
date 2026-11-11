import { useEffect, useMemo, useRef, useState } from 'react'
import en from '../locale/en.json'
import zh from '../locale/zh.json'

const NS = 'fishkeeper'
const PANEL_ID = 'fishkeeper'
const TABS = [
  ['overview', 'tab.overview'],
  ['timeline', 'tab.timeline'],
  ['checkpoints', 'tab.checkpoints'],
  ['migration', 'tab.migration'],
  ['doctor', 'tab.doctor'],
  ['settings', 'tab.settings'],
]

export const inject = ['slots', 'locale']

export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'fishkeeper:locale')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NS,
    inject: () => ({ t }),
  }, FishKeeperPage))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 20,
    locale: NS,
    label: () => t('panel'),
  }, FishIcon))
}

function FishIcon({ size = 20, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 12c2.5-3.7 5.9-5.6 9.7-5.6 2.4 0 4.4.8 5.8 2.4-.8 3.1-3.1 5.4-6.2 6.6l-2.8 3-.8-3.5c-2.4-.4-4.4-1.5-5.7-2.9Z" fill={active ? 'currentColor' : 'none'} fillOpacity=".14" />
      <circle cx="14.2" cy="10.8" r="1" fill="currentColor" stroke="none" />
      <path d="M8 15.4c1.7.8 3.5.9 5.2.3" />
    </svg>
  )
}

function FishKeeperPage(props) {
  const { t } = props
  const [tab, setTab] = useState('overview')
  const [overview, setOverview] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(undefined)
  const [toast, setToast] = useState(undefined)
  const toastTimer = useRef(undefined)
  const mounted = useRef(true)

  const notify = message => {
    if (!mounted.current) return
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(undefined), 4200)
  }

  const loadOverview = async () => {
    try {
      const data = await api('/overview')
      if (!mounted.current) return
      setOverview(data)
      setError(undefined)
    } catch (requestError) {
      if (mounted.current) setError(requestError)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }

  useEffect(() => {
    mounted.current = true
    void loadOverview()
    return () => {
      mounted.current = false
      clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    if (tab !== 'overview') return undefined
    const timer = setInterval(() => {
      if (!document.hidden) void loadOverview()
    }, 15_000)
    return () => clearInterval(timer)
  }, [tab])

  const sources = overview?.sources ?? []

  return (
    <div className="fk-page">
      <style>{CSS}</style>
      <div className="fk-inner">
        <header className="fk-head">
          <div className="fk-head-copy">
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <div className="fk-head-actions">
            {overview && (
              <span className={`fk-badge ${overview.mode === 'read-only' ? 'fk-badge-warn' : 'fk-badge-ok'}`}>
                {t(overview.mode === 'read-only' ? 'status.readonly' : 'status.writer')}
              </span>
            )}
            <button type="button" className="fk-btn" onClick={() => void loadOverview()}>
              {t('action.refresh')}
            </button>
          </div>
        </header>

        <nav className="fk-tabs" role="tablist" aria-label={t('title')}>
          {TABS.map(([id, key]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`fk-tab ${tab === id ? 'is-active' : ''}`}
              onClick={() => setTab(id)}
            >
              {t(key)}
            </button>
          ))}
        </nav>

        {error && <ErrorBox error={error} t={t} onRetry={() => void loadOverview()} />}

        {tab === 'overview' && (
          <OverviewTab
            t={t}
            overview={overview}
            loading={loading}
            onOpenTimeline={() => setTab('timeline')}
            onOpenCheckpoints={() => setTab('checkpoints')}
          />
        )}
        {tab === 'timeline' && <TimelineTab t={t} sources={sources} />}
        {tab === 'checkpoints' && <CheckpointsTab t={t} sources={sources} notify={notify} />}
        {tab === 'migration' && <MigrationTab t={t} sources={sources} notify={notify} />}
        {tab === 'doctor' && <DoctorTab t={t} />}
        {tab === 'settings' && <SettingsTab t={t} notify={notify} />}
      </div>
      {toast && <div className="fk-toast" role="status">{toast}</div>}
    </div>
  )
}

function OverviewTab({ t, overview, loading, onOpenTimeline, onOpenCheckpoints }) {
  if (loading && !overview) {
    return (
      <div className="fk-grid">
        {[0, 1].map(index => <div className="fk-card fk-skeleton" key={index} />)}
      </div>
    )
  }
  const sources = overview?.sources ?? []
  if (sources.length === 0) {
    return (
      <Empty
        title={t('overview.emptyTitle')}
        body={t('overview.emptyBody')}
        hint={`sources:\\n  - id: fish-a\\n    displayName: 大肥鱼 A\\n    adapter: file\\n    location: C:/path/to/fish-a`}
      />
    )
  }
  return (
    <div className="fk-grid">
      {sources.map(source => (
        <SourceCard
          key={source.id}
          t={t}
          source={source}
          onOpenTimeline={onOpenTimeline}
          onOpenCheckpoints={onOpenCheckpoints}
        />
      ))}
    </div>
  )
}

function SourceCard({ t, source, onOpenTimeline, onOpenCheckpoints }) {
  const fish = source.fish
  const energy = typeof fish?.energy === 'number' ? Math.max(0, Math.min(1, fish.energy)) : undefined
  const error = source.error
  return (
    <article className="fk-card">
      <header className="fk-card-head">
        <div className="fk-card-title">
          <span className={`fk-dot ${source.status === 'error' ? 'is-error' : 'is-ok'}`} aria-hidden="true" />
          <strong>{source.displayName}</strong>
          <span className="fk-chip">{source.adapter}</span>
          {source.readOnly && <span className="fk-chip fk-chip-warn">{t('status.readonly')}</span>}
        </div>
        <span className="fk-muted fk-mono">{source.id}</span>
      </header>

      {error ? (
        <div className="fk-source-error">
          <div className="fk-error-code">{error.code}</div>
          <p>{error.message || t('overview.sourceError')}</p>
        </div>
      ) : (
        <>
          {source.warnings?.length > 0 && (
            <ul className="fk-warnings">
              {source.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
            </ul>
          )}
          <div className="fk-meta-grid">
            <div><span className="fk-label">{t('overview.lastActive')}</span><span>{formatTime(fish?.lastActiveAt)}</span></div>
            <div><span className="fk-label">{t('overview.mood')}</span><span>{fish?.mood ?? '—'}</span></div>
            <div>
              <span className="fk-label">{t('overview.energy')}</span>
              <span className="fk-energy-row">
                <span className="fk-energy-track"><span className="fk-energy-fill" style={{ width: `${Math.round((energy ?? 0) * 100)}%` }} /></span>
                <span>{energy === undefined ? '—' : `${Math.round(energy * 100)}%`}</span>
              </span>
            </div>
          </div>

          <section className="fk-snippet">
            <div className="fk-label">{t('overview.latestDiary')}</div>
            {fish?.latestDiary?.text
              ? <blockquote>{fish.latestDiary.text}</blockquote>
              : <p className="fk-muted">{t('overview.noDiary')}</p>}
          </section>

          {fish?.latestWhisper?.text && (
            <section className="fk-snippet">
              <div className="fk-label">{t('overview.latestWhisper')}</div>
              <blockquote>{fish.latestWhisper.text}</blockquote>
            </section>
          )}

          <section className="fk-channels">
            <div className="fk-label">{t('overview.channels')}</div>
            {fish?.channels?.length
              ? fish.channels.map(channel => (
                <div className="fk-channel" key={channel.channel}>
                  <span className={`fk-dot ${channel.state === 'ok' ? 'is-ok' : channel.state === 'warn' ? 'is-warn' : 'is-idle'}`} aria-hidden="true" />
                  <span className="fk-channel-name">{channel.channel}</span>
                  <span className="fk-channel-detail" title={channel.detail}>{channel.detail}</span>
                </div>
              ))
              : <p className="fk-muted">{t('overview.noChannels')}</p>}
          </section>
        </>
      )}

      <footer className="fk-card-foot">
        <div className="fk-path" title={fish?.dataPath ?? source.id}>
          <span className="fk-label">{t('overview.dataPath')}</span>
          <code>{fish?.dataPath ?? '—'}</code>
        </div>
        <div className="fk-card-stats">
          <span>{t('overview.size')}: {formatBytes(fish?.dataBytes)}</span>
          <button type="button" className="fk-link" onClick={onOpenTimeline}>{t('tab.timeline')}</button>
          <button type="button" className="fk-link" onClick={onOpenCheckpoints}>{t('tab.checkpoints')}</button>
        </div>
      </footer>
    </article>
  )
}

function TimelineTab({ t, sources }) {
  const [sourceId, setSourceId] = useState('')
  const [riskOnly, setRiskOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(undefined)
  const [detail, setDetail] = useState(undefined)
  const [revealing, setRevealing] = useState(false)
  const requestId = useRef(0)

  const load = async (reset = false) => {
    const current = ++requestId.current
    if (reset) setLoading(true)
    try {
      const params = new URLSearchParams()
      if (sourceId) params.set('source', sourceId)
      if (riskOnly) params.set('risk', 'any')
      if (query.trim()) params.set('q', query.trim())
      params.set('limit', '50')
      if (!reset && cursor) params.set('cursor', cursor)
      const data = await api(`/timeline?${params.toString()}`)
      if (current !== requestId.current) return
      setItems(previous => reset ? data.items : [...previous, ...data.items])
      setCursor(data.nextCursor)
      setError(undefined)
    } catch (requestError) {
      if (current === requestId.current) setError(requestError)
    } finally {
      if (current === requestId.current) setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => { void load(true) }, 220)
    return () => clearTimeout(timer)
  }, [sourceId, riskOnly, query])

  const reveal = async () => {
    if (!detail) return
    setRevealing(true)
    try {
      const data = await api(`/entry?${new URLSearchParams({ source: detail.sourceId, id: detail.id, reveal: '1' })}`)
      setDetail({ ...detail, text: data.text, revealed: true })
    } catch (requestError) {
      setError(requestError)
    } finally {
      setRevealing(false)
    }
  }

  return (
    <div className="fk-panel">
      <div className="fk-toolbar">
        <select className="fk-select" value={sourceId} onChange={event => setSourceId(event.target.value)} aria-label={t('timeline.source')}>
          <option value="">{t('timeline.allSources')}</option>
          {sources.map(source => <option key={source.id} value={source.id}>{source.displayName}</option>)}
        </select>
        <label className="fk-check">
          <input type="checkbox" checked={riskOnly} onChange={event => setRiskOnly(event.target.checked)} />
          <span>{t('timeline.riskOnly')}</span>
        </label>
        <input
          className="fk-input"
          type="search"
          value={query}
          placeholder={t('timeline.searchPlaceholder')}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="button" className="fk-btn" onClick={() => void load(true)}>{t('action.refresh')}</button>
      </div>

      {error && <ErrorBox error={error} t={t} onRetry={() => void load(true)} />}

      {loading && items.length === 0 && <p className="fk-muted">{t('status.loading')}</p>}
      {!loading && items.length === 0 && <Empty title={t('timeline.noItems')} body={t('timeline.truncated')} />}

      <ul className="fk-timeline">
        {items.map(item => (
          <li key={`${item.sourceId}:${item.id}`}>
            <button type="button" className="fk-timeline-row" onClick={() => setDetail({ ...item, revealed: false })}>
              <span className="fk-time">{formatTime(item.occurredAt)}</span>
              <span className="fk-timeline-main">
                <span className="fk-timeline-meta">
                  <span className="fk-chip">{item.sourceName}</span>
                  <span className="fk-muted">{t(`kind.${item.kind}`)}</span>
                  {item.channel && <span className="fk-muted">· {item.channel}</span>}
                  <span className="fk-muted">· {t(`timeline.${item.visibility}`)}</span>
                </span>
                <span className="fk-timeline-text">{item.textMasked}</span>
              </span>
              <RiskChips hits={item.hits} t={t} />
            </button>
          </li>
        ))}
      </ul>

      {cursor && (
        <div className="fk-center">
          <button type="button" className="fk-btn" onClick={() => void load(false)}>{t('action.loadMore')}</button>
        </div>
      )}

      {detail && (
        <Modal title={t('timeline.detailTitle')} onClose={() => setDetail(undefined)} t={t}>
          <div className="fk-detail-meta">
            <span className="fk-chip">{detail.sourceName}</span>
            <span>{t(`kind.${detail.kind}`)}</span>
            <span className="fk-muted">{formatTime(detail.occurredAt)}</span>
            {detail.channel && <span className="fk-muted">· {detail.channel}</span>}
            <span className="fk-muted">· {t(`timeline.${detail.visibility}`)}</span>
          </div>
          <pre className="fk-detail-text">{detail.revealed ? detail.text : detail.textMasked}</pre>
          {detail.hits?.length > 0 && (
            <div className="fk-hits">
              <div className="fk-label">{t('timeline.hits')}</div>
              {detail.hits.map((hit, index) => (
                <div className="fk-hit" key={`${hit.ruleId}-${index}`}>
                  <span className={`fk-severity is-${hit.severity}`}>{hit.severity}</span>
                  <span>{ruleLabel(t, hit.ruleId)}</span>
                  <code>{hit.masked}</code>
                </div>
              ))}
            </div>
          )}
          <div className="fk-modal-actions">
            {!detail.revealed && (
              <button type="button" className="fk-btn" disabled={revealing} onClick={() => void reveal()}>
                {revealing ? t('status.loading') : t('action.showOriginal')}
              </button>
            )}
            <button type="button" className="fk-btn" onClick={() => setDetail(undefined)}>{t('action.close')}</button>
          </div>
          <p className="fk-hint">{t('timeline.revealHint')}</p>
        </Modal>
      )}
    </div>
  )
}

function CheckpointsTab({ t, sources, notify }) {
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? '')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [restoreSupported, setRestoreSupported] = useState(true)
  const [error, setError] = useState(undefined)
  const [selectedId, setSelectedId] = useState(undefined)
  const [detail, setDetail] = useState(undefined)
  const [diff, setDiff] = useState(undefined)
  const [diffPath, setDiffPath] = useState(undefined)
  const [restorePlan, setRestorePlan] = useState(undefined)
  const [restoreConfirmed, setRestoreConfirmed] = useState(false)
  const [overrideStale, setOverrideStale] = useState(false)
  const [restoreResult, setRestoreResult] = useState(undefined)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!sourceId && sources[0]) setSourceId(sources[0].id)
  }, [sources, sourceId])

  const load = async (id = sourceId) => {
    if (!id) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await api(`/checkpoints?${new URLSearchParams({ source: id })}`)
      setItems(data.items ?? [])
      setRestoreSupported(Boolean(data.restoreSupported))
      setError(undefined)
      if (selectedId && !(data.items ?? []).some(item => item.id === selectedId)) {
        setSelectedId(undefined)
        setDetail(undefined)
      }
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load(sourceId) }, [sourceId])

  const select = async item => {
    setSelectedId(item.id)
    setRestorePlan(undefined)
    setRestoreResult(undefined)
    setDiff(undefined)
    setDiffPath(undefined)
    try {
      const data = await api(`/checkpoint?${new URLSearchParams({ id: item.id })}`)
      setDetail(data)
      const first = (data.manifest.files ?? []).find(file => file.restorable && file.before)
      if (first) await loadDiff(item.id, first.path)
    } catch (requestError) {
      setError(requestError)
    }
  }

  const loadDiff = async (id, path) => {
    setDiffPath(path)
    try {
      const data = await api(`/checkpoint/diff?${new URLSearchParams({ id, path })}`)
      setDiff(data)
    } catch (requestError) {
      setError(requestError)
    }
  }

  const create = async () => {
    if (!sourceId) return
    setBusy(true)
    try {
      await api('/checkpoint/create', { method: 'POST', body: { sourceId } })
      notify(t('action.createCheckpoint'))
      await load(sourceId)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const startRestore = async () => {
    if (!detail) return
    const files = (detail.manifest.files ?? []).filter(file => file.restorable && file.before).map(file => file.path)
    if (files.length === 0) return
    setBusy(true)
    try {
      const plan = await api('/checkpoint/restore', { method: 'POST', body: { id: detail.manifest.id, files, dryRun: true } })
      setRestorePlan(plan)
      setRestoreConfirmed(false)
      setOverrideStale(false)
      setRestoreResult(undefined)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const executeRestore = async () => {
    if (!restorePlan) return
    setBusy(true)
    try {
      const files = restorePlan.files.filter(file => file.action === 'restore').map(file => file.path)
      const result = await api('/checkpoint/restore', {
        method: 'POST',
        body: {
          id: restorePlan.checkpointId,
          files,
          confirmToken: restorePlan.confirmToken,
          dryRun: false,
          overrideStale,
        },
      })
      setRestoreResult(result)
      notify(t('checkpoints.restoreDone', { count: result.restored ?? 0 }))
      await load(sourceId)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const pin = async () => {
    if (!detail) return
    try {
      await api('/checkpoint/pin', { method: 'POST', body: { id: detail.manifest.id, pinned: !detail.manifest.pinned } })
      await select({ id: detail.manifest.id })
      await load(sourceId)
    } catch (requestError) {
      setError(requestError)
    }
  }

  const remove = async () => {
    if (!detail) return
    if (!window.confirm(`${t('action.delete')} ${detail.manifest.id}?`)) return
    try {
      await api('/checkpoint/delete', { method: 'POST', body: { id: detail.manifest.id } })
      setDetail(undefined)
      setSelectedId(undefined)
      await load(sourceId)
    } catch (requestError) {
      setError(requestError)
    }
  }

  return (
    <div className="fk-panel">
      <div className="fk-toolbar">
        <select className="fk-select" value={sourceId} onChange={event => setSourceId(event.target.value)} aria-label={t('timeline.source')}>
          {sources.map(source => <option key={source.id} value={source.id}>{source.displayName}</option>)}
        </select>
        <button type="button" className="fk-btn" disabled={busy || !sourceId} onClick={() => void create()}>{t('action.createCheckpoint')}</button>
        <button type="button" className="fk-btn" onClick={() => void load(sourceId)}>{t('action.refresh')}</button>
      </div>
      {error && <ErrorBox error={error} t={t} onRetry={() => void load(sourceId)} />}
      {loading && <p className="fk-muted">{t('status.loading')}</p>}
      {!loading && items.length === 0 && <Empty title={t('checkpoints.empty')} body={t('checkpoints.createHint')} />}
      <div className="fk-split">
        <div className="fk-list">
          {items.map(item => (
            <button
              type="button"
              key={item.id}
              className={`fk-row ${selectedId === item.id ? 'is-selected' : ''}`}
              onClick={() => void select(item)}
            >
              <span className="fk-row-main">
                <span className="fk-row-title">
                  {formatTime(item.createdAt)}
                  {item.pinned && <span className="fk-chip">{t('checkpoints.pinned')}</span>}
                  {item.baseline && <span className="fk-chip">{t('checkpoints.trigger.baseline')}</span>}
                </span>
                <span className="fk-muted">
                  {triggerLabel(t, item.trigger)} · {t('checkpoints.files')} {item.files} · {formatBytes(item.storedBytes)}
                </span>
              </span>
              <code className="fk-mono fk-muted">{item.id.slice(0, 12)}</code>
            </button>
          ))}
        </div>
        <div className="fk-detail-pane">
          {!detail && <p className="fk-muted">{t('checkpoints.select')}</p>}
          {detail && (
            <>
              <div className="fk-detail-head">
                <div>
                  <strong>{detail.manifest.id}</strong>
                  <div className="fk-muted">{triggerLabel(t, detail.manifest.trigger?.kind)} · {formatTime(detail.manifest.createdAt)}</div>
                </div>
                <div className="fk-detail-actions">
                  <button type="button" className="fk-btn" onClick={() => void pin()}>
                    {detail.manifest.pinned ? t('action.unpin') : t('action.pin')}
                  </button>
                  <button type="button" className="fk-btn" onClick={() => void remove()}>{t('action.delete')}</button>
                </div>
              </div>
              <div className="fk-file-list">
                {(detail.manifest.files ?? []).map(file => (
                  <button
                    type="button"
                    key={file.path}
                    className={`fk-file ${diffPath === file.path ? 'is-selected' : ''}`}
                    onClick={() => void loadDiff(detail.manifest.id, file.path)}
                  >
                    <span className="fk-file-role">{file.role}</span>
                    <span className="fk-file-path" title={file.path}>{file.path}</span>
                    <span className={`fk-chip ${file.restorable ? 'fk-chip-ok' : ''}`}>{file.restorable ? 'restorable' : 'read-only'}</span>
                  </button>
                ))}
              </div>
              <div className="fk-diff-head">
                <span className="fk-label">{t('checkpoints.diff')}</span>
                <code className="fk-mono fk-muted">{diffPath ?? ''}</code>
              </div>
              {diff?.patch
                ? <pre className="fk-diff">{diff.patch}</pre>
                : <p className="fk-muted">{diff ? t('checkpoints.noDiff') : t('checkpoints.select')}</p>}
              <div className="fk-detail-actions">
                <button
                  type="button"
                  className="fk-btn"
                  disabled={busy || !restoreSupported || !(detail.manifest.files ?? []).some(file => file.restorable && file.before)}
                  onClick={() => void startRestore()}
                >
                  {t('action.restore')}
                </button>
                {!restoreSupported && <span className="fk-muted">{t('checkpoints.unsupported')}</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {restorePlan && (
        <Modal title={t('checkpoints.restoreTitle')} onClose={() => setRestorePlan(undefined)} t={t}>
          <p className="fk-warning">{t('checkpoints.restoreWarning')}</p>
          {restorePlan.files.some(file => file.stale) && <p className="fk-warning">{t('checkpoints.staleWarning')}</p>}
          <ul className="fk-plan-list">
            {restorePlan.files.map(file => (
              <li key={file.path}>
                <span className={`fk-chip ${file.action === 'restore' ? 'fk-chip-warn' : ''}`}>{file.action}</span>
                <code>{file.path}</code>
                {file.stale && <span className="fk-muted"> · stale</span>}
              </li>
            ))}
          </ul>
          <label className="fk-check">
            <input type="checkbox" checked={restoreConfirmed} onChange={event => setRestoreConfirmed(event.target.checked)} />
            <span>{t('checkpoints.restoreConfirm')}</span>
          </label>
          {restorePlan.files.some(file => file.stale) && (
            <label className="fk-check">
              <input type="checkbox" checked={overrideStale} onChange={event => setOverrideStale(event.target.checked)} />
              <span>{t('checkpoints.staleWarning')}</span>
            </label>
          )}
          <div className="fk-modal-actions">
            <button type="button" className="fk-btn" onClick={() => setRestorePlan(undefined)}>{t('action.cancel')}</button>
            <button type="button" className="fk-btn" disabled={!restoreConfirmed || busy} onClick={() => void executeRestore()}>
              {t('action.restore')}
            </button>
          </div>
          {restoreResult && (
            <div className="fk-success">
              <div>{t('checkpoints.restoreDone', { count: restoreResult.restored ?? 0 })}</div>
              {restoreResult.safetyCheckpointId && <div className="fk-muted">{t('checkpoints.safety')}</div>}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

function DoctorTab({ t }) {
  const [report, setReport] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(undefined)
  const [copied, setCopied] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setReport(await api('/doctor'))
      setError(undefined)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const copy = async () => {
    if (!report) return
    const lines = [
      '# Fish Keeper environment check',
      `- Generated: ${report.generatedAt}`,
      `- Overall: ${report.overall}`,
      '',
      '| Status | Check | Evidence | Suggested fix |',
      '|---|---|---|---|',
      ...report.checks.map(check => `| ${check.status} | ${check.title} | ${check.evidence} | ${check.remediation ?? ''} |`),
      '',
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fk-panel">
      <div className="fk-toolbar">
        <button type="button" className="fk-btn" onClick={() => void load()}>{t('action.refresh')}</button>
        <button type="button" className="fk-btn" onClick={() => void copy()} disabled={!report}>{t('action.copyReport')}</button>
        {report && <span className={`fk-badge ${report.overall === 'ok' ? 'fk-badge-ok' : report.overall === 'fail' ? 'fk-badge-error' : 'fk-badge-warn'}`}>{t(`status.${report.overall}`)}</span>}
        {copied && <span className="fk-muted">{t('doctor.copied')}</span>}
      </div>
      <p className="fk-hint">{t('doctor.refreshHint')}</p>
      {error && <ErrorBox error={error} t={t} onRetry={() => void load()} />}
      {loading && !report && <p className="fk-muted">{t('status.loading')}</p>}
      {report && (
        <div className="fk-table-wrap">
          <table className="fk-table">
            <thead>
              <tr><th>{t('doctor.check')}</th><th>{t('doctor.overall')}</th><th>{t('doctor.evidence')}</th><th>{t('doctor.remediation')}</th></tr>
            </thead>
            <tbody>
              {report.checks.map(check => (
                <tr key={check.id}>
                  <td>{check.title}</td>
                  <td><span className={`fk-status is-${check.status}`}>{t(`status.${check.status}`)}</span></td>
                  <td className="fk-evidence">{check.evidence}</td>
                  <td className="fk-evidence">{check.remediation ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function MigrationTab({ t, sources, notify }) {
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? '')
  const [mode, setMode] = useState('full')
  const [includeCheckpoints, setIncludeCheckpoints] = useState(true)
  const [exportResult, setExportResult] = useState(undefined)
  const [packagePath, setPackagePath] = useState('')
  const [importMode, setImportMode] = useState('reference')
  const [targetSourceId, setTargetSourceId] = useState('')
  const [overwriteConfirmed, setOverwriteConfirmed] = useState(false)
  const [preflight, setPreflight] = useState(undefined)
  const [importResult, setImportResult] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(undefined)

  const writeTargets = sources.filter(source => source.adapter === 'file' && source.capabilities?.import)

  useEffect(() => {
    if (!sourceId && sources[0]) setSourceId(sources[0].id)
  }, [sources, sourceId])

  useEffect(() => {
    if (importMode !== 'write') return
    if (!targetSourceId && writeTargets[0]) setTargetSourceId(writeTargets[0].id)
  }, [importMode, targetSourceId, writeTargets])

  useEffect(() => {
    setPreflight(undefined)
    setImportResult(undefined)
    setOverwriteConfirmed(false)
  }, [packagePath, importMode, targetSourceId])

  const runExport = async () => {
    if (!sourceId) return
    setBusy(true)
    setError(undefined)
    try {
      const result = await api('/export', { method: 'POST', body: { sourceId, mode, includeCheckpoints: mode === 'full' && includeCheckpoints } })
      setExportResult(result)
      notify(t('migration.exportDone', { path: result.path }))
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const runPreflight = async () => {
    if (!packagePath.trim()) return
    setBusy(true)
    setError(undefined)
    setImportResult(undefined)
    try {
      const result = await api('/import/preflight', {
        method: 'POST',
        body: { path: packagePath.trim(), mode: importMode, targetSourceId: importMode === 'write' ? targetSourceId : undefined },
      })
      setPreflight(result)
      notify(t('migration.preflightDone'))
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const needsOverwriteConfirm = importMode === 'write' && Boolean(preflight?.plan?.target?.overwrite)
  const canImport = preflight?.verdict === 'ok'
    && (importMode !== 'write' || (Boolean(targetSourceId) && (!needsOverwriteConfirm || overwriteConfirmed)))

  const runImport = async () => {
    if (!preflight || preflight.verdict !== 'ok' || !canImport) return
    setBusy(true)
    setError(undefined)
    try {
      const result = await api('/import', {
        method: 'POST',
        body: {
          path: packagePath.trim(),
          mode: importMode,
          targetSourceId: importMode === 'write' ? targetSourceId : undefined,
          confirmToken: preflight.confirmToken,
          overwrite: overwriteConfirmed,
        },
      })
      setImportResult(result)
      notify(t(importMode === 'write' ? 'migration.writeDone' : 'migration.importDone', { path: result.importedPath }))
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fk-panel fk-migration">
      {error && <ErrorBox error={error} t={t} onRetry={() => setError(undefined)} />}
      <section className="fk-card fk-form-card">
        <h2>{t('migration.exportTitle')}</h2>
        <div className="fk-form-row">
          <label className="fk-field">
            <span>{t('common.source')}</span>
            <select className="fk-select" value={sourceId} onChange={event => setSourceId(event.target.value)}>
              {sources.map(source => <option key={source.id} value={source.id}>{source.displayName}</option>)}
            </select>
          </label>
          <label className="fk-field">
            <span>{t('migration.mode')}</span>
            <select className="fk-select" value={mode} onChange={event => setMode(event.target.value)}>
              <option value="full">{t('migration.modeFull')}</option>
              <option value="share">{t('migration.modeShare')}</option>
            </select>
          </label>
          {mode === 'full' && (
            <label className="fk-check fk-check-inline">
              <input type="checkbox" checked={includeCheckpoints} onChange={event => setIncludeCheckpoints(event.target.checked)} />
              <span>{t('migration.includeCheckpoints')}</span>
            </label>
          )}
          <button type="button" className="fk-btn" disabled={busy || !sourceId} onClick={() => void runExport()}>{t('action.export')}</button>
        </div>
        <p className="fk-hint">{t('migration.exportHint')}</p>
        {exportResult && (
          <div className="fk-result">
            <div>{t('migration.exportDone', { path: exportResult.path })}</div>
            <code className="fk-mono">{exportResult.path}</code>
            <div className="fk-muted">{formatBytes(exportResult.bytes)} · {exportResult.sha256?.slice(0, 16)}…</div>
          </div>
        )}
      </section>

      <section className="fk-card fk-form-card">
        <h2>{t('migration.importTitle')}</h2>
        <div className="fk-form-row">
          <input
            className="fk-input fk-path-input"
            value={packagePath}
            placeholder={t('migration.pathPlaceholder')}
            onChange={event => setPackagePath(event.target.value)}
          />
          <label className="fk-field">
            <span>{t('migration.importMode')}</span>
            <select className="fk-select" value={importMode} onChange={event => setImportMode(event.target.value)}>
              <option value="reference">{t('migration.modeReference')}</option>
              <option value="write">{t('migration.modeWrite')}</option>
            </select>
          </label>
          {importMode === 'write' && (
            <label className="fk-field">
              <span>{t('migration.target')}</span>
              <select className="fk-select" value={targetSourceId} onChange={event => setTargetSourceId(event.target.value)}>
                <option value="">{t('migration.targetPlaceholder')}</option>
                {writeTargets.map(source => <option key={source.id} value={source.id}>{source.displayName}</option>)}
              </select>
            </label>
          )}
          <button type="button" className="fk-btn" disabled={busy || !packagePath.trim()} onClick={() => void runPreflight()}>{t('action.preflight')}</button>
          <button type="button" className="fk-btn" disabled={busy || !canImport} onClick={() => void runImport()}>{t('action.import')}</button>
        </div>
        <p className="fk-hint">{importMode === 'write' ? t('migration.writeHint') : t('migration.importHint')}</p>
        {importMode === 'write' && writeTargets.length === 0 && <p className="fk-warning">{t('migration.noWriteTargets')}</p>}
        {needsOverwriteConfirm && (
          <label className="fk-check fk-check-inline">
            <input type="checkbox" checked={overwriteConfirmed} onChange={event => setOverwriteConfirmed(event.target.checked)} />
            <span>{t('migration.overwriteConfirm')}</span>
          </label>
        )}
        {preflight && (
          <div className="fk-result">
            <div className={`fk-status is-${preflight.verdict === 'ok' ? 'ok' : 'fail'}`}>{t(`migration.verdict.${preflight.verdict}`)}</div>
            {preflight.plan?.target && (
              <div className="fk-muted">
                {t('migration.writePlan', {
                  target: preflight.plan.target.displayName,
                  files: preflight.plan.target.files.length,
                  identity: preflight.plan.target.identity,
                })}
              </div>
            )}
            {preflight.findings?.length > 0 && (
              <ul className="fk-findings">
                {preflight.findings.map((finding, index) => (
                  <li key={`${finding.code}-${index}`} className={`fk-finding is-${finding.severity}`}>
                    <code>{finding.code}</code>
                    <span>{finding.message}</span>
                    {finding.remediation && <span className="fk-muted">{finding.remediation}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {importResult && (
          <div className="fk-result">
            <div>{t(importResult.mode === 'write' ? 'migration.writeDone' : 'migration.importDone', { path: importResult.importedPath })}</div>
            <code className="fk-mono">{importResult.importedPath}</code>
            {importResult.mode === 'write' ? (
              <>
                {importResult.backupPath && <div className="fk-muted">{t('migration.backupPath', { path: importResult.backupPath })}</div>}
                <p className="fk-hint">{t('migration.writeNote')}</p>
              </>
            ) : (
              <p className="fk-hint">{t('migration.referenceNote')}</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function SettingsTab({ t, notify }) {
  const [dataRoot, setDataRoot] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(undefined)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    api('/config')
      .then(result => {
        if (cancelled) return
        setDataRoot(result.dataRoot ?? '')
        setRows((result.sources ?? []).map((source, index) => ({
          key: `source-${index}-${source.id}`,
          id: source.id,
          displayName: source.displayName,
          adapter: source.adapter,
          location: source.location,
          enabled: source.enabled !== false,
          optionsText: JSON.stringify(source.options ?? {}, null, 2),
        })))
      })
      .catch(requestError => { if (!cancelled) setError(requestError) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const update = (index, patch) => {
    setSaved(false)
    setRows(current => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))
  }

  const addRow = () => {
    setSaved(false)
    setRows(current => [...current, {
      key: `new-${Date.now()}`,
      id: '',
      displayName: '',
      adapter: 'file',
      location: '',
      enabled: true,
      optionsText: '{}',
    }])
  }

  const removeRow = index => {
    setSaved(false)
    setRows(current => current.filter((_, rowIndex) => rowIndex !== index))
  }

  const save = async () => {
    setError(undefined)
    let sources
    try {
      sources = rows.map((row, index) => {
        let options
        try {
          options = row.optionsText.trim() === '' ? {} : JSON.parse(row.optionsText)
        } catch {
          throw new Error(`${row.displayName || row.id || index + 1}: ${t('settings.invalidOptions')}`)
        }
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
          throw new Error(`${row.displayName || row.id || index + 1}: ${t('settings.invalidOptions')}`)
        }
        return {
          id: row.id.trim(),
          displayName: row.displayName.trim(),
          adapter: row.adapter,
          location: row.location.trim(),
          enabled: row.enabled,
          options,
        }
      })
    } catch (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    try {
      await api('/config/save', { method: 'POST', body: { sources } })
      setSaved(true)
      notify(t('settings.saved'))
    } catch (requestError) {
      setError(requestError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="fk-panel"><div className="fk-card fk-skeleton" /></div>

  return (
    <div className="fk-panel">
      {error && <ErrorBox error={error} t={t} onRetry={() => setError(undefined)} />}
      <section className="fk-card fk-form-card">
        <div className="fk-detail-head">
          <div>
            <h2>{t('settings.title')}</h2>
            <p className="fk-hint">{t('settings.hint')}</p>
          </div>
          <div className="fk-detail-actions">
            <button type="button" className="fk-btn fk-btn-ghost" onClick={addRow}>{t('settings.add')}</button>
            <button type="button" className="fk-btn" disabled={saving} onClick={() => void save()}>{saving ? t('settings.saving') : t('settings.save')}</button>
          </div>
        </div>
        <p className="fk-hint">{t('settings.dataRoot')}: <code className="fk-mono">{dataRoot}</code></p>
        {saved && <p className="fk-success">{t('settings.reloadHint')}</p>}
        {rows.length === 0 && <p className="fk-hint">{t('settings.empty')}</p>}
        <div className="fk-source-list">
          {rows.map((row, index) => {
            let parsed
            try {
              parsed = row.optionsText.trim() === '' ? {} : JSON.parse(row.optionsText)
            } catch {
              parsed = undefined
            }
            const preset = parsed && typeof parsed === 'object' && parsed.preset === 'fishtank' ? 'fishtank' : ''
            const setPreset = value => {
              const base = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? { ...parsed } : {}
              if (value) base.preset = value
              else delete base.preset
              update(index, { optionsText: JSON.stringify(base, null, 2) })
            }
            return (
              <div key={row.key} className="fk-source-row">
                <div className="fk-form-row">
                  <label className="fk-field">
                    <span>{t('settings.id')}</span>
                    <input className="fk-input" value={row.id} onChange={event => update(index, { id: event.target.value })} />
                  </label>
                  <label className="fk-field">
                    <span>{t('settings.displayName')}</span>
                    <input className="fk-input" value={row.displayName} onChange={event => update(index, { displayName: event.target.value })} />
                  </label>
                  <label className="fk-field">
                    <span>{t('settings.adapter')}</span>
                    <select className="fk-select" value={row.adapter} onChange={event => update(index, { adapter: event.target.value })}>
                      <option value="file">file</option>
                      <option value="http">http</option>
                    </select>
                  </label>
                  <label className="fk-field">
                    <span>{t('settings.preset')}</span>
                    <select className="fk-select" value={preset} onChange={event => setPreset(event.target.value)}>
                      <option value="">{t('settings.presetNone')}</option>
                      <option value="fishtank">{t('settings.presetFishtank')}</option>
                    </select>
                  </label>
                  <label className="fk-check fk-check-inline">
                    <input type="checkbox" checked={row.enabled} onChange={event => update(index, { enabled: event.target.checked })} />
                    <span>{t('settings.enabled')}</span>
                  </label>
                  <button type="button" className="fk-btn fk-btn-ghost" onClick={() => removeRow(index)}>{t('settings.delete')}</button>
                </div>
                <label className="fk-field">
                  <span>{t('settings.location')}</span>
                  <input className="fk-input" value={row.location} onChange={event => update(index, { location: event.target.value })} />
                </label>
                <label className="fk-field">
                  <span>{t('settings.options')}</span>
                  <textarea
                    className="fk-input fk-textarea"
                    rows={4}
                    spellCheck={false}
                    value={row.optionsText}
                    onChange={event => update(index, { optionsText: event.target.value })}
                  />
                </label>
                <p className="fk-hint">{t('settings.optionsHint')}</p>
              </div>
            )
          })}
        </div>
        <p className="fk-hint">{t('settings.writeBackHint')}</p>
      </section>
    </div>
  )
}

function RiskChips({ hits, t }) {
  if (!hits || hits.length === 0) return null
  const unique = []
  const seen = new Set()
  for (const hit of hits) {
    if (seen.has(hit.ruleId)) continue
    seen.add(hit.ruleId)
    unique.push(hit)
  }
  return (
    <span className="fk-risks">
      {unique.slice(0, 3).map(hit => (
        <span key={hit.ruleId} className={`fk-severity is-${hit.severity}`}>{ruleLabel(t, hit.ruleId)}</span>
      ))}
    </span>
  )
}

function ErrorBox({ error, t, onRetry }) {
  const message = error?.code === 'fishkeeper/network'
    ? t('error.network')
    : error?.code && error?.message ? error.message : t('error.network')
  return (
    <div className="fk-error-box" role="alert">
      <div>
        <strong>{t('error.title')}</strong>
        {error?.code && <code className="fk-error-code">{error.code}</code>}
        <p>{message}</p>
      </div>
      {onRetry && <button type="button" className="fk-btn" onClick={onRetry}>{t('action.retry')}</button>}
    </div>
  )
}

function Empty({ title, body, hint }) {
  return (
    <div className="fk-empty">
      <div className="fk-empty-art" aria-hidden="true">
        <FishIcon size={44} />
      </div>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
      {hint && <pre className="fk-code">{hint}</pre>}
    </div>
  )
}

function Modal({ title, children, onClose, t }) {
  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fk-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="fk-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="fk-modal-head">
          <h2>{title}</h2>
          <button type="button" className="fk-icon-btn" aria-label={t('action.close')} onClick={onClose}>×</button>
        </header>
        <div className="fk-modal-body">{children}</div>
      </div>
    </div>
  )
}

async function api(path, options = {}) {
  const { method = 'GET', body } = options
  let response
  try {
    response = await fetch(`/api/fishkeeper${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? { accept: 'application/json' } : { accept: 'application/json', 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    const error = new Error('Network request failed')
    error.code = 'fishkeeper/network'
    throw error
  }
  let data
  try {
    data = await response.json()
  } catch {
    data = {}
  }
  if (!response.ok) {
    const error = new Error(data?.error?.message ?? `HTTP ${response.status}`)
    error.code = data?.error?.code ?? 'fishkeeper/internal'
    error.details = data?.error?.details
    throw error
  }
  return data
}

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function formatBytes(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function triggerLabel(t, trigger) {
  const key = `checkpoints.trigger.${trigger ?? 'manual'}`
  const value = t(key)
  return value === key ? (trigger ?? 'manual') : value
}

function ruleLabel(t, ruleId) {
  const key = `rule.${ruleId}`
  const value = t(key)
  return value === key ? ruleId : value
}

const CSS = `
.fk-page {
  height: 100%;
  min-height: 0;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-size: 14px;
  line-height: 1.55;
}
.fk-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px clamp(20px, 4vw, 48px) 56px;
}
.fk-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.fk-head-copy h1 { margin: 0; font-size: 20px; line-height: 28px; font-weight: 500; }
.fk-head-copy p { margin: 4px 0 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.fk-head-actions { display: flex; align-items: center; gap: 10px; }
.fk-tabs { display: flex; gap: 4px; margin: 22px 0 18px; border-bottom: 1px solid var(--dsw-alias-border-l1); overflow-x: auto; }
.fk-tab {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  padding: 9px 12px; font: inherit; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap;
}
.fk-tab:hover { color: var(--dsw-alias-label-primary); }
.fk-tab.is-active { color: var(--dsw-alias-brand-primary); border-bottom-color: var(--dsw-alias-brand-primary); }
.fk-badge, .fk-chip, .fk-severity, .fk-status {
  display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px; padding: 1px 8px; font-size: 12px; line-height: 18px; white-space: nowrap;
}
.fk-badge-ok, .fk-chip-ok, .fk-status.is-ok { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, transparent); }
.fk-badge-warn, .fk-chip-warn, .fk-status.is-warn { color: var(--dsw-alias-state-warn-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 35%, transparent); }
.fk-badge-error, .fk-status.is-fail, .fk-status.is-error { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, transparent); }
.fk-status.is-unknown { color: var(--dsw-alias-label-secondary); }
.fk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.fk-card {
  display: flex; flex-direction: column; gap: 14px; padding: 16px;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px; min-width: 0;
}
.fk-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.fk-card-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.fk-card-title strong { font-weight: 600; }
.fk-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; background: var(--dsw-alias-state-idle-primary); }
.fk-dot.is-ok { background: var(--dsw-alias-state-success-primary); }
.fk-dot.is-warn { background: var(--dsw-alias-state-warn-primary); }
.fk-dot.is-error { background: var(--dsw-alias-state-error-primary); }
.fk-dot.is-idle { background: var(--dsw-alias-state-idle-primary); }
.fk-muted { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.fk-mono, .fk-path code, .fk-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.fk-label { display: block; color: var(--dsw-alias-label-secondary); font-size: 12px; margin-bottom: 3px; }
.fk-meta-grid { display: grid; grid-template-columns: 1.4fr 1fr 1.4fr; gap: 10px; }
.fk-meta-grid > div { min-width: 0; }
.fk-energy-row { display: flex; align-items: center; gap: 8px; }
.fk-energy-track { flex: 1; height: 6px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; min-width: 50px; }
.fk-energy-fill { display: block; height: 100%; background: var(--dsw-alias-brand-primary); border-radius: 999px; }
.fk-snippet blockquote {
  margin: 0; padding: 8px 10px; border-left: 3px solid var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-bg-layer-2); border-radius: 0 8px 8px 0; font-size: 13px;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.fk-channels { display: flex; flex-direction: column; gap: 6px; }
.fk-channel { display: flex; align-items: center; gap: 8px; min-width: 0; }
.fk-channel-name { font-weight: 500; }
.fk-channel-detail { color: var(--dsw-alias-label-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fk-card-foot { margin-top: auto; display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 10px; }
.fk-path { min-width: 0; }
.fk-path code { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-secondary); }
.fk-card-stats { display: flex; align-items: center; gap: 12px; color: var(--dsw-alias-label-secondary); font-size: 12px; flex-wrap: wrap; }
.fk-source-error { color: var(--dsw-alias-state-error-primary); }
.fk-warnings { margin: 0; padding: 8px 10px 8px 24px; border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, transparent); color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }
.fk-warnings li + li { margin-top: 2px; }
.fk-source-error p { margin: 4px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; word-break: break-word; }
.fk-error-code { font-family: ui-monospace, monospace; font-size: 11px; opacity: .85; }
.fk-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 30px; padding: 0 11px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 13px; cursor: pointer; white-space: nowrap;
}
.fk-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.fk-btn:disabled { opacity: .5; cursor: not-allowed; }
.fk-link { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-brand-primary); font: inherit; font-size: 12px; cursor: pointer; padding: 0; }
.fk-icon-btn { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); font-size: 22px; line-height: 1; cursor: pointer; padding: 2px 6px; }
.fk-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.fk-select, .fk-input {
  height: 30px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 13px; padding: 0 9px; min-width: 120px;
}
.fk-input { flex: 1; min-width: 180px; }
.fk-path-input { flex: 2; }
.fk-check { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; cursor: pointer; }
.fk-check-inline { margin-left: 4px; }
.fk-check input { accent-color: var(--dsw-alias-brand-primary); }
.fk-panel { min-width: 0; }
.fk-timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.fk-timeline-row {
  display: flex; gap: 12px; width: 100%; text-align: left; padding: 10px 8px;
  border: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); background: transparent;
  color: inherit; font: inherit; cursor: pointer;
}
.fk-timeline-row:hover { background: var(--dsw-alias-bg-layer-1); }
.fk-time { flex: 0 0 132px; color: var(--dsw-alias-label-secondary); font-size: 12px; padding-top: 2px; }
.fk-timeline-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fk-timeline-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 12px; }
.fk-timeline-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fk-risks { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; max-width: 240px; }
.fk-severity { font-size: 11px; padding: 0 7px; }
.fk-severity.is-high { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, transparent); }
.fk-severity.is-medium { color: var(--dsw-alias-state-warn-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 35%, transparent); }
.fk-severity.is-low { color: var(--dsw-alias-label-secondary); }
.fk-center { display: flex; justify-content: center; padding: 16px; }
.fk-overlay {
  position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;
  padding: 20px; background: color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);
}
.fk-modal {
  width: min(720px, 100%); max-height: min(80vh, 760px); overflow: auto;
  background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px; box-shadow: 0 18px 50px color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);
}
.fk-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.fk-modal-head h2 { margin: 0; font-size: 15px; font-weight: 600; }
.fk-modal-body { padding: 16px 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.fk-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.fk-detail-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; }
.fk-detail-text { margin: 0; padding: 10px; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 13px; max-height: 260px; overflow: auto; }
.fk-hits { display: flex; flex-direction: column; gap: 5px; }
.fk-hit { display: flex; align-items: center; gap: 8px; font-size: 12px; flex-wrap: wrap; }
.fk-hit code { color: var(--dsw-alias-label-secondary); }
.fk-hint { color: var(--dsw-alias-label-secondary); font-size: 12px; margin: 0; }
.fk-warning { margin: 0; padding: 9px 10px; border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 10%, transparent); border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 30%, transparent); font-size: 13px; }
.fk-success { margin-top: 8px; padding: 10px; border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent); }
.fk-error-box { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 10px 12px; margin-bottom: 14px; border-radius: 8px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); }
.fk-error-box p { margin: 2px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.fk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 48px 20px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 12px; text-align: center; }
.fk-empty h2 { margin: 0; font-size: 15px; font-weight: 600; }
.fk-empty p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; max-width: 560px; }
.fk-empty-art { color: var(--dsw-alias-brand-primary); }
.fk-code { text-align: left; max-width: 100%; overflow: auto; padding: 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); }
.fk-skeleton { min-height: 210px; background: linear-gradient(90deg, var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-2), var(--dsw-alias-bg-layer-1)); background-size: 200% 100%; animation: fk-shimmer 1.4s ease-in-out infinite; }
@keyframes fk-shimmer { 0% { background-position: 0% 0; } 100% { background-position: -200% 0; } }
.fk-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 120; padding: 9px 14px; border-radius: 999px; background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l2); box-shadow: 0 8px 24px color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent); font-size: 13px; }
.fk-split { display: grid; grid-template-columns: minmax(260px, 360px) minmax(0, 1fr); gap: 16px; align-items: start; }
.fk-list { display: flex; flex-direction: column; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; overflow: hidden; }
.fk-row { appearance: none; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); background: transparent; color: inherit; font: inherit; text-align: left; padding: 10px 12px; cursor: pointer; display: flex; gap: 8px; align-items: center; }
.fk-row:hover, .fk-row.is-selected { background: var(--dsw-alias-bg-layer-1); }
.fk-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fk-row-title { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-weight: 500; }
.fk-detail-pane { min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.fk-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.fk-detail-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.fk-file-list { display: flex; flex-direction: column; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; overflow: hidden; }
.fk-file { appearance: none; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); background: transparent; color: inherit; font: inherit; text-align: left; padding: 7px 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 12px; }
.fk-file:last-child { border-bottom: 0; }
.fk-file:hover, .fk-file.is-selected { background: var(--dsw-alias-bg-layer-1); }
.fk-file-role { color: var(--dsw-alias-label-secondary); flex: 0 0 64px; }
.fk-file-path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, monospace; }
.fk-diff-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.fk-diff { margin: 0; max-height: 340px; overflow: auto; padding: 10px; border-radius: 8px; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); font-family: ui-monospace, monospace; font-size: 12px; white-space: pre; }
.fk-plan-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow: auto; }
.fk-plan-list li { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.fk-table-wrap { overflow: auto; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; }
.fk-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.fk-table th, .fk-table td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); vertical-align: top; }
.fk-table th { color: var(--dsw-alias-label-secondary); font-weight: 500; font-size: 12px; background: var(--dsw-alias-bg-layer-1); position: sticky; top: 0; }
.fk-evidence { color: var(--dsw-alias-label-secondary); font-size: 12px; max-width: 360px; word-break: break-word; }
.fk-migration { display: flex; flex-direction: column; gap: 16px; }
.fk-form-card h2 { margin: 0; font-size: 15px; font-weight: 600; }
.fk-form-row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.fk-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.fk-result { padding: 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); display: flex; flex-direction: column; gap: 5px; font-size: 13px; }
.fk-findings { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.fk-finding { display: flex; flex-direction: column; gap: 2px; padding: 7px 9px; border-radius: 7px; background: var(--dsw-alias-bg-base); font-size: 12px; }
.fk-finding.is-blocker { border-left: 3px solid var(--dsw-alias-state-error-primary); }
.fk-finding.is-warning { border-left: 3px solid var(--dsw-alias-state-warn-primary); }
.fk-source-list { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
.fk-source-row { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-base); }
.fk-source-row .fk-input, .fk-source-row .fk-select { min-width: 120px; }
.fk-textarea { height: auto; min-height: 90px; resize: vertical; font-family: ui-monospace, monospace; font-size: 12px; }
@media (max-width: 760px) {
  .fk-grid { grid-template-columns: 1fr; }
  .fk-split { grid-template-columns: 1fr; }
  .fk-meta-grid { grid-template-columns: 1fr 1fr; }
  .fk-time { flex-basis: 92px; }
}
`
