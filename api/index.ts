import serverless from 'serverless-http';
import express from 'express';

// 创建一个包装函数来处理异步导入
async function createHandler() {
  try {
    // 尝试导入后端应用
    const module = await import('./backend-dist/index.js');
    const app = module.default;
    console.log('[API] Backend app loaded successfully');
    return serverless(app);
  } catch (error) {
    console.error('[API] Failed to load backend app:', error);
    
    // 创建错误处理应用
    const errorApp = express();
    errorApp.use((req, res) => {
      res.status(500).json({
        error: 'Backend initialization failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    });
    
    return serverless(errorApp);
  }
}

// 导出处理器
let handlerPromise = null;

export default async function handler(req, res) {
  if (!handlerPromise) {
    handlerPromise = createHandler();
  }
  
  const serverlessHandler = await handlerPromise;
  return serverlessHandler(req, res);
}
