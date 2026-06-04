import React, { useState } from 'react'
import { Input, Button, Space, Typography, Card, Tag, Descriptions, message } from 'antd'
import { KeyOutlined, CopyOutlined } from '@ant-design/icons'
import './JWTDecoder.css'

const { TextArea } = Input
const { Text } = Typography

function base64UrlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  return decodeURIComponent(escape(atob(s)))
}

function JWTDecoder() {
  const [token, setToken] = useState('')
  const [decoded, setDecoded] = useState(null)
  const [error, setError] = useState('')

  const handleDecode = () => {
    try {
      const parts = token.trim().split('.')
      if (parts.length !== 3) throw new Error('JWT应该包含3个部分（用.分隔）')
      const header = JSON.parse(base64UrlDecode(parts[0]))
      const payload = JSON.parse(base64UrlDecode(parts[1]))
      setDecoded({ header, payload, signature: parts[2] })
      setError('')
    } catch (e) {
      setError('解码失败: ' + e.message)
      setDecoded(null)
    }
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2))
    message.success('已复制')
  }

  return (
    <div className="jwt-decoder">
      <Card size="small" title="JWT 解码器" className="jwt-card"
        extra={<Text type="secondary" style={{ fontSize: 12 }}>仅解码，不验证签名</Text>}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ marginBottom: 4, display: 'block' }}>JWT Token</Text>
            <TextArea value={token} onChange={e => setToken(e.target.value)} placeholder="粘贴JWT Token..." autoSize={{ minRows: 3, maxRows: 6 }} style={{ fontFamily: 'monospace' }} />
          </div>
          <Button type="primary" icon={<KeyOutlined />} onClick={handleDecode} disabled={!token}>解码</Button>
          {error && <Text type="danger">{error}</Text>}
          {decoded && (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div className="jwt-section">
                <div className="jwt-section-header">
                  <Tag color="blue">Header</Tag>
                  <Button size="small" icon={<CopyOutlined />} onClick={() => copyText(decoded.header)}>复制</Button>
                </div>
                <pre className="jwt-pre">{JSON.stringify(decoded.header, null, 2)}</pre>
              </div>
              <div className="jwt-section">
                <div className="jwt-section-header">
                  <Tag color="green">Payload</Tag>
                  <Button size="small" icon={<CopyOutlined />} onClick={() => copyText(decoded.payload)}>复制</Button>
                </div>
                <pre className="jwt-pre">{JSON.stringify(decoded.payload, null, 2)}</pre>
                {decoded.payload.exp && (
                  <Text type={decoded.payload.exp * 1000 < Date.now() ? 'danger' : 'success'} style={{ fontSize: 12 }}>
                    过期时间: {new Date(decoded.payload.exp * 1000).toLocaleString('zh-CN')}
                    {decoded.payload.exp * 1000 < Date.now() ? ' (已过期)' : ' (有效)'}
                  </Text>
                )}
              </div>
              <div className="jwt-section">
                <Tag color="orange">Signature</Tag>
                <Text code style={{ fontSize: 11, wordBreak: 'break-all' }}>{decoded.signature}</Text>
              </div>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default JWTDecoder
