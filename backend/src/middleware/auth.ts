import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * JWT 认证中间件
 * 验证请求中的 token，并将用户信息附加到请求对象
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
      return;
    }

    // 检查 Bearer 格式
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: '认证令牌格式错误'
      });
      return;
    }

    const token = parts[1];

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    
    // 将用户信息附加到请求对象
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: '认证令牌已过期，请重新登录'
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: '认证失败'
    });
  }
};

/**
 * 可选认证中间件
 * 验证 token 但不强制要求，用于需要识别用户但允许匿名访问的场景
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      next();
      return;
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    // 可选认证失败不阻止请求
    next();
  }
};
