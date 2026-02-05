# Vercel 部署检查清单

## 前置要求

- [ ] 已创建 Vercel 账号
- [ ] 已准备 PostgreSQL 数据库（推荐使用 Supabase、Neon 或 PlanetScale）
- [ ] 已准备好所有环境变量

## 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

### 必需变量
- `DATABASE_URL` - PostgreSQL 数据库连接字符串
  - 格式：`postgresql://user:password@host:port/database`
  - 示例：`postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`

- `JWT_SECRET` - JWT 签名密钥
  - 建议使用随机生成的字符串
  - 生成方法：`openssl rand -base64 32`

### 可选变量
- `SMTP_HOST` - SMTP 服务器地址
- `SMTP_PORT` - SMTP 端口
- `SMTP_USER` - SMTP 用户名
- `SMTP_PASS` - SMTP 密码
- `EMAIL_TO` - 接收通知的邮箱
- `GITHUB_TOKEN` - GitHub API token（用于 GitHub 相关功能）

## 数据库准备

### 1. 创建数据库
```bash
# 如果使用 Supabase
# 1. 访问 https://supabase.com
# 2. 创建新项目
# 3. 获取 DATABASE_URL
```

### 2. 运行数据库迁移
Vercel 部署时会自动执行，但你可以手动测试：
```bash
cd backend
npx prisma migrate deploy
```

### 3. 验证数据库连接
```bash
cd backend
npm run db:studio
```

## Vercel 项目配置

### 1. 连接 Git 仓库
- 在 Vercel 控制台点击 "Add New Project"
- 选择 "Continue with GitHub"
- 选择 `werss` 仓库

### 2. 配置构建设置
```
Framework Preset: Other
Build Command: npm run vercel-build
Output Directory: frontend/dist
Install Command: npm install
```

### 3. 配置环境变量
在 "Environment Variables" 部分添加上面列出的所有变量

### 4. 配置域名（可选）
- 在 "Domains" 部分添加自定义域名
- 或使用 Vercel 提供的默认域名

## 部署流程

### 自动部署
每次推送到 `main` 分支会自动触发部署：
```bash
git add .
git commit -m "Update for Vercel deployment"
git push origin main
```

### 手动部署
在 Vercel 控制台点击 "Deployments" → "Redeploy"

## 部署后验证

### 1. 检查部署状态
- 访问 Vercel 控制台查看部署日志
- 确认构建成功，没有错误

### 2. 测试 API 端点
```bash
# 测试健康检查
curl https://your-app.vercel.app/api/health

# 测试内容接口
curl https://your-app.vercel.app/api/contents
```

### 3. 检查前端
访问你的应用 URL，确认：
- [ ] 页面正常加载
- [ ] 静态资源加载正常
- [ ] API 调用成功

### 4. 检查日志
在 Vercel 控制台查看：
- Function Logs - API 函数日志
- Build Logs - 构建日志

## 常见问题排查

### 问题 1：构建失败

**症状**：构建过程报错

**解决方案**：
1. 检查 Build Logs 查看具体错误
2. 确认 `vercel-build` 脚本正确
3. 验证依赖版本兼容性
4. 检查 TypeScript 编译错误

### 问题 2：API 返回 404

**症状**：前端无法调用 API

**解决方案**：
1. 确认 `vercel.json` 中的 `rewrites` 配置正确
2. 检查 `api/index.ts` 是否正确导出 handler
3. 验证后端路由配置
4. 查看 Function Logs 确认函数是否正常运行

### 问题 3：数据库连接失败

**症状**：API 返回数据库错误

**解决方案**：
1. 确认 `DATABASE_URL` 环境变量正确
2. 验证数据库可访问性
3. 检查数据库迁移是否完成
4. 确认 Prisma schema 与数据库结构一致

### 问题 4：前端资源加载失败

**症状**：页面样式或脚本加载失败

**解决方案**：
1. 确认 `outputDirectory` 配置为 `frontend/dist`
2. 检查前端构建是否成功
3. 验证静态资源路径
4. 检查浏览器控制台的网络请求

## 性能优化建议

### 1. 缓存策略
- 在 `vercel.json` 中配置缓存头
- 使用 CDN 加速静态资源

### 2. 数据库优化
- 使用数据库连接池
- 添加适当的索引
- 考虑使用 Redis 缓存

### 3. API 优化
- 启用 gzip 压缩
- 实现响应缓存
- 优化数据库查询

### 4. 监控和告警
- 配置 Vercel Analytics
- 设置错误监控（如 Sentry）
- 配置性能监控

## 成本控制

### Vercel 免费套餐限制
- 100GB 带宽/月
- 6,000 分钟构建时间/月
- 无限 Serverless Functions
- 10GB Serverless Function 执行时间/月

### 优化建议
- 启用增量构建
- 优化依赖大小
- 使用缓存减少构建时间
- 监控资源使用情况

## 安全检查

- [ ] 环境变量不在代码中硬编码
- [ ] `.env` 文件在 `.gitignore` 中
- [ ] API 密钥和敏感信息已加密
- [ ] 启用了 HTTPS
- [ ] 配置了安全头（已在 vercel.json 中）
- [ ] 实施了速率限制
- [ ] 数据库连接使用 SSL

## 备份和恢复

### 数据库备份
```bash
# 手动备份
cd backend
npx prisma db pull

# 定期备份脚本（可选）
# 在 Supabase 中设置自动备份
```

### 配置备份
- 保存 Vercel 环境变量
- 备份 `vercel.json` 配置
- 记录数据库 schema 变更

## 持续改进

### 监控指标
- API 响应时间
- 错误率
- 用户活跃度
- 资源使用情况

### 定期检查
- 每月检查部署日志
- 每季度审查依赖更新
- 每半年进行安全审计
- 持续优化性能

## 联系支持

如果遇到问题：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 检查 [Vercel 状态页](https://status.vercel.com)
3. 在 GitHub Issues 中搜索类似问题
4. 联系技术支持
