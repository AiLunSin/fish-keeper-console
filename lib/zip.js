import { inflateRawSync } from 'node:zlib'

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[index] = value >>> 0
  }
  return table
})()

export function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear())
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  return { dosDate, dosTime }
}

export function writeZip(entries, date = new Date()) {
  const { dosDate, dosTime } = dosDateTime(date)
  const locals = []
  const centrals = []
  let offset = 0
  const seen = new Set()
  for (const entry of entries) {
    const name = validateZipName(entry.name)
    if (seen.has(name)) throw new Error(`duplicate ZIP entry: ${name}`)
    seen.add(name)
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data)
    const nameBuffer = Buffer.from(name, 'utf8')
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(0, 8)
    local.writeUInt16LE(dosTime, 10)
    local.writeUInt16LE(dosDate, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuffer.length, 26)
    local.writeUInt16LE(0, 28)
    locals.push(local, nameBuffer, data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(0, 10)
    central.writeUInt16LE(dosTime, 12)
    central.writeUInt16LE(dosDate, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(nameBuffer.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, nameBuffer)
    offset += local.length + nameBuffer.length + data.length
  }
  const centralBuffer = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBuffer.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)
  return Buffer.concat([...locals, centralBuffer, end])
}

export function readZip(buffer, limits = {}) {
  const maxEntries = limits.maxEntries ?? 5000
  const maxEntryBytes = limits.maxEntryBytes ?? 128 * 1024 * 1024
  const maxTotalBytes = limits.maxTotalBytes ?? 512 * 1024 * 1024
  const data = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
  const eocd = findEocd(data)
  if (!eocd) throw zipError('fishkeeper/import-corrupt', 'ZIP end of central directory not found.')
  const count = data.readUInt16LE(eocd + 10)
  const centralSize = data.readUInt32LE(eocd + 12)
  const centralOffset = data.readUInt32LE(eocd + 16)
  if (count > maxEntries) throw zipError('fishkeeper/import-unsafe', `ZIP has too many entries (${count}).`)
  if (centralOffset + centralSize > data.length) throw zipError('fishkeeper/import-corrupt', 'ZIP central directory is out of bounds.')
  const entries = []
  let cursor = centralOffset
  let total = 0
  for (let index = 0; index < count; index += 1) {
    if (data.readUInt32LE(cursor) !== 0x02014b50) throw zipError('fishkeeper/import-corrupt', 'Malformed ZIP central directory.')
    const method = data.readUInt16LE(cursor + 10)
    const crc = data.readUInt32LE(cursor + 16)
    const compressedSize = data.readUInt32LE(cursor + 20)
    const uncompressedSize = data.readUInt32LE(cursor + 24)
    const nameLength = data.readUInt16LE(cursor + 28)
    const extraLength = data.readUInt16LE(cursor + 30)
    const commentLength = data.readUInt16LE(cursor + 32)
    const localOffset = data.readUInt32LE(cursor + 42)
    const name = data.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8')
    cursor += 46 + nameLength + extraLength + commentLength
    const safeName = validateZipName(name)
    if (name.endsWith('/')) continue
    if (uncompressedSize > maxEntryBytes) throw zipError('fishkeeper/import-unsafe', `ZIP entry is too large: ${name}`)
    total += uncompressedSize
    if (total > maxTotalBytes) throw zipError('fishkeeper/import-unsafe', 'ZIP expands beyond the size limit.')
    if (data.readUInt32LE(localOffset) !== 0x04034b50) throw zipError('fishkeeper/import-corrupt', `Malformed ZIP local header: ${name}`)
    const localNameLength = data.readUInt16LE(localOffset + 26)
    const localExtraLength = data.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + localNameLength + localExtraLength
    const compressed = data.subarray(dataStart, dataStart + compressedSize)
    let content
    if (method === 0) content = Buffer.from(compressed)
    else if (method === 8) content = inflateRawSync(compressed, { maxOutputLength: maxEntryBytes })
    else throw zipError('fishkeeper/import-unsafe', `Unsupported ZIP compression method ${method}: ${name}`)
    if (content.length !== uncompressedSize) throw zipError('fishkeeper/import-corrupt', `ZIP entry size mismatch: ${name}`)
    if (crc32(content) !== crc) throw zipError('fishkeeper/import-corrupt', `ZIP checksum mismatch: ${name}`)
    entries.push({ name: safeName, data: content })
  }
  return entries
}

function findEocd(data) {
  const minimum = Math.max(0, data.length - 65_557)
  for (let offset = data.length - 22; offset >= minimum; offset -= 1) {
    if (data.readUInt32LE(offset) === 0x06054b50) return offset
  }
  return undefined
}

export function validateZipName(name) {
  const value = String(name ?? '').replace(/\\/gu, '/')
  if (value === '' || value.includes('\0')) throw zipError('fishkeeper/import-unsafe', 'ZIP entry has an empty or NUL name.')
  if (value.startsWith('/') || /^[A-Za-z]:/u.test(value)) throw zipError('fishkeeper/import-unsafe', `ZIP entry is absolute: ${value}`)
  if (/[:*?"<>|]/u.test(value)) throw zipError('fishkeeper/import-unsafe', `ZIP entry contains a reserved character: ${value}`)
  const parts = value.split('/')
  if (parts.some(part => part === '..' || part === '.' || part === '')) {
    if (!value.endsWith('/')) throw zipError('fishkeeper/import-unsafe', `ZIP entry escapes the package: ${value}`)
  }
  if (/^con|^prn|^aux|^nul|^com[1-9]|^lpt[1-9]/iu.test(parts.at(-1) ?? '')) {
    throw zipError('fishkeeper/import-unsafe', `ZIP entry uses a reserved Windows name: ${value}`)
  }
  return value
}

function zipError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}
