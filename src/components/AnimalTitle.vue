<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'middle',
    validator: (v) => ['small', 'middle', 'large'].includes(v),
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
  clickable: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
})

const emit = defineEmits(['click'])

const SIZE_MAP = { small: 14, middle: 20, large: 28 }

const fontSize = computed(() => `${SIZE_MAP[props.size]}px`)

const ribbonClass = computed(() => {
  if (props.color === 'default') return ''
  return `animal-title__ribbon--${props.color}`
})

const isMagic = ref(false)
let magicTimer = null

function triggerMagic() {
  isMagic.value = false
  requestAnimationFrame(() => {
    isMagic.value = true
    if (magicTimer) clearTimeout(magicTimer)
    magicTimer = setTimeout(() => {
      isMagic.value = false
    }, 680)
  })
}

watch(
  () => props.color,
  (next, prev) => {
    if (next !== prev) triggerMagic()
  }
)

onBeforeUnmount(() => {
  if (magicTimer) clearTimeout(magicTimer)
})

function handleClick(e) {
  if (!props.clickable) return
  emit('click', e)
}

function onKeyDown(e) {
  if (!props.clickable) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('click', e)
  }
}

const sparkles = [
  { tx: '-28px', ty: '-22px', delay: '0ms' },
  { tx: '26px', ty: '-24px', delay: '30ms' },
  { tx: '-34px', ty: '4px', delay: '50ms' },
  { tx: '32px', ty: '6px', delay: '20ms' },
  { tx: '-18px', ty: '20px', delay: '40ms' },
  { tx: '20px', ty: '18px', delay: '60ms' },
  { tx: '0px', ty: '-30px', delay: '10ms' },
  { tx: '0px', ty: '26px', delay: '35ms' },
]
</script>

<template>
  <component
    :is="clickable ? 'button' : 'span'"
    class="animal-title"
    :class="{ 'is-clickable': clickable }"
    :style="{ fontSize }"
    :type="clickable ? 'button' : undefined"
    :aria-label="clickable ? ariaLabel || '点击切换标题配色' : undefined"
    @click="handleClick"
    @keydown="onKeyDown"
  >
    <span
      class="animal-title__ribbon"
      :class="[ribbonClass, { 'is-magic': isMagic }]"
    >
      <span
        v-for="(sparkle, index) in sparkles"
        :key="index"
        class="animal-title__sparkle"
        :style="{
          '--tx': sparkle.tx,
          '--ty': sparkle.ty,
          animationDelay: sparkle.delay,
        }"
        aria-hidden="true"
      >
        ✦
      </span>
      <span class="animal-title__ribbon-back animal-title__ribbon-back--left" />
      <span class="animal-title__ribbon-back animal-title__ribbon-back--right" />
      <span class="animal-title__ribbon-fold animal-title__ribbon-fold--left" />
      <span class="animal-title__ribbon-fold animal-title__ribbon-fold--right" />
      <span class="animal-title__ribbon-front" />
      <span class="animal-title__ribbon-text">
        <slot />
      </span>
    </span>
  </component>
</template>

<style scoped>
.animal-title {
  display: inline-block;
  font-family: 'Nunito', 'Noto Sans SC', sans-serif;
  font-weight: 800;
  line-height: 1;
  user-select: none;
  border: none;
  padding: 0;
  background: none;
  overflow: visible;
}

.animal-title.is-clickable {
  cursor: pointer;
}

.animal-title.is-clickable:hover .animal-title__ribbon {
  filter: drop-shadow(0 0.08em 0.12em rgba(0, 0, 0, 0.08))
    drop-shadow(0 0 0.45em rgba(255, 204, 0, 0.35));
}

.animal-title.is-clickable:active .animal-title__ribbon {
  transform: scale(0.98);
}

.animal-title.is-clickable:focus-visible {
  outline: 2px solid #ffcc00;
  outline-offset: 4px;
  border-radius: 8px;
}

.animal-title__ribbon {
  --rf: #27d039;
  --rb: #20992a;
  --rk: #115017;
  --rt: #fff;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2em;
  padding: 0 1.6em;
  color: var(--rt);
  font-weight: 900;
  letter-spacing: 0.04em;
  white-space: nowrap;
  filter: drop-shadow(0 0.08em 0.12em rgba(0, 0, 0, 0.08));
  overflow: visible;
  transition: filter 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.animal-title__ribbon.is-magic {
  animation: titleMagicPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animal-title__sparkle {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 6;
  margin-left: -0.35em;
  margin-top: -0.35em;
  font-size: 0.72em;
  line-height: 1;
  color: #fff;
  opacity: 0;
  pointer-events: none;
  text-shadow:
    0 0 4px #ffcc00,
    0 0 8px rgba(255, 255, 255, 0.95);
}

.animal-title__ribbon.is-magic .animal-title__sparkle {
  animation: titleSparkleBurst 0.65s ease-out forwards;
}

.animal-title__ribbon-text {
  position: relative;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 2em;
  padding-top: 0.11em;
  color: var(--rt);
  text-shadow: 0 0.04em 0.08em rgba(0, 0, 0, 0.05);
}

.animal-title__ribbon-back {
  position: absolute;
  font-size: inherit;
  bottom: -0.4em;
  width: 1.7em;
  height: 1.7em;
  background: var(--rb);
  z-index: 1;
}

.animal-title__ribbon-back--left {
  left: -0.6em;
  border-radius: 0.08em 0 0 0.08em;
  clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 30% 50%, 0% 0%);
}

.animal-title__ribbon-back--right {
  right: -0.6em;
  border-radius: 0 0.08em 0.08em 0;
  clip-path: polygon(0% 0%, 100% 0%, 70% 50%, 100% 100%, 0% 100%);
}

.animal-title__ribbon-fold {
  position: absolute;
  font-size: inherit;
  width: 0;
  height: 0;
  border-style: solid;
  z-index: 2;
}

.animal-title__ribbon-fold--left {
  left: 0.15em;
  top: calc(100% - 0.05em);
  border-width: 0 0.95em 0.45em 0;
  border-color: transparent var(--rk) transparent transparent;
}

.animal-title__ribbon-fold--right {
  right: 0.16em;
  top: calc(100% - 0.05em);
  border-width: 0 0 0.45em 0.95em;
  border-color: transparent transparent transparent var(--rk);
}

.animal-title__ribbon-front {
  position: absolute;
  font-size: inherit;
  inset: 0 0.1em;
  background: var(--rf);
  border-radius: 0.2em;
  z-index: 3;
  transform: perspective(11.5em) rotateX(3deg);
  box-shadow: inset 0 -0.06em 0 rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.animal-title__ribbon--app-pink {
  --rf: #f8a6b2;
  --rb: #e06880;
  --rk: #a03060;
  --rt: #fff;
}

.animal-title__ribbon--purple {
  --rf: #b77dee;
  --rb: #9050d0;
  --rk: #5a1a9a;
  --rt: #fff;
}

.animal-title__ribbon--app-blue {
  --rf: #889df0;
  --rb: #5068d8;
  --rk: #2030a0;
  --rt: #fff;
}

.animal-title__ribbon--app-yellow {
  --rf: #f7cd67;
  --rb: #d4a030;
  --rk: #8a6010;
  --rt: #725d42;
}

.animal-title__ribbon--app-orange {
  --rf: #e59266;
  --rb: #c06a30;
  --rk: #7a3a10;
  --rt: #fff;
}

.animal-title__ribbon--app-teal {
  --rf: #82d5bb;
  --rb: #40a880;
  --rk: #186048;
  --rt: #fff;
}

.animal-title__ribbon--app-green {
  --rf: #8ac68a;
  --rb: #509050;
  --rk: #205020;
  --rt: #fff;
}

.animal-title__ribbon--app-red {
  --rf: #fc736d;
  --rb: #d43030;
  --rk: #900010;
  --rt: #fff;
}

.animal-title__ribbon--lime-green {
  --rf: #d1da49;
  --rb: #90a010;
  --rk: #485800;
  --rt: #3d5a1a;
}

.animal-title__ribbon--yellow-green {
  --rf: #ecdf52;
  --rb: #c0b010;
  --rk: #706800;
  --rt: #725d42;
}

.animal-title__ribbon--brown {
  --rf: #9a835a;
  --rb: #705830;
  --rk: #3a2810;
  --rt: #fff;
}

.animal-title__ribbon--warm-peach-pink {
  --rf: #e18c6f;
  --rb: #b85a30;
  --rk: #6a2a10;
  --rt: #fff;
}

@keyframes titleMagicPop {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0.08em 0.12em rgba(0, 0, 0, 0.08));
  }
  40% {
    transform: scale(1.1);
    filter: drop-shadow(0 0.08em 0.12em rgba(0, 0, 0, 0.08))
      drop-shadow(0 0 0.8em rgba(255, 204, 0, 0.75));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0.08em 0.12em rgba(0, 0, 0, 0.08));
  }
}

@keyframes titleSparkleBurst {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.2) rotate(0deg);
  }
  25% {
    opacity: 1;
    transform: translate(var(--tx), var(--ty)) scale(1.1) rotate(45deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--tx) * 1.6), calc(var(--ty) * 1.6)) scale(0.15)
      rotate(120deg);
  }
}
</style>
