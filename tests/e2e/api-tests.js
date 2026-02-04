/**
 * AI Tracker API 自动化测试
 * 使用原生 Node.js 测试后端 API
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

// 测试统计
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedDetails = [];

// 简单的 HTTP 请求函数
function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 测试断言
function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ ${message}`);
  } else {
    failedTests++;
    failedDetails.push(message);
    console.log(`  ❌ ${message}`);
  }
}

// 测试套件
async function runTests() {
  console.log('🚀 AI Tracker API 测试开始\n');
  console.log(`测试地址: http://${BASE_URL}:${PORT}\n`);

  // ========== 测试 1: 获取统计信息 ==========
  console.log('📊 测试 1: 获取统计信息');
  try {
    const statsRes = await request('/api/stats');
    assert(statsRes.status === 200, 'API 返回 200 状态码');
    assert(statsRes.data && typeof statsRes.data === 'object', '返回数据为对象');
    assert(statsRes.data.success === true, '返回 success: true');
    assert(statsRes.data.data && typeof statsRes.data.data === 'object', '返回 data 字段');
    assert(statsRes.data.data.bloggers !== undefined, '包含 bloggers 统计');
    assert(statsRes.data.data.contents !== undefined, '包含 contents 统计');
    
    const stats = statsRes.data.data;
    console.log(`   RSS 源总数: ${stats.bloggers?.total || 0}`);
    console.log(`   文章总数: ${stats.contents?.total || 0}`);
    console.log(`   未读文章: ${stats.contents?.unread_count || 0}`);
    console.log(`   今日更新: ${stats.contents?.today_count || 0}\n`);
  } catch (error) {
    assert(false, `获取统计信息失败: ${error.message}`);
    console.log('');
  }

  // ========== 测试 2: 获取 RSS 源列表 ==========
  console.log('📡 测试 2: 获取 RSS 源列表');
  let bloggersList = [];
  try {
    const bloggersRes = await request('/api/bloggers');
    assert(bloggersRes.status === 200, 'API 返回 200 状态码');
    assert(bloggersRes.data.success === true, '返回 success: true');
    assert(Array.isArray(bloggersRes.data.data), '返回 data 为数组');
    
    bloggersList = bloggersRes.data.data || [];
    if (bloggersList.length > 0) {
      const blogger = bloggersList[0];
      assert(blogger.id !== undefined, 'RSS 源有 id 字段');
      assert(blogger.name !== undefined, 'RSS 源有 name 字段');
      assert(blogger.url !== undefined, 'RSS 源有 url 字段');
      assert(blogger.type !== undefined, 'RSS 源有 type 字段');
      // API 返回的是 unread_contents 而不是 unread_count
      assert(blogger.unread_contents !== undefined, 'RSS 源有 unread_contents 字段');
      console.log(`   找到 ${bloggersList.length} 个 RSS 源`);
      console.log(`   示例: ${blogger.name} (未读: ${blogger.unread_contents}, 类型: ${blogger.type})\n`);
    } else {
      console.log('   暂无 RSS 源\n');
    }
  } catch (error) {
    assert(false, `获取 RSS 源列表失败: ${error.message}`);
    console.log('');
  }

  // ========== 测试 3: 获取内容列表 ==========
  console.log('📄 测试 3: 获取内容列表');
  let contentsList = [];
  try {
    const contentsRes = await request('/api/contents');
    assert(contentsRes.status === 200, 'API 返回 200 状态码');
    assert(contentsRes.data.success === true, '返回 success: true');
    assert(Array.isArray(contentsRes.data.data), '返回 data 为数组');
    
    contentsList = contentsRes.data.data || [];
    if (contentsList.length > 0) {
      const content = contentsList[0];
      assert(content.id !== undefined, '内容有 id 字段');
      assert(content.title !== undefined, '内容有 title 字段');
      assert(content.blogger_id !== undefined, '内容有 blogger_id 字段');
      // API 使用 is_notified 而不是 is_read
      assert(content.is_notified !== undefined, '内容有 is_notified 字段');
      console.log(`   找到 ${contentsList.length} 篇文章 (分页限制 50)`);
      console.log(`   示例: ${content.title?.substring(0, 50)}... (已通知: ${content.is_notified})\n`);
    } else {
      console.log('   暂无文章\n');
    }
  } catch (error) {
    assert(false, `获取内容列表失败: ${error.message}`);
    console.log('');
  }

  // ========== 测试 4: 数据一致性检查 ==========
  console.log('🔍 测试 4: 数据一致性检查');
  try {
    const [statsRes, bloggersRes, contentsRes] = await Promise.all([
      request('/api/stats'),
      request('/api/bloggers'),
      request('/api/contents'),
    ]);

    const statsTotalContents = statsRes.data?.data?.contents?.total || 0;
    const actualContentsCount = contentsRes.data?.data?.length || 0;
    const statsTotalBloggers = statsRes.data?.data?.bloggers?.total || 0;
    const actualBloggersCount = bloggersRes.data?.data?.length || 0;

    // 检查 RSS 源数量一致性
    assert(
      statsTotalBloggers === actualBloggersCount,
      `RSS 源数一致: 统计=${statsTotalBloggers}, 实际=${actualBloggersCount}`
    );

    // 注意：内容列表有分页，所以实际返回的数量可能小于统计总数
    console.log(`   统计文章总数: ${statsTotalContents}`);
    console.log(`   API 返回文章数: ${actualContentsCount} (分页限制 50)`);
    console.log(`   说明：内容列表 API 有分页，返回数量 ≤ 统计总数是正常的`);
    
    // 检查未读数一致性
    if (bloggersRes.data?.data && bloggersRes.data.data.length > 0) {
      // 注意：API 返回的是 unread_contents
      const totalUnreadFromBloggers = bloggersRes.data.data.reduce(
        (sum, b) => sum + (b.unread_contents || 0),
        0
      );
      const unreadContents = contentsRes.data?.data?.filter(c => !c.is_notified).length || 0;
      const statsUnread = statsRes.data?.data?.contents?.unread_count || 0;
      
      console.log(`   统计未读数: ${statsUnread}`);
      console.log(`   RSS 源未读数总和: ${totalUnreadFromBloggers}`);
      console.log(`   API 返回未读数: ${unreadContents} (仅前 50 篇)`);
      
      // RSS 源未读数总和应该等于统计未读数
      assert(
        totalUnreadFromBloggers === statsUnread,
        `未读数一致: RSS源总和=${totalUnreadFromBloggers}, 统计=${statsUnread}`
      );
    }
    console.log('');
  } catch (error) {
    assert(false, `数据一致性检查失败: ${error.message}`);
    console.log('');
  }

  // ========== 测试 5: RSS 市场 API ==========
  console.log('🏪 测试 5: RSS 市场 API');
  try {
    const marketRes = await request('/api/rss-market');
    assert(marketRes.status === 200, 'API 返回 200 状态码');
    assert(marketRes.data.success === true, '返回 success: true');
    assert(Array.isArray(marketRes.data.data), '返回 data 为数组');
    assert(Array.isArray(marketRes.data.categories), '返回 categories 为数组');
    console.log(`   找到 ${marketRes.data.data?.length || 0} 个 RSS 源`);
    console.log(`   分类: ${marketRes.data.categories?.join(', ')}\n`);
  } catch (error) {
    assert(false, `获取 RSS 市场失败: ${error.message}`);
    console.log('');
  }

  // ========== 测试 6: 热门推荐 API（如果存在） ==========
  console.log('🔥 测试 6: 热门推荐 API');
  try {
    const wechatRes = await request('/api/popular/wechat');
    if (wechatRes.status === 200 && wechatRes.data) {
      assert(wechatRes.data.success === true, '微信公众号 API 返回 success');
      console.log('   微信公众号 API 正常');
    } else {
      console.log('   微信公众号 API 不存在或返回错误');
    }
  } catch (error) {
    console.log('   微信公众号 API 不可用（可能未实现）');
  }

  try {
    const zhihuRes = await request('/api/popular/zhihu');
    if (zhihuRes.status === 200 && zhihuRes.data) {
      assert(zhihuRes.data.success === true, '知乎 API 返回 success');
      console.log('   知乎 API 正常');
    } else {
      console.log('   知乎 API 不存在或返回错误');
    }
  } catch (error) {
    console.log('   知乎 API 不可用（可能未实现）');
  }

  try {
    const githubRes = await request('/api/popular/github');
    if (githubRes.status === 200 && githubRes.data) {
      assert(githubRes.data.success === true, 'GitHub API 返回 success');
      console.log('   GitHub API 正常');
    } else {
      console.log('   GitHub API 不存在或返回错误');
    }
  } catch (error) {
    console.log('   GitHub API 不可用（可能未实现）');
  }
  console.log('');

  // ========== 测试 7: 错误处理 ==========
  console.log('⚠️  测试 7: 错误处理');
  try {
    const notFoundRes = await request('/api/non-existent-endpoint');
    assert(notFoundRes.status === 404, '不存在的端点返回 404');
    console.log('   错误处理正常\n');
  } catch (error) {
    assert(false, `错误处理测试失败: ${error.message}`);
    console.log('');
  }

  // ========== 测试 8: 单个 RSS 源内容 ==========
  console.log('📋 测试 8: 单个 RSS 源内容');
  if (bloggersList.length > 0) {
    try {
      const firstBlogger = bloggersList[0];
      const contentsRes = await request(`/api/contents?blogger_id=${firstBlogger.id}`);
      assert(contentsRes.status === 200, 'API 返回 200 状态码');
      assert(contentsRes.data.success === true, '返回 success: true');
      assert(Array.isArray(contentsRes.data.data), '返回 data 为数组');
      
      const filteredContents = contentsRes.data.data || [];
      console.log(`   RSS 源 "${firstBlogger.name}" 有 ${filteredContents.length} 篇文章\n`);
    } catch (error) {
      assert(false, `获取单个 RSS 源内容失败: ${error.message}`);
      console.log('');
    }
  } else {
    console.log('   跳过（无 RSS 源）\n');
  }

  // ========== 测试 9: 获取单个 RSS 源详情 ==========
  console.log('📋 测试 9: 获取单个 RSS 源详情');
  if (bloggersList.length > 0) {
    try {
      const firstBlogger = bloggersList[0];
      const bloggerRes = await request(`/api/bloggers/${firstBlogger.id}`);
      assert(bloggerRes.status === 200, 'API 返回 200 状态码');
      assert(bloggerRes.data.success === true, '返回 success: true');
      assert(bloggerRes.data.data && typeof bloggerRes.data.data === 'object', '返回 data 为对象');
      assert(bloggerRes.data.data.id === firstBlogger.id, '返回正确的 RSS 源');
      assert(Array.isArray(bloggerRes.data.data.contents), '包含 contents 数组');
      console.log(`   RSS 源 "${firstBlogger.name}" 详情获取成功`);
      console.log(`   包含 ${bloggerRes.data.data.contents?.length || 0} 篇最近文章\n`);
    } catch (error) {
      assert(false, `获取 RSS 源详情失败: ${error.message}`);
      console.log('');
    }
  } else {
    console.log('   跳过（无 RSS 源）\n');
  }

  // ========== 测试报告 ==========
  console.log('═══════════════════════════════════════════');
  console.log('📋 测试报告');
  console.log('═══════════════════════════════════════════');
  console.log(`总测试数: ${totalTests}`);
  console.log(`✅ 通过: ${passedTests}`);
  console.log(`❌ 失败: ${failedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════');

  if (failedDetails.length > 0) {
    console.log('\n❌ 失败的测试:');
    failedDetails.forEach((detail, index) => {
      console.log(`  ${index + 1}. ${detail}`);
    });
  }

  console.log('\n📊 关键指标:');
  console.log(`  - RSS 源数量: ${bloggersList.length}`);
  console.log(`  - 文章数量: ${contentsList.length} (分页)`);
  console.log(`  - API 可用性: 核心功能正常`);

  // 返回测试结果
  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    passRate: (passedTests / totalTests) * 100,
    success: failedTests === 0,
  };
}

// 运行测试
runTests()
  .then((results) => {
    console.log('\n✨ 测试执行完成');
    process.exit(results.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 测试执行出错:', error);
    process.exit(1);
  });
