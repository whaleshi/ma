#!/bin/bash

# Horse 发生 - 备份脚本
# 用法: ./backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="horse-backup-${TIMESTAMP}"

echo "🗄️  开始备份..."

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 创建临时目录
TEMP_DIR="${BACKUP_DIR}/${BACKUP_NAME}"
mkdir -p ${TEMP_DIR}

# 备份前端构建产物
echo "📦 备份前端构建产物..."
if [ -d "../dist" ]; then
    cp -r ../dist ${TEMP_DIR}/
else
    echo "⚠️  dist 目录不存在，跳过"
fi

# 备份静态资源
echo "📦 备份静态资源..."
if [ -d "../public" ]; then
    cp -r ../public ${TEMP_DIR}/
else
    echo "⚠️  public 目录不存在，跳过"
fi

# 备份服务器配置
echo "📦 备份服务器配置..."
cp package.json ${TEMP_DIR}/
cp server.js ${TEMP_DIR}/
cp og-handler.js ${TEMP_DIR}/
cp ecosystem.config.json ${TEMP_DIR}/

# 备份环境变量（如果存在）
if [ -f ".env" ]; then
    cp .env ${TEMP_DIR}/
fi

# 备份日志（最近7天）
echo "📦 备份日志..."
if [ -d "logs" ]; then
    mkdir -p ${TEMP_DIR}/logs
    find logs -name "*.log" -mtime -7 -exec cp {} ${TEMP_DIR}/logs/ \;
fi

# 压缩备份
echo "🗜️  压缩备份..."
cd ${BACKUP_DIR}
tar -czf ${BACKUP_NAME}.tar.gz ${BACKUP_NAME}
rm -rf ${BACKUP_NAME}

# 删除30天前的备份
echo "🧹 清理旧备份..."
find . -name "horse-backup-*.tar.gz" -mtime +30 -delete

BACKUP_SIZE=$(du -h ${BACKUP_NAME}.tar.gz | cut -f1)

echo ""
echo "✅ 备份完成！"
echo "📁 备份文件: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "📊 备份大小: ${BACKUP_SIZE}"
echo ""
echo "恢复备份:"
echo "  tar -xzf ${BACKUP_NAME}.tar.gz"
echo ""
