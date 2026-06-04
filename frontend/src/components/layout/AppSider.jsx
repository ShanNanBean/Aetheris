import React, { useState, useEffect } from 'react'
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MessageOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  ApiOutlined,
  ToolOutlined,
  QrcodeOutlined,
  BarcodeOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  SwapOutlined,
  FontSizeOutlined,
  DiffOutlined,
  ClockCircleOutlined,
  LockOutlined,
  LinkOutlined,
  KeyOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  BgColorsOutlined,
  FontColorsOutlined
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
  tool: <ToolOutlined />,
  qrcode: <QrcodeOutlined />,
  barcode: <BarcodeOutlined />,
  thunderbolt: <ThunderboltOutlined />,
  // 数据处理工具图标
  search: <SearchOutlined />,
  swap: <SwapOutlined />,
  'font-size': <FontSizeOutlined />,
  diff: <DiffOutlined />,
  'clock-circle': <ClockCircleOutlined />,
  lock: <LockOutlined />,
  link: <LinkOutlined />,
  key: <KeyOutlined />,
  calendar: <CalendarOutlined />,
  experiment: <ExperimentOutlined />,
  'bg-colors': <BgColorsOutlined />,
  'font-colors': <FontColorsOutlined />,
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
        label: 'AIGC',
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
        theme="light"
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
