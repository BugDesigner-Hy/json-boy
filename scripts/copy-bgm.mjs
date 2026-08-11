import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const downloads = path.join(process.env.USERPROFILE || '', 'Downloads')
const outDir = path.join(__dirname, '../public/audio')
const outFile = path.join(outDir, 'bgm.mp3')

const candidates = ['bg.mp3', 'bgm.mp3', 'bg,mp3', 'BG.mp3', 'BGM.mp3']

export function copyBgmFromDownloads() {
  fs.mkdirSync(outDir, { recursive: true })

  let source = null
  for (const name of candidates) {
    const full = path.join(downloads, name)
    if (fs.existsSync(full)) {
      source = full
      break
    }
  }

  if (!source && fs.existsSync(downloads)) {
    const match = fs.readdirSync(downloads).find((f) => /\.mp3$/i.test(f) && /^bg/i.test(f))
    if (match) source = path.join(downloads, match)
  }

  if (!source) {
    throw new Error(`No bg/bgm mp3 found in ${downloads}`)
  }

  fs.copyFileSync(source, outFile)
  const bytes = fs.statSync(outFile).size
  console.log(`[copy-bgm] ${source} -> ${outFile} (${bytes} bytes)`)
  return { source, outFile, bytes }
}

export function copyBgmPlugin() {
  return {
    name: 'copy-bgm',
    buildStart() {
      copyBgmFromDownloads()
    },
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('copy-bgm.mjs')) {
  copyBgmFromDownloads()
}
