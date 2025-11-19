import request from './request'

// 系统API
export const healthCheck = () => request.get('/system/health')
export const getNavigation = () => request.get('/system/navigation')

// AI API
export const sendChat = (data) => request.post('/ai/chat', data)
export const getHistory = (sessionId) => request.get(`/ai/history/${sessionId}`)
export const clearHistory = (sessionId) => request.delete(`/ai/history/${sessionId}`)
export const recommendTools = (data) => request.post('/ai/recommend', data)

// 工具API
export const getTools = () => request.get('/tools/')
export const getTool = (toolId) => request.get(`/tools/${toolId}`)
export const executeTool = (toolId, params) => 
  request.post(`/tools/${toolId}/execute`, { params })
