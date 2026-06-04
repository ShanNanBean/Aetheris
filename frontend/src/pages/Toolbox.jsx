import React, { useState, useMemo } from 'react'
import { Input, Card, Typography, Space, Badge, Tag, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import './Toolbox.css'

// Import all tools
import RegExTester from './tools/RegExTester'
import TextDiff from './tools/TextDiff'
import JSONDiff from './tools/JSONDiff'
import JSONPathQuery from './tools/JSONPathQuery'
import TimestampConverter from './tools/TimestampConverter'
import Base64Tool from './tools/Base64Tool'
import URLCodec from './tools/URLCodec'
import JWTDecoder from './tools/JWTDecoder'
import HashTool from './tools/HashTool'
import CrontabTool from './tools/CrontabTool'
import RandomGenerator from './tools/RandomGenerator'
import StringToolkit from './tools/StringToolkit'
import ColorConverter from './tools/ColorConverter'
import NumberBaseConverter from './tools/NumberBaseConverter'
import AsciiConverter from './tools/AsciiConverter'

const { Text, Title, Paragraph } = Typography

// Tool categories
const CATEGORIES = [
  {
    id: 'string',
    label: '字符串工具',
    color: '#1890ff',
    tools: [
      { id: 'regex', name: '正则表达式测试', icon: '🔍', desc: '正则表达式在线测试与匹配高亮', component: RegExTester },
      { id: 'string', name: '字符串工具箱', icon: '📝', desc: '大小写转换、去空白、转义、统计', component: StringToolkit },
      { id: 'text-diff', name: '文本对比', icon: '📋', desc: '两段文本逐行对比，高亮差异', component: TextDiff },
    ]
  },
  {
    id: 'json',
    label: 'JSON 工具',
    color: '#722ed1',
    tools: [
      { id: 'json-diff', name: 'JSON 对比', icon: '🔀', desc: 'JSON结构化对比，显示增删改', component: JSONDiff },
      { id: 'jsonpath', name: 'JSONPath 查询', icon: '🎯', desc: 'JSONPath表达式查询JSON数据', component: JSONPathQuery },
    ]
  },
  {
    id: 'encoding',
    label: '编码工具',
    color: '#13c2c2',
    tools: [
      { id: 'base64', name: 'Base64 编解码', icon: '🔤', desc: 'Base64编码与解码', component: Base64Tool },
      { id: 'url-codec', name: 'URL 编解码', icon: '🔗', desc: 'URL编码与解码', component: URLCodec },
      { id: 'jwt', name: 'JWT 解码器', icon: '🔑', desc: 'JWT Token解码（Header + Payload）', component: JWTDecoder },
      { id: 'ascii', name: 'ASCII 转换器', icon: '🔡', desc: '字符与ASCII码互转', component: AsciiConverter },
    ]
  },
  {
    id: 'random',
    label: '随机工具',
    color: '#eb2f96',
    tools: [
      { id: 'random', name: '随机数据生成', icon: '🎲', desc: 'UUID、密码、IP、颜色等随机生成', component: RandomGenerator },
    ]
  },
  {
    id: 'crypto',
    label: '加密工具',
    color: '#faad14',
    tools: [
      { id: 'hash', name: '哈希计算', icon: '#️⃣', desc: 'MD5/SHA1/SHA256/SHA512哈希计算', component: HashTool },
    ]
  },
  {
    id: 'time',
    label: '时间工具',
    color: '#52c41a',
    tools: [
      { id: 'timestamp', name: '时间戳转换', icon: '⏰', desc: '时间戳与日期格式互转', component: TimestampConverter },
      { id: 'crontab', name: 'Crontab 解析', icon: '📅', desc: 'Cron表达式解析与下次执行时间', component: CrontabTool },
    ]
  },
  {
    id: 'convert',
    label: '转换工具',
    color: '#fa541c',
    tools: [
      { id: 'number-base', name: '进制转换', icon: '🔢', desc: '二进制/八进制/十进制/十六进制互转', component: NumberBaseConverter },
      { id: 'color', name: '颜色转换', icon: '🎨', desc: 'HEX/RGB/HSL颜色格式转换', component: ColorConverter },
    ]
  },
]

// Flatten all tools
const ALL_TOOLS = CATEGORIES.flatMap(cat => cat.tools.map(t => ({ ...t, category: cat.label, categoryColor: cat.color })))

function Toolbox() {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [activeTool, setActiveTool] = useState(toolId || null)

  // Sync with URL
  React.useEffect(() => {
    if (toolId && toolId !== activeTool) {
      setActiveTool(toolId)
    }
  }, [toolId])

  const filteredCategories = useMemo(() => {
    if (!searchText) return CATEGORIES
    const q = searchText.toLowerCase()
    return CATEGORIES.map(cat => ({
      ...cat,
      tools: cat.tools.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
    })).filter(cat => cat.tools.length > 0)
  }, [searchText])

  const selectedTool = ALL_TOOLS.find(t => t.id === activeTool)
  const SelectedComponent = selectedTool?.component

  const handleSelectTool = (id) => {
    setActiveTool(id)
    navigate(`/toolbox/${id}`, { replace: true })
  }

  const handleBack = () => {
    setActiveTool(null)
    navigate('/toolbox', { replace: true })
  }

  return (
    <div className="toolbox-container">
      {/* Left sidebar */}
      <div className="toolbox-sidebar">
        <div className="toolbox-sidebar-header">
          <Title level={5} style={{ margin: 0 }}>🧰 工具箱</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{ALL_TOOLS.length} 个工具</Text>
        </div>
        <div className="toolbox-search">
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索工具..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            size="small"
          />
        </div>
        <div className="toolbox-menu">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="toolbox-category">
              <div className="toolbox-category-label">
                <Badge color={cat.color} />
                <Text strong style={{ fontSize: 13 }}>{cat.label}</Text>
              </div>
              {cat.tools.map(tool => (
                <div
                  key={tool.id}
                  className={`toolbox-menu-item ${activeTool === tool.id ? 'active' : ''}`}
                  onClick={() => handleSelectTool(tool.id)}
                >
                  <span className="toolbox-menu-icon">{tool.icon}</span>
                  <span className="toolbox-menu-name">{tool.name}</span>
                </div>
              ))}
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center' }}>
              <Text type="secondary">未找到匹配的工具</Text>
            </div>
          )}
        </div>
      </div>

      {/* Right content */}
      <div className="toolbox-content">
        {SelectedComponent ? (
          <div className="toolbox-tool-wrapper">
            <div className="toolbox-tool-header">
              <Space>
                <span className="toolbox-tool-icon">{selectedTool.icon}</span>
                <div>
                  <Title level={5} style={{ margin: 0 }}>{selectedTool.name}</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>{selectedTool.desc}</Text>
                </div>
                <Tag color={selectedTool.categoryColor}>{selectedTool.category}</Tag>
              </Space>
              <a className="toolbox-back-link" onClick={handleBack}>← 返回工具列表</a>
            </div>
            <div className="toolbox-tool-body">
              <SelectedComponent />
            </div>
          </div>
        ) : (
          <div className="toolbox-welcome">
            <div className="toolbox-welcome-header">
              <Title level={3}>🧰 开发者工具箱</Title>
              <Paragraph type="secondary">选择左侧工具开始使用，所有工具均在浏览器端运行，无需后端服务</Paragraph>
            </div>
            <div className="toolbox-dashboard">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="toolbox-dashboard-category">
                  <div className="toolbox-dashboard-category-header">
                    <Badge color={cat.color} />
                    <Text strong>{cat.label}</Text>
                  </div>
                  <div className="toolbox-dashboard-tools">
                    {cat.tools.map(tool => (
                      <Card
                        key={tool.id}
                        size="small"
                        hoverable
                        className="toolbox-dashboard-card"
                        onClick={() => handleSelectTool(tool.id)}
                      >
                        <div className="toolbox-dashboard-card-content">
                          <span className="toolbox-dashboard-card-icon">{tool.icon}</span>
                          <div>
                            <Text strong style={{ fontSize: 13 }}>{tool.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>{tool.desc}</Text>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Toolbox
