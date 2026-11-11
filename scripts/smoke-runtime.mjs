import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'
import { ConsoleRuntime } from '../lib/runtime.js'

const workspace = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1')
const temp = join(tmpdir(), `fishkeeper-runtime-${randomBytes(4).toString('hex')}`)
await fsp.mkdir(temp, { recursive: true })
const a = join(temp, 'fish-a')
const b = join(temp, 'fish-b')
await fsp.cp(join(workspace, 'demo', 'fish-a'), a, { recursive: true })
await fsp.cp(join(workspace, 'demo', 'fish-b'), b, { recursive: true })
const dataRoot = join(temp, 'data')
const ctx = { logger: console, get: () => undefined }
const runtime = new ConsoleRuntime(ctx, {
  dataRoot,
  sources: [
    { id: 'a', displayName: 'Aurora', adapter: 'file', location: a, enabled: true, options: {} },
    { id: 'b', displayName: 'Mira', adapter: 'file', location: b, enabled: true, options: {} },
  ],
})
await runtime.start()
const overview = await runtime.overview()
assert.equal(overview.sources.length, 2)
assert.equal(overview.sources[0].status, 'ok')
assert.equal(overview.sources[0].capabilities?.checkpoint, true)
const timeline = await runtime.timeline({ limit: 50 })
assert.ok(timeline.items.length >= 8)
assert.ok(timeline.items.some(item => item.hits.length > 0))
const checkpoints = runtime.checkpoints('a')
assert.ok(checkpoints.items.length >= 1)
const manual = await runtime.createCheckpoint('a')
assert.ok(manual.checkpoint.id)
const detail = runtime.checkpointDetail(manual.checkpoint.id)
assert.ok(detail.manifest)
const exported = await runtime.exportPackage({ sourceId: 'a', mode: 'full', includeCheckpoints: true })
assert.ok(exported.path.endsWith('.fishkeeper'))
const preflight = await runtime.preflightImport(exported.path)
assert.equal(preflight.verdict, 'ok')
const imported = await runtime.importPackage(exported.path)
assert.equal(imported.ok, true)
const doctor = await runtime.doctor()
assert.ok(doctor.checks.length > 3)
await runtime.dispose()
await fsp.rm(temp, { recursive: true, force: true })
console.log(JSON.stringify({
  overview: overview.sources.map(source => ({ id: source.id, status: source.status, diary: source.fish?.latestDiary?.text?.slice(0, 12) })),
  timeline: timeline.items.length,
  risky: timeline.items.filter(item => item.hits.length > 0).length,
  checkpoint: manual.checkpoint.id,
  exportBytes: exported.bytes,
  preflight: preflight.verdict,
  importPath: imported.importedPath,
  doctor: doctor.overall,
}, null, 2))
