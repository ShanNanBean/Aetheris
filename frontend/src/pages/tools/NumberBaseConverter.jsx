import React, { useState, useCallback } from 'react'
import { Input, Button, Space, Typography, Card, Select, InputNumber, message } from 'antd'
import { SwapOutlined, CopyOutlined } from '@ant-design/icons'
import './NumberBaseConverter.css'

const { Text } = Typography

const BASES = [
  { label: '二进制 (2)', value: 2 },
  { label: '八进制 (8)', value: 8 },
  { label: '十进制 (10)', value: 10 },
  { label: '十六进制 (16)', value: 16 },
  { label: '自定义', value: 0 },
]

function NumberBaseConverter() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState(10)
  const [customFrom, setCustomFrom] = useState(10)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const actualFromBase = fromBase === 0 ? customFrom : fromBase

  const handleConvert = () => {
    try {
      const num = parseInt(input, actualFromBase)
      if (isNaN(num)) throw new Error('无法解析输入')
      setResults({
        2: num.toString(2),
        8: num.toString(8),
        10: num.toString(10),
        16: num.toString(16).toUpperCase(),
      })
      setError('')
    } catch (e) {
      setError(e.message)
      setResults(null)
    }
  }

  const copyText = (text) => { navigator.clipboard.writeText(text); message.success('已复制') }

  return (
    <div className="number-base-converter">
      <Card size="small" title="进制转换" className="nbc-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>输入数值</Text>
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="输入数值..." style={{ fontFamily: 'monospace' }} onPressEnter={handleConvert} />
          </div>
          <Space>
            <Text type="secondary">输入进制:</Text>
            <Select value={fromBase} onChange={setFromBase} style={{ width: 150 }} options={BASES} />
            {fromBase === 0 && <InputNumber min={2} max={36} value={customFrom} onChange={v => setCustomFrom(v ?? 10)} size="small" />}
            <Button type="primary" icon={<SwapOutlined />} onClick={handleConvert} disabled={!input}>转换</Button>
          </Space>
          {error && <Text type="danger">{error}</Text>}
          {results && (
            <div className="nbc-results">
              {[
                { label: '二进制 (2)', value: results[2], color: '#722ed1' },
                { label: '八进制 (8)', value: results[8], color: '#13c2c2' },
                { label: '十进制 (10)', value: results[10], color: '#1890ff' },
                { label: '十六进制 (16)', value: results[16], color: '#eb2f96' },
              ].map(item => (
                <div key={item.label} className="nbc-result-row">
                  <Text strong style={{ width: 120, color: item.color }}>{item.label}</Text>
                  <Text className="nbc-result-value" copyable={{ onCopy: () => copyText(item.value) }}>
                    <code>{item.value}</code>
                  </Text>
                </div>
              ))}
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default NumberBaseConverter
