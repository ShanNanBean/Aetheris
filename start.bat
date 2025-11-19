@echo off
chcp 65001 >nul
echo ========================================
echo    Aetheris 启动脚本
echo    个人工具集成管理平台
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 16+
    pause
    exit /b 1
)

echo [1/4] 检查环境...
echo ✓ Python 已安装
echo ✓ Node.js 已安装
echo.

echo [2/4] 安装后端依赖...
cd backend
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
echo ✓ 后端依赖安装完成
echo.

echo [3/4] 安装前端依赖...
cd ..\frontend
if not exist "node_modules" (
    echo 安装前端依赖，请稍候...
    call npm install --registry=https://registry.npmmirror.com
)
echo ✓ 前端依赖安装完成
echo.

echo [4/4] 启动服务...
echo.
echo ========================================
echo   服务启动中...
echo   后端地址: http://127.0.0.1:8000
echo   前端地址: http://127.0.0.1:3000
echo   API文档: http://127.0.0.1:8000/docs
echo ========================================
echo.

REM 启动后端服务（后台运行）
cd ..\backend
start "Aetheris-Backend" cmd /k "venv\Scripts\activate && python -m app.main"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端服务
cd ..\frontend
start "Aetheris-Frontend" cmd /k "npm run dev"

echo.
echo ✓ 服务启动成功！
echo.
echo 按 Ctrl+C 可在相应窗口停止服务
pause
