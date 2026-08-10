/** Official BackTop Nook bag PNG from animal-island-ui@1.4.0 */
export const BACK_TOP_BASE64_URL =
  'https://cdn.jsdelivr.net/npm/animal-island-ui@1.4.0/dist/es/components/BackTop/back-top.base64.js'

let cachedSrc = ''

export async function loadBackTopIconSrc() {
  if (cachedSrc) return cachedSrc
  const res = await fetch(BACK_TOP_BASE64_URL)
  const text = await res.text()
  const match = text.match(/"([^"]+)"/)
  if (!match) throw new Error('Failed to load BackTop icon')
  cachedSrc = `data:image/png;base64,${match[1].trim()}`
  return cachedSrc
}
