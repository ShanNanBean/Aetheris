/**
 * Ant Design 主题配置 - 温暖自然风格
 * 匹配主展示站点的河/溪流意象设计语言
 */

// 温暖大地色调主题 - 单一配色方案
export const themeColors = {
  earth: {
    name: '暖铜',
    primary: '#B8845C',
  },
}

// 亮色主题配置
export const lightTheme = {
  token: {
    // 品牌色 - 暖铜
    colorPrimary: '#B8845C',
    // 圆角 - 有机柔和
    borderRadius: 10,
    // 字体 - 衬线标题 + 无衬线正文
    fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    // 色彩 - 温暖大地色
    colorBgLayout: '#F5F0E8',
    colorBgContainer: '#E8DFD0',
    colorBgElevated: '#E8DFD0',
    colorBorder: '#D4C4B0',
    colorBorderSecondary: '#E8DFD0',
    colorText: '#2a2a2a',
    colorTextSecondary: '#5a5a5a',
    colorTextTertiary: '#9a9a9a',
    // 阴影 - 温暖柔和
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.1)',
    // 控件
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
    // 动效 - 自然舒缓
    motionDurationFast: '0.15s',
    motionDurationMid: '0.25s',
    motionDurationSlow: '0.3s',
    // 链接/强调色
    colorLink: '#B8845C',
    colorInfo: '#B8845C',
    colorSuccess: '#6B8E6B',
    colorWarning: '#D4A574',
    colorError: '#C4705A',
    // 标题字体
    fontWeightStrong: 600,
    lineHeight: 1.8,
  },
  components: {
    Layout: {
      headerBg: 'rgba(250, 248, 245, 0.92)',
      headerColor: '#2a2a2a',
      siderBg: '#F5F0E8',
      bodyBg: '#F5F0E8',
      footerBg: '#E8DFD0',
      footerPadding: '12px 24px',
    },
    Menu: {
      itemBg: '#F5F0E8',
      subMenuItemBg: '#F5F0E8',
      itemSelectedBg: 'rgba(184, 132, 92, 0.12)',
      itemColor: '#5a5a5a',
      itemHoverColor: '#2a2a2a',
      itemSelectedColor: '#B8845C',
      itemActiveBg: 'rgba(184, 132, 92, 0.08)',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      iconSize: 16,
      collapsedIconSize: 18,
    },
    Card: {
      borderRadiusLG: 16,
      paddingLG: 20,
      colorBgContainer: '#E8DFD0',
    },
    Button: {
      borderRadius: 10,
      controlHeight: 36,
      paddingInline: 16,
      colorPrimary: '#5C4D3C',
      colorPrimaryHover: '#4A3D2E',
      colorPrimaryActive: '#3A2F22',
      defaultBg: '#E8DFD0',
      defaultBorderColor: '#D4C4B0',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
      paddingInline: 12,
      activeBorderColor: '#B8845C',
      hoverBorderColor: '#B8845C',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      optionSelectedBg: 'rgba(184, 132, 92, 0.12)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#E8DFD0',
      headerColor: '#2a2a2a',
      rowHoverBg: 'rgba(184, 132, 92, 0.06)',
      colorBgContainer: '#E8DFD0',
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Switch: {
      borderRadius: 12,
      colorPrimary: '#B8845C',
    },
    Tabs: {
      inkBarColor: '#B8845C',
      itemActiveColor: '#B8845C',
      itemSelectedColor: '#B8845C',
    },
    Dropdown: {
      colorBgElevated: '#E8DFD0',
    },
    Modal: {
      contentBg: '#E8DFD0',
    },
    Message: {
      contentBg: '#E8DFD0',
    },
    Notification: {
      colorBgElevated: '#E8DFD0',
    },
  },
}

// 暗色主题配置
export const darkTheme = {
  token: {
    colorPrimary: '#D4A574',
    borderRadius: 10,
    fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    // 暗色主题色彩 - 温暖深色
    colorBgContainer: '#2a2a3e',
    colorBgElevated: '#2a2a3e',
    colorBgLayout: '#1a1a2e',
    colorText: '#d4d4d4',
    colorTextSecondary: '#a0a0a0',
    colorTextTertiary: '#707070',
    colorBorder: '#3a3a4e',
    colorBorderSecondary: '#33334a',
    // Shadows
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.3)',
    // Controls
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
    // Accent colors
    colorLink: '#D4A574',
    colorInfo: '#D4A574',
    colorSuccess: '#7BA07B',
    colorWarning: '#D4A574',
    colorError: '#D47A6A',
    lineHeight: 1.8,
  },
  components: {
    Layout: {
      headerBg: 'rgba(26, 26, 46, 0.92)',
      headerColor: '#d4d4d4',
      siderBg: '#1a1a2e',
      bodyBg: '#1a1a2e',
      footerBg: '#222238',
    },
    Menu: {
      itemBg: '#1a1a2e',
      subMenuItemBg: '#16162a',
      itemSelectedBg: 'rgba(212, 165, 116, 0.15)',
      itemColor: 'rgba(212, 212, 212, 0.65)',
      itemHoverColor: '#d4d4d4',
      itemSelectedColor: '#D4A574',
      itemActiveBg: 'rgba(212, 165, 116, 0.08)',
    },
    Card: {
      borderRadiusLG: 16,
      colorBgContainer: '#2a2a3e',
    },
    Button: {
      borderRadius: 10,
      controlHeight: 36,
      colorPrimary: '#D4A574',
      colorPrimaryHover: '#C49564',
      colorPrimaryActive: '#B48554',
      defaultBg: '#2a2a3e',
      defaultBorderColor: '#3a3a4e',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
      colorBgContainer: '#2a2a3e',
      colorBorder: '#3a3a4e',
      activeBorderColor: '#D4A574',
      hoverBorderColor: '#D4A574',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      colorBgContainer: '#2a2a3e',
      colorBorder: '#3a3a4e',
      optionSelectedBg: 'rgba(212, 165, 116, 0.15)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#252540',
      rowHoverBg: 'rgba(212, 165, 116, 0.06)',
      colorBgContainer: '#2a2a3e',
    },
    Dropdown: {
      colorBgElevated: '#2a2a3e',
    },
    Modal: {
      contentBg: '#2a2a3e',
    },
  },
}

/**
 * 根据主题模式生成完整主题配置
 * @param {boolean} isDark - 是否暗色模式
 * @returns {object} 完整主题配置
 */
export const generateTheme = (colorKey = 'earth', isDark = false) => {
  const baseTheme = isDark ? { ...darkTheme } : { ...lightTheme }

  return {
    ...baseTheme,
    token: {
      ...baseTheme.token,
    },
    algorithm: undefined,
  }
}

export default {
  themeColors,
  lightTheme,
  darkTheme,
  generateTheme,
}
