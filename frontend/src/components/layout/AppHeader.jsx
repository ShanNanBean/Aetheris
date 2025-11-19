import React from 'react'
import { Layout, Space, Typography } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, RocketOutlined } from '@ant-design/icons'
import './AppHeader.css'

const { Header } = Layout
const { Title, Text } = Typography

function AppHeader({ collapsed, setCollapsed }) {
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
      </div>
    </Header>
  )
}

export default AppHeader
