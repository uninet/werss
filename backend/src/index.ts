import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// import { schedulerService } from './services/scheduler.js';
import { errorHandler } from './utils/errors.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

if (process.env.VERCEL === '1') {
  console.log('[Vercel] Running in Vercel environment');
}

// 导入路由
import bloggersRouter from './routes/bloggers.js';
import contentsRouter from './routes/contents.js';
import schedulerRouter from './routes/scheduler.js';
import statsRouter from './routes/stats.js';
import rssMarketRouter from './routes/rss-market.js';
import configRouter from './routes/config.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false,
}));

// CORS 配置
if (isDevelopment) {
  app.use(cors({ origin: '*' }));
} else {
  app.use(cors({ origin: true, credentials: true }));
}

// 限流
const limiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 100,
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});
app.use(limiter);

// 初始化JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
const apiPrefix = '/api';

app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/bloggers`, bloggersRouter);
app.use(`${apiPrefix}/contents`, contentsRouter);
app.use(`${apiPrefix}/scheduler`, schedulerRouter);
app.use(`${apiPrefix}/stats`, statsRouter);
app.use(`${apiPrefix}/rss-market`, rssMarketRouter);
app.use(`${apiPrefix}/config`, configRouter);

// 404处理 - 放在所有路由之后、错误处理之前
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 生产环境：提供静态文件服务
if (!isDevelopment) {
  const publicPath = path.join(__dirname, '../public');
  app.use(express.static(publicPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// 启动服务器
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${isDevelopment ? 'development' : 'production'}`);

    // 启动调度器
    // schedulerService.start();
  });
}

export default app;
