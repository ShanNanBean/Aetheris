import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, InputNumber, Radio, message, Divider } from 'antd'
import { CopyOutlined, SwapOutlined, ClockCircleOutlined } from '@ant-design/icons'
import './TimestampConverter.css'

const { Text, Title } = Typography

const FORMAT_OPTIONS = [
  { label: 'ISO 8601', key: 'iso' },
  { label: '本地时间', key: 'locale' },
  { label: '年-月-日 时:分:秒', key: 'ymd' },
  { label: '时间戳(秒)', key: 'seconds' },
  { label: '时间戳(毫秒)', key: 'millis' },
]

function formatTimestamp(ts, unit, format) {
  const ms = unit === 's' ? ts * 1000 : ts
  const d = new Date(ms)
  if (isNaN(d.getTime())) return '无效时间戳'
  switch (format) {
    case 'iso': return d.toISOString()
    case 'locale': return d.toLocaleString('zh-CN')
    case 'ymd': {
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
    case 'seconds': return Math.floor(ms / 1000).toString()
    case 'millis': return ms.toString()
    default: return d.toISOString()
  }
}

function TimestampConverter() {
  const [mode, setMode] = useState('toDate') // toDate = timestamp→date, toTs = date→timestamp
  const [timestamp, setTimestamp] = useState('')
  const [unit, setUnit] = useState('ms')
  const [dateStr, setDateStr] = useState('')
  const [results, setResults] = useState(null)

  const handleConvert = () => {
    if (mode === 'toDate') {
      const ts = Number(timestamp)
      if (isNaN(ts)) { return }
      const ms = unit === 's' ? ts * 1000 : ts
      const d = new Date(ms)
      if (isNaN(d.getTime())) return
      setResults({
        iso: d.toISOString(),
        locale: d.toLocaleString('zh-CN'),
        ymd: formatTimestamp(ts, unit, 'ymd'),
        seconds: Math.floor(ms / 1000).toString(),
        millis: ms.toString(),
      })
    } else {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return
      setResults({
        seconds: Math.floor(d.getTime() / 1000).toString(),
        millis: d.getTime().toString(),
        iso: d.toISOString(),
        locale: d.toLocaleString('zh-CN'),
        ymd: formatTimestamp(d.getTime(), 'ms', 'ymd'),
      })
    }
  }

  const handleNow = () => {
    const now = Date.now()
    setTimestamp(now.toString())
    setUnit('ms')
    setMode('toDate')
    const d = new Date(now)
    setResults({
      iso: d.toISOString(),
      locale: d.toLocaleString('zh-CN'),
      ymd: formatTimestamp(now, 'ms', 'ymd'),
      seconds: Math.floor(now / 1000).toString(),
      millis: now.toString(),
    })
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    message.success('已复制')
  }

  return (
    <div className="timestamp-converter">
      <Card size="small" title="时间戳转换" className="ts-card"
        extra={<Button icon={<ClockCircleOutlined />} onClick={handleNow}>获取当前时间</Button>}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Radio.Group value={mode} onChange={e => { setMode(e.target.value); setResults(null) }}>
            <Radio.Button value="toDate">时间戳 → 日期</Radio.Button>
            <Radio.Button value="toTs">日期 → 时间戳</Radio.Button>
          </Radio.Group>
          {mode === 'toDate' ? (
            <Space>
              <Input value={timestamp} onChange={e => setTimestamp(e.target.value)} placeholder="输入时间戳..." style={{ width: 300 }} />
              <Radio.Group value={unit} onChange={e => { setUnit(e.target.value); setResults(null) }}>
                <Radio.Button value="ms">毫秒</Radio.Button>
                <Radio.Button value="s">秒</Radio.Button>
              </Radio.Group>
            </Space>
          ) : (
            <Input value={dateStr} onChange={e => setDateStr(e.target.value)} placeholder="如 2025-01-01 12:00:00 或 ISO格式" style={{ width: 400 }} />
          )}
          <Button type="primary" icon={<SwapOutlined />} onClick={handleConvert}>转换</Button>
          {results && (
            <div className="ts-results">
              {FORMAT_OPTIONS.map(fmt => (
                <div key={fmt.key} className="ts-result-row">
                  <Text className="ts-result-label">{fmt.label}</Text>
                  <Text className="ts-result-value" copyable={{ onCopy: () => copyText(results[fmt.key]) }}>
                    <code>{results[fmt.key]}</code>
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

export default TimestampConverter
