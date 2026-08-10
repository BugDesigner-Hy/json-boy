<script setup>
import { computed } from 'vue'
import { ANIMAL_ICON_URLS } from '../assets/animal-icons.js'

const props = defineProps({
  name: { type: String, default: '' },
  src: { type: String, default: '' },
  size: { type: [Number, String], default: 24 },
  bounce: { type: Boolean, default: false },
  label: { type: String, default: '' },
})

const iconStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  let backgroundImage
  if (props.src) {
    backgroundImage = `url(${props.src})`
  } else if (props.name && ANIMAL_ICON_URLS[props.name]) {
    backgroundImage = `url(${ANIMAL_ICON_URLS[props.name]})`
  }
  return {
    width: size,
    height: size,
    ...(backgroundImage ? { backgroundImage } : {}),
  }
})
</script>

<template>
  <span
    class="animal-icon"
    :class="{ 'animal-icon-bounce': bounce }"
    :style="iconStyle"
    :aria-label="label || undefined"
    :role="label ? 'img' : undefined"
  />
</template>

<style scoped>
.animal-icon {
  display: inline-block;
  flex-shrink: 0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  vertical-align: middle;
}

.animal-icon-bounce:hover {
  animation: animal-icon-bounce 0.3s ease-in-out forwards;
}

@keyframes animal-icon-bounce {
  0% {
    transform: scale(1) rotate(0);
  }
  50% {
    transform: scale(1.2) rotate(-5deg);
  }
  100% {
    transform: scale(1.1) rotate(-4deg);
  }
}
</style>
