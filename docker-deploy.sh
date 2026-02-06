#!/bin/bash

# AI Tracker Docker 一键部署脚本

set -e

echo "=================================="
echo "  AI Tracker Docker 部署"
echo "=================================="
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    echo "   访问: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    echo "   请安装 Docker Desktop 或 docker-compose"
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  .env 文件不存在"
    echo "   正在创建 .env 文件..."
    cp backend/.env.example .env
    echo "   ✅ 已创建 .env 文件"
    echo ""
    echo "   请编辑 .env 文件，配置以下变量："
    echo "   - DATABASE_URL (必需)"
    echo "   - JWT_SECRET (必需)"
    echo ""
    read -p "   按回车继续（确保已配置 .env）..."
fi

# 检查必需的环境变量
source .env 2>/dev/null || true

if [ -z "$DATABASE_URL" ]; then
    echo "❌ .env 中缺少 DATABASE_URL"
    echo "   请配置数据库连接字符串"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ .env 中缺少 JWT_SECRET"
    echo "   请配置 JWT 密钥"
    exit 1
fi

echo ""
echo "✅ 环境检查通过"
echo ""

# 构建并启动
echo "🚀 开始构建 Docker 镜像..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "✅ 部署完成！"
echo ""
echo "   应用地址: http://localhost:3000"
echo "   健康检查: http://localhost:3000/health"
echo ""
echo "常用命令:"
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo ""
echo "详细文档请查看: DOCKER_DEPLOY.md"
