import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '..', 'public', 'icons')

function createSVG(size) {
  const r = size * 0.15
  const fontSize = size * 0.38
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="50%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e94560"/>
      <stop offset="100%" style="stop-color:#ff6b6b"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <rect x="${size * 0.15}" y="${size * 0.22}" width="${size * 0.7}" height="${size * 0.56}" rx="${r * 0.6}" fill="url(#accent)" opacity="0.9"/>
  <text x="${size * 0.5}" y="${size * 0.6}" font-family="monospace" font-weight="bold" font-size="${fontSize}" fill="white" text-anchor="middle" dominant-baseline="middle">{}</text>
</svg>`
}

async function generate() {
  for (const size of [16, 48, 128]) {
    const svg = createSVG(size)
    const png = await sharp(Buffer.from(svg)).png().toBuffer()
    writeFileSync(join(iconsDir, `icon${size}.png`), png)
    console.log(`Generated icon${size}.png`)
  }
  console.log('All icons generated.')
}

generate().catch(console.error)
