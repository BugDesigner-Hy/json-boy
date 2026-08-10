<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { removeNotification } from '../composables/animalNotification.js'

const props = defineProps({
  item: { type: Object, required: true },
})

const leaving = ref(false)
let closeTimer = null
let removeTimer = null

const ICONS = {
  success: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z" stroke="currentColor" stroke-width="1.5"/><path d="m5.5 9 2.2 2.2L12.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z" stroke="currentColor" stroke-width="1.5"/><path d="M9 8.25V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="5.75" r="0.9" fill="currentColor"/></svg>',
  warning: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 2 16.5 15H1.5L9 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 7v3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="12.75" r="0.9" fill="currentColor"/></svg>',
  error: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z" stroke="currentColor" stroke-width="1.5"/><path d="m6.5 6.5 5 5M11.5 6.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
}

function triggerClose() {
  if (leaving.value) return
  leaving.value = true
}

function handleCloseClick(e) {
  e.stopPropagation()
  triggerClose()
}

function handleClick() {
  props.item.onClick?.()
}

function handleKeyDown(e) {
  if (props.item.onClick && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault()
    props.item.onClick()
  }
}

watch(leaving, (val) => {
  if (!val) return
  removeTimer = window.setTimeout(() => {
    removeNotification(props.item.key)
    props.item.onClose?.()
  }, 250)
})

onMounted(() => {
  if (!props.item.duration || props.item.duration <= 0) return
  closeTimer = window.setTimeout(triggerClose, props.item.duration * 1000)
})

onUnmounted(() => {
  if (closeTimer) window.clearTimeout(closeTimer)
  if (removeTimer) window.clearTimeout(removeTimer)
})
</script>

<template>
  <div
    class="animal-notification"
    :class="[
      `type-${item.type}`,
      `placement-${item.placement}`,
      { leaving, clickable: !!item.onClick },
      item.className,
    ]"
    :style="item.style"
    :role="item.onClick ? 'button' : undefined"
    :tabindex="item.onClick ? 0 : undefined"
    :data-notification-key="item.key"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <span class="animal-notification-icon" aria-hidden="true">
      <span v-if="item.icon" v-html="item.icon" />
      <span v-else v-html="ICONS[item.type]" />
    </span>
    <div class="animal-notification-body">
      <div class="animal-notification-title">{{ item.message }}</div>
      <div
        v-if="item.description !== undefined && item.description !== null"
        class="animal-notification-desc"
      >
        {{ item.description }}
      </div>
    </div>
    <span v-if="item.btn" class="animal-notification-btn">{{ item.btn }}</span>
    <button
      type="button"
      class="animal-notification-close"
      aria-label="close"
      @click="handleCloseClick"
    >
      {{ item.closeIcon ?? '×' }}
    </button>
  </div>
</template>

<style scoped>
.animal-notification {
  pointer-events: auto;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 384px;
  max-width: calc(100vw - 48px);
  padding: 14px 16px;
  background: rgb(247, 243, 223);
  border: 2px solid #c4b89e;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(61, 52, 40, 0.14);
  font-family: Nunito, 'Noto Sans SC', sans-serif;
  color: #725d42;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  will-change: transform, opacity;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  box-shadow: 0 10px 26px rgba(61, 52, 40, 0.18);
  transform: translateY(-1px);
}

.clickable:focus-visible {
  outline: 2px solid #ffcc00;
  outline-offset: 2px;
}

.type-success {
  background: #f5fae9;
  border-color: #6fba2c;
  box-shadow: 0 6px 18px rgba(111, 186, 44, 0.18);
}

.type-success .animal-notification-icon {
  background: #d8efc1;
  color: #5a9e1e;
}

.type-info {
  background: #ecf9f6;
  border-color: #19c8b9;
  box-shadow: 0 6px 18px rgba(25, 200, 185, 0.18);
}

.type-info .animal-notification-icon {
  background: #c2ece6;
  color: #11a89b;
}

.type-warning {
  background: #fdf6d9;
  border-color: #f5c31c;
  box-shadow: 0 6px 18px rgba(245, 195, 28, 0.2);
}

.type-warning .animal-notification-icon {
  background: #fbeaa1;
  color: #b88a06;
}

.type-error {
  background: #fde8e8;
  border-color: #e05a5a;
  box-shadow: 0 6px 18px rgba(224, 90, 90, 0.18);
}

.type-error .animal-notification-icon {
  background: #f7c8c8;
  color: #c94444;
}

.animal-notification-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  user-select: none;
}

.animal-notification-body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.animal-notification-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  color: #794f27;
  letter-spacing: 0.01em;
  word-break: break-word;
}

.animal-notification-desc {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.55;
  color: #8a7b66;
  letter-spacing: 0.01em;
  word-break: break-word;
}

.animal-notification-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.animal-notification-close {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(114, 93, 66, 0.55);
  font-size: 18px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.animal-notification-close:hover {
  background: rgba(114, 93, 66, 0.12);
  color: rgba(114, 93, 66, 1);
}

.animal-notification-close:focus-visible {
  outline: 2px solid #ffcc00;
  outline-offset: 2px;
}

.placement-top {
  animation: animal-notification-slide-from-top 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.placement-top.leaving {
  animation: animal-notification-slide-out-top 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.placement-bottom {
  animation: animal-notification-rise-from-bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.placement-bottom.leaving {
  animation: animal-notification-sink-out-bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes animal-notification-slide-from-top {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes animal-notification-slide-out-top {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-16px); }
}

@keyframes animal-notification-rise-from-bottom {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes animal-notification-sink-out-bottom {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(16px); }
}

@media (prefers-reduced-motion: reduce) {
  .placement-top,
  .placement-bottom,
  .placement-top.leaving,
  .placement-bottom.leaving {
    animation-duration: 0.01s;
  }
}
</style>
