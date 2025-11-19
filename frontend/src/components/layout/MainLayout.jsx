import React, { useState } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import AppSider from './AppSider'
import AppFooter from './AppFooter'
import './MainLayout.css'

const { Content } = Layout

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout className="main-layout">
      <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <AppSider collapsed={collapsed} />
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
      <AppFooter />
    </Layout>
  )
}

export default MainLayout
