/**
 * Ant Design 主题配置
 * 支持亮色/暗色主题切换和自定义主题色
 */

// 预设主题色
export const themeColors = {
  blue: {
    name: '拂晓蓝',
    primary: '#1677ff',
  },
  purple: {
    name: '酱紫',
    primary: '#722ed1',
  },
  cyan: {
    name: '明青',
    primary: '#13c2c2',
  },
  green: {
    name: '极光绿',
    primary: '#52c41a',
  },
  orange: {
    name: '日暮',
    primary: '#fa8c16',
  },
  red: {
    name: '薄暮',
    primary: '#f5222d',
  },
}

// 亮色主题配置
export const lightTheme = {
  token: {
    // 品牌色
    colorPrimary: '#1677ff',
    // 圆角
    borderRadius: 6,
    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#001529',
      headerColor: '#fff',
      siderBg: '#001529',
      bodyBg: '#f0f2f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
  },
}

// 暗色主题配置
export const darkTheme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    // 暗色主题色彩
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorBorder: '#303030',
  },
  components: {
    Layout: {
      headerBg: '#141414',
      headerColor: '#fff',
      siderBg: '#141414',
      bodyBg: '#000000',
    },
    Menu: {
      darkItemBg: '#141414',
      darkSubMenuItemBg: '#0a0a0a',
    },
  },
}

/**
 * 根据主题色和模式生成完整主题配置
 * @param {string} colorKey - 主题色键名
 * @param {boolean} isDark - 是否暗色模式
 * @returns {object} 完整主题配置
 */
export const generateTheme = (colorKey = 'blue', isDark = false) => {
  const baseTheme = isDark ? { ...darkTheme } : { ...lightTheme }
  const primaryColor = themeColors[colorKey]?.primary || themeColors.blue.primary

  return {
    ...baseTheme,
    token: {
      ...baseTheme.token,
      colorPrimary: primaryColor,
    },
    algorithm: isDark ? undefined : undefined, // 算法在 ConfigProvider 中使用 theme.darkAlgorithm
  }
}

export default {
  themeColors,
  lightTheme,
  darkTheme,
  generateTheme,
}
