# Vercel 环境变量配置指南

## 🎯 配置 Vercel 环境变量

由于 `.env.production` 文件被 gitignore（这是正确的安全做法），需要在 Vercel 控制台手动配置环境变量。

---

## 📋 配置步骤

### 方法 1：通过 Vercel 控制台（推荐）

1. **访问 Vercel 项目设置**
   - 打开 https://vercel.com/uninet1s-projects-2ca8f3f3/werss
   - 点击 "Settings" 标签

2. **添加环境变量**
   - 在左侧菜单选择 "Environment Variables"
   - 点击 "Add New" 按钮

3. **配置变量**
   ```
   Name: VITE_API_BASE_URL
   Value: https://werss-production.up.railway.app/api
   Environment: Production (勾选)
   ```

4. **保存并重新部署**
   - 点击 "Save" 保存
   - 返回 "Deployments" 标签
   - 点击最新部署右侧的 "..." 菜单
   - 选择 "Redeploy"

---

### 方法 2：通过 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没安装）
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add VITE_API_BASE_URL production
# 输入值：https://werss-production.up.railway.app/api

# 重新部署
vercel --prod
```

---

## ✅ 验证配置

### 1. 检查环境变量是否生效

部署完成后，访问前端并打开浏览器控制台：
```javascript
// 在控制台执行
console.log(import.meta.env.VITE_API_BASE_URL)
// 应该输出：https://werss-production.up.railway.app/api
```

### 2. 测试 API 连接

在前端尝试注册或登录，查看 Network 标签：
- 请求 URL 应该指向：`https://werss-production.up.railway.app/api/auth/...`
- 不应该是 `/api/auth/...`（相对路径）

---

## 🔧 故障排查

### 问题 1：环境变量未生效

**症状**：前端仍然使用相对路径 `/api/...`

**解决**：
1. 确认环境变量名称正确：`VITE_API_BASE_URL`（必须以 `VITE_` 开头）
2. 确认选择了 "Production" 环境
3. 重新部署后清除浏览器缓存

### 问题 2：CORS 错误

**症状**：浏览器控制台显示 CORS 错误

**解决**：
后端已配置允许所有来源，如果仍有问题，检查：
1. Railway 后端是否正常运行
2. URL 是否正确（包含 https://）
3. 是否有代理或防火墙阻止

### 问题 3：API 请求失败

**症状**：请求返回 404 或 500

**解决**：
1. 确认 Railway 后端正常运行
2. 测试后端 API：
   ```bash
   curl https://werss-production.up.railway.app/api/auth/register \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test123"}'
   ```

---

## 📊 配置总结

| 配置项 | 值 |
|--------|-----|
| 环境变量名 | `VITE_API_BASE_URL` |
| 环境变量值 | `https://werss-production.up.railway.app/api` |
| 配置环境 | Production |
| Railway 后端 | ✅ 已部署并运行 |
| Vercel 前端 | ⏳ 等待配置环境变量 |

---

## 🎉 完成后

配置完成并重新部署后：

1. **访问前端**：https://werss.vercel.app
2. **测试注册**：创建新用户
3. **测试登录**：使用注册的账号登录
4. **查看内容**：浏览 RSS 内容列表

---

**现在请按照上述步骤在 Vercel 控制台配置环境变量！**
