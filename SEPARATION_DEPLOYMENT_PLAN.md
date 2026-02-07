# 分离部署实施计划

## 第一步：准备后端独立部署

### 1. 创建 Railway 配置文件

创建 `railway.json` 配置后端部署：
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. 修改后端启动脚本

确保后端可以独立运行，监听 Railway 提供的 PORT。

### 3. 配置 CORS

允许前端域名访问后端 API。

---

## 第二步：修改前端配置

### 1. 更新环境变量

修改 `frontend/.env.production`，指向 Railway 后端。

### 2. 简化 Vercel 配置

只构建和部署前端静态文件。

---

## 第三步：部署

### 1. 后端部署到 Railway
### 2. 前端重新部署到 Vercel
### 3. 测试功能

---

开始实施...
