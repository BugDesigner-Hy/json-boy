<template>
  <div class="json-tree-node" :class="{ 'is-root': isRoot }">
    <div
      ref="lineRef"
      class="node-line"
      :class="{ 'is-highlighted': isSearchMatch, 'is-match': isSearchMatch, 'is-current-match': isCurrentMatch }"
      @click="handleClick"
      @dblclick="handleDoubleClick"
      title="双击复制值"
    >
      <span
        v-if="isExpandable"
        class="toggle-icon"
        :class="{ expanded: isExpanded }"
        aria-hidden="true"
      >{{ isExpanded ? '−' : '+' }}</span>
      <span v-else class="toggle-placeholder"></span>

      <span v-if="showKey" class="node-key" :class="{ 'array-index': isArrayIndex }">
        {{ displayKey }}
      </span>
      <span v-if="!isRoot" class="node-colon">:</span>

      <span v-if="!isExpandable" class="node-value" :class="valueClass">
        {{ displayValue }}
      </span>
      <span v-else-if="!isExpanded" class="node-summary">
        {{ summary }}
      </span>

      <AnimalTag
        v-if="showDataType && typeLabel"
        class="node-type-tag"
        size="small"
        :variant="typeTagVariant"
        :color="typeTagColor"
      >
        {{ typeLabel }}
      </AnimalTag>
      <span class="node-count" v-if="isExpandable && !isExpanded">
        {{ childCount }} 项
      </span>
    </div>

    <transition name="expand">
      <div
        v-if="isExpandable && isExpanded"
        class="node-children"
        :class="coloredDepth ? 'depth-' + ((depth + 1) % 8) : ''"
      >
        <template v-if="isArray">
          <JsonTreeNode
            v-for="(item, index) in data"
            :key="nodePath + '.' + index"
            :data="item"
            :key-name="String(index)"
            :is-array-index="true"
            :depth="depth + 1"
            :node-path="nodePath + '.' + index"
            :search-query="searchQuery"
            :search-type="searchType"
            :expand-state="expandState"
            :font-size="fontSize"
            :font-color="fontColor"
            :current-match-path="currentMatchPath"
            :colored-depth="coloredDepth"
            :show-data-type="showDataType"
            :show-array-index="showArrayIndex"
            @node-click="$emit('nodeClick', $event)"
          />
        </template>
        <template v-else>
          <JsonTreeNode
            v-for="(value, key) in data"
            :key="nodePath + '.' + key"
            :data="value"
            :key-name="key"
            :depth="depth + 1"
            :node-path="nodePath + '.' + key"
            :search-query="searchQuery"
            :search-type="searchType"
            :expand-state="expandState"
            :font-size="fontSize"
            :font-color="fontColor"
            :current-match-path="currentMatchPath"
            :colored-depth="coloredDepth"
            :show-data-type="showDataType"
            :show-array-index="showArrayIndex"
            @node-click="$emit('nodeClick', $event)"
          />
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch, nextTick } from 'vue'
import AnimalTag from './AnimalTag.vue'
import { animalNotification } from '../composables/animalNotification.js'

const props = defineProps({
  data: { type: [Object, Array, String, Number, Boolean], default: null },
  keyName: { type: String, default: '' },
  isArrayIndex: { type: Boolean, default: false },
  depth: { type: Number, default: 0 },
  isRoot: { type: Boolean, default: false },
  nodePath: { type: String, default: 'root' },
  searchQuery: { type: String, default: '' },
  searchType: { type: String, default: 'all' },
  expandState: { type: Object, default: () => ({}) },
  fontSize: { type: Number, default: 14 },
  fontColor: { type: String, default: '#725d42' },
  currentMatchPath: { type: String, default: '' },
  coloredDepth: { type: Boolean, default: true },
  showDataType: { type: Boolean, default: true },
  showArrayIndex: { type: Boolean, default: true },
})

const expandState = inject('expandState')
const toggleNode = inject('toggleNode')
const typeTagVariant = inject('typeTagVariant', ref('soft'))
const typeTagColor = inject('typeTagColor', ref('default'))
const emit = defineEmits(['nodeClick'])
const lineRef = ref(null)

const isExpandable = computed(() => {
  return props.data !== null && typeof props.data === 'object'
})

const isArray = computed(() => Array.isArray(props.data))

const childCount = computed(() => {
  if (!isExpandable.value) return 0
  return Object.keys(props.data).length
})

const isExpanded = computed(() => {
  if (expandState[props.nodePath] !== undefined) {
    return expandState[props.nodePath]
  }
  return props.depth < 2
})

const showKey = computed(() => {
  if (props.isRoot && !props.keyName) return false
  if (props.isArrayIndex && !props.showArrayIndex) return false
  return true
})

const displayKey = computed(() => {
  if (props.isArrayIndex) return `[${props.keyName}]`
  return `"${props.keyName}"`
})

const displayValue = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return `"${props.data}"`
  return String(props.data)
})

const valueClass = computed(() => {
  if (props.data === null) return 'value-null'
  if (typeof props.data === 'string') return 'value-string'
  if (typeof props.data === 'number') return 'value-number'
  if (typeof props.data === 'boolean') return 'value-boolean'
  return ''
})

const summary = computed(() => {
  if (isArray.value) return '[ ... ]'
  return '{ ... }'
})

const leafType = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return 'String'
  if (typeof props.data === 'number') return Number.isInteger(props.data) ? 'Int' : 'Double'
  if (typeof props.data === 'boolean') return 'Boolean'
  return ''
})

const typeLabel = computed(() => {
  if (isExpandable.value) return isArray.value ? 'Array' : 'Object'
  return leafType.value
})

const isSearchMatch = computed(() => {
  if (!props.searchQuery || !props.searchQuery.trim()) return false
  const q = props.searchQuery.toLowerCase()
  const st = props.searchType

  if (st === 'key' || st === 'all') {
    if (props.keyName.toLowerCase().includes(q)) return true
  }
  if (st === 'value' || st === 'all') {
    if (!isExpandable.value) {
      const val = String(props.data).toLowerCase()
      if (val.includes(q)) return true
    }
  }
  return false
})

const isCurrentMatch = computed(() => {
  return props.currentMatchPath === props.nodePath
})

watch(() => isCurrentMatch.value, (val) => {
  if (val && lineRef.value) {
    nextTick(() => {
      const container = lineRef.value.closest('.tree-area')
      if (container) {
        const rect = lineRef.value.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const offset = rect.top - containerRect.top - container.clientHeight * 0.2
        container.scrollBy({ top: offset, behavior: 'smooth' })
      } else {
        lineRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }
})

function getNodeCopyValue() {
  if (props.data !== null && typeof props.data === 'object') {
    return JSON.stringify(props.data)
  }
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return props.data
  return String(props.data)
}

async function handleDoubleClick(event) {
  event.preventDefault()
  event.stopPropagation()
  try {
    await navigator.clipboard.writeText(getNodeCopyValue())
    animalNotification.success({
      message: '已复制到剪贴板',
      position: 'topRight',
      duration: 2.5,
    })
  } catch {
    animalNotification.error({
      message: '复制失败',
      position: 'topRight',
      duration: 2.5,
    })
  }
}

function handleClick() {
  emit('nodeClick', { nodePath: props.nodePath, keyName: props.keyName })
  if (!isExpandable.value) return
  if (!expandState[props.nodePath]) {
    expandState[props.nodePath] = true
  } else {
    expandState[props.nodePath] = false
  }
}
</script>

<style scoped>
.json-tree-node {
  user-select: text;
}

.node-line {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  cursor: default;
  transition: var(--transition);
  min-height: 24px;
  position: relative;
}

.node-line:hover {
  background: var(--hover-bg);
}

.json-tree-node > .node-line {
  cursor: pointer;
}

.node-line.is-match {
  background: var(--match-bg);
  border-left: 3px solid var(--match-border);
  padding-left: 5px;
}

.node-line.is-current-match {
  background: var(--match-pulse);
  box-shadow: inset 0 0 0 2px var(--match-border);
}

.node-line.is-highlighted {
  animation: highlightPulse 1s ease;
}

@keyframes highlightPulse {
  0% { background: var(--match-pulse); }
  100% { background: var(--match-bg); }
}

.toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 2px 4px rgba(25, 200, 185, 0.3);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  transition:
    background-color 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.toggle-icon.expanded {
  background: var(--primary-active);
  transform: rotate(180deg);
}

.toggle-placeholder {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.node-key {
  color: var(--node-key);
  font-weight: 600;
  white-space: nowrap;
}

.node-key.array-index {
  color: var(--node-index);
}

.node-colon {
  color: var(--node-colon);
  margin-right: 4px;
  font-weight: 600;
}

.node-value {
  word-break: break-all;
}

.value-string {
  color: var(--node-string);
}

.value-number {
  color: var(--node-number);
  font-weight: 600;
}

.value-boolean {
  color: var(--node-boolean);
  font-weight: 600;
}

.value-null {
  color: var(--node-null);
  font-style: italic;
}

.node-summary {
  color: var(--node-summary);
  font-style: italic;
}

.node-type-tag {
  margin-left: 6px;
  flex-shrink: 0;
}

.node-count {
  font-size: 10px;
  font-weight: 600;
  color: var(--node-count);
  margin-left: 4px;
}

.node-children {
  padding-left: 10px;
  margin-left: 10px;
  overflow: hidden;
  border-left: 2px dashed var(--tree-border);
}

.node-children.depth-0,
.node-children.depth-1,
.node-children.depth-2,
.node-children.depth-3,
.node-children.depth-4,
.node-children.depth-5,
.node-children.depth-6,
.node-children.depth-7 {
  border-left-style: solid;
  border-left-width: 2px;
}

.node-children.depth-0 { border-left-color: rgba(25, 200, 185, 0.45); }
.node-children.depth-1 { border-left-color: rgba(136, 157, 240, 0.45); }
.node-children.depth-2 { border-left-color: rgba(111, 186, 44, 0.45); }
.node-children.depth-3 { border-left-color: rgba(229, 146, 102, 0.45); }
.node-children.depth-4 { border-left-color: rgba(183, 125, 238, 0.45); }
.node-children.depth-5 { border-left-color: rgba(247, 205, 103, 0.45); }
.node-children.depth-6 { border-left-color: rgba(248, 166, 178, 0.45); }
.node-children.depth-7 { border-left-color: rgba(252, 115, 109, 0.45); }

[data-theme="dark"] .node-children.depth-0 { border-left-color: rgba(61, 212, 198, 0.35); }
[data-theme="dark"] .node-children.depth-1 { border-left-color: rgba(136, 157, 240, 0.35); }
[data-theme="dark"] .node-children.depth-2 { border-left-color: rgba(138, 198, 138, 0.35); }
[data-theme="dark"] .node-children.depth-3 { border-left-color: rgba(229, 146, 102, 0.35); }
[data-theme="dark"] .node-children.depth-4 { border-left-color: rgba(183, 125, 238, 0.35); }
[data-theme="dark"] .node-children.depth-5 { border-left-color: rgba(245, 195, 28, 0.35); }
[data-theme="dark"] .node-children.depth-6 { border-left-color: rgba(248, 166, 178, 0.35); }
[data-theme="dark"] .node-children.depth-7 { border-left-color: rgba(252, 115, 109, 0.35); }

.expand-enter-active {
  animation: expandIn 0.3s var(--ease);
}

.expand-leave-active {
  animation: expandOut 0.2s var(--ease);
}

@keyframes expandIn {
  from {
    max-height: 0;
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    max-height: 2000px;
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes expandOut {
  from {
    max-height: 2000px;
    opacity: 1;
    transform: translateY(0);
  }
  to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-4px);
  }
}
</style>
