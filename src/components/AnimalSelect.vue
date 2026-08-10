<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
  minWidth: { type: [Number, String], default: 140 },
  placement: { type: String, default: 'auto' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const open = ref(false)
const dropdownReady = ref(false)
const focusKey = ref(null)
const dropdownStyle = ref({})
const wrapperRef = ref(null)
const triggerRef = ref(null)
const dropdownRef = ref(null)
const listId = `animal-select-${Math.random().toString(36).slice(2, 9)}`

const displayLabel = computed(() => {
  const hit = props.options.find((o) => o.key === props.modelValue)
  return hit?.label || props.placeholder
})

function optionId(key) {
  return `${listId}-option-${key}`
}

function resolvePlacement(rect, dropdownHeight, dropdownWidth, vw, vh) {
  if (props.placement === 'top') return 'top'
  if (props.placement === 'bottom') return 'bottom'
  if (props.placement === 'side') {
    return rect.right + dropdownWidth + 12 > vw ? 'side-left' : 'side-right'
  }

  const spaceAbove = rect.top
  const spaceBelow = vh - rect.bottom

  // auto: 优先向上展开，避免挡住触发器下方的 JSON 树等内容
  if (spaceAbove >= dropdownHeight + 12) return 'top'
  if (spaceBelow >= dropdownHeight + 12) return 'bottom'
  if (rect.right + dropdownWidth + 12 <= vw) return 'side-right'
  if (rect.left - dropdownWidth - 12 >= 0) return 'side-left'
  return spaceAbove >= spaceBelow ? 'top' : 'bottom'
}

function updateDropdownPosition() {
  if (!open.value || !triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const itemHeight = 44
  const dropdownHeight = props.options.length * itemHeight + 24
  const dropdownWidth = Math.max(rect.width, 160)
  const mode = resolvePlacement(rect, dropdownHeight, dropdownWidth, vw, vh)
  const style = {
    position: 'fixed',
    zIndex: 2000,
    minWidth: `${dropdownWidth}px`,
  }

  if (mode === 'top') {
    style.left = `${Math.max(8, Math.min(rect.left, vw - dropdownWidth - 8))}px`
    style.top = `${Math.max(8, rect.top - dropdownHeight - 6)}px`
  } else if (mode === 'bottom') {
    style.left = `${Math.max(8, Math.min(rect.left, vw - dropdownWidth - 8))}px`
    style.top = `${Math.min(vh - dropdownHeight - 8, rect.bottom + 6)}px`
  } else if (mode === 'side-left') {
    style.right = `${vw - rect.left + 6}px`
    style.left = 'auto'
    style.top = `${Math.max(8, Math.min(rect.top + rect.height / 2 - dropdownHeight / 2, vh - dropdownHeight - 8))}px`
  } else {
    style.left = `${Math.min(vw - dropdownWidth - 8, rect.right + 6)}px`
    style.top = `${Math.max(8, Math.min(rect.top + rect.height / 2 - dropdownHeight / 2, vh - dropdownHeight - 8))}px`
  }

  dropdownStyle.value = style
}

function openDropdown() {
  if (props.disabled) return
  open.value = true
  dropdownReady.value = false
  nextTick(() => {
    updateDropdownPosition()
    requestAnimationFrame(() => {
      dropdownReady.value = true
    })
  })
}

function closeDropdown() {
  open.value = false
  dropdownReady.value = false
  triggerRef.value?.focus()
}

function toggleDropdown() {
  if (open.value) closeDropdown()
  else openDropdown()
}

function selectKey(key) {
  emit('update:modelValue', key)
  emit('change', key)
  closeDropdown()
}

function moveFocus(step) {
  if (!props.options.length) return
  const idx = props.options.findIndex((o) => o.key === focusKey.value)
  const next =
    idx < 0
      ? step === 1
        ? 0
        : props.options.length - 1
      : (idx + step + props.options.length) % props.options.length
  focusKey.value = props.options[next].key
}

function onKeyDown(e) {
  if (props.disabled) return
  const { key } = e
  if (!open.value) {
    if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
      e.preventDefault()
      openDropdown()
    }
    return
  }
  if (key === 'Escape') {
    e.preventDefault()
    closeDropdown()
  } else if (key === 'ArrowDown') {
    e.preventDefault()
    moveFocus(1)
  } else if (key === 'ArrowUp') {
    e.preventDefault()
    moveFocus(-1)
  } else if (key === 'Home') {
    e.preventDefault()
    focusKey.value = props.options[0]?.key ?? null
  } else if (key === 'End') {
    e.preventDefault()
    focusKey.value = props.options[props.options.length - 1]?.key ?? null
  } else if (key === 'Enter' || key === ' ') {
    e.preventDefault()
    if (focusKey.value) selectKey(focusKey.value)
  }
}

function onClickOutside(e) {
  const target = e.target
  if (wrapperRef.value?.contains(target)) return
  if (dropdownRef.value?.contains(target)) return
  closeDropdown()
}

function onViewportChange() {
  if (open.value) updateDropdownPosition()
}

watch(open, (val) => {
  if (val) {
    focusKey.value = props.modelValue || props.options[0]?.key || null
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
  } else {
    document.removeEventListener('mousedown', onClickOutside)
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
  }
})

onMounted(() => {
  if (open.value) {
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="animal-select"
    :class="{ disabled }"
    :style="{ minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }"
    @keydown="onKeyDown"
  >
    <div
      ref="triggerRef"
      class="animal-select-trigger"
      :class="{ open }"
      tabindex="0"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? listId : undefined"
      :aria-activedescendant="open && focusKey ? optionId(focusKey) : undefined"
      :aria-disabled="disabled || undefined"
      :aria-label="ariaLabel || undefined"
      @click="toggleDropdown"
    >
      <span :class="modelValue ? 'animal-select-value' : 'animal-select-placeholder'">
        {{ displayLabel }}
      </span>
      <span class="animal-select-arrow" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>

    <Teleport to="body">
      <div
        v-if="open && dropdownReady"
        ref="dropdownRef"
        class="animal-select-dropdown"
        :style="dropdownStyle"
        role="listbox"
        :id="listId"
        :aria-label="ariaLabel || undefined"
      >
        <div
          v-for="opt in options"
          :key="opt.key"
          :id="optionId(opt.key)"
          role="option"
          class="animal-select-option"
          :class="{ active: modelValue === opt.key }"
          :aria-selected="modelValue === opt.key"
          @click="selectKey(opt.key)"
          @mouseenter="focusKey = opt.key"
        >
          <span class="animal-select-option-dot" aria-hidden="true" />
          {{ opt.label }}
          <div v-if="modelValue === opt.key" class="animal-select-pill-bar" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animal-select {
  position: relative;
  display: inline-block;
  font-family: Nunito, 'Noto Sans SC', sans-serif;
  user-select: none;
}

.animal-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 13px;
  background: #fff;
  border: 2px solid #e8dcc8;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.animal-select-trigger:hover {
  border-color: #d4c4a8;
  background: #fffdf7;
}

.animal-select-trigger.open {
  background: #fff;
  border-radius: 12px;
}

.animal-select-value {
  font-size: 14px;
  color: #725d42;
  font-weight: 600;
}

.animal-select-placeholder {
  font-size: 14px;
  color: #a09080;
}

.animal-select-arrow {
  color: #a09080;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.animal-select-trigger.open .animal-select-arrow {
  transform: rotate(180deg);
  color: #19c8b9;
}

.animal-select-dropdown {
  background: #ffeea0;
  border-radius: 28px;
  overflow: visible;
  padding: 12px 0;
  box-shadow: 0 8px 24px rgba(61, 52, 40, 0.16);
  animation: animal-select-fade-in 0.2s ease forwards;
}

@keyframes animal-select-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animal-select-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 30px 10px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #725d42;
  position: relative;
  white-space: nowrap;
}

.animal-select-option.active {
  position: relative;
  z-index: 1;
  font-weight: 700;
}

.animal-select-option:hover {
  position: relative;
  font-weight: 700;
}

.animal-select-option:hover::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 35px;
  height: 35px;
  background: url('https://cdn.jsdelivr.net/npm/animal-island-ui@1.4.0/dist/files/select-cursor.9437140a.svg') no-repeat center / contain;
  animation: animal-select-cursor-in 0.5s ease-out forwards;
}

@keyframes animal-select-cursor-in {
  0% {
    opacity: 0;
    transform: translateY(-50%) translate(-20px) rotate(-15deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-50%) translate(5px) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) translate(0) rotate(0);
  }
}

.animal-select-pill-bar {
  position: absolute;
  left: 0;
  right: 0;
  top: 56%;
  transform: translateY(-50%);
  height: 14px;
  margin: 0 20px;
  background: #fc0;
  border-radius: 7px;
  z-index: -1;
  opacity: 0.3;
}

.animal-select-option-dot {
  width: 16px;
  font-size: 12px;
}

.animal-select.disabled .animal-select-trigger {
  opacity: 0.5;
  pointer-events: none;
  background: #f5f5f0;
}

[data-theme='dark'] .animal-select-trigger {
  background: var(--bg-input);
  border-color: var(--border);
}

[data-theme='dark'] .animal-select-trigger:hover {
  background: var(--bg-input-focus);
  border-color: var(--border-hover);
}

[data-theme='dark'] .animal-select-value {
  color: var(--text-body);
}
</style>
