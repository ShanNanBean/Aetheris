import React from 'react'
import { Layout, Typography } from 'antd'
import './AppFooter.css'

const { Footer } = Layout
const { Text } = Typography

function AppFooter() {
  return (
    <Footer className="app-footer">
      <Text className="footer-text">
        Aetheris © 2025 - 个人工具集成管理平台
      </Text>
    </Footer>
  )
}

export default AppFooter
