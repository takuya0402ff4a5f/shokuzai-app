// PWAアイコン生成スクリプト（外部パッケージ不要）
// 実行: node generate-icons.mjs

import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'

function uint32BE(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n)
  return b
}

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const byte of buf) {
    crc = crc ^ byte
    for (let i = 0; i < 8; i++) {
      crc = (crc & 1) ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1
    }
  }
  const out = Buffer.alloc(4)
  out.writeUInt32BE((crc ^ 0xFFFFFFFF) >>> 0)
  return out
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  return Buffer.concat([uint32BE(data.length), t, data, crc32(Buffer.concat([t, data]))])
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2  // 8bit RGB

  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)
  for (let y = 0; y < size; y++) {
    const base = y * rowSize
    raw[base] = 0  // filter: None
    for (let x = 0; x < size; x++) {
      const i = base + 1 + x * 3
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public', { recursive: true })
// オレンジ #f39800 = rgb(243, 152, 0)
writeFileSync('public/icon-192.png', createPNG(192, 0xf3, 0x98, 0x00))
writeFileSync('public/icon-512.png', createPNG(512, 0xf3, 0x98, 0x00))
console.log('完了: public/icon-192.png, public/icon-512.png')
