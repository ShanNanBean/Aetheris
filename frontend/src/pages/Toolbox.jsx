import React, { useMemo } from 'react'
import { Card, Typography, Badge } from 'antd'
import { useNavigate } from 'react-router-dom'
import './Toolbox.css'

const { Title, Paragraph, Text } = Typography

// Tool categories with route mappings
const CATEGORIES = [
  {
    id: 'string',
    label: '字符串工具',
    color: '#1890ff',
    tools: [
      { id: 'regex_test', name: '正则表达式测试', icon: '🔍', desc: '正则表达式在线测试与匹配高亮' },
      { id: 'string_toolkit', name: '字符串工具箱', icon: '📝', desc: '大小写转换、去空白、转义、统计' },
      { id: 'text_diff', name: '文本对比', icon: '📋', desc: '两段文本逐行对比，高亮差异' },
    ]
  },
  {
    id: 'json',
    label: 'JSON 工具',
    color: '#722ed1',
    tools: [
      { id: 'json_diff', name: 'JSON 对比', icon: '🔀', desc: 'JSON结构化对比，显示增删改' },
      { id: 'jsonpath_query', name: 'JSONPath 查询', icon: '🎯', desc: 'JSONPath表达式查询JSON数据' },
    ]
  },
  {
    id: 'encoding',
    label: '编码工具',
    color: '#13c2c2',
    tools: [
      { id: 'base64_tool', name: 'Base64 编解码', icon: '🔤', desc: 'Base64编码与解码' },
      { id: 'url_codec', name: 'URL 编解码', icon: '🔗', desc: 'URL编码与解码' },
      { id: 'jwt_decoder', name: 'JWT 解码器', icon: '🔑', desc: 'JWT Token解码（Header + Payload）' },
      { id: 'ascii_converter', name: 'ASCII 转换器', icon: '🔡', desc: '字符与ASCII码互转' },
    ]
  },
  {
    id: 'random',
    label: '随机工具',
    color: '#eb2f96',
    tools: [
      { id: 'random_generator', name: '随机数据生成', icon: '🎲', desc: 'UUID、密码、IP、颜色等随机生成' },
    ]
  },
  {
    id: 'crypto',
    label: '加密工具',
    color: '#faad14',
    tools: [
      { id: 'hash_tool', name: '哈希计算', icon: '#️⃣', desc: 'MD5/SHA1/SHA256/SHA512哈希计算' },
    ]
  },
  {
    id: 'time',
    label: '时间工具',
    color: '#52c41a',
    tools: [
      { id: 'timestamp_converter', name: '时间戳转换', icon: '⏰', desc: '时间戳与日期格式互转' },
      { id: 'crontab_tool', name: 'Crontab 解析', icon: '📅', desc: 'Cron表达式解析与下次执行时间' },
    ]
  },
  {
    id: 'convert',
    label: '转换工具',
    color: '#fa541c',
    tools: [
      { id: 'number_base_converter', name: '进制转换', icon: '🔢', desc: '二进制/八进制/十进制/十六进制互转' },
      { id: 'color_converter', name: '颜色转换', icon: '🎨', desc: 'HEX/RGB/HSL颜色格式转换' },
    ]
  },
]

const totalTools = CATEGORIES.reduce((sum, cat) => sum + cat.tools.length, 0)

function Toolbox() {
  const navigate = useNavigate()

  const handleToolClick = (toolId) => {
    navigate(`/${toolId}`)
  }

  return (
    <div className="toolbox-dashboard-page">
      <div className="toolbox-dashboard-header">
        <Title level={3}>🧰 开发者工具箱</Title>
        <Paragraph type="secondary">
          {totalTools} 个实用工具，所有工具均在浏览器端运行，无需后端服务。
          点击工具卡片直接进入使用。
        </Paragraph>
      </div>
      <div className="toolbox-dashboard-grid">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="toolbox-dashboard-section">
            <div className="toolbox-dashboard-section-header">
              <Badge color={cat.color} />
              <Text strong>{cat.label}</Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>{cat.tools.length}个</Text>
            </div>
            <div className="toolbox-dashboard-cards">
              {cat.tools.map(tool => (
                <Card
                  key={tool.id}
                  size="small"
                  hoverable
                  className="toolbox-tool-card"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <div className="toolbox-tool-card-content">
                    <span className="toolbox-tool-card-icon">{tool.icon}</span>
                    <div>
                      <Text strong style={{ fontSize: 14 }}>{tool.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{tool.desc}</Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Toolbox
