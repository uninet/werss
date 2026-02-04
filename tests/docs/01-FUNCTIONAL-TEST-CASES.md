# AI Tracker 功能测试用例

## 测试范围
覆盖 AI Tracker 应用的所有核心功能模块：首页、内容列表、频道管理、热门推荐等。

---

## 首页功能测试 (Home)

### TC-HOME-001: 首页统计卡片显示

**Priority**: P0
**Type**: E2E
**Estimated Time**: 3 minutes

**Prerequisites**:
- 后端服务运行中 (http://localhost:3000)
- 前端服务运行中 (http://localhost:5173)
- 数据库已初始化并有测试数据
- 用户已登录

**Test Steps**:
1. 打开浏览器访问 http://localhost:5173
2. 等待页面加载完成
3. 观察首页统计卡片区域

**Expected Result**:
✅ 显示 4 个统计卡片：RSS 源数量、总文章数、未读文章、今日更新
✅ 每个卡片显示正确的数字（非 NaN 或 undefined）
✅ 卡片样式正确，图标显示正常
✅ 今日更新数量显示为绿色徽章

**Pass/Fail Criteria**:
- ✅ PASS: 所有统计数字正确显示，无加载错误
- ❌ FAIL: 任何卡片显示 NaN、undefined 或加载失败

---

### TC-HOME-002: 快捷操作按钮功能

**Priority**: P0
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 用户已登录

**Test Steps**:
1. 在首页找到快捷操作区域
2. 点击 "查看内容" 按钮
3. 观察页面跳转
4. 返回首页
5. 点击 "管理 RSS 源" 按钮
6. 观察页面跳转
7. 返回首页
8. 点击 "热门公众号" 按钮
9. 观察页面跳转

**Expected Result**:
✅ "查看内容" 跳转到 /contents 页面
✅ "管理 RSS 源" 跳转到 /bloggers 页面
✅ "热门公众号" 跳转到 /popular-wechat 页面
✅ 所有跳转动画流畅，无错误

**Pass/Fail Criteria**:
- ✅ PASS: 所有按钮跳转正确
- ❌ FAIL: 任何按钮点击无响应或跳转到错误页面

---

### TC-HOME-003: 最近更新文章列表

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 数据库中有最近更新的文章

**Test Steps**:
1. 访问首页
2. 滚动到 "最近更新" 区域
3. 观察文章列表显示
4. 点击任意一篇文章

**Expected Result**:
✅ 显示最近更新的文章列表（最多 10 篇）
✅ 每篇文章显示标题、来源、时间
✅ 未读文章标题显示为粗体
✅ 点击文章跳转到阅读页面

**Pass/Fail Criteria**:
- ✅ PASS: 文章列表正确显示，点击可跳转
- ❌ FAIL: 列表为空或点击无响应

---

## 内容列表功能测试 (Contents)

### TC-CONTENT-001: 频道列表显示

**Priority**: P0
**Type**: E2E
**Estimated Time**: 3 minutes

**Prerequisites**:
- 系统运行中
- 数据库中至少有一个 RSS 源/频道

**Test Steps**:
1. 访问 http://localhost:5173/contents
2. 等待页面加载
3. 观察左侧频道列表

**Expected Result**:
✅ 显示所有 RSS 源/频道列表
✅ 每个频道显示名称和图标
✅ 频道有未读文章时显示未读数量徽章
✅ "全部" 选项显示在列表顶部

**Pass/Fail Criteria**:
- ✅ PASS: 频道列表正确显示，未读数可见
- ❌ FAIL: 频道列表为空或未读数不显示

---

### TC-CONTENT-002: 频道切换功能

**Priority**: P0
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 至少有两个频道有文章

**Test Steps**:
1. 访问内容列表页面
2. 点击左侧第一个频道
3. 观察右侧文章列表变化
4. 点击第二个频道
5. 观察文章列表变化
6. 点击 "全部"
7. 观察显示所有文章

**Expected Result**:
✅ 点击频道后，右侧只显示该频道的文章
✅ 选中的频道高亮显示
✅ "全部" 显示所有频道的文章
✅ 文章数量与频道未读数一致

**Pass/Fail Criteria**:
- ✅ PASS: 频道切换正常，文章筛选正确
- ❌ FAIL: 切换频道后文章列表不更新或显示错误

---

### TC-CONTENT-003: 文章列表显示与排序

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 数据库中有多篇文章

**Test Steps**:
1. 访问内容列表页面
2. 观察文章列表
3. 检查排序方式
4. 点击排序下拉菜单
5. 选择不同排序方式

**Expected Result**:
✅ 文章按发布时间倒序排列（最新的在前）
✅ 每篇文章显示标题、摘要、发布时间
✅ 未读文章有视觉标识（粗体或标记）
✅ 排序切换功能正常工作

**Pass/Fail Criteria**:
- ✅ PASS: 文章正确排序，信息完整显示
- ❌ FAIL: 排序错误或文章信息缺失

---

### TC-CONTENT-004: 文章阅读功能

**Priority**: P0
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 有未读文章

**Test Steps**:
1. 访问内容列表页面
2. 点击一篇未读文章
3. 观察页面跳转
4. 检查文章内容显示
5. 返回内容列表
6. 检查该文章是否标记为已读

**Expected Result**:
✅ 点击文章后跳转到阅读页面
✅ 文章内容完整显示（标题、正文、来源）
✅ 返回后该文章标记为已读（不再粗体显示）
✅ 频道未读数相应减少

**Pass/Fail Criteria**:
- ✅ PASS: 文章可正常阅读，已读状态正确更新
- ❌ FAIL: 无法阅读文章或已读状态不更新

---

### TC-CONTENT-005: 单个频道更新功能

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 有可更新的 RSS 源

**Test Steps**:
1. 访问内容列表页面
2. 鼠标悬停在某个频道上
3. 点击出现的刷新图标
4. 观察加载状态
5. 等待更新完成

**Expected Result**:
✅ 悬停时显示刷新按钮
✅ 点击后显示加载动画
✅ 更新完成后文章列表刷新
✅ 如有新文章，未读数增加

**Pass/Fail Criteria**:
- ✅ PASS: 单个频道更新功能正常
- ❌ FAIL: 更新按钮不出现或更新失败

---

### TC-CONTENT-006: 搜索功能

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 数据库中有多篇文章

**Test Steps**:
1. 访问内容列表页面
2. 在搜索框输入关键词
3. 按回车或点击搜索
4. 观察搜索结果
5. 清空搜索框

**Expected Result**:
✅ 输入关键词后实时显示搜索结果
✅ 搜索结果包含关键词的文章
✅ 无结果时显示空状态提示
✅ 清空搜索后显示所有文章

**Pass/Fail Criteria**:
- ✅ PASS: 搜索功能正常工作
- ❌ FAIL: 搜索无响应或结果不准确

---

## 频道管理功能测试 (Bloggers)

### TC-BLOGGER-001: RSS 源列表显示

**Priority**: P0
**Type**: E2E
**Estimated Time**: 3 minutes

**Prerequisites**:
- 系统运行中
- 数据库中至少有一个 RSS 源

**Test Steps**:
1. 访问 http://localhost:5173/bloggers
2. 等待页面加载
3. 观察 RSS 源列表

**Expected Result**:
✅ 显示所有 RSS 源列表
✅ 每个源显示名称、URL、类型、状态
✅ 状态显示为启用/禁用

**Pass/Fail Criteria**:
- ✅ PASS: RSS 源列表正确显示
- ❌ FAIL: 列表为空或信息不完整

---

### TC-BLOGGER-002: 添加 RSS 源

**Priority**: P0
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 有一个有效的 RSS URL

**Test Steps**:
1. 访问频道管理页面
2. 点击 "添加 RSS 源" 按钮
3. 填写 RSS 源信息（名称、URL、类型）
4. 点击保存
5. 观察列表更新

**Expected Result**:
✅ 弹出添加表单/对话框
✅ 表单验证正常工作（必填项）
✅ 保存后新 RSS 源出现在列表中
✅ 新源自动开始抓取文章

**Pass/Fail Criteria**:
- ✅ PASS: RSS 源添加成功
- ❌ FAIL: 添加失败或表单验证错误

---

### TC-BLOGGER-003: 编辑 RSS 源

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 有可编辑的 RSS 源

**Test Steps**:
1. 访问频道管理页面
2. 找到要编辑的 RSS 源
3. 点击编辑按钮
4. 修改信息
5. 保存更改

**Expected Result**:
✅ 点击编辑后弹出编辑表单
✅ 表单预填充当前信息
✅ 保存后列表显示更新后的信息

**Pass/Fail Criteria**:
- ✅ PASS: RSS 源编辑成功
- ❌ FAIL: 编辑失败或信息未更新

---

### TC-BLOGGER-004: 删除 RSS 源

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 有可删除的 RSS 源

**Test Steps**:
1. 访问频道管理页面
2. 找到要删除的 RSS 源
3. 点击删除按钮
4. 确认删除
5. 观察列表更新

**Expected Result**:
✅ 点击删除后显示确认对话框
✅ 确认后该 RSS 源从列表中移除
✅ 相关文章也被删除

**Pass/Fail Criteria**:
- ✅ PASS: RSS 源删除成功
- ❌ FAIL: 删除失败或文章未清理

---

### TC-BLOGGER-005: 启用/禁用 RSS 源

**Priority**: P1
**Type**: E2E
**Estimated Time**: 3 minutes

**Prerequisites**:
- 系统运行中
- 有 RSS 源

**Test Steps**:
1. 访问频道管理页面
2. 找到启用的 RSS 源
3. 点击禁用
4. 观察状态变化
5. 再次点击启用

**Expected Result**:
✅ 点击禁用后状态变为禁用
✅ 禁用的源不再自动抓取
✅ 点击启用后恢复正常

**Pass/Fail Criteria**:
- ✅ PASS: 启用/禁用功能正常
- ❌ FAIL: 状态切换无效

---

## 热门推荐功能测试

### TC-POPULAR-001: 热门公众号页面

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问 http://localhost:5173/popular-wechat
2. 观察页面内容
3. 点击任意推荐公众号
4. 观察操作结果

**Expected Result**:
✅ 显示热门公众号推荐列表
✅ 每个公众号显示名称、描述、关注数
✅ 点击可查看详情或添加

**Pass/Fail Criteria**:
- ✅ PASS: 页面正常显示，交互正常
- ❌ FAIL: 页面为空或点击无响应

---

### TC-POPULAR-002: 热门知乎页面

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问 http://localhost:5173/popular-zhihu
2. 观察页面内容
3. 点击任意推荐内容

**Expected Result**:
✅ 显示热门知乎内容推荐
✅ 内容可正常浏览

**Pass/Fail Criteria**:
- ✅ PASS: 页面正常显示
- ❌ FAIL: 页面加载失败

---

### TC-POPULAR-003: 热门 GitHub 页面

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问 http://localhost:5173/popular-github
2. 观察页面内容
3. 点击任意推荐项目

**Expected Result**:
✅ 显示热门 GitHub 项目推荐
✅ 项目信息完整（名称、描述、Star 数）

**Pass/Fail Criteria**:
- ✅ PASS: 页面正常显示
- ❌ FAIL: 页面加载失败

---

## RSS 市场功能测试

### TC-MARKET-001: RSS 市场页面

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问 http://localhost:5173/rss-market
2. 观察页面内容
3. 浏览分类
4. 点击添加感兴趣的 RSS 源

**Expected Result**:
✅ 显示 RSS 源市场
✅ 按分类组织 RSS 源
✅ 可一键添加 RSS 源到个人列表

**Pass/Fail Criteria**:
- ✅ PASS: 市场页面正常，添加功能可用
- ❌ FAIL: 页面错误或添加失败

---

## 设置功能测试

### TC-SETTINGS-001: 设置页面显示

**Priority**: P1
**Type**: E2E
**Estimated Time**: 3 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问 http://localhost:5173/settings
2. 观察设置选项

**Expected Result**:
✅ 显示所有设置选项
✅ 当前设置值正确显示

**Pass/Fail Criteria**:
- ✅ PASS: 设置页面正常显示
- ❌ FAIL: 设置项缺失或值错误

---

### TC-SETTINGS-002: 修改设置

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问设置页面
2. 修改某项设置
3. 保存更改
4. 刷新页面
5. 检查设置是否保存

**Expected Result**:
✅ 设置可修改
✅ 保存后设置持久化
✅ 刷新后设置保持不变

**Pass/Fail Criteria**:
- ✅ PASS: 设置修改成功并持久化
- ❌ FAIL: 设置无法保存或丢失

---

## 数据一致性测试

### TC-DATA-001: 首页与内容列表文章数一致

**Priority**: P0
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 有文章数据

**Test Steps**:
1. 访问首页，记录总文章数
2. 访问内容列表页面
3. 选择 "全部" 频道
4. 记录文章总数
5. 对比两个数字

**Expected Result**:
✅ 首页显示的总文章数与内容列表的文章数一致

**Pass/Fail Criteria**:
- ✅ PASS: 两个页面的文章数相同
- ❌ FAIL: 文章数不一致

---

### TC-DATA-002: 频道未读数一致性

**Priority**: P0
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 有多个频道和未读文章

**Test Steps**:
1. 访问内容列表页面
2. 记录每个频道的未读数
3. 点击某个频道
4. 数一下实际的未读文章数
5. 对比是否一致

**Expected Result**:
✅ 频道显示的未读数与实际未读文章数一致

**Pass/Fail Criteria**:
- ✅ PASS: 未读数准确
- ❌ FAIL: 未读数与实际不符

---

## 导航和路由测试

### TC-NAV-001: 侧边栏导航

**Priority**: P0
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中
- 用户已登录

**Test Steps**:
1. 访问首页
2. 点击侧边栏每个导航项
3. 观察页面跳转

**Expected Result**:
✅ 首页 → /
✅ 内容列表 → /contents
✅ 频道管理 → /bloggers
✅ 热门公众号 → /popular-wechat
✅ 热门知乎 → /popular-zhihu
✅ 热门 GitHub → /popular-github
✅ RSS 市场 → /rss-market
✅ 设置 → /settings

**Pass/Fail Criteria**:
- ✅ PASS: 所有导航正确跳转
- ❌ FAIL: 任何导航项跳转错误

---

### TC-NAV-002: 页面刷新

**Priority**: P1
**Type**: E2E
**Estimated Time**: 5 minutes

**Prerequisites**:
- 系统运行中

**Test Steps**:
1. 访问任意页面
2. 按 F5 刷新
3. 观察页面是否正常加载

**Expected Result**:
✅ 页面刷新后正常显示
✅ 数据正确加载
✅ 无 404 错误

**Pass/Fail Criteria**:
- ✅ PASS: 刷新后页面正常
- ❌ FAIL: 刷新后 404 或数据丢失

---

## 响应式布局测试

### TC-RESP-001: 不同屏幕尺寸适配

**Priority**: P2
**Type**: E2E
**Estimated Time**: 10 minutes

**Prerequisites**:
- 系统运行中
- 浏览器开发者工具可用

**Test Steps**:
1. 访问首页
2. 打开开发者工具
3. 切换到响应式模式
4. 测试不同尺寸：1920x1080、1366x768、768x1024、375x667
5. 观察布局变化

**Expected Result**:
✅ 桌面端：侧边栏 + 主内容区正常显示
✅ 平板：布局自适应，内容可读
✅ 手机：侧边栏收起，汉堡菜单正常

**Pass/Fail Criteria**:
- ✅ PASS: 各尺寸下布局正常
- ❌ FAIL: 任何尺寸下布局错乱

---
