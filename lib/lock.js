import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { ensureDir, statSafe } from './util.js'

const STALE_MS = 90_000
const HEARTBEAT_MS = 10_000

export async function acquireSourceLock(dataRoot, sourceId) {
  const locksDir = join(dataRoot, 'locks')
  await ensureDir(locksDir)
  const path = join(locksDir, `${sourceId}.lock`)
  const instanceId = `inst_${randomBytes(6).toString('hex')}`
  const payload = {
    schemaVersion: 1,
    sourceId,
    instanceId,
    pid: process.pid,
    hostname: process.env.COMPUTERNAME ?? process.env.HOSTNAME ?? 'unknown',
    startedAt: new Date().toISOString(),
  }

  const acquired = await tryAcquire(path, payload)
  if (!acquired) {
    const stat = await statSafe(path)
    if (stat && Date.now() - stat.mtimeMs > STALE_MS) {
      const takeover = `${path}.takeover`
      let guard
      try {
        guard = await fsp.open(takeover, 'wx', 0o600)
      } catch (error) {
        if (error && error.code === 'EEXIST') return { acquired: false, path, instanceId }
        throw error
      }
      try {
        await guard.writeFile(`${JSON.stringify(payload)}\n`, 'utf8')
        const current = await statSafe(path)
        if (current && Date.now() - current.mtimeMs > STALE_MS) {
          try {
            await fsp.unlink(path)
          } catch {
            // Another instance may have taken over between the stat and unlink.
          }
          if (await tryAcquire(path, payload)) return makeLock(path, instanceId)
        }
      } finally {
        await guard.close().catch(() => {})
        await fsp.unlink(takeover).catch(() => {})
      }
    }
    return { acquired: false, path, instanceId }
  }
  return makeLock(path, instanceId)
}

async function tryAcquire(path, payload) {
  try {
    const handle = await fsp.open(path, 'wx', 0o600)
    try {
      await handle.writeFile(`${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    } finally {
      await handle.close()
    }
    return true
  } catch (error) {
    if (error && error.code === 'EEXIST') return false
    throw error
  }
}

function makeLock(path, instanceId) {
  let heartbeat
  try {
    heartbeat = setInterval(() => {
      const now = new Date()
      void fsp.utimes(path, now, now).catch(() => {})
    }, HEARTBEAT_MS)
    if (typeof heartbeat.unref === 'function') heartbeat.unref()
  } catch {
    heartbeat = undefined
  }
  return {
    acquired: true,
    path,
    instanceId,
    async release() {
      if (heartbeat) clearInterval(heartbeat)
      try {
        const raw = await fsp.readFile(path, 'utf8')
        const parsed = JSON.parse(raw)
        if (parsed.instanceId === instanceId) await fsp.unlink(path)
      } catch {
        // A missing or replaced lock is not ours to remove.
      }
    },
  }
}
