<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { loadBackTopIconSrc } from '../assets/back-top-base64.js'

const props = defineProps({
  target: { type: Function, default: null },
  visibilityHeight: { type: Number, default: 400 },
  duration: { type: Number, default: 300 },
  fixed: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const visible = ref(false)
const backTopSrc = ref('')

function getTarget() {
  return props.target ? props.target() : window
}

function checkScroll() {
  const el = getTarget()
  if (!el) return
  const scrollTop = el === window ? window.scrollY : el.scrollTop
  visible.value = scrollTop > props.visibilityHeight
}

function scrollToTop(e) {
  const el = getTarget()
  if (!el) return
  const start = el === window ? window.scrollY : el.scrollTop
  const startTime = performance.now()

  function animate(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - (-2 * progress + 2) ** 2 / 2
    const pos = start * (1 - eased)
    if (el === window) {
      window.scrollTo(0, pos)
    } else {
      el.scrollTop = pos
    }
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
  emit('click', e)
}

function onKeyDown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    scrollToTop(e)
  }
}

let targetEl = null

function bindScroll() {
  unbindScroll()
  targetEl = getTarget()
  if (targetEl) {
    targetEl.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()
  }
}

function unbindScroll() {
  if (targetEl) {
    targetEl.removeEventListener('scroll', checkScroll)
    targetEl = null
  }
}

onMounted(async () => {
  try {
    backTopSrc.value = await loadBackTopIconSrc()
  } catch {
    backTopSrc.value = ''
  }
  await nextTick()
  bindScroll()
})
onUnmounted(unbindScroll)
watch(() => props.target, bindScroll)
</script>

<template>
  <div
    v-show="backTopSrc"
    class="backtop"
    :class="{ visible, fixed }"
    role="button"
    tabindex="0"
    aria-label="返回顶部"
    @click="scrollToTop"
    @keydown="onKeyDown"
  >
    <img class="backtop-img" :src="backTopSrc" alt="返回顶部" />
  </div>
</template>

<style scoped>
.backtop {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 5;
  cursor: pointer;
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(12px);
  user-select: none;
  border: none;
  outline: none;
  background: none;
  padding: 0;
  line-height: 1;
}

.backtop.fixed {
  position: fixed;
  bottom: 48px;
  right: 32px;
  z-index: 1000;
}

.backtop.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.backtop:hover {
  transform: translateY(0) scale(1.08);
}

.backtop:active {
  transform: translateY(2px) scale(0.96);
}

.backtop:focus-visible {
  outline: 2px solid #ffcc00;
  outline-offset: 4px;
  border-radius: 50%;
}

.backtop-img {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(91, 78, 30, 0.22));
  transition: filter 0.25s ease;
}

.backtop:hover .backtop-img {
  filter: drop-shadow(0 4px 14px rgba(91, 78, 30, 0.32));
}

@media (max-width: 768px) {
  .backtop {
    bottom: 16px;
    right: 12px;
  }

  .backtop.fixed {
    bottom: 24px;
    right: 16px;
  }

  .backtop-img {
    width: 80px;
    height: 80px;
  }
}
</style>
