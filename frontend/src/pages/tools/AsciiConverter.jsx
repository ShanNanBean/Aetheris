import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, Radio, message } from 'antd'
import { SwapOutlined, CopyOutlined } from '@ant-design/icons'
import './AsciiConverter.css'

const { TextArea } = Input
const { Text } = Typography

function AsciiConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('toAscii') // toAscii or toChar
  const [separator, setSeparator] = useState(' ')
  const [error, setError] = useState('')

  const handleConvert = () => {
    try {
      if (mode === 'toAscii') {
        const codes = [...input].map(c => c.charCodeAt(0))
        setOutput(codes.join(separator))
      } else {
        const codes = input.trim().split(/[\s,]+/).map(s => parseInt(s, 10))
        if (codes.some(isNaN)) throw new Error('输入包含非数字字符')
        setOutput(codes.map(c => String.fromCharCode(c)).join(''))
      }
      setError('')
    } catch (e) {
      setError(e.message)
      setOutput('')
    }
  }

  const handleCopy = () => { navigator.clipboard.writeText(output); message.success('已复制') }

  return (
    <div className="ascii-converter">
      <Card size="small" title="ASCII 转换器" className="ascii-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Radio.Group value={mode} onChange={e => { setMode(e.target.value); setOutput(''); setError('') }}>
            <Radio.Button value="toAscii">字符 → ASCII</Radio.Button>
            <Radio.Button value="toChar">ASCII → 字符</Radio.Button>
          </Radio.Group>
          {mode === 'toAscii' && (
            <Space>
              <Text type="secondary">分隔符:</Text>
              <Radio.Group value={separator} onChange={e => setSeparator(e.target.value)}>
                <Radio.Button value=" ">空格</Radio.Button>
                <Radio.Button value=",">逗号</Radio.Button>
                <Radio.Button value="-">横线</Radio.Button>
              </Radio.Group>
            </Space>
          )}
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>{mode === 'toAscii' ? '输入字符' : '输入ASCII码'}</Text>
            <TextArea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setError('') }} placeholder={mode === 'toAscii' ? '输入文本...' : '输入ASCII码（空格或逗号分隔）...'} autoSize={{ minRows: 3, maxRows: 8 }} />
          </div>
          <Button type="primary" icon={<SwapOutlined />} onClick={handleConvert} disabled={!input}>转换</Button>
          {error && <Text type="danger">{error}</Text>}
          {output && (
            <div className="ascii-result">
              <div className="ascii-result-header">
                <Text type="secondary">结果</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
              </div>
              <TextArea value={output} readOnly autoSize={{ minRows: 2, maxRows: 8 }} className="ascii-result-textarea" />
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default AsciiConverter
