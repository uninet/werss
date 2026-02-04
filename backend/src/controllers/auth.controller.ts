import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../models/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export const authController = {
  // 注册用户
  register: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }

      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: '用户名长度应在3-20个字符之间' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: '密码长度至少为6个字符' });
      }

      // 检查用户名是否已存在
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ error: '用户名已存在' });
      }

      // 加密密码
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // 创建用户
      const newUser = await prisma.user.create({
        data: {
          username,
          password: passwordHash
        }
      });

      // 生成 JWT
      const token = jwt.sign(
        { userId: newUser.id, username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: newUser.id,
          username
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({ error: '注册失败，请稍后重试' });
    }
  },

  // 用户登录
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // 生成 JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({ error: '登录失败，请稍后重试' });
    }
  },

  // 获取当前用户信息
  getMe: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '未授权' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, createdAt: true }
      });

      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // Map response to match original (created_at)
      const responseUser = {
        id: user.id,
        username: user.username,
        created_at: user.createdAt
      };

      res.json({
        success: true,
        user: responseUser
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  },

  // 修改密码
  changePassword: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '未授权' });
      }
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: '当前密码和新密码不能为空' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: '新密码长度至少为6个字符' });
      }

      // 获取用户当前密码
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // 验证当前密码
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: '当前密码错误' });
      }

      // 加密新密码
      const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // 更新密码
      await prisma.user.update({
        where: { id: userId },
        data: { password: newPasswordHash }
      });

      res.json({ message: '密码修改成功' });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({ error: '修改密码失败，请稍后重试' });
    }
  }
};
