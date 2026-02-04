# AI Tracker E2E 工作流测试用例

测试完整的用户操作流程，模拟真实用户使用场景。

---

## 工作流 1: 新用户首次使用

### TC-WF-001: 完整的新用户引导流程

**Priority**: P0
**Type**: E2E
**Estimated Time**: 15 minutes

**Prerequisites**:
- 系统全新部署
- 浏览器已清除缓存

**Test Steps**:
1. 打开浏览器访问 http://localhost:5173
2. 观察首页欢迎界面
3. 查看首页统计卡片（应该都是 0 或初始值）
4. 点击 "管理 RSS 源"
5. 观察空状态提示
6. 点击 "添加 RSS 源"
7. 填写信息：
   - 名称：测试博客
   - URL：https://rsshub.app/github/trending/daily
   - 类型：RSS
8. 保存
9. 等待自动抓取
10. 返回首页
11. 观察统计数据更新
12. 点击 "查看内容"
13. 阅读第一篇文章
14. 返回内容列表

**Expected Result**:
✅ 首页正确显示初始状态
✅ RSS 源添加成功
✅ 自动抓取文章成功
✅ 首页统计数据更新
✅ 内容列表显示新抓取的文章
✅ 文章可正常阅读

**Pass/Fail Criteria**:
- ✅ PASS: 整个流程顺畅，无错误
- ❌ FAIL: 任何步骤失败或报错

---

## 工作流 2: 日常阅读流程

### TC-WF-002: 用户日常阅读文章

**Priority**: P0
**Type**: E2E
**Estimated Time**: 10 minutes

**Prerequisites**:
- 系统运行中
- 有多个频道和未读文章

**Test Steps**:
1. 登录系统
2. 查看首页未读文章数
3. 进入内容列表
4. 查看各频道未读数
5. 选择未读文章最多的频道
6. 按顺序阅读文章：
   - 点击第一篇文章
   - 阅读内容
   - 返回列表
   - 点击第二篇文章
   - 阅读内容
   - 返回列表
7. 观察未读数变化
8. 返回首页
9. 检查总未读数是否减少

**Expected Result**:
✅ 未读文章正确显示
✅ 阅读后文章标记为已读
✅ 频道未读数相应减少
✅ 首页总未读数同步更新

**Pass/Fail Criteria**:
- ✅ PASS: 阅读流程顺畅，状态同步正确
- ❌ FAIL: 已读状态不更新或不同步

---

## 工作流 3: 频道管理流程

### TC-WF-003: 添加和管理多个 RSS 源

**Priority**: P1
**Type**: E2E
**Estimated Time**: 15 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 进入频道管理页面
2. 添加第一个 RSS 源（技术类）
3. 添加第二个 RSS 源（新闻类）
4. 添加第三个 RSS 源（博客类）
5. 等待自动抓取
6. 进入内容列表
7. 验证三个频道都显示
8. 分别点击每个频道查看文章
9. 返回频道管理
10. 禁用第二个 RSS 源
11. 返回内容列表
12. 验证禁用的频道不显示或标记为禁用
13. 返回频道管理
14. 删除第三个 RSS 源
15. 返回内容列表
16. 验证该频道已消失

**Expected Result**:
✅ 多个 RSS 源添加成功
✅ 各频道文章正确分类
✅ 禁用后不再自动更新
✅ 删除后频道和文章清理

**Pass/Fail Criteria**:
- ✅ PASS: 频道管理功能完整可用
- ❌ FAIL: 添加、禁用、删除任一功能失败

---

## 工作流 4: 搜索和筛选流程

### TC-WF-004: 搜索特定内容

**Priority**: P1
**Type**: E2E
**Estimated Time**: 10 minutes

**Prerequisites**:
- 系统运行中
- 有大量文章数据

**Test Steps**:
1. 进入内容列表
2. 在搜索框输入关键词 "AI"
3. 观察搜索结果
4. 点击搜索结果中的一篇文章
5. 阅读后返回
6. 清空搜索
7. 选择特定频道
8. 在该频道内搜索
9. 验证结果只在所选频道内

**Expected Result**:
✅ 搜索功能正常工作
✅ 结果准确匹配关键词
✅ 频道筛选 + 搜索组合工作正常

**Pass/Fail Criteria**:
- ✅ PASS: 搜索和筛选功能完整
- ❌ FAIL: 搜索结果不准确或筛选无效

---

## 工作流 5: 数据同步一致性验证

### TC-WF-005: 跨页面数据一致性检查

**Priority**: P0
**Type**: E2E
**Estimated Time**: 10 minutes

**Prerequisites**:
- 系统运行中
- 有多个频道和文章

**Test Steps**:
1. 打开首页，记录：
   - RSS 源总数
   - 总文章数
   - 未读文章数
2. 打开内容列表，记录：
   - 频道数量
   - 全部文章数
   - 各频道未读数之和
3. 打开频道管理，记录：
   - RSS 源数量
4. 对比数据：
   - 首页 RSS 源数 == 频道管理 RSS 源数
   - 首页总文章数 == 内容列表全部文章数
   - 首页未读数 == 各频道未读数之和
5. 阅读一篇文章
6. 重新检查所有页面的未读数
7. 验证数据同步

**Expected Result**:
✅ 各页面数据一致
✅ 阅读文章后所有页面同步更新

**Pass/Fail Criteria**:
- ✅ PASS: 数据完全一致
- ❌ FAIL: 任何数据不一致

---

## 工作流 6: 热门推荐探索

### TC-WF-006: 发现和添加热门内容

**Priority**: P1
**Type**: E2E
**Estimated Time**: 10 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问热门公众号页面
2. 浏览推荐列表
3. 点击感兴趣的公众号
4. 添加到我的 RSS 源
5. 访问热门知乎页面
6. 浏览推荐内容
7. 访问热门 GitHub 页面
8. 浏览推荐项目
9. 访问 RSS 市场
10. 按分类浏览
11. 添加几个感兴趣的源
12. 返回内容列表
13. 验证新添加的源已显示

**Expected Result**:
✅ 热门推荐页面正常显示
✅ 可一键添加推荐内容
✅ 添加后在内容列表可见

**Pass/Fail Criteria**:
- ✅ PASS: 发现和添加流程顺畅
- ❌ FAIL: 推荐内容无法添加

---

## 工作流 7: 设置和个性化

### TC-WF-007: 个性化设置流程

**Priority**: P2
**Type**: E2E
**Estimated Time**: 10 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问设置页面
2. 修改主题设置（如支持）
3. 修改通知设置
4. 修改抓取频率设置
5. 保存设置
6. 刷新页面
7. 验证设置已保存
8. 测试设置效果（如通知）

**Expected Result**:
✅ 设置可修改和保存
✅ 设置持久化
✅ 设置效果生效

**Pass/Fail Criteria**:
- ✅ PASS: 设置功能完整
- ❌ FAIL: 设置无法保存或生效

---

## 工作流 8: 异常处理

### TC-WF-008: 处理网络异常

**Priority**: P1
**Type**: E2E
**Estimated Time**: 10 minutes

**Prerequisites**:
- 系统运行中
- 可控制网络连接

**Test Steps**:
1. 正常访问系统
2. 断开网络连接
3. 尝试刷新页面
4. 观察错误提示
5. 恢复网络连接
6. 刷新页面
7. 验证系统恢复正常
8. 在内容列表中断开网络
9. 尝试阅读文章
10. 观察错误处理

**Expected Result**:
✅ 网络断开时显示友好错误提示
✅ 不显示技术错误堆栈
✅ 网络恢复后可正常使用
✅ 无数据丢失

**Pass/Fail Criteria**:
- ✅ PASS: 异常处理完善
- ❌ FAIL: 错误提示不友好或数据丢失

---

## 工作流 9: 并发操作

### TC-WF-009: 多标签页操作

**Priority**: P2
**Type**: E2E
**Estimated Time**: 10 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 在标签页 A 打开首页
2. 在标签页 B 打开内容列表
3. 在标签页 B 阅读一篇文章
4. 切换到标签页 A
5. 观察未读数是否更新
6. 在标签页 A 刷新
7. 验证数据同步

**Expected Result**:
✅ 多标签页数据同步
✅ 无冲突或数据不一致

**Pass/Fail Criteria**:
- ✅ PASS: 并发操作正常
- ❌ FAIL: 数据不同步

---

## 工作流 10: 长时间使用稳定性

### TC-WF-010: 长时间使用测试

**Priority**: P2
**Type**: E2E
**Estimated Time**: 30 minutes

**Prerequisites**:
- 系统运行中
- 有大量文章数据

**Test Steps**:
1. 打开系统
2. 连续进行以下操作 30 分钟：
   - 切换不同页面
   - 阅读文章
   - 搜索内容
   - 切换频道
3. 观察内存占用（通过浏览器任务管理器）
4. 检查是否有内存泄漏
5. 测试响应速度是否下降

**Expected Result**:
✅ 系统持续稳定运行
✅ 无明显的内存泄漏
✅ 响应速度保持一致

**Pass/Fail Criteria**:
- ✅ PASS: 长时间使用稳定
- ❌ FAIL: 内存持续增长或响应变慢

---
