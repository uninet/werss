// 最小化测试 - 只导入 express，不导入后端应用
import express from 'express';

const app = express();

app.get('/api/simple-test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Simple Express app works',
    timestamp: new Date().toISOString()
  });
});

// 不使用 serverless-http，直接导出
export default async function handler(req, res) {
  return app(req, res);
}
