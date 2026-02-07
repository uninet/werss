import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 在 Serverless 环境中，不要在模块加载时连接数据库
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 移除自动连接测试，让 Prisma 在需要时自动连接
// async function testConnection() {
//   try {
//     await prisma.$connect();
//     console.log('✅ 数据库连接成功');
//   } catch (error) {
//     console.error('❌ 数据库连接失败:', error);
//     process.exit(1);
//   }
// }

export { prisma };
export default prisma;
