# Makefile for Horse 发生 Server
# 使用: make <command>

.PHONY: help install build start dev stop restart logs clean deploy docker-up docker-down

# 默认目标
help:
	@echo "Horse 发生 - 可用命令:"
	@echo ""
	@echo "  make install      - 安装所有依赖"
	@echo "  make build        - 构建前端"
	@echo "  make start        - 启动服务器"
	@echo "  make dev          - 开发模式启动"
	@echo "  make stop         - 停止服务器"
	@echo "  make restart      - 重启服务器"
	@echo "  make logs         - 查看日志"
	@echo "  make clean        - 清理构建文件"
	@echo "  make deploy       - 完整部署"
	@echo "  make docker-up    - Docker 启动"
	@echo "  make docker-down  - Docker 停止"
	@echo ""

# 安装依赖
install:
	@echo "📦 安装服务器依赖..."
	cd server && npm install
	@echo "📦 安装前端依赖..."
	npm install
	@echo "✅ 依赖安装完成"

# 构建前端
build:
	@echo "🔨 构建前端..."
	npm run build
	@echo "✅ 构建完成"

# 启动服务器（PM2）
start:
	@echo "🚀 启动服务器..."
	cd server && pm2 start ecosystem.config.json
	@echo "✅ 服务器已启动"

# 开发模式
dev:
	@echo "🔧 开发模式启动..."
	cd server && npm run dev

# 停止服务器
stop:
	@echo "🛑 停止服务器..."
	cd server && pm2 stop horse-app
	@echo "✅ 服务器已停止"

# 重启服务器
restart:
	@echo "🔄 重启服务器..."
	cd server && pm2 restart horse-app
	@echo "✅ 服务器已重启"

# 查看日志
logs:
	cd server && pm2 logs horse-app

# 清理构建文件
clean:
	@echo "🧹 清理构建文件..."
	rm -rf dist
	rm -rf server/node_modules
	rm -rf server/logs/*.log
	@echo "✅ 清理完成"

# 完整部署
deploy: install build
	@echo "🚀 部署应用..."
	cd server && pm2 delete horse-app || true
	cd server && pm2 start ecosystem.config.json
	cd server && pm2 save
	@echo "✅ 部署完成"

# Docker 启动
docker-up:
	@echo "🐳 Docker 启动..."
	docker-compose up -d
	@echo "✅ Docker 已启动"

# Docker 停止
docker-down:
	@echo "🐳 Docker 停止..."
	docker-compose down
	@echo "✅ Docker 已停止"

# 健康检查
health:
	@echo "💚 健康检查..."
	@curl -f http://localhost:3000/health || echo "❌ 服务器未响应"

# 查看状态
status:
	@echo "📊 服务器状态:"
	cd server && pm2 status
