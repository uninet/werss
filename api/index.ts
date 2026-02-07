import serverless from 'serverless-http';

// 创建一个包装函数来处理异步导入
async function createHandler() {
  console.log('[API] Starting handler creation...');
  console.log('[API] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
  });
  
  try {
    // 导入后端应用（使用 TypeScript 编译后的文件）
    console.log('[API] Importing backend app...');
    const module = await import('./backend-dist/dist/index.js');
    const app = module.default;
    console.log('[API] Backend app loaded successfully');
    return serverless(app);
  } catch (error) {
    console.error('[API] Failed to load backend app:', error);
    console.error('[API] Error stack:', error.stack);
    throw error;
  }
}

// 导出处理器
let handlerPromise = null;

export default async function handler(req, res) {
  console.log('[API] Request:', req.method, req.url);
  
  try {
    if (!handlerPromise) {
      console.log('[API] Creating new handler instance...');
      handlerPromise = createHandler();
    }
    
    const serverlessHandler = await handlerPromise;
    console.log('[API] Handler ready, processing request');
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('[API] Handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
