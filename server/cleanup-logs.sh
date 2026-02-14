#!/bin/bash

# Horse 发生 - 日志清理脚本
# 用法: ./cleanup-logs.sh [days]
# 默认清理 7 天前的日志

set -e

DAYS=${1:-7}

echo "🧹 清理日志文件..."
echo "保留最近 $DAYS 天的日志"
echo ""

# 确认操作
read -p "是否继续？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 操作已取消"
    exit 1
fi

# 清理 PM2 日志
echo "📝 清理 PM2 日志..."
pm2 flush horse-app 2>/dev/null || true

# 清理应用日志
if [ -d "logs" ]; then
    echo "📝 清理应用日志..."

    # 归档旧日志
    ARCHIVE_DIR="logs/archive"
    mkdir -p $ARCHIVE_DIR

    # 查找并归档旧日志
    find logs -name "*.log" -mtime +$DAYS -type f | while read file; do
        BASENAME=$(basename "$file")
        TIMESTAMP=$(date +"%Y%m%d")

        # 压缩并移动到归档目录
        gzip -c "$file" > "$ARCHIVE_DIR/${BASENAME%.log}_${TIMESTAMP}.log.gz"

        # 删除原文件
        rm "$file"

        echo "  归档: $BASENAME"
    done

    # 清理超过 30 天的归档
    find $ARCHIVE_DIR -name "*.log.gz" -mtime +30 -delete

    # 显示当前日志大小
    TOTAL_SIZE=$(du -sh logs 2>/dev/null | cut -f1)
    echo ""
    echo "📊 当前日志目录大小: $TOTAL_SIZE"
fi

# 清理临时文件
echo "🗑️  清理临时文件..."
find . -name "*.tmp" -delete
find . -name "*.swp" -delete

echo ""
echo "✅ 清理完成！"
echo ""
echo "📁 归档位置: logs/archive/"
echo "📊 查看日志: ls -lh logs/"
