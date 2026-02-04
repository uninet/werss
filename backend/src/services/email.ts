import nodemailer from 'nodemailer';
import prisma from '../models/prisma';
import type { Content, Blogger } from '../types';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      console.log('[EmailService] Creating transporter with config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        to: process.env.EMAIL_TO
      });

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    return this.transporter;
  }

  async sendDailySummary(contents: Content[]): Promise<boolean> {
    try {
      if (contents.length === 0) {
        console.log('No new contents to send');
        return true;
      }

      const today = new Date().toLocaleDateString('zh-CN');
      const subject = `📬 AI博主每日更新 - ${today}`;
      
      const html = await this.generateEmailTemplate(contents);
      
      const result = await this.getTransporter().sendMail({
        from: `"AI Tracker" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
        subject,
        html
      });

      // 记录发送日志
      await this.logEmailSend('success', contents.length);
      
      // 标记内容为已通知
      await this.markContentsAsNotified(contents.map(c => c.id));

      console.log(`✅ Daily summary sent: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      await this.logEmailSend('failed', contents.length, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  private async generateEmailTemplate(contents: Content[]): Promise<string> {
    const today = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    // 按博主分组
    const groupedByBlogger = await this.groupContentsByBlogger(contents);

    let contentHtml = '';
    for (const [bloggerName, items] of Object.entries(groupedByBlogger)) {
      contentHtml += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            📌 ${bloggerName}
          </h2>
          <div style="margin-left: 10px;">
      `;

      for (const content of items) {
        const time = content.published_at 
          ? new Date(content.published_at).toLocaleString('zh-CN')
          : '未知时间';

        contentHtml += `
          <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #2196F3;">
              <a href="${content.url}" style="text-decoration: none; color: #2196F3;">
                ${content.title}
              </a>
            </h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
              🕐 ${time}
            </p>
            ${content.content ? `
              <p style="margin: 10px 0 0 0; color: #444; line-height: 1.6;">
                ${this.truncateText(content.content, 200)}
              </p>
            ` : ''}
          </div>
        `;
      }

      contentHtml += `
          </div>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI博主每日更新</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🤖 AI博主监测日报</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${today}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
            今日共 ${contents.length} 条更新
          </p>
        </div>

        ${contentHtml}

        <div style="margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center; color: #666; font-size: 14px;">
          <p>📧 此邮件由 AI Tracker 自动发送</p>
          <p>🔄 每天上午9点推送最新内容</p>
          <p style="margin-top: 15px;">
            <a href="#" style="color: #667eea; text-decoration: none;">管理订阅</a> | 
            <a href="#" style="color: #667eea; text-decoration: none;">查看历史</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private async groupContentsByBlogger(contents: Content[]): Promise<Record<string, Content[]>> {
    const grouped: Record<string, Content[]> = {};
    const bloggerIds = [...new Set(contents.map(c => c.blogger_id))];
    
    try {
      const bloggers = await prisma.blogger.findMany({
        where: { id: { in: bloggerIds } },
        select: { id: true, name: true }
      });
      
      const bloggerMap = new Map(bloggers.map(b => [b.id, b.name]));

      for (const content of contents) {
        const bloggerName = bloggerMap.get(content.blogger_id) || '未知博主';
        if (!grouped[bloggerName]) {
          grouped[bloggerName] = [];
        }
        grouped[bloggerName].push(content);
      }
    } catch (error) {
      console.error('[EmailService] Error fetching bloggers:', error);
      // Fallback: Group by ID or Unknown
      for (const content of contents) {
        const key = `Blogger #${content.blogger_id}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(content);
      }
    }

    return grouped;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private async logEmailSend(status: 'success' | 'failed', contentCount: number, errorMessage?: string): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: {
          sendDate: new Date(),
          contentCount,
          status,
          errorMessage
        }
      });
    } catch (error) {
      console.error('[EmailService] Error logging email:', error);
    }
  }

  private async markContentsAsNotified(contentIds: number[]): Promise<void> {
    if (contentIds.length === 0) return;

    try {
      await prisma.content.updateMany({
        where: { id: { in: contentIds } },
        data: { isNotified: true }
      });
    } catch (error) {
      console.error('[EmailService] Error marking contents as notified:', error);
    }
  }

  async sendTestEmail(): Promise<boolean> {
    try {
      const result = await this.getTransporter().sendMail({
        from: `"AI Tracker" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
        subject: '📧 AI Tracker 测试邮件',
        html: `
          <div style="font-family: sans-serif; padding: 20px; text-align: center;">
            <h1>✅ 邮件服务配置成功</h1>
            <p>您的 AI Tracker 邮件服务已正确配置！</p>
            <p>您将每天收到 AI 博主的更新汇总。</p>
          </div>
        `
      });

      console.log(`✅ Test email sent: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }

  async getUnnotifiedContents(): Promise<Content[]> {
    try {
      const contents = await prisma.content.findMany({
        where: { isNotified: false },
        include: { blogger: true },
        orderBy: { publishedAt: 'desc' }
      });

      return contents.map(c => ({
        id: c.id,
        blogger_id: c.bloggerId,
        title: c.title,
        content: c.content || undefined,
        url: c.url,
        published_at: c.publishedAt ? c.publishedAt.toISOString() : undefined,
        fetched_at: c.fetchedAt.toISOString(),
        is_notified: c.isNotified ? 1 : 0,
        blogger: c.blogger ? {
          id: c.blogger.id,
          name: c.blogger.name,
          type: c.blogger.type as any,
          url: c.blogger.url,
          avatar: c.blogger.avatar || undefined,
          description: c.blogger.description || undefined,
          is_active: c.blogger.isActive ? 1 : 0,
          created_at: c.blogger.createdAt.toISOString(),
          updated_at: c.blogger.updatedAt.toISOString()
        } : undefined
      }));
    } catch (error) {
      console.error('[EmailService] Error getting unnotified contents:', error);
      return [];
    }
  }
}

export const emailService = new EmailService();
