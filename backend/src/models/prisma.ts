import { PrismaClient } from '@prisma/client';

// 根据环境选择配置
let prisma: PrismaClient;

// 检查是否在 Vercel 环境
if (process.env.VERCEL === '1') {
  // Vercel 环境 - 使用标准 PrismaClient
  // 数据库连接字符串通过环境变量 DATABASE_URL 自动读取
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // 本地或传统服务器环境
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
}

// 连接测试
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

// 导出 prisma 实例和测试函数
export { prisma, testConnection };
export default prisma;
