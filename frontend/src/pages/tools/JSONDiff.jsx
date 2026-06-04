import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, Tag, Collapse } from 'antd'
import { DiffOutlined, ClearOutlined } from '@ant-design/icons'
import './JSONDiff.css'

const { TextArea } = Input
const { Text } = Typography

function deepDiff(obj1, obj2, path = '') {
  const diffs = []
  if (typeof obj1 !== typeof obj2 || (obj1 === null) !== (obj2 === null)) {
    diffs.push({ path: path || '(root)', type: 'changed', old: obj1, new: obj2 })
    return diffs
  }
  if (obj1 === obj2) return diffs
  if (typeof obj1 !== 'object' || obj1 === null) {
    diffs.push({ path: path || '(root)', type: 'changed', old: obj1, new: obj2 })
    return diffs
  }
  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    diffs.push({ path: path || '(root)', type: 'changed', old: obj1, new: obj2 })
    return diffs
  }
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key
    if (!(key in obj1)) {
      diffs.push({ path: currentPath, type: 'added', new: obj2[key] })
    } else if (!(key in obj2)) {
      diffs.push({ path: currentPath, type: 'removed', old: obj1[key] })
    } else {
      diffs.push(...deepDiff(obj1[key], obj2[key], currentPath))
    }
  }
  return diffs
}

function JSONDiff() {
  const [json1, setJson1] = useState('')
  const [json2, setJson2] = useState('')
  const [diffs, setDiffs] = useState(null)
  const [error, setError] = useState('')

  const handleDiff = () => {
    try {
      const obj1 = JSON.parse(json1)
      const obj2 = JSON.parse(json2)
      const result = deepDiff(obj1, obj2)
      setDiffs(result)
      setError('')
    } catch (e) {
      setError('JSON解析失败: ' + e.message)
      setDiffs(null)
    }
  }

  const colorMap = { added: 'green', removed: 'red', changed: 'orange' }
  const labelMap = { added: '新增', removed: '删除', changed: '修改' }

  return (
    <div className="json-diff">
      <Card size="small" title="JSON 对比" className="json-diff-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div className="json-diff-inputs">
            <div className="json-diff-col">
              <Text strong>原始 JSON</Text>
              <TextArea value={json1} onChange={e => setJson1(e.target.value)} placeholder='输入原始JSON...' autoSize={{ minRows: 6, maxRows: 12 }} />
            </div>
            <div className="json-diff-col">
              <Text strong>修改后 JSON</Text>
              <TextArea value={json2} onChange={e => setJson2(e.target.value)} placeholder='输入修改后的JSON...' autoSize={{ minRows: 6, maxRows: 12 }} />
            </div>
          </div>
          <Space>
            <Button type="primary" icon={<DiffOutlined />} onClick={handleDiff} disabled={!json1 || !json2}>对比</Button>
            <Button icon={<ClearOutlined />} onClick={() => { setJson1(''); setJson2(''); setDiffs(null); setError('') }}>清空</Button>
          </Space>
          {error && <Text type="danger">{error}</Text>}
          {diffs && (
            <div>
              <Space style={{ marginBottom: 8 }}>
                <Text>共 <Text strong>{diffs.length}</Text> 处差异：</Text>
                <Tag color="green">新增 {diffs.filter(d => d.type === 'added').length}</Tag>
                <Tag color="red">删除 {diffs.filter(d => d.type === 'removed').length}</Tag>
                <Tag color="orange">修改 {diffs.filter(d => d.type === 'changed').length}</Tag>
              </Space>
              {diffs.length === 0 ? (
                <Text type="success">两个JSON完全相同 ✓</Text>
              ) : (
                <div className="json-diff-list">
                  {diffs.map((d, i) => (
                    <div key={i} className={`json-diff-item json-diff-${d.type}`}>
                      <Tag color={colorMap[d.type]}>{labelMap[d.type]}</Tag>
                      <Text code>{d.path}</Text>
                      {d.type === 'removed' && <Text className="diff-val-old">{JSON.stringify(d.old)}</Text>}
                      {d.type === 'added' && <Text className="diff-val-new">{JSON.stringify(d.new)}</Text>}
                      {d.type === 'changed' && (
                        <span>
                          <Text delete className="diff-val-old">{JSON.stringify(d.old)}</Text>
                          <Text style={{ margin: '0 8px' }}>→</Text>
                          <Text className="diff-val-new">{JSON.stringify(d.new)}</Text>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default JSONDiff
