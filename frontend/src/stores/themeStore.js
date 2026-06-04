import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateTheme, themeColors } from '../config/themeConfig'

/**
 * 主题状态管理
 * 支持亮色/暗色模式切换
 * 使用 localStorage 持久化存储
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      // 固定使用大地色主题
      colorKey: 'earth',
      // 是否暗色模式
      isDarkMode: false,
      // 主题色列表
      themeColors: themeColors,

      /**
       * 切换暗色/亮色模式
       */
      toggleDarkMode: () => {
        const newDark = !get().isDarkMode
        // 添加/移除 body.night 类（匹配主站点约定）
        if (newDark) {
          document.body.classList.add('night')
        } else {
          document.body.classList.remove('night')
        }
        set({ isDarkMode: newDark })
      },

      /**
       * 设置暗色模式
       * @param {boolean} isDark - 是否暗色模式
       */
      setDarkMode: (isDark) => {
        if (isDark) {
          document.body.classList.add('night')
        } else {
          document.body.classList.remove('night')
        }
        set({ isDarkMode: isDark })
      },

      /**
       * 获取当前主题配置（用于 ConfigProvider）
       * @returns {object} 主题配置对象
       */
      getThemeConfig: () => {
        const { isDarkMode } = get()
        return generateTheme('earth', isDarkMode)
      },

      /**
       * 重置为默认主题
       */
      resetTheme: () => {
        document.body.classList.remove('night')
        set({ colorKey: 'earth', isDarkMode: false })
      },
    }),
    {
      name: 'aetheris-theme', // localStorage key
      partialize: (state) => ({
        colorKey: state.colorKey,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
)

export default useThemeStore
