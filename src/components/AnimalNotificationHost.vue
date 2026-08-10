<script setup>
import { computed } from 'vue'
import { notificationItems } from '../composables/animalNotification.js'
import AnimalNotificationItem from './AnimalNotificationItem.vue'

const POSITION_GROUPS = ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight']

const grouped = computed(() => {
  const map = {}
  for (const pos of POSITION_GROUPS) {
    map[pos] = notificationItems.value.filter((item) => item.position === pos)
  }
  return map
})
</script>

<template>
  <Teleport to="body">
    <div class="animal-notification-root" data-animal-notification-root>
      <div
        v-for="position in POSITION_GROUPS"
        :key="position"
        class="animal-notification-group"
        :class="`position-${position}`"
        :data-position="position"
      >
        <AnimalNotificationItem
          v-for="item in grouped[position]"
          :key="item.key"
          :item="item"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.animal-notification-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2000;
}

.animal-notification-group {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  max-width: calc(100vw - 32px);
}

.position-top {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.position-topLeft {
  top: 24px;
  left: 24px;
  align-items: flex-start;
}

.position-topRight {
  top: 24px;
  right: 24px;
  align-items: flex-end;
}

.position-bottom {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
  flex-direction: column-reverse;
}

.position-bottomLeft {
  bottom: 24px;
  left: 24px;
  align-items: flex-start;
  flex-direction: column-reverse;
}

.position-bottomRight {
  bottom: 24px;
  right: 24px;
  align-items: flex-end;
  flex-direction: column-reverse;
}
</style>
