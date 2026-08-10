<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  size: {
    type: String,
    default: 'middle',
    validator: (v) => ['small', 'middle', 'large'].includes(v),
  },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  allowClear: { type: Boolean, default: false },
  status: {
    type: String,
    default: '',
    validator: (v) => ['', 'error', 'warning'].includes(v),
  },
  shadow: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'input', 'change', 'clear', 'keydown'])

const inputRef = ref(null)

const wrapperClasses = computed(() => [
  `size-${props.size}`,
  {
    'is-disabled': props.disabled,
    'no-shadow': !props.shadow,
    'is-error': props.status === 'error',
    'is-warning': props.status === 'warning',
  },
])

const showClear = computed(
  () => props.allowClear && !props.disabled && props.modelValue.length > 0
)

function onInput(e) {
  emit('update:modelValue', e.target.value)
  emit('input', e)
}

function onClear(e) {
  e.preventDefault()
  emit('update:modelValue', '')
  emit('clear')
  emit('input', { target: { value: '' } })
  inputRef.value?.focus()
}
</script>

<template>
  <span class="animal-input-wrapper" :class="wrapperClasses">
    <span v-if="$slots.prefix" class="animal-input-prefix">
      <slot name="prefix" />
    </span>
    <input
      ref="inputRef"
      class="animal-input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
      @change="$emit('change', $event)"
      @keydown="$emit('keydown', $event)"
    />
    <button
      v-if="showClear"
      type="button"
      class="animal-input-clear"
      aria-label="clear"
      @click="onClear"
    >
      ×
    </button>
    <span v-if="$slots.suffix" class="animal-input-suffix">
      <slot name="suffix" />
    </span>
  </span>
</template>

<style scoped>
.animal-input-wrapper {
  display: inline-flex;
  align-items: center;
  width: 100%;
  background: #f7f3df;
  border: 2px solid #c4b89e;
  border-radius: 50px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.animal-input-wrapper.no-shadow {
  box-shadow: none;
}

.animal-input-wrapper:not(.no-shadow) {
  box-shadow: 0 3px #d4c9b4;
}

.animal-input-wrapper:not(.no-shadow):hover:not(.is-disabled) {
  border-color: #a89878;
  box-shadow: 0 3px #c4b89e;
}

.animal-input-wrapper.size-small {
  height: 32px;
  padding: 0 14px;
  font-size: 12px;
  border-radius: 40px;
}

.animal-input-wrapper.size-small:not(.no-shadow) {
  box-shadow: 0 2px #d4c9b4;
}

.animal-input-wrapper.size-middle {
  height: 40px;
  padding: 0 18px;
  font-size: 14px;
}

.animal-input-wrapper.size-large {
  height: 48px;
  padding: 0 22px;
  font-size: 16px;
  border-width: 2.5px;
  border-radius: 50px;
}

.animal-input-wrapper.size-large:not(.no-shadow) {
  box-shadow: 0 4px #d4c9b4;
}

.animal-input-wrapper:hover:not(.is-disabled) {
  border-color: #a89878;
}

.animal-input-wrapper:focus-within:not(.is-disabled) {
  border-color: #ffcc00;
  box-shadow: 0 0 0 3px rgba(255, 204, 0, 0.15);
}

.animal-input-wrapper.is-error {
  border-color: #e05a5a;
  box-shadow: 0 3px 0 0 #c94444;
}

.animal-input-wrapper.is-error:hover:not(.is-disabled) {
  border-color: #d44;
  box-shadow: 0 3px 0 0 #c94444;
}

.animal-input-wrapper.is-warning {
  border-color: #f5c31c;
  box-shadow: 0 3px 0 0 #dba90e;
}

.animal-input-wrapper.is-warning:hover:not(.is-disabled) {
  border-color: #e0b800;
  box-shadow: 0 3px 0 0 #dba90e;
}

.animal-input-wrapper.is-disabled {
  background: #ece8dc;
  border-color: #d4c9b4;
  box-shadow: none;
  opacity: 0.6;
  cursor: not-allowed;
}

.animal-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #725d42;
  font-size: inherit;
  font-family: Nunito, 'Noto Sans SC', sans-serif;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.01em;
}

.animal-input::placeholder {
  color: #c4b89e;
  font-weight: 400;
}

.animal-input-wrapper.is-disabled .animal-input {
  cursor: not-allowed;
  color: #c4b89e;
}

.animal-input-prefix,
.animal-input-suffix {
  display: inline-flex;
  align-items: center;
  color: #a0936e;
  flex-shrink: 0;
  font-size: 1em;
}

.animal-input-prefix {
  margin-right: 6px;
}

.animal-input-suffix {
  margin-left: 6px;
}

.animal-input-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 4px;
  padding: 0;
  color: #c4b89e;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  border-radius: 50%;
  background: transparent;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.animal-input-clear:hover {
  color: #725d42;
  background: rgba(114, 93, 66, 0.1);
}

.animal-input-clear:focus-visible {
  outline: 2px solid #725d42;
  outline-offset: 1px;
}
</style>
