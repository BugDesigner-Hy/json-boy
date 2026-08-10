<script setup>
import { computed } from 'vue'
import { ANIMAL_DIVIDER_URLS } from '../assets/animal-icons.js'

const props = defineProps({
  type: { type: String, default: 'line-brown' },
})

const isDashed = computed(() => props.type.startsWith('dashed-'))

const dividerStyle = computed(() => {
  if (isDashed.value) return undefined
  const url = ANIMAL_DIVIDER_URLS[props.type] || ANIMAL_DIVIDER_URLS['line-brown']
  return {
    backgroundImage: `url('${url}')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
  }
})
</script>

<template>
  <div
    class="animal-divider"
    :class="type"
    role="separator"
    aria-hidden="true"
    :style="dividerStyle"
  />
</template>

<style scoped>
.animal-divider {
  width: 100%;
  height: 12px;
  flex-shrink: 0;
}

.animal-divider.dashed-brown,
.animal-divider.dashed-teal,
.animal-divider.dashed-white,
.animal-divider.dashed-yellow {
  background-image: none;
  background-repeat: repeat-x;
  background-position: center;
  background-size: 12px 2px;
}

.animal-divider.dashed-brown {
  background: linear-gradient(to right, #c4b89e 50%, transparent 50%) center / 12px 2px repeat-x;
}

.animal-divider.dashed-teal {
  background: linear-gradient(to right, #19c8b9 50%, transparent 50%) center / 12px 2px repeat-x;
}

.animal-divider.dashed-white {
  background: linear-gradient(to right, #ffffff 50%, transparent 50%) center / 12px 2px repeat-x;
}

.animal-divider.dashed-yellow {
  background: linear-gradient(to right, #f5d04a 50%, transparent 50%) center / 12px 2px repeat-x;
}
</style>
