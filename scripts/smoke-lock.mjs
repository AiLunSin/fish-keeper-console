import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'
import { ConsoleRuntime } from '../lib/runtime.js'

const workspace = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1')
const temp = join(tmpdir(), `fishkeeper-lock-${randomBytes(4).toString('hex')}`)
await fsp.mkdir(temp, { recursive: true })
const sourceRoot = join(temp, 'fish-a')
await fsp.cp(join(workspace, 'demo', 'fish-a'), sourceRoot, { recursive: true })
const dataRoot = join(temp, 'data')
const config = {
  dataRoot,
  sources: [{ id: 'a', displayName: 'Aurora', adapter: 'file', location: sourceRoot, enabled: true, options: {} }],
}
const ctx = { logger: console, get: () => undefined }
const first = new ConsoleRuntime(ctx, config)
await first.start()
const second = new ConsoleRuntime(ctx, config)
await second.start()
const overview = await second.overview()
assert.equal(overview.sources[0].readOnly, true)
await assert.rejects(() => second.createCheckpoint('a'), error => error.code === 'fishkeeper/lock-held')
assert.equal(first.checkpoints('a').readOnly, false)
await first.dispose()
await second.dispose()
await fsp.rm(temp, { recursive: true, force: true })
console.log(JSON.stringify({ firstMode: 'writer', secondReadOnly: true, secondWriteDenied: true }, null, 2))
