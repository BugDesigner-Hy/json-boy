<script setup>
import { computed } from 'vue'
import { itemIconUrl } from '../assets/animal-icons.js'

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  size: {
    type: String,
    default: 'medium',
    validator: (v) => ['small', 'medium', 'large'].includes(v),
  },
  iconSrc: { type: String, default: '' },
  thousandSeparator: { type: String, default: ',' },
})

const defaultBagIcon = itemIconUrl(22)

const formattedValue = computed(() => {
  const { value, thousandSeparator: sep } = props
  if (value === undefined || value === null) return '0'
  if (typeof value !== 'number') return String(value)
  if (!sep) return String(value)
  const sign = value < 0 ? '-' : ''
  const [intPart, fracPart] = Math.abs(value).toString().split('.')
  const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep)
  return fracPart ? `${sign}${intWithSep}.${fracPart}` : `${sign}${intWithSep}`
})

const bagIcon = computed(() => props.iconSrc || defaultBagIcon)
</script>

<template>
  <div
    class="animal-wallet"
    :class="[`size-${size}`]"
    role="status"
    :aria-label="`JSON 字数 ${formattedValue}`"
  >
    <div class="bag-slot" aria-hidden="true">
      <img class="bag-icon" :src="bagIcon" alt="" draggable="false" />
    </div>
    <div class="pill">
      <span class="value">{{ formattedValue }}</span>
    </div>
  </div>
</template>

<style scoped>
.animal-wallet {
  --wallet-pill-w: 132px;
  --wallet-pill-h: 42px;
  --wallet-bag: 50px;
  --wallet-text-size: 17px;
  --wallet-halo: 4px;

  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  min-width: var(--wallet-pill-w);
  padding-top: calc(var(--wallet-bag) * 0.7);
  user-select: none;
  line-height: 1;
  animation: animal-wallet-fade-up 0.5s ease-out;
}

.animal-wallet.size-small {
  --wallet-pill-w: 96px;
  --wallet-pill-h: 32px;
  --wallet-bag: 38px;
  --wallet-text-size: 12px;
  --wallet-halo: 3px;
}

.animal-wallet.size-large {
  --wallet-pill-w: 176px;
  --wallet-pill-h: 54px;
  --wallet-bag: 66px;
  --wallet-text-size: 22px;
  --wallet-halo: 6px;
}

.bag-slot {
  position: absolute;
  left: 50%;
  top: 0;
  width: var(--wallet-bag);
  height: var(--wallet-bag);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  filter: drop-shadow(0 4px 6px rgba(91, 78, 30, 0.18));
  animation: wallet-bag-idle 3s ease-in-out infinite;
}

.bag-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.pill {
  position: relative;
  width: 100%;
  min-width: var(--wallet-pill-w);
  height: var(--wallet-pill-h);
  border-radius: 999px;
  background: #b3a046;
  box-shadow:
    inset 0 -6px 0 rgba(91, 78, 30, 0.18),
    inset 0 0 0 2px rgba(91, 78, 30, 0.12),
    0 0 0 var(--wallet-halo) #fffbe7,
    0 6px 14px rgba(91, 78, 30, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.value {
  font-family: Nunito, 'Noto Sans SC', system-ui, sans-serif;
  font-weight: 800;
  font-size: var(--wallet-text-size);
  color: #fff;
  letter-spacing: 0.04em;
  text-shadow:
    0 2px 0 rgba(91, 78, 30, 0.55),
    0 0 1px rgba(91, 78, 30, 0.55);
  font-variant-numeric: tabular-nums;
  padding: 0 12px;
  white-space: nowrap;
}

.animal-wallet:hover .bag-slot {
  animation: wallet-bag-bounce 0.5s ease-in-out;
}

@keyframes wallet-bag-idle {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }
  50% {
    transform: translateX(-50%) translateY(-4px) rotate(-3deg);
  }
}

@keyframes wallet-bag-bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }
  35% {
    transform: translateX(-50%) translateY(-8px) rotate(-6deg);
  }
  70% {
    transform: translateX(-50%) translateY(-2px) rotate(3deg);
  }
}

@keyframes animal-wallet-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animal-wallet {
    animation: none;
  }

  .bag-slot {
    animation: none;
  }

  .animal-wallet:hover .bag-slot {
    animation: none;
  }
}
</style>
