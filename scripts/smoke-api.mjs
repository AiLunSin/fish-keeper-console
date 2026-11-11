import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'
import { apply } from '../lib/index.js'

const workspace = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1')
const temp = join(tmpdir(), `fishkeeper-api-${randomBytes(4).toString('hex')}`)
await fsp.mkdir(temp, { recursive: true })
const a = join(temp, 'fish-a')
const b = join(temp, 'fish-b')
await fsp.cp(join(workspace, 'demo', 'fish-a'), a, { recursive: true })
await fsp.cp(join(workspace, 'demo', 'fish-b'), b, { recursive: true })
const dataRoot = join(temp, 'data')
const routes = new Map()
const disposers = []
const ctx = {
  logger: console,
  get: () => undefined,
  effect(factory) {
    const disposer = factory()
    if (typeof disposer === 'function') disposers.push(disposer)
    return disposer
  },
  connection: {
    fetch: {
      register(route) {
        routes.set(route.path, route)
        return async () => { routes.delete(route.path) }
      },
    },
  },
}
apply(ctx, {
  dataRoot,
  sources: [
    { id: 'a', displayName: 'Aurora', adapter: 'file', location: a, enabled: true, options: {} },
    { id: 'b', displayName: 'Mira', adapter: 'file', location: b, enabled: true, options: {} },
  ],
})

async function call(path, init) {
  const route = routes.get(new URL(`http://local${path}`).pathname)
  assert.ok(route, `route registered: ${path}`)
  const response = await route.fetch(new Request(`http://local${path}`, init))
  const data = await response.json()
  return { status: response.status, data }
}

await new Promise(resolve => setTimeout(resolve, 800))
const overview = await call('/api/fishkeeper/overview')
assert.equal(overview.status, 200)
assert.equal(overview.data.sources.length, 2)
const timeline = await call('/api/fishkeeper/timeline?limit=10')
assert.equal(timeline.status, 200)
assert.ok(timeline.data.items.length > 0)
const checkpoints = await call('/api/fishkeeper/checkpoints?source=a')
assert.equal(checkpoints.status, 200)
assert.ok(checkpoints.data.items.length > 0)
const created = await call('/api/fishkeeper/checkpoint/create', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ sourceId: 'a' }),
})
assert.equal(created.status, 200)
const exported = await call('/api/fishkeeper/export', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ sourceId: 'a', mode: 'full', includeCheckpoints: true }),
})
assert.equal(exported.status, 200)
const preflight = await call('/api/fishkeeper/import/preflight', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ path: exported.data.path }),
})
assert.equal(preflight.status, 200)
assert.equal(preflight.data.verdict, 'ok')
for (const disposer of disposers.reverse()) await disposer()
await fsp.rm(temp, { recursive: true, force: true })
console.log(JSON.stringify({
  routes: [...routes.keys()],
  overview: overview.data.sources.map(source => source.status),
  timeline: timeline.data.items.length,
  checkpoints: checkpoints.data.items.length,
  checkpoint: created.data.checkpoint.id,
  exportBytes: exported.data.bytes,
  preflight: preflight.data.verdict,
}, null, 2))
