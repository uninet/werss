# 构建前端
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 构建后端
FROM node:20-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist ./public

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 暴露端口
EXPOSE 3000

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动命令
CMD ["node", "dist/index.js"]
