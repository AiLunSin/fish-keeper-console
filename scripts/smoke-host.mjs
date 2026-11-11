import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'
import { createAdapter } from '../lib/sources.js'
import { scanText } from '../lib/rules.js'
import { CheckpointManager } from '../lib/checkpoints.js'

const demo = new URL('../demo/fish-a', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1')
const temp = join(tmpdir(), `fishkeeper-smoke-${randomBytes(4).toString('hex')}`)
await fsp.cp(demo, temp, { recursive: true })

const source = { id: 'demo-a', displayName: 'Aurora', adapter: 'file', location: temp, enabled: true, options: {} }
const adapter = await createAdapter(source)
const description = await adapter.describe()
const status = await adapter.readStatus()
const diary = await adapter.readDiary()
const external = await adapter.readExternalEvents()
assert.equal(description.capabilities.diary, true)
assert.ok(diary.items.length >= 5, `diary entries: ${diary.items.length}`)
assert.ok(diary.items.some(entry => entry.text.includes('aurora@example.com')))
assert.ok(external.items.length >= 3)
assert.ok(status.latestDiary?.text)
const risky = diary.items.find(entry => entry.text.includes('13800138000'))
const scan = scanText(risky.text)
assert.ok(scan.hits.some(hit => hit.ruleId === 'pii.phone_cn'))
assert.ok(scan.hits.some(hit => hit.ruleId === 'secret.api_key'))

const manager = new CheckpointManager({ dataRoot: join(temp, '.console'), source, describe: description, retention: { maxFileBytes: 8 * 1024 * 1024 } })
await manager.init()
await manager.baseline()
const baseline = await manager.ensureBaselineCheckpoint()
assert.ok(baseline)
const diaryPath = join(temp, 'diary', '2026-11-11.jsonl')
const before = await fsp.readFile(diaryPath, 'utf8')
await fsp.appendFile(diaryPath, `${JSON.stringify({ id: 'd-999', ts: '2026-11-11T13:00:00Z', content: 'smoke test entry', visibility: 'private' })}\n`)
const checkpoint = await manager.create({ kind: 'diary' })
assert.ok(checkpoint, 'checkpoint created')
const list = manager.list()
assert.ok(list.length >= 2)
const restored = await manager.restore(checkpoint.id, undefined, { overrideStale: true })
assert.equal(restored.ok, true)
const afterRestore = await fsp.readFile(diaryPath, 'utf8')
assert.equal(afterRestore, before, 'diary restored to pre-change bytes')
await manager.dispose()
await fsp.rm(temp, { recursive: true, force: true })
console.log(JSON.stringify({
  diary: diary.items.length,
  external: external.items.length,
  hits: scan.hits.map(hit => hit.ruleId),
  checkpoints: list.length,
  restored: restored.restored,
}, null, 2))
