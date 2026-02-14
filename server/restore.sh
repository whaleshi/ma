#!/bin/bash

# Horse 发生 - 恢复备份脚本
# 用法: ./restore.sh <backup-file.tar.gz>

set -e

if [ -z "$1" ]; then
    echo "❌ 请指定备份文件"
    echo "用法: ./restore.sh <backup-file.tar.gz>"
    echo ""
    echo "可用备份:"
    ls -lh backups/*.tar.gz 2>/dev/null || echo "  无可用备份"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "🔄 开始恢复备份..."
echo "📁 备份文件: $BACKUP_FILE"
echo ""

# 确认操作
read -p "⚠️  此操作将覆盖现有文件，是否继续？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 操作已取消"
    exit 1
fi

# 停止服务器
echo "🛑 停止服务器..."
pm2 stop horse-app 2>/dev/null || true

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "📦 解压备份到临时目录..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# 获取解压后的目录名
BACKUP_DIR=$(ls -d ${TEMP_DIR}/horse-backup-* | head -n 1)

if [ -z "$BACKUP_DIR" ]; then
    echo "❌ 无法找到备份目录"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 恢复文件
echo "📦 恢复文件..."

# 恢复前端构建产物
if [ -d "${BACKUP_DIR}/dist" ]; then
    echo "  - 恢复 dist/"
    rm -rf ../dist
    cp -r ${BACKUP_DIR}/dist ../
fi

# 恢复静态资源
if [ -d "${BACKUP_DIR}/public" ]; then
    echo "  - 恢复 public/"
    rm -rf ../public
    cp -r ${BACKUP_DIR}/public ../
fi

# 恢复服务器配置
echo "  - 恢复服务器配置"
cp ${BACKUP_DIR}/package.json ./
cp ${BACKUP_DIR}/server.js ./
cp ${BACKUP_DIR}/og-handler.js ./
cp ${BACKUP_DIR}/ecosystem.config.json ./

# 恢复环境变量
if [ -f "${BACKUP_DIR}/.env" ]; then
    echo "  - 恢复 .env"
    cp ${BACKUP_DIR}/.env ./
fi

# 恢复日志
if [ -d "${BACKUP_DIR}/logs" ]; then
    echo "  - 恢复日志"
    mkdir -p logs
    cp -r ${BACKUP_DIR}/logs/* logs/
fi

# 清理临时目录
rm -rf "$TEMP_DIR"

# 重新安装依赖
echo "📦 安装依赖..."
npm install --production

# 启动服务器
echo "🚀 启动服务器..."
pm2 start ecosystem.config.json

echo ""
echo "✅ 恢复完成！"
echo ""
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs horse-app"
echo ""
