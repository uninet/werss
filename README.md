# 🤖 AI Tracker - AI博主监测工具

监测最热门的 AI 相关微信公众号和 GitHub 博主更新，每日自动整理内容概览并发送邮件通知。

## ✨ 功能特性

- 📡 **多平台监测**：支持 GitHub 用户和微信公众号
- 📧 **邮件推送**：每日自动发送内容概览到指定邮箱
- 🎨 **精美界面**：Vue 3 + Tailwind CSS 构建的现代化管理界面
- ⏰ **定时任务**：可配置的定时爬取和邮件发送
- 📊 **数据统计**：博主活跃度、内容统计、邮件发送记录
- 🔍 **内容管理**：查看、标记已读、批量操作
- ⚙️ **灵活配置**：SMTP 邮件服务配置、定时规则设置

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd ai-tracker

# 运行安装脚本
./install.sh
```

### 配置

编辑 `backend/.env` 文件，配置您的邮件服务：

```env
# 邮件配置（以 126 邮箱为例）
SMTP_HOST=smtp.126.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@126.com
SMTP_PASS=your_auth_code
EMAIL_TO=your_email@example.com

# 可选：GitHub Token（提高 API 限流）
GITHUB_TOKEN=your_github_token
```

### 启动

**方式一：本地开发**

```bash
./start.sh
```

访问 http://localhost:5173 使用系统。

**方式二：Docker 部署（推荐）**

```bash
# 一键部署
./docker-deploy.sh

# 或手动部署
docker-compose up -d --build
```

访问 http://localhost:3000 使用系统。

详细部署文档请查看 [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)

## 📁 项目结构

```
ai-tracker/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── index.ts      # 入口文件
│   │   ├── models/       # 数据库模型
│   │   ├── routes/       # API 路由
│   │   └── services/     # 业务服务
│   ├── data/             # SQLite 数据库
│   └── package.json
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── api/          # API 接口
│   │   └── router/       # 路由配置
│   └── package.json
├── start.sh              # 启动脚本
├── install.sh            # 安装脚本
└── README.md
```

## 🔌 API 接口

### 博主管理
- `GET /api/bloggers` - 获取博主列表
- `POST /api/bloggers` - 添加博主
- `PUT /api/bloggers/:id` - 更新博主
- `DELETE /api/bloggers/:id` - 删除博主

### 内容管理
- `GET /api/contents` - 获取内容列表
- `POST /api/contents/:id/mark-read` - 标记已读

### 调度器
- `GET /api/scheduler/status` - 获取状态
- `POST /api/scheduler/crawl` - 手动爬取
- `POST /api/scheduler/send-email` - 手动发送邮件
- `POST /api/scheduler/test-email` - 发送测试邮件

### 统计
- `GET /api/stats` - 获取统计数据
- `GET /api/stats/daily-summary` - 获取每日汇总

## ⚙️ 配置说明

### 邮件服务配置

支持主流邮箱服务商：

| 服务商 | SMTP_HOST | SMTP_PORT | SMTP_SECURE |
|--------|-----------|-----------|-------------|
| 126 邮箱 | smtp.126.com | 465 | true |
| 163 邮箱 | smtp.163.com | 465 | true |
| QQ 邮箱 | smtp.qq.com | 465 | true |
| Gmail | smtp.gmail.com | 587 | false |

### 定时规则

使用 cron 表达式配置定时任务，默认每天早上 9 点：

```env
CRON_SCHEDULE=0 9 * * *
```

常用规则：
- `0 9 * * *` - 每天上午 9 点
- `0 */6 * * *` - 每 6 小时
- `0 9,18 * * *` - 每天上午 9 点和下午 6 点

## 📝 使用指南

### 1. 添加博主

进入「博主管理」页面，点击「添加博主」：

- **GitHub**：输入用户主页链接，如 `https://github.com/ruanyf`
- **微信公众号**：输入公众号 ID（需配合第三方服务）

### 2. 运行爬取

- 自动：系统按配置的定时规则自动爬取
- 手动：在首页点击「手动爬取」按钮

### 3. 查看内容

在「内容列表」页面查看所有监测到的更新，支持：
- 按类型筛选（GitHub/微信公众号）
- 按状态筛选（已读/未读）
- 标记已读
- 跳转到原文

### 4. 接收邮件

每日定时任务会自动发送内容概览到配置的邮箱。

## 🔧 开发

### 后端开发

```bash
cd backend
npm run dev
```

### 前端开发

```bash
cd frontend
npm run dev
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [node-cron](https://github.com/node-cron/node-cron)
