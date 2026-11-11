import { createHash, randomBytes } from 'node:crypto'
import { createReadStream, promises as fsp } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { homedir } from 'node:os'
import { gzipSync, gunzipSync } from 'node:zlib'

export const POSIX = process.platform !== 'win32'

export function nowIso() {
  return new Date().toISOString()
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(5).toString('hex')}`
}

export function sleep(ms) {
  return new Promise(resolvePromise => setTimeout(resolvePromise, ms))
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function defaultDataRoot() {
  return join(homedir(), '.dsh', 'fishkeeper')
}

export async function ensureDir(dir, mode = 0o700) {
  await fsp.mkdir(dir, { recursive: true, mode })
  if (POSIX) {
    try {
      await fsp.chmod(dir, mode)
    } catch {
      // Permission repair is best effort; the caller reports it separately.
    }
  }
}

export async function statSafe(path) {
  try {
    return await fsp.stat(path)
  } catch (error) {
    if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) return undefined
    throw error
  }
}

export async function readJsonFile(path, fallback) {
  try {
    const text = await fsp.readFile(path, 'utf8')
    return JSON.parse(text)
  } catch (error) {
    if (error && error.code === 'ENOENT') return fallback
    throw error
  }
}

export async function readJsonSafe(path) {
  try {
    return JSON.parse(await fsp.readFile(path, 'utf8'))
  } catch {
    return undefined
  }
}

export async function atomicWriteBuffer(path, buffer, mode = 0o600) {
  await ensureDir(dirname(path))
  const safeMode = mode & 0o777
  const temp = `${path}.tmp-${process.pid}-${randomBytes(4).toString('hex')}`
  await fsp.writeFile(temp, buffer, { mode: safeMode })
  try {
    if (POSIX) await fsp.chmod(temp, safeMode)
  } catch {
    // Windows has no meaningful file mode.
  }
  try {
    await fsp.rename(temp, path)
  } catch (error) {
    await fsp.rm(temp, { force: true })
    throw error
  }
}

export async function atomicWriteText(path, text, mode = 0o600) {
  await atomicWriteBuffer(path, Buffer.from(text, 'utf8'), mode)
}

export async function atomicWriteJson(path, value, mode = 0o600) {
  await atomicWriteText(path, `${JSON.stringify(value, null, 2)}\n`, mode)
}

export async function appendJsonl(path, value) {
  await ensureDir(dirname(path))
  await fsp.appendFile(path, `${JSON.stringify(value)}\n`, { encoding: 'utf8', mode: 0o600 })
}

export async function readJsonl(path, maxBytes = 64 * 1024 * 1024) {
  let stat
  try {
    stat = await fsp.stat(path)
  } catch (error) {
    if (error && error.code === 'ENOENT') return { items: [], errors: 0, bytes: 0, truncated: false }
    throw error
  }
  if (stat.size > maxBytes) {
    return { items: [], errors: 0, bytes: stat.size, truncated: true }
  }
  const text = await fsp.readFile(path, 'utf8')
  const items = []
  let errors = 0
  for (const line of text.split(/\r?\n/u)) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try {
      items.push(JSON.parse(trimmed))
    } catch {
      errors += 1
    }
  }
  return { items, errors, bytes: stat.size, truncated: false }
}

export async function readTextBounded(path, maxBytes) {
  const stat = await fsp.stat(path)
  if (stat.size > maxBytes) return { text: undefined, bytes: stat.size, truncated: true }
  return { text: await fsp.readFile(path, 'utf8'), bytes: stat.size, truncated: false }
}

export function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export async function sha256File(path) {
  return await new Promise((resolvePromise, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(path)
    stream.on('error', reject)
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolvePromise(hash.digest('hex')))
  })
}

export async function readFileBounded(path, maxBytes) {
  const stat = await fsp.stat(path)
  if (stat.size > maxBytes) return { buffer: undefined, bytes: stat.size, truncated: true }
  return { buffer: await fsp.readFile(path), bytes: stat.size, truncated: false }
}

export function gzipBuffer(buffer) {
  return gzipSync(buffer, { level: 6 })
}

export function gunzipBuffer(buffer) {
  return gunzipSync(buffer)
}

export function pathIsWithin(root, candidate) {
  const relativePath = relative(resolve(root), resolve(candidate))
  return relativePath === '' || (!relativePath.startsWith('..') && !relativePath.startsWith(`..${sep}`))
}

export function toPosixPath(path) {
  return path.split(sep).join('/')
}

export function safeRelativePath(path) {
  if (typeof path !== 'string' || path.includes('\0')) throw new Error('invalid path')
  const normalized = path.replace(/\\/gu, '/')
  if (normalized.startsWith('/') || /^[A-Za-z]:/u.test(normalized)) throw new Error('absolute path')
  const parts = normalized.split('/')
  if (parts.some(part => part === '..' || part === '' || part === '.')) throw new Error('unsafe path')
  return parts.join('/')
}

export async function resolveWithin(root, relPath) {
  const safe = safeRelativePath(relPath)
  const absolute = resolve(root, safe)
  if (!pathIsWithin(root, absolute)) throw new Error('path escapes source root')
  const realRoot = await realpathNearestExisting(root)
  const realTarget = await realpathNearestExisting(absolute)
  if (realTarget !== realRoot && !realTarget.startsWith(`${realRoot}${sep}`)) {
    throw new Error('path escapes source root through a symbolic link')
  }
  return realTarget
}

async function realpathNearestExisting(path) {
  try {
    return await fsp.realpath(path)
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      const parent = dirname(path)
      if (parent === path) throw error
      return join(await realpathNearestExisting(parent), basename(path))
    }
    throw error
  }
}

export async function listMatchingFiles(root, pattern) {
  const normalized = String(pattern).replace(/\\/gu, '/')
  if (!normalized.includes('*')) {
    const absolute = await resolveWithin(root, normalized)
    const stat = await statSafe(absolute)
    return stat && stat.isFile() ? [normalized] : []
  }
  const slash = normalized.lastIndexOf('/')
  const dirPart = slash === -1 ? '' : normalized.slice(0, slash)
  const filePattern = slash === -1 ? normalized : normalized.slice(slash + 1)
  const absDir = dirPart === '' ? root : await resolveWithin(root, dirPart)
  let entries
  try {
    entries = await fsp.readdir(absDir, { withFileTypes: true })
  } catch {
    return []
  }
  const regex = new RegExp(`^${filePattern.split('*').map(escapeRegex).join('.*')}$`, 'u')
  return entries
    .filter(entry => entry.isFile() && regex.test(entry.name))
    .map(entry => (dirPart === '' ? entry.name : `${dirPart}/${entry.name}`))
    .sort()
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

export async function fileSizeSum(paths) {
  let total = 0
  for (const path of paths) {
    try {
      total += (await fsp.stat(path)).size
    } catch {
      // Missing files contribute zero.
    }
  }
  return total
}

export function isLoopbackUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  if (url.username || url.password) return false
  const host = url.hostname.toLowerCase()
  if (host === 'localhost') return true
  if (host === '::1' || host === '[::1]') return true
  if (/^127\./u.test(host)) return true
  return false
}

export function parseTime(value) {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^\d+$/u.test(trimmed)) return parseTime(Number(trimmed))
    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  return undefined
}

export function firstDefined(object, keys) {
  if (!object || typeof object !== 'object') return undefined
  for (const key of keys) {
    const value = object[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

export function modeString(mode) {
  if (typeof mode !== 'number') return undefined
  return (mode & 0o777).toString(8).padStart(4, '0')
}

export function unifiedDiff(before, after, path = 'file', maxLines = 600) {
  let a = String(before ?? '').split(/\r?\n/u)
  let b = String(after ?? '').split(/\r?\n/u)
  if (a.length > 4000 || b.length > 4000) {
    return {
      text: `--- a/${path}\n+++ b/${path}\n@@ file too large for line diff @@\n`,
      added: 0,
      removed: 0,
    }
  }
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1
  let suffix = 0
  while (
    suffix < a.length - prefix
    && suffix < b.length - prefix
    && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) suffix += 1
  const aChanged = a.slice(prefix, a.length - suffix)
  const bChanged = b.slice(prefix, b.length - suffix)
  if (aChanged.length === 0 && bChanged.length === 0) {
    return { text: '', added: 0, removed: 0 }
  }
  const start = prefix + 1
  const lines = [`--- a/${path}`, `+++ b/${path}`, `@@ -${start},${aChanged.length} +${start},${bChanged.length} @@`]
  let added = 0
  let removed = 0
  for (const line of aChanged.slice(0, maxLines)) {
    lines.push(`-${line}`)
    removed += 1
  }
  for (const line of bChanged.slice(0, maxLines)) {
    lines.push(`+${line}`)
    added += 1
  }
  if (aChanged.length > maxLines || bChanged.length > maxLines) lines.push('@@ diff truncated @@')
  return { text: `${lines.join('\n')}\n`, added, removed }
}

export async function withTimeout(promise, ms, label = 'operation') {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

export function errorCode(error) {
  if (error && typeof error === 'object' && typeof error.code === 'string') return error.code
  return 'fishkeeper/internal'
}

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
