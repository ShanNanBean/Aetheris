import React, { useState } from 'react'
import { Card, Input, Button, Space, message, Radio, Typography, Table, Tag, Row, Col, Statistic, Tooltip, Alert } from 'antd'
import { SearchOutlined, DownloadOutlined, CopyOutlined, ClearOutlined, FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { executeTool } from '../services/api'
import './JSONFieldExtractor.css'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography

function JSONFieldExtractor() {
  const [jsonInput, setJsonInput] = useState('')
  const [fieldsInput, setFieldsInput] = useState('')
  const [outputFormat, setOutputFormat] = useState('csv')
  const [txtSeparator, setTxtSeparator] = useState('\\t')
  const [results, setResults] = useState([])
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExtract = async () => {
    if (!jsonInput.trim()) {
      message.warning('请输入 JSON 内容')
      return
    }
    if (!fieldsInput.trim()) {
      message.warning('请输入要提取的字段')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 解析字段列表
      const fields = fieldsInput.split(/[,，\n]/).map(f => f.trim()).filter(f => f)
      
      // 处理分隔符
      let separator = txtSeparator
      if (separator === '\\t') separator = '\t'
      else if (separator === '\\n') separator = '\n'

      const response = await executeTool('json_field_extractor', {
        json_input: jsonInput,
        fields: fields,
        output_format: outputFormat,
        txt_separator: separator
      })

      if (response.data.success) {
        setResults(response.data.results || [])
        setOutput(response.data.output || '')
        setStats(response.data.stats)
        setError(null)
        message.success(`成功提取 ${response.data.stats?.total_records || 0} 条记录`)
      } else {
        setError(response.data.error)
        setResults([])
        setOutput('')
        setStats(null)
      }
    } catch (err) {
      setError('提取失败，请检查输入格式')
      console.error('Extract error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      message.success('已复制到剪贴板')
    }).catch(() => {
      message.error('复制失败')
    })
  }

  const handleDownload = () => {
    if (!output) return
    
    const extension = outputFormat === 'csv' ? 'csv' : 'txt'
    const mimeType = outputFormat === 'csv' ? 'text/csv' : 'text/plain'
    const blob = new Blob([output], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `extracted_fields.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('下载成功')
  }

  const handleClear = () => {
    setJsonInput('')
    setFieldsInput('')
    setResults([])
    setOutput('')
    setStats(null)
    setError(null)
  }

  // 生成表格列
  const getTableColumns = () => {
    if (!results.length) return []
    const fields = Object.keys(results[0])
    return fields.map(field => ({
      title: field,
      dataIndex: field,
      key: field,
      ellipsis: true,
      render: (value) => {
        if (value === null || value === undefined) {
          return <Tag color="warning">缺失</Tag>
        }
        if (typeof value === 'object') {
          return <Text code>{JSON.stringify(value)}</Text>
        }
        return String(value)
      }
    }))
  }

  return (
    <div className="json-field-extractor-container">
      <Card 
        title={
          <Space>
            <SearchOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>JSON 字段提取</Title>
          </Space>
        }
      >
        <div className="extractor-content">
          {/* 输入区域 */}
          <Row gutter={16}>
            <Col span={14}>
              <div className="input-section">
                <div className="section-header">
                  <Text strong>输入 JSON</Text>
                </div>
                <TextArea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='粘贴或输入 JSON 内容...
支持对象或数组格式，例如：
{"name": "张三", "age": 25, "address": {"city": "北京"}}
或
[{"id": 1, "name": "产品A"}, {"id": 2, "name": "产品B"}]'
                  autoSize={{ minRows: 12, maxRows: 20 }}
                  className="input-textarea"
                />
              </div>
            </Col>
            <Col span={10}>
              <div className="fields-section">
                <div className="section-header">
                  <Text strong>提取字段</Text>
                  <Tooltip title="支持嵌套路径(user.name)、数组索引(list[0].id)、数组遍历(items[].id)，多个字段用逗号或换行分隔">
                    <QuestionCircleOutlined style={{ color: '#999' }} />
                  </Tooltip>
                </div>
                <TextArea
                  value={fieldsInput}
                  onChange={(e) => setFieldsInput(e.target.value)}
                  placeholder='输入要提取的字段，每行一个或逗号分隔：
name
address.city
data.list[0].id
body.items[].id   ← 遍历数组取所有id'
                  autoSize={{ minRows: 6, maxRows: 10 }}
                  className="fields-textarea"
                />
                
                <div className="format-section">
                  <div className="section-header">
                    <Text strong>输出格式</Text>
                  </div>
                  <Radio.Group value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                    <Radio.Button value="csv">CSV（带表头）</Radio.Button>
                    <Radio.Button value="txt">TXT（纯文本）</Radio.Button>
                  </Radio.Group>
                  
                  {outputFormat === 'txt' && (
                    <div className="separator-section">
                      <Text type="secondary">分隔符：</Text>
                      <Radio.Group 
                        value={txtSeparator} 
                        onChange={(e) => setTxtSeparator(e.target.value)}
                        size="small"
                      >
                        <Radio.Button value="\t">Tab</Radio.Button>
                        <Radio.Button value=",">逗号</Radio.Button>
                        <Radio.Button value="|">竖线</Radio.Button>
                        <Radio.Button value=" ">空格</Radio.Button>
                      </Radio.Group>
                    </div>
                  )}
                </div>

                <div className="action-buttons">
                  <Space>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={handleExtract}
                      loading={loading}
                    >
                      提取字段
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
            </Col>
          </Row>

          {/* 错误提示 */}
          {error && (
            <Alert
              message="提取失败"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="error-alert"
            />
          )}

          {/* 统计信息 */}
          {stats && (
            <div className="stats-section">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="提取记录数" value={stats.total_records} />
                </Col>
                <Col span={6}>
                  <Statistic title="字段数" value={stats.fields_count} />
                </Col>
                <Col span={12}>
                  <div className="fields-status">
                    <Text strong>字段状态：</Text>
                    <Space wrap style={{ marginTop: 8 }}>
                      {Object.entries(stats.fields_found || {}).map(([field, count]) => (
                        <Tag 
                          key={field}
                          color={stats.fields_missing[field] > 0 ? 'warning' : 'success'}
                        >
                          {field}: {count}/{stats.total_records}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {/* 结果预览表格 */}
          {results.length > 0 && (
            <div className="results-section">
              <div className="section-header">
                <Text strong>提取结果预览</Text>
                <Text type="secondary">（显示前 100 条）</Text>
              </div>
              <Table
                dataSource={results.slice(0, 100).map((r, i) => ({ ...r, _key: i }))}
                columns={getTableColumns()}
                rowKey="_key"
                size="small"
                scroll={{ x: 'max-content' }}
                pagination={{ pageSize: 10, showSizeChanger: true }}
              />
            </div>
          )}

          {/* 输出结果 */}
          {output && (
            <div className="output-section">
              <div className="section-header">
                <Space>
                  <FileTextOutlined />
                  <Text strong>导出内容</Text>
                  <Tag>{outputFormat.toUpperCase()}</Tag>
                </Space>
                <Space>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                  >
                    复制
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                  >
                    下载
                  </Button>
                </Space>
              </div>
              <TextArea
                value={output}
                readOnly
                autoSize={{ minRows: 6, maxRows: 15 }}
                className="output-textarea"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default JSONFieldExtractor
