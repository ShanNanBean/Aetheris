import React, { useState, useMemo } from 'react'
import { Input, Button, Space, Typography, Card, InputNumber, Table, Tag, message } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import './CrontabTool.css'

const { Text } = Typography

const FIELD_NAMES = ['分钟', '小时', '日', '月', '星期']
const FIELD_RANGES = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]]

function parseCronField(field, min, max) {
  if (field === '*') return Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const values = new Set()
  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [range, step] = part.split('/')
      const stepN = parseInt(step)
      const start = range === '*' ? min : parseInt(range)
      for (let i = start; i <= max; i += stepN) values.add(i)
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number)
      for (let i = a; i <= b; i++) values.add(i)
    } else {
      values.add(parseInt(part))
    }
  }
  return [...values].sort((a, b) => a - b)
}

function validateCron(expr) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length < 5 || parts.length > 6) return { valid: false, error: '表达式应包含5个字段' }
  const fields = parts.slice(0, 5)
  try {
    for (let i = 0; i < 5; i++) {
      parseCronField(fields[i], FIELD_RANGES[i][0], FIELD_RANGES[i][1])
    }
    return { valid: true }
  } catch (e) {
    return { valid: false, error: '字段解析错误: ' + e.message }
  }
}

function getNextRuns(expr, count = 10) {
  const parts = expr.trim().split(/\s+/).slice(0, 5)
  const [minField, hourField, domField, monthField, dowField] = parts
  const mins = parseCronField(minField, 0, 59)
  const hours = parseCronField(hourField, 0, 23)
  const doms = parseCronField(domField, 1, 31)
  const months = parseCronField(monthField, 1, 12)
  const dows = parseCronField(dowField, 0, 6)

  const runs = []
  const now = new Date()
  let d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0)
  const maxIter = 525960 // ~1 year of minutes
  for (let i = 0; i < maxIter && runs.length < count; i++) {
    if (months.includes(d.getMonth() + 1) &&
        doms.includes(d.getDate()) &&
        dows.includes(d.getDay()) &&
        hours.includes(d.getHours()) &&
        mins.includes(d.getMinutes())) {
      runs.push(new Date(d))
    }
    d = new Date(d.getTime() + 60000)
  }
  return runs
}

const PRESETS = [
  { label: '每分钟', expr: '* * * * *' },
  { label: '每小时', expr: '0 * * * *' },
  { label: '每天零点', expr: '0 0 * * *' },
  { label: '每周一', expr: '0 0 * * 1' },
  { label: '每月1号', expr: '0 0 1 * *' },
  { label: '工作日9点', expr: '0 9 * * 1-5' },
]

function CrontabTool() {
  const [expr, setExpr] = useState('')
  const [count, setCount] = useState(10)
  const [result, setResult] = useState(null)

  const handleParse = () => {
    const validation = validateCron(expr)
    if (!validation.valid) {
      setResult({ error: validation.error })
      return
    }
    const runs = getNextRuns(expr, count)
    setResult({ runs, error: null })
  }

  return (
    <div className="crontab-tool">
      <Card size="small" title="Crontab 表达式解析" className="crontab-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>常用表达式：</Text>
            <Space wrap>
              {PRESETS.map(p => (
                <Tag key={p.expr} color="blue" style={{ cursor: 'pointer' }} onClick={() => setExpr(p.expr)}>{p.label}</Tag>
              ))}
            </Space>
          </div>
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>
              Cron 表达式 <Text type="secondary">(分 时 日 月 周)</Text>
            </Text>
            <Input value={expr} onChange={e => setExpr(e.target.value)} placeholder="* * * * *" style={{ fontFamily: 'monospace' }} onPressEnter={handleParse} />
          </div>
          <Space>
            <Text type="secondary">显示次数:</Text>
            <InputNumber min={1} max={50} value={count} onChange={setCount} size="small" />
            <Button type="primary" icon={<ClockCircleOutlined />} onClick={handleParse} disabled={!expr}>解析</Button>
          </Space>
          {result?.error && <Text type="danger">{result.error}</Text>}
          {result?.runs && (
            <div>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>最近 {result.runs.length} 次执行时间：</Text>
              <Table
                size="small"
                pagination={false}
                dataSource={result.runs.map((d, i) => ({ key: i, index: i + 1, time: d.toLocaleString('zh-CN'), weekday: ['日','一','二','三','四','五','六'][d.getDay()] }))}
                columns={[
                  { title: '#', dataIndex: 'index', width: 50 },
                  { title: '执行时间', dataIndex: 'time' },
                  { title: '星期', dataIndex: 'weekday', width: 60 },
                ]}
              />
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default CrontabTool
