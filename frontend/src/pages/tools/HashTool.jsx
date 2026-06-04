import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, Select, message } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import CryptoJS from 'crypto-js'
import './HashTool.css'

const { TextArea } = Input
const { Text } = Typography

const ALGORITHMS = [
  { label: 'MD5', value: 'MD5' },
  { label: 'SHA1', value: 'SHA1' },
  { label: 'SHA256', value: 'SHA256' },
  { label: 'SHA512', value: 'SHA512' },
  { label: 'HMAC-MD5', value: 'HMAC-MD5' },
  { label: 'HMAC-SHA256', value: 'HMAC-SHA256' },
]

function HashTool() {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState('MD5')
  const [hmacKey, setHmacKey] = useState('')
  const [results, setResults] = useState(null)

  const handleHash = () => {
    if (!input) return
    const r = {}
    if (algorithm.startsWith('HMAC')) {
      const hashAlgo = algorithm.replace('HMAC-', '')
      const fn = CryptoJS[`HMAC${hashAlgo}`] || CryptoJS.HmacMD5
      r[algorithm] = fn(input, hmacKey || '').toString()
    } else {
      r[algorithm] = CryptoJS[algorithm](input).toString()
    }
    setResults(r)
  }

  const handleAll = () => {
    if (!input) return
    setResults({
      MD5: CryptoJS.MD5(input).toString(),
      SHA1: CryptoJS.SHA1(input).toString(),
      SHA256: CryptoJS.SHA256(input).toString(),
      SHA512: CryptoJS.SHA512(input).toString(),
    })
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    message.success('已复制')
  }

  return (
    <div className="hash-tool">
      <Card size="small" title="哈希计算" className="hash-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>输入文本</Text>
            <TextArea value={input} onChange={e => setInput(e.target.value)} placeholder="输入要计算哈希的文本..." autoSize={{ minRows: 3, maxRows: 8 }} />
          </div>
          <Space>
            <Select value={algorithm} onChange={setAlgorithm} style={{ width: 180 }} options={ALGORITHMS} />
            {algorithm.startsWith('HMAC') && (
              <Input value={hmacKey} onChange={e => setHmacKey(e.target.value)} placeholder="HMAC密钥" style={{ width: 200 }} />
            )}
          </Space>
          <Space>
            <Button type="primary" onClick={handleHash} disabled={!input}>计算 {algorithm}</Button>
            <Button onClick={handleAll} disabled={!input}>计算全部</Button>
          </Space>
          {results && (
            <div className="hash-results">
              {Object.entries(results).map(([algo, hash]) => (
                <div key={algo} className="hash-result-row">
                  <Text strong className="hash-algo-label">{algo}</Text>
                  <Text className="hash-value" copyable={{ onCopy: () => copyText(hash) }}>
                    <code>{hash}</code>
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

export default HashTool
