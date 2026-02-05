#!/bin/bash
# Vercel 构建测试脚本
# 用于在本地模拟 Vercel 构建过程

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Vercel 构建测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查环境
echo -e "${YELLOW}[1/5] 检查环境...${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm 版本: $(npm -v)${NC}"

# 检查 vercel.json
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ vercel.json 文件不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✓ vercel.json 存在${NC}"

# 检查必需的环境变量
echo ""
echo -e "${YELLOW}[2/5] 检查环境变量...${NC}"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL 未设置（将在 Vercel 中配置）${NC}"
else
    echo -e "${GREEN}✓ DATABASE_URL 已设置${NC}"
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}⚠️  JWT_SECRET 未设置（将在 Vercel 中配置）${NC}"
else
    echo -e "${GREEN}✓ JWT_SECRET 已设置${NC}"
fi

# 清理旧的构建文件
echo ""
echo -e "${YELLOW}[3/5] 清理旧的构建文件...${NC}"

rm -rf backend/dist
rm -rf frontend/dist
echo -e "${GREEN}✓ 已清理旧的构建文件${NC}"

# 安装依赖
echo ""
echo -e "${YELLOW}[4/5] 安装依赖...${NC}"

npm install
echo -e "${GREEN}✓ 根目录依赖安装完成${NC}"

# 构建
echo ""
echo -e "${YELLOW}[5/5] 执行构建...${NC}"

NODE_ENV=production npm run vercel-build

# 检查构建结果
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    构建结果检查${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查后端构建
if [ -d "backend/dist" ]; then
    echo -e "${GREEN}✓ 后端构建成功${NC}"
    echo "  后端构建文件:"
    ls -lh backend/dist | head -10
else
    echo -e "${RED}❌ 后端构建失败${NC}"
    exit 1
fi

echo ""

# 检查前端构建
if [ -d "frontend/dist" ]; then
    echo -e "${GREEN}✓ 前端构建成功${NC}"
    echo "  前端构建文件:"
    ls -lh frontend/dist | head -10
else
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi

# 检查 API 入口
echo ""
if [ -f "api/index.ts" ]; then
    echo -e "${GREEN}✓ API 入口文件存在${NC}"
else
    echo -e "${RED}❌ API 入口文件不存在${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 所有检查通过！可以部署到 Vercel${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "下一步:"
echo "1. 在 Vercel 控制台创建项目"
echo "2. 连接 Git 仓库"
echo "3. 配置环境变量"
echo "4. 推送代码触发部署"
echo ""
echo "详细步骤请查看: VERCEL_DEPLOYMENT_CHECKLIST.md"
