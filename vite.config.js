import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 默认以根路径构建（用于 Chrome 扩展：chrome-extension://id/index.html）。
// 部署到 GitHub Pages 这类子路径时，用 PAGES_BASE 指定基础路径，
// 例如 PAGES_BASE=/json-boy/ npm run build
const base = process.env.PAGES_BASE || '/'

export default defineConfig({
  base,
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})