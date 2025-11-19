import React, { useState, useEffect } from 'react'
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MessageOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  ApiOutlined,
  ToolOutlined
} from '@ant-design/icons'
import { getNavigation } from '../../services/api'
import './AppSider.css'

const { Sider } = Layout

// 图标映射
const iconMap = {
  message: <MessageOutlined />,
  file: <FileTextOutlined />,
  calculator: <CalculatorOutlined />,
  api: <ApiOutlined />,
  tool: <ToolOutlined />
}

function AppSider({ collapsed }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuItems, setMenuItems] = useState([])
  const [selectedKey, setSelectedKey] = useState('/')

  useEffect(() => {
    loadNavigation()
  }, [])

  useEffect(() => {
    setSelectedKey(location.pathname)
  }, [location])

  const loadNavigation = async () => {
    try {
      const response = await getNavigation()
      if (response.code === 0) {
        const items = buildMenuItems(response.data)
        setMenuItems(items)
      }
    } catch (error) {
      console.error('加载导航失败:', error)
      // 使用默认导航
      setMenuItems(getDefaultMenu())
    }
  }

  const buildMenuItems = (navData) => {
    return navData.map(category => ({
      key: category.id,
      icon: iconMap[category.icon] || <ToolOutlined />,
      label: category.label,
      children: category.children?.map(tool => ({
        key: `/${tool.component}`,
        label: tool.label,
        icon: iconMap[tool.icon]
      }))
    }))
  }

  const getDefaultMenu = () => {
    return [
      {
        key: 'ai_helper',
        icon: <MessageOutlined />,
        label: 'AI助手',
        children: [
          {
            key: '/',
            label: 'AI对话'
          }
        ]
      }
    ]
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      className="app-sider"
    >
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sider-menu"
      />
    </Sider>
  )
}

export default AppSider
