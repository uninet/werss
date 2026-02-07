import serverless from 'serverless-http';

// 动态导入以捕获错误
let app;
try {
  const module = await import('./backend-dist/index.js');
  app = module.default;
  console.log('[API] Backend app loaded successfully');
} catch (error) {
  console.error('[API] Failed to load backend app:', error);
  // 创建一个简单的错误处理应用
  const express = await import('express');
  app = express.default();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Backend initialization failed',
      message: error.message,
      stack: error.stack
    });
  });
}

// Vercel Serverless Function handler
const handler = serverless(app);

export default handler;
