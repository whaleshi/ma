#!/bin/bash

# Horse 发生 - 性能测试脚本
# 用法: ./performance-test.sh

set -e

echo "⚡ Horse 发生 - 性能测试"
echo "================================"
echo ""

# 检查依赖
if ! command -v curl &> /dev/null; then
    echo "❌ 需要安装 curl"
    exit 1
fi

BASE_URL="http://localhost:3000"

# 测试健康检查端点
echo "1️⃣  测试健康检查端点..."
START=$(date +%s%N)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" $BASE_URL/health)
END=$(date +%s%N)

HTTP_CODE=$(echo $RESPONSE | cut -d'|' -f1)
TIME_TOTAL=$(echo $RESPONSE | cut -d'|' -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ 状态码: $HTTP_CODE"
    echo "  ⏱️  响应时间: ${TIME_TOTAL}s"
else
    echo "  ❌ 状态码: $HTTP_CODE"
fi

echo ""

# 测试主页
echo "2️⃣  测试主页..."
START=$(date +%s%N)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}|%{size_download}" $BASE_URL/)
END=$(date +%s%N)

HTTP_CODE=$(echo $RESPONSE | cut -d'|' -f1)
TIME_TOTAL=$(echo $RESPONSE | cut -d'|' -f2)
SIZE=$(echo $RESPONSE | cut -d'|' -f3)

if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ 状态码: $HTTP_CODE"
    echo "  ⏱️  响应时间: ${TIME_TOTAL}s"
    echo "  📦 响应大小: $(numfmt --to=iec $SIZE)"
else
    echo "  ❌ 状态码: $HTTP_CODE"
fi

echo ""

# 测试 OG 图片
echo "3️⃣  测试 OG 图片..."
START=$(date +%s%N)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" $BASE_URL/api/og?type=default)
END=$(date +%s%N)

HTTP_CODE=$(echo $RESPONSE | cut -d'|' -f1)
TIME_TOTAL=$(echo $RESPONSE | cut -d'|' -f2)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "  ✅ 状态码: $HTTP_CODE"
    echo "  ⏱️  响应时间: ${TIME_TOTAL}s"
else
    echo "  ❌ 状态码: $HTTP_CODE"
fi

echo ""

# 并发测试
echo "4️⃣  并发测试 (10个并发请求)..."
CONCURRENT=10
TOTAL_TIME=0

for i in $(seq 1 $CONCURRENT); do
    TIME=$(curl -s -o /dev/null -w "%{time_total}" $BASE_URL/health)
    TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc)
done

AVG_TIME=$(echo "scale=3; $TOTAL_TIME / $CONCURRENT" | bc)
echo "  ⏱️  平均响应时间: ${AVG_TIME}s"

echo ""

# 内存使用
echo "5️⃣  服务器资源使用..."
if pm2 list | grep -q "horse-app"; then
    MEMORY=$(pm2 jlist | jq -r '.[] | select(.name=="horse-app") | .monit.memory' | numfmt --to=iec)
    CPU=$(pm2 jlist | jq -r '.[] | select(.name=="horse-app") | .monit.cpu')
    echo "  💾 内存: $MEMORY"
    echo "  ⚡ CPU: ${CPU}%"
fi

echo ""
echo "================================"
echo "性能测试完成"
echo ""
echo "💡 建议:"
echo "  - 响应时间 < 100ms: 优秀"
echo "  - 响应时间 < 500ms: 良好"
echo "  - 响应时间 > 1s: 需要优化"
