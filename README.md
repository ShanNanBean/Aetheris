# Aetheris - 个人工具集成管理平台

<div align="center">
  <h3>🚀 智能工具集成管理平台</h3>
  <p>将零散的小工具集中管理，支持 AI 智能对话辅助</p>
</div>

---

## 📋 项目简介

Aetheris 是一个现代化的个人工具集成管理平台，旨在解决日常工作中零散小工具分散、难以管理的问题。

### ✨ 核心特性

- 🤖 **AI 智能助手** - 提供智能对话和工具导航能力
- 🎯 **简约设计** - 清晰的界面布局，优秀的用户体验
- 🔧 **工具集成** - 文本处理、数据处理、API 调用等多类工具
- 🌲 **树状导航** - 分类清晰，快速查找所需工具
- ⚡ **高性能** - 基于缓存的快速响应
- 🔌 **易扩展** - 插件化架构，轻松添加新工具

## 🏗️ 技术栈

### 前端
- **框架**: React 18 + Vite
- **UI 组件**: Ant Design 5
- **路由**: React Router 6
- **状态管理**: Zustand
- **HTTP 客户端**: Axios

### 后端
- **框架**: FastAPI
- **数据验证**: Pydantic
- **缓存**: 内存缓存（可扩展 Redis）
- **AI 集成**: LangChain / LangGraph（可选）

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

### Windows 一键启动

1. 克隆项目到本地
```bash
git clone <repository-url>
cd Aetheris
```

2. 双击运行 `start.bat` 脚本

脚本会自动：
- 检查环境
- 创建 Python 虚拟环境
- 安装后端依赖
- 安装前端依赖
- 启动后端服务（端口 8000）
- 启动前端服务（端口 3000）

### 手动启动

#### 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
python -m app.main
```

#### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📱 访问地址

启动成功后，可以通过以下地址访问：

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/api/system/health

## 📁 项目结构

```
Aetheris/
├── backend/                 # 后端项目
│   ├── app/
│   │   ├── api/            # API 路由
│   │   │   └── endpoints/  # 具体端点
│   │   ├── core/           # 核心模块（配置、缓存、响应）
│   │   ├── services/       # 业务服务
│   │   ├── tools/          # 工具实现
│   │   └── main.py         # 应用入口
│   ├── requirements.txt    # Python 依赖
│   └── .env.example        # 环境配置示例
│
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   └── layout/     # 布局组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── App.jsx         # 应用根组件
│   │   └── main.jsx        # 应用入口
│   ├── package.json        # npm 依赖
│   └── vite.config.js      # Vite 配置
│
├── start.bat               # Windows 启动脚本
└── README.md               # 项目说明文档
```

## 🔧 配置说明

### 后端配置

复制 `backend/.env.example` 为 `backend/.env` 并修改配置：

```env
# 服务配置
HOST=127.0.0.1
PORT=8000
DEBUG=True

# AI 配置（可选）
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-3.5-turbo
```

### 前端配置

前端代理配置在 `frontend/vite.config.js` 中，默认代理到 `http://127.0.0.1:8000`

## 🛠️ 功能模块

### 已实现功能

- ✅ 基础框架搭建
- ✅ 系统布局（Header、Sider、Footer）
- ✅ 树状导航系统
- ✅ AI 对话界面
- ✅ 缓存服务
- ✅ API 网关
- ✅ 工具注册机制

### 已实现工具

#### 📝 文本处理
- **JSON格式化** - 格式化、压缩、验证JSON数据
  - 支持自定义缩进（2/4空格）
  - 键名排序功能
  - 一键复制结果
  - 显示统计信息

#### 📏 数据处理
- **单位转换** - 长度、重量、温度等单位转换
  - 长度：米、千米、英里、英尺等
  - 重量：千克、克、磅、吾司等
  - 温度：摄氏度、华氏度、开尔文

- **进制转换** - 2/8/10/16进制相互转换
  - 支持二进制、八进制、十进制、十六进制
  - 显示转换公式
  - 输入格式验证

## 📝 开发指南

### 添加新工具

1. 在后端 `app/tools/` 目录下创建工具模块
2. 在 `app/services/tool_registry.py` 中注册工具
3. 在前端 `src/pages/` 目录下创建工具页面组件
4. 在 `App.jsx` 中添加路由

详细开发文档请参考设计文档。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📮 联系方式

如有问题或建议，欢迎通过 Issue 联系。

---

<div align="center">
  Made with ❤️ by Aetheris Team
</div>
