# 🚀 分离部署 - 下一步操作指南

## ✅ 已完成的准备工作

1. ✅ 修改后端配置，支持独立运行
2. ✅ 创建 Railway 配置文件
3. ✅ 简化 Vercel 配置，只部署前端
4. ✅ 创建完整的部署指南文档
5. ✅ 提交并推送所有更改到 GitHub

---

## 📋 现在需要你执行的步骤

### 第一步：在 Railway 部署后端（5分钟）

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `uninet/werss` 仓库
   - **重要**：设置 Root Directory 为 `backend`

3. **配置环境变量**
   点击项目 → Variables 标签，添加以下变量：
   
   ```bash
   DATABASE_URL=postgresql://postgres:dmxupYkneDb7Szp5@db.uprwzrgiyunnqjdvcfen.supabase.co:5432/postgres
   JWT_SECRET=A/Eu739NK/VsUqFfwIg/DzEjNS2YWhRmwVhzVY3hMf+/V4h+Q1lRH93K92l7hhX9163TnQOIJeaeVCguLd8c4g==
   NODE_ENV=production
   PORT=3000
   ```

4. **等待部署完成**
   - Railway 会自动检测 Node.js 项目
   - 自动运行 `npm ci && npm run build`
   - 自动启动服务 `npm start`
   - 等待 2-3 分钟

5. **获取后端 URL**
   - 部署成功后，点击 "Settings" → "Domains"
   - 会看到类似 `werss-backend-production.up.railway.app` 的域名
   - **复制这个 URL！**

---

### 第二步：配置前端连接后端（2分钟）

1. **创建前端环境变量文件**
   ```bash
   cd /Users/yelon/Documents/werss/frontend
   cp .env.production.example .env.production
   ```

2. **编辑 .env.production**
   将 Railway URL 填入：
   ```bash
   VITE_API_BASE_URL=https://你的railway域名.railway.app/api
   ```
   
   例如：
   ```bash
   VITE_API_BASE_URL=https://werss-backend-production.up.railway.app/api
   ```

3. **提交更改**
   ```bash
   cd /Users/yelon/Documents/werss
   git add frontend/.env.production
   git commit -m "Config: 配置前端连接到 Railway 后端"
   git push origin main
   ```

---

### 第三步：验证部署（3分钟）

1. **测试后端健康检查**
   ```bash
   curl https://你的railway域名.railway.app/health
   ```
   
   应该返回：
   ```json
   {
     "status": "ok",
     "timestamp": "2026-02-07T...",
     "version": "1.0.0"
   }
   ```

2. **测试注册功能**
   ```bash
   curl -X POST https://你的railway域名.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser999","password":"test123456"}'
   ```
   
   应该返回包含 token 的成功响应

3. **测试前端**
   - 访问 https://werss.vercel.app
   - 尝试注册新用户
   - 尝试登录
   - 查看内容列表

---

## ✅ 成功标志

如果看到以下情况，说明部署成功：

- ✅ Railway 后端显示 "Active" 状态
- ✅ 健康检查返回正常
- ✅ 注册接口返回 token
- ✅ 前端可以成功注册和登录
- ✅ 前端可以正常显示内容

---

## 🆘 如果遇到问题

### Railway 部署失败

**查看日志**：
- Railway 项目页面 → Deployments 标签
- 点击失败的部署查看详细日志

**常见问题**：
- Prisma 生成失败 → 检查 DATABASE_URL 是否正确
- 端口监听失败 → 确保使用 `process.env.PORT`
- 依赖安装失败 → 检查 package.json

### 前端无法连接后端

**检查**：
1. Railway URL 是否正确（包含 /api 后缀）
2. Railway 后端是否正常运行
3. 浏览器控制台是否有 CORS 错误

**解决**：
- 确保 Railway URL 正确
- 检查后端 CORS 配置
- 清除浏览器缓存

---

## 📞 需要帮助？

详细的部署指南和故障排查，请查看：
- **DEPLOYMENT_GUIDE.md** - 完整部署指南
- **TASK_SUMMARY_REPORT.md** - 任务总结报告

---

## 🎉 部署完成后

恭喜！你已经成功实施了分离部署方案：

- ✅ 后端在 Railway 独立运行，没有超时限制
- ✅ 前端在 Vercel 静态托管，快速访问
- ✅ 数据库连接稳定，性能优异
- ✅ 注册和登录功能正常工作

**享受你的应用吧！** 🚀
