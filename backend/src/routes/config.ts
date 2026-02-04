import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const CONFIG_FILE = path.join(process.cwd(), 'config.json');

// 默认配置
const defaultConfig = {
  smtp_host: process.env.SMTP_HOST || 'smtp.126.com',
  smtp_port: process.env.SMTP_PORT || '465',
  smtp_user: process.env.SMTP_USER || '',
  smtp_pass: process.env.SMTP_PASS || '',
  email_to: process.env.EMAIL_TO || 'fonto@sina.com',
  smtp_secure: process.env.SMTP_SECURE === 'true' || true
};

// 获取配置
router.get('/', (req, res) => {
  try {
    let config = defaultConfig;
    
    // 如果配置文件存在，读取它
    if (fs.existsSync(CONFIG_FILE)) {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      config = { ...config, ...fileConfig };
    }
    
    // 不返回密码
    const { smtp_pass, ...safeConfig } = config;
    
    res.json({
      success: true,
      data: safeConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取配置失败'
    });
  }
});

// 保存配置
router.post('/', (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_pass, email_to, smtp_secure } = req.body;
    
    // 读取现有配置
    let config = defaultConfig;
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
    
    // 更新配置
    const newConfig = {
      ...config,
      ...(smtp_host !== undefined && { smtp_host }),
      ...(smtp_port !== undefined && { smtp_port }),
      ...(smtp_user !== undefined && { smtp_user }),
      ...(smtp_pass !== undefined && { smtp_pass }),
      ...(email_to !== undefined && { email_to }),
      ...(smtp_secure !== undefined && { smtp_secure })
    };
    
    // 保存到文件
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    
    // 更新环境变量
    if (smtp_host) process.env.SMTP_HOST = smtp_host;
    if (smtp_port) process.env.SMTP_PORT = smtp_port;
    if (smtp_user) process.env.SMTP_USER = smtp_user;
    if (smtp_pass) process.env.SMTP_PASS = smtp_pass;
    if (email_to) process.env.EMAIL_TO = email_to;
    if (smtp_secure !== undefined) process.env.SMTP_SECURE = String(smtp_secure);
    
    // 不返回密码
    const { smtp_pass: _, ...safeConfig } = newConfig;
    
    res.json({
      success: true,
      message: '配置已保存',
      data: safeConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '保存配置失败'
    });
  }
});

export default router;
