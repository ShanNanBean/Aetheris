import React from 'react'
import { Layout, Space, Typography, Switch, Dropdown, Button, Tooltip } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  RocketOutlined,
  SunOutlined,
  MoonOutlined,
  BgColorsOutlined,
  CheckOutlined
} from '@ant-design/icons'
import useThemeStore from '../../stores/themeStore'
import './AppHeader.css'

const { Header } = Layout
const { Title, Text } = Typography

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
          <Title level={4} className="app-title">Aetheris</Title>
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
        <Text className="header-text">智能工具集成管理平台</Text>
        <Space size="middle" className="header-actions">
          {/* 主题色选择 */}
          <Dropdown
            menu={{ items: colorMenuItems, onClick: handleColorChange }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Tooltip title="主题色">
              <Button
                type="text"
                icon={<BgColorsOutlined style={{ color: themeColors[colorKey]?.primary }} />}
                className="header-action-btn"
              />
            </Tooltip>
          </Dropdown>
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
