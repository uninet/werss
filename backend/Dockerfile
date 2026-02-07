# Railway 部署 Dockerfile
FROM node:20-alpine

# 安装必要的系统依赖
RUN apk add --no-cache openssl

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖（不使用缓存挂载）
RUN npm ci --prefer-offline=false

# 生成 Prisma Client
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
