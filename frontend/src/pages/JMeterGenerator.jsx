import React, { useState, useEffect } from 'react'
import {
  Card, Input, Button, Space, message, Tabs, Typography, Row, Col,
  Select, InputNumber, Form, Divider, Upload, Spin, Table, Tag,
  Collapse, Modal, Alert, Tooltip, Switch, List
} from 'antd'
import {
  ApiOutlined, UploadOutlined, DownloadOutlined, ClearOutlined,
  PlusOutlined, DeleteOutlined, PlayCircleOutlined, CopyOutlined,
  InfoCircleOutlined, ThunderboltOutlined, SettingOutlined,
  FileTextOutlined, CodeOutlined
} from '@ant-design/icons'
import {
  generateJMeterScript, parseJMeterInput, getJMeterPlugins
} from '../services/api'
import './JMeterGenerator.css'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

function JMeterGenerator() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [parseLoading, setParseLoading] = useState(false)
  
  // 解析后的请求列表
  const [requests, setRequests] = useState([])
  
  // 生成的脚本
  const [jmxContent, setJmxContent] = useState('')
  const [requiredPlugins, setRequiredPlugins] = useState([])
  
  // 输入模式
  const [inputMode, setInputMode] = useState('curl')
  const [inputContent, setInputContent] = useState('')
  
  // 高级配置
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [timers, setTimers] = useState([])
  const [assertions, setAssertions] = useState([])
  const [extractors, setExtractors] = useState([])
  
  // 插件信息
  const [pluginInfo, setPluginInfo] = useState({ plugins: [] })
  
  // 预览弹窗
  const [previewVisible, setPreviewVisible] = useState(false)

  useEffect(() => {
    loadPluginInfo()
  }, [])

  const loadPluginInfo = async () => {
    try {
      const response = await getJMeterPlugins()
      if (response.code === 0) {
        setPluginInfo(response.data)
      }
    } catch (error) {
      console.error('加载插件信息失败:', error)
    }
  }

  // 解析输入内容
  const handleParse = async () => {
    if (!inputContent.trim()) {
      message.warning('请输入要解析的内容')
      return
    }

    setParseLoading(true)
    try {
      let content = inputContent
      
      // 如果是swagger或json，尝试解析JSON
      if (inputMode === 'swagger' || inputMode === 'json') {
        try {
          content = JSON.parse(inputContent)
        } catch (e) {
          message.error('JSON格式错误，请检查输入内容')
          setParseLoading(false)
          return
        }
      }
      
      const response = await parseJMeterInput({
        type: inputMode,
        content: typeof content === 'string' ? content : JSON.stringify(content)
      })
      
      if (response.code === 0 && response.data.success) {
        setRequests(response.data.requests)
        message.success(`解析成功，共 ${response.data.requests.length} 个接口`)
      } else {
        message.error(response.data?.error || '解析失败')
      }
    } catch (error) {
      message.error('解析失败: ' + (error.message || '未知错误'))
    } finally {
      setParseLoading(false)
    }
  }

  // 手动添加接口
  const handleAddRequest = () => {
    setRequests([...requests, {
      name: `HTTP Request ${requests.length + 1}`,
      method: 'GET',
      url: '',
      headers: {},
      params: {},
      body: '',
      content_type: ''
    }])
  }

  // 删除接口
  const handleRemoveRequest = (index) => {
    const newRequests = [...requests]
    newRequests.splice(index, 1)
    setRequests(newRequests)
  }

  // 更新接口
  const handleUpdateRequest = (index, field, value) => {
    const newRequests = [...requests]
    newRequests[index] = { ...newRequests[index], [field]: value }
    setRequests(newRequests)
  }

  // 生成脚本
  const handleGenerate = async () => {
    if (requests.length === 0) {
      message.warning('请先添加至少一个接口')
      return
    }

    try {
      const values = await form.validateFields()
      setLoading(true)
      setJmxContent('')
      setRequiredPlugins([])

      // 构建API列表
      const apis = requests.map(req => ({
        name: req.name,
        method: req.method,
        url: req.url,
        headers: req.headers || {},
        params: req.params || {},
        body: req.body || ''
      }))

      const params = {
        test_plan_name: values.test_plan_name || 'Test Plan',
        thread_group: {
          name: values.thread_group_name || 'Thread Group',
          num_threads: values.num_threads || 10,
          ramp_time: values.ramp_time || 5,
          loops: values.loops || 1,
          scheduler: values.scheduler || false,
          duration: values.duration || 0,
          delay: values.delay || 0
        },
        apis: apis,
        http_defaults: values.use_http_defaults ? {
          domain: values.default_domain || '',
          port: values.default_port || '',
          protocol: values.default_protocol || 'https'
        } : null,
        timers: timers,
        assertions: assertions,
        post_processors: extractors,
        listeners: values.listeners || ['view_results_tree', 'summary_report'],
        user_variables: {}
      }

      const response = await generateJMeterScript(params)

      if (response.code === 0 && response.data.success) {
        setJmxContent(response.data.jmx_content)
        setRequiredPlugins(response.data.required_plugins || [])
        message.success(`脚本生成成功，共 ${response.data.request_count} 个请求`)
        setPreviewVisible(true)
      } else {
        message.error(response.data?.error || response.message || '生成失败')
      }
    } catch (error) {
      message.error('生成失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  // 下载JMX文件
  const handleDownload = () => {
    if (!jmxContent) return

    const blob = new Blob([jmxContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${form.getFieldValue('test_plan_name') || 'test_plan'}.jmx`
    link.click()
    URL.revokeObjectURL(url)
    message.success('JMX文件下载成功')
  }

  // 复制脚本内容
  const handleCopy = () => {
    if (!jmxContent) return
    navigator.clipboard.writeText(jmxContent)
    message.success('已复制到剪贴板')
  }

  // 清空
  const handleClear = () => {
    form.resetFields()
    setRequests([])
    setJmxContent('')
    setRequiredPlugins([])
    setInputContent('')
    setTimers([])
    setAssertions([])
    setExtractors([])
  }

  // 上传文件处理
  const handleFileUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setInputContent(e.target.result)
      // 根据文件类型自动设置输入模式
      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(e.target.result)
          if (data.swagger || data.openapi) {
            setInputMode('swagger')
          } else {
            setInputMode('json')
          }
        } catch {
          setInputMode('json')
        }
      }
    }
    reader.readAsText(file)
    return false
  }

  // 添加定时器
  const addTimer = () => {
    setTimers([...timers, { type: 'constant', delay: 300, name: 'Constant Timer' }])
  }

  // 添加断言
  const addAssertion = () => {
    setAssertions([...assertions, { name: 'Response Assertion', patterns: [''], test_type: 2 }])
  }

  // 添加提取器
  const addExtractor = () => {
    setExtractors([...extractors, { type: 'json', name: 'JSON Extractor', variable: '', json_path: '' }])
  }

  // 请求列表表格列
  const requestColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateRequest(index, 'name', e.target.value)}
          placeholder="请求名称"
        />
      )
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (text, record, index) => (
        <Select
          value={text}
          onChange={(value) => handleUpdateRequest(index, 'method', value)}
          style={{ width: '100%' }}
        >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
          <Option value="PATCH">PATCH</Option>
          <Option value="OPTIONS">OPTIONS</Option>
          <Option value="HEAD">HEAD</Option>
        </Select>
      )
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateRequest(index, 'url', e.target.value)}
          placeholder="https://api.example.com/path"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveRequest(index)}
        />
      )
    }
  ]

  return (
    <div className="jmeter-generator-container">
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
            <Title level={4} style={{ margin: 0 }}>JMeter脚本生成器</Title>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="支持通过curl命令、Swagger文档、JSON配置生成JMeter性能测试脚本">
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            test_plan_name: 'Test Plan',
            thread_group_name: 'Thread Group',
            num_threads: 10,
            ramp_time: 5,
            loops: 1,
            scheduler: false,
            duration: 0,
            delay: 0,
            use_http_defaults: false,
            default_protocol: 'https',
            listeners: ['view_results_tree', 'summary_report']
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              {/* 左侧 - 输入区 */}
              <div className="input-section">
                <Divider orientation="left">
                  <Space>
                    <UploadOutlined />
                    接口导入
                  </Space>
                </Divider>

                <Tabs activeKey={inputMode} onChange={setInputMode} type="card">
                  <TabPane tab="cURL命令" key="curl">
                    <TextArea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder={`粘贴curl命令，例如：
curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token' \\
  -d '{"name": "test", "email": "test@example.com"}'`}
                      autoSize={{ minRows: 6, maxRows: 12 }}
                    />
                  </TabPane>
                  <TabPane tab="Swagger/OpenAPI" key="swagger">
                    <TextArea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder="粘贴Swagger/OpenAPI JSON文档..."
                      autoSize={{ minRows: 6, maxRows: 12 }}
                    />
                  </TabPane>
                  <TabPane tab="JSON配置" key="json">
                    <TextArea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder={`粘贴JSON格式的接口配置，例如：
{
  "name": "登录接口",
  "method": "POST",
  "url": "https://api.example.com/login",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {"username": "test", "password": "123456"}
}`}
                      autoSize={{ minRows: 6, maxRows: 12 }}
                    />
                  </TabPane>
                </Tabs>

                <Space style={{ marginTop: 16 }}>
                  <Upload beforeUpload={handleFileUpload} showUploadList={false} accept=".json,.txt">
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                  </Upload>
                  <Button
                    type="primary"
                    icon={<ApiOutlined />}
                    onClick={handleParse}
                    loading={parseLoading}
                  >
                    解析
                  </Button>
                </Space>

                <Divider orientation="left">
                  <Space>
                    <FileTextOutlined />
                    接口列表
                    <Tag color="blue">{requests.length}个</Tag>
                  </Space>
                </Divider>

                <Table
                  dataSource={requests.map((r, i) => ({ ...r, key: i }))}
                  columns={requestColumns}
                  size="small"
                  pagination={false}
                  scroll={{ y: 200 }}
                  locale={{ emptyText: '暂无接口，请导入或手动添加' }}
                />

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddRequest}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  手动添加接口
                </Button>

                <Divider orientation="left">
                  <Space>
                    <SettingOutlined />
                    线程组配置
                  </Space>
                </Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="测试计划名称" name="test_plan_name">
                      <Input placeholder="Test Plan" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="线程组名称" name="thread_group_name">
                      <Input placeholder="Thread Group" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="线程数" name="num_threads">
                      <InputNumber min={1} max={10000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Ramp-Up时间(秒)" name="ramp_time">
                      <InputNumber min={0} max={3600} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="循环次数" name="loops">
                      <InputNumber min={-1} max={999999} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Collapse ghost>
                  <Collapse.Panel header="调度器配置" key="scheduler">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="启用调度器" name="scheduler" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="持续时间(秒)" name="duration">
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="启动延迟(秒)" name="delay">
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Collapse.Panel>

                  <Collapse.Panel header="HTTP默认值" key="http_defaults">
                    <Form.Item label="使用HTTP默认值" name="use_http_defaults" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="协议" name="default_protocol">
                          <Select>
                            <Option value="https">HTTPS</Option>
                            <Option value="http">HTTP</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="域名" name="default_domain">
                          <Input placeholder="api.example.com" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="端口" name="default_port">
                          <Input placeholder="443" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Collapse.Panel>

                  <Collapse.Panel header="监听器配置" key="listeners">
                    <Form.Item label="添加监听器" name="listeners">
                      <Select mode="multiple" placeholder="选择监听器">
                        <Option value="view_results_tree">查看结果树</Option>
                        <Option value="summary_report">汇总报告</Option>
                        <Option value="aggregate_report">聚合报告</Option>
                      </Select>
                    </Form.Item>
                  </Collapse.Panel>

                  <Collapse.Panel header="定时器" key="timers">
                    {timers.map((timer, index) => (
                      <div key={index} className="config-item">
                        <Row gutter={8}>
                          <Col span={8}>
                            <Select
                              value={timer.type}
                              onChange={(v) => {
                                const newTimers = [...timers]
                                newTimers[index].type = v
                                setTimers(newTimers)
                              }}
                              style={{ width: '100%' }}
                            >
                              <Option value="constant">固定定时器</Option>
                              <Option value="uniform_random">随机定时器</Option>
                            </Select>
                          </Col>
                          <Col span={10}>
                            <InputNumber
                              value={timer.delay}
                              onChange={(v) => {
                                const newTimers = [...timers]
                                newTimers[index].delay = v
                                setTimers(newTimers)
                              }}
                              addonAfter="ms"
                              style={{ width: '100%' }}
                            />
                          </Col>
                          <Col span={6}>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => setTimers(timers.filter((_, i) => i !== index))}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={addTimer} block>
                      添加定时器
                    </Button>
                  </Collapse.Panel>

                  <Collapse.Panel header="断言" key="assertions">
                    {assertions.map((assertion, index) => (
                      <div key={index} className="config-item">
                        <Row gutter={8}>
                          <Col span={16}>
                            <Input
                              value={assertion.patterns[0]}
                              onChange={(e) => {
                                const newAssertions = [...assertions]
                                newAssertions[index].patterns = [e.target.value]
                                setAssertions(newAssertions)
                              }}
                              placeholder="断言匹配内容"
                            />
                          </Col>
                          <Col span={8}>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => setAssertions(assertions.filter((_, i) => i !== index))}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={addAssertion} block>
                      添加断言
                    </Button>
                  </Collapse.Panel>

                  <Collapse.Panel header="提取器" key="extractors">
                    {extractors.map((extractor, index) => (
                      <div key={index} className="config-item">
                        <Row gutter={8}>
                          <Col span={6}>
                            <Select
                              value={extractor.type}
                              onChange={(v) => {
                                const newExtractors = [...extractors]
                                newExtractors[index].type = v
                                setExtractors(newExtractors)
                              }}
                              style={{ width: '100%' }}
                            >
                              <Option value="json">JSON</Option>
                              <Option value="regex">正则</Option>
                            </Select>
                          </Col>
                          <Col span={6}>
                            <Input
                              value={extractor.variable}
                              onChange={(e) => {
                                const newExtractors = [...extractors]
                                newExtractors[index].variable = e.target.value
                                setExtractors(newExtractors)
                              }}
                              placeholder="变量名"
                            />
                          </Col>
                          <Col span={8}>
                            <Input
                              value={extractor.json_path || extractor.regex}
                              onChange={(e) => {
                                const newExtractors = [...extractors]
                                if (newExtractors[index].type === 'json') {
                                  newExtractors[index].json_path = e.target.value
                                } else {
                                  newExtractors[index].regex = e.target.value
                                }
                                setExtractors(newExtractors)
                              }}
                              placeholder={extractor.type === 'json' ? '$.data.id' : '正则表达式'}
                            />
                          </Col>
                          <Col span={4}>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => setExtractors(extractors.filter((_, i) => i !== index))}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={addExtractor} block>
                      添加提取器
                    </Button>
                  </Collapse.Panel>
                </Collapse>

                <Divider />

                <Space>
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={handleGenerate}
                    loading={loading}
                    size="large"
                  >
                    生成JMeter脚本
                  </Button>
                  <Button icon={<ClearOutlined />} onClick={handleClear}>
                    清空
                  </Button>
                </Space>
              </div>
            </Col>

            <Col span={12}>
              {/* 右侧 - 预览区 */}
              <div className="preview-section">
                <Divider orientation="left">
                  <Space>
                    <CodeOutlined />
                    脚本预览
                  </Space>
                </Divider>

                {loading && (
                  <div className="loading-container">
                    <Spin size="large" tip="生成中..." />
                  </div>
                )}

                {jmxContent && (
                  <div className="preview-container">
                    {requiredPlugins.length > 0 && (
                      <Alert
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message="需要安装第三方插件"
                        description={
                          <div>
                            <Paragraph>本脚本使用了以下第三方插件，请先安装后再使用：</Paragraph>
                            <List
                              size="small"
                              dataSource={requiredPlugins}
                              renderItem={(plugin) => (
                                <List.Item>
                                  <Space>
                                    <Tag color="orange">{plugin.name}</Tag>
                                    <Text copyable={{ text: plugin.install_cmd }}>
                                      {plugin.install_cmd}
                                    </Text>
                                    <a href={plugin.download_url} target="_blank" rel="noopener noreferrer">
                                      下载地址
                                    </a>
                                  </Space>
                                </List.Item>
                              )}
                            />
                          </div>
                        }
                      />
                    )}

                    <div className="jmx-preview">
                      <pre>{jmxContent}</pre>
                    </div>

                    <Space style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleDownload}
                      >
                        下载JMX文件
                      </Button>
                      <Button
                        icon={<CopyOutlined />}
                        onClick={handleCopy}
                      >
                        复制内容
                      </Button>
                    </Space>
                  </div>
                )}

                {!loading && !jmxContent && (
                  <div className="empty-preview">
                    <ThunderboltOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                    <Text type="secondary">生成的JMeter脚本将在此处显示</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                      支持导入curl命令、Swagger文档、JSON配置
                    </Text>
                  </div>
                )}

                <Divider orientation="left">
                  <Space>
                    <InfoCircleOutlined />
                    可用插件
                  </Space>
                </Divider>

                <List
                  size="small"
                  dataSource={pluginInfo.plugins?.slice(0, 5) || []}
                  renderItem={(plugin) => (
                    <List.Item>
                      <Space>
                        <Tag color="green">{plugin.name}</Tag>
                        <a href={plugin.download_url} target="_blank" rel="noopener noreferrer">
                          查看详情
                        </a>
                      </Space>
                    </List.Item>
                  )}
                />
                {pluginInfo.plugins_manager_url && (
                  <div style={{ marginTop: 8 }}>
                    <a href={pluginInfo.plugins_manager_url} target="_blank" rel="noopener noreferrer">
                      <InfoCircleOutlined /> JMeter插件管理器
                    </a>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}

export default JMeterGenerator
