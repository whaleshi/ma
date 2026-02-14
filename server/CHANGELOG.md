# Changelog

所有重要的项目变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 计划中
- 添加 Redis 缓存支持
- 实现 API 速率限制
- 添加更多 OG 图片模板

---

## [1.0.0] - 2024-01-15

### 新增
- ✨ 初始版本发布
- 🎨 OG 图片生成 API
- 🔗 分享链接生成 API
- 💚 健康检查端点
- 📦 Express 服务器实现
- 🐳 Docker 支持
- 🔧 PM2 进程管理
- 📝 完整文档

### 功能
- 支持多种卡片类型（事业马、爱情马、发财马等）
- 自动重定向到静态图片
- Gzip 压缩
- CORS 支持
- 错误处理

### 部署
- 一键部署脚本（Linux/Mac/Windows）
- Docker Compose 配置
- Nginx 反向代理配置
- SSL/HTTPS 支持
- PM2 集群模式

### 维护
- 自动备份脚本
- 日志清理脚本
- 性能测试脚本
- 监控脚本
- SSL 自动续期

### 文档
- README.md - 完整文档
- QUICKSTART.md - 快速开始
- DEPLOYMENT-CHECKLIST.md - 部署清单
- TROUBLESHOOTING.md - 故障排查
- SECURITY.md - 安全指南
- API.md - API 文档
- INDEX.md - 文件索引

### 安全
- 环境变量隔离
- 防火墙配置指南
- SSH 安全加固
- 依赖安全审计
- HTTPS 强制

---

## [0.2.0] - 2024-01-10

### 新增
- 添加 OG 图片支持
- 添加分享功能

### 改进
- 优化图片加载速度
- 改进错误处理

---

## [0.1.0] - 2024-01-05

### 新增
- 项目初始化
- 基础服务器设置
- 静态文件服务

---

## 版本说明

### 版本号格式: MAJOR.MINOR.PATCH

- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修正

### 变更类型

- `新增` - 新功能
- `改进` - 现有功能的改进
- `修复` - Bug 修复
- `变更` - 功能变更
- `废弃` - 即将移除的功能
- `移除` - 已移除的功能
- `安全` - 安全相关的修复

---

## 贡献指南

如果你想为项目做出贡献，请：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 链接

- [项目主页](https://github.com/yourusername/horse-app)
- [问题反馈](https://github.com/yourusername/horse-app/issues)
- [发布页面](https://github.com/yourusername/horse-app/releases)

---

**注意**: 本项目遵循语义化版本规范。
