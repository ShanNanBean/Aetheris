import React, { useState, useMemo } from 'react'
import { Input, Button, Space, Typography, Card } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import './TextDiff.css'

const { TextArea } = Input
const { Text } = Typography

function computeDiff(oldStr, newStr) {
  const oldLines = oldStr.split('\n')
  const newLines = newStr.split('\n')
  const result = []

  // Simple LCS-based diff
  const m = oldLines.length, n = newLines.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = oldLines[i - 1] === newLines[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])

  let i = m, j = n
  const ops = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.unshift({ type: 'equal', oldLine: i, newLine: j, text: oldLines[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: 'add', newLine: j, text: newLines[j - 1] })
      j--
    } else {
      ops.unshift({ type: 'remove', oldLine: i, text: oldLines[i - 1] })
      i--
    }
  }
  return ops
}

function TextDiff() {
  const [oldText, setOldText] = useState('')
  const [newText, setNewText] = useState('')
  const [showResult, setShowResult] = useState(false)

  const diff = useMemo(() => {
    if (!showResult) return null
    return computeDiff(oldText, newText)
  }, [oldText, newText, showResult])

  const stats = useMemo(() => {
    if (!diff) return null
    return {
      added: diff.filter(d => d.type === 'add').length,
      removed: diff.filter(d => d.type === 'remove').length,
      unchanged: diff.filter(d => d.type === 'equal').length,
    }
  }, [diff])

  return (
    <div className="text-diff">
      <Card size="small" title="文本对比" className="diff-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div className="diff-inputs">
            <div className="diff-input-col">
              <Text strong>原始文本</Text>
              <TextArea
                value={oldText}
                onChange={e => { setOldText(e.target.value); setShowResult(false) }}
                placeholder="输入原始文本..."
                autoSize={{ minRows: 6, maxRows: 12 }}
              />
            </div>
            <div className="diff-input-col">
              <Text strong>修改后文本</Text>
              <TextArea
                value={newText}
                onChange={e => { setNewText(e.target.value); setShowResult(false) }}
                placeholder="输入修改后的文本..."
                autoSize={{ minRows: 6, maxRows: 12 }}
              />
            </div>
          </div>
          <Button type="primary" icon={<SwapOutlined />} onClick={() => setShowResult(true)} disabled={!oldText || !newText}>
            对比
          </Button>
          {diff && stats && (
            <div>
              <Space style={{ marginBottom: 8 }}>
                <Text type="success">+{stats.added} 新增</Text>
                <Text type="danger">-{stats.removed} 删除</Text>
                <Text type="secondary">{stats.unchanged} 未变</Text>
              </Space>
              <div className="diff-result">
                <table className="diff-table">
                  <tbody>
                    {diff.map((d, idx) => (
                      <tr key={idx} className={`diff-line diff-${d.type}`}>
                        <td className="diff-line-no">{d.type !== 'add' ? d.oldLine : ''}</td>
                        <td className="diff-line-no">{d.type !== 'remove' ? d.newLine : ''}</td>
                        <td className="diff-marker">{d.type === 'add' ? '+' : d.type === 'remove' ? '-' : ' '}</td>
                        <td className="diff-text">{d.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default TextDiff
