const ROUTES = [
  ['/api/fishkeeper/overview', ['GET'], 'buffered', handleOverview],
  ['/api/fishkeeper/sources', ['GET'], 'buffered', handleSources],
  ['/api/fishkeeper/timeline', ['GET'], 'buffered', handleTimeline],
  ['/api/fishkeeper/entry', ['GET'], 'buffered', handleEntry],
  ['/api/fishkeeper/checkpoints', ['GET'], 'buffered', handleCheckpoints],
  ['/api/fishkeeper/checkpoint', ['GET'], 'buffered', handleCheckpointDetail],
  ['/api/fishkeeper/checkpoint/diff', ['GET'], 'buffered', handleCheckpointDiff],
  ['/api/fishkeeper/checkpoint/create', ['POST'], 'buffered', handleCheckpointCreate],
  ['/api/fishkeeper/checkpoint/restore', ['POST'], 'buffered', handleCheckpointRestore],
  ['/api/fishkeeper/checkpoint/pin', ['POST'], 'buffered', handleCheckpointPin],
  ['/api/fishkeeper/checkpoint/delete', ['POST'], 'buffered', handleCheckpointDelete],
  ['/api/fishkeeper/config', ['GET'], 'buffered', handleConfig],
  ['/api/fishkeeper/config/save', ['POST'], 'buffered', handleConfigSave],
  ['/api/fishkeeper/doctor', ['GET'], 'buffered', handleDoctor],
  ['/api/fishkeeper/export', ['POST'], 'buffered', handleExport],
  ['/api/fishkeeper/import/preflight', ['POST'], 'buffered', handleImportPreflight],
  ['/api/fishkeeper/import', ['POST'], 'buffered', handleImport],
]

export function registerRoutes(ctx, runtime) {
  for (const [path, methods, requestBody, handler] of ROUTES) {
    ctx.effect(() => ctx.connection.fetch.register({
      path,
      methods,
      requestBody,
      fetch: async request => {
        try {
          await runtime.whenReady()
          return await handler(request, runtime)
        } catch (error) {
          return errorResponse(error)
        }
      },
    }), `fishkeeper:route:${path}`)
  }
}

async function handleOverview(_request, runtime) {
  return jsonResponse(await runtime.overview())
}

async function handleSources(_request, runtime) {
  return jsonResponse({ items: runtime.sourceList(), mode: runtime.mode() })
}

async function handleTimeline(request, runtime) {
  const url = new URL(request.url)
  const query = {
    source: url.searchParams.get('source') ?? undefined,
    q: url.searchParams.get('q') ?? undefined,
    risk: url.searchParams.get('risk') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    cursor: url.searchParams.get('cursor') ?? undefined,
  }
  return jsonResponse(await runtime.timeline(query))
}

async function handleEntry(request, runtime) {
  const url = new URL(request.url)
  const source = url.searchParams.get('source')
  const id = url.searchParams.get('id')
  const reveal = url.searchParams.get('reveal') === '1'
  if (!source || !id) throw apiError('fishkeeper/bad-request', 'source and id are required.')
  return jsonResponse(await runtime.entry({ source, id, reveal }))
}

async function handleCheckpoints(request, runtime) {
  const url = new URL(request.url)
  const source = url.searchParams.get('source')
  if (!source) throw apiError('fishkeeper/bad-request', 'source is required.')
  return jsonResponse(runtime.checkpoints(source))
}

async function handleCheckpointDetail(request, runtime) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) throw apiError('fishkeeper/bad-request', 'id is required.')
  return jsonResponse(runtime.checkpointDetail(id))
}

async function handleCheckpointDiff(request, runtime) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const path = url.searchParams.get('path')
  if (!id || !path) throw apiError('fishkeeper/bad-request', 'id and path are required.')
  return jsonResponse(await runtime.checkpointDiff(id, path))
}

async function handleCheckpointCreate(request, runtime) {
  const body = await readJson(request)
  if (!body.sourceId) throw apiError('fishkeeper/bad-request', 'sourceId is required.')
  return jsonResponse(await runtime.createCheckpoint(body.sourceId))
}

async function handleCheckpointRestore(request, runtime) {
  const body = await readJson(request)
  if (!body.id) throw apiError('fishkeeper/bad-request', 'id is required.')
  if (body.dryRun !== false) {
    return jsonResponse(await runtime.restoreDryRun(body.id, body.files))
  }
  return jsonResponse(await runtime.restoreExecute({
    id: body.id,
    paths: body.files,
    confirmToken: body.confirmToken,
    overrideStale: Boolean(body.overrideStale),
  }))
}

async function handleCheckpointPin(request, runtime) {
  const body = await readJson(request)
  if (!body.id) throw apiError('fishkeeper/bad-request', 'id is required.')
  return jsonResponse(await runtime.pinCheckpoint(body.id, Boolean(body.pinned)))
}

async function handleCheckpointDelete(request, runtime) {
  const body = await readJson(request)
  if (!body.id) throw apiError('fishkeeper/bad-request', 'id is required.')
  return jsonResponse(await runtime.deleteCheckpoint(body.id))
}

async function handleConfig(_request, runtime) {
  return jsonResponse(runtime.configuration())
}

async function handleConfigSave(request, runtime) {
  const body = await readJson(request)
  return jsonResponse(await runtime.saveSources(body))
}

async function handleDoctor(_request, runtime) {
  return jsonResponse(await runtime.doctor())
}

async function handleExport(request, runtime) {
  const body = await readJson(request)
  if (!body.sourceId) throw apiError('fishkeeper/bad-request', 'sourceId is required.')
  return jsonResponse(await runtime.exportPackage({
    sourceId: body.sourceId,
    mode: body.mode === 'share' ? 'share' : 'full',
    includeCheckpoints: Boolean(body.includeCheckpoints),
  }))
}

async function handleImportPreflight(request, runtime) {
  const body = await readJson(request)
  if (!body.path) throw apiError('fishkeeper/bad-request', 'path is required.')
  return jsonResponse(await runtime.preflightImport({
    path: body.path,
    mode: body.mode === 'write' ? 'write' : 'reference',
    targetSourceId: body.targetSourceId,
  }))
}

async function handleImport(request, runtime) {
  const body = await readJson(request)
  if (!body.path) throw apiError('fishkeeper/bad-request', 'path is required.')
  return jsonResponse(await runtime.importPackage({
    path: body.path,
    mode: body.mode === 'write' ? 'write' : 'reference',
    targetSourceId: body.targetSourceId,
    confirmToken: body.confirmToken,
    overwrite: Boolean(body.overwrite),
  }))
}

async function readJson(request, maxBytes = 256 * 1024) {
  const text = await request.text()
  if (Buffer.byteLength(text, 'utf8') > maxBytes) throw apiError('fishkeeper/bad-request', 'Request body is too large.')
  if (!text.trim()) return {}
  try {
    const data = JSON.parse(text)
    return data && typeof data === 'object' ? data : {}
  } catch {
    throw apiError('fishkeeper/bad-request', 'Request body is not valid JSON.')
  }
}

function jsonResponse(value, status = 200) {
  return new Response(`${JSON.stringify(value)}\n`, {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function errorResponse(error) {
  const code = error?.code ?? 'fishkeeper/internal'
  const status = statusFor(code)
  return jsonResponse({
    error: {
      code,
      message: error?.message ?? 'Internal error.',
      details: error?.details,
    },
  }, status)
}

function statusFor(code) {
  if (code.endsWith('/bad-request')) return 400
  if (code.endsWith('/not-found') || code.endsWith('/entry-not-found')) return 404
  if (code.endsWith('/confirm-invalid') || code.endsWith('/lock-held') || code.endsWith('/restore-stale') || code.endsWith('/restore-unsupported') || code.endsWith('/checkpoints-unsupported')) return 409
  if (code.endsWith('/import-overwrite-required') || code.endsWith('/config-unavailable')) return 409
  if (code.endsWith('/source-timeout')) return 504
  if (code.endsWith('/source-unauthorized')) return 502
  if (code.endsWith('/config-invalid') || code.endsWith('/source-invalid') || code.endsWith('/import-unsafe') || code.endsWith('/import-incompatible') || code.endsWith('/import-corrupt')) return 422
  return 500
}

function apiError(code, message, details) {
  const error = new Error(message)
  error.code = code
  error.details = details
  return error
}
