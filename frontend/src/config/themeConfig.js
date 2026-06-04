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
    borderRadius: 8,
    // 字体
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    // 色彩
    colorBgLayout: '#f7f8fa',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f0f0f0',
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',
    // 阴影
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    // 控件
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
    // 动效
    motionDurationFast: '0.15s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    Layout: {
      headerBg: '#0a1628',
      headerColor: '#fff',
      siderBg: '#0a1628',
      bodyBg: '#f7f8fa',
      footerBg: '#ffffff',
      footerPadding: '12px 24px',
    },
    Menu: {
      darkItemBg: '#0a1628',
      darkSubMenuItemBg: '#060e1a',
      darkItemSelectedBg: 'rgba(22, 119, 255, 0.15)',
      darkItemColor: 'rgba(255, 255, 255, 0.55)',
      darkItemHoverColor: 'rgba(255, 255, 255, 0.88)',
      darkItemSelectedColor: '#fff',
      itemBorderRadius: 6,
      itemMarginInline: 8,
      iconSize: 16,
      collapsedIconSize: 18,
    },
    Card: {
      borderRadiusLG: 10,
      paddingLG: 20,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      paddingInline: 16,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
      paddingInline: 12,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Table: {
      borderRadius: 10,
      headerBg: '#f9fafb',
      headerColor: '#374151',
      rowHoverBg: '#f3f4f6',
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Switch: {
      borderRadius: 12,
    },
  },
}

// 暗色主题配置
export const darkTheme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    // 暗色主题色彩 - premium feel
    colorBgContainer: '#141414',
    colorBgElevated: '#1a1a1a',
    colorBgLayout: '#000000',
    colorText: 'rgba(255, 255, 255, 0.88)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.56)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.36)',
    colorBorder: '#1f1f1f',
    colorBorderSecondary: '#262626',
    // Shadows
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
    // Controls
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
  },
  components: {
    Layout: {
      headerBg: '#0a0a0a',
      headerColor: '#fff',
      siderBg: '#050505',
      bodyBg: '#000000',
      footerBg: '#0a0a0a',
    },
    Menu: {
      darkItemBg: '#050505',
      darkSubMenuItemBg: '#020202',
      darkItemSelectedBg: 'rgba(22, 119, 255, 0.12)',
      darkItemColor: 'rgba(255, 255, 255, 0.45)',
      darkItemHoverColor: 'rgba(255, 255, 255, 0.85)',
      darkItemSelectedColor: '#4096ff',
    },
    Card: {
      borderRadiusLG: 10,
      colorBgContainer: '#141414',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
      colorBgContainer: '#1a1a1a',
      colorBorder: '#2a2a2a',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      colorBgContainer: '#1a1a1a',
      colorBorder: '#2a2a2a',
    },
    Table: {
      borderRadius: 10,
      headerBg: '#1a1a1a',
      rowHoverBg: '#1f1f1f',
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
    algorithm: isDark ? undefined : undefined,
  }
}

export default {
  themeColors,
  lightTheme,
  darkTheme,
  generateTheme,
}
