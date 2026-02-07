#!/bin/bash

# 前端配置脚本
# 用于配置前端连接到 Railway 后端

echo "🚀 前端配置脚本"
echo "================="
echo ""

# 检查是否提供了 Railway URL
if [ -z "$1" ]; then
    echo "❌ 错误：请提供 Railway 后端 URL"
    echo ""
    echo "用法："
    echo "  bash configure-frontend.sh <railway-url>"
    echo ""
    echo "示例："
    echo "  bash configure-frontend.sh werss-backend-production.up.railway.app"
    echo ""
    exit 1
fi

RAILWAY_URL=$1

# 移除可能的 https:// 前缀
RAILWAY_URL=${RAILWAY_URL#https://}
RAILWAY_URL=${RAILWAY_URL#http://}

echo "📝 配置信息："
echo "  Railway URL: https://$RAILWAY_URL"
echo "  API Base URL: https://$RAILWAY_URL/api"
echo ""

# 创建前端环境变量文件
echo "✅ 创建 frontend/.env.production 文件..."
cat > frontend/.env.production << EOF
# 生产环境配置
# Railway 后端 API 地址
VITE_API_BASE_URL=https://$RAILWAY_URL/api
EOF

echo "✅ 文件创建成功！"
echo ""

# 显示文件内容
echo "📄 文件内容："
cat frontend/.env.production
echo ""

# 测试后端连接
echo "🔍 测试后端连接..."
if command -v curl &> /dev/null; then
    echo "  测试健康检查端点..."
    if curl -s -f "https://$RAILWAY_URL/health" > /dev/null; then
        echo "  ✅ 后端连接成功！"
        echo ""
        echo "  后端响应："
        curl -s "https://$RAILWAY_URL/health" | jq . 2>/dev/null || curl -s "https://$RAILWAY_URL/health"
    else
        echo "  ⚠️  无法连接到后端，请检查："
        echo "     1. Railway URL 是否正确"
        echo "     2. Railway 后端是否已成功部署"
        echo "     3. 后端服务是否正在运行"
    fi
else
    echo "  ⚠️  未安装 curl，跳过连接测试"
fi

echo ""
echo "📦 下一步："
echo "  1. 提交更改到 Git："
echo "     git add frontend/.env.production"
echo "     git commit -m 'Config: 配置前端连接到 Railway 后端'"
echo "     git push origin main"
echo ""
echo "  2. 等待 Vercel 自动重新部署（约 1-2 分钟）"
echo ""
echo "  3. 访问 https://werss.vercel.app 测试功能"
echo ""
echo "✨ 配置完成！"
