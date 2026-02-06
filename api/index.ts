import serverless from 'serverless-http';
import { createServer } from 'http';
import app from './backend-dist/index.js';

// Vercel Serverless Function handler
const handler = serverless(app, {
  request: (request: any) => {
    // Vercel 的 rewrite 会去掉 /api 前缀
    // 但 Express 路由定义时使用了 /api 前缀
    // 需要在这里重新添加 /api 前缀
    const url = request.url || '';
    const path = url.split('?')[0];
    
    // 如果路径不以 /api 开头且不是静态资源，添加 /api 前缀
    if (!path.startsWith('/api') && !path.startsWith('/_next') && !path.includes('.')) {
      request.url = `/api${url}`;
    }
    
    return request;
  }
});

export default handler;