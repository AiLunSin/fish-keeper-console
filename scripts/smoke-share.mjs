import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'
import { ConsoleRuntime } from '../lib/runtime.js'
import { readZip } from '../lib/zip.js'

const workspace = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1')
const temp = join(tmpdir(), `fishkeeper-share-${randomBytes(4).toString('hex')}`)
await fsp.mkdir(temp, { recursive: true })
const sourceRoot = join(temp, 'fish-a')
await fsp.cp(join(workspace, 'demo', 'fish-a'), sourceRoot, { recursive: true })
const runtime = new ConsoleRuntime({ logger: console, get: () => undefined }, {
  dataRoot: join(temp, 'data'),
  sources: [{ id: 'a', displayName: 'Aurora', adapter: 'file', location: sourceRoot, enabled: true, options: {} }],
})
await runtime.start()
const exported = await runtime.exportPackage({ sourceId: 'a', mode: 'share' })
const buffer = await fsp.readFile(exported.path)
const entries = readZip(buffer)
const manifest = JSON.parse(entries.find(entry => entry.name === 'manifest.json').data.toString('utf8'))
assert.equal(manifest.privacy.mode, 'share')
assert.equal(manifest.privacy.includesCredentials, false)
const allText = entries.map(entry => entry.data.toString('utf8')).join('\n')
for (const secret of ['aurora@example.com', '13800138000', 'REDACTED', 'sk-demo-EXAMPLE-ONLY-0000']) {
  assert.equal(allText.includes(secret), false, `share package leaked ${secret}`)
}
assert.ok(allText.includes('payload/summary.json'))
await runtime.dispose()
await fsp.rm(temp, { recursive: true, force: true })
console.log(JSON.stringify({ mode: manifest.privacy.mode, entries: entries.length, leaked: false, bytes: buffer.length }, null, 2))
