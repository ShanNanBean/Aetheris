import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import AIChat from './pages/AIChat'
import JSONFormatter from './pages/JSONFormatter'
import JSONFieldExtractor from './pages/JSONFieldExtractor'
import CodeGenerator from './pages/CodeGenerator'
import JMeterGenerator from './pages/JMeterGenerator'
import Toolbox from './pages/Toolbox'
// Data processing tools
import RegExTester from './pages/tools/RegExTester'
import TextDiff from './pages/tools/TextDiff'
import JSONDiff from './pages/tools/JSONDiff'
import JSONPathQuery from './pages/tools/JSONPathQuery'
import TimestampConverter from './pages/tools/TimestampConverter'
import Base64Tool from './pages/tools/Base64Tool'
import URLCodec from './pages/tools/URLCodec'
import JWTDecoder from './pages/tools/JWTDecoder'
import HashTool from './pages/tools/HashTool'
import CrontabTool from './pages/tools/CrontabTool'
import RandomGenerator from './pages/tools/RandomGenerator'
import StringToolkit from './pages/tools/StringToolkit'
import ColorConverter from './pages/tools/ColorConverter'
import NumberBaseConverter from './pages/tools/NumberBaseConverter'
import AsciiConverter from './pages/tools/AsciiConverter'
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
        <Route path="jmeter_generator" element={<JMeterGenerator />} />
        <Route path="toolbox" element={<Toolbox />} />
        {/* Data processing tools */}
        <Route path="regex_test" element={<RegExTester />} />
        <Route path="text_diff" element={<TextDiff />} />
        <Route path="string_toolkit" element={<StringToolkit />} />
        <Route path="json_diff" element={<JSONDiff />} />
        <Route path="jsonpath_query" element={<JSONPathQuery />} />
        <Route path="timestamp_converter" element={<TimestampConverter />} />
        <Route path="base64_tool" element={<Base64Tool />} />
        <Route path="url_codec" element={<URLCodec />} />
        <Route path="jwt_decoder" element={<JWTDecoder />} />
        <Route path="hash_tool" element={<HashTool />} />
        <Route path="crontab_tool" element={<CrontabTool />} />
        <Route path="random_generator" element={<RandomGenerator />} />
        <Route path="color_converter" element={<ColorConverter />} />
        <Route path="number_base_converter" element={<NumberBaseConverter />} />
        <Route path="ascii_converter" element={<AsciiConverter />} />
      </Route>
    </Routes>
  )
}

export default App
