#!/bin/bash

# AI Tracker 部署脚本
# 适用于阿里云 ECS、腾讯云等国内云服务器

set -e

echo "🚀 开始部署 AI Tracker..."

# 检查是否安装了 Docker
if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "✅ Docker 安装完成，请重新登录以应用权限更改"
    exit 0
fi

# 检查是否安装了 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
fi

# 创建数据目录
mkdir -p data

# 生成随机 JWT Secret
if [ ! -f .env ]; then
    echo "🔑 生成环境变量配置..."
    JWT_SECRET=$(openssl rand -base64 32)
    cat > .env << EOF
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=3000
EOF
    echo "✅ 环境变量配置已生成"
fi

# 构建并启动容器
echo "🏗️ 构建 Docker 镜像..."
docker-compose build --no-cache

echo "🚀 启动服务..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 部署成功！"
    echo ""
    echo "📱 访问地址: http://$(curl -s ifconfig.me):3000"
    echo "🔧 管理命令:"
    echo "   - 查看日志: docker-compose logs -f"
    echo "   - 停止服务: docker-compose down"
    echo "   - 重启服务: docker-compose restart"
else
    echo "❌ 服务启动失败，请检查日志: docker-compose logs"
    exit 1
fi
