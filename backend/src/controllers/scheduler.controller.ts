import { Request, Response } from 'express';
import { schedulerService } from '../services/scheduler';
import { emailService } from '../services/email';

export const schedulerController = {
  // 获取调度器状态
  getStatus: async (req: Request, res: Response) => {
    try {
      const status = schedulerService.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取状态失败'
      });
    }
  },

  // 手动触发爬取
  crawl: async (req: Request, res: Response) => {
    try {
      const result = await schedulerService.runManualCrawl();
      res.json({
        success: result.success,
        message: result.message,
        data: { count: result.count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '爬取失败'
      });
    }
  },

  // 手动发送邮件
  sendEmail: async (req: Request, res: Response) => {
    try {
      const result = await schedulerService.sendManualEmail();
      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '发送失败'
      });
    }
  },

  // 发送测试邮件
  testEmail: async (req: Request, res: Response) => {
    try {
      const success = await emailService.sendTestEmail();
      res.json({
        success,
        message: success ? '测试邮件发送成功' : '测试邮件发送失败'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '发送失败'
      });
    }
  }
};
