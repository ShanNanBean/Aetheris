import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import AIChat from './pages/AIChat'
import JSONFormatter from './pages/JSONFormatter'
import JSONFieldExtractor from './pages/JSONFieldExtractor'
import CodeGenerator from './pages/CodeGenerator'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<AIChat />} />
        <Route path="ai_chat" element={<AIChat />} />
        <Route path="json_formatter" element={<JSONFormatter />} />
        <Route path="json_field_extractor" element={<JSONFieldExtractor />} />
        <Route path="code_generator" element={<CodeGenerator />} />
      </Route>
    </Routes>
  )
}

export default App
