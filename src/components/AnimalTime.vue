<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'game' },
  compact: { type: Boolean, default: false },
})

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekdaysCN = ['日', '一', '二', '三', '四', '五', '六']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const currentTime = ref(new Date())
let timer = null

const hours = computed(() => currentTime.value.getHours().toString().padStart(2, '0'))
const minutes = computed(() => currentTime.value.getMinutes().toString().padStart(2, '0'))
const monthDay = computed(() => `${currentTime.value.getMonth() + 1}月${currentTime.value.getDate()}日`)
const weekdayCN = computed(() => weekdaysCN[currentTime.value.getDay()])
const weekdayEN = computed(() => weekdays[currentTime.value.getDay()])
const monthDayEN = computed(() => `${months[currentTime.value.getMonth()]} ${currentTime.value.getDate()}`)

onMounted(() => {
  timer = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <div
    class="animal-time"
    :class="[
      type === 'game' ? 'animal-time-game' : 'animal-time-hud',
      { compact },
    ]"
    role="timer"
    aria-live="polite"
    :aria-label="`${monthDay} 星期${weekdayCN} ${hours}:${minutes}`"
  >
    <template v-if="type === 'game'">
      <div class="game-time">
        <span>{{ hours }}</span>
        <span class="game-colon">:</span>
        <span>{{ minutes }}</span>
      </div>
      <div class="game-divider" aria-hidden="true" />
      <div class="game-date">
        <span class="game-monthday">{{ monthDay }}</span>
        <span class="game-weekday">{{ weekdayCN }}</span>
      </div>
    </template>

    <template v-else>
      <div class="hud-date">
        <span class="hud-weekday">{{ weekdayEN }}</span>
        <span class="hud-monthday">{{ monthDayEN }}</span>
      </div>
      <div class="hud-time">
        <span>{{ hours }}</span>
        <span class="hud-colon">:</span>
        <span>{{ minutes }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animal-time {
  animation: animal-time-fade-up 0.5s ease-out;
}

.animal-time-hud {
  display: inline-flex;
  gap: 20px;
  align-items: center;
  width: fit-content;
  padding: 16px 36px;
  background: linear-gradient(180deg, #fff 0%, #f8f8f0 100%);
  border: 3px solid #d4cfc3;
  border-radius: 18px;
}

.hud-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 24px;
  border-right: 3px solid rgba(159, 146, 125, 0.35);
}

.hud-weekday {
  color: #6fba2c;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.hud-monthday {
  color: #8b7355;
  font-weight: 800;
  font-size: 22px;
}

.hud-time {
  display: flex;
  align-items: center;
  color: #8b7355;
  font-weight: 900;
  font-size: 48px;
  letter-spacing: 2px;
  line-height: 1;
}

.hud-colon {
  position: relative;
  top: -0.08em;
  margin: 0 1px;
  animation: animal-time-blink 1s step-end infinite;
}

.animal-time-game {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
}

.game-time {
  display: flex;
  align-items: center;
  color: #8b7355;
  font-weight: 900;
  font-size: 40px;
  letter-spacing: 2px;
  line-height: 1;
}

.game-colon {
  position: relative;
  top: -0.08em;
  margin: 0 1px;
  animation: animal-time-blink 1s step-end infinite;
}

.game-divider {
  width: calc(100% + 5px);
  height: 3px;
  margin-top: 4px;
  background: rgba(159, 146, 125, 0.35);
  border-radius: 2px;
}

.game-date {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 5px;
}

.game-monthday {
  color: #8b7355;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: 2px;
}

.game-weekday {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 27px;
  border-radius: 999px;
  background: #fffbe7;
  color: #8b7355;
  font-weight: 900;
  font-size: 18px;
  line-height: 1;
  letter-spacing: 1px;
}

.animal-time-hud.compact {
  gap: 12px;
  padding: 6px 14px;
  border-width: 2px;
  border-radius: 14px;
}

.animal-time-hud.compact .hud-date {
  padding-right: 12px;
  border-right-width: 2px;
}

.animal-time-hud.compact .hud-weekday {
  font-size: 10px;
  letter-spacing: 1px;
}

.animal-time-hud.compact .hud-monthday {
  font-size: 14px;
}

.animal-time-hud.compact .hud-time {
  font-size: 28px;
  letter-spacing: 1px;
}

.animal-time-game.compact .game-time {
  font-size: 28px;
  letter-spacing: 1px;
}

.animal-time-game.compact .game-divider {
  height: 2px;
  margin-top: 2px;
}

.animal-time-game.compact .game-date {
  gap: 10px;
  margin-top: 3px;
}

.animal-time-game.compact .game-monthday {
  font-size: 14px;
  letter-spacing: 1px;
}

.animal-time-game.compact .game-weekday {
  padding: 0 10px;
  height: 22px;
  font-size: 13px;
}

[data-theme='dark'] .animal-time-hud {
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg) 100%);
  border-color: var(--border-strong);
}

[data-theme='dark'] .hud-weekday,
[data-theme='dark'] .game-weekday {
  background: rgba(255, 251, 231, 0.12);
}

[data-theme='dark'] .hud-weekday {
  color: #8ac68a;
}

[data-theme='dark'] .hud-monthday,
[data-theme='dark'] .hud-time,
[data-theme='dark'] .game-time,
[data-theme='dark'] .game-monthday,
[data-theme='dark'] .game-weekday {
  color: var(--text-body);
}

@keyframes animal-time-blink {
  50% { opacity: 0; }
}

@keyframes animal-time-fade-up {
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
  .animal-time {
    animation: none;
  }

  .hud-colon,
  .game-colon {
    animation: none;
  }
}
</style>
