# 软件开发生命周期 Skills 组合

本文件定义了从用户访谈到测试交付的完整软件开发生命周期中，各阶段推荐使用的 Skills 组合。

---

## 完整流程概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        软件开发生命周期 Skills 组合                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1.用户访谈        2.需求分析        3.设计阶段        4.开发阶段              │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐             │
│  │product- │      │product- │      │database │      │backend  │             │
│  │manager  │  →   │requirements│ →  │-schema  │  →   │development│          │
│  │intent-  │      │docs-ai  │      │-designer│      │frontend │             │
│  │interview│      │-prd     │      │ui-ux-   │      │dev-guidelines        │
│  └─────────┘      └─────────┘      │pro-max  │      └─────────┘             │
│                                    └─────────┘                              │
│                                                                             │
│  5.联调测试        6.质量保证        7.项目管理                               │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐                              │
│  │webapp   │      │senior-qa│      │project- │                              │
│  │testing  │  →   │test-    │  →   │planning │                              │
│  │api-     │      │master   │      │workflow │                              │
│  │contract │      │playwright│     │sdd-dev  │                              │
│  └─────────┘      └─────────┘      └─────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 阶段一：用户访谈与需求收集

### 目标
- 理解用户需求和业务目标
- 收集功能需求和非功能需求
- 识别关键利益相关者

### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **product-manager** | `npx skills add aj-geddes/claude-code-bmad-skills@product-manager` | 产品管理、需求梳理 |
| **intent-interview** | `npx skills add arcblock/idd@intent-interview` | 用户意图访谈 |
| **product-management** | `npx skills add vasilyu1983/ai-agents-public@product-management` | 产品管理方法论 |

### 工作流程
1. 使用 `intent-interview` 进行结构化用户访谈
2. 使用 `product-manager` 整理和分析需求
3. 输出：用户故事、需求列表、业务目标

---

## 阶段二：需求分析与 PRD 编写

### 目标
- 编写产品需求文档 (PRD)
- 明确功能规格和验收标准
- 制定开发计划

### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **product-requirements** | `npx skills add cexll/myclaude@product-requirements` | 产品需求文档编写 |
| **docs-ai-prd** | `npx skills add vasilyu1983/ai-agents-public@docs-ai-prd` | AI 辅助 PRD 生成 |
| **requirements-analysis** | `npx skills add jwynia/agent-skills@requirements-analysis` | 需求分析 |
| **requirements-clarity** | `npx skills add davila7/claude-code-templates@requirements-clarity` | 需求澄清 |
| **planning-with-files** | *(已内置)* | 规划与进度跟踪 |

### 工作流程
1. 使用 `product-requirements` 或 `docs-ai-prd` 生成 PRD 框架
2. 使用 `requirements-analysis` 进行需求深度分析
3. 使用 `planning-with-files` 创建项目计划文档
4. 输出：PRD 文档、功能规格书、开发计划

---

## 阶段三：设计阶段

### 3.1 UI/UX 设计

#### 目标
- 设计用户界面和交互流程
- 制定设计系统和视觉规范

#### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **ui-ux-pro-max** | *(已安装)* | **UI/UX 设计（最高优先级）** |
| **frontend-design** | `npx skills add anthropics/skills@frontend-design` | 前端界面设计 |

#### 工作流程
1. **首先调用 `ui-ux-pro-max`** 进行界面设计
2. 生成设计稿、组件库、样式规范
3. 输出：UI 设计稿、设计系统文档

### 3.2 数据库设计

#### 目标
- 设计数据库架构
- 定义数据模型和关系

#### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **database-schema-designer** | `npx skills add softaworks/agent-toolkit@database-schema-designer` | 数据库架构设计 |
| **database-design** | `npx skills add sickn33/antigravity-awesome-skills@database-design` | 数据库设计规范 |
| **database-schema-design** | `npx skills add aj-geddes/useful-ai-prompts@database-schema-design` | 数据库模式设计 |

#### 工作流程
1. 使用 `database-schema-designer` 设计数据库架构
2. 使用 `database-design` 进行设计评审
3. 输出：ER 图、数据库 Schema、迁移脚本

---

## 阶段四：开发阶段

### 4.1 后端开发

#### 目标
- 实现 API 接口
- 业务逻辑开发

#### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **senior-backend** | `npx skills add davila7/claude-code-templates@senior-backend` | 后端开发最佳实践 |
| **backend-development** | `npx skills add mrgoonie/claudekit-skills@backend-development` | 后端开发流程 |
| **nodejs-backend** | `npx skills add alinaqi/claude-bootstrap@nodejs-backend` | Node.js 后端开发 |

#### 工作流程
1. 使用 `senior-backend` 进行架构设计
2. 使用 `backend-development` 指导开发流程
3. 输出：API 接口、业务逻辑代码

### 4.2 前端开发

#### 目标
- 实现用户界面
- 前端交互开发

#### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **ui-ux-pro-max** | *(已安装)* | **前端开发（最高优先级）** |
| **frontend-dev-guidelines** | `npx skills add sickn33/antigravity-awesome-skills@frontend-dev-guidelines` | 前端开发规范 |
| **vue-best-practices** | *(已内置)* | Vue.js 最佳实践 |
| **vue-development-guides** | *(已内置)* | Vue.js 开发指南 |

#### 工作流程
1. **首先调用 `ui-ux-pro-max`** 进行组件开发
2. 使用 `vue-best-practices` 进行 Vue 项目开发
3. 输出：前端组件、页面、交互逻辑

---

## 阶段五：联调与集成测试

### 目标
- 前后端接口联调
- API 契约测试

### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **webapp-testing** | `npx skills add anthropics/skills@webapp-testing` | Web 应用测试 |
| **api-contract-testing** | `npx skills add aj-geddes/useful-ai-prompts@api-contract-testing` | API 契约测试 |
| **integration-testing** | `npx skills add aj-geddes/useful-ai-prompts@integration-testing` | 集成测试 |
| **httpie-api-test** | *(已内置)* | API 接口测试 |

### 工作流程
1. 使用 `httpie-api-test` 进行 API 接口测试
2. 使用 `api-contract-testing` 验证接口契约
3. 使用 `integration-testing` 进行集成测试
4. 输出：测试报告、Bug 列表

---

## 阶段六：质量保证与测试

### 目标
- 全面测试覆盖
- 性能和安全测试

### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **senior-qa** | `npx skills add davila7/claude-code-templates@senior-qa` | QA 最佳实践 |
| **test-master** | `npx skills add jeffallan/claude-skills@test-master` | 测试管理 |
| **qa-expert** | `npx skills add daymade/claude-code-skills@qa-expert` | QA 专家指导 |
| **qa-testing-playwright** | `npx skills add vasilyu1983/ai-agents-public@qa-testing-playwright` | Playwright E2E 测试 |
| **qa-testing-strategy** | `npx skills add vasilyu1983/ai-agents-public@qa-testing-strategy` | 测试策略 |
| **vue-testing-best-practices** | *(已内置)* | Vue 测试最佳实践 |
| **playwright-testing** | `npx skills add alinaqi/claude-bootstrap@playwright-testing` | Playwright 测试 |

### 工作流程
1. 使用 `senior-qa` 制定测试策略
2. 使用 `qa-testing-playwright` 或 `playwright-testing` 进行 E2E 测试
3. 使用 `vue-testing-best-practices` 进行前端单元测试
4. 输出：测试报告、覆盖率报告

---

## 阶段七：项目管理与交付

### 目标
- 项目进度管理
- 规范驱动开发

### 推荐 Skills

| Skill | 安装命令 | 用途 |
|-------|---------|------|
| **project-planning** | `npx skills add jezweb/claude-skills@project-planning` | 项目规划 |
| **project-workflow** | `npx skills add jezweb/claude-skills@project-workflow` | 项目工作流 |
| **sdd-development** | *(已内置)* | 规范驱动开发 |
| **planning-with-files** | *(已内置)* | 文件化规划 |

### 工作流程
1. 使用 `project-planning` 进行项目规划
2. 使用 `sdd-development` 进行规范驱动开发
3. 使用 `planning-with-files` 跟踪项目进度
4. 输出：项目计划、进度报告、交付物

---

## 快速安装脚本

### 一键安装所有 Skills

```bash
#!/bin/bash
# 软件开发生命周期 Skills 组合安装脚本

echo "🚀 开始安装软件开发生命周期 Skills 组合..."

# 阶段一：用户访谈与需求收集
echo "📋 安装阶段一：用户访谈与需求收集..."
npx skills add aj-geddes/claude-code-bmad-skills@product-manager -g -y
npx skills add arcblock/idd@intent-interview -g -y
npx skills add vasilyu1983/ai-agents-public@product-management -g -y

# 阶段二：需求分析与 PRD 编写
echo "📝 安装阶段二：需求分析与 PRD 编写..."
npx skills add cexll/myclaude@product-requirements -g -y
npx skills add vasilyu1983/ai-agents-public@docs-ai-prd -g -y
npx skills add jwynia/agent-skills@requirements-analysis -g -y
npx skills add davila7/claude-code-templates@requirements-clarity -g -y

# 阶段三：设计阶段
echo "🎨 安装阶段三：设计阶段..."
npx skills add anthropics/skills@frontend-design -g -y
npx skills add softaworks/agent-toolkit@database-schema-designer -g -y
npx skills add sickn33/antigravity-awesome-skills@database-design -g -y
npx skills add aj-geddes/useful-ai-prompts@database-schema-design -g -y

# 阶段四：开发阶段
echo "💻 安装阶段四：开发阶段..."
npx skills add davila7/claude-code-templates@senior-backend -g -y
npx skills add mrgoonie/claudekit-skills@backend-development -g -y
npx skills add alinaqi/claude-bootstrap@nodejs-backend -g -y
npx skills add sickn33/antigravity-awesome-skills@frontend-dev-guidelines -g -y

# 阶段五：联调与集成测试
echo "🔌 安装阶段五：联调与集成测试..."
npx skills add anthropics/skills@webapp-testing -g -y
npx skills add aj-geddes/useful-ai-prompts@api-contract-testing -g -y
npx skills add aj-geddes/useful-ai-prompts@integration-testing -g -y

# 阶段六：质量保证与测试
echo "✅ 安装阶段六：质量保证与测试..."
npx skills add davila7/claude-code-templates@senior-qa -g -y
npx skills add jeffallan/claude-skills@test-master -g -y
npx skills add daymade/claude-code-skills@qa-expert -g -y
npx skills add vasilyu1983/ai-agents-public@qa-testing-playwright -g -y
npx skills add vasilyu1983/ai-agents-public@qa-testing-strategy -g -y
npx skills add alinaqi/claude-bootstrap@playwright-testing -g -y

# 阶段七：项目管理与交付
echo "📊 安装阶段七：项目管理与交付..."
npx skills add jezweb/claude-skills@project-planning -g -y
npx skills add jezweb/claude-skills@project-workflow -g -y

echo "✨ 所有 Skills 安装完成！"
echo ""
echo "📚 使用指南："
echo "   - 查看完整文档：.github/dev-workflow-skills.md"
echo "   - 查看技能优先级：.github/agents.md"
```

保存为 `install-dev-skills.sh` 后执行：
```bash
chmod +x install-dev-skills.sh
./install-dev-skills.sh
```

---

## Skills 优先级速查表

| 开发阶段 | 最高优先级 Skill | 次选 Skills |
|---------|-----------------|------------|
| 用户访谈 | `intent-interview` | `product-manager`, `product-management` |
| PRD 编写 | `docs-ai-prd` | `product-requirements`, `requirements-analysis` |
| UI/UX 设计 | **ui-ux-pro-max** | `frontend-design` |
| 数据库设计 | `database-schema-designer` | `database-design` |
| 后端开发 | `senior-backend` | `backend-development` |
| 前端开发 | **ui-ux-pro-max** | `frontend-dev-guidelines`, `vue-best-practices` |
| 联调测试 | `webapp-testing` | `api-contract-testing`, `httpie-api-test` |
| QA 测试 | `senior-qa` | `qa-testing-playwright`, `vue-testing-best-practices` |
| 项目管理 | `project-planning` | `sdd-development`, `planning-with-files` |

---

## 更新记录

- **2026-01-30**: 初始版本，覆盖完整软件开发生命周期

---

*本文档与 `.github/agents.md` 配合使用，确保在正确的时间调用正确的 Skills。*
