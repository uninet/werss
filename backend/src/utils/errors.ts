import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string> = {}) {
    super(message, 400, true);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}不存在`, 404, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '禁止访问') {
    super(message, 403, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409, true);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors })
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
};

// 异步处理函数类型
type AsyncRequestHandler = (req: Request, res: Response, next?: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
