import { promises as fsp } from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'
import { ConsoleRuntime } from '../lib/runtime.js'
import { createAdapter } from '../lib/sources.js'

const workspace = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1')
const temp = join(tmpdir(), `fishkeeper-fishtank-${randomBytes(4).toString('hex')}`)
await fsp.mkdir(temp, { recursive: true })
const sourceRoot = join(temp, 'source')
const targetRoot = join(temp, 'target')
await fsp.cp(join(workspace, 'demo', 'fishtank'), sourceRoot, { recursive: true })
await fsp.cp(join(workspace, 'demo', 'fishtank'), targetRoot, { recursive: true })

const credentials = {
  async readRecord(key) {
    if (key !== 'fish/gateway') return undefined
    return { kind: 'api-key', key: 'secret-token' }
  },
}
const ctx = {
  logger: console,
  fiber: { entry: { id: 'test-entry' } },
  get: name => {
    if (name === 'credentials') return credentials
    if (name === 'configEditor') return { async edit() {} }
    return undefined
  },
}
const runtime = new ConsoleRuntime(ctx, {
  dataRoot: join(temp, 'data'),
  sources: [
    { id: 'tank', displayName: '目标鱼', adapter: 'file', location: sourceRoot, enabled: true, options: { preset: 'fishtank' } },
    { id: 'tank-copy', displayName: '目标鱼副本', adapter: 'file', location: targetRoot, enabled: true, options: { preset: 'fishtank' } },
  ],
})
await runtime.start()

const overview = await runtime.overview()
const tank = overview.sources.find(source => source.id === 'tank')
assert.equal(tank.status, 'ok')
assert.equal(tank.fish.mood, '安静')
assert.equal(tank.fish.energy, 0.64)
assert.equal(tank.fish.latestDiary.text, '我梦到水面外面还有一层水面。')
assert.equal(tank.fish.latestWhisper.text, '晚安。我把尾巴收起来了。')
const tankInfo = runtime.sourceList().find(source => source.id === 'tank')
assert.equal(tankInfo.capabilities.import, true)
assert.equal(tankInfo.preset, 'fishtank')

const timeline = await runtime.timeline({ limit: 50 })
const diary = timeline.items.filter(item => item.sourceId === 'tank' && item.kind === 'diary')
assert.equal(diary.length, 4)
assert.ok(diary.every(item => item.visibility === 'private'))

const checkpoint = await runtime.createCheckpoint('tank')
assert.ok(checkpoint.checkpoint.id)

const exported = await runtime.exportPackage({ sourceId: 'tank', mode: 'full', includeCheckpoints: false })
const writePlan = await runtime.preflightImport({ path: exported.path, mode: 'write', targetSourceId: 'tank-copy' })
assert.equal(writePlan.verdict, 'ok')
assert.equal(writePlan.plan.target.identity, 'match')
assert.equal(writePlan.plan.target.overwrite, true)
assert.ok(writePlan.confirmToken)

await assert.rejects(
  () => runtime.importPackage({ path: exported.path, mode: 'write', targetSourceId: 'tank-copy' }),
  error => error.code === 'fishkeeper/confirm-invalid',
)
await assert.rejects(
  () => runtime.importPackage({ path: exported.path, mode: 'write', targetSourceId: 'tank-copy', confirmToken: writePlan.confirmToken }),
  error => error.code === 'fishkeeper/import-overwrite-required',
)

const retryPlan = await runtime.preflightImport({ path: exported.path, mode: 'write', targetSourceId: 'tank-copy' })
const written = await runtime.importPackage({
  path: exported.path,
  mode: 'write',
  targetSourceId: 'tank-copy',
  confirmToken: retryPlan.confirmToken,
  overwrite: true,
})
assert.equal(written.ok, true)
assert.equal(written.mode, 'write')
assert.equal(written.identity, 'match')
assert.equal(written.reloadRequired, true)
assert.ok(written.backupPath)
await fsp.access(join(written.backupPath, 'fish.json'))
const writtenState = JSON.parse(await fsp.readFile(join(targetRoot, 'fish.json'), 'utf8'))
assert.equal(writtenState.mood, '安静')

const otherRoot = join(temp, 'other')
await fsp.mkdir(otherRoot, { recursive: true })
await fsp.writeFile(join(otherRoot, 'fish.json'), JSON.stringify({ v: 1, createdAt: 1, mood: '别的鱼', energy: 0.2, diary: [] }))
await runtime.dispose()

const mismatched = new ConsoleRuntime(ctx, {
  dataRoot: join(temp, 'data2'),
  sources: [
    { id: 'tank', displayName: '目标鱼', adapter: 'file', location: sourceRoot, enabled: true, options: { preset: 'fishtank' } },
    { id: 'other', displayName: '别的鱼', adapter: 'file', location: otherRoot, enabled: true, options: { preset: 'fishtank' } },
  ],
})
await mismatched.start()
const mismatchPlan = await mismatched.preflightImport({ path: exported.path, mode: 'write', targetSourceId: 'other' })
assert.equal(mismatchPlan.verdict, 'blocked')
assert.ok(mismatchPlan.findings.some(finding => finding.code === 'target-identity-mismatch'))

const saved = await mismatched.saveSources({
  sources: [
    { id: 'tank', displayName: '目标鱼', adapter: 'file', location: sourceRoot, enabled: true, options: { preset: 'fishtank' } },
  ],
})
assert.equal(saved.reloading, true)
await assert.rejects(
  () => mismatched.saveSources({ sources: [{ id: 'bad id', displayName: 'x', adapter: 'file', location: 'y' }] }),
  error => error.code === 'fishkeeper/config-invalid',
)
await mismatched.dispose()

const server = createServer((request, response) => {
  if (request.headers.authorization !== 'Bearer secret-token') {
    response.writeHead(401, { 'content-type': 'application/json' })
    response.end('{"error":"unauthorized"}')
    return
  }
  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(JSON.stringify({ mood: '清醒', energy: 0.5, diary: [{ date: '2026-11-11', text: 'HTTP 日记' }] }))
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const port = server.address().port
const httpSource = {
  id: 'http',
  displayName: 'HTTP 鱼',
  adapter: 'http',
  location: `http://127.0.0.1:${port}`,
  options: { statusPath: '/state', diaryPath: '/state', eventsPath: '/events', credentialKey: 'fish/gateway', requireCredentials: true },
}
const authorized = await createAdapter(httpSource, {}, { credentials })
const status = await authorized.readStatus()
assert.equal(status.mood, '清醒')
const httpDiary = await authorized.readDiary()
assert.equal(httpDiary.items[0].text, 'HTTP 日记')

const unauthorized = await createAdapter(httpSource, {}, { credentials: { async readRecord() { return undefined } } })
await assert.rejects(() => unauthorized.readStatus(), error => error.code === 'fishkeeper/source-unauthorized')
server.close()

await fsp.rm(temp, { recursive: true, force: true })
console.log(JSON.stringify({
  mood: tank.fish.mood,
  diary: diary.length,
  timeline: timeline.items.length,
  checkpoint: checkpoint.checkpoint.id,
  writeBack: { files: written.files, identity: written.identity, backup: Boolean(written.backupPath) },
  identityMismatch: mismatchPlan.verdict,
  configValidation: saved.reloading,
  httpAuth: { mood: status.mood, unauthorized: true },
}, null, 2))
