# Railway 部署故障排查指南

## ✅ 已修复：Prisma Schema 找不到的问题

### 问题描述
```
Error: Could not find Prisma Schema that is required for this command.
```

### 根本原因
Railway 的默认构建流程没有正确执行 Prisma 生成步骤。

### 解决方案
已添加 `backend/nixpacks.toml` 配置文件，明确指定构建步骤：

```toml
[phases.setup]
nixPkgs = ['nodejs_18', 'openssl']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npx prisma generate', 'npm run build']

[start]
cmd = 'npm start'
```

### 现在需要做的
1. 在 Railway 项目中触发重新部署
2. 或者 Railway 会自动检测到新的提交并重新部署

---

## 🔧 Railway 部署配置检查清单

### 1. 项目设置
- ✅ **Root Directory**: 设置为 `backend`
- ✅ **Branch**: `main`
- ✅ **Auto Deploy**: 启用

### 2. 环境变量（必需）
```bash
DATABASE_URL=postgresql://postgres:dmxupYkneDb7Szp5@db.uprwzrgiyunnqjdvcfen.supabase.co:5432/postgres
JWT_SECRET=A/Eu739NK/VsUqFfwIg/DzEjNS2YWhRmwVhzVY3hMf+/V4h+Q1lRH93K92l7hhX9163TnQOIJeaeVCguLd8c4g==
NODE_ENV=production
```

### 3. 构建配置
- ✅ **Build Command**: 自动检测（使用 nixpacks.toml）
- ✅ **Start Command**: `npm start`
- ✅ **Install Command**: `npm ci`

---

## 🐛 常见问题排查

### 问题 1：Prisma Schema 找不到
**错误信息**：
```
Error: Could not find Prisma Schema that is required for this command.
```

**解决方案**：
✅ 已通过 `nixpacks.toml` 修复

---

### 问题 2：数据库连接失败
**错误信息**：
```
Error: Can't reach database server
```

**检查**：
1. DATABASE_URL 环境变量是否正确设置
2. 数据库服务器是否可以从外部访问
3. 防火墙规则是否允许 Railway 的 IP

**解决方案**：
```bash
# 测试数据库连接
psql "postgresql://postgres:password@host:5432/postgres"
```

---

### 问题 3：端口监听失败
**错误信息**：
```
Error: listen EADDRINUSE: address already in use
```

**检查**：
确保代码中使用 Railway 提供的 PORT 环境变量：
```typescript
const PORT = process.env.PORT || 3000;
```

**当前状态**：✅ 已正确配置

---

### 问题 4：依赖安装失败
**错误信息**：
```
npm ERR! code ENOTFOUND
```

**解决方案**：
1. 检查 package.json 中的依赖是否都可用
2. 清除 Railway 缓存并重新部署
3. 检查 npm registry 是否可访问

---

### 问题 5：TypeScript 编译失败
**错误信息**：
```
error TS2307: Cannot find module
```

**检查**：
1. 所有导入是否包含 `.js` 扩展名
2. tsconfig.json 配置是否正确
3. 类型定义是否完整

**当前状态**：✅ 已正确配置

---

## 📊 查看部署日志

### 在 Railway 控制台
1. 进入项目页面
2. 点击 "Deployments" 标签
3. 选择最新的部署
4. 查看 "Build Logs" 和 "Deploy Logs"

### 关键日志检查点
```bash
# 1. 依赖安装
✅ npm ci
✅ added 272 packages

# 2. Prisma 生成
✅ npx prisma generate
✅ Generated Prisma Client

# 3. TypeScript 编译
✅ npm run build
✅ tsc completed

# 4. 服务启动
✅ npm start
✅ Server running on port 3000
```

---

## 🔄 重新部署步骤

### 方法 1：自动部署（推荐）
Railway 会自动检测 GitHub 推送并重新部署。

### 方法 2：手动触发
1. 在 Railway 项目页面
2. 点击右上角的 "Deploy" 按钮
3. 选择 "Redeploy"

### 方法 3：清除缓存重新部署
1. 在 Railway 项目设置中
2. 找到 "Clear Build Cache"
3. 点击清除后重新部署

---

## ✅ 验证部署成功

### 1. 检查部署状态
在 Railway 控制台应该看到：
- ✅ 状态：Active
- ✅ 健康检查：Passing
- ✅ 最近日志：无错误

### 2. 测试健康检查端点
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

### 3. 测试数据库连接
```bash
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123456"}'
```

应该返回包含 token 的成功响应。

---

## 📞 仍然遇到问题？

### 检查清单
- [ ] Root Directory 设置为 `backend`
- [ ] 环境变量已正确配置
- [ ] DATABASE_URL 可以连接
- [ ] nixpacks.toml 文件存在
- [ ] 最新代码已推送到 GitHub
- [ ] Railway 已触发重新部署

### 获取帮助
1. 查看 Railway 部署日志
2. 检查 Railway 社区论坛
3. 参考 Railway 官方文档：https://docs.railway.app

---

## 🎉 部署成功后

恭喜！后端已成功部署到 Railway。

**下一步**：
1. 复制 Railway 提供的域名
2. 配置前端环境变量
3. 重新部署前端到 Vercel

详见：`NEXT_STEPS.md`
