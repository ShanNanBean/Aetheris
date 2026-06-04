import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, message } from 'antd'
import { SwapOutlined, CopyOutlined } from '@ant-design/icons'
import './URLCodec.css'

const { TextArea } = Input
const { Text } = Typography

function URLCodec() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [error, setError] = useState('')

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input))
      } else {
        setOutput(decodeURIComponent(input))
      }
      setError('')
    } catch (e) {
      setError('转换失败: ' + e.message)
      setOutput('')
    }
  }

  const handleFullEncode = () => {
    try {
      setOutput(encodeURI(input))
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    message.success('已复制结果')
  }

  return (
    <div className="url-codec">
      <Card size="small" title="URL 编解码" className="url-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space>
            <Button type={mode === 'encode' ? 'primary' : 'default'} onClick={() => { setMode('encode'); setOutput(''); setError('') }}>编码</Button>
            <Button type={mode === 'decode' ? 'primary' : 'default'} onClick={() => { setMode('decode'); setOutput(''); setError('') }}>解码</Button>
          </Space>
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>{mode === 'encode' ? '原始文本' : '编码后文本'}</Text>
            <TextArea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setError('') }} placeholder={mode === 'encode' ? '输入要编码的URL或文本...' : '输入编码后的URL...'} autoSize={{ minRows: 4, maxRows: 10 }} />
          </div>
          <Space>
            <Button type="primary" icon={<SwapOutlined />} onClick={handleConvert} disabled={!input}>{mode === 'encode' ? 'encodeURIComponent' : '解码'}</Button>
            {mode === 'encode' && <Button onClick={handleFullEncode} disabled={!input}>encodeURI</Button>}
          </Space>
          {error && <Text type="danger">{error}</Text>}
          {output && (
            <div className="url-result">
              <div className="url-result-header">
                <Text type="secondary">结果</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
              </div>
              <TextArea value={output} readOnly autoSize={{ minRows: 3, maxRows: 10 }} className="url-result-textarea" />
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default URLCodec
