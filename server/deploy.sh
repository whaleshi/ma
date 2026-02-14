#!/bin/bash

# Horse 发生 - 部署脚本
# 用法: ./deploy.sh

set -e

echo "🚀 开始部署 Horse 发生..."

# 1. 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装 Node.js >= 16"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 2. 安装服务器依赖
echo "📦 安装服务器依赖..."
cd server
npm install --production

# 3. 返回根目录构建前端
echo "🔨 构建前端..."
cd ..
npm install
npm run build

# 4. 检查构建产物
if [ ! -d "dist" ]; then
    echo "❌ 前端构建失败，dist 目录不存在"
    exit 1
fi

echo "✅ 前端构建完成"

# 5. 创建日志目录
mkdir -p server/logs

# 6. 检查是否安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  未安装 PM2，使用 npm start 启动"
    cd server
    npm start
else
    echo "🚀 使用 PM2 启动应用..."
    cd server
    pm2 delete horse-app 2>/dev/null || true
    pm2 start ecosystem.config.json
    pm2 save

    echo ""
    echo "✅ 部署完成！"
    echo ""
    echo "📊 查看状态: pm2 status"
    echo "📝 查看日志: pm2 logs horse-app"
    echo "🔄 重启应用: pm2 restart horse-app"
    echo "🛑 停止应用: pm2 stop horse-app"
    echo ""
    echo "🌐 访问地址: http://localhost:3000"
fi
