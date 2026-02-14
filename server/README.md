# Horse 发生 - 普通服务器部署指南

## 📁 项目结构

```
ma/
├── server/              # 服务器代码
│   ├── server.js       # 主服务器文件
│   ├── og-handler.js   # OG 图片处理
│   └── package.json    # 服务器依赖
├── dist/               # 前端构建产物
├── public/             # 静态资源
│   └── og/            # OG 图片
└── src/               # 前端源码
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 构建前端

```bash
cd ..
npm run build
```

### 3. 启动服务器

```bash
cd server
npm start
```

服务器将在 `http://localhost:3000` 启动

### 开发模式（热重载）

```bash
npm run dev
```

## 📡 API 端点

### OG 图片生成

```
GET /api/og?type={type}&amount={amount}
```

**参数：**
- `type`: 卡片类型（career, love, wealth, luck, red, supreme, red_win, supreme_win, default）
- `amount`: 金额（可选）

**示例：**
```
http://localhost:3000/api/og?type=red&amount=0.001
```

### 分享链接

```
GET /api/share?type={type}&amount={amount}
```

**返回：**
```json
{
  "url": "http://localhost:3000?type=red&amount=0.001",
  "ogImage": "http://localhost:3000/api/og?type=red&amount=0.001"
}
```

### 健康检查

```
GET /health
```

## 🌐 部署到生产环境

### 方案1：使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server/server.js --name horse-app

# 查看状态
pm2 status

# 查看日志
pm2 logs horse-app

# 重启
pm2 restart horse-app

# 开机自启
pm2 startup
pm2 save
```

### 方案2：使用 Nginx 反向代理

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API 路由
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 方案3：Docker 部署

**Dockerfile：**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制服务器代码
COPY server/package*.json ./server/
RUN cd server && npm install --production

# 复制构建产物
COPY dist ./dist
COPY public ./public
COPY server ./server

EXPOSE 3000

CMD ["node", "server/server.js"]
```

**构建和运行：**

```bash
docker build -t horse-app .
docker run -p 3000:3000 horse-app
```

## 🔧 环境变量

创建 `.env` 文件：

```env
PORT=3000
NODE_ENV=production
```

在 `server.js` 中使用：

```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

## 📝 注意事项

### 与 Vercel 版本的区别

1. **URL 解析**
   - Vercel: `new URL(req.url)`
   - Express: `req.query.type`

2. **Origin 获取**
   - Vercel: `req.headers.get('x-forwarded-host')`
   - Express: `req.protocol + '://' + req.get('host')`

3. **图片生成**
   - Vercel: 使用 `@vercel/og` 动态生成
   - Express: 重定向到静态图片（更简单）

### 性能优化

1. **启用 Gzip 压缩**

```javascript
const compression = require('compression');
app.use(compression());
```

2. **静态资源缓存**

```javascript
app.use(express.static('dist', {
  maxAge: '1y',
  etag: true
}));
```

3. **添加速率限制**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 限制 100 次请求
});

app.use('/api/', limiter);
```

## 🐛 故障排查

### 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 静态文件 404

确保前端已构建：
```bash
npm run build
```

检查 `dist` 目录是否存在。

### OG 图片不显示

确保 `public/og/` 目录下有对应的图片文件。

## 📞 支持

如有问题，请检查：
1. Node.js 版本 >= 16
2. 所有依赖已安装
3. 前端已构建
4. 端口未被占用

---

**部署完成后访问：**
- 主页: `http://your-domain.com`
- API: `http://your-domain.com/api/og?type=default`
- 健康检查: `http://your-domain.com/health`
