# Docker 部署指南

> 一键部署 AI Tracker 项目

---

## 前置要求

1. Docker (>= 20.10)
2. Docker Compose (>= 2.0)
3. Supabase 数据库账号

---

## 快速开始

### 1. 配置环境变量

复制 `.env.example` 并创建 `.env` 文件：

```bash
cp backend/.env.example .env
```

编辑 `.env` 文件，至少配置以下变量：

```bash
# 数据库连接（必需）
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_SUPABASE_PROJECT.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=10"

# JWT 密钥（必需）
JWT_SECRET="your-jwt-secret-here"

# 调度器配置（可选，默认开启）
CRON_ENABLED=true
CRON_SCHEDULE="0 9 * * *"

# 日志级别（可选，默认 info）
LOG_LEVEL=info
```

### 2. 构建并启动

```bash
# 构建并启动（首次使用会需要几分钟）
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 3. 访问应用

- **应用地址**: http://localhost:3000
- **健康检查**: http://localhost:3000/health

---

## 常用命令

### 启动/停止

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 查看日志

```bash
# 查看所有日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100
```

### 重新构建

```bash
# 重新构建镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build
```

### 进入容器调试

```bash
# 进入运行中的容器
docker-compose exec ai-tracker sh

# 重新生成 Prisma Client
docker-compose exec ai-tracker npx prisma generate

# 运行数据库迁移
docker-compose exec ai-tracker npx prisma db push
```

---

## 生产环境部署

### 使用外部数据库

项目使用 Supabase 作为外部数据库，无需在 Docker Compose 中部署数据库服务。

如需使用其他 PostgreSQL 数据库：

```bash
# .env 中配置
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?options"
```

### 部署到服务器

1. 上传代码到服务器
2. 配置 `.env` 文件
3. 运行 `docker-compose up -d --build`
4. 配置反向代理（Nginx/Caddy）

### 使用 Nginx 反向代理

示例 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs ai-tracker

# 检查环境变量
docker-compose config
```

### 健康检查失败

```bash
# 手动测试健康检查
curl http://localhost:3000/health

# 进入容器检查
docker-compose exec ai-tracker sh
```

### 数据库连接失败

1. 检查 `.env` 中的 `DATABASE_URL` 是否正确
2. 确认数据库允许外部连接
3. 检查防火墙规则

### 端口被占用

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:3000"  # 改用 8080 端口
```

---

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像（可选）
docker image prune -a
```

---

## 环境变量说明

| 变量 | 必需 | 默认值 | 说明 |
|-------|-------|---------|------|
| `DATABASE_URL` | ✅ | - | PostgreSQL 连接字符串 |
| `JWT_SECRET` | ✅ | - | JWT 签名密钥 |
| `PORT` | - | 3000 | 服务监听端口 |
| `NODE_ENV` | - | production | 运行环境 |
| `CRON_ENABLED` | - | true | 是否启用定时任务 |
| `CRON_SCHEDULE` | - | 0 9 * * * | Cron 表达式 |
| `LOG_LEVEL` | - | info | 日志级别 |

---

## 镜像信息

- **基础镜像**: node:20-alpine
- **工作目录**: /app
- **暴露端口**: 3000
- **健康检查**: GET /health
- **重启策略**: unless-stopped

---

## 支持

如有问题，请检查：
1. Docker 版本是否满足要求
2. `.env` 文件是否配置正确
3. 端口是否被占用
4. 数据库连接是否正常
