import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.js';

export interface ValidationRules {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'email' | 'url';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
    custom?: (value: any) => boolean | string;
  };
}

const validateField = (
  field: string,
  value: any,
  rules: ValidationRules[string]
): string | null => {
  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    return `${field} 是必填项`;
  }

  // Skip other validations if value is not provided and not required
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // Type validation
  if (rules.type) {
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          return `${field} 必须是字符串`;
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${field} 必须是数字`;
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${field} 必须是布尔值`;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return `${field} 必须是有效的邮箱地址`;
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          return `${field} 必须是有效的URL`;
        }
        break;
    }
  }

  // String length validation
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `${field} 最少需要 ${rules.minLength} 个字符`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${field} 最多只能有 ${rules.maxLength} 个字符`;
    }
  }

  // Number range validation
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `${field} 不能小于 ${rules.min}`;
    }
    if (rules.max !== undefined && value > rules.max) {
      return `${field} 不能大于 ${rules.max}`;
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return `${field} 格式不正确`;
  }

  // Enum validation
  if (rules.enum && !rules.enum.includes(value)) {
    return `${field} 必须是以下值之一: ${rules.enum.join(', ')}`;
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value);
    if (result !== true) {
      return typeof result === 'string' ? result : `${field} 验证失败`;
    }
  }

  return null;
};

export const validate = (rules: ValidationRules) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};
    const data = { ...req.body, ...req.params, ...req.query };

    for (const [field, fieldRules] of Object.entries(rules)) {
      const error = validateField(field, data[field], fieldRules);
      if (error) {
        errors[field] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      next(new ValidationError('请求参数验证失败', errors));
      return;
    }

    next();
  };
};

export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    next(new ValidationError('无效的ID', { id: 'ID 必须是正整数' }));
    return;
  }

  // Attach parsed ID to request
  (req as any).parsedId = id;
  next();
};

// Predefined validation rules
export const bloggerValidation = {
  create: validate({
    name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    type: {
      required: true,
      type: 'string',
      enum: ['wechat', 'github', 'rss', 'zhihu']
    },
    url: {
      required: true,
      type: 'string',
      custom: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return '必须是有效的URL';
        }
      }
    },
    avatar: { type: 'string' },
    description: { type: 'string', maxLength: 500 }
  }),
  update: validate({
    name: { type: 'string', minLength: 1, maxLength: 100 },
    url: {
      type: 'string',
      custom: (value: string) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return '必须是有效的URL';
        }
      }
    },
    avatar: { type: 'string' },
    description: { type: 'string', maxLength: 500 }
  })
};

export const contentValidation = {
  markReadBatch: validate({
    ids: {
      required: true,
      custom: (value: any) => {
        if (!Array.isArray(value)) {
          return '必须是数组';
        }
        if (value.length === 0) {
          return '数组不能为空';
        }
        if (!value.every(id => typeof id === 'number' && id > 0)) {
          return '数组中的每个元素必须是正整数';
        }
        return true;
      }
    }
  })
};

export const authValidation = {
  login: validate({
    username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 6, maxLength: 100 }
  }),
  register: validate({
    username: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/
    },
    password: { required: true, type: 'string', minLength: 6, maxLength: 100 }
  }),
  changePassword: validate({
    currentPassword: { required: true, type: 'string', minLength: 1 },
    newPassword: { required: true, type: 'string', minLength: 6, maxLength: 100 }
  })
};
