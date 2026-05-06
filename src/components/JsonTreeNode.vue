<template>
  <div class="json-tree-node" :class="{ 'is-root': isRoot }">
    <div
      ref="lineRef"
      class="node-line"
      :class="{ 'is-highlighted': isSearchMatch, 'is-match': isSearchMatch, 'is-current-match': isCurrentMatch }"
      @click="handleClick"
    >
      <span v-if="isExpandable" class="toggle-icon" :class="{ expanded: isExpanded }">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M4 2 L8 6 L4 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
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

      <span class="node-type-badge" v-if="isExpandable && showDataType">
        {{ isArray ? 'Array' : 'Object' }}
      </span>
      <span class="node-type-badge node-type-leaf" v-if="!isExpandable && showDataType">
        {{ leafType }}
      </span>
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
  fontColor: { type: String, default: '#2b2b2b' },
  currentMatchPath: { type: String, default: '' },
  coloredDepth: { type: Boolean, default: true },
  showDataType: { type: Boolean, default: true },
  showArrayIndex: { type: Boolean, default: true },
})

const expandState = inject('expandState')
const toggleNode = inject('toggleNode')
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
  border-radius: 4px;
  cursor: default;
  transition: background 0.2s ease;
  min-height: 26px;
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
  padding-left: 3px;
}

.node-line.is-current-match {
  background: var(--match-pulse);
  box-shadow: inset 0 0 0 1px var(--match-border);
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
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-muted);
}

.toggle-icon:hover {
  color: var(--primary);
}

.toggle-icon.expanded {
  transform: rotate(90deg);
}

.toggle-placeholder {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.node-key {
  color: var(--node-key);
  font-weight: 500;
  white-space: nowrap;
}

.node-key.array-index {
  color: var(--node-index);
  opacity: 0.8;
}

.node-colon {
  color: var(--node-colon);
  margin-right: 4px;
}

.node-value {
  word-break: break-all;
}

.value-string {
  color: var(--node-string);
}

.value-number {
  color: var(--node-number);
  font-weight: 500;
}

.value-boolean {
  color: var(--node-boolean);
  font-weight: 500;
}

.value-null {
  color: var(--node-null);
  font-style: italic;
}

.node-summary {
  color: var(--node-summary);
  font-style: italic;
}

.node-type-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--node-badge-bg);
  color: var(--node-badge);
  margin-left: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-type-leaf {
  opacity: 0.7;
  font-size: 9px;
}

.node-count {
  font-size: 10px;
  color: var(--node-count);
  margin-left: 4px;
}

.node-children {
  padding-left: 8px;
  margin-left: 8px;
  overflow: hidden;
  border-left: 1px dashed var(--tree-border);
}

.node-children.depth-0,
.node-children.depth-1,
.node-children.depth-2,
.node-children.depth-3,
.node-children.depth-4,
.node-children.depth-5,
.node-children.depth-6,
.node-children.depth-7 {
  border-left: 2px solid;
}

.node-children.depth-0 { border-left-color: rgba(22, 133, 169, 0.35); }
.node-children.depth-1 { border-left-color: rgba(140, 67, 86, 0.35); }
.node-children.depth-2 { border-left-color: rgba(82, 196, 26, 0.35); }
.node-children.depth-3 { border-left-color: rgba(202, 105, 40, 0.35); }
.node-children.depth-4 { border-left-color: rgba(74, 66, 102, 0.35); }
.node-children.depth-5 { border-left-color: rgba(23, 124, 176, 0.35); }
.node-children.depth-6 { border-left-color: rgba(250, 173, 20, 0.35); }
.node-children.depth-7 { border-left-color: rgba(194, 54, 22, 0.35); }

[data-theme="dark"] .node-children.depth-0 { border-left-color: rgba(121, 192, 255, 0.3); }
[data-theme="dark"] .node-children.depth-1 { border-left-color: rgba(210, 168, 255, 0.3); }
[data-theme="dark"] .node-children.depth-2 { border-left-color: rgba(126, 231, 135, 0.3); }
[data-theme="dark"] .node-children.depth-3 { border-left-color: rgba(255, 166, 87, 0.3); }
[data-theme="dark"] .node-children.depth-4 { border-left-color: rgba(188, 140, 255, 0.3); }
[data-theme="dark"] .node-children.depth-5 { border-left-color: rgba(121, 192, 255, 0.3); }
[data-theme="dark"] .node-children.depth-6 { border-left-color: rgba(255, 211, 61, 0.3); }
[data-theme="dark"] .node-children.depth-7 { border-left-color: rgba(248, 81, 73, 0.3); }

.expand-enter-active {
  animation: expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-leave-active {
  animation: expandOut 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
