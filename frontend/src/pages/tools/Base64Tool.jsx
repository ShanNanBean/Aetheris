import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, message } from 'antd'
import { SwapOutlined, CopyOutlined } from '@ant-design/icons'
import './Base64Tool.css'

const { TextArea } = Input
const { Text } = Typography

function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode') // encode or decode
  const [error, setError] = useState('')

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
      setError('')
    } catch (e) {
      setError('转换失败: ' + e.message)
      setOutput('')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    message.success('已复制结果')
  }

  return (
    <div className="base64-tool">
      <Card size="small" title="Base64 编解码" className="base64-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space>
            <Button type={mode === 'encode' ? 'primary' : 'default'} onClick={() => { setMode('encode'); setOutput(''); setError('') }}>编码</Button>
            <Button type={mode === 'decode' ? 'primary' : 'default'} onClick={() => { setMode('decode'); setOutput(''); setError('') }}>解码</Button>
          </Space>
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>{mode === 'encode' ? '原文' : 'Base64字符串'}</Text>
            <TextArea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setError('') }} placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入Base64字符串...'} autoSize={{ minRows: 4, maxRows: 10 }} />
          </div>
          <Button type="primary" icon={<SwapOutlined />} onClick={handleConvert} disabled={!input}>{mode === 'encode' ? '编码' : '解码'}</Button>
          {error && <Text type="danger">{error}</Text>}
          {output && (
            <div className="base64-result">
              <div className="base64-result-header">
                <Text type="secondary">{mode === 'encode' ? 'Base64结果' : '解码结果'}</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
              </div>
              <TextArea value={output} readOnly autoSize={{ minRows: 3, maxRows: 10 }} className="base64-result-textarea" />
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default Base64Tool
