import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/img')
const outFile = path.join(outDir, 'home-bear-logo.png')

const sources = [
  {
    label: 'animal-island-vue demo/img/animal_icon.png',
    url: 'https://api.github.com/repos/guokaigdg/animal-island-vue/contents/demo/img/animal_icon.png',
    type: 'github-api',
  },
  {
    label: 'animal-island-ui gh-pages asset',
    url: 'https://guokaigdg.github.io/animal-island-ui/assets/animal_icon-DLUazIlq.png',
    type: 'binary',
  },
]

fs.mkdirSync(outDir, { recursive: true })

async function saveFromGithubApi(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const json = await response.json()
  const data = Buffer.from(String(json.content).replace(/\n/g, ''), 'base64')
  if (data.length < 1024) {
    throw new Error(`too small (${data.length} bytes)`)
  }
  return data
}

async function saveFromBinary(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const data = Buffer.from(await response.arrayBuffer())
  if (data.length < 1024) {
    throw new Error(`too small (${data.length} bytes)`)
  }
  return data
}

for (const source of sources) {
  try {
    const data =
      source.type === 'github-api'
        ? await saveFromGithubApi(source.url)
        : await saveFromBinary(source.url)
    fs.writeFileSync(outFile, data)
    console.log(`saved ${outFile} (${data.length} bytes) from ${source.label}`)
    process.exit(0)
  } catch (error) {
    console.warn(`failed ${source.label}: ${error.message}`)
  }
}

process.exit(1)
