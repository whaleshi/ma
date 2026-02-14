#!/bin/bash

# Horse 发生 - 服务器监控脚本
# 用法: ./monitor.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Horse 发生 - 服务器监控"
echo "================================"
echo ""

# 检查服务器状态
echo "📊 服务器状态:"
if pm2 list | grep -q "horse-app"; then
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="horse-app") | .pm2_env.status')
    if [ "$STATUS" = "online" ]; then
        echo -e "${GREEN}✅ 服务器运行中${NC}"
    else
        echo -e "${RED}❌ 服务器已停止${NC}"
    fi
else
    echo -e "${RED}❌ 未找到 horse-app 进程${NC}"
fi

echo ""

# 检查健康端点
echo "💚 健康检查:"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ 健康检查通过 (HTTP $HEALTH_CHECK)${NC}"
else
    echo -e "${RED}❌ 健康检查失败 (HTTP $HEALTH_CHECK)${NC}"
fi

echo ""

# 检查端口
echo "🔌 端口检查:"
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 端口 3000 正在监听${NC}"
    lsof -i :3000 | grep LISTEN
else
    echo -e "${RED}❌ 端口 3000 未监听${NC}"
fi

echo ""

# 内存使用
echo "💾 内存使用:"
if pm2 list | grep -q "horse-app"; then
    MEMORY=$(pm2 jlist | jq -r '.[] | select(.name=="horse-app") | .monit.memory' | numfmt --to=iec)
    echo "  当前内存: $MEMORY"
fi

echo ""

# CPU 使用
echo "⚡ CPU 使用:"
if pm2 list | grep -q "horse-app"; then
    CPU=$(pm2 jlist | jq -r '.[] | select(.name=="horse-app") | .monit.cpu')
    echo "  当前 CPU: ${CPU}%"
fi

echo ""

# 磁盘空间
echo "💿 磁盘空间:"
df -h . | tail -1 | awk '{print "  使用: "$3" / "$2" ("$5")"}'

echo ""

# 日志文件大小
echo "📝 日志文件:"
if [ -d "logs" ]; then
    LOG_SIZE=$(du -sh logs 2>/dev/null | cut -f1)
    echo "  日志目录大小: $LOG_SIZE"

    if [ -f "logs/out.log" ]; then
        OUT_SIZE=$(du -h logs/out.log | cut -f1)
        echo "  out.log: $OUT_SIZE"
    fi

    if [ -f "logs/err.log" ]; then
        ERR_SIZE=$(du -h logs/err.log | cut -f1)
        ERR_LINES=$(wc -l < logs/err.log)
        echo "  err.log: $ERR_SIZE ($ERR_LINES 行)"

        if [ $ERR_LINES -gt 0 ]; then
            echo -e "${YELLOW}  ⚠️  发现错误日志${NC}"
        fi
    fi
fi

echo ""

# 最近的错误
echo "🐛 最近的错误 (最后10条):"
if [ -f "logs/err.log" ]; then
    RECENT_ERRORS=$(tail -10 logs/err.log 2>/dev/null)
    if [ -n "$RECENT_ERRORS" ]; then
        echo "$RECENT_ERRORS" | head -5
        echo "  ..."
    else
        echo -e "${GREEN}  无错误${NC}"
    fi
else
    echo "  无错误日志文件"
fi

echo ""

# 运行时间
echo "⏱️  运行时间:"
if pm2 list | grep -q "horse-app"; then
    UPTIME=$(pm2 jlist | jq -r '.[] | select(.name=="horse-app") | .pm2_env.pm_uptime')
    UPTIME_SECONDS=$(($(date +%s) - $UPTIME / 1000))
    UPTIME_HUMAN=$(date -u -d @${UPTIME_SECONDS} +"%H小时 %M分钟")
    echo "  $UPTIME_HUMAN"
fi

echo ""
echo "================================"
echo "监控完成 - $(date '+%Y-%m-%d %H:%M:%S')"
