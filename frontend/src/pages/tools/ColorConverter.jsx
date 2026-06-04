import React, { useState, useCallback } from 'react'
import { Input, Button, Space, Typography, Card, Row, Col, Slider, message } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import './ColorConverter.css'

const { Text } = Typography

function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const n = parseInt(hex, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100
  let r, g, b
  if (s === 0) { r = g = b = l } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

function ColorConverter() {
  const [hex, setHex] = useState('#1890ff')
  const [r, setR] = useState(24)
  const [g, setG] = useState(144)
  const [b, setB] = useState(255)
  const [h, setH] = useState(210)
  const [s, setS] = useState(100)
  const [l, setL] = useState(55)

  const updateFromHex = useCallback((val) => {
    setHex(val)
    try {
      const rgb = hexToRgb(val)
      setR(rgb.r); setG(rgb.g); setB(rgb.b)
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setH(hsl.h); setS(hsl.s); setL(hsl.l)
    } catch {}
  }, [])

  const updateFromRgb = useCallback((nr, ng, nb) => {
    nr = Math.max(0, Math.min(255, nr)); ng = Math.max(0, Math.min(255, ng)); nb = Math.max(0, Math.min(255, nb))
    setR(nr); setG(ng); setB(nb)
    setHex(rgbToHex(nr, ng, nb))
    const hsl = rgbToHsl(nr, ng, nb)
    setH(hsl.h); setS(hsl.s); setL(hsl.l)
  }, [])

  const updateFromHsl = useCallback((nh, ns, nl) => {
    nh = Math.max(0, Math.min(360, nh)); ns = Math.max(0, Math.min(100, ns)); nl = Math.max(0, Math.min(100, nl))
    setH(nh); setS(ns); setL(nl)
    const rgb = hslToRgb(nh, ns, nl)
    setR(rgb.r); setG(rgb.g); setB(rgb.b)
    setHex(rgbToHex(rgb.r, rgb.g, rgb.b))
  }, [])

  const copy = (text) => { navigator.clipboard.writeText(text); message.success('已复制') }

  return (
    <div className="color-converter">
      <Card size="small" title="颜色转换器" className="color-card">
        <Row gutter={24}>
          <Col span={8}>
            <div className="color-preview-box" style={{ backgroundColor: hex }}>
              <div className="color-preview-text">{hex}</div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Text strong>HEX</Text>
              <Input value={hex} onChange={e => updateFromHex(e.target.value)} addonAfter={<Button size="small" type="link" onClick={() => copy(hex)}>复制</Button>} style={{ fontFamily: 'monospace' }} />
            </div>
            <div style={{ marginTop: 16 }}>
              <Text strong>RGB</Text>
              <Space>
                <Input value={`rgb(${r}, ${g}, ${b})`} readOnly style={{ fontFamily: 'monospace' }} addonAfter={<Button size="small" type="link" onClick={() => copy(`rgb(${r}, ${g}, ${b})`)}>复制</Button>} />
              </Space>
            </div>
            <div style={{ marginTop: 16 }}>
              <Text strong>HSL</Text>
              <Input value={`hsl(${h}, ${s}%, ${l}%)`} readOnly style={{ fontFamily: 'monospace' }} addonAfter={<Button size="small" type="link" onClick={() => copy(`hsl(${h}, ${s}%, ${l}%)`)}>复制</Button>} />
            </div>
          </Col>
          <Col span={16}>
            <div className="color-sliders">
              <div className="slider-group">
                <Text className="slider-label">R</Text>
                <Slider min={0} max={255} value={r} onChange={v => updateFromRgb(v, g, b)} trackStyle={{ backgroundColor: '#ff4d4f' }} handleStyle={{ borderColor: '#ff4d4f' }} />
                <Text className="slider-value">{r}</Text>
              </div>
              <div className="slider-group">
                <Text className="slider-label">G</Text>
                <Slider min={0} max={255} value={g} onChange={v => updateFromRgb(r, v, b)} trackStyle={{ backgroundColor: '#52c41a' }} handleStyle={{ borderColor: '#52c41a' }} />
                <Text className="slider-value">{g}</Text>
              </div>
              <div className="slider-group">
                <Text className="slider-label">B</Text>
                <Slider min={0} max={255} value={b} onChange={v => updateFromRgb(r, g, v)} trackStyle={{ backgroundColor: '#1890ff' }} handleStyle={{ borderColor: '#1890ff' }} />
                <Text className="slider-value">{b}</Text>
              </div>
              <div className="slider-group">
                <Text className="slider-label">H</Text>
                <Slider min={0} max={360} value={h} onChange={v => updateFromHsl(v, s, l)} />
                <Text className="slider-value">{h}°</Text>
              </div>
              <div className="slider-group">
                <Text className="slider-label">S</Text>
                <Slider min={0} max={100} value={s} onChange={v => updateFromHsl(h, v, l)} />
                <Text className="slider-value">{s}%</Text>
              </div>
              <div className="slider-group">
                <Text className="slider-label">L</Text>
                <Slider min={0} max={100} value={l} onChange={v => updateFromHsl(h, s, v)} />
                <Text className="slider-value">{l}%</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default ColorConverter
