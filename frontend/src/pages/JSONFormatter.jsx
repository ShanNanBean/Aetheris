import React, { useState } from 'react'
import { Card, Input, Button, Space, message, Tabs, Typography, Statistic, Row, Col, Switch } from 'antd'
import { FormatPainterOutlined, CompressOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons'
import { executeTool } from '../services/api'
import './JSONFormatter.css'

const { TextArea } = Input
const { Title, Text } = Typography

function JSONFormatter() {
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState('')
  const [compressed, setCompressed] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)

  const handleFormat = async () => {
    if (!input.trim()) {
      message.warning('请输入JSON内容')
      return
    }

    setLoading(true)
    try {
      const response = await executeTool('json_formatter', {
        input: input,
        indent: indent,
        sort_keys: sortKeys,
        ensure_ascii: false
      })

      if (response.data.success) {
        setFormatted(response.data.formatted)
        setCompressed(response.data.compressed)
        setStats(response.data.stats)
        message.success('格式化成功')
      } else {
        message.error(response.data.error || '格式化失败')
        setFormatted('')
        setCompressed('')
        setStats(null)
      }
    } catch (error) {
      message.error('格式化失败，请检查JSON格式')
      console.error('Format error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`已复制${type}结果`)
    }).catch(() => {
      message.error('复制失败')
    })
  }

  const handleClear = () => {
    setInput('')
    setFormatted('')
    setCompressed('')
    setStats(null)
  }

  const tabItems = [
    {
      key: 'formatted',
      label: '格式化',
      children: (
        <div className="result-container">
          <div className="result-header">
            <Text type="secondary">格式化结果</Text>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(formatted, '格式化')}
              disabled={!formatted}
            >
              复制
            </Button>
          </div>
          <TextArea
            value={formatted}
            readOnly
            autoSize={{ minRows: 10, maxRows: 20 }}
            className="result-textarea"
          />
        </div>
      )
    },
    {
      key: 'compressed',
      label: '压缩',
      children: (
        <div className="result-container">
          <div className="result-header">
            <Text type="secondary">压缩结果</Text>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(compressed, '压缩')}
              disabled={!compressed}
            >
              复制
            </Button>
          </div>
          <TextArea
            value={compressed}
            readOnly
            autoSize={{ minRows: 10, maxRows: 20 }}
            className="result-textarea"
          />
        </div>
      )
    }
  ]

  return (
    <div className="json-formatter-container">
      <Card 
        title={
          <Space>
            <FormatPainterOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>JSON 格式化工具</Title>
          </Space>
        }
      >
        <div className="formatter-content">
          <div className="input-section">
            <div className="section-header">
              <Text strong>输入 JSON</Text>
              <Space>
                <Text type="secondary">缩进:</Text>
                <Button size="small" onClick={() => setIndent(2)} type={indent === 2 ? 'primary' : 'default'}>2空格</Button>
                <Button size="small" onClick={() => setIndent(4)} type={indent === 4 ? 'primary' : 'default'}>4空格</Button>
                <Text type="secondary">排序键:</Text>
                <Switch checked={sortKeys} onChange={setSortKeys} />
              </Space>
            </div>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='粘贴或输入JSON内容...'
              autoSize={{ minRows: 10, maxRows: 20 }}
              className="input-textarea"
            />
            <div className="action-buttons">
              <Space>
                <Button
                  type="primary"
                  icon={<FormatPainterOutlined />}
                  onClick={handleFormat}
                  loading={loading}
                >
                  格式化
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                >
                  清空
                </Button>
              </Space>
            </div>
          </div>

          {stats && (
            <div className="stats-section">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="原始长度" value={stats.original_length} suffix="字符" />
                </Col>
                <Col span={6}>
                  <Statistic title="格式化长度" value={stats.formatted_length} suffix="字符" />
                </Col>
                <Col span={6}>
                  <Statistic title="压缩长度" value={stats.compressed_length} suffix="字符" />
                </Col>
                <Col span={6}>
                  <Statistic title="键数量" value={stats.keys_count} />
                </Col>
              </Row>
            </div>
          )}

          {(formatted || compressed) && (
            <div className="output-section">
              <Tabs items={tabItems} defaultActiveKey="formatted" />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default JSONFormatter
