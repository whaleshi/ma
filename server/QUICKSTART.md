# Horse 发生 - 快速开始指南

## 🚀 5分钟快速部署

### 方法1：一键部署（推荐）

**Linux/Mac:**
```bash
cd server
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```bash
cd server
deploy.bat
```

### 方法2：手动部署

```bash
# 1. 安装依赖
cd server
npm install

# 2. 构建前端
cd ..
npm run build

# 3. 启动服务器
cd server
npm start
```

访问: http://localhost:3000

---

## 📦 Docker 部署（最简单）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

---

## 🔧 常用命令

### PM2 管理

```bash
pm2 start ecosystem.config.json  # 启动
pm2 status                        # 状态
pm2 logs horse-app               # 日志
pm2 restart horse-app            # 重启
pm2 stop horse-app               # 停止
pm2 delete horse-app             # 删除
```

### Docker 管理

```bash
docker-compose up -d             # 启动
docker-compose down              # 停止
docker-compose restart           # 重启
docker-compose logs -f           # 查看日志
docker-compose ps                # 查看状态
```

---

## 🌐 生产环境配置

### 1. 配置域名

编辑 `nginx.conf`，替换域名：
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 2. 配置 SSL 证书

**使用 Let's Encrypt（免费）:**

```bash
# 安装 certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 证书路径
/etc/letsencrypt/live/yourdomain.com/fullchain.pem
/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

更新 `nginx.conf` 中的证书路径。

### 3. 配置环境变量

复制并编辑 `.env` 文件：
```bash
cp .env.example .env
nano .env
```

---

## 📊 监控和日志

### 查看日志

**PM2:**
```bash
pm2 logs horse-app
pm2 logs horse-app --lines 100
```

**Docker:**
```bash
docker-compose logs -f horse-app
docker-compose logs --tail=100 horse-app
```

**直接查看文件:**
```bash
tail -f server/logs/out.log
tail -f server/logs/err.log
```

---

## 🔄 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新部署
./deploy.sh

# 或使用 PM2
pm2 restart horse-app

# 或使用 Docker
docker-compose down
docker-compose up -d --build
```

---

## 🐛 常见问题

### 端口被占用
```bash
# 查找进程
lsof -i :3000
# 或
netstat -ano | findstr :3000

# 修改端口
# 编辑 .env 文件，设置 PORT=3001
```

### 前端 404
```bash
# 确保已构建前端
npm run build

# 检查 dist 目录
ls -la dist/
```

### API 不工作
```bash
# 检查服务器状态
pm2 status

# 查看错误日志
pm2 logs horse-app --err

# 测试健康检查
curl http://localhost:3000/health
```

---

## 📞 技术支持

- 查看完整文档: `README.md`
- 检查日志: `server/logs/`
- 健康检查: `http://localhost:3000/health`

---

**部署成功后访问:**
- 🏠 主页: http://localhost:3000
- 🖼️ OG 图片: http://localhost:3000/api/og?type=default
- 💚 健康检查: http://localhost:3000/health
