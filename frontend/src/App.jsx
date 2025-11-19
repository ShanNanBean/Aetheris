import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import AIChat from './pages/AIChat'
import JSONFormatter from './pages/JSONFormatter'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<AIChat />} />
        <Route path="json_formatter" element={<JSONFormatter />} />
      </Route>
    </Routes>
  )
}

export default App
