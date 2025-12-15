import React, { useState, useEffect } from 'react'
import {
  Card, Input, Button, Space, message, Tabs, Typography, Row, Col,
  Select, InputNumber, Switch, Upload, Form, Divider, Image, Spin,
  Collapse, Table, Progress
} from 'antd'
import {
  QrcodeOutlined, BarcodeOutlined, UploadOutlined, DownloadOutlined,
  ClearOutlined, PlusOutlined, DeleteOutlined, PlayCircleOutlined
} from '@ant-design/icons'
import { generateCode, generateCodeBatch, generateCodeWithTemplate, getCodeFormats } from '../services/api'
import './CodeGenerator.css'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

function CodeGenerator() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [formats, setFormats] = useState({ barcode_formats: [], qrcode_error_correct: [], output_formats: [] })
  const [previewImage, setPreviewImage] = useState(null)
  const [resultInfo, setResultInfo] = useState(null)
  
  // 模板相关
  const [useTemplate, setUseTemplate] = useState(false)
  const [templateFile, setTemplateFile] = useState(null)
  const [templatePreview, setTemplatePreview] = useState(null)
  
  // 批量生成相关
  const [batchMode, setBatchMode] = useState(false)
  const [batchItems, setBatchItems] = useState([{ key: '1', content: '' }])
  const [batchResults, setBatchResults] = useState([])
  const [batchProgress, setBatchProgress] = useState(0)

  useEffect(() => {
    loadFormats()
  }, [])

  const loadFormats = async () => {
    try {
      const response = await getCodeFormats()
      if (response.code === 0) {
        setFormats(response.data)
      }
    } catch (error) {
      console.error('加载格式失败:', error)
    }
  }

  // 处理模板图片上传
  const handleTemplateUpload = (file) => {
    setTemplateFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setTemplatePreview(e.target.result)
    }
    reader.readAsDataURL(file)
    return false
  }

  // 生成单个条码/二维码
  const handleGenerate = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      setPreviewImage(null)
      setResultInfo(null)

      let response
      if (useTemplate && templateFile) {
        // 使用模板合成
        const formData = new FormData()
        formData.append('content', values.content)
        formData.append('code_type', values.code_type || 'qrcode')
        formData.append('barcode_format', values.barcode_format || 'code128')
        formData.append('position_x', values.position_x || 0)
        formData.append('position_y', values.position_y || 0)
        formData.append('output_format', values.output_format || 'PNG')
        formData.append('output_quality', values.output_quality || 95)
        formData.append('qr_box_size', values.qr_box_size || 10)
        formData.append('qr_border', values.qr_border || 4)
        formData.append('barcode_width', values.barcode_width || 0.4)
        formData.append('barcode_height', values.barcode_height || 15.0)
        if (values.output_width) formData.append('output_width', values.output_width)
        if (values.output_height) formData.append('output_height', values.output_height)
        if (values.output_path) formData.append('output_path', values.output_path)
        formData.append('template', templateFile)

        response = await generateCodeWithTemplate(formData)
      } else {
        // 单独生成
        const params = {
          content: values.content,
          code_type: values.code_type || 'qrcode',
          barcode_format: values.barcode_format || 'code128',
          qr_box_size: values.qr_box_size || 10,
          qr_border: values.qr_border || 4,
          qr_error_correct: values.qr_error_correct || 'M',
          qr_fill_color: values.qr_fill_color || 'black',
          qr_back_color: values.qr_back_color || 'white',
          barcode_width: values.barcode_width || 0.4,
          barcode_height: values.barcode_height || 15.0,
          barcode_write_text: values.barcode_write_text !== false,
          output_format: values.output_format || 'PNG',
          output_quality: values.output_quality || 95,
          output_path: values.output_path || undefined,
        }
        if (values.output_width) params.output_width = values.output_width
        if (values.output_height) params.output_height = values.output_height

        response = await generateCode(params)
      }

      if (response.code === 0 && response.data.success) {
        const data = response.data
        setPreviewImage(`data:image/${values.output_format?.toLowerCase() || 'png'};base64,${data.base64}`)
        setResultInfo({
          width: data.width,
          height: data.height,
          format: data.format,
          quality: data.quality,
          saved_path: data.saved_path,
          file_size: data.file_size
        })
        message.success('生成成功')
      } else {
        message.error(response.data?.error || response.message || '生成失败')
      }
    } catch (error) {
      message.error('生成失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  // 批量生成
  const handleBatchGenerate = async () => {
    const validItems = batchItems.filter(item => item.content?.trim())
    if (validItems.length === 0) {
      message.warning('请至少输入一个要生成的内容')
      return
    }

    try {
      const values = await form.validateFields(['code_type', 'barcode_format', 'output_format', 'output_quality', 'output_path'])
      setLoading(true)
      setBatchResults([])
      setBatchProgress(0)

      const commonConfig = {
        code_type: values.code_type || 'qrcode',
        barcode_format: values.barcode_format || 'code128',
        output_format: values.output_format || 'PNG',
        output_quality: values.output_quality || 95,
      }

      // 添加输出路径模式
      const outputPath = values.output_path
      const items = validItems.map((item, index) => {
        const itemConfig = { content: item.content }
        if (outputPath) {
          // 为每个文件生成唯一的路径
          const ext = (values.output_format || 'png').toLowerCase()
          const basePath = outputPath.replace(/\\/g, '/')
          const fileName = `${item.content.replace(/[^a-zA-Z0-9]/g, '_')}_${index + 1}.${ext}`
          itemConfig.output_path = basePath.endsWith('/') ? `${basePath}${fileName}` : `${basePath}/${fileName}`
        }
        return itemConfig
      })

      const response = await generateCodeBatch({
        items,
        common_config: commonConfig,
        max_concurrent: 10
      })

      if (response.code === 0) {
        setBatchResults(response.data.results)
        setBatchProgress(100)
        message.success(`批量生成完成: 成功 ${response.data.success_count}，失败 ${response.data.fail_count}`)
      } else {
        message.error('批量生成失败')
      }
    } catch (error) {
      message.error('批量生成失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  // 添加批量项
  const addBatchItem = () => {
    setBatchItems([...batchItems, { key: Date.now().toString(), content: '' }])
  }

  // 删除批量项
  const removeBatchItem = (key) => {
    if (batchItems.length > 1) {
      setBatchItems(batchItems.filter(item => item.key !== key))
    }
  }

  // 更新批量项内容
  const updateBatchItem = (key, content) => {
    setBatchItems(batchItems.map(item =>
      item.key === key ? { ...item, content } : item
    ))
  }

  // 下载图片
  const handleDownload = () => {
    if (!previewImage) return
    
    const values = form.getFieldsValue()
    const link = document.createElement('a')
    link.href = previewImage
    link.download = `code_${Date.now()}.${(values.output_format || 'png').toLowerCase()}`
    link.click()
  }

  // 清空
  const handleClear = () => {
    form.resetFields()
    setPreviewImage(null)
    setResultInfo(null)
    setTemplateFile(null)
    setTemplatePreview(null)
    setBatchResults([])
    setBatchProgress(0)
  }

  // 批量结果表格列
  const batchColumns = [
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '状态', dataIndex: 'success', key: 'success', width: 80,
      render: (success) => success ? <Text type="success">成功</Text> : <Text type="danger">失败</Text>
    },
    { title: '尺寸', key: 'size', width: 120,
      render: (_, record) => record.success ? `${record.width}x${record.height}` : '-'
    },
    { title: '保存路径', dataIndex: 'saved_path', key: 'saved_path', ellipsis: true,
      render: (path) => path || '-'
    },
    { title: '预览', key: 'preview', width: 80,
      render: (_, record) => record.success ? (
        <Image 
          width={40} 
          src={`data:image/png;base64,${record.base64}`}
          preview={{ src: `data:image/png;base64,${record.base64}` }}
        />
      ) : '-'
    },
  ]

  return (
    <div className="code-generator-container">
      <Card
        title={
          <Space>
            <QrcodeOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>条码生成器</Title>
          </Space>
        }
        extra={
          <Space>
            <Text type="secondary">批量模式</Text>
            <Switch checked={batchMode} onChange={setBatchMode} />
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            code_type: 'qrcode',
            barcode_format: 'code128',
            qr_box_size: 10,
            qr_border: 4,
            qr_error_correct: 'M',
            qr_fill_color: 'black',
            qr_back_color: 'white',
            barcode_width: 0.4,
            barcode_height: 15.0,
            barcode_write_text: true,
            output_format: 'PNG',
            output_quality: 95,
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              {/* 左侧 - 配置区 */}
              <div className="config-section">
                <Divider orientation="left">基本配置</Divider>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="码类型" name="code_type">
                      <Select>
                        <Option value="qrcode">二维码 (QRCode)</Option>
                        <Option value="barcode">条形码 (Barcode)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.code_type !== currentValues.code_type
                      }
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('code_type') === 'barcode' ? (
                          <Form.Item label="条形码格式" name="barcode_format">
                            <Select>
                              {formats.barcode_formats.map(f => (
                                <Option key={f} value={f}>{f.toUpperCase()}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                  </Col>
                </Row>

                {!batchMode && (
                  <Form.Item
                    label="内容"
                    name="content"
                    rules={[{ required: true, message: '请输入要生成的内容' }]}
                  >
                    <TextArea
                      placeholder="输入要生成条形码/二维码的内容..."
                      autoSize={{ minRows: 3, maxRows: 6 }}
                    />
                  </Form.Item>
                )}

                {batchMode && (
                  <div className="batch-items">
                    <Text strong>批量内容列表</Text>
                    <div className="batch-list">
                      {batchItems.map((item, index) => (
                        <div key={item.key} className="batch-item">
                          <Input
                            placeholder={`内容 ${index + 1}`}
                            value={item.content}
                            onChange={(e) => updateBatchItem(item.key, e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <Button
                            icon={<DeleteOutlined />}
                            onClick={() => removeBatchItem(item.key)}
                            disabled={batchItems.length === 1}
                          />
                        </div>
                      ))}
                    </div>
                    <Button icon={<PlusOutlined />} onClick={addBatchItem} style={{ marginTop: 8 }}>
                      添加更多
                    </Button>
                  </div>
                )}

                <Collapse ghost>
                  <Collapse.Panel header="二维码配置" key="qrcode">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="方块大小" name="qr_box_size">
                          <InputNumber min={1} max={50} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="边框宽度" name="qr_border">
                          <InputNumber min={0} max={20} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="纠错级别" name="qr_error_correct">
                          <Select>
                            {formats.qrcode_error_correct.map(e => (
                              <Option key={e} value={e}>{e}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="前景色" name="qr_fill_color">
                          <Input type="color" defaultValue="#000000" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="背景色" name="qr_back_color">
                          <Input type="color" defaultValue="#ffffff" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Collapse.Panel>

                  <Collapse.Panel header="条形码配置" key="barcode">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="宽度系数" name="barcode_width">
                          <InputNumber min={0.1} max={2} step={0.1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="高度(mm)" name="barcode_height">
                          <InputNumber min={5} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="显示文字" name="barcode_write_text" valuePropName="checked">
                          <Switch defaultChecked />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Collapse.Panel>

                  <Collapse.Panel header="输出配置" key="output">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="输出格式" name="output_format">
                          <Select>
                            {formats.output_formats.map(f => (
                              <Option key={f} value={f}>{f}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="输出质量" name="output_quality">
                          <InputNumber min={1} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="输出宽度" name="output_width">
                          <InputNumber min={10} max={5000} placeholder="自动" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="输出高度" name="output_height">
                          <InputNumber min={10} max={5000} placeholder="自动" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item label="保存路径" name="output_path">
                          <Input placeholder="本地保存路径（可选，如 D:/output）" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Collapse.Panel>

                  {!batchMode && (
                    <Collapse.Panel header="模板合成" key="template">
                      <Form.Item label="启用模板合成">
                        <Switch checked={useTemplate} onChange={setUseTemplate} />
                      </Form.Item>
                      {useTemplate && (
                        <>
                          <Form.Item label="上传模板图片">
                            <Upload
                              beforeUpload={handleTemplateUpload}
                              showUploadList={false}
                              accept="image/*"
                            >
                              <Button icon={<UploadOutlined />}>选择模板图片</Button>
                            </Upload>
                            {templatePreview && (
                              <div className="template-preview">
                                <Image src={templatePreview} width={200} />
                              </div>
                            )}
                          </Form.Item>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item label="X坐标" name="position_x">
                                <InputNumber min={0} style={{ width: '100%' }} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item label="Y坐标" name="position_y">
                                <InputNumber min={0} style={{ width: '100%' }} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Collapse.Panel>
                  )}
                </Collapse>

                <Divider />

                <Space>
                  {!batchMode ? (
                    <Button
                      type="primary"
                      icon={<QrcodeOutlined />}
                      onClick={handleGenerate}
                      loading={loading}
                    >
                      生成
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={handleBatchGenerate}
                      loading={loading}
                    >
                      批量生成
                    </Button>
                  )}
                  <Button icon={<ClearOutlined />} onClick={handleClear}>
                    清空
                  </Button>
                </Space>
              </div>
            </Col>

            <Col span={12}>
              {/* 右侧 - 预览区 */}
              <div className="preview-section">
                <Divider orientation="left">预览</Divider>
                
                {loading && (
                  <div className="loading-container">
                    <Spin size="large" tip="生成中..." />
                  </div>
                )}

                {!batchMode && previewImage && (
                  <div className="preview-container">
                    <Image src={previewImage} style={{ maxWidth: '100%' }} />
                    
                    {resultInfo && (
                      <div className="result-info">
                        <Row gutter={[16, 8]}>
                          <Col span={12}><Text type="secondary">尺寸:</Text> {resultInfo.width} x {resultInfo.height}</Col>
                          <Col span={12}><Text type="secondary">格式:</Text> {resultInfo.format}</Col>
                          <Col span={12}><Text type="secondary">质量:</Text> {resultInfo.quality}%</Col>
                          {resultInfo.file_size && (
                            <Col span={12}><Text type="secondary">大小:</Text> {(resultInfo.file_size / 1024).toFixed(2)} KB</Col>
                          )}
                          {resultInfo.saved_path && (
                            <Col span={24}><Text type="secondary">保存路径:</Text> {resultInfo.saved_path}</Col>
                          )}
                        </Row>
                      </div>
                    )}

                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      style={{ marginTop: 16 }}
                    >
                      下载图片
                    </Button>
                  </div>
                )}

                {batchMode && batchResults.length > 0 && (
                  <div className="batch-results">
                    {batchProgress > 0 && batchProgress < 100 && (
                      <Progress percent={batchProgress} />
                    )}
                    <Table
                      dataSource={batchResults.map((r, i) => ({ ...r, key: i }))}
                      columns={batchColumns}
                      size="small"
                      pagination={{ pageSize: 10 }}
                    />
                  </div>
                )}

                {!loading && !previewImage && batchResults.length === 0 && (
                  <div className="empty-preview">
                    <QrcodeOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                    <Text type="secondary">生成的条码/二维码将在此处显示</Text>
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

export default CodeGenerator
