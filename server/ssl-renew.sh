#!/bin/bash

# Horse 发生 - SSL 证书自动续期脚本
# 用法: ./ssl-renew.sh

set -e

echo "🔒 SSL 证书续期检查..."
echo ""

# 检查 certbot
if ! command -v certbot &> /dev/null; then
    echo "❌ 未安装 certbot"
    echo "安装命令: sudo apt-get install certbot"
    exit 1
fi

# 域名配置
DOMAIN="goodhorse.fun"
EMAIL="admin@goodhorse.fun"

echo "📋 域名: $DOMAIN"
echo "📧 邮箱: $EMAIL"
echo ""

# 检查证书状态
echo "🔍 检查证书状态..."
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

    echo "  到期日期: $EXPIRY"
    echo "  剩余天数: $DAYS_LEFT 天"

    if [ $DAYS_LEFT -lt 30 ]; then
        echo "  ⚠️  证书即将过期，开始续期..."
    else
        echo "  ✅ 证书有效期充足"
        exit 0
    fi
else
    echo "  ℹ️  未找到现有证书，将申请新证书"
fi

echo ""

# 停止 Nginx（如果运行）
echo "🛑 停止 Nginx..."
sudo systemctl stop nginx 2>/dev/null || true

# 续期或申请证书
echo "🔄 续期/申请证书..."
sudo certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ 证书续期成功"

    # 复制证书到项目目录
    echo "📦 复制证书..."
    sudo mkdir -p ssl
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
    sudo chmod 644 ssl/*.pem

    # 重启 Nginx
    echo "🔄 重启 Nginx..."
    sudo systemctl start nginx

    # 重启应用
    echo "🔄 重启应用..."
    pm2 restart horse-app

    echo ""
    echo "✅ SSL 证书续期完成！"
else
    echo "❌ 证书续期失败"

    # 恢复 Nginx
    sudo systemctl start nginx
    exit 1
fi

echo ""
echo "📅 下次检查: 30 天后"
echo "💡 建议设置 cron 任务自动续期:"
echo "   0 0 1 * * /path/to/ssl-renew.sh"
