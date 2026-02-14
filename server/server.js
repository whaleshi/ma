const express = require('express');
const path = require('path');
const cors = require('cors');
const ogHandler = require('./og-handler');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（前端构建产物）
app.use(express.static(path.join(__dirname, '../dist')));

// 静态 OG 图片
app.use('/og', express.static(path.join(__dirname, '../public/og')));

// API 路由
app.use(ogHandler);

// Share API（如果需要）
app.get('/api/share', (req, res) => {
  const type = req.query.type ?? 'default';
  const amount = req.query.amount;
  const origin = req.protocol + '://' + req.get('host');

  res.json({
    url: `${origin}?type=${type}${amount ? `&amount=${amount}` : ''}`,
    ogImage: `${origin}/api/og?type=${type}${amount ? `&amount=${amount}` : ''}`,
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA 回退路由（所有其他路由返回 index.html）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🖼️  OG images: http://localhost:${PORT}/api/og?type=default`);
});

module.exports = app;
