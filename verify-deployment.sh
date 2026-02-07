#!/bin/bash

# 部署验证脚本
# 用于验证 Railway 后端和 Vercel 前端是否正常工作

echo "🔍 部署验证脚本"
echo "================="
echo ""

# 检查是否提供了 Railway URL
if [ -z "$1" ]; then
    echo "❌ 错误：请提供 Railway 后端 URL"
    echo ""
    echo "用法："
    echo "  bash verify-deployment.sh <railway-url>"
    echo ""
    echo "示例："
    echo "  bash verify-deployment.sh werss-backend-production.up.railway.app"
    echo ""
    exit 1
fi

RAILWAY_URL=$1
RAILWAY_URL=${RAILWAY_URL#https://}
RAILWAY_URL=${RAILWAY_URL#http://}

FRONTEND_URL="werss.vercel.app"

echo "📝 验证配置："
echo "  后端 URL: https://$RAILWAY_URL"
echo "  前端 URL: https://$FRONTEND_URL"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0

# 测试函数
test_endpoint() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "  测试 $name ... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ 通过${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ 失败${NC} (HTTP $http_code)"
        return 1
    fi
}

echo "🔍 第一步：验证后端部署"
echo "------------------------"

# 测试后端健康检查
test_endpoint "健康检查" "https://$RAILWAY_URL/health"

# 测试后端 API 路由
test_endpoint "API 路由可访问性" "https://$RAILWAY_URL/api/test-simple" || true

echo ""
echo "🔍 第二步：测试后端功能"
echo "------------------------"

# 测试注册功能
echo -n "  测试注册功能 ... "
RANDOM_USER="testuser$(date +%s)"
register_response=$(curl -s -w "\n%{http_code}" -X POST "https://$RAILWAY_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$RANDOM_USER\",\"password\":\"test123456\"}" 2>/dev/null)

register_code=$(echo "$register_response" | tail -n1)
register_body=$(echo "$register_response" | sed '$d')

if [ "$register_code" = "201" ] || [ "$register_code" = "200" ]; then
    echo -e "${GREEN}✅ 通过${NC} (HTTP $register_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    
    # 提取 token
    TOKEN=$(echo "$register_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo "    ✓ Token 已生成"
        
        # 测试登录功能
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        echo -n "  测试登录功能 ... "
        login_response=$(curl -s -w "\n%{http_code}" -X POST "https://$RAILWAY_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$RANDOM_USER\",\"password\":\"test123456\"}" 2>/dev/null)
        
        login_code=$(echo "$login_response" | tail -n1)
        
        if [ "$login_code" = "200" ]; then
            echo -e "${GREEN}✅ 通过${NC} (HTTP $login_code)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ 失败${NC} (HTTP $login_code)"
        fi
    fi
else
    echo -e "${RED}❌ 失败${NC} (HTTP $register_code)"
    echo "    响应: $register_body"
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "🔍 第三步：验证前端部署"
echo "------------------------"

# 测试前端可访问性
test_endpoint "前端页面" "https://$FRONTEND_URL"

echo ""
echo "📊 测试结果总结"
echo "================="
echo "  总测试数: $TOTAL_TESTS"
echo "  通过: $PASSED_TESTS"
echo "  失败: $((TOTAL_TESTS - PASSED_TESTS))"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 所有测试通过！部署成功！${NC}"
    echo ""
    echo "✅ 后端已成功部署到 Railway"
    echo "✅ 前端已成功部署到 Vercel"
    echo "✅ 注册和登录功能正常工作"
    echo ""
    echo "🌐 访问你的应用："
    echo "   https://$FRONTEND_URL"
    exit 0
elif [ $PASSED_TESTS -gt $((TOTAL_TESTS / 2)) ]; then
    echo -e "${YELLOW}⚠️  部分测试通过，但仍有问题需要解决${NC}"
    exit 1
else
    echo -e "${RED}❌ 大部分测试失败，请检查部署配置${NC}"
    echo ""
    echo "🔧 故障排查建议："
    echo "  1. 检查 Railway 部署日志"
    echo "  2. 确认环境变量已正确配置"
    echo "  3. 验证数据库连接"
    echo "  4. 查看 RAILWAY_TROUBLESHOOTING.md"
    exit 1
fi
