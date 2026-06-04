import React, { useState, useMemo } from 'react'
import { Input, Button, Space, Tag, Typography, Switch, Card, Row, Col, Select } from 'antd'
import { SearchOutlined, ClearOutlined } from '@ant-design/icons'
import './RegExTester.css'

const { TextArea } = Input
const { Text, Title } = Typography

const PRESET_PATTERNS = [
  { label: '邮箱', pattern: '[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}' },
  { label: '手机号', pattern: '1[3-9]\\d{9}' },
  { label: 'URL', pattern: 'https?://[\\w.-]+(?:/[\\w./-]*)?' },
  { label: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
  { label: '日期', pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}' },
  { label: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
]

function RegExTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [error, setError] = useState('')

  const result = useMemo(() => {
    if (!pattern || !testString) return null
    try {
      const regex = new RegExp(pattern, flags)
      const matches = []
      let match
      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({ value: match[0], index: match.index, groups: match.slice(1) })
          if (!match[0]) break
        }
      } else {
        match = regex.exec(testString)
        if (match) {
          matches.push({ value: match[0], index: match.index, groups: match.slice(1) })
        }
      }
      setError('')
      return matches
    } catch (e) {
      setError(e.message)
      return null
    }
  }, [pattern, flags, testString])

  const highlightedText = useMemo(() => {
    if (!result || result.length === 0 || !testString) return null
    try {
      const regex = new RegExp(pattern, flags)
      const parts = []
      let lastIndex = 0
      let m
      const tempRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      while ((m = tempRegex.exec(testString)) !== null) {
        if (m.index > lastIndex) parts.push({ text: testString.slice(lastIndex, m.index), match: false })
        parts.push({ text: m[0], match: true })
        lastIndex = m.index + m[0].length
        if (!m[0]) break
      }
      if (lastIndex < testString.length) parts.push({ text: testString.slice(lastIndex), match: false })
      return parts
    } catch { return null }
  }, [result, pattern, flags, testString])

  return (
    <div className="regex-tester">
      <Card size="small" title="正则表达式" className="regex-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>常用模式：</Text>
            <Space wrap size={[8, 8]}>
              {PRESET_PATTERNS.map(p => (
                <Tag key={p.label} color="blue" style={{ cursor: 'pointer' }} onClick={() => setPattern(p.pattern)}>
                  {p.label}
                </Tag>
              ))}
            </Space>
          </div>
          <Row gutter={16}>
            <Col span={18}>
              <Input
                addonBefore={<Text code>/</Text>}
                addonAfter={<Text code>/{flags}</Text>}
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                mode="multiple"
                value={flags.split('')}
                onChange={v => setFlags(v.join(''))}
                style={{ width: '100%' }}
                placeholder="标志"
                options={[
                  { label: 'g (全局)', value: 'g' },
                  { label: 'i (忽略大小写)', value: 'i' },
                  { label: 'm (多行)', value: 'm' },
                  { label: 's (点匹配换行)', value: 's' },
                ]}
                maxTagCount={4}
              />
            </Col>
          </Row>
          {error && <Text type="danger">错误: {error}</Text>}
          <div>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>测试字符串：</Text>
            <TextArea
              value={testString}
              onChange={e => setTestString(e.target.value)}
              placeholder="输入要测试的文本..."
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </div>
          {highlightedText && (
            <div className="regex-highlight-area">
              <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>匹配高亮：</Text>
              <pre className="regex-highlight-pre">
                {highlightedText.map((p, i) =>
                  p.match ? <mark key={i} className="regex-match">{p.text}</mark> : <span key={i}>{p.text}</span>
                )}
              </pre>
            </div>
          )}
          {result && (
            <div>
              <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>
                匹配结果：共 <Text strong>{result.length}</Text> 个匹配
              </Text>
              {result.length > 0 && (
                <div className="regex-results-table">
                  <table>
                    <thead>
                      <tr><th>#</th><th>匹配内容</th><th>位置</th><th>捕获组</th></tr>
                    </thead>
                    <tbody>
                      {result.map((m, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td><code>{m.value}</code></td>
                          <td>{m.index}</td>
                          <td>{m.groups.length > 0 ? m.groups.map((g, j) => <Tag key={j} color="green">${j + 1}: {g}</Tag>) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default RegExTester
