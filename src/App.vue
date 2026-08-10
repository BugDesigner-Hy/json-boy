<template>
  <div class="app animal-cursor" :data-theme="isDark ? 'dark' : 'light'" @click="showSettings = false">
    <header class="app-header">
      <div class="header-left">
        <h1 class="logo">
          <AnimalTitle
            :color="logoColor"
            clickable
            aria-label="点击切换 JSON Boy 标题配色"
            @click.stop="cycleLogoColor"
          >
            <AnimalIcon class="logo-icon" :src="logoIcon" :size="22" bounce label="JSON Boy" />
            <span class="logo-text">JSON Boy</span>
          </AnimalTitle>
        </h1>
      </div>
      <AnimalTime type="game" compact class="header-time" />
      <div class="header-right">
        <div class="font-controls">
          <label class="control-label">字号</label>
          <button class="btn-icon" @click="decreaseFontSize" title="缩小字体">
            <span>A-</span>
          </button>
          <span class="font-size-display">{{ fontSize }}px</span>
          <button class="btn-icon" @click="increaseFontSize" title="放大字体">
            <span>A+</span>
          </button>
          <div class="divider"></div>
          <label class="control-label">颜色</label>
          <AnimalRadio
            v-model="fontColor"
            size="small"
            direction="horizontal"
            class="color-radio-group"
            :options="colorRadioOptions"
          />
          <div class="divider"></div>
          <label class="theme-switch-wrap">
            <span class="control-label">{{ isDark ? '暗色' : '亮色' }}</span>
            <AnimalSwitch
              v-model="isDark"
              size="small"
              :aria-label="isDark ? '切换为亮色模式' : '切换为暗色模式'"
            />
          </label>
          <div class="divider"></div>
          <div class="settings-wrapper">
            <button class="btn-icon" @click.stop="showSettings = !showSettings" title="设置">
              <AnimalIcon :src="settingsIcon" :size="24" bounce label="设置" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <AnimalDivider :type="dividerType" class="app-divider" />

    <main class="app-main">
      <div class="panel left-panel" :style="{ flex: `0 0 ${leftPanelWidth}%` }">
        <div ref="leftPanelHeaderRef" class="panel-header">
          <h2 class="panel-title">
            <AnimalIcon class="panel-icon" :src="jsonInputIcon" :size="18" label="JSON 输入" />
            JSON 输入
          </h2>
          <div class="panel-actions">
            <button class="btn btn-copy" @click="copyInput" :disabled="!jsonInput.trim()">
              复制
            </button>
            <button class="btn btn-primary" @click="formatJson" :disabled="!jsonInput.trim()">
              格式化
            </button>
            <button class="btn btn-success" @click="validateJson">
              校验
            </button>
            <button class="btn btn-warning" @click="minifyJson" :disabled="!jsonInput.trim()">
              压缩
            </button>
            <button class="btn btn-danger" @click="clearInput">
              清空
            </button>
          </div>
        </div>
        <div class="input-area">
          <textarea
            ref="textareaRef"
            v-model="jsonInput"
            class="json-textarea"
            :style="{ fontSize: fontSize + 'px', color: fontColor }"
            placeholder="在此粘贴或输入 JSON 字符串..."
            @input="onInputChange"
            spellcheck="false"
          ></textarea>
          <AnimalWallet :value="jsonCharCount" size="small" class="input-wallet" />
        </div>
      </div>

      <div
        class="resizer"
        @mousedown="onResizerMouseDown"
      >
        <div class="resizer-bar"></div>
      </div>

      <div class="panel right-panel">
        <div ref="rightPanelHeaderRef" class="panel-header">
          <h2 class="panel-title">
            <AnimalIcon class="panel-icon" :src="jsonStructureIcon" :size="18" label="JSON 结构" />
            JSON 结构
          </h2>
          <div class="panel-actions">
            <AnimalTooltip
              :title="isTreeFullyExpanded ? '全部折叠' : '全部展开'"
              placement="bottom"
            >
              <span class="btn-tree-toggle-wrap">
                <button
                  class="btn-tree-toggle"
                  :disabled="!parsedJson"
                  @click="toggleTreeExpand"
                >
                  <AnimalIcon
                    class="tree-toggle-icon"
                    :src="expandToggleIcon"
                    :size="22"
                    bounce
                    :label="isTreeFullyExpanded ? '全部折叠' : '全部展开'"
                  />
                </button>
              </span>
            </AnimalTooltip>
            <div class="search-row">
              <AnimalInput
                v-model="searchQuery"
                class="search-animal-input"
                size="small"
                placeholder="搜索节点或内容..."
                allow-clear
                @input="onSearchInput"
                @clear="onSearchInput"
                @keydown.enter="goToNextMatch"
              >
                <template #prefix>
                  <AnimalIcon class="search-icon" name="icon-map" :size="16" label="搜索" />
                </template>
              </AnimalInput>
              <span v-if="matchCount > 0" class="match-counter">
                {{ currentMatchIndex + 1 }}/{{ matchCount }}
              </span>
              <button
                v-if="matchCount > 0"
                class="btn-nav"
                @click="goToPrevMatch"
                title="上一个"
              >
                <AnimalIcon class="nav-icon nav-icon-up" name="icon-helicopter" :size="14" label="上一个" />
              </button>
              <button
                v-if="matchCount > 0"
                class="btn-nav"
                @click="goToNextMatch"
                title="下一个"
              >
                <AnimalIcon class="nav-icon nav-icon-down" name="icon-helicopter" :size="14" label="下一个" />
              </button>
            </div>
            <AnimalSelect
              v-model="searchType"
              class="search-type-select"
              placement="top"
              :min-width="120"
              aria-label="搜索类型"
              :options="searchTypeOptions"
              @change="onSearchInput"
            />
          </div>
        </div>
        <div class="tree-area" ref="treeAreaRef">
          <div v-if="!parsedJson" class="empty-state">
            <AnimalIcon class="empty-icon" name="icon-design" :size="88" bounce label="空状态" />
            <p>在左侧输入 JSON 字符串，解析结果将在此展示</p>
          </div>
          <div v-else class="tree-scroll" :style="{ fontSize: fontSize + 'px', color: fontColor }">
            <JsonTreeNode
              :data="parsedJson"
              :key-name="rootKeyName"
              :depth="0"
              :is-root="true"
              node-path="root"
              :search-query="searchQuery"
              :search-type="searchType"
              :expand-state="expandState"
              :font-size="fontSize"
              :font-color="fontColor"
              :current-match-path="currentMatchPath"
              :colored-depth="coloredDepth"
              :show-data-type="showDataType"
              :show-array-index="showArrayIndex"
              @node-click="onNodeClick"
            />
          </div>
        </div>
        <BackTop
          v-if="parsedJson"
          :target="getTreeAreaEl"
          :visibility-height="200"
        />
      </div>
    </main>

    <AnimalFooter v-if="showFooter" :type="footerType" seamless />

    <AnimalDrawer v-model:open="showSettings" :width="378">
      <template #title>
        <AnimalIcon :src="settingsIcon" :size="28" label="设置" />
        设置
      </template>
      <div class="drawer-section">
        <div class="drawer-section-title">树形视图</div>
        <label class="drawer-item">
          <input type="checkbox" v-model="coloredDepth" />
          <span>层级彩色虚线</span>
        </label>
        <label class="drawer-item">
          <input type="checkbox" v-model="showDataType" />
          <span>显示数据类型</span>
        </label>
        <div v-if="showDataType" class="drawer-tag-settings">
          <div class="drawer-tag-preview">
            <span class="drawer-footer-type-label">标签预览</span>
            <AnimalTag size="small" :variant="typeTagVariant" :color="typeTagColor">
              Array
            </AnimalTag>
          </div>
          <div class="drawer-tag-row">
            <span class="drawer-footer-type-label">标签样式</span>
            <AnimalSelect
              v-model="typeTagVariant"
              class="drawer-tag-select"
              placement="top"
              :min-width="168"
              aria-label="类型标签样式"
              :options="tagVariantOptions"
            />
          </div>
          <div class="drawer-tag-row">
            <span class="drawer-footer-type-label">标签颜色</span>
            <AnimalSelect
              v-model="typeTagColor"
              class="drawer-tag-select"
              placement="top"
              :min-width="168"
              aria-label="类型标签颜色"
              :options="tagColorOptions"
            />
          </div>
        </div>
        <label class="drawer-item">
          <input type="checkbox" v-model="showArrayIndex" />
          <span>显示数组角标</span>
        </label>
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">界面</div>
        <label class="drawer-item">
          <input type="checkbox" v-model="showHomeBear" />
          <span>显示小棕熊</span>
        </label>
        <label class="drawer-item">
          <input type="checkbox" v-model="showFooter" />
          <span>显示页脚装饰</span>
        </label>
        <div v-if="showFooter" class="drawer-footer-type">
          <span class="drawer-footer-type-label">页脚类型</span>
          <AnimalRadio
            v-model="footerType"
            size="small"
            direction="horizontal"
            class="footer-type-radio"
            :options="footerTypeOptions"
          />
        </div>
        <div class="drawer-divider-type">
          <div class="drawer-divider-preview">
            <span class="drawer-footer-type-label">分割线预览</span>
            <div class="drawer-divider-sample-wrap">
              <AnimalDivider :type="dividerType" class="drawer-divider-sample" />
            </div>
          </div>
          <div class="drawer-divider-row">
            <span class="drawer-footer-type-label">分割线样式</span>
            <AnimalSelect
              v-model="dividerType"
              class="divider-type-select"
              placement="top"
              :min-width="168"
              aria-label="分割线样式"
              :options="dividerTypeOptions"
            />
          </div>
        </div>
      </div>
    </AnimalDrawer>

    <HomeBearLogo v-if="showHomeBear" :src="homeBearLogoUrl" />

    <AnimalNotificationHost />
  </div>
</template>

<script setup>
import { ref, reactive, computed, provide, nextTick, watch, onMounted, onUnmounted } from 'vue'
import JsonTreeNode from './components/JsonTreeNode.vue'
import BackTop from './components/BackTop.vue'
import AnimalIcon from './components/AnimalIcon.vue'
import AnimalSelect from './components/AnimalSelect.vue'
import AnimalRadio from './components/AnimalRadio.vue'
import AnimalNotificationHost from './components/AnimalNotificationHost.vue'
import AnimalDrawer from './components/AnimalDrawer.vue'
import AnimalTime from './components/AnimalTime.vue'
import AnimalWallet from './components/AnimalWallet.vue'
import AnimalFooter from './components/AnimalFooter.vue'
import AnimalDivider from './components/AnimalDivider.vue'
import AnimalInput from './components/AnimalInput.vue'
import AnimalSwitch from './components/AnimalSwitch.vue'
import AnimalTag from './components/AnimalTag.vue'
import AnimalTooltip from './components/AnimalTooltip.vue'
import AnimalTitle from './components/AnimalTitle.vue'
import HomeBearLogo from './components/HomeBearLogo.vue'
import { animalNotification } from './composables/animalNotification.js'
import { itemIconUrl, DIVIDER_TYPE_OPTIONS, ANIMAL_HOME_BEAR_LOGO } from './assets/animal-icons.js'
import { TAG_VARIANT_OPTIONS, TAG_COLOR_OPTIONS } from './assets/tag-options.js'
import { TITLE_COLOR_KEYS, LOGO_ICON_START, LOGO_ICON_COUNT } from './assets/title-options.js'

const expandToggleIcon = itemIconUrl(1)
const jsonInputIcon = itemIconUrl(23)
const jsonStructureIcon = itemIconUrl(473)
const settingsIcon = itemIconUrl(469)
const homeBearLogoUrl = ANIMAL_HOME_BEAR_LOGO
const SHOW_HOME_BEAR_KEY = 'json-boy-show-home-bear'
const LOGO_THEME_STORAGE_KEY = 'json-boy-title-theme'

function getInitialShowHomeBear() {
  try {
    const saved = localStorage.getItem(SHOW_HOME_BEAR_KEY)
    if (saved === 'false') return false
    return true
  } catch {
    return true
  }
}

function getInitialLogoThemeIndex() {
  try {
    const saved = localStorage.getItem(LOGO_THEME_STORAGE_KEY)
    if (saved == null) {
      const legacy = localStorage.getItem('json-boy-title-color')
      if (legacy != null) {
        const colorIndex = TITLE_COLOR_KEYS.indexOf(legacy)
        if (colorIndex >= 0) return colorIndex
      }
      return 0
    }
    const num = Number(saved)
    if (!Number.isNaN(num) && num >= 0) return num
    const colorIndex = TITLE_COLOR_KEYS.indexOf(saved)
    return colorIndex >= 0 ? colorIndex : 0
  } catch {
    return 0
  }
}

const logoThemeIndex = ref(getInitialLogoThemeIndex())
const logoColor = computed(() => TITLE_COLOR_KEYS[logoThemeIndex.value % TITLE_COLOR_KEYS.length])
const logoIcon = computed(() =>
  itemIconUrl(LOGO_ICON_START + (logoThemeIndex.value % LOGO_ICON_COUNT))
)

const jsonInput = ref('')
const parsedJson = ref(null)
const searchQuery = ref('')
const searchType = ref('all')
const fontSize = ref(13)
const fontColor = ref('#725d42')
const isDark = ref(false)
const expandState = reactive({})
const textareaRef = ref(null)
const treeAreaRef = ref(null)
const leftPanelHeaderRef = ref(null)
const rightPanelHeaderRef = ref(null)
const treeKey = ref(0)
const matchPaths = ref([])
const currentMatchIndex = ref(-1)
const currentMatchPath = ref('')
const leftPanelWidth = ref(50)
const isResizing = ref(false)
const showSettings = ref(false)
const coloredDepth = ref(true)
const showDataType = ref(true)
const showArrayIndex = ref(true)
const typeTagVariant = ref('soft')
const typeTagColor = ref('default')
const showFooter = ref(true)
const showHomeBear = ref(getInitialShowHomeBear())
const footerType = ref('tree')
const dividerType = ref('line-brown')

const dividerTypeOptions = DIVIDER_TYPE_OPTIONS
const tagVariantOptions = TAG_VARIANT_OPTIONS
const tagColorOptions = TAG_COLOR_OPTIONS
const isTreeFullyExpanded = ref(true)

provide('typeTagVariant', typeTagVariant)
provide('typeTagColor', typeTagColor)

const chineseColors = [
  { name: '暖棕', value: '#725d42' },
  { name: '米白', value: '#f8f8f0' },
  { name: '天蓝', value: '#889df0' },
  { name: '草绿', value: '#6fba2c' },
]

const searchTypeOptions = [
  { key: 'key', label: '按节点名' },
  { key: 'value', label: '按内容' },
  { key: 'all', label: '全部' },
]

const footerTypeOptions = [
  { value: 'sea', label: '海' },
  { value: 'tree', label: '树' },
]

const colorRadioOptions = computed(() =>
  filteredColors.value.map((c) => ({
    value: c.value,
    label: c.name,
    swatch: c.value,
  }))
)

const filteredColors = computed(() => {
  if (isDark.value) {
    return chineseColors.filter(c => c.value !== '#725d42')
  }
  return chineseColors.filter(c => c.value !== '#f8f8f0')
})

const matchCount = computed(() => matchPaths.value.length)

const jsonCharCount = computed(() => jsonInput.value.length)

const rootKeyName = computed(() => {
  if (!parsedJson.value) return ''
  if (Array.isArray(parsedJson.value)) return 'root (Array)'
  return 'root'
})

watch(isDark, (dark) => {
  if (dark) {
    if (fontColor.value === '#f8f8f0' || fontColor.value === '#725d42') {
      fontColor.value = '#f8f8f0'
    }
  } else if (fontColor.value === '#f8f8f0' || fontColor.value === '#725d42') {
    fontColor.value = '#725d42'
  }
})

watch(showHomeBear, (visible) => {
  try {
    localStorage.setItem(SHOW_HOME_BEAR_KEY, String(visible))
  } catch {
    // ignore storage errors
  }
})

function cycleLogoColor() {
  logoThemeIndex.value += 1
  localStorage.setItem(LOGO_THEME_STORAGE_KEY, String(logoThemeIndex.value))
}

function onResizerMouseDown(e) {
  e.preventDefault()
  isResizing.value = true
  document.addEventListener('mousemove', onResizerMouseMove)
  document.addEventListener('mouseup', onResizerMouseUp)
  document.body.classList.add('animal-cursor-resizing')
  document.body.style.userSelect = 'none'
}

function onResizerMouseMove(e) {
  if (!isResizing.value) return
  const mainEl = document.querySelector('.app-main')
  if (!mainEl) return
  const rect = mainEl.getBoundingClientRect()
  const x = e.clientX - rect.left
  const pct = (x / rect.width) * 100
  leftPanelWidth.value = Math.min(Math.max(pct, 20), 80)
}

function onResizerMouseUp() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResizerMouseMove)
  document.removeEventListener('mouseup', onResizerMouseUp)
  document.body.classList.remove('animal-cursor-resizing')
  document.body.style.userSelect = ''
  nextTick(syncPanelHeaders)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResizerMouseMove)
  document.removeEventListener('mouseup', onResizerMouseUp)
  document.body.classList.remove('animal-cursor-resizing')
  document.body.style.userSelect = ''
  panelHeaderResizeObserver?.disconnect()
  window.removeEventListener('resize', syncPanelHeaders)
})

let panelHeaderResizeObserver = null

function syncPanelHeaders() {
  const left = leftPanelHeaderRef.value
  const right = rightPanelHeaderRef.value
  if (!left || !right) return

  const leftTitle = left.querySelector('.panel-title')
  const rightTitle = right.querySelector('.panel-title')

  left.style.height = ''
  right.style.height = ''
  if (leftTitle) leftTitle.style.width = ''
  if (rightTitle) rightTitle.style.width = ''

  const titleWidth = Math.max(leftTitle?.offsetWidth ?? 0, rightTitle?.offsetWidth ?? 0)
  const headerHeight = Math.max(left.offsetHeight, right.offsetHeight)

  if (titleWidth > 0) {
    const titleWidthPx = `${titleWidth}px`
    if (leftTitle) leftTitle.style.width = titleWidthPx
    if (rightTitle) rightTitle.style.width = titleWidthPx
  }

  const headerHeightPx = `${headerHeight}px`
  if (left.style.height !== headerHeightPx) left.style.height = headerHeightPx
  if (right.style.height !== headerHeightPx) right.style.height = headerHeightPx
}

onMounted(() => {
  nextTick(() => {
    syncPanelHeaders()
    if (typeof ResizeObserver !== 'undefined') {
      panelHeaderResizeObserver = new ResizeObserver(() => {
        syncPanelHeaders()
      })
      if (leftPanelHeaderRef.value) {
        panelHeaderResizeObserver.observe(leftPanelHeaderRef.value)
      }
      if (rightPanelHeaderRef.value) {
        panelHeaderResizeObserver.observe(rightPanelHeaderRef.value)
      }
    }
    window.addEventListener('resize', syncPanelHeaders)
  })
})

watch(leftPanelWidth, () => {
  nextTick(syncPanelHeaders)
})

watch([searchQuery, matchCount, parsedJson], () => {
  nextTick(syncPanelHeaders)
})

function showToast(message, type = 'info') {
  const fn = animalNotification[type] ?? animalNotification.info
  fn({ message, position: 'topRight', duration: 2.5 })
}

function clearExpandState() {
  Object.keys(expandState).forEach(key => delete expandState[key])
}

let prevJsonSnapshot = null

function onInputChange() {
  const oldSnapshot = prevJsonSnapshot
  parseJson()

  if (parsedJson.value) {
    if (!oldSnapshot) {
      nextTick(() => expandAll())
    }
    prevJsonSnapshot = JSON.parse(JSON.stringify(parsedJson.value))
    if (oldSnapshot) {
      const changedPath = findChangedPath(oldSnapshot, parsedJson.value)
      if (changedPath) {
        currentMatchPath.value = changedPath
        autoExpandToPath(changedPath)
      }
    }
  } else {
    prevJsonSnapshot = null
  }
}

function findChangedPath(oldVal, newVal, prefix = 'root') {
  if (oldVal === newVal) return null
  if (oldVal === null || newVal === null) return prefix
  if (typeof oldVal !== typeof newVal) return prefix
  if (typeof oldVal !== 'object') return prefix
  if (Array.isArray(oldVal) !== Array.isArray(newVal)) return prefix

  if (Array.isArray(oldVal)) {
    const maxLen = Math.max(oldVal.length, newVal.length)
    for (let i = 0; i < maxLen; i++) {
      if (i >= oldVal.length || i >= newVal.length) {
        return `${prefix}.${Math.min(i, maxLen - 1)}`
      }
      const result = findChangedPath(oldVal[i], newVal[i], `${prefix}.${i}`)
      if (result) return result
    }
  } else {
    const allKeys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)])
    for (const key of allKeys) {
      if (!(key in oldVal)) return `${prefix}.${key}`
      if (!(key in newVal)) return prefix
      const result = findChangedPath(oldVal[key], newVal[key], `${prefix}.${key}`)
      if (result) return result
    }
  }

  return null
}

function parseJson() {
  if (!jsonInput.value.trim()) {
    parsedJson.value = null
    return
  }
  try {
    parsedJson.value = JSON.parse(jsonInput.value)
    treeKey.value++
  } catch (e) {
    parsedJson.value = null
  }
}

function validateJson() {
  if (!jsonInput.value.trim()) {
    showToast('请输入 JSON 字符串', 'warning')
    return
  }
  try {
    const parsed = JSON.parse(jsonInput.value)
    parsedJson.value = parsed
    treeKey.value++
    prevJsonSnapshot = JSON.parse(JSON.stringify(parsed))
    showToast('JSON 格式校验通过', 'success')
  } catch (e) {
    showToast(`JSON 格式错误: ${e.message}`, 'error')
  }
}

function formatJson() {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, 2)
    parseJson()
    prevJsonSnapshot = parsedJson.value ? JSON.parse(JSON.stringify(parsedJson.value)) : null
    showToast('JSON 已格式化', 'success')
  } catch (e) {
    showToast('无法格式化: JSON 格式错误', 'error')
  }
}

function minifyJson() {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed)
    parseJson()
    prevJsonSnapshot = parsedJson.value ? JSON.parse(JSON.stringify(parsedJson.value)) : null
    showToast('JSON 已压缩', 'success')
  } catch (e) {
    showToast('无法压缩: JSON 格式错误', 'error')
  }
}

function clearInput() {
  jsonInput.value = ''
  parsedJson.value = null
  prevJsonSnapshot = null
  clearExpandState()
  resetSearch()
}

function copyInput() {
  if (!jsonInput.value.trim()) return
  navigator.clipboard.writeText(jsonInput.value).then(() => {
    showToast('已复制到剪贴板', 'success')
  }).catch(() => {
    showToast('复制失败', 'error')
  })
}

function getTreeAreaEl() {
  return treeAreaRef.value
}

let highlightTimer = null

function onNodeClick({ nodePath, keyName }) {
  if (!jsonInput.value || !parsedJson.value) return

  currentMatchPath.value = nodePath

  const text = jsonInput.value
  const parts = nodePath.split('.').slice(1)
  let target = parsedJson.value
  for (const p of parts) {
    if (target === null || target === undefined) return
    target = target[p]
  }

  let searchStr
  const isLeaf = target === null || typeof target !== 'object'
  if (isLeaf) {
    const valStr = target === null ? 'null'
      : typeof target === 'string' ? `"${target}"`
      : String(target)
    searchStr = `"${keyName}": ${valStr}`
  } else {
    searchStr = `"${keyName}"`
  }

  let idx = text.indexOf(searchStr)
  if (idx < 0) {
    searchStr = `"${keyName}"`
    idx = text.indexOf(searchStr)
  }
  if (idx < 0) return

  const endIdx = idx + searchStr.length
  if (highlightTimer) clearTimeout(highlightTimer)

  nextTick(() => {
    if (!textareaRef.value) return
    textareaRef.value.focus()
    textareaRef.value.setSelectionRange(idx, endIdx)
    const lineHeight = fontSize.value * 1.6
    const beforeText = text.substring(0, idx)
    const lineNum = beforeText.split('\n').length - 1
    const targetScroll = lineNum * lineHeight - textareaRef.value.clientHeight * 0.2
    textareaRef.value.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' })
  })

  highlightTimer = setTimeout(() => {
    currentMatchPath.value = ''
  }, 2500)
}

function increaseFontSize() {
  if (fontSize.value < 24) fontSize.value++
}

function decreaseFontSize() {
  if (fontSize.value > 10) fontSize.value--
}

function collectPaths(data, prefix = 'root') {
  const paths = []
  if (data !== null && typeof data === 'object') {
    paths.push(prefix)
    if (Array.isArray(data)) {
      data.forEach((item, i) => {
        paths.push(...collectPaths(item, `${prefix}.${i}`))
      })
    } else {
      Object.keys(data).forEach(key => {
        paths.push(...collectPaths(data[key], `${prefix}.${key}`))
      })
    }
  }
  return paths
}

function expandAll() {
  if (!parsedJson.value) return
  const paths = collectPaths(parsedJson.value)
  paths.forEach(p => { expandState[p] = true })
  isTreeFullyExpanded.value = true
}

function collapseAll() {
  if (!parsedJson.value) return
  const paths = collectPaths(parsedJson.value)
  paths.forEach(p => { expandState[p] = false })
  isTreeFullyExpanded.value = false
}

function toggleTreeExpand() {
  if (!parsedJson.value) return
  if (isTreeFullyExpanded.value) {
    collapseAll()
  } else {
    expandAll()
  }
}

function toggleNode(path) {
  expandState[path] = !expandState[path]
}

function collectMatchPaths(data, query, searchType, prefix = 'root') {
  const paths = []
  const q = query.toLowerCase()

  if (data !== null && typeof data === 'object') {
    if (Array.isArray(data)) {
      data.forEach((item, i) => {
        const childPath = `${prefix}.${i}`
        if (searchType === 'value' || searchType === 'all') {
          if (item !== null && typeof item !== 'object') {
            if (String(item).toLowerCase().includes(q)) {
              paths.push({ path: childPath, matchText: String(item) })
            }
          }
        }
        paths.push(...collectMatchPaths(item, query, searchType, childPath))
      })
    } else {
      Object.entries(data).forEach(([key, value]) => {
        const childPath = `${prefix}.${key}`
        let matched = false
        if (searchType === 'key' || searchType === 'all') {
          if (key.toLowerCase().includes(q)) {
            paths.push({ path: childPath, matchText: key })
            matched = true
          }
        }
        if (!matched && (searchType === 'value' || searchType === 'all')) {
          if (value !== null && typeof value !== 'object') {
            if (String(value).toLowerCase().includes(q)) {
              paths.push({ path: childPath, matchText: String(value) })
            }
          }
        }
        paths.push(...collectMatchPaths(value, query, searchType, childPath))
      })
    }
  }
  return paths
}

function scrollToTextareaMatch(matchEntry) {
  if (!textareaRef.value || !jsonInput.value || !matchEntry) return
  const text = jsonInput.value
  const textLower = text.toLowerCase()
  const q = matchEntry.matchText.toLowerCase()

  const idx = textLower.indexOf(q)
  if (idx >= 0) {
    const beforeMatch = text.substring(0, idx)
    const lineNum = beforeMatch.split('\n').length - 1
    const lineHeight = fontSize.value * 1.6
    textareaRef.value.scrollTop = lineNum * lineHeight - textareaRef.value.clientHeight / 3
  }
}

function autoExpandToPath(path) {
  const parts = path.split('.')
  let current = ''
  for (let i = 0; i < parts.length - 1; i++) {
    current = current ? current + '.' + parts[i] : parts[i]
    expandState[current] = true
  }
}

function resetSearch() {
  matchPaths.value = []
  currentMatchIndex.value = -1
  currentMatchPath.value = ''
}

function onSearchInput() {
  resetSearch()
  if (!searchQuery.value.trim() || !parsedJson.value) return

  const matches = collectMatchPaths(parsedJson.value, searchQuery.value, searchType.value)
  matchPaths.value = matches

  if (matches.length > 0) {
    currentMatchIndex.value = 0
    currentMatchPath.value = matches[0].path
    autoExpandToPath(matches[0].path)
    scrollToTextareaMatch(matches[0])
  }
}

function goToNextMatch() {
  if (matchPaths.value.length === 0) return
  currentMatchIndex.value = (currentMatchIndex.value + 1) % matchPaths.value.length
  const entry = matchPaths.value[currentMatchIndex.value]
  currentMatchPath.value = entry.path
  autoExpandToPath(entry.path)
  scrollToTextareaMatch(entry)
}

function goToPrevMatch() {
  if (matchPaths.value.length === 0) return
  currentMatchIndex.value = (currentMatchIndex.value - 1 + matchPaths.value.length) % matchPaths.value.length
  const entry = matchPaths.value[currentMatchIndex.value]
  currentMatchPath.value = entry.path
  autoExpandToPath(entry.path)
  scrollToTextareaMatch(entry)
}

provide('expandState', expandState)
provide('toggleNode', toggleNode)
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.app-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 68px;
  overflow: visible;
  background: linear-gradient(180deg, #fff 0%, var(--bg) 100%);
  color: var(--text);
  flex-shrink: 0;
  z-index: 10;
}

.app-divider {
  flex-shrink: 0;
}

[data-theme="dark"] .app-header {
  background: linear-gradient(180deg, #3a3630 0%, var(--bg) 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: start;
  overflow: visible;
}

.logo {
  display: flex;
  align-items: center;
  overflow: visible;
}

.logo-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

.logo-text {
  color: inherit;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.header-time {
  flex-shrink: 0;
  justify-self: center;
}

.header-right {
  display: flex;
  align-items: center;
  justify-self: end;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.btn-icon {
  background: var(--bg-card);
  border: 2px solid var(--border-strong);
  color: var(--text-body);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.btn-icon:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: var(--shadow-hover);
  transform: translateY(-1px);
}

.btn-icon:active {
  transform: translateY(1px);
  box-shadow: var(--shadow);
}

.theme-switch-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.search-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 1;
  min-width: 0;
}

.search-animal-input {
  width: 152px;
  flex-shrink: 1;
  min-width: 108px;
}

.search-icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.font-size-display {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  min-width: 36px;
  text-align: center;
  color: var(--text-body);
}

.nav-icon-up {
  transform: rotate(-90deg);
}

.nav-icon-down {
  transform: rotate(90deg);
}

.match-counter {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 28px;
  text-align: center;
}

.divider {
  width: 2px;
  height: 20px;
  background: var(--border);
  margin: 0 4px;
  border-radius: 1px;
}

.color-radio-group {
  gap: 6px;
}

.color-radio-group :deep(.animal-radio-item) {
  gap: 4px;
}

.settings-wrapper {
  position: relative;
}

.drawer-section {
  margin-bottom: 24px;
}

.drawer-section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-body);
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  user-select: none;
}

.drawer-item:hover {
  background: var(--hover-bg);
}

.drawer-item input[type="checkbox"] {
  appearance: none;
  width: 22px;
  height: 22px;
  background: var(--bg-input);
  border: 2.5px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: var(--transition);
  position: relative;
}

.drawer-item input[type="checkbox"]:checked {
  background: var(--primary);
  border-color: var(--primary-active);
}

.drawer-item input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.drawer-item input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--focus-yellow);
  outline-offset: 2px;
}

.drawer-footer-type {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 14px 4px 48px;
}

.drawer-footer-type-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-body);
  flex-shrink: 0;
}

.footer-type-radio {
  flex: 1;
  justify-content: flex-end;
}

.drawer-divider-type {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 8px 14px 4px 48px;
}

.drawer-divider-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawer-divider-sample-wrap {
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px dashed var(--border);
}

.drawer-divider-sample {
  width: 100%;
}

.drawer-divider-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.drawer-tag-settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 14px 8px 48px;
}

.drawer-tag-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.drawer-tag-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.drawer-tag-select {
  width: 100%;
}

.divider-type-select {
  width: 100%;
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 10px;
  gap: 0;
  position: relative;
  z-index: 1;
}

.resizer {
  width: 14px;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 5;
  margin: 0 2px;
}

.resizer-bar {
  width: 6px;
  height: 48px;
  border-radius: var(--radius-pill);
  background: var(--border);
  border: 2px solid var(--border-strong);
  transition: var(--transition);
}

.resizer:hover .resizer-bar {
  background: var(--primary);
  border-color: var(--primary-active);
  height: 64px;
}

.left-panel,
.right-panel {
  min-width: 0;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  border: 1.5px solid var(--border);
}

.left-panel.panel {
  background: var(--panel-left-pattern);
  border-color: var(--panel-left-border);
}

.right-panel.panel {
  background: var(--panel-right-pattern);
  border-color: var(--panel-right-border);
}

.panel-header {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 2px solid var(--border);
  background: var(--bg-header);
  flex-shrink: 0;
  gap: 10px;
  box-sizing: border-box;
  backdrop-filter: blur(4px);
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  color: var(--text);
  letter-spacing: 0.02em;
  flex-shrink: 0;
  height: 28px;
}

.panel-icon {
  flex-shrink: 0;
}

.panel-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  flex-wrap: nowrap;
  min-width: 0;
  height: 28px;
}

.search-animal-input :deep(.animal-input-wrapper.size-small) {
  height: 28px;
  min-height: 28px;
}

.search-animal-input :deep(.animal-input-wrapper.size-small:not(.no-shadow)) {
  box-shadow: 0 3px 0 0 var(--shadow-btn, rgba(91, 78, 30, 0.15));
}

.search-type-select :deep(.animal-select-trigger) {
  box-sizing: border-box;
  height: 28px;
  min-height: 28px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 10px;
}

.search-type-select :deep(.animal-select-value) {
  font-size: 12px;
  line-height: 1;
}

.btn {
  padding: 0 12px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-primary {
  background: var(--bg);
  color: var(--text);
  border-color: var(--bg);
  box-shadow: 0 5px 0 0 var(--shadow-btn);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 0 0 var(--shadow-btn);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  box-shadow: 0 1px 0 0 var(--shadow-btn);
  transform: translateY(2px);
}

.btn-success {
  background: var(--success);
  color: #fff;
  border-color: var(--success);
  box-shadow: 0 4px 0 0 var(--success-active);
}

.btn-success:hover:not(:disabled) {
  box-shadow: 0 5px 0 0 var(--success-active);
  transform: translateY(-1px);
}

.btn-success:active:not(:disabled) {
  box-shadow: 0 1px 0 0 var(--success-active);
  transform: translateY(2px);
}

.btn-warning {
  background: var(--focus-yellow);
  color: var(--text-body);
  border-color: var(--focus-yellow);
  box-shadow: 0 4px 0 0 var(--focus-yellow-d);
}

.btn-warning:hover:not(:disabled) {
  box-shadow: 0 5px 0 0 var(--focus-yellow-d);
  transform: translateY(-1px);
}

.btn-warning:active:not(:disabled) {
  box-shadow: 0 1px 0 0 var(--focus-yellow-d);
  transform: translateY(2px);
}

.btn-danger {
  background: var(--error);
  color: #fff;
  border-color: var(--error);
  box-shadow: 0 4px 0 0 var(--error-active);
}

.btn-danger:hover:not(:disabled) {
  box-shadow: 0 5px 0 0 var(--error-active);
  transform: translateY(-1px);
}

.btn-danger:active:not(:disabled) {
  box-shadow: 0 1px 0 0 var(--error-active);
  transform: translateY(2px);
}

.btn-outline {
  background: var(--bg-card);
  border: 2px solid var(--border-strong);
  color: var(--text-body);
  box-shadow: var(--shadow);
}

.btn-outline:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: var(--shadow-hover);
  transform: translateY(-1px);
}

.btn-copy {
  background: #b77dee;
  color: #fff;
  border-color: #b77dee;
  box-shadow: 0 4px 0 0 #9050d0;
}

.btn-copy:hover:not(:disabled) {
  box-shadow: 0 5px 0 0 #9050d0;
  transform: translateY(-1px);
}

.input-area {
  flex: 1;
  display: flex;
  overflow: visible;
  position: relative;
}

.input-wallet {
  position: absolute;
  right: 10px;
  bottom: 6px;
  z-index: 2;
  pointer-events: auto;
}

.json-textarea {
  width: 100%;
  height: 100%;
  padding: 10px 108px 52px 12px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.35);
  color: var(--text);
  white-space: pre;
  font-weight: 500;
}

[data-theme="dark"] .json-textarea {
  background: rgba(0, 0, 0, 0.15);
}

.json-textarea:focus {
  background: rgba(255, 255, 255, 0.55);
  box-shadow: inset 0 0 0 2px var(--focus-yellow);
}

[data-theme="dark"] .json-textarea:focus {
  background: rgba(0, 0, 0, 0.25);
}

.json-textarea::placeholder {
  color: var(--text-placeholder);
  font-family: Nunito, 'Noto Sans SC', sans-serif;
  font-weight: 400;
}

.btn-nav {
  background: var(--bg-card);
  border: 2px solid var(--border);
  color: var(--text-body);
  width: 24px;
  height: 24px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition);
  padding: 0;
}

.btn-nav:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

.search-type-select {
  flex-shrink: 0;
}

.btn-tree-toggle-wrap {
  display: inline-flex;
  flex-shrink: 0;
}

.btn-tree-toggle {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
  transition: transform 0.2s var(--ease);
}

.btn-tree-toggle:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-tree-toggle:not(:disabled):hover {
  transform: scale(1.08);
}

.btn-tree-toggle:not(:disabled):active {
  transform: scale(0.96);
}

.tree-toggle-icon {
  filter: drop-shadow(0 2px 4px rgba(91, 78, 30, 0.18));
}

.tree-area {
  flex: 1;
  overflow: auto;
  padding: 10px 12px;
}

.right-panel {
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-placeholder);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.45;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.05); opacity: 0.55; }
}

.empty-state p {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.tree-scroll {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .app-main {
    flex-direction: column;
    padding: 8px;
    gap: 8px;
  }

  .app-header {
    display: flex;
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 8px;
  }

  .header-left,
  .header-time,
  .header-right {
    justify-self: auto;
    width: 100%;
  }

  .header-time {
    display: flex;
    justify-content: center;
  }

  .header-right {
    width: 100%;
    overflow-x: auto;
  }

  .search-animal-input {
    width: 120px;
    min-width: 96px;
  }

  .resizer {
    display: none;
  }

  .left-panel,
  .right-panel {
    flex: 1 1 auto !important;
  }
}
</style>

