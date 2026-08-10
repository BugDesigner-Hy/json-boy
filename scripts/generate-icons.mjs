import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { itemIconUrl } from '../src/assets/animal-icons.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '..', 'public', 'icons')
const SETTINGS_ICON_URL = itemIconUrl(469)

async function generate() {
  mkdirSync(iconsDir, { recursive: true })

  const response = await fetch(SETTINGS_ICON_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch settings icon: HTTP ${response.status}`)
  }
  const sourceBuffer = Buffer.from(await response.arrayBuffer())

  for (const size of [16, 48, 128]) {
    const png = await sharp(sourceBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer()
    writeFileSync(join(iconsDir, `icon${size}.png`), png)
    console.log(`Generated icon${size}.png from item-469 (settings icon)`)
  }

  console.log('All extension icons generated.')
}

generate().catch((error) => {
  console.error(error)
  process.exit(1)
})
