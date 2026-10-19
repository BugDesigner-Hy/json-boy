<div align="center">

# 🐻 JSON Boy

**一款「动物森友会」风格的 JSON 解析与可视化工具，既是网页应用，也能打包成 Chrome 扩展。**

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Chrome](https://img.shields.io/badge/Chrome-MV3-4285f4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Version](https://img.shields.io/badge/version-1.1.0-brown)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

## 简介

JSON Boy 把枯燥的 JSON 调试变成了一件可爱的事：左侧粘贴 JSON，右侧即时渲染成可折叠的树形视图，配色、分割线、页脚、图标全部采用「动物森友会」风格。

项目基于 **Vue 3 + Vite** 开发，同时附带 **Chrome Manifest V3** 扩展清单——点击浏览器工具栏图标即可在独立标签页中打开完整功能，不占用地址栏，也不会被网页刷新影响。

## 功能特性

### JSON 处理

- **实时解析**：在输入框中编辑时即时解析，解析失败仅不渲染，不影响继续输入。
- **格式化**：一键展开为 2 空格缩进的漂亮 JSON。
- **校验**：通过右上角通知反馈结果，格式错误时给出具体的解析异常信息。
- **压缩**：去除所有空白与换行，输出单行 JSON。
- **复制 / 清空**：一键复制输入内容或清空当前面板。
- **字符计数**：输入区右下角实时显示字符数。

### 树形视图

- 递归渲染对象与数组，**点击节点行**展开/折叠，**双击节点**复制该节点的原始值。
- **全部展开 / 全部折叠**：一键切换整棵树的状态。
- 节点名称与值按类型着色，可开启**层级彩色虚线**辅助识别嵌套深度。
- 显示 **Array / Object / String / Number / Boolean / Null** 类型标签，支持 4 种样式（`soft` / `solid` / `outlined` / `dashed`）× 13 种配色。
- 可选显示**数组角标**、折叠状态下的**子项数量**（如 `12 项`）。
- 左面板与右面板之间可**拖拽调整比例**（默认 50 : 50）。
- 右侧滚动区带**返回顶部**按钮（滚动超过 200px 后出现）。
- 编辑 JSON 时自动定位到**内容发生变化的节点**并展开它，改完立刻能看到结果。

### 搜索与定位

- 支持按**节点名**、按**内容**或**全部**进行搜索。
- 匹配项高亮，显示 `当前 / 总数` 计数，支持**上一个 / 下一个**跳转与 `Enter` 键循环。
- 跳转时自动展开父级路径并滚动到目标节点。

### 外观与个性化

- **明暗双主题**，切换时字体配色自动适配。
- 字号调节（`A-` / `A+`，10–24px）与 4 种中文配色（暖棕 / 米白 / 天蓝 / 草绿）。
- 点击左上角 **JSON Boy 标题**循环切换 13 种配色 + 14 个随主题联动的 Logo 图标。
- 可拖拽的**小棕熊**装饰，位置与显隐都会被记住。
- 页脚装饰支持「海」与「树」两种主题；分割线可选 9 种样式并实时预览。
- **通知提示**（成功 / 警告 / 错误 / 信息）从右上角浮出，2.5 秒自动消失。
- 内置**背景音乐**（默认开启，可顶栏一键静音），首次交互后播放以符合浏览器自动播放策略。

### Chrome 扩展

- Manifest V3，点击工具栏图标通过 Service Worker 在新标签页打开应用。
- 构建产物 `dist/` 即为可直接「加载已解压的扩展程序」的完整扩展。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>` 组合式 API） |
| 构建 | Vite 8（`@vitejs/plugin-vue`） |
| 图标生成 | sharp（构建前生成 16 / 48 / 128 尺寸 PNG 图标） |
| UI 风格 | [animal-island-ui](https://github.com/guokaigdg/animal-island-ui) 1.4.0（CDN 资源 + 自研封装组件） |
| 平台 | Chrome Extension Manifest V3 |
| 语言 | JavaScript（无 TypeScript） |

## 快速开始

### 环境要求

- **Node.js** `^20.19.0` 或 `>=22.12.0`（Vite 8 的要求）
- 现代浏览器（Chrome / Edge / Firefox 等，需支持 ES Modules 与 Clipboard API）

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/BugDesigner-Hy/json-boy.git
cd json-boy

# 安装依赖
npm install

# 启动开发服务器（http://localhost:5173）
npm run dev
```

### 构建

```bash
# 生成扩展图标 + 打包到 dist/
npm run build

# 预览构建结果（http://localhost:4173）
npm run preview
```

> `npm run build` 会先执行 `scripts/generate-icons.mjs`，从 CDN 拉取源图标后用 `sharp` 生成 `public/icons/` 下的三种尺寸，因此**构建过程需要网络**。

### 安装为 Chrome 扩展

1. 执行 `npm run build`，确认 `dist/` 目录中已包含 `manifest.json`、`background.js`、`index.html` 与 `assets/`。
2. 打开 `chrome://extensions/`，右上角开启 **开发者模式**。
3. 点击 **加载已解压的扩展程序**，选择项目下的 `dist` 目录。
4. 将「JSON Boy」固定到工具栏，点击图标即可在新标签页打开。

## 使用说明

### 界面交互

| 操作 | 效果 |
| --- | --- |
| 左侧输入框输入 / 粘贴 | 右侧实时渲染树形结构 |
| 单击可展开节点 | 展开或折叠该节点 |
| 双击任意节点 | 复制该节点的值到剪贴板 |
| `Enter`（搜索框内） | 跳到下一个匹配项 |
| 拖拽两栏之间的分隔条 | 调整左右面板宽度 |
| 点击左上角标题 | 循环切换标题配色与图标 |
| 点击顶栏喇叭图标 | 开关背景音乐 |
| 拖拽小棕熊装饰 | 移动位置（限制在窗口内，默认左下角） |

### 面板按钮

| 区域 | 按钮 | 说明 |
| --- | --- | --- |
| 左面板 | 复制 | 复制输入的 JSON 文本 |
| 左面板 | 格式化 | 解析并输出 2 空格缩进的 JSON |
| 左面板 | 校验 | 校验语法，通过/失败以通知提示 |
| 左面板 | 压缩 | 输出不带空白的单行 JSON |
| 左面板 | 清空 | 清空输入并重置视图 |
| 右面板 | 展开 / 折叠图标 | 一键全部展开或全部折叠 |
| 右面板 | 搜索框 + 类型下拉 | 按节点名 / 内容 / 全部检索 |

### 设置抽屉

点击顶栏齿轮按钮打开设置，可配置：

- **树形视图**：层级彩色虚线、显示数据类型（含标签样式与标签颜色）、显示数组角标
- **界面**：显示小棕熊、显示页脚装饰、页脚类型（海 / 树）、分割线样式

### 已持久化的偏好

以下偏好保存在 `localStorage`，刷新后仍然生效：

| 键名 | 用途 |
| --- | --- |
| `json-boy-bgm-enabled` | 背景音乐开关 |
| `json-boy-title-theme` | 标题配色 / Logo 图标序号 |
| `json-boy-show-home-bear` | 是否显示小棕熊 |
| `json-boy-home-bear-pos` | 小棕熊的拖拽位置 |
| `json-boy-title-color` | 旧版配色键，仅用于兼容读取 |

> 字号、字体颜色、明暗主题等属于当前会话的临时状态，刷新后恢复默认。

## 目录结构

```text
json-boy/
├─ public/                      # 静态资源，构建时原样拷贝到 dist/
│  ├─ manifest.json             # Chrome 扩展清单（MV3）
│  ├─ background.js             # Service Worker：点击图标打开新标签页
│  ├─ icons/                    # 扩展图标（16/48/128，由脚本生成）
│  ├─ audio/bgm.mp3             # 背景音乐
│  └─ img/home-bear-logo.png    # 小棕熊装饰图
├─ scripts/
│  ├─ generate-icons.mjs        # 构建前生成扩展图标
│  ├─ download-bear-logo.mjs    # 下载小棕熊素材
│  ├─ copy-bgm.mjs              # 从下载目录拷贝 bgm.mp3
│  └─ do-push.cmd               # 一键提交并推送的辅助脚本（Windows）
├─ src/
│  ├─ App.vue                   # 主界面：顶栏 / 输入区 / 树视图 / 设置抽屉
│  ├─ components/
│  │  ├─ JsonTreeNode.vue       # 递归 JSON 树节点
│  │  ├─ BackTop.vue            # 返回顶部
│  │  ├─ HomeBearLogo.vue       # 可拖拽的小棕熊
│  │  └─ Animal*.vue            # 动物岛风格基础组件（图标、标签、抽屉等）
│  ├─ composables/
│  │  ├─ animalNotification.js  # 全局通知
│  │  └─ useBgm.js              # 背景音乐控制
│  ├─ assets/                   # 图标 URL、配色与下拉选项常量
│  ├─ style.css                 # 全局样式与主题变量
│  └─ main.js                   # 应用入口
├─ index.html
├─ vite.config.js               # 开发服务器 0.0.0.0:5173
├─ test-data.json               # 用于测试的多层嵌套 JSON 样例
├─ LICENSE                      # MIT 许可证
├─ dist.crx / dist.pem          # 历史构建产物（建议自行构建）
└─ package.json
```

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（`http://localhost:5173`） |
| `npm run build` | 生成扩展图标并打包到 `dist/` |
| `npm run build:ext` | 与 `build` 等价，语义化别名 |
| `npm run preview` | 本地预览构建产物 |

## 注意事项

1. **依赖外部 CDN**：图标、分割线、页脚插画与自定义光标来自 `animal-island-ui@1.4.0`（jsDelivr / GitHub 资源），字体来自 Google Fonts。离线或网络受限时这些资源会缺失；若需要完全离线，可将其下载到 `public/` 并改为本地路径。
2. **构建需要联网**：`generate-icons.mjs` 会先 `fetch` 源图标再缩放，断网时 `npm run build` 会失败。
3. **背景音乐**：受浏览器自动播放策略限制，页面加载后需要一次点击或按键才会出声；点击顶栏喇叭图标可静音，状态会被记住。
4. **剪贴板**：复制依赖 Clipboard API，需要在安全上下文（`https`、`localhost` 或 `chrome-extension://`）中运行。
5. **`dist.crx` 为历史产物**：仓库中提交的 `.crx` 早于当前代码，安装扩展请以 `npm run build` 产出的 `dist/` 为准。

## 致谢

- [animal-island-ui](https://github.com/guokaigdg/animal-island-ui) —— 动物岛风格的组件灵感与素材来源
- [Vue](https://vuejs.org/) / [Vite](https://vite.dev/) —— 框架与构建工具
- [sharp](https://sharp.pixelplumbing.com/) —— 扩展图标生成

## License

本项目基于 [MIT License](LICENSE) 开源，Copyright (c) 2026 BugDesigner-Hy。

你可以自由使用、修改、分发本项目，包括商业用途，只需保留原始的版权与许可声明。

> 说明：`.vue` 组件与源码采用上述许可；`public/audio/bgm.mp3`、`public/img/home-bear-logo.png` 等第三方素材的版权归原作者所有，仅用于学习与演示，如涉及侵权请联系删除。
