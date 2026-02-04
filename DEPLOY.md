# AI Tracker 部署指南

## 国内部署方案推荐

### 方案一：阿里云 ECS（推荐，免费3个月）

#### 1. 注册账号
- 访问：https://www.aliyun.com/product/ecs
- 完成实名认证

#### 2. 领取免费试用
- 进入"免费试用"页面
- 选择"云服务器 ECS"
- 推荐配置：2核4G，CentOS 7.9 或 Ubuntu 22.04

#### 3. 连接服务器
```bash
ssh root@你的服务器IP
```

#### 4. 一键部署
```bash
# 安装 git
yum install -y git  # CentOS
# 或
apt-get update && apt-get install -y git  # Ubuntu

# 克隆代码
git clone https://github.com/yourusername/ai-tracker.git
cd ai-tracker

# 运行部署脚本
./deploy.sh
```

#### 5. 访问应用
- 打开浏览器访问：`http://你的服务器IP:3000`
- 首次使用需要注册账号

---

### 方案二：腾讯云轻量应用服务器（学生9元/月）

#### 1. 注册账号
- 访问：https://cloud.tencent.com/act/campus
- 完成学生认证

#### 2. 购买服务器
- 选择轻量应用服务器
- 新用户首单约9元/月

#### 3. 部署步骤
与阿里云相同，使用 `deploy.sh` 脚本一键部署

---

### 方案三：华为云（免费6个月）

#### 1. 注册账号
- 访问：https://activity.huaweicloud.com/free_test/index.html
- 领取最长6个月免费试用

---

## 手动部署（无 Docker 环境）

如果服务器没有 Docker，可以手动部署：

### 1. 安装 Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. 部署后端
```bash
cd backend
npm ci
npm run build
npm start
```

### 3. 部署前端
```bash
cd frontend
npm ci
npm run build
# 将 dist 目录复制到后端 public 文件夹
cp -r dist ../backend/public
```

### 4. 使用 PM2 守护进程
```bash
npm install -g pm2
cd backend
pm2 start dist/index.js --name ai-tracker
pm2 startup
pm2 save
```

---

## 配置说明

### 环境变量
创建 `.env` 文件：
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-here
DATABASE_PATH=/app/database/tracker.db
CRON_ENABLED=true
```

### Nginx 反向代理（推荐）
如果需要使用域名和 HTTPS，配置 Nginx：

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

## 常见问题

### 1. 防火墙设置
确保开放 3000 端口：
```bash
# CentOS
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# Ubuntu
ufw allow 3000
```

### 2. 阿里云安全组
- 进入 ECS 控制台
- 配置安全组规则
- 添加 3000 端口入站规则

### 3. 数据备份
数据库文件位于 `./data/tracker.db`，建议定期备份：
```bash
cp data/tracker.db backup/tracker-$(date +%Y%m%d).db
```

---

## 更新部署

```bash
cd ai-tracker
git pull
docker-compose down
docker-compose up -d --build
```
