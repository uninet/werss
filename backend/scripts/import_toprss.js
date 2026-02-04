const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/tracker.db');
const FEEDS_PATH = process.argv[2] || '/tmp/feeds2.json';

// 分类映射：将原始分类映射到系统分类
const categoryMap = {
  '未分类': 'general',
  '博客': 'blog',
  '科技': 'tech',
  '新闻': 'news',
  '影音': 'media',
  '热榜': 'trending',
  '资讯': 'news',
  '技术': 'dev',
  '软件': 'software',
  '微博': 'social',
  '开发者': 'dev',
  '社区': 'community',
  '游戏': 'game',
  '杂志': 'magazine',
  '资源': 'resource',
  'B站': 'video',
  '播客': 'podcast'
};

// 获取图标
function getIcon(title, category) {
  const icons = {
    '知乎': '💬',
    '阮一峰': '👨‍💻',
    '联合早报': '📰',
    '少数派': '⚡',
    '爱范儿': '📱',
    'V2EX': '💻',
    '机核': '🎮',
    'Solidot': '🔬',
    '煎蛋': '🥚',
    '美团': '🍔',
    '酷壳': '🐚',
    '编程': '💻',
    '开源': '🔓',
    '微博': '📢',
    '哔哩': '📺',
    'B站': '📺',
    '视频': '🎬',
    '播客': '🎧',
    '游戏': '🎮',
    '新闻': '📰',
    '科技': '🔬',
    '博客': '📝',
    '热榜': '🔥',
    '资讯': '📢'
  };

  for (const [key, icon] of Object.entries(icons)) {
    if (title.includes(key)) return icon;
  }

  const categoryIcons = {
    'blog': '📝',
    'tech': '🔬',
    'news': '📰',
    'media': '🎬',
    'trending': '🔥',
    'dev': '💻',
    'software': '💿',
    'social': '👥',
    'community': '🏘️',
    'game': '🎮',
    'magazine': '📖',
    'resource': '📦',
    'video': '📺',
    'podcast': '🎧',
    'general': '📌'
  };

  return categoryIcons[categoryMap[category] || 'general'] || '📌';
}

async function importFeeds() {
  console.log('📥 开始导入 Top RSS 数据...');
  console.log(`📁 数据库路径: ${DB_PATH}`);
  console.log(`📄 数据文件: ${FEEDS_PATH}`);

  // 检查数据库文件
  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ 数据库文件不存在:', DB_PATH);
    console.log('💡 请先运行后端服务初始化数据库');
    process.exit(1);
  }

  // 读取 JSON 数据
  let feeds;
  try {
    const data = fs.readFileSync(FEEDS_PATH, 'utf-8');
    feeds = JSON.parse(data);
  } catch (error) {
    console.error('❌ 读取数据文件失败:', error.message);
    process.exit(1);
  }

  console.log(`📊 共读取到 ${feeds.length} 个 RSS 源`);

  // 连接数据库
  const db = new Database(DB_PATH);

  // 清空现有 RSS 市场数据（可选，如果要保留原有数据请注释掉）
  console.log('🗑️  清空现有 RSS 市场数据...');
  db.exec('DELETE FROM rss_market');

  // 准备插入语句
  const insertStmt = db.prepare(`
    INSERT INTO rss_market (name, url, description, category, icon, language, subscriber_count, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 开始事务
  const insertMany = db.transaction((feeds) => {
    let success = 0;
    let failed = 0;

    for (const feed of feeds) {
      try {
        const name = feed.title || '未命名';
        const url = feed.url || '';
        const description = feed.description || '';
        const originalCategory = feed.category || '未分类';
        const category = categoryMap[originalCategory] || 'general';
        const icon = getIcon(name, originalCategory);
        const language = 'zh';
        const subscriberCount = feed.qty || 0;
        // 订阅数超过 100 的设为精选
        const isFeatured = subscriberCount >= 100 ? 1 : 0;

        insertStmt.run(name, url, description, category, icon, language, subscriberCount, isFeatured);
        success++;
      } catch (error) {
        console.warn(`⚠️  导入失败: ${feed.title} - ${error.message}`);
        failed++;
      }
    }

    return { success, failed };
  });

  // 执行导入
  const result = insertMany(feeds);

  console.log('\n✅ 导入完成！');
  console.log(`   成功: ${result.success} 个`);
  console.log(`   失败: ${result.failed} 个`);

  // 统计分类
  const categories = db.prepare(`
    SELECT category, COUNT(*) as count FROM rss_market GROUP BY category ORDER BY count DESC
  `).all();

  console.log('\n📊 分类统计:');
  for (const cat of categories) {
    console.log(`   ${cat.category}: ${cat.count} 个`);
  }

  // 统计精选
  const featured = db.prepare('SELECT COUNT(*) as count FROM rss_market WHERE is_featured = 1').get();
  console.log(`\n⭐ 精选源: ${featured.count} 个`);

  db.close();
  console.log('\n🎉 全部完成！');
}

importFeeds().catch(console.error);
