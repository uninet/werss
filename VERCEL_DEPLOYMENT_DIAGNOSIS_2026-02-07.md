# Vercel 部署问题诊断报告
**日期**: 2026年2月7日  
**项目**: werss (AI Tracker)  
**问题**: 部署后无法正常注册和登录

---

## 🔴 核心问题总结

### 问题现象
1. ✅ **前端页面正常加载** - https://werss.vercel.app 可访问
2. ❌ **API 完全无法连接** - 所有 `/api/*` 端点超时（30秒+）
3. ❌ **注册功能失败** - 提交后无反馈，表单静默重置
4. ❌ **登录功能失败** - 显示"网络错误，请稍后重试"
5. ⚠️ **页面持续显示** - "API连接测试中..."

### 测试结果
```bash
# API Health 端点测试
curl https://werss.vercel.app/api/health
# 结果: Connection timed out after 75s

# 注册端点测试
curl -X POST https://werss.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
# 结果: Connection timed out after 30s
```

---

## 🔍 根本原因分析

### 1. **Serverless Function 初始化失败** ⚠️⚠️⚠️

根据 `FINAL_DIAGNOSIS.md` 的记录，问题的核心是：

**ES Modules 导入缺少 .js 扩展名**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 
'/var/task/api/backend-dist/controllers/blogger.controller'
```

#### 问题详情
- **TypeScript 配置**: `tsconfig.json` 使用 `"module": "NodeNext"`
- **编译输出**: TypeScript 编译后生成的 `.js` 文件包含正确的 `.js` 扩展名
- **本地验证**: ✅ 本地 `backend/dist` 文件已正确包含 `.js` 扩展
- **Vercel 部署**: ❌ Vercel 上的 `api/backend-dist` 可能使用了缓存或旧版本

#### 证据
```javascript
// backend/dist/routes/auth.js (本地正确)
import { authController } from '../controllers/auth.controller.js'; // ✅ 有 .js

// Vercel 错误日志显示
Cannot find module '../controllers/blogger.controller' // ❌ 缺少 .js
```

### 2. **Vercel 构建缓存问题** ⚠️⚠️

`vercel.json` 的构建命令：
```json
{
  "buildCommand": "cd backend && rm -rf dist && npm ci && npm run build && cd .. && rm -rf api/backend-dist && cp -r backend/dist api/backend-dist && cd frontend && npm install && npx vite build"
}
```

**潜在问题**:
- 虽然有 `rm -rf dist` 和 `rm -rf api/backend-dist`，但 Vercel 可能在这些命令执行前就缓存了旧文件
- 或者 Vercel 的构建环境中 `fix-imports.sh` 脚本没有执行权限

### 3. **API 入口文件的异步导入问题** ⚠️

`api/index.ts` 使用异步导入：
```typescript
const module = await import('./backend-dist/index.js');
```

如果 `backend-dist/index.js` 内部的导入失败，整个 Serverless Function 会超时。

### 4. **数据库连接配置** ⚠️

环境变量中的 `DATABASE_URL`:
```
postgresql://postgres:dmxupYkneDb7Szp5@db.uprwzrgiyunnqjdvcfen.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=10
```

**潜在问题**:
- Vercel 环境变量可能未正确配置
- 数据库连接超时（10秒）可能导致初始化失败
- Prisma Client 在 Serverless 环境中的初始化问题

---

## 🛠️ 修复方案

### 方案 A：使用 esbuild 打包（推荐）⭐⭐⭐⭐⭐

**优势**: 
- 将所有代码打包成单个文件，避免模块导入问题
- 自动处理所有依赖关系
- 减小部署包大小
- 提高冷启动速度

**实施步骤**:

1. **安装 esbuild**
```bash
cd /Users/yelon/Documents/werss/backend
npm install --save-dev esbuild
```

2. **修改 backend/package.json**
```json
{
  "scripts": {
    "build": "npx prisma generate && esbuild src/index.ts --bundle --platform=node --target=node18 --format=esm --outfile=dist/bundle.js --external:@prisma/client --external:pg-native"
  }
}
```

3. **修改 api/index.ts**
```typescript
import serverless from 'serverless-http';

async function createHandler() {
  try {
    const module = await import('./backend-dist/bundle.js');
    const app = module.default;
    console.log('[API] Backend app loaded successfully');
    return serverless(app);
  } catch (error) {
    console.error('[API] Failed to load backend app:', error);
    throw error;
  }
}

let handlerPromise = null;

export default async function handler(req, res) {
  if (!handlerPromise) {
    handlerPromise = createHandler();
  }
  
  const serverlessHandler = await handlerPromise;
  return serverlessHandler(req, res);
}
```

4. **修改 vercel.json**
```json
{
  "version": 2,
  "buildCommand": "cd backend && rm -rf dist && npm ci && npm run build && cd .. && rm -rf api/backend-dist && mkdir -p api/backend-dist && cp backend/dist/bundle.js api/backend-dist/ && cd frontend && npm install && npx vite build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {"source": "/api/(.*)", "destination": "/api/index"},
    {"source": "/(.*)", "destination": "/index.html"}
  ],
  "functions": {
    "api/index.ts": {
      "maxDuration": 30,
      "memory": 1024,
      "includeFiles": "api/backend-dist/**"
    }
  }
}
```

### 方案 B：修复 TypeScript 导入（次选）⭐⭐⭐

**优势**: 保持现有架构
**劣势**: 需要确保所有导入都正确

**实施步骤**:

1. **在源代码中直接使用 .js 扩展名**

修改所有 `backend/src/**/*.ts` 文件的导入语句：
```typescript
// 修改前
import { authController } from '../controllers/auth.controller';

// 修改后
import { authController } from '../controllers/auth.controller.js';
```

2. **创建验证脚本**
```bash
#!/bin/bash
# backend/verify-imports.sh

echo "Verifying all imports have .js extension..."
find dist -name "*.js" -exec grep -H "from ['\"].*[^.js]['\"]" {} \; | grep -v node_modules
if [ $? -eq 0 ]; then
  echo "❌ Found imports without .js extension"
  exit 1
else
  echo "✅ All imports have .js extension"
fi
```

3. **更新构建脚本**
```json
{
  "scripts": {
    "build": "npx prisma generate && tsc && bash verify-imports.sh"
  }
}
```

### 方案 C：分离部署（最稳定）⭐⭐⭐⭐

**优势**: 
- 后端独立部署，更容易调试
- 避免 Vercel Serverless 限制
- 更好的性能和可控性

**实施步骤**:

1. **后端部署到 Railway/Render**
   - 创建新的 Railway 项目
   - 连接 GitHub 仓库
   - 设置环境变量
   - 部署后端服务

2. **修改前端 API 配置**
```typescript
// frontend/.env.production
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

3. **更新 Vercel 配置**
```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npx vite build",
  "outputDirectory": "frontend/dist"
}
```

---

## 🚨 紧急修复步骤（立即执行）

### 步骤 1: 清除 Vercel 缓存

在 Vercel 项目设置中：
1. 进入 Settings → General
2. 找到 "Build & Development Settings"
3. 点击 "Clear Build Cache"
4. 重新部署

### 步骤 2: 检查环境变量

在 Vercel 项目设置中：
1. 进入 Settings → Environment Variables
2. 确认以下变量存在且正确：
   - `DATABASE_URL` (PostgreSQL 连接字符串)
   - `JWT_SECRET` (JWT 密钥)
   - `NODE_ENV=production`

### 步骤 3: 启用详细日志

修改 `api/index.ts`，添加更多日志：
```typescript
export default async function handler(req, res) {
  console.log('[API] Request:', req.method, req.url);
  console.log('[API] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
  });
  
  try {
    if (!handlerPromise) {
      console.log('[API] Creating handler...');
      handlerPromise = createHandler();
    }
    
    const serverlessHandler = await handlerPromise;
    console.log('[API] Handler ready, processing request');
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('[API] Handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack
    });
  }
}
```

### 步骤 4: 创建简化的测试端点

创建 `api/test-simple.ts`:
```typescript
export default function handler(req, res) {
  res.status(200).json({
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    }
  });
}
```

测试: `curl https://werss.vercel.app/api/test-simple`

---

## 📋 验证清单

### 部署前验证
- [ ] 本地运行 `npm run build` 成功
- [ ] 检查 `backend/dist` 中所有 `.js` 文件的导入语句
- [ ] 确认 `.env` 文件中的环境变量正确
- [ ] 本地测试 API 端点正常工作

### 部署后验证
- [ ] Vercel 构建日志无错误
- [ ] Function 日志中无模块导入错误
- [ ] `/api/test-simple` 返回 200
- [ ] `/api/health` 返回 200
- [ ] `/api/auth/register` 可以注册新用户
- [ ] `/api/auth/login` 可以登录

---

## 🎯 推荐行动计划

### 立即执行（今天）
1. ✅ 实施**方案 A（esbuild 打包）**
2. ✅ 添加详细日志到 `api/index.ts`
3. ✅ 创建 `api/test-simple.ts` 测试端点
4. ✅ 清除 Vercel 缓存并重新部署
5. ✅ 验证所有 API 端点

### 短期优化（本周）
1. 添加健康检查监控
2. 配置错误告警
3. 优化数据库连接池
4. 添加 API 性能监控

### 长期改进（本月）
1. 考虑迁移到**方案 C（分离部署）**
2. 实施 CI/CD 自动化测试
3. 添加 E2E 测试覆盖
4. 优化 Serverless Function 冷启动时间

---

## 📞 技术支持资源

- **Vercel 文档**: https://vercel.com/docs/functions/serverless-functions
- **Prisma Vercel 指南**: https://www.prisma.io/docs/guides/deployment/deploying-to-vercel
- **Node.js ES Modules**: https://nodejs.org/api/esm.html
- **esbuild 文档**: https://esbuild.github.io/

---

**报告生成时间**: 2026-02-07  
**诊断人员**: DevOps 专家技能  
**优先级**: P0 - 阻塞性问题  
**预计修复时间**: 2-4 小时
