import React from 'react'
import { Layout, Space, Switch, Tooltip } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  RocketOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons'
import useThemeStore from '../../stores/themeStore'
import './AppHeader.css'

const { Header } = Layout

function AppHeader({ collapsed, setCollapsed }) {
  const { colorKey, isDarkMode, toggleDarkMode, setColorKey, themeColors } = useThemeStore()

  // 主题色下拉菜单项
  const colorMenuItems = Object.entries(themeColors).map(([key, value]) => ({
    key,
    label: (
      <Space>
        <span
          style={{
            display: 'inline-block',
            width: 16,
            height: 16,
            borderRadius: 4,
            backgroundColor: value.primary,
          }}
        />
        <span>{value.name}</span>
        {colorKey === key && <CheckOutlined style={{ color: value.primary }} />}
      </Space>
    ),
  }))

  const handleColorChange = ({ key }) => {
    setColorKey(key)
  }

  return (
    <Header className="app-header">
      <div className="header-left">
        <div className="logo-section">
          <RocketOutlined className="logo-icon" />
          <span className="app-title">Aetheris</span>
        </div>
        <div className="header-trigger">
          {collapsed ? (
            <MenuUnfoldOutlined onClick={() => setCollapsed(false)} />
          ) : (
            <MenuFoldOutlined onClick={() => setCollapsed(true)} />
          )}
        </div>
      </div>
      <div className="header-right">
        <Space size="middle" className="header-actions">
          {/* 亮色/暗色模式切换 */}
          <Tooltip title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}>
            <Switch
              checked={isDarkMode}
              onChange={toggleDarkMode}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              className="theme-switch"
            />
          </Tooltip>
        </Space>
      </div>
    </Header>
  )
}

export default AppHeader
