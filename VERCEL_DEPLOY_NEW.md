# AI Tracker - Vercel 部署指南

## 快速部署步骤

### 1. 准备环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑并填入实际值
nano .env.local
```

必需的环境变量：
- `DATABASE_URL`: PostgreSQL 数据库连接字符串（推荐使用 Supabase）
- `JWT_SECRET`: JWT 签名密钥（至少 32 位随机字符串）

### 2. 部署到 Vercel

#### 方式一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

#### 方式二：通过 GitHub 集成

1. 将代码推送到 GitHub
2. 在 Vercel 控制台导入项目
3. 配置环境变量
4. 自动部署

### 3. 配置数据库

项目使用 PostgreSQL 数据库，推荐 Supabase：

1. 注册 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取数据库连接字符串
4. 在 Vercel 环境变量中设置 `DATABASE_URL`

### 4. 初始化数据库

部署后执行数据库迁移：

```bash
# 本地执行
npx prisma migrate deploy --schema=./backend/prisma/schema.prisma
```

或在 Supabase SQL 编辑器中手动创建表。

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 连接字符串 |
| `JWT_SECRET` | ✅ | JWT 签名密钥 |
| `SMTP_HOST` | ❌ | 邮件服务器地址 |
| `SMTP_PORT` | ❌ | 邮件服务器端口 |
| `SMTP_USER` | ❌ | 邮件账号 |
| `SMTP_PASS` | ❌ | 邮件密码 |
| `EMAIL_TO` | ❌ | 默认收件人 |
| `GITHUB_TOKEN` | ❌ | GitHub API Token |

## 故障排查

### 部署失败

1. 检查 `vercel.json` 配置是否正确
2. 确认所有必需的环境变量已设置
3. 查看 Vercel 部署日志

### 数据库连接失败

1. 确认 `DATABASE_URL` 格式正确
2. 检查数据库服务器防火墙设置
3. 验证数据库用户权限

### API 返回 500

1. 检查 Vercel Functions 日志
2. 确认 `api/index.ts` 正确引用构建后的文件
3. 验证 Prisma Client 已生成

## 技术栈

- **前端**: Vue 3 + Vite + Tailwind CSS
- **后端**: Express + TypeScript
- **数据库**: PostgreSQL + Prisma
- **部署**: Vercel Serverless Functions

## 更多信息

- [Vercel 文档](https://vercel.com/docs)
- [Prisma 文档](https://prisma.io/docs)
- [Supabase 文档](https://supabase.com/docs)
