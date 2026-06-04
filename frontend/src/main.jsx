import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.jsx'
import useThemeStore from './stores/themeStore'
import './index.css'

// 初始化 body.night 类（从 localStorage 恢复暗色模式状态）
;(function initTheme() {
  try {
    const stored = JSON.parse(localStorage.getItem('aetheris-theme'))
    if (stored?.state?.isDarkMode) {
      document.body.classList.add('night')
    }
  } catch (e) { /* ignore */ }
})()

// 主题包装组件
function ThemeProvider({ children }) {
  const { isDarkMode, getThemeConfig } = useThemeStore()
  const themeConfig = getThemeConfig()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        ...themeConfig,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/aetheris">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
