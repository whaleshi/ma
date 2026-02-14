# Horse 发生 - 故障排查指南

## 🔍 常见问题及解决方案

### 1. 服务器无法启动

**症状：** `pm2 start` 失败或服务器立即崩溃

**排查步骤：**

```bash
# 查看错误日志
pm2 logs horse-app --err

# 检查端口是否被占用
lsof -i :3000
netstat -ano | findstr :3000

# 检查 Node.js 版本
node -v  # 需要 >= 16

# 检查依赖是否安装
cd server && npm list
```

**解决方案：**

```bash
# 杀死占用端口的进程
kill -9 <PID>

# 重新安装依赖
rm -rf node_modules
npm install

# 使用不同端口
export PORT=3001
npm start
```

---

### 2. 前端页面 404

**症状：** 访问主页返回 404

**排查步骤：**

```bash
# 检查 dist 目录是否存在
ls -la ../dist/

# 检查 index.html 是否存在
ls -la ../dist/index.html
```

**解决方案：**

```bash
# 重新构建前端
cd ..
npm run build

# 检查构建是否成功
ls -la dist/
```

---

### 3. API 返回 500 错误

**症状：** `/api/og` 或其他 API 返回 500

**排查步骤：**

```bash
# 查看实时日志
pm2 logs horse-app

# 测试 API
curl -v http://localhost:3000/api/og?type=default

# 检查环境变量
cat .env
```

**解决方案：**

```bash
# 检查 og-handler.js 是否存在
ls -la og-handler.js

# 检查静态资源
ls -la ../public/og/

# 重启服务器
pm2 restart horse-app
```

---

### 4. 内存泄漏

**症状：** 内存使用持续增长，最终崩溃

**排查步骤：**

```bash
# 监控内存使用
pm2 monit

# 查看内存历史
pm2 describe horse-app
```

**解决方案：**

```bash
# 设置内存限制（ecosystem.config.json）
"max_memory_restart": "500M"

# 定期重启（crontab）
0 4 * * * pm2 restart horse-app

# 启用集群模式
"instances": "max",
"exec_mode": "cluster"
```

---

### 5. 静态资源加载慢

**症状：** 图片、CSS、JS 加载缓慢

**排查步骤：**

```bash
# 测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/og/home.png

# 检查文件大小
du -h ../public/og/*
```

**解决方案：**

```bash
# 启用 Gzip 压缩（server.js）
const compression = require('compression');
app.use(compression());

# 使用 Nginx 缓存（nginx.conf）
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 优化图片
# 使用 imagemin 或在线工具压缩图片
```

---

### 6. CORS 错误

**症状：** 浏览器控制台显示 CORS 错误

**排查步骤：**

```bash
# 检查 CORS 配置
grep -n "cors" server.js
```

**解决方案：**

```javascript
// server.js
const cors = require('cors');

app.use(cors({
  origin: ['https://goodhorse.fun', 'http://localhost:5173'],
  credentials: true
}));
```

---

### 7. SSL 证书问题

**症状：** HTTPS 无法访问或证书过期

**排查步骤：**

```bash
# 检查证书有效期
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem

# 检查 Nginx 配置
nginx -t
```

**解决方案：**

```bash
# 续期证书
./ssl-renew.sh

# 或手动续期
sudo certbot renew

# 重启 Nginx
sudo systemctl restart nginx
```

---

### 8. PM2 进程消失

**症状：** `pm2 list` 显示为空

**排查步骤：**

```bash
# 检查 PM2 守护进程
pm2 ping

# 查看系统日志
journalctl -u pm2-root -n 50
```

**解决方案：**

```bash
# 重启 PM2
pm2 kill
pm2 resurrect

# 或重新启动应用
pm2 start ecosystem.config.json
pm2 save
```

---

### 9. 数据库连接失败

**症状：** 应用无法连接到数据库（如果使用）

**排查步骤：**

```bash
# 检查数据库是否运行
systemctl status postgresql
systemctl status mysql

# 测试连接
psql -U username -d database -h localhost
mysql -u username -p
```

**解决方案：**

```bash
# 启动数据库
sudo systemctl start postgresql

# 检查连接字符串
cat .env | grep DATABASE

# 检查防火墙
sudo ufw status
```

---

### 10. 磁盘空间不足

**症状：** 应用崩溃，日志显示写入失败

**排查步骤：**

```bash
# 检查磁盘使用
df -h

# 查找大文件
du -sh * | sort -h
```

**解决方案：**

```bash
# 清理日志
./cleanup-logs.sh

# 清理 PM2 日志
pm2 flush

# 清理 Docker（如果使用）
docker system prune -a

# 清理 npm 缓存
npm cache clean --force
```

---

## 🛠️ 调试工具

### 实时日志监控

```bash
# PM2 日志
pm2 logs horse-app --lines 100

# 系统日志
tail -f /var/log/syslog

# Nginx 日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### 性能分析

```bash
# 运行性能测试
./performance-test.sh

# 监控资源使用
./monitor.sh

# 使用 htop
htop
```

### 网络调试

```bash
# 测试端口连接
telnet localhost 3000
nc -zv localhost 3000

# 查看网络连接
netstat -tulpn | grep :3000

# 测试 DNS
nslookup goodhorse.fun
dig goodhorse.fun
```

---

## 📞 获取帮助

如果以上方法都无法解决问题：

1. **查看完整日志**
   ```bash
   pm2 logs horse-app --lines 1000 > debug.log
   ```

2. **收集系统信息**
   ```bash
   node -v
   npm -v
   pm2 -v
   uname -a
   ```

3. **运行诊断脚本**
   ```bash
   ./monitor.sh > diagnostic.txt
   ```

4. **检查 GitHub Issues**
   - 搜索类似问题
   - 创建新 Issue 并附上日志

---

## 🔧 预防措施

### 定期维护

```bash
# 每周运行
./cleanup-logs.sh
./backup.sh

# 每月运行
./update.sh
./ssl-renew.sh
```

### 监控告警

设置 PM2 监控：

```bash
pm2 install pm2-server-monit
```

### 自动恢复

配置 PM2 自动重启：

```json
{
  "autorestart": true,
  "max_restarts": 10,
  "min_uptime": "10s"
}
```

---

**记住：** 大多数问题都可以通过查看日志找到答案！

```bash
pm2 logs horse-app
```
