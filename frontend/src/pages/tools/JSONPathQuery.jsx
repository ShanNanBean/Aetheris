import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, message } from 'antd'
import { SearchOutlined, CopyOutlined } from '@ant-design/icons'
import './JSONPathQuery.css'

const { TextArea } = Input
const { Text } = Typography

// Simple JSONPath implementation: $.key, $.arr[0], $..key (recursive), $.* (wildcard)
function jsonPathQuery(obj, path) {
  if (path === '$') return [obj]
  let normalized = path.startsWith('$') ? path.slice(1) : path
  if (normalized.startsWith('.')) normalized = normalized.slice(1)
  const parts = normalized.split(/\./).filter(Boolean)
  let results = [obj]
  for (const part of parts) {
    const newResults = []
    // Check for recursive descent (..key)
    const isRecursive = path.includes('..') && part === parts[parts.length - 1]
    for (const current of results) {
      if (current == null) continue
      if (isRecursive) {
        const collect = (node) => {
          if (node == null) return
          if (typeof node === 'object') {
            if (part in node) newResults.push(node[part])
            for (const v of Object.values(node)) collect(v)
          }
        }
        collect(current)
      } else if (part === '*') {
        if (Array.isArray(current)) newResults.push(...current)
        else if (typeof current === 'object') newResults.push(...Object.values(current))
      } else if (part.match(/^(.*?)\[(\d+)\]$/)) {
        const [, key, idx] = part.match(/^(.*?)\[(\d+)\]$/)
        const target = key ? current[key] : current
        if (Array.isArray(target) && +idx < target.length) newResults.push(target[+idx])
      } else if (typeof current === 'object' && part in current) {
        newResults.push(current[part])
      }
    }
    results = newResults
  }
  return results
}

const EXAMPLES = [
  { label: '基础取值', path: '$.name' },
  { label: '嵌套取值', path: '$.info.age' },
  { label: '数组元素', path: '$.items[0]' },
  { label: '通配符', path: '$.items.*' },
]

function JSONPathQuery() {
  const [json, setJson] = useState('')
  const [path, setPath] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleQuery = () => {
    try {
      const obj = JSON.parse(json)
      const res = jsonPathQuery(obj, path)
      setResult(res)
      setError('')
    } catch (e) {
      setError(e.message)
      setResult(null)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    message.success('已复制结果')
  }

  return (
    <div className="jsonpath-query">
      <Card size="small" title="JSONPath 查询" className="jsonpath-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>示例表达式：</Text>
            <Space wrap>
              {EXAMPLES.map(ex => (
                <Button key={ex.path} size="small" onClick={() => setPath(ex.path)}>{ex.label}: <code>{ex.path}</code></Button>
              ))}
            </Space>
          </div>
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>输入 JSON</Text>
            <TextArea value={json} onChange={e => setJson(e.target.value)} placeholder='{"name":"test","items":[1,2,3]}' autoSize={{ minRows: 4, maxRows: 10 }} />
          </div>
          <Input
            value={path}
            onChange={e => setPath(e.target.value)}
            placeholder="$.path.to.field"
            addonBefore="JSONPath"
            addonAfter={<Button type="link" size="small" icon={<SearchOutlined />} onClick={handleQuery} style={{ margin: -4 }}>查询</Button>}
            onPressEnter={handleQuery}
          />
          {error && <Text type="danger">错误: {error}</Text>}
          {result !== null && (
            <div className="jsonpath-result">
              <div className="jsonpath-result-header">
                <Text type="secondary">结果 ({result.length} 项)</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
              </div>
              <pre className="jsonpath-result-pre">{JSON.stringify(result.length === 1 ? result[0] : result, null, 2)}</pre>
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default JSONPathQuery
