# Horse 发生 - 安全最佳实践

## 🔒 服务器安全配置

### 1. 防火墙配置

```bash
# 安装 UFW
sudo apt-get install ufw

# 默认策略
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

---

### 2. SSH 安全加固

编辑 `/etc/ssh/sshd_config`:

```bash
# 禁用 root 登录
PermitRootLogin no

# 禁用密码登录（使用密钥）
PasswordAuthentication no
PubkeyAuthentication yes

# 更改默认端口（可选）
Port 2222

# 限制登录尝试
MaxAuthTries 3

# 重启 SSH
sudo systemctl restart sshd
```

---

### 3. 环境变量安全

**不要在代码中硬编码敏感信息！**

```bash
# .env 文件权限
chmod 600 .env

# 确保 .env 在 .gitignore 中
echo ".env" >> .gitignore

# 使用环境变量
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=your-secret-key-here
API_KEY=your-api-key-here
```

---

### 4. Node.js 安全

**安装安全更新：**

```bash
# 检查过时的包
npm outdated

# 更新包
npm update

# 审计安全漏洞
npm audit

# 自动修复
npm audit fix
```

**使用安全中间件：**

```javascript
// server.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 安全头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制 100 次请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', limiter);

// 防止 XSS
const xss = require('xss-clean');
app.use(xss());

// 防止 NoSQL 注入
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

---

### 5. HTTPS 强制

**Nginx 配置：**

```nginx
# 重定向 HTTP 到 HTTPS
server {
    listen 80;
    server_name goodhorse.fun;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name goodhorse.fun;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/goodhorse.fun/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/goodhorse.fun/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

---

### 6. 日志安全

**不要记录敏感信息：**

```javascript
// ❌ 错误示例
console.log('User password:', password);
console.log('API key:', apiKey);

// ✅ 正确示例
console.log('User login attempt:', { userId, timestamp });
console.log('API request:', { endpoint, method, statusCode });
```

**日志文件权限：**

```bash
# 限制日志文件访问
chmod 640 logs/*.log
chown www-data:www-data logs/*.log
```

---

### 7. 依赖安全

**package.json 安全配置：**

```json
{
  "scripts": {
    "audit": "npm audit",
    "audit-fix": "npm audit fix",
    "check-updates": "npm outdated"
  }
}
```

**定期审计：**

```bash
# 每周运行
npm audit

# 使用 Snyk
npm install -g snyk
snyk test
snyk monitor
```

---

### 8. 备份安全

**加密备份：**

```bash
# 使用 GPG 加密备份
gpg --symmetric --cipher-algo AES256 backup.tar.gz

# 解密
gpg --decrypt backup.tar.gz.gpg > backup.tar.gz
```

**异地备份：**

```bash
# 上传到 S3
aws s3 cp backup.tar.gz s3://your-bucket/backups/

# 或使用 rsync
rsync -avz backup.tar.gz user@remote-server:/backups/
```

---

### 9. 进程隔离

**使用非 root 用户运行：**

```bash
# 创建专用用户
sudo useradd -r -s /bin/false horse-app

# 更改文件所有权
sudo chown -R horse-app:horse-app /var/www/horse-app

# PM2 以特定用户运行
sudo -u horse-app pm2 start ecosystem.config.json
```

---

### 10. 监控和告警

**设置入侵检测：**

```bash
# 安装 fail2ban
sudo apt-get install fail2ban

# 配置 /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600
```

**日志监控：**

```bash
# 监控可疑活动
grep "Failed password" /var/log/auth.log
grep "error" /var/log/nginx/error.log
```

---

## 🛡️ 应用层安全

### 输入验证

```javascript
// 使用验证库
const { body, validationResult } = require('express-validator');

app.post('/api/data', [
  body('email').isEmail().normalizeEmail(),
  body('amount').isNumeric().toFloat(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // 处理请求
});
```

### CSRF 保护

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

### SQL 注入防护

```javascript
// ❌ 错误示例
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 正确示例（使用参数化查询）
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

---

## 📋 安全检查清单

### 部署前检查

- [ ] 所有依赖已更新到最新版本
- [ ] 运行 `npm audit` 无高危漏洞
- [ ] `.env` 文件不在版本控制中
- [ ] 生产环境使用 HTTPS
- [ ] 配置了防火墙规则
- [ ] SSH 使用密钥认证
- [ ] 禁用了不必要的服务
- [ ] 设置了日志轮转
- [ ] 配置了自动备份
- [ ] 设置了监控告警

### 定期检查（每月）

- [ ] 更新系统包：`sudo apt-get update && sudo apt-get upgrade`
- [ ] 更新 Node.js 依赖：`npm update`
- [ ] 审计安全漏洞：`npm audit`
- [ ] 检查 SSL 证书有效期
- [ ] 审查访问日志
- [ ] 测试备份恢复
- [ ] 检查磁盘空间
- [ ] 审查用户权限

---

## 🚨 应急响应

### 发现安全问题时

1. **立即行动**
   ```bash
   # 停止服务
   pm2 stop horse-app

   # 断开网络（如果严重）
   sudo ufw deny 80/tcp
   sudo ufw deny 443/tcp
   ```

2. **调查问题**
   ```bash
   # 检查日志
   pm2 logs horse-app --lines 1000
   tail -1000 /var/log/nginx/access.log

   # 检查进程
   ps aux | grep node

   # 检查网络连接
   netstat -tulpn
   ```

3. **修复问题**
   - 更新受影响的包
   - 修补漏洞
   - 更改密钥/密码

4. **恢复服务**
   ```bash
   # 重新部署
   ./deploy.sh

   # 恢复网络
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

5. **事后分析**
   - 记录事件
   - 分析原因
   - 改进流程

---

## 📚 安全资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)

---

**记住：安全是一个持续的过程，不是一次性的任务！**
