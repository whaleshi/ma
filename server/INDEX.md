# Horse 发生 - 服务器文件索引

## 📁 文件结构总览

```
server/
├── 📄 核心文件
│   ├── server.js              # 主服务器文件
│   ├── og-handler.js          # OG 图片处理
│   └── package.json           # 依赖配置
│
├── ⚙️ 配置文件
│   ├── .env.example           # 环境变量示例
│   ├── .gitignore            # Git 忽略文件
│   ├── ecosystem.config.json  # PM2 配置
│   ├── nginx.conf            # Nginx 配置
│   ├── Dockerfile            # Docker 镜像配置
│   ├── docker-compose.yml    # Docker Compose 配置
│   ├── horse-app.service     # Systemd 服务配置
│   ├── crontab.example       # Cron 任务示例
│   └── Makefile              # Make 命令配置
│
├── 🚀 部署脚本
│   ├── deploy.sh             # Linux/Mac 部署脚本
│   ├── deploy.bat            # Windows 部署脚本
│   ├── update.sh             # 更新脚本
│   ├── backup.sh             # 备份脚本
│   └── restore.sh            # 恢复脚本
│
├── 🔧 维护脚本
│   ├── monitor.sh            # 监控脚本
│   ├── cleanup-logs.sh       # 日志清理
│   ├── performance-test.sh   # 性能测试
│   └── ssl-renew.sh          # SSL 续期
│
└── 📚 文档
    ├── README.md             # 完整文档
    ├── QUICKSTART.md         # 快速开始
    ├── DEPLOYMENT-CHECKLIST.md # 部署清单
    ├── TROUBLESHOOTING.md    # 故障排查
    ├── SECURITY.md           # 安全指南
    ├── API.md                # API 文档
    └── INDEX.md              # 本文件
```

---

## 🎯 快速导航

### 新手入门

1. **首次部署**
   - 阅读: [QUICKSTART.md](QUICKSTART.md)
   - 使用: `deploy.sh` 或 `deploy.bat`

2. **配置环境**
   - 复制: `.env.example` → `.env`
   - 编辑环境变量

3. **启动服务**
   ```bash
   npm start
   # 或
   pm2 start ecosystem.config.json
   ```

### 日常运维

- **查看状态**: `pm2 status` 或 `./monitor.sh`
- **查看日志**: `pm2 logs horse-app`
- **重启服务**: `pm2 restart horse-app`
- **更新应用**: `./update.sh`
- **备份数据**: `./backup.sh`

### 问题排查

- **服务器问题**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **安全问题**: [SECURITY.md](SECURITY.md)
- **API 问题**: [API.md](API.md)

---

## 📖 文档说明

### README.md
**用途**: 完整的项目文档
**包含**:
- 项目介绍
- 安装步骤
- 配置说明
- 部署方法
- 常见问题

**适合**: 第一次接触项目的人

---

### QUICKSTART.md
**用途**: 5分钟快速部署指南
**包含**:
- 一键部署命令
- Docker 部署
- 常用命令
- 快速故障排查

**适合**: 需要快速部署的人

---

### DEPLOYMENT-CHECKLIST.md
**用途**: 部署前检查清单
**包含**:
- 环境准备
- 代码准备
- 部署执行
- 功能测试
- 最终验证

**适合**: 生产环境部署

---

### TROUBLESHOOTING.md
**用途**: 故障排查指南
**包含**:
- 常见问题及解决方案
- 调试工具
- 日志分析
- 应急响应

**适合**: 遇到问题时查阅

---

### SECURITY.md
**用途**: 安全最佳实践
**包含**:
- 服务器安全配置
- 应用层安全
- 安全检查清单
- 应急响应

**适合**: 安全加固和审计

---

### API.md
**用途**: API 接口文档
**包含**:
- 端点列表
- 请求参数
- 响应格式
- 使用示例

**适合**: 前端开发和集成

---

## 🛠️ 脚本说明

### 部署脚本

#### deploy.sh / deploy.bat
**功能**: 一键部署应用
**步骤**:
1. 安装依赖
2. 构建前端
3. 启动服务器

**使用**:
```bash
./deploy.sh
```

---

#### update.sh
**功能**: 更新应用到最新版本
**步骤**:
1. 备份当前版本
2. 拉取最新代码
3. 更新依赖
4. 重新构建
5. 重启服务

**使用**:
```bash
./update.sh
```

---

### 维护脚本

#### backup.sh
**功能**: 备份应用数据
**备份内容**:
- 前端构建产物
- 静态资源
- 服务器配置
- 日志文件

**使用**:
```bash
./backup.sh
```

**输出**: `backups/horse-backup-YYYYMMDD_HHMMSS.tar.gz`

---

#### restore.sh
**功能**: 从备份恢复
**使用**:
```bash
./restore.sh backups/horse-backup-20240115_120000.tar.gz
```

---

#### monitor.sh
**功能**: 监控服务器状态
**检查项**:
- 服务器运行状态
- 健康检查
- 端口监听
- 内存/CPU 使用
- 磁盘空间
- 日志文件
- 最近错误

**使用**:
```bash
./monitor.sh
```

---

#### cleanup-logs.sh
**功能**: 清理旧日志
**操作**:
- 归档旧日志
- 压缩日志文件
- 删除超期归档

**使用**:
```bash
./cleanup-logs.sh 7  # 清理 7 天前的日志
```

---

#### performance-test.sh
**功能**: 性能测试
**测试项**:
- 响应时间
- 并发性能
- 资源使用

**使用**:
```bash
./performance-test.sh
```

---

#### ssl-renew.sh
**功能**: SSL 证书续期
**操作**:
- 检查证书有效期
- 自动续期
- 重启服务

**使用**:
```bash
./ssl-renew.sh
```

---

## ⚙️ 配置文件说明

### .env
**用途**: 环境变量配置
**重要变量**:
- `PORT`: 服务器端口
- `NODE_ENV`: 运行环境
- `DOMAIN`: 域名

**注意**: 不要提交到 Git！

---

### ecosystem.config.json
**用途**: PM2 进程管理配置
**配置项**:
- 实例数量
- 内存限制
- 日志路径
- 自动重启

---

### nginx.conf
**用途**: Nginx 反向代理配置
**功能**:
- HTTPS 重定向
- SSL 配置
- 静态资源缓存
- API 代理

---

### Dockerfile
**用途**: Docker 镜像构建
**基础镜像**: node:18-alpine
**暴露端口**: 3000

---

### docker-compose.yml
**用途**: Docker Compose 编排
**服务**:
- horse-app: 应用服务
- nginx: 反向代理

---

## 🎓 学习路径

### 初学者

1. 阅读 [QUICKSTART.md](QUICKSTART.md)
2. 运行 `deploy.sh`
3. 访问 http://localhost:3000
4. 查看 [API.md](API.md) 了解接口

### 中级用户

1. 阅读 [README.md](README.md)
2. 配置 Nginx 和 SSL
3. 设置 Cron 任务
4. 配置监控告警

### 高级用户

1. 阅读 [SECURITY.md](SECURITY.md)
2. 优化性能配置
3. 实施安全加固
4. 自定义部署流程

---

## 🔗 外部资源

- **Node.js 文档**: https://nodejs.org/docs
- **Express 文档**: https://expressjs.com
- **PM2 文档**: https://pm2.keymetrics.io
- **Nginx 文档**: https://nginx.org/en/docs
- **Docker 文档**: https://docs.docker.com

---

## 📞 获取帮助

### 文档内查找

1. 使用 `grep` 搜索关键词:
   ```bash
   grep -r "关键词" *.md
   ```

2. 查看目录:
   ```bash
   ls -la
   ```

### 常见问题

- **部署失败**: 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 第1节
- **端口占用**: 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 第10节
- **SSL 问题**: 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 第7节

### 联系支持

- **GitHub Issues**: https://github.com/yourusername/horse-app/issues
- **邮箱**: support@goodhorse.fun

---

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

---

**最后更新**: 2024-01-15
**文档版本**: 1.0.0
