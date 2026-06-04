import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, Select, message } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import './StringToolkit.css'

const { TextArea } = Input
const { Text } = Typography

function StringToolkit() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')

  const ops = [
    { key: 'upper', label: '转大写', fn: s => s.toUpperCase() },
    { key: 'lower', label: '转小写', fn: s => s.toLowerCase() },
    { key: 'capitalize', label: '首字母大写', fn: s => s.replace(/\b\w/g, c => c.toUpperCase()) },
    { key: 'reverse', label: '反转', fn: s => [...s].reverse().join('') },
    { key: 'trim', label: '去除首尾空白', fn: s => s.trim() },
    { key: 'trimAll', label: '去除所有空白', fn: s => s.replace(/\s+/g, '') },
    { key: 'dedup', label: '去除重复行', fn: s => [...new Set(s.split('\n'))].join('\n') },
    { key: 'sortLines', label: '行排序', fn: s => s.split('\n').sort().join('\n') },
    { key: 'escapeJs', label: 'JS转义', fn: s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') },
    { key: 'unescapeJs', label: 'JS反转义', fn: s => s.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\') },
    { key: 'escapeHtml', label: 'HTML转义', fn: s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') },
    { key: 'unescapeHtml', label: 'HTML反转义', fn: s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"') },
    { key: 'count', label: '统计信息', fn: s => {
      const chars = s.length
      const words = s.trim() ? s.trim().split(/\s+/).length : 0
      const lines = s ? s.split('\n').length : 0
      const chinese = (s.match(/[\u4e00-\u9fa5]/g) || []).length
      return `字符: ${chars}\n单词: ${words}\n行数: ${lines}\n中文字符: ${chinese}`
    }},
  ]

  const handleOp = (op) => {
    if (!input && op.key !== 'count') return
    setOutput(op.fn(input))
  }

  const handleFindReplace = () => {
    if (!find) return
    setOutput(input.split(find).join(replace))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    message.success('已复制')
  }

  return (
    <div className="string-toolkit">
      <Card size="small" title="字符串工具箱" className="string-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>输入文本</Text>
            <TextArea value={input} onChange={e => setInput(e.target.value)} placeholder="输入文本..." autoSize={{ minRows: 4, maxRows: 10 }} />
          </div>
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>操作</Text>
            <Space wrap size={[8, 8]}>
              {ops.map(op => (
                <Button key={op.key} size="small" onClick={() => handleOp(op)}>{op.label}</Button>
              ))}
            </Space>
          </div>
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>查找替换</Text>
            <Space>
              <Input value={find} onChange={e => setFind(e.target.value)} placeholder="查找" style={{ width: 160 }} />
              <Input value={replace} onChange={e => setReplace(e.target.value)} placeholder="替换为" style={{ width: 160 }} />
              <Button size="small" onClick={handleFindReplace}>替换</Button>
            </Space>
          </div>
          {output && (
            <div className="string-result">
              <div className="string-result-header">
                <Text type="secondary">结果</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
              </div>
              <TextArea value={output} readOnly autoSize={{ minRows: 2, maxRows: 10 }} className="string-result-textarea" />
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default StringToolkit
