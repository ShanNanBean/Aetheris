import request from './request'

// 系统API
export const healthCheck = () => request.get('/system/health')
export const getNavigation = () => request.get('/system/navigation')

// AI API
export const sendChat = (data) => request.post('/ai/chat', data)
export const getHistory = (sessionId) => request.get(`/ai/history/${sessionId}`)
export const clearHistory = (sessionId) => request.delete(`/ai/history/${sessionId}`)
export const recommendTools = (data) => request.post('/ai/recommend', data)

/**
 * 流式聊天 API
 * @param {Object} data - 请求数据
 * @param {Function} onReasoning - 思考内容回调
 * @param {Function} onContent - 回复内容回调
 * @param {Function} onDone - 完成回调
 * @param {Function} onError - 错误回调
 */
export const sendChatStream = async (data, { onReasoning, onContent, onDone, onError }) => {
  try {
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // 处理 SSE 数据
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留未完成的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6)
          try {
            const data = JSON.parse(dataStr)
            
            switch (data.type) {
              case 'reasoning':
                onReasoning?.(data.content)
                break
              case 'content':
                onContent?.(data.content)
                break
              case 'done':
                onDone?.(data)
                break
              case 'error':
                onError?.(data.content)
                break
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    onError?.(error.message || '网络请求失败')
  }
}

// 工具API
export const getTools = () => request.get('/tools/')
export const getTool = (toolId) => request.get(`/tools/${toolId}`)
export const executeTool = (toolId, params) => 
  request.post(`/tools/${toolId}/execute`, { params })

// 条形码/二维码生成器 API
export const getCodeFormats = () => request.get('/tools/code_generator/formats')
export const generateCode = (params) => request.post('/tools/code_generator/generate', params)
export const generateCodeBatch = (params) => request.post('/tools/code_generator/generate_batch', params)

// 生成并合成到模板图片（支持文件上传）
export const generateCodeWithTemplate = async (formData) => {
  const response = await fetch('/api/tools/code_generator/generate_with_template', {
    method: 'POST',
    body: formData,
  })
  return response.json()
}
