# Vercel 部署最终修复方案

经过多次尝试，发现核心问题：**Prisma Client 在 esbuild 打包环境下无法正常工作**

## 🎯 最终解决方案：回退到 TypeScript 编译 + 完整依赖复制

### 为什么 esbuild 方案失败？

1. Prisma Client 是动态生成的，包含原生二进制文件
2. esbuild 打包会破坏 Prisma 的模块结构
3. `--external` 参数虽然排除了打包，但模块解析路径仍然有问题

### 推荐方案：使用完整的 backend 构建

修改 `build.sh`:
```bash
#!/bin/bash
set -e

echo "=== Starting Vercel Build ==="

# 1. Build backend with TypeScript
echo "Step 1: Building backend with TypeScript..."
cd backend
rm -rf dist
npm ci
npx prisma generate
npx tsc

# 2. Copy entire backend to API directory
echo "Step 2: Copying backend to API..."
cd ..
rm -rf api/backend-dist
cp -r backend api/backend-dist

# 3. Build frontend
echo "Step 3: Building frontend..."
cd frontend
npm install
npx vite build

echo "=== Build Complete ==="
```

### 修改 `api/index.ts`:
```typescript
import serverless from 'serverless-http';

async function createHandler() {
  try {
    const module = await import('./backend-dist/dist/index.js');
    const app = module.default;
    return serverless(app);
  } catch (error) {
    console.error('[API] Failed:', error);
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

## ⚠️ 注意事项

这个方案会：
- 增加部署包大小（包含完整的 backend 目录）
- 但能确保 Prisma Client 正常工作
- 所有模块导入路径都是正确的

## 🔄 替代方案：分离部署

如果上述方案仍有问题，强烈建议：

1. **后端部署到 Railway/Render**
2. **前端继续使用 Vercel**
3. **修改前端 API baseURL** 指向独立后端

这是最稳定的解决方案。
