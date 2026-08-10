<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'small',
    validator: (v) => ['small', 'medium', 'large'].includes(v),
  },
  variant: {
    type: String,
    default: 'solid',
    validator: (v) => ['solid', 'outlined', 'dashed', 'soft'].includes(v),
  },
  color: {
    type: String,
    default: 'default',
    validator: (v) =>
      [
        'default',
        'app-pink',
        'purple',
        'app-blue',
        'app-yellow',
        'app-orange',
        'app-teal',
        'app-green',
        'app-red',
        'lime-green',
        'yellow-green',
        'brown',
        'warm-peach-pink',
      ].includes(v),
  },
  closable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
})

const emit = defineEmits(['click', 'close'])

const tagClasses = computed(() => {
  const classes = [`size-${props.size}`]
  if (props.color === 'default') {
    classes.push(`variant-${props.variant}`)
  } else {
    classes.push(`color-${props.color}-${props.variant}`)
  }
  if (props.clickable && !props.disabled) classes.push('is-clickable')
  if (props.disabled) classes.push('is-disabled')
  return classes
})

function onClick(e) {
  if (props.disabled || !props.clickable) return
  emit('click', e)
}

function onClose(e) {
  e.stopPropagation()
  if (props.disabled) return
  emit('close', e)
}

function onKeyDown(e) {
  if (!props.clickable || props.disabled) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('click', e)
  }
}
</script>

<template>
  <span
    class="animal-tag"
    :class="tagClasses"
    :role="clickable && !disabled ? 'button' : undefined"
    :tabindex="clickable && !disabled ? 0 : undefined"
    @click="onClick"
    @keydown="onKeyDown"
  >
    <span class="animal-tag-text"><slot /></span>
    <button
      v-if="closable"
      type="button"
      class="animal-tag-close"
      aria-label="close"
      :disabled="disabled"
      @click="onClose"
    >
      ×
    </button>
  </span>
</template>

<style scoped>
.animal-tag {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
  font-family: inherit;
  font-weight: 600;
  border-radius: 999px;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
  vertical-align: middle;
}

.animal-tag.size-small {
  height: 24px;
  line-height: 24px;
  padding: 0 10px;
  font-size: 12px;
}

.animal-tag.size-medium {
  height: 29px;
  line-height: 29px;
  padding: 0 12px;
  font-size: 13px;
}

.animal-tag.size-large {
  height: 34px;
  line-height: 34px;
  padding: 0 16px;
  font-size: 15px;
}

.animal-tag.variant-solid {
  background: #f7f3df;
  color: #8f734f;
  border-color: #d4c4a8;
}

.animal-tag.variant-outlined {
  background: transparent;
  color: #8f734f;
  border-color: #c4b89e;
}

.animal-tag.variant-dashed {
  background: transparent;
  color: #8f734f;
  border-style: dashed;
  border-color: #c4b89e;
}

.animal-tag.variant-soft {
  background: #f5f0e6;
  color: #8f734f;
  border-color: transparent;
}

.animal-tag.color-app-pink-solid { background: #f8a6b2; border-color: #f8a6b2; color: #fff; }
.animal-tag.color-purple-solid { background: #b77dee; border-color: #b77dee; color: #fff; }
.animal-tag.color-app-blue-solid { background: #889df0; border-color: #889df0; color: #fff; }
.animal-tag.color-app-yellow-solid { background: #f7cd67; border-color: #f7cd67; color: #fff; }
.animal-tag.color-app-orange-solid { background: #e59266; border-color: #e59266; color: #fff; }
.animal-tag.color-app-teal-solid { background: #82d5bb; border-color: #82d5bb; color: #fff; }
.animal-tag.color-app-green-solid { background: #8ac68a; border-color: #8ac68a; color: #fff; }
.animal-tag.color-app-red-solid { background: #fc736d; border-color: #fc736d; color: #fff; }
.animal-tag.color-lime-green-solid { background: #d1da49; border-color: #d1da49; color: #fff; }
.animal-tag.color-yellow-green-solid { background: #ecdf52; border-color: #ecdf52; color: #fff; }
.animal-tag.color-brown-solid { background: #9a835a; border-color: #9a835a; color: #fff; }
.animal-tag.color-warm-peach-pink-solid { background: #e18c6f; border-color: #e18c6f; color: #fff; }

.animal-tag.color-app-pink-soft { background: #fce4ec; color: #c2185b; border-color: transparent; }
.animal-tag.color-purple-soft { background: #f3e5f5; color: #7b1fa2; border-color: transparent; }
.animal-tag.color-app-blue-soft { background: #e6f0ff; color: #1565c0; border-color: transparent; }
.animal-tag.color-app-yellow-soft { background: #fff8e1; color: #f9a825; border-color: transparent; }
.animal-tag.color-app-orange-soft { background: #fff3e0; color: #e65100; border-color: transparent; }
.animal-tag.color-app-teal-soft { background: #e0f2f1; color: #00695c; border-color: transparent; }
.animal-tag.color-app-green-soft { background: #e8f5e9; color: #2e7d32; border-color: transparent; }
.animal-tag.color-app-red-soft { background: #ffebee; color: #c62828; border-color: transparent; }
.animal-tag.color-lime-green-soft { background: #f1f8e9; color: #558b2f; border-color: transparent; }
.animal-tag.color-yellow-green-soft { background: #f9fbe7; color: #827717; border-color: transparent; }
.animal-tag.color-brown-soft { background: #efebe9; color: #4e342e; border-color: transparent; }
.animal-tag.color-warm-peach-pink-soft { background: #fbe9e7; color: #bf360c; border-color: transparent; }

.animal-tag.color-app-pink-outlined,
.animal-tag.color-app-pink-dashed { color: #f8a6b2; border-color: #f8a6b2; background: transparent; }
.animal-tag.color-purple-outlined,
.animal-tag.color-purple-dashed { color: #b77dee; border-color: #b77dee; background: transparent; }
.animal-tag.color-app-blue-outlined,
.animal-tag.color-app-blue-dashed { color: #889df0; border-color: #889df0; background: transparent; }
.animal-tag.color-app-yellow-outlined,
.animal-tag.color-app-yellow-dashed { color: #f7cd67; border-color: #f7cd67; background: transparent; }
.animal-tag.color-app-orange-outlined,
.animal-tag.color-app-orange-dashed { color: #e59266; border-color: #e59266; background: transparent; }
.animal-tag.color-app-teal-outlined,
.animal-tag.color-app-teal-dashed { color: #82d5bb; border-color: #82d5bb; background: transparent; }
.animal-tag.color-app-green-outlined,
.animal-tag.color-app-green-dashed { color: #8ac68a; border-color: #8ac68a; background: transparent; }
.animal-tag.color-app-red-outlined,
.animal-tag.color-app-red-dashed { color: #fc736d; border-color: #fc736d; background: transparent; }
.animal-tag.color-lime-green-outlined,
.animal-tag.color-lime-green-dashed { color: #d1da49; border-color: #d1da49; background: transparent; }
.animal-tag.color-yellow-green-outlined,
.animal-tag.color-yellow-green-dashed { color: #ecdf52; border-color: #ecdf52; background: transparent; }
.animal-tag.color-brown-outlined,
.animal-tag.color-brown-dashed { color: #9a835a; border-color: #9a835a; background: transparent; }
.animal-tag.color-warm-peach-pink-outlined,
.animal-tag.color-warm-peach-pink-dashed { color: #e18c6f; border-color: #e18c6f; background: transparent; }

.animal-tag.color-app-pink-dashed,
.animal-tag.color-purple-dashed,
.animal-tag.color-app-blue-dashed,
.animal-tag.color-app-yellow-dashed,
.animal-tag.color-app-orange-dashed,
.animal-tag.color-app-teal-dashed,
.animal-tag.color-app-green-dashed,
.animal-tag.color-app-red-dashed,
.animal-tag.color-lime-green-dashed,
.animal-tag.color-yellow-green-dashed,
.animal-tag.color-brown-dashed,
.animal-tag.color-warm-peach-pink-dashed {
  border-style: dashed;
}

.animal-tag-text {
  color: inherit;
}

.animal-tag-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  margin-right: -4px;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: rgba(149, 143, 143, 0.08);
  color: inherit;
  font-size: 14px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease;
}

.animal-tag-close:hover {
  background: rgba(0, 0, 0, 0.18);
}

.animal-tag-close:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.animal-tag.is-clickable {
  cursor: pointer;
}

.animal-tag.is-clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(61, 52, 40, 0.12);
}

.animal-tag.is-clickable:active {
  transform: translateY(0);
}

.animal-tag.is-clickable:focus-visible {
  outline: 2px solid var(--focus-yellow, #f5c31c);
  outline-offset: 2px;
}

.animal-tag.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
