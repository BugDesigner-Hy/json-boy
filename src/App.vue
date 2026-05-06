<template>
  <div class="app" :data-theme="isDark ? 'dark' : 'light'" @click="showSettings = false">
    <header class="app-header">
      <div class="header-left">
        <h1 class="logo">
          <span class="logo-icon">{}</span>
          <span class="logo-text">JSON Boy</span>
        </h1>
        <span class="header-subtitle">JSON 解析 · 代码生成</span>
      </div>
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
          <div class="color-palette">
            <button
              v-for="color in filteredColors"
              :key="color.name"
              class="color-dot"
              :class="{ active: fontColor === color.value }"
              :style="{ background: color.value }"
              :title="color.name"
              @click="fontColor = color.value"
            ></button>
          </div>
          <div class="divider"></div>
          <button class="btn-icon theme-toggle" @click="toggleDark" :title="isDark ? '切换亮色' : '切换暗色'">
            <span v-if="isDark">☀</span>
            <span v-else>☾</span>
          </button>
          <div class="divider"></div>
          <div class="settings-wrapper">
            <button class="btn-icon" @click.stop="showSettings = !showSettings" title="设置">
              <span>⚙</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="panel left-panel" :style="{ flex: `0 0 ${leftPanelWidth}%` }">
        <div class="panel-header">
          <h2 class="panel-title">
            <span class="panel-icon">📝</span>
            JSON 输入
          </h2>
          <div class="panel-actions">
            <button class="btn btn-copy" @click="copyInput" :disabled="!jsonInput.trim()">
              📋 复制
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
        </div>
        <div class="panel-footer" v-if="validationMessage">
          <div class="validation-msg" :class="validationClass">
            {{ validationMessage }}
          </div>
        </div>
      </div>

      <div
        class="resizer"
        @mousedown="onResizerMouseDown"
      >
        <div class="resizer-bar"></div>
      </div>

      <div class="panel right-panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <span class="panel-icon">🌳</span>
            JSON 结构
          </h2>
          <div class="panel-actions">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                v-model="searchQuery"
                class="search-input"
                :class="{ 'has-match': matchCount > 0 }"
                placeholder="搜索节点或内容..."
                @input="onSearchInput"
                @keydown.enter="goToNextMatch"
              />
              <span v-if="matchCount > 0" class="match-counter">
                {{ currentMatchIndex + 1 }}/{{ matchCount }}
              </span>
              <button
                v-if="matchCount > 0"
                class="btn-nav"
                @click="goToPrevMatch"
                title="上一个"
              >▲</button>
              <button
                v-if="matchCount > 0"
                class="btn-nav"
                @click="goToNextMatch"
                title="下一个"
              >▼</button>
            </div>
            <select v-model="searchType" class="search-type-select" @change="onSearchInput">
              <option value="key">按节点名</option>
              <option value="value">按内容</option>
              <option value="all">全部</option>
            </select>
            <button class="btn btn-outline" @click="expandAll">全部展开</button>
            <button class="btn btn-outline" @click="collapseAll">全部折叠</button>
            <button class="btn btn-java" @click="showJavaModal = true" :disabled="!parsedJson">
              ☕ 生成代码
            </button>
          </div>
        </div>
        <div class="tree-area" ref="treeAreaRef">
          <div v-if="!parsedJson" class="empty-state">
            <div class="empty-icon">{ }</div>
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
        <button
          v-if="parsedJson"
          class="btn-back-root"
          @click="scrollToRoot"
          title="回到根节点"
        >⬆ root</button>
      </div>
    </main>

    <transition name="modal-fade">
      <div v-if="showJavaModal" class="modal-overlay" @click.self="showJavaModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>☕ 生成代码</h3>
            <button class="btn-close" @click="showJavaModal = false">×</button>
          </div>
          <div class="modal-toolbar">
            <select v-model="codeLang" class="lang-select">
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="csharp">C#</option>
            </select>
            <input
              v-model="codeClassName"
              class="class-name-input"
              :placeholder="classNamePlaceholder"
            />
            <button class="btn btn-primary" @click="generateCode">生成</button>
            <button class="btn btn-success" @click="copyCode">📋 复制</button>
            <button class="btn btn-warning" @click="exportCode">💾 导出</button>
          </div>
          <div class="modal-body">
            <pre class="java-code" v-if="generatedCode"><code>{{ generatedCode }}</code></pre>
            <div v-else class="empty-java">
              <p>{{ codeLang === 'java' ? '输入类名' : '输入名称' }}后点击"生成"按钮</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition>

    <transition name="drawer-overlay">
      <div v-if="showSettings" class="drawer-overlay" @click="showSettings = false"></div>
    </transition>
    <transition name="drawer-slide">
      <div v-if="showSettings" class="settings-drawer" @click.stop>
        <div class="drawer-header">
          <h3>⚙ 设置</h3>
          <button class="btn-close" @click="showSettings = false">×</button>
        </div>
        <div class="drawer-body">
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
            <label class="drawer-item">
              <input type="checkbox" v-model="showArrayIndex" />
              <span>显示数组角标</span>
            </label>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, provide, nextTick, watch, onMounted, onUnmounted } from 'vue'
import JsonTreeNode from './components/JsonTreeNode.vue'

const jsonInput = ref('')
const parsedJson = ref(null)
const searchQuery = ref('')
const searchType = ref('all')
const fontSize = ref(14)
const fontColor = ref('#2b2b2b')
const isDark = ref(false)
const showJavaModal = ref(false)
const codeLang = ref('java')
const codeClassName = ref('RootBean')
const generatedCode = ref('')
const validationMessage = ref('')
const validationClass = ref('')
const expandState = reactive({})
const textareaRef = ref(null)
const treeAreaRef = ref(null)
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

const toast = reactive({
  show: false,
  message: '',
  type: 'info'
})

const chineseColors = [
  { name: '墨黑', value: '#2b2b2b' },
  { name: '朱砂', value: '#c23616' },
  { name: '胭脂', value: '#9d2933' },
  { name: '石青', value: '#1685a9' },
  { name: '绛紫', value: '#8c4356' },
  { name: '琥珀', value: '#b85c28' },
  { name: '黛色', value: '#4a4266' },
  { name: '靛蓝', value: '#177cb0' },
  { name: '月白', value: '#ffffff' },
]

const filteredColors = computed(() => {
  if (isDark.value) {
    return chineseColors.filter(c => c.value !== '#2b2b2b')
  }
  return chineseColors.filter(c => c.value !== '#ffffff')
})

const matchCount = computed(() => matchPaths.value.length)

const classNamePlaceholder = computed(() => {
  const map = {
    java: '输入类名 (如: MyClass)',
    typescript: '输入接口名 (如: MyInterface)',
    javascript: '输入类名 (如: MyClass)',
    python: '输入类名 (如: MyClass)',
    go: '输入结构体名 (如: MyStruct)',
    csharp: '输入类名 (如: MyClass)',
  }
  return map[codeLang.value] || '输入名称'
})

const codeFileExt = computed(() => {
  const map = { java: '.java', typescript: '.ts', javascript: '.js', python: '.py', go: '.go', csharp: '.cs' }
  return map[codeLang.value] || '.txt'
})

const rootKeyName = computed(() => {
  if (!parsedJson.value) return ''
  if (Array.isArray(parsedJson.value)) return 'root (Array)'
  return 'root'
})

function toggleDark() {
  isDark.value = !isDark.value
  if (isDark.value) {
    if (fontColor.value === '#ffffff' || fontColor.value === '#2b2b2b') {
      fontColor.value = '#ffffff'
    }
  } else {
    if (fontColor.value === '#ffffff' || fontColor.value === '#2b2b2b') {
      fontColor.value = '#2b2b2b'
    }
  }
}

function onResizerMouseDown(e) {
  e.preventDefault()
  isResizing.value = true
  document.addEventListener('mousemove', onResizerMouseMove)
  document.addEventListener('mouseup', onResizerMouseUp)
  document.body.style.cursor = 'col-resize'
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
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResizerMouseMove)
  document.removeEventListener('mouseup', onResizerMouseUp)
})

function showToast(message, type = 'info') {
  toast.show = true
  toast.message = message
  toast.type = type
  setTimeout(() => {
    toast.show = false
  }, 2500)
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
    validationMessage.value = ''
    return
  }
  try {
    parsedJson.value = JSON.parse(jsonInput.value)
    validationMessage.value = ''
    treeKey.value++
  } catch (e) {
    parsedJson.value = null
    validationMessage.value = ''
  }
}

function validateJson() {
  if (!jsonInput.value.trim()) {
    validationMessage.value = '请输入 JSON 字符串'
    validationClass.value = 'warning'
    return
  }
  try {
    const parsed = JSON.parse(jsonInput.value)
    parsedJson.value = parsed
    treeKey.value++
    prevJsonSnapshot = JSON.parse(JSON.stringify(parsed))
    validationMessage.value = '✅ JSON 格式正确'
    validationClass.value = 'success'
    showToast('JSON 格式校验通过', 'success')
  } catch (e) {
    validationMessage.value = `❌ JSON 格式错误: ${e.message}`
    validationClass.value = 'error'
    showToast('JSON 格式校验失败', 'error')
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
  validationMessage.value = ''
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

function scrollToRoot() {
  const treeEl = treeAreaRef.value
  if (treeEl) {
    treeEl.scrollTo({ top: 0, behavior: 'smooth' })
  }
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
}

function collapseAll() {
  if (!parsedJson.value) return
  const paths = collectPaths(parsedJson.value)
  paths.forEach(p => { expandState[p] = false })
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

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function toCamelCase(str) {
  return str.replace(/[_-]([a-z])/g, (_, c) => c.toUpperCase())
}

function toPascalCase(str) {
  const camel = toCamelCase(str)
  return capitalize(camel)
}

function inferJavaType(value) {
  if (value === null) return 'Object'
  if (typeof value === 'boolean') return 'Boolean'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'Integer' : 'Double'
  }
  if (typeof value === 'string') return 'String'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'List<Object>'
    const itemType = inferJavaType(value[0])
    return `List<${itemType}>`
  }
  return null
}

function generateJavaClass(json, className, isInner = false) {
  const lines = []
  if (!isInner) {
    lines.push('import lombok.Data;')
    lines.push('import java.util.List;')
    lines.push('import com.fasterxml.jackson.annotation.JsonProperty;')
    lines.push('')
    lines.push('@Data')
  } else {
    lines.push('@Data')
  }
  lines.push(`public class ${className} {`)

  const entries = Object.entries(json)
  const innerClasses = []

  for (const [key, value] of entries) {
    const fieldName = toCamelCase(key)
    let javaType

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const innerClassName = toPascalCase(key)
      javaType = innerClassName
      innerClasses.push({ name: innerClassName, data: value })
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const innerClassName = toPascalCase(key.replace(/s$/, ''))
      javaType = `List<${innerClassName}>`
      innerClasses.push({ name: innerClassName, data: value[0] })
    } else {
      javaType = inferJavaType(value)
    }

    lines.push('')
    if (fieldName !== key) {
      lines.push(`    @JsonProperty("${key}")`)
    }
    lines.push(`    private ${javaType} ${fieldName};`)
  }

  lines.push('')
  lines.push('}')

  let result = lines.join('\n')

  for (const inner of innerClasses) {
    result += '\n\n' + generateJavaClass(inner.data, inner.name, true)
  }

  return result
}

function inferTSType(value) {
  if (value === null) return 'any'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'string'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]'
    return `${inferTSType(value[0])}[]`
  }
  return null
}

function generateTSInterface(json, name, isInner = false) {
  const lines = []
  lines.push(`export interface ${name} {`)

  const entries = Object.entries(json)
  const innerTypes = []

  for (const [key, value] of entries) {
    let tsType
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const innerName = toPascalCase(key)
      tsType = innerName
      innerTypes.push({ name: innerName, data: value })
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const innerName = toPascalCase(key.replace(/s$/, ''))
      tsType = `${innerName}[]`
      innerTypes.push({ name: innerName, data: value[0] })
    } else {
      tsType = inferTSType(value)
    }
    lines.push(`  ${key}: ${tsType};`)
  }

  lines.push('}')

  let result = lines.join('\n')
  for (const inner of innerTypes) {
    result += '\n\n' + generateTSInterface(inner.data, inner.name, true)
  }
  return result
}

function generateJSClass(json, name, isInner = false) {
  const lines = []
  lines.push(`class ${name} {`)
  lines.push('  constructor(data) {')

  const entries = Object.entries(json)
  const innerClasses = []

  for (const [key, value] of entries) {
    const fieldName = toCamelCase(key)
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const innerName = toPascalCase(key)
      lines.push(`    this.${fieldName} = new ${innerName}(data.${key} || {});`)
      innerClasses.push({ name: innerName, data: value })
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const innerName = toPascalCase(key.replace(/s$/, ''))
      lines.push(`    this.${fieldName} = (data.${key} || []).map(item => new ${innerName}(item));`)
      innerClasses.push({ name: innerName, data: value[0] })
    } else {
      lines.push(`    this.${fieldName} = data.${key} ?? ${JSON.stringify(value)};`)
    }
  }

  lines.push('  }')
  lines.push('}')

  let result = lines.join('\n')
  for (const inner of innerClasses) {
    result += '\n\n' + generateJSClass(inner.data, inner.name, true)
  }
  return result
}

function inferPythonType(value) {
  if (value === null) return 'Optional[Any]'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float'
  if (typeof value === 'string') return 'str'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'List[Any]'
    return `List[${inferPythonType(value[0])}]`
  }
  return null
}

function generatePythonClass(json, name, isInner = false) {
  const lines = []
  if (!isInner) {
    lines.push('from dataclasses import dataclass')
    lines.push('from typing import List, Optional, Any')
    lines.push('')
  }
  lines.push('@dataclass')
  lines.push(`class ${name}:`)

  const entries = Object.entries(json)
  const innerClasses = []

  if (entries.length === 0) {
    lines.push('    pass')
  }

  for (const [key, value] of entries) {
    const fieldName = toCamelCase(key)
    let pyType
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const innerName = toPascalCase(key)
      pyType = innerName
      innerClasses.push({ name: innerName, data: value })
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const innerName = toPascalCase(key.replace(/s$/, ''))
      pyType = `List[${innerName}]`
      innerClasses.push({ name: innerName, data: value[0] })
    } else {
      pyType = inferPythonType(value)
    }
    const defaultVal = value === null ? 'None' : (typeof value === 'string' ? '""' : (typeof value === 'boolean' ? (value ? 'True' : 'False') : (Array.isArray(value) ? '[]' : '0')))
    lines.push(`    ${fieldName}: ${pyType} = ${defaultVal}`)
  }

  let result = lines.join('\n')
  for (const inner of innerClasses) {
    result += '\n\n\n' + generatePythonClass(inner.data, inner.name, true)
  }
  return result
}

function inferGoType(value) {
  if (value === null) return 'interface{}'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float64'
  if (typeof value === 'string') return 'string'
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]interface{}'
    return `[]${inferGoType(value[0])}`
  }
  return null
}

function generateGoStruct(json, name, isInner = false) {
  const lines = []
  if (!isInner) {
    lines.push('package model')
    lines.push('')
  }
  lines.push(`type ${name} struct {`)

  const entries = Object.entries(json)
  const innerStructs = []

  for (const [key, value] of entries) {
    const fieldName = toPascalCase(key)
    let goType
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const innerName = toPascalCase(key)
      goType = innerName
      innerStructs.push({ name: innerName, data: value })
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const innerName = toPascalCase(key.replace(/s$/, ''))
      goType = `[]${innerName}`
      innerStructs.push({ name: innerName, data: value[0] })
    } else {
      goType = inferGoType(value)
    }
    lines.push(`    ${fieldName} ${goType} \`json:"${key}"\``)
  }

  lines.push('}')

  let result = lines.join('\n')
  for (const inner of innerStructs) {
    result += '\n\n' + generateGoStruct(inner.data, inner.name, true)
  }
  return result
}

function inferCSharpType(value) {
  if (value === null) return 'object'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double'
  if (typeof value === 'string') return 'string'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'List<object>'
    return `List<${inferCSharpType(value[0])}>`
  }
  return null
}

function generateCSharpClass(json, name, isInner = false) {
  const lines = []
  if (!isInner) {
    lines.push('using System.Collections.Generic;')
    lines.push('using System.Text.Json.Serialization;')
    lines.push('')
    lines.push(`public class ${name}`)
  } else {
    lines.push(`public class ${name}`)
  }
  lines.push('{')

  const entries = Object.entries(json)
  const innerClasses = []

  for (const [key, value] of entries) {
    const fieldName = toPascalCase(key)
    let csType
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const innerName = toPascalCase(key)
      csType = innerName
      innerClasses.push({ name: innerName, data: value })
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const innerName = toPascalCase(key.replace(/s$/, ''))
      csType = `List<${innerName}>`
      innerClasses.push({ name: innerName, data: value[0] })
    } else {
      csType = inferCSharpType(value)
    }

    if (fieldName !== key) {
      lines.push(`    [JsonPropertyName("${key}")]`)
    }
    lines.push(`    public ${csType} ${fieldName} { get; set; }`)
  }

  lines.push('}')

  let result = lines.join('\n')
  for (const inner of innerClasses) {
    result += '\n\n' + generateCSharpClass(inner.data, inner.name, true)
  }
  return result
}

function generateCode() {
  if (!parsedJson.value) {
    showToast('请先输入并解析 JSON', 'error')
    return
  }
  if (!codeClassName.value.trim()) {
    showToast('请输入名称', 'error')
    return
  }
  const name = codeClassName.value.trim()
  const generators = {
    java: generateJavaClass,
    typescript: generateTSInterface,
    javascript: generateJSClass,
    python: generatePythonClass,
    go: generateGoStruct,
    csharp: generateCSharpClass,
  }
  generatedCode.value = generators[codeLang.value](parsedJson.value, name)
  showToast('代码已生成', 'success')
}

function copyCode() {
  if (!generatedCode.value) {
    showToast('请先生成代码', 'error')
    return
  }
  navigator.clipboard.writeText(generatedCode.value).then(() => {
    showToast('已复制到剪贴板', 'success')
  }).catch(() => {
    showToast('复制失败', 'error')
  })
}

function exportCode() {
  if (!generatedCode.value) {
    showToast('请先生成代码', 'error')
    return
  }
  const blob = new Blob([generatedCode.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${codeClassName.value.trim()}${codeFileExt.value}`
  a.click()
  URL.revokeObjectURL(url)
  showToast('文件已导出', 'success')
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
  transition: background 0.3s ease, color 0.3s ease;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
  z-index: 10;
  flex-shrink: 0;
}

[data-theme="dark"] .app-header {
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2128 100%);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
}

.logo-icon {
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
}

.logo-text {
  background: linear-gradient(90deg, #fff, #a8d8ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-subtitle {
  font-size: 13px;
  opacity: 0.7;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 12px;
  opacity: 0.8;
  margin-right: 2px;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  transition: var(--transition);
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.theme-toggle {
  font-size: 16px;
  width: 32px;
  height: 32px;
}

.font-size-display {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  min-width: 36px;
  text-align: center;
  opacity: 0.9;
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
}

.color-palette {
  display: flex;
  gap: 4px;
  align-items: center;
}

.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.color-dot:hover {
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.color-dot.active {
  border-color: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.settings-wrapper {
  position: relative;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 90;
  backdrop-filter: blur(2px);
}

.settings-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background: var(--bg-card);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  z-index: 95;
  display: flex;
  flex-direction: column;
  transition: background 0.3s ease;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.drawer-header h3 {
  font-size: 15px;
  color: var(--text);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.drawer-section {
  margin-bottom: 20px;
}

.drawer-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
  padding: 10px 12px;
  border-radius: var(--radius);
  transition: background 0.2s;
  user-select: none;
}

.drawer-item:hover {
  background: var(--hover-bg);
}

.drawer-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}

.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 16px;
  gap: 0;
}

.resizer {
  width: 12px;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
  margin: 0 4px;
}

.resizer-bar {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  background: var(--border);
  transition: background 0.2s ease, height 0.2s ease;
}

.resizer:hover .resizer-bar {
  background: var(--primary);
  height: 60px;
}

.left-panel,
.right-panel {
  min-width: 0;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.panel:hover {
  box-shadow: var(--shadow-hover);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-header);
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.panel-icon {
  font-size: 16px;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #1685a9, #1a9ec2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #126d8a, #1685a9);
  transform: translateY(-1px);
}

.btn-success {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #389e0d, #52c41a);
  transform: translateY(-1px);
}

.btn-warning {
  background: linear-gradient(135deg, #faad14, #ffc53d);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #d48806, #faad14);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #cf1322, #ff4d4f);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--btn-outline-hover-bg);
}

.btn-java {
  background: linear-gradient(135deg, #ca6924, #e8883a);
  color: white;
}

.btn-java:hover:not(:disabled) {
  background: linear-gradient(135deg, #a85520, #ca6924);
  transform: translateY(-1px);
}

.btn-copy {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: white;
}

.btn-copy:hover:not(:disabled) {
  background: linear-gradient(135deg, #6d28d9, #7c3aed);
  transform: translateY(-1px);
}

.input-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.json-textarea {
  width: 100%;
  height: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
  background: var(--bg-input);
  color: var(--text);
  white-space: pre;
  transition: background 0.3s ease;
}

.json-textarea:focus {
  background: var(--bg-input-focus);
}

.editor-wrapper {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: var(--bg-input);
}

.editor-backdrop {
  position: absolute;
  inset: 0;
  padding: 16px;
  margin: 0;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
  background: transparent;
  color: transparent;
  white-space: pre;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  box-sizing: border-box;
}

.backdrop-line {
  min-height: 1.6em;
}

.highlight-line {
  background: rgba(255, 50, 50, 0.18);
  border-left: 3px solid #e74c3c;
  animation: highlightFade 2.5s ease forwards;
}

@keyframes highlightFade {
  0% { background: rgba(255, 50, 50, 0.35); }
  60% { background: rgba(255, 50, 50, 0.18); }
  100% { background: transparent; border-left-color: transparent; }
}

.json-textarea {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
  background: transparent;
  color: var(--text);
  white-space: pre;
}

.editor-backdrop {
  position: absolute;
  inset: 0;
  padding: 16px;
  margin: 0;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
  background: transparent;
  color: transparent;
  white-space: pre;
  overflow: auto;
  pointer-events: none;
  z-index: 0;
  box-sizing: border-box;
}

.backdrop-line {
  min-height: 1.6em;
}

.highlight-line {
  background: rgba(255, 50, 50, 0.15);
  border-left: 3px solid #e74c3c;
  padding-left: 4px;
  animation: highlightFade 2.5s ease forwards;
}

@keyframes highlightFade {
  0% { background: rgba(255, 50, 50, 0.3); }
  70% { background: rgba(255, 50, 50, 0.15); }
  100% { background: transparent; border-left-color: transparent; }
}

.json-textarea {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
  background: var(--bg-input);
  color: var(--text);
  transition: background 0.3s ease;
  white-space: pre;
}

.json-textarea:focus {
  outline: none;
}

.editor-wrapper:focus-within {
  background: var(--bg-input-focus);
  transition: background 0.3s ease;
}

.json-textarea::placeholder {
  color: var(--text-placeholder);
  font-family: 'Noto Sans SC', sans-serif;
}

.panel-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.validation-msg {
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(5px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.validation-msg.success {
  background: var(--validation-success-bg);
  color: var(--validation-success-color);
  border: 1px solid var(--validation-success-border);
}

.validation-msg.error {
  background: var(--validation-error-bg);
  color: var(--validation-error-color);
  border: 1px solid var(--validation-error-border);
}

.validation-msg.warning {
  background: var(--validation-warning-bg);
  color: var(--validation-warning-color);
  border: 1px solid var(--validation-warning-border);
}

.search-box {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 4px 0 6px;
  background: var(--bg-card);
  transition: border-color 0.2s;
}

.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 133, 169, 0.15);
}

.search-icon {
  font-size: 12px;
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  font-size: 12px;
  width: 120px;
  padding: 5px 4px;
  font-family: inherit;
  background: transparent;
  color: var(--text);
}

.search-input:focus {
  width: 160px;
}

.search-input.has-match {
  width: 100px;
}

.match-counter {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 28px;
  text-align: center;
}

.btn-nav {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  width: 20px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  flex-shrink: 0;
  transition: var(--transition);
}

.btn-nav:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--btn-outline-hover-bg);
}

.search-type-select {
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
  background: var(--bg-card);
  color: var(--text);
  font-family: inherit;
}

.search-type-select:focus {
  border-color: var(--primary);
}

.tree-area {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.right-panel {
  position: relative;
}

.btn-back-root {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: var(--transition);
  z-index: 5;
  font-family: inherit;
}

.btn-back-root:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
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
  font-size: 64px;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 16px;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.05); opacity: 0.5; }
}

.empty-state p {
  font-size: 14px;
}

.tree-scroll {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--modal-bg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: background 0.3s ease;
}

@keyframes modalIn {
  from { transform: scale(0.9) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  color: var(--text);
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.btn-close:hover {
  background: var(--btn-close-hover-bg);
  color: var(--text);
}

.modal-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--modal-toolbar-bg);
  transition: background 0.3s ease;
}

.class-name-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
  background: var(--bg-card);
  color: var(--text);
}

.class-name-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 133, 169, 0.15);
}

.lang-select {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  background: var(--bg-card);
  color: var(--text);
  cursor: pointer;
  flex-shrink: 0;
}

.lang-select:focus {
  border-color: var(--primary);
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.java-code {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 20px;
  border-radius: var(--radius);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}

.empty-java {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-placeholder);
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  z-index: 200;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes toastIn {
  from { transform: translateX(100%) translateY(-10px); opacity: 0; }
  to { transform: translateX(0) translateY(0); opacity: 1; }
}

.toast.success {
  background: var(--toast-success-bg);
  color: var(--toast-success-color);
  border: 1px solid var(--toast-success-border);
}

.toast.error {
  background: var(--toast-error-bg);
  color: var(--toast-error-color);
  border: 1px solid var(--toast-error-border);
}

.toast.info {
  background: var(--toast-info-bg);
  color: var(--toast-info-color);
  border: 1px solid var(--toast-info-border);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .app-main {
    flex-direction: column;
    padding: 8px;
    gap: 8px;
  }
  
  .app-header {
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 8px;
  }
  
  .header-right {
    width: 100%;
    overflow-x: auto;
  }
  
  .search-input {
    width: 80px;
  }
  
  .search-input:focus {
    width: 120px;
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
