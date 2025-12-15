import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateTheme, themeColors } from '../config/themeConfig'

/**
 * 主题状态管理
 * 支持主题色切换、亮色/暗色模式切换
 * 使用 localStorage 持久化存储
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      // 当前主题色 key
      colorKey: 'blue',
      // 是否暗色模式
      isDarkMode: false,
      // 预设主题色列表
      themeColors: themeColors,

      /**
       * 切换主题色
       * @param {string} colorKey - 主题色键名
       */
      setColorKey: (colorKey) => {
        if (themeColors[colorKey]) {
          set({ colorKey })
        }
      },

      /**
       * 切换暗色/亮色模式
       */
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }))
      },

      /**
       * 设置暗色模式
       * @param {boolean} isDark - 是否暗色模式
       */
      setDarkMode: (isDark) => {
        set({ isDarkMode: isDark })
      },

      /**
       * 获取当前主题配置（用于 ConfigProvider）
       * @returns {object} 主题配置对象
       */
      getThemeConfig: () => {
        const { colorKey, isDarkMode } = get()
        return generateTheme(colorKey, isDarkMode)
      },

      /**
       * 重置为默认主题
       */
      resetTheme: () => {
        set({ colorKey: 'blue', isDarkMode: false })
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
