<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  size: { type: String, default: 'middle' },
  direction: { type: String, default: 'horizontal' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const groupName = `animal-radio-${Math.random().toString(36).slice(2, 9)}`
const focusIndex = ref(0)
const inputRefs = ref([])

const enabledIndexes = computed(() =>
  props.options
    .map((opt, idx) => ({ opt, idx }))
    .filter(({ opt }) => !props.disabled && !opt.disabled)
    .map(({ idx }) => idx)
)

watch(
  () => props.modelValue,
  (val) => {
    const idx = props.options.findIndex((o) => o.value === val)
    if (idx >= 0) focusIndex.value = idx
  },
  { immediate: true }
)

function isChecked(value) {
  return props.modelValue === value
}

function isDisabled(opt) {
  return props.disabled || opt.disabled
}

function selectOption(opt) {
  if (isDisabled(opt)) return
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
}

function onGroupKeyDown(e) {
  if (enabledIndexes.value.length === 0) return
  const pos = enabledIndexes.value.indexOf(focusIndex.value)
  const currentPos = pos >= 0 ? pos : 0
  let nextPos = -1

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault()
      nextPos = (currentPos + 1) % enabledIndexes.value.length
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault()
      nextPos = (currentPos - 1 + enabledIndexes.value.length) % enabledIndexes.value.length
      break
    case 'Home':
      e.preventDefault()
      nextPos = 0
      break
    case 'End':
      e.preventDefault()
      nextPos = enabledIndexes.value.length - 1
      break
    default:
      return
  }

  if (nextPos >= 0) {
    const idx = enabledIndexes.value[nextPos]
    focusIndex.value = idx
    const opt = props.options[idx]
    selectOption(opt)
    inputRefs.value[idx]?.focus()
  }
}

function setInputRef(el, idx) {
  if (el) inputRefs.value[idx] = el
}
</script>

<template>
  <div
    class="animal-radio-group"
    :class="[direction, size, { groupDisabled: disabled }]"
    role="radiogroup"
    @keydown="onGroupKeyDown"
  >
    <label
      v-for="(opt, idx) in options"
      :key="String(opt.value)"
      class="animal-radio-item"
      :class="[size, { checked: isChecked(opt.value), disabled: isDisabled(opt) }]"
    >
      <span class="animal-radio-cbx">
        <input
          :ref="(el) => setInputRef(el, idx)"
          type="radio"
          :name="groupName"
          :value="opt.value"
          :checked="isChecked(opt.value)"
          :disabled="isDisabled(opt)"
          :tabindex="idx === focusIndex && !isDisabled(opt) ? 0 : -1"
          @change="selectOption(opt)"
          @focus="focusIndex = idx"
        />
        <span class="animal-radio-splash" aria-hidden="true" />
        <svg class="animal-radio-check" fill="none" viewBox="0 0 15 14" height="14" width="15" aria-hidden="true">
          <path d="M2 8.36364L6.23077 12L13 2" />
        </svg>
      </span>
      <span v-if="opt.swatch" class="animal-radio-swatch" :style="{ background: opt.swatch }" :title="opt.label" />
      <span v-else class="animal-radio-label">{{ opt.label }}</span>
    </label>
  </div>
</template>

<style scoped>
.animal-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-family: Nunito, 'Noto Sans SC', sans-serif;
}

.animal-radio-group.horizontal {
  flex-direction: row;
}

.animal-radio-group.vertical {
  flex-direction: column;
  gap: 12px;
}

.animal-radio-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  position: relative;
}

.animal-radio-item.small {
  --cbx-size: 18px;
  --cbx-check-w: 10px;
  --cbx-check-h: 9px;
}

.animal-radio-item.small .animal-radio-label {
  font-size: 12px;
}

.animal-radio-item.middle {
  --cbx-size: 22px;
  --cbx-check-w: 12px;
  --cbx-check-h: 11px;
}

.animal-radio-item.middle .animal-radio-label {
  font-size: 14px;
}

.animal-radio-item.large {
  --cbx-size: 28px;
  --cbx-check-w: 15px;
  --cbx-check-h: 14px;
}

.animal-radio-item.large .animal-radio-label {
  font-size: 16px;
}

.animal-radio-cbx {
  position: relative;
  width: var(--cbx-size);
  height: var(--cbx-size);
  flex-shrink: 0;
  box-sizing: border-box;
}

.animal-radio-cbx input[type='radio'] {
  appearance: none;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: var(--cbx-size);
  height: var(--cbx-size);
  border: 2px solid #c4b89e;
  border-radius: 50%;
  background: #f7f3df;
  transition: border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.animal-radio-cbx input[type='radio']:focus-visible {
  outline: 2px solid #f5c31c;
  outline-offset: 2px;
}

.animal-radio-splash {
  display: block;
  width: var(--cbx-size);
  height: var(--cbx-size);
  background: none;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateZ(0);
  pointer-events: none;
}

.animal-radio-check {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--cbx-check-w);
  height: var(--cbx-check-h);
  transform: translate(-50%, -54%);
  z-index: 1;
  pointer-events: none;
}

.animal-radio-check path {
  stroke: #fff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 19;
  stroke-dashoffset: 19;
  transition: stroke-dashoffset 0.3s ease;
  transition-delay: 0.2s;
}

.animal-radio-cbx input:checked {
  border-color: #50b9ab;
}

.animal-radio-cbx input:checked ~ .animal-radio-splash {
  animation: animal-radio-splash 0.6s ease forwards;
}

.animal-radio-cbx input:checked ~ .animal-radio-check path {
  stroke-dashoffset: 0;
}

.animal-radio-label {
  color: #725d42;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: color 0.15s;
}

.animal-radio-item.checked .animal-radio-label {
  color: #794f27;
}

.animal-radio-item.checked .animal-radio-cbx input {
  background: #19c8b9;
}

.animal-radio-swatch {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #c4b89e;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(91, 78, 30, 0.12);
}

.animal-radio-item.checked .animal-radio-swatch {
  border-color: #ffcc00;
  box-shadow: 0 0 0 2px rgba(255, 204, 0, 0.35);
}

.animal-radio-item.disabled {
  opacity: 0.55;
  pointer-events: none;
}

.animal-radio-item.disabled .animal-radio-cbx input {
  background: #f0ece2;
  border-color: #d4c9b4;
}

.animal-radio-item.disabled .animal-radio-cbx input:checked ~ .animal-radio-splash {
  animation: none;
}

.animal-radio-item.disabled .animal-radio-check path {
  stroke: #c4b89e;
}

.animal-radio-item.disabled .animal-radio-label {
  color: #c4b89e;
}

.animal-radio-group.groupDisabled .animal-radio-item {
  pointer-events: none;
}

@keyframes animal-radio-splash {
  40% {
    background: #19c8b9;
    box-shadow:
      0 -18px 0 -8px #19c8b9,
      16px -8px 0 -8px #19c8b9,
      16px 8px 0 -8px #19c8b9,
      0 18px 0 -8px #19c8b9,
      -16px 8px 0 -8px #19c8b9,
      -16px -8px 0 -8px #19c8b9;
  }
  100% {
    background: #19c8b9;
    box-shadow:
      0 -36px 0 -10px transparent,
      32px -16px 0 -10px transparent,
      32px 16px 0 -10px transparent,
      0 36px 0 -10px transparent,
      -32px 16px 0 -10px transparent,
      -32px -16px 0 -10px transparent;
  }
}
</style>
