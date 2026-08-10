<script setup>
import { computed, onBeforeUnmount, ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const props = defineProps({
  title: { type: String, default: '' },
  placement: {
    type: String,
    default: 'top',
    validator: (v) =>
      [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ].includes(v),
  },
  trigger: {
    type: String,
    default: 'hover',
    validator: (v) => ['hover', 'focus', 'click'].includes(v),
  },
  bordered: { type: Boolean, default: true },
})

const visible = ref(false)
let timer = null

function show() {
  if (timer) clearTimeout(timer)
  visible.value = true
}

function hide() {
  timer = setTimeout(() => {
    visible.value = false
  }, 100)
}

function toggle() {
  visible.value = !visible.value
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

const placementClass = computed(() =>
  `animal-tooltip__bubble--${props.placement.replace(/-/g, '_')}`
)

const triggerHandlers = computed(() => {
  if (props.trigger === 'hover') {
    return { onMouseenter: show, onMouseleave: hide }
  }
  if (props.trigger === 'focus') {
    return { onFocusin: show, onFocusout: hide }
  }
  return { onClick: toggle }
})

const hasContent = computed(() => Boolean(props.title))
</script>

<template>
  <span class="animal-tooltip" v-bind="attrs">
    <span class="animal-tooltip__trigger" v-on="triggerHandlers">
      <slot />
    </span>
    <div
      v-if="hasContent || $slots.title"
      role="tooltip"
      class="animal-tooltip__bubble"
      :class="[
        placementClass,
        {
          'animal-tooltip__bubble--visible': visible,
          'animal-tooltip__bubble--bordered': bordered,
          'animal-tooltip__bubble--borderless': !bordered,
        },
      ]"
    >
      <div class="animal-tooltip__content">
        <slot name="title">{{ title }}</slot>
      </div>
    </div>
  </span>
</template>

<style scoped>
.animal-tooltip {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  font-family: 'Nunito', 'Noto Sans SC', sans-serif;
}

.animal-tooltip__trigger {
  display: inline-flex;
}

.animal-tooltip__bubble {
  position: absolute;
  z-index: 1000;
  box-sizing: border-box;
  width: max-content;
  max-width: 240px;
  padding: 6px 12px;
  background: rgb(247, 243, 223);
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(61, 52, 40, 0.1);
  color: #725d42;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.01em;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.animal-tooltip__bubble--visible {
  opacity: 1;
  pointer-events: auto;
}

.animal-tooltip__bubble::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgb(247, 243, 223);
  border-radius: 2px;
}

.animal-tooltip__bubble--bordered {
  border: 2px solid #c4b89e;
}

.animal-tooltip__bubble--borderless::after {
  border: none !important;
}

.animal-tooltip__content {
  position: relative;
  z-index: 1;
  white-space: pre-line;
  word-break: break-word;
}

.animal-tooltip__bubble--top {
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
}

.animal-tooltip__bubble--top.animal-tooltip__bubble--visible {
  transform: translateX(-50%) translateY(0);
}

.animal-tooltip__bubble--top::after {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-right: 2px solid #c4b89e;
  border-bottom: 2px solid #c4b89e;
}

.animal-tooltip__bubble--top_start {
  bottom: calc(100% + 10px);
  left: 0;
  transform: translateY(4px);
}

.animal-tooltip__bubble--top_start.animal-tooltip__bubble--visible {
  transform: translateY(0);
}

.animal-tooltip__bubble--top_start::after {
  bottom: -5px;
  left: 16px;
  transform: rotate(45deg);
  border-right: 2px solid #c4b89e;
  border-bottom: 2px solid #c4b89e;
}

.animal-tooltip__bubble--top_end {
  bottom: calc(100% + 10px);
  right: 0;
  transform: translateY(4px);
}

.animal-tooltip__bubble--top_end.animal-tooltip__bubble--visible {
  transform: translateY(0);
}

.animal-tooltip__bubble--top_end::after {
  bottom: -5px;
  right: 16px;
  transform: rotate(45deg);
  border-right: 2px solid #c4b89e;
  border-bottom: 2px solid #c4b89e;
}

.animal-tooltip__bubble--bottom {
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
}

.animal-tooltip__bubble--bottom.animal-tooltip__bubble--visible {
  transform: translateX(-50%) translateY(0);
}

.animal-tooltip__bubble--bottom::after {
  top: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-top: 2px solid #c4b89e;
  border-left: 2px solid #c4b89e;
}

.animal-tooltip__bubble--bottom_start {
  top: calc(100% + 10px);
  left: 0;
  transform: translateY(-4px);
}

.animal-tooltip__bubble--bottom_start.animal-tooltip__bubble--visible {
  transform: translateY(0);
}

.animal-tooltip__bubble--bottom_start::after {
  top: -5px;
  left: 16px;
  transform: rotate(45deg);
  border-top: 2px solid #c4b89e;
  border-left: 2px solid #c4b89e;
}

.animal-tooltip__bubble--bottom_end {
  top: calc(100% + 10px);
  right: 0;
  transform: translateY(-4px);
}

.animal-tooltip__bubble--bottom_end.animal-tooltip__bubble--visible {
  transform: translateY(0);
}

.animal-tooltip__bubble--bottom_end::after {
  top: -5px;
  right: 16px;
  transform: rotate(45deg);
  border-top: 2px solid #c4b89e;
  border-left: 2px solid #c4b89e;
}

.animal-tooltip__bubble--left {
  right: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%) translateX(4px);
}

.animal-tooltip__bubble--left.animal-tooltip__bubble--visible {
  transform: translateY(-50%) translateX(0);
}

.animal-tooltip__bubble--left::after {
  right: -5px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-top: 2px solid #c4b89e;
  border-right: 2px solid #c4b89e;
}

.animal-tooltip__bubble--left_start {
  right: calc(100% + 10px);
  top: 0;
  transform: translateX(4px);
}

.animal-tooltip__bubble--left_start.animal-tooltip__bubble--visible {
  transform: translateX(0);
}

.animal-tooltip__bubble--left_start::after {
  right: -5px;
  top: 12px;
  transform: rotate(45deg);
  border-top: 2px solid #c4b89e;
  border-right: 2px solid #c4b89e;
}

.animal-tooltip__bubble--left_end {
  right: calc(100% + 10px);
  bottom: 0;
  transform: translateX(4px);
}

.animal-tooltip__bubble--left_end.animal-tooltip__bubble--visible {
  transform: translateX(0);
}

.animal-tooltip__bubble--left_end::after {
  right: -5px;
  bottom: 12px;
  transform: rotate(45deg);
  border-top: 2px solid #c4b89e;
  border-right: 2px solid #c4b89e;
}

.animal-tooltip__bubble--right {
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%) translateX(-4px);
}

.animal-tooltip__bubble--right.animal-tooltip__bubble--visible {
  transform: translateY(-50%) translateX(0);
}

.animal-tooltip__bubble--right::after {
  left: -5px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-bottom: 2px solid #c4b89e;
  border-left: 2px solid #c4b89e;
}

.animal-tooltip__bubble--right_start {
  left: calc(100% + 10px);
  top: 0;
  transform: translateX(-4px);
}

.animal-tooltip__bubble--right_start.animal-tooltip__bubble--visible {
  transform: translateX(0);
}

.animal-tooltip__bubble--right_start::after {
  left: -5px;
  top: 12px;
  transform: rotate(45deg);
  border-bottom: 2px solid #c4b89e;
  border-left: 2px solid #c4b89e;
}

.animal-tooltip__bubble--right_end {
  left: calc(100% + 10px);
  bottom: 0;
  transform: translateX(-4px);
}

.animal-tooltip__bubble--right_end.animal-tooltip__bubble--visible {
  transform: translateX(0);
}

.animal-tooltip__bubble--right_end::after {
  left: -5px;
  bottom: 12px;
  transform: rotate(45deg);
  border-bottom: 2px solid #c4b89e;
  border-left: 2px solid #c4b89e;
}
</style>
