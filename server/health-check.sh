#!/bin/bash

# Horse 发生 - 健康检查脚本（用于外部监控）
# 用法: ./health-check.sh

set -e

# 配置
BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMEOUT=5
MAX_RETRIES=3

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# 检查函数
check_endpoint() {
    local endpoint=$1
    local expected_code=$2
    local retry=0

    while [ $retry -lt $MAX_RETRIES ]; do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint" 2>/dev/null)

        if [ "$HTTP_CODE" = "$expected_code" ]; then
            echo -e "${GREEN}✓${NC} $endpoint - OK (HTTP $HTTP_CODE)"
            return 0
        fi

        retry=$((retry + 1))
        if [ $retry -lt $MAX_RETRIES ]; then
            sleep 1
        fi
    done

    echo -e "${RED}✗${NC} $endpoint - FAILED (HTTP $HTTP_CODE, expected $expected_code)"
    return 1
}

# 主检查
echo "Horse 发生 - 健康检查"
echo "目标: $BASE_URL"
echo ""

FAILED=0

# 检查健康端点
check_endpoint "/health" "200" || FAILED=$((FAILED + 1))

# 检查主页
check_endpoint "/" "200" || FAILED=$((FAILED + 1))

# 检查 API
check_endpoint "/api/og?type=default" "200" || check_endpoint "/api/og?type=default" "302" || FAILED=$((FAILED + 1))

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}所有检查通过${NC}"
    exit 0
else
    echo -e "${RED}$FAILED 个检查失败${NC}"
    exit 1
fi
