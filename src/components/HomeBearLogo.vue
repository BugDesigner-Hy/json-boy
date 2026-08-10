<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const BEAR_WIDTH = 192
const BEAR_HEIGHT = 120
const BEAR_POS_KEY = 'json-boy-home-bear-pos'

defineProps({
  src: { type: String, required: true },
})

const dragging = ref(false)
const position = ref({ left: 8, top: 0 })
const dragOffset = { x: 0, y: 0 }

const bearStyle = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`,
  width: `${BEAR_WIDTH}px`,
  height: `${BEAR_HEIGHT}px`,
}))

function clampPosition(left, top) {
  const maxLeft = Math.max(0, window.innerWidth - BEAR_WIDTH)
  const maxTop = Math.max(0, window.innerHeight - BEAR_HEIGHT)
  return {
    left: Math.min(Math.max(0, left), maxLeft),
    top: Math.min(Math.max(0, top), maxTop),
  }
}

function getDefaultPosition() {
  return clampPosition(8, window.innerHeight - BEAR_HEIGHT - 8)
}

function loadPosition() {
  try {
    const saved = localStorage.getItem(BEAR_POS_KEY)
    if (!saved) {
      position.value = getDefaultPosition()
      return
    }
    const parsed = JSON.parse(saved)
    if (
      typeof parsed.left === 'number' &&
      typeof parsed.top === 'number'
    ) {
      position.value = clampPosition(parsed.left, parsed.top)
      return
    }
  } catch {
    // ignore invalid saved position
  }
  position.value = getDefaultPosition()
}

function savePosition() {
  try {
    localStorage.setItem(BEAR_POS_KEY, JSON.stringify(position.value))
  } catch {
    // ignore quota / private mode errors
  }
}

function onPointerDown(event) {
  dragging.value = true
  dragOffset.x = event.clientX - position.value.left
  dragOffset.y = event.clientY - position.value.top
  event.currentTarget.setPointerCapture(event.pointerId)
  event.preventDefault()
}

function onPointerMove(event) {
  if (!dragging.value) return
  position.value = clampPosition(
    event.clientX - dragOffset.x,
    event.clientY - dragOffset.y,
  )
}

function onPointerUp(event) {
  if (!dragging.value) return
  dragging.value = false
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
  savePosition()
}

function onWindowResize() {
  position.value = clampPosition(position.value.left, position.value.top)
}

onMounted(() => {
  loadPosition()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
})
</script>

<template>
  <img
    class="home-bear-logo animal-cursor"
    :class="{ dragging }"
    :src="src"
    alt=""
    decoding="async"
    aria-hidden="true"
    draggable="false"
    :style="bearStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  />
</template>

<style scoped>
.home-bear-logo {
  position: fixed;
  z-index: 6;
  user-select: none;
  touch-action: none;
  cursor: grab;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(91, 78, 30, 0.18));
  transition: filter 0.2s ease;
}

.home-bear-logo:hover {
  filter: drop-shadow(0 3px 10px rgba(91, 78, 30, 0.24));
}

.home-bear-logo.dragging {
  cursor: grabbing;
  filter: drop-shadow(0 4px 12px rgba(91, 78, 30, 0.28));
}
</style>
