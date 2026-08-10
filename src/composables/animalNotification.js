import { ref, readonly } from 'vue'

const DEFAULT_DURATION = 4.5

const POSITION_PLACEMENT = {
  top: 'top',
  topLeft: 'top',
  topRight: 'top',
  bottom: 'bottom',
  bottomLeft: 'bottom',
  bottomRight: 'bottom',
}

export const notificationItems = ref([])
let counter = 0

function buildItem(config, type) {
  const normalized = typeof config === 'string' ? { message: config } : { ...config }
  const position = normalized.position ?? 'topRight'
  counter += 1
  return {
    ...normalized,
    type,
    key: normalized.key ?? `animal-notification-${Date.now()}-${counter}`,
    position,
    placement: POSITION_PLACEMENT[position] ?? 'top',
    duration: normalized.duration ?? DEFAULT_DURATION,
    createdAt: Date.now(),
  }
}

export function removeNotification(key) {
  notificationItems.value = notificationItems.value.filter((item) => item.key !== key)
}

function open(config, type = 'info') {
  const item = buildItem(config, type)

  if (item.key) {
    const idx = notificationItems.value.findIndex((it) => it.key === item.key)
    if (idx !== -1) {
      const next = notificationItems.value.slice()
      next[idx] = item
      notificationItems.value = next
      return
    }
  }

  notificationItems.value = [...notificationItems.value, item]
}

function destroy(key) {
  let removed = []
  if (key) {
    removed = notificationItems.value.filter((it) => it.key === key)
    notificationItems.value = notificationItems.value.filter((it) => it.key !== key)
  } else if (notificationItems.value.length) {
    removed = notificationItems.value.slice()
    notificationItems.value = []
  } else {
    return
  }
  removed.forEach((it) => it.onClose?.())
}

export const animalNotification = {
  open: (config) => open(config, 'info'),
  success: (config) => open(config, 'success'),
  info: (config) => open(config, 'info'),
  warning: (config) => open(config, 'warning'),
  error: (config) => open(config, 'error'),
  destroy,
}

export const notificationStore = readonly(notificationItems)
