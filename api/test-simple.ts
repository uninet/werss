export default function handler(req, res) {
  res.status(200).json({
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      VERCEL: process.env.VERCEL || 'NOT SET'
    },
    request: {
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers)
    }
  });
}
