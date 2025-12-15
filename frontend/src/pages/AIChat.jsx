import React, { useState, useRef, useEffect } from 'react'
import { Card, Input, Button, List, Avatar, message, Space, Typography, Empty, Switch, Tooltip, Collapse, Spin } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, ClearOutlined, BulbOutlined, LoadingOutlined } from '@ant-design/icons'
import { sendChat, sendChatStream, clearHistory } from '../services/api'
import './AIChat.css'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography

function AIChat() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState('default')
  const [enableThinking, setEnableThinking] = useState(false)
  // 流式输出状态
  const [streamingMessage, setStreamingMessage] = useState(null)
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
  }, [messages, loading, streamingMessage])

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

    const currentInput = inputValue
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    // 思考模式使用流式输出
    if (enableThinking) {
      // 初始化流式消息
      setStreamingMessage({
        role: 'assistant',
        content: '',
        reasoning_content: '',
        isStreaming: true,
        timestamp: Date.now()
      })

      await sendChatStream(
        {
          message: currentInput,
          session_id: sessionId,
          context: messages.slice(-10),
          enable_thinking: true
        },
        {
          onReasoning: (chunk) => {
            setStreamingMessage(prev => ({
              ...prev,
              reasoning_content: (prev?.reasoning_content || '') + chunk
            }))
          },
          onContent: (chunk) => {
            setStreamingMessage(prev => ({
              ...prev,
              content: (prev?.content || '') + chunk
            }))
          },
          onDone: (data) => {
            // 流式完成，将消息添加到历史
            setStreamingMessage(prev => {
              if (prev) {
                setMessages(msgs => [...msgs, {
                  ...prev,
                  isStreaming: false,
                  timestamp: Date.now()
                }])
              }
              return null
            })
            setLoading(false)
          },
          onError: (error) => {
            message.error(error || '发送失败')
            setStreamingMessage(null)
            setLoading(false)
          }
        }
      )
    } else {
      // 非思考模式使用普通 API
      try {
        const response = await sendChat({
          message: currentInput,
          session_id: sessionId,
          context: messages.slice(-10),
          enable_thinking: false
        })

        const assistantMessage = {
          role: 'assistant',
          content: response.data.reply,
          reasoning_content: response.data.reasoning_content,
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
          <Space>
            <Tooltip title={enableThinking ? '关闭思考模式' : '开启思考模式（使用 DeepSeek Reasoner）'}>
              <Space>
                <BulbOutlined style={{ color: enableThinking ? '#faad14' : '#999' }} />
                <Switch
                  size="small"
                  checked={enableThinking}
                  onChange={setEnableThinking}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>思考</Text>
              </Space>
            </Tooltip>
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClear}
              disabled={messages.length === 0}
            >
              清除历史
            </Button>
          </Space>
        }
        className="chat-card"
      >
        <div className="messages-container">
          {messages.length === 0 ? (
            <Empty description="开始对话吧" />
          ) : (
            <>
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
                        {/* 思考过程展示 */}
                        {msg.reasoning_content && (
                          <Collapse
                            size="small"
                            className="thinking-collapse"
                            items={[{
                              key: 'thinking',
                              label: (
                                <Space>
                                  <BulbOutlined className="thinking-icon" />
                                  <span>思考过程</span>
                                </Space>
                              ),
                              children: (
                                <div className="thinking-content">
                                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                    {msg.reasoning_content}
                                  </Paragraph>
                                </div>
                              )
                            }]}
                          />
                        )}
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
              {/* AI 加载中状态 */}
              {loading && !streamingMessage && (
                <div className="message-item assistant">
                  <div className="message-avatar">
                    <Avatar 
                      icon={<RobotOutlined />}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble loading-bubble">
                      <div className="loading-indicator">
                        <div className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <Text type="secondary" className="loading-text">
                          {enableThinking ? 'AI 正在思考中...' : 'AI 正在回复中...'}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* 流式输出消息 */}
              {streamingMessage && (
                <div className="message-item assistant">
                  <div className="message-avatar">
                    <Avatar 
                      icon={<RobotOutlined />}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble streaming-bubble">
                      {/* 思考过程实时输出 */}
                      {streamingMessage.reasoning_content && (
                        <div className="streaming-thinking">
                          <div className="streaming-thinking-header">
                            <BulbOutlined className="thinking-icon-animated" />
                            <span>正在思考...</span>
                          </div>
                          <div className="streaming-thinking-content">
                            <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {streamingMessage.reasoning_content}
                              <span className="typing-cursor">|</span>
                            </Paragraph>
                          </div>
                        </div>
                      )}
                      {/* 回复内容实时输出 */}
                      {streamingMessage.content && (
                        <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {streamingMessage.content}
                          <span className="typing-cursor">|</span>
                        </Paragraph>
                      )}
                      {/* 等待开始 */}
                      {!streamingMessage.reasoning_content && !streamingMessage.content && (
                        <div className="loading-indicator">
                          <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <Text type="secondary" className="loading-text">
                            AI 正在思考中...
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
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
