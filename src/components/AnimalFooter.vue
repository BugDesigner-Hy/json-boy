<script setup>
import { computed } from 'vue'
import { ANIMAL_FOOTER_SEA, ANIMAL_FOOTER_TREE } from '../assets/animal-icons.js'

const props = defineProps({
  type: { type: String, default: 'tree' },
  seamless: { type: Boolean, default: true },
})

const backgroundImage = computed(() =>
  props.type === 'sea' ? ANIMAL_FOOTER_SEA : ANIMAL_FOOTER_TREE
)
</script>

<template>
  <footer
    class="animal-footer"
    :class="[type, { seamless }]"
    role="contentinfo"
    aria-hidden="true"
    :style="{ backgroundImage: `url('${backgroundImage}')` }"
  />
</template>

<style scoped>
.animal-footer {
  width: 100%;
  height: 80px;
  flex-shrink: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.animal-footer.sea {
  background-position: center;
  background-size: contain;
}

.animal-footer.tree {
  height: 60px;
  background-size: cover;
  background-position: bottom center;
}

.animal-footer.seamless {
  background-repeat: repeat-x;
  background-size: auto 100%;
  background-position: left bottom;
}

.animal-footer.tree.seamless {
  background-size: auto 100%;
}
</style>
