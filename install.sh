#!/bin/bash

# AI Tracker 安装脚本
set -e

echo "🚀 安装 AI Tracker..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未安装 Node.js"
    echo "请访问 https://nodejs.org/ 下载安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误：Node.js 版本需要 >= 18，当前版本：$(node -v)"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未安装 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 安装后端依赖
echo ""
echo "📦 安装后端依赖..."
cd backend
npm install
cd ..

# 安装前端依赖
echo ""
echo "🎨 安装前端依赖..."
cd frontend
npm install
cd ..

# 创建数据目录
echo ""
echo "📁 创建数据目录..."
mkdir -p backend/data

# 复制环境变量文件
echo ""
echo "⚙️ 配置环境变量..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ 已创建 backend/.env 文件"
    echo "⚠️  请编辑 backend/.env 文件配置您的邮件服务"
else
    echo "✅ backend/.env 文件已存在"
fi

# 赋予脚本执行权限
echo ""
echo "🔧 设置脚本权限..."
chmod +x start.sh

echo ""
echo "=========================================="
echo "🎉 安装完成！"
echo ""
echo "使用步骤："
echo "1. 编辑 backend/.env 文件，配置邮件服务"
echo "2. 运行 ./start.sh 启动服务"
echo "3. 访问 http://localhost:5173 使用系统"
echo ""
echo "默认配置："
echo "- 后端 API: http://localhost:3000"
echo "- 前端界面: http://localhost:5173"
echo "=========================================="
