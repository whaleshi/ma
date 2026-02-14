#!/bin/bash

# Horse 发生 - 更新脚本
# 用法: ./update.sh

set -e

echo "🔄 开始更新 Horse 发生..."
echo ""

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "❌ 未安装 Git"
    exit 1
fi

# 备份当前版本
echo "📦 备份当前版本..."
./backup.sh

# 停止服务器
echo "🛑 停止服务器..."
pm2 stop horse-app 2>/dev/null || true

# 保存当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"

# 拉取最新代码
echo "📥 拉取最新代码..."
git fetch origin
git pull origin $CURRENT_BRANCH

# 检查是否有更新
if [ $? -ne 0 ]; then
    echo "❌ 拉取代码失败"
    echo "🔄 恢复服务器..."
    pm2 start ecosystem.config.json
    exit 1
fi

# 安装/更新依赖
echo "📦 更新依赖..."
cd ..
npm install

cd server
npm install --production

# 构建前端
echo "🔨 构建前端..."
cd ..
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    echo "🔄 恢复服务器..."
    cd server
    pm2 start ecosystem.config.json
    exit 1
fi

# 启动服务器
echo "🚀 启动服务器..."
cd server
pm2 restart horse-app || pm2 start ecosystem.config.json

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 3

# 健康检查
echo "💚 健康检查..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo ""
    echo "✅ 更新成功！"
    echo ""
    echo "📊 查看状态: pm2 status"
    echo "📝 查看日志: pm2 logs horse-app"
    echo ""
else
    echo ""
    echo "⚠️  更新完成，但健康检查失败"
    echo "请检查日志: pm2 logs horse-app"
    echo ""
fi

# 显示版本信息
echo "📌 当前版本:"
git log -1 --pretty=format:"  提交: %h%n  作者: %an%n  日期: %ad%n  信息: %s" --date=format:'%Y-%m-%d %H:%M:%S'
echo ""
