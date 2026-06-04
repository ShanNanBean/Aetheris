# Aetheris - AI 驱动的测试工具平台

<div align="center">
  <h3>⚡ 智能工具集成管理平台</h3>
  <p>为测试工程师打造的一站式工具箱，集成 AI 对话、代码生成、数据处理于一体</p>
  <br/>
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.109-green?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Ant Design-6-red?logo=antdesign" alt="Ant Design" />
  <img src="https://img.shields.io/badge/Vite-5-purple?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</div>

---

## 📋 项目简介

Aetheris 是一个面向测试工程师的智能工具集成平台。日常工作中零散的小工具（JSON 格式化、正则测试、时间戳转换、编码解码……）总是散落在各个网站，Aetheris 把它们集中到一个地方，再加上 AI 对话能力，让工具使用更高效。

### ✨ 核心特性

- 🤖 **AI 智能助手** - 支持 DeepSeek 推理模式的流式对话，可推荐工具
- 🧰 **工具箱** - 15+ 纯前端工具，零延迟、无需后端，覆盖日常开发测试场景
- 🔧 **专业工具** - JMeter 脚本生成、条码/二维码生成、JSON 字段提取
- 🎨 **现代 UI** - 玻璃拟态风格、流畅动画、6 种主题色 + 暗黑模式
- ⚡ **纯前端优先** - 工具箱所有工具在浏览器端运行，无需网络请求
- 🔌 **易扩展** - 插件化架构，轻松添加新工具

## 🧰 工具箱一览

### 字符串工具
| 工具 | 说明 |
|------|------|
| 正则测试 | 正则表达式匹配测试，高亮匹配结果 |
| 文本对比 | 逐行 diff，颜色标记新增/删除/修改 |
| 字符串工具集 | 大小写转换、空白去除、转义/反转义、字数统计、查找替换 |

### JSON 工具
| 工具 | 说明 |
|------|------|
| JSON 格式化 | 格式化、压缩、验证 JSON（支持自定义缩进） |
| JSON 字段提取 | 支持嵌套路径、数组索引、批量导出 CSV/TXT |
| JSON 对比 | 结构化 diff，显示新增/删除/变更字段 |
| JSONPath 查询 | 用 JSONPath 表达式查询 JSON 数据 |

### 编码工具
| 工具 | 说明 |
|------|------|
| Base64 编解码 | 文本 ↔ Base64 互转 |
| URL 编解码 | URL 编码/解码 |
| JWT 解码 | 解析 JWT Token 的 Header 和 Payload |
| 二维码/条码生成 | 支持 QR Code、Code128、EAN13 等多种格式 |
| 颜色值转换 | HEX / RGB / HSL 互转，实时预览 |
| 进制转换 | 二进制/八进制/十进制/十六进制，支持 2-36 进制 |
| ASCII 转换 | 字符 ↔ ASCII 码互转 |

### 加密工具
| 工具 | 说明 |
|------|------|
| 哈希计算 | MD5 / SHA1 / SHA256 / SHA512，一键复制 |

### 随机工具
| 工具 | 说明 |
|------|------|
| 随机数据生成 | UUID、随机密码、IP 地址、MAC 地址、整数、浮点数、字符串、日期、颜色、布尔值 |

### 时间工具
| 工具 | 说明 |
|------|------|
| 时间戳转换 | 时间戳 ↔ 日期字符串，支持秒/毫秒，多种格式 |

### Crontab 工具
| 工具 | 说明 |
|------|------|
| Crontab 解析 | 解析/生成 Cron 表达式，查看未来 N 次执行时间 |

### AI 工具
| 工具 | 说明 |
|------|------|
| AI 对话 | 支持 DeepSeek 推理模式，流式输出，思维链展示 |
| JMeter 生成器 | 从 cURL/Swagger/JSON 生成 JMeter 测试脚本 |

## 🏗️ 技术栈

### 前端
- **框架**: React 18 + Vite 5
- **UI 组件**: Ant Design 6
- **路由**: React Router 6
- **状态管理**: Zustand 4（持久化主题设置）
- **HTTP 客户端**: Axios（拦截器 + SSE 流式）
- **加密**: crypto-js（哈希计算）
- **设计**: 玻璃拟态、CSS 自定义属性、Inter 字体

### 后端
- **框架**: FastAPI + Uvicorn
- **数据验证**: Pydantic v2
- **AI 集成**: OpenAI 兼容 API（DeepSeek / OpenAI / 自定义）
- **图像处理**: Pillow、python-barcode、qrcode
- **缓存**: 内存缓存（可扩展 Redis）

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- npm

### 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 AI API Key

# 启动服务
python -m app.main
```

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 访问地址

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 📁 项目结构

```
Aetheris/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/    # API 路由 (ai, tools, system)
│   │   ├── core/             # 配置、缓存、响应格式
│   │   ├── services/         # AI 服务、工具注册
│   │   ├── tools/            # 工具实现 (代码生成、JMeter等)
│   │   └── main.py           # FastAPI 入口
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/layout/  # 布局组件 (Header, Sider, Footer)
│   │   ├── pages/              # 页面组件
│   │   │   ├── AIChat.jsx      # AI 对话
│   │   │   ├── Toolbox.jsx     # 工具箱主页
│   │   │   ├── tools/          # 15 个独立工具组件
│   │   │   │   ├── RegExTester.jsx
│   │   │   │   ├── TextDiff.jsx
│   │   │   │   ├── JSONDiff.jsx
│   │   │   │   ├── JSONPathQuery.jsx
│   │   │   │   ├── TimestampConverter.jsx
│   │   │   │   ├── Base64Tool.jsx
│   │   │   │   ├── URLCodec.jsx
│   │   │   │   ├── JWTDecoder.jsx
│   │   │   │   ├── HashTool.jsx
│   │   │   │   ├── CrontabTool.jsx
│   │   │   │   ├── RandomGenerator.jsx
│   │   │   │   ├── StringToolkit.jsx
│   │   │   │   ├── ColorConverter.jsx
│   │   │   │   ├── NumberBaseConverter.jsx
│   │   │   │   └── AsciiConverter.jsx
│   │   │   ├── JSONFormatter.jsx
│   │   │   ├── JSONFieldExtractor.jsx
│   │   │   ├── CodeGenerator.jsx
│   │   │   └── JMeterGenerator.jsx
│   │   ├── services/           # API 调用封装
│   │   ├── stores/             # Zustand 状态管理
│   │   ├── config/             # 主题配置
│   │   └── App.jsx             # 路由定义
│   ├── package.json
│   └── vite.config.js
│
├── deploy/                     # 生产构建输出
└── README.md
```

## 🎨 设计特色

- **玻璃拟态风格** — 半透明毛玻璃效果的头部和侧边栏
- **流畅动画** — 页面切换、卡片悬停、消息出现的平滑过渡
- **主题系统** — 6 种主题色（蓝/紫/青/绿/橙/红）+ 暗黑模式
- **响应式** — 适配 1200px+ 屏幕
- **暗黑模式** — 专业级暗色主题，不只是颜色反转

## 🔧 配置说明

### 后端环境变量

```env
# 服务配置
HOST=127.0.0.1
PORT=8000

# AI 配置
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat
```

### 前端配置

- 开发代理: `vite.config.js` 中 `/api` → `http://127.0.0.1:8000`
- 部署路径: `base: '/aetheris/'`（可在 vite.config.js 中修改）

## 📝 开发指南

### 添加新工具（纯前端）

1. 在 `src/pages/tools/` 下创建工具组件（.jsx + .css）
2. 在 `src/pages/Toolbox.jsx` 中注册工具到对应分类
3. 重新构建：`npm run build`

### 添加新工具（需要后端）

1. 在 `backend/app/tools/` 下创建工具实现
2. 在 `backend/app/services/tool_registry.py` 中注册
3. 在 `backend/app/api/endpoints/tools.py` 中添加路由
4. 在前端创建页面组件并添加路由

## 📄 许可证

MIT License

## 📮 联系方式

如有问题或建议，欢迎通过 [Issue](https://github.com/ShanNanBean/Aetheris/issues) 反馈。

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/ShanNanBean">ShanNan</a>
</div>
