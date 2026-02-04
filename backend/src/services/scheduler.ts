import cron from 'node-cron';
import { crawlerService } from './crawler';
import { emailService } from './email';

export class SchedulerService {
  private task: cron.ScheduledTask | null = null;

  start(): void {
    const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
    
    console.log(`🕐 Starting scheduler with cron: ${schedule}`);

    this.task = cron.schedule(schedule, async () => {
      console.log('⏰ Running scheduled task...');
      await this.runDailyTask();
    }, {
      scheduled: true,
      timezone: 'Asia/Shanghai'
    });

    console.log('✅ Scheduler started');
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      console.log('⏹️ Scheduler stopped');
    }
  }

  async runDailyTask(): Promise<void> {
    try {
      console.log('🚀 Starting daily crawling task...');

      // 1. 爬取所有活跃博主
      const results = await crawlerService.crawlAllActiveBloggers();
      
      // 2. 收集所有新内容
      const allNewContents = results.flatMap(r => r.contents);
      console.log(`📊 Found ${allNewContents.length} new contents`);

      // 3. 发送邮件汇总
      if (allNewContents.length > 0) {
        await emailService.sendDailySummary(allNewContents);
      } else {
        console.log('📭 No new contents to send');
      }

      console.log('✅ Daily task completed');
    } catch (error) {
      console.error('❌ Daily task failed:', error);
    }
  }

  async runManualCrawl(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const results = await crawlerService.crawlAllActiveBloggers();
      const allNewContents = results.flatMap(r => r.contents);
      
      return {
        success: true,
        message: `成功爬取 ${allNewContents.length} 条新内容`,
        count: allNewContents.length
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '爬取失败',
        count: 0
      };
    }
  }

  async sendManualEmail(): Promise<{ success: boolean; message: string }> {
    try {
      const contents = await emailService.getUnnotifiedContents();
      
      if (contents.length === 0) {
        return {
          success: false,
          message: '没有未发送的内容'
        };
      }

      const success = await emailService.sendDailySummary(contents);
      
      return {
        success,
        message: success ? '邮件发送成功' : '邮件发送失败'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '发送失败'
      };
    }
  }

  getStatus(): { running: boolean; schedule: string; nextRun: string | null } {
    return {
      running: this.task !== null,
      schedule: process.env.CRON_SCHEDULE || '0 9 * * *',
      nextRun: this.getNextRunTime()
    };
  }

  private getNextRunTime(): string | null {
    // 简化的下次运行时间计算
    const now = new Date();
    const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
    
    // 解析 cron 表达式 (简化处理，假设是每天固定时间)
    const parts = schedule.split(' ');
    if (parts.length === 5) {
      const hour = parseInt(parts[1]);
      const minute = parseInt(parts[0]);
      
      let nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      return nextRun.toISOString();
    }
    
    return null;
  }
}

export const schedulerService = new SchedulerService();
