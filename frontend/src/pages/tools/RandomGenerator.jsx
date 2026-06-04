import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, InputNumber, Switch, Select, message, Row, Col, Slider } from 'antd'
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons'
import './RandomGenerator.css'

const { Text } = Typography

function generateUUID() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function generatePassword(length, useUpper, useLower, useDigit, useSymbol) {
  let chars = ''
  if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (useDigit) chars += '0123456789'
  if (useSymbol) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function generateIP() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.')
}

function generateMAC() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':')
}

function generateColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

const GENERATORS = [
  { key: 'uuid', label: 'UUID', gen: () => generateUUID() },
  { key: 'password', label: '随机密码' },
  { key: 'integer', label: '随机整数' },
  { key: 'float', label: '随机浮点数' },
  { key: 'string', label: '随机字符串' },
  { key: 'ip', label: 'IP地址', gen: () => generateIP() },
  { key: 'mac', label: 'MAC地址', gen: () => generateMAC() },
  { key: 'color', label: '随机颜色', gen: () => generateColor() },
  { key: 'boolean', label: '随机布尔值', gen: () => String(Math.random() > 0.5) },
  { key: 'date', label: '随机日期', gen: () => {
    const d = new Date(+new Date('2020-01-01') + Math.random() * (Date.now() - +new Date('2020-01-01')))
    return d.toISOString().split('T')[0]
  }},
]

function RandomGenerator() {
  const [type, setType] = useState('uuid')
  const [result, setResult] = useState('')
  const [count, setCount] = useState(1)
  // Password options
  const [pwLen, setPwLen] = useState(16)
  const [pwUpper, setPwUpper] = useState(true)
  const [pwLower, setPwLower] = useState(true)
  const [pwDigit, setPwDigit] = useState(true)
  const [pwSymbol, setPwSymbol] = useState(false)
  // Integer options
  const [intMin, setIntMin] = useState(0)
  const [intMax, setIntMax] = useState(100)
  // Float options
  const [fltMin, setFltMin] = useState(0)
  const [fltMax, setFltMax] = useState(1)
  const [fltPrecision, setFltPrecision] = useState(4)
  // String options
  const [strLen, setStrLen] = useState(16)
  const [strCharset, setStrCharset] = useState('alphanumeric')

  const generate = () => {
    const results = []
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'uuid': results.push(generateUUID()); break
        case 'password': results.push(generatePassword(pwLen, pwUpper, pwLower, pwDigit, pwSymbol)); break
        case 'integer': results.push(String(Math.floor(Math.random() * (intMax - intMin + 1)) + intMin)); break
        case 'float': results.push((Math.random() * (fltMax - fltMin) + fltMin).toFixed(fltPrecision)); break
        case 'string': {
          const chars = strCharset === 'alpha' ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
            : strCharset === 'numeric' ? '0123456789'
            : strCharset === 'lowercase' ? 'abcdefghijklmnopqrstuvwxyz'
            : 'abcdefghijklmnopqrstuvwxyz0123456789'
          results.push(Array.from({ length: strLen }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
          break
        }
        case 'ip': results.push(generateIP()); break
        case 'mac': results.push(generateMAC()); break
        case 'color': results.push(generateColor()); break
        case 'boolean': results.push(String(Math.random() > 0.5)); break
        case 'date': {
          const d = new Date(+new Date('2020-01-01') + Math.random() * (Date.now() - +new Date('2020-01-01')))
          results.push(d.toISOString().split('T')[0])
          break
        }
        default: results.push(generateUUID())
      }
    }
    setResult(results.join('\n'))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    message.success('已复制')
  }

  const renderOptions = () => {
    switch (type) {
      case 'password':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space><Text type="secondary">长度:</Text><Slider min={4} max={64} value={pwLen} onChange={setPwLen} style={{ width: 200 }} /><Text>{pwLen}</Text></Space>
            <Space><Switch checked={pwUpper} onChange={setPwUpper} size="small" /> <Text>大写字母</Text> <Switch checked={pwLower} onChange={setPwLower} size="small" /> <Text>小写字母</Text> <Switch checked={pwDigit} onChange={setPwDigit} size="small" /> <Text>数字</Text> <Switch checked={pwSymbol} onChange={setPwSymbol} size="small" /> <Text>符号</Text></Space>
          </Space>
        )
      case 'integer':
        return <Space><Text type="secondary">最小:</Text><InputNumber value={intMin} onChange={v => setIntMin(v ?? 0)} size="small" /><Text type="secondary">最大:</Text><InputNumber value={intMax} onChange={v => setIntMax(v ?? 100)} size="small" /></Space>
      case 'float':
        return <Space><Text type="secondary">最小:</Text><InputNumber value={fltMin} onChange={v => setFltMin(v ?? 0)} size="small" step={0.1} /><Text type="secondary">最大:</Text><InputNumber value={fltMax} onChange={v => setFltMax(v ?? 1)} size="small" step={0.1} /><Text type="secondary">精度:</Text><InputNumber min={0} max={10} value={fltPrecision} onChange={v => setFltPrecision(v ?? 4)} size="small" /></Space>
      case 'string':
        return <Space><Text type="secondary">长度:</Text><InputNumber min={1} max={256} value={strLen} onChange={v => setStrLen(v ?? 16)} size="small" /><Select value={strCharset} onChange={setStrCharset} size="small" options={[{ label: '字母+数字', value: 'alphanumeric' }, { label: '仅字母', value: 'alpha' }, { label: '仅小写', value: 'lowercase' }, { label: '仅数字', value: 'numeric' }]} /></Space>
      default: return null
    }
  }

  return (
    <div className="random-generator">
      <Card size="small" title="随机数据生成器" className="random-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={16} align="middle">
            <Col>
              <Space>
                <Text strong>类型:</Text>
                <Select value={type} onChange={setType} style={{ width: 140 }} options={GENERATORS.map(g => ({ label: g.label, value: g.key }))} />
              </Space>
            </Col>
            <Col>
              <Space>
                <Text type="secondary">数量:</Text>
                <InputNumber min={1} max={100} value={count} onChange={v => setCount(v ?? 1)} size="small" />
              </Space>
            </Col>
          </Row>
          {renderOptions()}
          <Button type="primary" icon={<ReloadOutlined />} onClick={generate}>生成</Button>
          {result && (
            <div className="random-result">
              <div className="random-result-header">
                <Text type="secondary">结果</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
              </div>
              <Input.TextArea value={result} readOnly autoSize={{ minRows: 2, maxRows: 10 }} className="random-result-textarea" />
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default RandomGenerator
