@echo off
REM Horse 发生 - Windows 部署脚本
REM 用法: deploy.bat

echo 🚀 开始部署 Horse 发生...

REM 1. 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未安装 Node.js，请先安装 Node.js ^>= 16
    exit /b 1
)

echo ✅ Node.js 已安装

REM 2. 安装服务器依赖
echo 📦 安装服务器依赖...
cd server
call npm install --production
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 服务器依赖安装失败
    exit /b 1
)

REM 3. 返回根目录构建前端
echo 🔨 构建前端...
cd ..
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端依赖安装失败
    exit /b 1
)

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端构建失败
    exit /b 1
)

REM 4. 检查构建产物
if not exist "dist" (
    echo ❌ 前端构建失败，dist 目录不存在
    exit /b 1
)

echo ✅ 前端构建完成

REM 5. 创建日志目录
if not exist "server\logs" mkdir server\logs

REM 6. 检查是否安装 PM2
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未安装 PM2，使用 npm start 启动
    cd server
    call npm start
) else (
    echo 🚀 使用 PM2 启动应用...
    cd server
    call pm2 delete horse-app 2>nul
    call pm2 start ecosystem.config.json
    call pm2 save

    echo.
    echo ✅ 部署完成！
    echo.
    echo 📊 查看状态: pm2 status
    echo 📝 查看日志: pm2 logs horse-app
    echo 🔄 重启应用: pm2 restart horse-app
    echo 🛑 停止应用: pm2 stop horse-app
    echo.
    echo 🌐 访问地址: http://localhost:3000
)
