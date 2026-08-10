<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'small'].includes(v),
  },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  checkedChildren: { type: String, default: '' },
  unCheckedChildren: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'change'])

function toggle() {
  if (props.disabled || props.loading) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}

function onKeyDown(e) {
  if (props.disabled || props.loading) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle()
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    class="animal-switch"
    :class="{
      'is-checked': modelValue,
      'size-small': size === 'small',
      'is-disabled': disabled,
      'is-loading': loading,
      'has-inner': checkedChildren || unCheckedChildren,
    }"
    :aria-checked="modelValue"
    :aria-label="ariaLabel || undefined"
    :disabled="disabled"
    @click="toggle"
    @keydown="onKeyDown"
  >
    <span v-if="checkedChildren || unCheckedChildren" class="animal-switch-inner">
      {{ modelValue ? checkedChildren : unCheckedChildren }}
    </span>
    <span class="animal-switch-handle">
      <span v-if="loading" class="animal-switch-spinner" aria-hidden="true" />
    </span>
  </button>
</template>

<style scoped>
.animal-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 52px;
  height: 28px;
  padding: 0;
  background: #d4c9b4;
  border: 2.5px solid #c4b89e;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  box-shadow: inset 0 2px 4px rgba(114, 93, 66, 0.15);
  flex-shrink: 0;
}

.animal-switch:hover:not(.is-disabled) {
  border-color: #a89878;
}

.animal-switch:focus-visible {
  outline: 2px solid #ffcc00;
  outline-offset: 2px;
}

.animal-switch.is-checked {
  background: #86d67a;
  border-color: #6fba2c;
  box-shadow: inset 0 2px 4px rgba(90, 158, 30, 0.2);
}

.animal-switch.is-checked:hover:not(.is-disabled) {
  border-color: #5a9e1e;
  background: #7ccc70;
}

.animal-switch.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.animal-switch.is-loading {
  pointer-events: none;
  opacity: 0.7;
}

.animal-switch.size-small {
  min-width: 38px;
  height: 20px;
}

.animal-switch-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 2px;
  width: 21px;
  height: 21px;
  background: #f7f3df;
  border: 2.5px solid #c4b89e;
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.animal-switch.is-checked .animal-switch-handle {
  left: calc(100% - 24px);
  border-color: #6fba2c;
}

.animal-switch.size-small .animal-switch-handle {
  width: 14px;
  height: 14px;
  left: 1px;
}

.animal-switch.size-small.is-checked .animal-switch-handle {
  left: calc(100% - 16px);
}

.animal-switch-inner {
  display: block;
  width: 100%;
  padding: 0 8px 0 28px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  line-height: 1;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.02em;
  pointer-events: none;
}

.animal-switch.is-checked .animal-switch-inner {
  padding: 0 28px 0 8px;
}

.animal-switch.size-small .animal-switch-inner {
  padding: 0 6px 0 20px;
  font-size: 9px;
}

.animal-switch.size-small.is-checked .animal-switch-inner {
  padding: 0 20px 0 6px;
}

.animal-switch-spinner {
  display: inline-block;
  width: 11px;
  height: 11px;
  border: 2px solid #a89878;
  border-right-color: transparent;
  border-radius: 50%;
  animation: animal-switch-spin 0.6s linear infinite;
}

.animal-switch.is-checked .animal-switch-spinner {
  border-color: #6fba2c;
  border-right-color: transparent;
}

@keyframes animal-switch-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
