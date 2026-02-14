FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY server/package*.json ./server/

# 安装服务器依赖
RUN cd server && npm install --production

# 复制构建产物和静态资源
COPY dist ./dist
COPY public ./public
COPY server ./server

# 创建日志目录
RUN mkdir -p server/logs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server/server.js"]
