import React, { useState, useRef, useEffect } from 'react'
import { Card, Input, Button, List, Avatar, message, Space, Typography, Empty } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, ClearOutlined } from '@ant-design/icons'
import { sendChat, clearHistory } from '../services/api'
import './AIChat.css'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography

function AIChat() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState('default')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // 添加欢迎消息
    setMessages([{
      role: 'assistant',
      content: '您好！我是 Aetheris 智能助手。我可以帮助您：\n\n1. 回答各类问题\n2. 推荐和导航到合适的工具\n3. 提供工具使用指导\n\n请问有什么我可以帮助您的？',
      timestamp: Date.now()
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!inputValue.trim()) {
      return
    }

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const response = await sendChat({
        message: inputValue,
        session_id: sessionId,
        context: messages.slice(-10) // 只发送最近10条消息作为上下文
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply,
        intent: response.data.intent,
        recommended_tools: response.data.recommended_tools,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      message.error('发送失败，请重试')
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    try {
      await clearHistory(sessionId)
      setMessages([{
        role: 'assistant',
        content: '对话历史已清除。有什么新的问题吗？',
        timestamp: Date.now()
      }])
      message.success('对话历史已清除')
    } catch (error) {
      message.error('清除失败')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-chat-container">
      <Card 
        title={
          <Space>
            <RobotOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>AI 智能助手</Title>
          </Space>
        }
        extra={
          <Button 
            icon={<ClearOutlined />} 
            onClick={handleClear}
            disabled={messages.length === 0}
          >
            清除历史
          </Button>
        }
        className="chat-card"
      >
        <div className="messages-container">
          {messages.length === 0 ? (
            <Empty description="开始对话吧" />
          ) : (
            <List
              dataSource={messages}
              renderItem={(msg) => (
                <div className={`message-item ${msg.role}`}>
                  <div className="message-avatar">
                    <Avatar 
                      icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{ 
                        backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a' 
                      }}
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      <Paragraph 
                        style={{ margin: 0, whiteSpace: 'pre-wrap' }}
                      >
                        {msg.content}
                      </Paragraph>
                      {msg.recommended_tools && msg.recommended_tools.length > 0 && (
                        <div className="recommended-tools">
                          <Text type="secondary">推荐工具：</Text>
                          <Space wrap>
                            {msg.recommended_tools.map(tool => (
                              <Button key={tool.id} size="small" type="link">
                                {tool.name}
                              </Button>
                            ))}
                          </Space>
                        </div>
                      )}
                    </div>
                    <Text type="secondary" className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
              )}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!inputValue.trim()}
            className="send-button"
          >
            发送
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AIChat
