# 分离部署实施指南

## 🎯 部署架构

```
┌─────────────┐         ┌──────────────┐
│   Vercel    │         │   Railway    │
│  (前端)      │ ──────> │   (后端)      │
│  静态托管    │  HTTPS  │  Node.js服务  │
└─────────────┘         └──────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │  Supabase    │
                        │  PostgreSQL  │
                        └──────────────┘
```

---

## 📋 部署步骤

### 第一步：部署后端到 Railway

#### 1. 创建 Railway 账号
访问 https://railway.app 并使用 GitHub 登录

#### 2. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择 `uninet/werss` 仓库
4. 选择 `backend` 目录作为根目录

#### 3. 配置环境变量
在 Railway 项目设置中添加以下环境变量：

```bash
# 数据库连接
DATABASE_URL=postgresql://postgres:dmxupYkneDb7Szp5@db.uprwzrgiyunnqjdvcfen.supabase.co:5432/postgres

# JWT 密钥
JWT_SECRET=A/Eu739NK/VsUqFfwIg/DzEjNS2YWhRmwVhzVY3hMf+/V4h+Q1lRH93K92l7hhX9163TnQOIJeaeVCguLd8c4g==

# 端口（Railway 会自动设置，但可以指定默认值）
PORT=3000

# 环境
NODE_ENV=production

# 邮件配置（可选）
SMTP_HOST=smtp.fonto.com
SMTP_PORT=465
SMTP_USER=fonto@sina.com
SMTP_PASS=passwoedbd85efc2a762cfrd
EMAIL_TO=uninet@126.com
SMTP_SECURE=true

# GitHub Token（可选）
GITHUB_TOKEN=your_github_token_here

# Cron 配置（可选）
CRON_ENABLED=true
CRON_SCHEDULE=0 9 * * *
LOG_LEVEL=info
```

#### 4. 配置构建设置
Railway 会自动检测 Node.js 项目，但确保：
- **Root Directory**: `backend`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

#### 5. 部署
点击 "Deploy" 按钮，Railway 会自动构建和部署

#### 6. 获取后端 URL
部署成功后，Railway 会提供一个公网 URL，格式类似：
```
https://werss-backend-production.up.railway.app
```

**记录这个 URL，下一步需要用到！**

---

### 第二步：更新前端配置

#### 1. 修改前端环境变量
编辑 `frontend/.env.production`，将 Railway URL 填入：

```bash
# 将 your-backend.railway.app 替换为实际的 Railway URL
VITE_API_BASE_URL=https://werss-backend-production.up.railway.app/api
```

#### 2. 提交更改
```bash
cd /Users/yelon/Documents/werss
git add frontend/.env.production
git commit -m "Update: 配置前端连接到 Railway 后端"
git push origin main
```

---

### 第三步：重新部署前端到 Vercel

Vercel 会自动检测到 Git 推送并重新部署。

或者手动触发部署：
1. 访问 https://vercel.com/uninet1s-projects-2ca8f3f3/werss
2. 点击 "Redeploy"

---

## ✅ 验证部署

### 1. 测试后端健康检查
```bash
curl https://your-backend.railway.app/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2026-02-07T...",
  "version": "1.0.0"
}
```

### 2. 测试注册功能
```bash
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123456"}'
```

应该返回：
```json
{
  "message": "注册成功",
  "token": "eyJ...",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

### 3. 测试前端
访问 https://werss.vercel.app 并尝试：
- 注册新用户
- 登录
- 查看内容列表

---

## 🔧 故障排查

### 后端部署失败

**检查构建日志**：
- 在 Railway 项目页面查看 "Deployments" 标签
- 查看详细的构建和运行日志

**常见问题**：
1. **依赖安装失败**：检查 `package.json` 是否正确
2. **Prisma 生成失败**：确保 `DATABASE_URL` 环境变量已设置
3. **端口监听失败**：确保使用 `process.env.PORT`

### 前端连接后端失败

**检查 CORS 配置**：
后端的 CORS 应该允许前端域名：
```javascript
app.use(cors({ 
  origin: ['https://werss.vercel.app', 'https://werss-*.vercel.app'],
  credentials: true 
}));
```

**检查 API baseURL**：
确保 `frontend/.env.production` 中的 URL 正确

### 数据库连接失败

**检查 DATABASE_URL**：
- 确保格式正确
- 确保数据库可以从外部访问
- 检查防火墙规则

---

## 📊 性能优化建议

### Railway 后端

1. **启用自动扩展**：在 Railway 设置中配置
2. **配置健康检查**：添加 `/health` 端点
3. **设置日志级别**：生产环境使用 `LOG_LEVEL=error`

### Vercel 前端

1. **启用 CDN 缓存**：静态资源自动缓存
2. **配置 Gzip 压缩**：Vercel 自动启用
3. **使用 Image Optimization**：优化图片加载

---

## 💰 成本估算

### Railway
- **免费额度**：每月 $5 的免费使用额度
- **预计成本**：小型项目通常在免费额度内
- **付费计划**：$5/月起

### Vercel
- **免费额度**：100GB 带宽/月
- **预计成本**：小型项目通常在免费额度内
- **付费计划**：$20/月起

### Supabase
- **免费额度**：500MB 数据库，2GB 传输
- **预计成本**：小型项目通常在免费额度内
- **付费计划**：$25/月起

**总计**：对于小型项目，完全可以在免费额度内运行！

---

## 🎓 优势总结

相比 Vercel Serverless 部署：

✅ **没有超时限制**：Railway 支持长时间运行的请求
✅ **更好的数据库支持**：持久连接，连接池管理
✅ **更容易调试**：完整的日志和监控
✅ **更稳定可靠**：不受冷启动影响
✅ **支持更多功能**：WebSocket、定时任务等
✅ **成本可控**：小型项目免费，大型项目成本透明

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 Railway 部署日志
2. 查看 Vercel 部署日志
3. 检查浏览器控制台的网络请求
4. 参考本文档的故障排查部分

---

**部署完成后，请测试所有功能并确认正常工作！**
