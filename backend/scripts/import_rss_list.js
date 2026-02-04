import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rssFeeds = [
  { name: '知乎每日精选', url: 'https://www.zhihu.com/rss', category: 'news' },
  { name: '阮一峰的网络日志', url: 'https://www.ruanyifeng.com/blog/atom.xml', category: 'tech' },
  { name: '少数派', url: 'https://sspai.com/feed', category: 'tech' },
  { name: '美团技术团队', url: 'https://tech.meituan.com/feed', category: 'dev' },
  { name: 'V2EX', url: 'https://v2ex.com/index.xml', category: 'community' },
  { name: '酷壳 – CoolShell', url: 'http://coolshell.cn/feed', category: 'dev' },
  { name: '爱范儿', url: 'https://www.ifanr.com/feed', category: 'tech' },
  { name: '知乎热榜', url: 'https://rsshub.app/zhihu/hotlist', category: 'trending' },
  { name: '联合早报-中港台', url: 'https://plink.anyfeeder.com/zaobao/realtime/china', category: 'news' },
  { name: '南方周末', url: 'https://rsshub.app/infzm/2', category: 'news' },
  { name: '机核', url: 'https://www.gcores.com/rss', category: 'game' },
  { name: '编程随想', url: 'https://feeds2.feedburner.com/programthink', category: 'blog' },
  { name: '奇客Solidot', url: 'https://www.solidot.org/index.rss', category: 'tech' },
  { name: '煎蛋热榜', url: 'https://rsshub.app/jandan/top', category: 'trending' },
  { name: '联合早报-国际', url: 'https://plink.anyfeeder.com/zaobao/realtime/world', category: 'news' },
  { name: 'ONE · 一个', url: 'https://rsshub.app/one', category: 'general' },
  { name: '云风的 BLOG', url: 'http://blog.codingnow.com/atom.xml', category: 'blog' },
  { name: '知乎日报', url: 'https://rsshub.app/zhihu/daily', category: 'news' },
  { name: '小众软件', url: 'http://feed.appinn.com/', category: 'software' },
  { name: '抽屉新热榜', url: 'https://rsshub.app/chouti/top/168', category: 'trending' },
  { name: '极客公园', url: 'http://www.geekpark.net/rss', category: 'tech' },
  { name: '构建我的被动收入', url: 'https://www.bmpi.dev/index.xml', category: 'blog' },
  { name: '左岸读书', url: 'http://www.zreading.cn/feed', category: 'blog' },
  { name: '掘金前端', url: 'https://rsshub.app/juejin/category/frontend', category: 'dev' },
  { name: '虎嗅网', url: 'https://www.huxiu.com/rss/0.xml', category: 'tech' },
  { name: '36氪', url: 'https://36kr.com/feed', category: 'tech' },
  { name: '酷安', url: 'https://rsshub.app/coolapk/tuwen-xinxian', category: 'tech' },
  { name: '异次元软件世界', url: 'http://feed.iplaysoft.com/', category: 'software' },
  { name: 'DIYGod', url: 'https://diygod.me/atom.xml', category: 'blog' },
  { name: 'Python 工匠', url: 'https://www.zlovezl.cn/feeds/latest/', category: 'dev' },
  { name: '王垠的博客', url: 'https://rsshub.app/blogs/wangyin', category: 'blog' },
  { name: '程序员的喵', url: 'https://catcoding.me/atom.xml', category: 'blog' },
  { name: '微博热搜榜', url: 'https://rsshub.app/weibo/search/hot', category: 'trending' },
  { name: '胡涂说', url: 'https://hutusi.com/feed.xml', category: 'blog' },
  { name: '土木坛子', url: 'https://tumutanzi.com/feed', category: 'blog' },
  { name: '字节跳动技术团队', url: 'https://rsshub.app/juejin/posts/1838039172387262', category: 'dev' },
  { name: '开源中国', url: 'https://rsshub.app/oschina/news/project', category: 'dev' },
  { name: 'IT之家', url: 'https://www.ithome.com/rss/', category: 'tech' },
  { name: 'IT之家24小时最热', url: 'https://rsshub.app/ithome/ranking/24h', category: 'trending' },
  { name: '月光博客', url: 'http://www.williamlong.info/rss.xml', category: 'blog' },
  { name: '36氪', url: 'https://www.36kr.com/feed', category: 'tech' },
  { name: '卡瓦邦噶', url: 'https://www.kawabangga.com/feed', category: 'blog' },
  { name: '离别歌', url: 'https://www.leavesongs.com/feed/', category: 'dev' },
  { name: '风雪之隅', url: 'http://www.laruence.com/feed', category: 'dev' },
  { name: '理想生活实验室', url: 'https://www.toodaylab.com/feed', category: 'general' },
  { name: 'Mac玩儿法', url: 'http://www.waerfa.com/feed', category: 'software' },
  { name: '有赞技术团队', url: 'https://tech.youzan.com/rss/', category: 'dev' },
  { name: 'iDaily', url: 'https://plink.anyfeeder.com/idaily/today', category: 'news' },
  { name: '张鑫旭', url: 'https://www.zhangxinxu.com/wordpress/feed/', category: 'dev' },
  { name: 'HelloGitHub', url: 'http://hellogithub.com/rss', category: 'dev' },
  { name: '游戏研究社', url: 'https://www.yystv.cn/rss/feed', category: 'game' },
  { name: '潮流周刊', url: 'https://weekly.tw93.fun/rss.xml', category: 'tech' },
  { name: '中国日报双语', url: 'https://plink.anyfeeder.com/chinadaily/dual', category: 'news' },
  { name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/', category: 'dev' },
  { name: '技术小黑屋', url: 'https://droidyue.com/atom.xml', category: 'dev' },
  { name: '端传媒', url: 'https://plink.anyfeeder.com/initium/latest', category: 'news' },
  { name: '十点读书', url: 'https://plink.anyfeeder.com/weixin/duhaoshu', category: 'general' },
  { name: '360核心安全', url: 'https://blogs.360.net/rss.html', category: 'tech' },
  { name: 'MacTalk', url: 'http://macshuo.com/?feed=rss2', category: 'blog' },
  { name: '开发者头条', url: 'https://plink.anyfeeder.com/toutiao.io', category: 'dev' },
  { name: '罗辑思维', url: 'https://plink.anyfeeder.com/weixin/luojisw', category: 'general' },
  { name: '读库小报', url: 'https://plink.anyfeeder.com/weixin/dukuxiaobao', category: 'general' },
  { name: 'Xuanwo', url: 'https://xuanwo.io/index.xml', category: 'blog' },
  { name: '反斗限免', url: 'http://free.apprcn.com/feed/', category: 'software' },
  { name: '湾区日报', url: 'https://wanqu.co/feed/', category: 'news' },
  { name: 'iNote', url: 'https://inote.xyz/rss', category: 'blog' },
  { name: '青年文摘', url: 'https://plink.anyfeeder.com/weixin/qnwzwx', category: 'general' },
  { name: '美国之音', url: 'https://plink.anyfeeder.com/voa/chinese', category: 'news' },
  { name: '书单来了', url: 'https://plink.anyfeeder.com/weixin/shudanlaile', category: 'general' },
  { name: '新华社', url: 'https://plink.anyfeeder.com/newscn/whxw', category: 'news' },
  { name: '好奇心日报', url: 'http://www.qdaily.com/feed.xml', category: 'news' },
  { name: 'InfoQ', url: 'https://plink.anyfeeder.com/infoq/recommend', category: 'dev' },
  { name: '三联生活周刊', url: 'https://plink.anyfeeder.com/weixin/lifeweek', category: 'news' },
  { name: '二丫讲梵', url: 'https://wiki.eryajf.net/rss.xml', category: 'blog' },
  { name: 'web.dev', url: 'https://web.dev/feed.xml', category: 'dev' },
  { name: '财富中文网', url: 'https://plink.anyfeeder.com/fortunechina/shangye', category: 'news' },
  { name: '真实故事计划', url: 'https://plink.anyfeeder.com/weixin/zhenshigushi1', category: 'general' },
  { name: '一天一篇经济学人', url: 'https://plink.anyfeeder.com/weixin/Economist_fans', category: 'news' },
  { name: '路透中文', url: 'https://plink.anyfeeder.com/reuters/cn', category: 'news' },
  { name: 'MIT科技评论', url: 'https://plink.anyfeeder.com/mittrchina/hot', category: 'tech' },
  { name: '唐巧的博客', url: 'http://blog.devtang.com/atom.xml', category: 'dev' },
  { name: '华尔街日报', url: 'https://plink.anyfeeder.com/wsj/cn', category: 'news' },
  { name: 'Dan Abramov', url: 'https://overreacted.io/rss.xml', category: 'dev' },
  { name: '雷峰网', url: 'https://rsshub.app/leiphone/newsflash', category: 'tech' },
  { name: '哈佛商业评论', url: 'https://plink.anyfeeder.com/weixin/hbrchinese', category: 'news' },
  { name: '参考消息', url: 'https://plink.anyfeeder.com/weixin/ckxxwx', category: 'news' },
  { name: 'Tony Bai', url: 'http://tonybai.com/feed/', category: 'dev' },
  { name: '法广', url: 'https://plink.anyfeeder.com/rfi/cn', category: 'news' },
  { name: '奔跑中的奶酪', url: 'https://www.runningcheese.com/feed', category: 'software' },
  { name: '阳志平', url: 'https://www.yangzhiping.com/feed.xml', category: 'blog' },
  { name: '纽约时报中文网', url: 'http://cn.nytimes.com/rss/news.xml', category: 'news' },
  { name: '腾讯新闻国内', url: 'https://plink.anyfeeder.com/qq/news/china', category: 'news' },
  { name: '全栈应用开发', url: 'https://www.phodal.com/blog/feeds/rss/', category: 'dev' },
  { name: '饭统戴老板', url: 'https://plink.anyfeeder.com/weixin/worldofboss', category: 'news' },
  { name: '侠客岛', url: 'https://plink.anyfeeder.com/weixin/xiake_island', category: 'news' },
  { name: 'ImportNew', url: 'https://plink.anyfeeder.com/weixin/importnew', category: 'dev' },
  { name: '南方周末', url: 'https://plink.anyfeeder.com/infzm/news', category: 'news' },
  { name: '六神磊磊读金庸', url: 'https://plink.anyfeeder.com/weixin/dujinyong6', category: 'general' },
  { name: '纽约时报', url: 'https://plink.anyfeeder.com/nytimes/cn', category: 'news' },
  { name: '36氪快讯', url: 'https://rsshub.app/36kr/newsflashes', category: 'tech' },
  { name: '财新网', url: 'https://plink.anyfeeder.com/weixin/caixinwang', category: 'news' },
  { name: '科学松鼠会', url: 'https://plink.anyfeeder.com/weixin/SquirrelClub', category: 'science' },
  { name: '解放军报', url: 'https://plink.anyfeeder.com/jiefangjunbao', category: 'news' },
  { name: '笨方法学写作', url: 'https://www.cnfeat.com/feed.xml', category: 'blog' },
  { name: 'Vista看天下', url: 'https://plink.anyfeeder.com/weixin/vistaweek', category: 'news' },
  { name: 'Knowyourself', url: 'https://plink.anyfeeder.com/weixin/knowyourself2015', category: 'general' },
  { name: '腾讯科技', url: 'https://plink.anyfeeder.com/weixin/qqtech', category: 'tech' },
  { name: '华尔街日报', url: 'https://cn.wsj.com/zh-hans/rss', category: 'news' },
  { name: 'Josh Comeau', url: 'https://www.joshwcomeau.com/rss.xml', category: 'dev' },
  { name: '煎鱼', url: 'https://eddycjy.com/posts/index.xml', category: 'dev' },
  { name: '中国日报专栏', url: 'https://plink.anyfeeder.com/chinadaily/column', category: 'news' },
  { name: '涛叔', url: 'https://taoshu.in/feed.xml', category: 'blog' },
  { name: '地球知识局', url: 'https://plink.anyfeeder.com/weixin/diqiuzhishiju', category: 'news' },
  { name: '人民网国内', url: 'https://plink.anyfeeder.com/people/politics', category: 'news' },
  { name: '西秦公子', url: 'https://www.ixiqin.com/feed/', category: 'blog' },
  { name: 'Linux中国', url: 'https://plink.anyfeeder.com/linux.cn', category: 'dev' },
];

const iconMap = {
  news: '📰',
  tech: '🔬',
  dev: '💻',
  blog: '📝',
  trending: '🔥',
  software: '💿',
  game: '🎮',
  community: '👥',
  science: '🔬',
  general: '📌'
};

async function importFeeds() {
  console.log('📥 开始导入 RSS 源数据...');
  console.log(`📊 共 ${rssFeeds.length} 个 RSS 源`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const feed of rssFeeds) {
    try {
      const existing = await prisma.rssMarket.findUnique({
        where: { url: feed.url }
      });

      if (existing) {
        console.log(`⏭️  跳过已存在: ${feed.name}`);
        skipped++;
        continue;
      }

      await prisma.rssMarket.create({
        data: {
          name: feed.name,
          url: feed.url,
          description: '',
          category: feed.category,
          icon: iconMap[feed.category] || '📌',
          language: 'zh',
          subscriberCount: 0,
          isFeatured: false
        }
      });
      console.log(`✅ 导入成功: ${feed.name}`);
      success++;
    } catch (error) {
      console.error(`❌ 导入失败: ${feed.name} - ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 导入完成！');
  console.log(`   成功: ${success} 个`);
  console.log(`   跳过: ${skipped} 个`);
  console.log(`   失败: ${failed} 个`);

  const categories = await prisma.rssMarket.groupBy({
    by: ['category'],
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } }
  });

  console.log('\n📊 分类统计:');
  for (const cat of categories) {
    console.log(`   ${cat.category}: ${cat._count.category} 个`);
  }
}

importFeeds()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n🎉 全部完成！');
  });
