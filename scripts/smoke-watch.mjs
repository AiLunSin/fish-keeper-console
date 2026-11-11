import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'
import { ConsoleRuntime } from '../lib/runtime.js'

const workspace = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1')
const temp = join(tmpdir(), `fishkeeper-watch-${randomBytes(4).toString('hex')}`)
await fsp.mkdir(temp, { recursive: true })
const sourceRoot = join(temp, 'fish-a')
await fsp.cp(join(workspace, 'demo', 'fish-a'), sourceRoot, { recursive: true })
const dataRoot = join(temp, 'data')
const runtime = new ConsoleRuntime({ logger: console, get: () => undefined }, {
  dataRoot,
  sources: [{ id: 'a', displayName: 'Aurora', adapter: 'file', location: sourceRoot, enabled: true, options: {} }],
})
await runtime.start()
const before = runtime.checkpoints('a').items.length
const diary = join(sourceRoot, 'diary', '2026-11-11.jsonl')
const original = await fsp.readFile(diary, 'utf8')
await fsp.appendFile(diary, `${JSON.stringify({ id: 'd-auto', ts: new Date().toISOString(), content: '自动检查点测试', visibility: 'private' })}\n`)
let after = runtime.checkpoints('a')
for (let attempt = 0; attempt < 30 && after.items.length <= before; attempt += 1) {
  await new Promise(resolve => setTimeout(resolve, 600))
  after = runtime.checkpoints('a')
}
assert.ok(after.items.length > before, `checkpoint count ${before} -> ${after.items.length}`)
const auto = after.items.find(item => item.trigger === 'diary')
assert.ok(auto, 'diary checkpoint discovered')
const detail = runtime.checkpointDetail(auto.id)
assert.ok(detail.manifest.files.some(file => file.path === 'diary/2026-11-11.jsonl' && file.before))
const plan = await runtime.restoreDryRun(auto.id)
assert.ok(plan.confirmToken)
await runtime.restoreExecute({ id: auto.id, files: [ 'diary/2026-11-11.jsonl' ], confirmToken: plan.confirmToken })
const restored = await fsp.readFile(diary, 'utf8')
assert.equal(restored, original)
await runtime.dispose()
await fsp.rm(temp, { recursive: true, force: true })
console.log(JSON.stringify({ before, after: after.items.length, trigger: auto.trigger, restored: true }, null, 2))
