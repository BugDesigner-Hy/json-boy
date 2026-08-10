const CDN_BASE = 'https://cdn.jsdelivr.net/npm/animal-island-ui@1.4.0/dist/files'
const ITEM_CDN = 'https://cdn.jsdelivr.net/npm/animal-island-ui@1.4.0/dist/items'
const FOOTER_CDN = 'https://cdn.jsdelivr.net/gh/guokaigdg/animal-island-ui@1.4.0/src/assets/img/footer'

export const ANIMAL_HOME_BEAR_LOGO = '/img/home-bear-logo.png'

export const ANIMAL_FOOTER_SEA = `${FOOTER_CDN}/footer-sea.svg`
export const ANIMAL_FOOTER_TREE = `${FOOTER_CDN}/footer-tree.webp`

/** @type {Record<string, string>} */
export const ANIMAL_DIVIDER_URLS = {
  'line-brown': `${CDN_BASE}/divider-line-brown.1e2cace7.svg`,
  'line-teal': `${CDN_BASE}/divider-line-teal.e8b28b87.svg`,
  'line-white': `${CDN_BASE}/divider-line-white.a27273fa.png`,
  'line-yellow': `${CDN_BASE}/divider-line-yellow.838b9359.svg`,
  'wave-yellow': `${CDN_BASE}/wave-yellow.13bac28d.svg`,
}

export const DIVIDER_TYPE_OPTIONS = [
  { key: 'line-brown', label: '实线 · 棕' },
  { key: 'line-teal', label: '实线 · 青' },
  { key: 'line-white', label: '实线 · 白' },
  { key: 'line-yellow', label: '实线 · 黄' },
  { key: 'wave-yellow', label: '波浪 · 黄' },
  { key: 'dashed-brown', label: '虚线 · 棕' },
  { key: 'dashed-teal', label: '虚线 · 青' },
  { key: 'dashed-white', label: '虚线 · 白' },
  { key: 'dashed-yellow', label: '虚线 · 黄' },
]

export const ANIMAL_CURSOR_FINGER = `${CDN_BASE}/cursor-icon.1ea93a65.png`
export const ANIMAL_CURSOR_HOTSPOT = '4 0'

/** @type {Record<string, string>} */
export const ANIMAL_ICON_URLS = {
  'icon-miles': `${CDN_BASE}/icon-miles.defd75be.svg`,
  'icon-camera': `${CDN_BASE}/icon-camera.51fd7127.svg`,
  'icon-chat': `${CDN_BASE}/icon-chat.7cdc7b1f.svg`,
  'icon-critterpedia': `${CDN_BASE}/icon-critterpedia.2c4ac782.svg`,
  'icon-design': `${CDN_BASE}/icon-design.5ac514dc.svg`,
  'icon-diy': `${CDN_BASE}/icon-diy.e66a3414.svg`,
  'icon-helicopter': `${CDN_BASE}/icon-helicopter.6d8fe926.svg`,
  'icon-map': `${CDN_BASE}/icon-map.9182b8ee.svg`,
  'icon-shopping': `${CDN_BASE}/icon-shopping.e88affb9.svg`,
  'icon-variant': `${CDN_BASE}/icon-variant.711ed032.svg`,
}

export const ICON_LIST = [
  { name: 'icon-miles', label: 'NookMiles' },
  { name: 'icon-camera', label: 'Camera' },
  { name: 'icon-chat', label: 'Chat' },
  { name: 'icon-critterpedia', label: 'Critterpedia' },
  { name: 'icon-design', label: 'Design' },
  { name: 'icon-diy', label: 'DIY' },
  { name: 'icon-helicopter', label: 'Helicopter' },
  { name: 'icon-map', label: 'Map' },
  { name: 'icon-shopping', label: 'Shopping' },
  { name: 'icon-variant', label: 'Variant' },
]

/** @param {number|string} id */
export function itemIconUrl(id) {
  const num = String(id).padStart(3, '0')
  return `${ITEM_CDN}/item-${num}.png`
}
