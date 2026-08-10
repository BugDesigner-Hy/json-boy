<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  placement: { type: String, default: 'right' },
  width: { type: [Number, String], default: 378 },
  height: { type: [Number, String], default: 300 },
  maskClosable: { type: Boolean, default: true },
  pushBackground: { type: Boolean, default: true },
  maskStyle: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:open', 'close'])

const dialogRef = ref(null)
const previouslyFocused = ref(null)
let restoreTransitionRaf = null
let pushedSnapshot = []

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const panelStyle = computed(() => {
  const style = {}
  if (props.placement === 'left' || props.placement === 'right') {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  } else {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return style
})

function getFocusable(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  )
}

function close() {
  emit('update:open', false)
  emit('close')
}

function onMaskClick() {
  if (props.maskClosable) close()
}

function onKeyDown(e) {
  if (!props.open) return
  if (e.key === 'Escape') {
    close()
    return
  }
  if (e.key !== 'Tab') return
  const dialog = dialogRef.value
  if (!dialog) return
  const focusables = getFocusable(dialog)
  if (focusables.length === 0) {
    e.preventDefault()
    dialog.focus()
    return
  }
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  const active = document.activeElement
  if (e.shiftKey) {
    if (active === first || !dialog.contains(active)) {
      e.preventDefault()
      last.focus()
    }
  } else if (active === last || !dialog.contains(active)) {
    e.preventDefault()
    first.focus()
  }
}

function applyPushBackground() {
  if (restoreTransitionRaf !== null) {
    cancelAnimationFrame(restoreTransitionRaf)
    restoreTransitionRaf = null
  }

  pushedSnapshot = []
  const candidates = Array.from(document.body.children).filter((el) => {
    if (!(el instanceof HTMLElement)) return false
    const tag = el.tagName
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return false
    if (el.hasAttribute('data-animal-drawer-ignore')) return false
    if (el.hasAttribute('data-animal-drawer-portal')) return false
    if (el.hasAttribute('data-animal-notification-root')) return false
    return getComputedStyle(el).position !== 'fixed'
  })

  candidates.forEach((el) => {
    pushedSnapshot.push({
      el,
      transform: el.style.transform,
      filter: el.style.filter,
      borderRadius: el.style.borderRadius,
      overflow: el.style.overflow,
      transition: el.style.transition,
    })
    el.style.transition =
      'transform 0.36s cubic-bezier(0.2, 0, 0.2, 1), filter 0.36s ease, border-radius 0.36s ease'
  })

  requestAnimationFrame(() => {
    pushedSnapshot.forEach(({ el }) => {
      el.style.transform = 'scale(0.94)'
      el.style.filter = 'blur(1px)'
      el.style.borderRadius = '14px'
      el.style.overflow = 'hidden'
    })
  })
}

function restorePushBackground() {
  if (restoreTransitionRaf !== null) {
    cancelAnimationFrame(restoreTransitionRaf)
    restoreTransitionRaf = null
  }

  pushedSnapshot.forEach(({ el, transform, filter, borderRadius, overflow }) => {
    el.style.transform = transform
    el.style.filter = filter
    el.style.borderRadius = borderRadius
    el.style.overflow = overflow
  })

  restoreTransitionRaf = requestAnimationFrame(() => {
    pushedSnapshot.forEach(({ el, transition }) => {
      el.style.transition = transition
    })
    pushedSnapshot = []
    restoreTransitionRaf = null
  })
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      previouslyFocused.value = document.activeElement
      document.body.style.overflow = 'hidden'
      if (props.pushBackground) applyPushBackground()
      nextTick(() => {
        const dialog = dialogRef.value
        if (!dialog) return
        const focusables = getFocusable(dialog)
        ;(focusables[0] ?? dialog).focus()
      })
    } else {
      document.body.style.overflow = ''
      if (props.pushBackground) restorePushBackground()
      previouslyFocused.value?.focus?.()
    }
  }
)

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  restorePushBackground()
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <div class="animal-drawer-portal" data-animal-drawer-portal>
      <div
        class="animal-drawer-mask"
        :class="{ 'is-open': open }"
        :style="maskStyle"
        @click="onMaskClick"
      />
      <aside
        ref="dialogRef"
        class="animal-drawer-panel"
        :class="[
          `placement-${placement}`,
          { 'is-open': open },
        ]"
        :style="panelStyle"
        :aria-hidden="!open"
        :inert="open ? undefined : ''"
        tabindex="-1"
        @click.stop
      >
        <header v-if="title || $slots.title" class="animal-drawer-header">
          <div class="animal-drawer-title">
            <slot name="title">{{ title }}</slot>
          </div>
          <button type="button" class="animal-drawer-close" aria-label="关闭" @click="close">
            ×
          </button>
        </header>
        <div class="animal-drawer-body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="animal-drawer-footer">
          <slot name="footer" />
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.animal-drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.18);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.36s ease;
}

.animal-drawer-mask.is-open {
  opacity: 1;
  pointer-events: all;
}

.animal-drawer-panel {
  position: fixed;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  background: rgb(247, 243, 223);
  color: rgb(128, 115, 89);
  font-family: Nunito, 'Noto Sans SC', sans-serif;
  overflow: hidden;
  transition: transform 0.36s cubic-bezier(0.2, 0, 0.2, 1);
}

.placement-right {
  top: 0;
  right: 0;
  height: 100vh;
  max-width: calc(100vw - 32px);
  border-radius: 20px 0 0 20px;
  box-shadow: -12px 0 32px rgba(61, 52, 40, 0.18);
  transform: translateX(100%);
}

.placement-left {
  top: 0;
  left: 0;
  height: 100vh;
  max-width: calc(100vw - 32px);
  border-radius: 0 20px 20px 0;
  box-shadow: 12px 0 32px rgba(61, 52, 40, 0.18);
  transform: translateX(-100%);
}

.placement-top {
  top: 0;
  left: 0;
  right: 0;
  max-height: calc(100vh - 32px);
  border-radius: 0 0 20px 20px;
  box-shadow: 0 12px 32px rgba(61, 52, 40, 0.18);
  transform: translateY(-100%);
}

.placement-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  max-height: calc(100vh - 32px);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -12px 32px rgba(61, 52, 40, 0.18);
  transform: translateY(100%);
}

.animal-drawer-panel.is-open {
  transform: none;
}

.animal-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 15px;
  flex-shrink: 0;
}

.animal-drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 28px;
  font-weight: 700;
  color: rgba(114, 93, 66, 1);
  line-height: 1.2;
}

.animal-drawer-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: rgba(114, 93, 66, 0.6);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.animal-drawer-close:hover {
  background: rgba(114, 93, 66, 0.1);
  color: rgba(114, 93, 66, 1);
}

.animal-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  color: #8a7b66;
}

.animal-drawer-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
  flex-shrink: 0;
}

[data-theme='dark'] .animal-drawer-panel {
  background: var(--bg-card);
  color: var(--text-body);
}

[data-theme='dark'] .animal-drawer-title {
  color: var(--text);
}

[data-theme='dark'] .animal-drawer-body {
  color: var(--text-secondary);
}
</style>
