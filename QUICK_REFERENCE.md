# Aetheris 快速参考指南

## 🚀 快速启动

### 方式一：一键启动（推荐）
```bash
# Windows
双击 start.bat
```

### 方式二：手动启动
```bash
# 终端1 - 后端
cd backend
pip install -r requirements.txt
python -m app.main

# 终端2 - 前端
cd frontend
npm install
npm run dev
```

## 📍 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000 | 主应用界面 |
| 后端API | http://localhost:8000 | API服务 |
| API文档 | http://localhost:8000/docs | Swagger文档 |
| 健康检查 | http://localhost:8000/api/system/health | 系统状态 |

## 📁 项目结构

```
Aetheris/
├── backend/                    # 后端（FastAPI）
│   ├── app/
│   │   ├── api/               # API路由
│   │   │   └── endpoints/     # 具体端点
│   │   │       ├── system.py  # 系统接口
│   │   │       ├── ai.py      # AI接口
│   │   │       └── tools.py   # 工具接口
│   │   ├── core/              # 核心模块
│   │   │   ├── config.py      # 配置管理
│   │   │   ├── cache.py       # 缓存服务
│   │   │   └── response.py    # 响应模型
│   │   ├── services/          # 业务服务
│   │   │   └── tool_registry.py # 工具注册
│   │   └── main.py            # 应用入口
│   └── requirements.txt       # Python依赖
│
├── frontend/                   # 前端（React）
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   └── layout/        # 布局组件
│   │   ├── pages/             # 页面
│   │   │   └── AIChat.jsx     # AI对话
│   │   ├── services/          # API服务
│   │   ├── App.jsx            # 根组件
│   │   └── main.jsx           # 入口
│   ├── package.json           # npm配置
│   └── vite.config.js         # Vite配置
│
├── start.bat                   # 启动脚本
├── README.md                   # 项目文档
└── PROJECT_SUMMARY.md          # 实施总结
```

## 🔧 配置说明

### 后端配置
创建 `backend/.env`：
```env
HOST=127.0.0.1
PORT=8000
DEBUG=True
OPENAI_API_KEY=your_key_here  # 可选
```

### 前端配置
`frontend/vite.config.js` 已配置代理到后端

## 📡 API接口速查

### 系统接口
- `GET /api/system/health` - 健康检查
- `GET /api/system/navigation` - 导航树

### AI接口
- `POST /api/ai/chat` - 对话
- `GET /api/ai/history/{session_id}` - 获取历史
- `DELETE /api/ai/history/{session_id}` - 清除历史

### 工具接口
- `GET /api/tools/` - 工具列表
- `GET /api/tools/{tool_id}` - 工具详情
- `POST /api/tools/{tool_id}/execute` - 执行工具

## 🛠️ 常用命令

### 后端
```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python -m app.main

# 生产环境启动
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 前端
```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🐛 问题排查

### 后端启动失败
1. 检查Python版本：`python --version` (需要3.8+)
2. 检查依赖：`pip list`
3. 查看端口占用：`netstat -ano | findstr 8000`

### 前端启动失败
1. 检查Node版本：`node --version` (需要16+)
2. 删除node_modules重新安装：`rm -rf node_modules && npm install`
3. 检查端口占用：`netstat -ano | findstr 3000`

### API调用失败
1. 确认后端服务运行正常
2. 检查浏览器控制台网络请求
3. 查看后端日志输出

## 📚 开发资源

### 文档
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 文档](https://react.dev/)
- [Ant Design 文档](https://ant.design/)
- [Vite 文档](https://vitejs.dev/)

### 项目文档
- `README.md` - 项目说明
- `PROJECT_SUMMARY.md` - 实施总结
- `DEVLOG.md` - 开发日志
- `http://localhost:8000/docs` - API文档

## 🎯 下一步

1. 配置AI服务（可选）
2. 实现具体工具功能
3. 优化用户体验
4. 添加更多特性

## 💡 提示

- 修改代码后自动热重载
- API文档支持在线测试
- 使用 `Ctrl+C` 停止服务
- 查看日志定位问题

---

**需要帮助？** 查看 `README.md` 或提交 Issue
