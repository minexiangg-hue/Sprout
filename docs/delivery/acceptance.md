# Sprout · 芽芽工坊验收记录

日期：2026-09-29。需求原文：[`instructions.txt`](../../instructions.txt)。基线：GraphCode `423912335b494ed259a0432f64334873dc461e7e`。本次交付是完整可运行的本地创作原型、实测证据与创业材料，不把未来订阅或云服务写成已上线功能。

## 需求逐项映射

| 用户要求 | 当前实现 / 材料 | 直接证据 |
| --- | --- | --- |
| 阅读、研究并基于原项目改造 | 架构、provider、图工作台、规划/编码/审查、持久化与交互分析 | [源码审计](../source-audit.md)，固定上游 commit |
| 原 coding 能力不改动，保留 API | 专业入口 `/#expert`；原四个引擎包与95个核心文件逐字保留 | [保留审计 JSON](../../reports/preservation.json)；原模块单元测试；真实原规划→编码→审查→应用 E2E |
| LLM 自动拆任务为模块 | Codex / 外部 API 真正生成3–6模块的计划，含文件、依赖、概念和挑战 | [真实规划与源码](../../reports/benchmarks/studio-live/project.json)，provider适配器/HTTP协议测试 |
| 项目文件、开发步骤、结构可视化 | 模块卡片/依赖标签、四阶段进度、源码面板、逐块构建和活动记录 | [项目截图](../screenshots/studio-project.png)，工坊 E2E |
| 指导助手与学习支持 | 芽芽解释下一步、编程概念、小挑战、学习自查与浏览器笔记恢复 | [恢复回归](../../reports/studio-recovery.json)；界面代码与真实浏览器操作 |
| 聚焦儿童小游戏 / 小工具 demo | 接星星、电子宠物、计时器，含胜负/重置、状态和计时交互 | 5条工坊UI旅程；实际模型计时器10项检查；实际AI修改15项检查 |
| 人机交互 / AR/VR 核查 | 保留图拖拽、缩放、绘制、源码定位；原仓库无已实现AR/VR/语音 | 原README原文、全源码搜索和源码审计；3条专业UI视觉旅程 |
| 鲜明 UI 与品牌卡通IP | 绿芽精灵、草绿/紫/奶油色、中文界面、响应式、原生SVG资产 | [品牌规范](../brand-guide.md)、[芽芽SVG](../assets/yaya.svg)、桌面/手机截图 |
| 保留外部 API，测试可用 Codex 额度 | 工坊兼容Chat Completions JSON；密钥仅服务端；本地Codex实际生成 | HTTP mock协议验收明确标注；真实模型产生的完整源码与结果，不用mock冒称实测 |
| Demo 可行性与简单 benchmark | 核心回归、浏览器游戏行为、真实生成/修改、MiniBuild与图结构评估 | [完整评估与原始报告](../benchmark.md) |
| 市场调研与竞争证据 | 22个官方/原作者来源、竞品边界、bottom-up渠道情景、验证协议 | [市场研究](../research/market-research.md)、[来源](../research/sources.md) |
| 故事、口号、定价 | 「把点子种出来，把每一步看明白」；家庭/机构试验价与成本敏感性 | [商业计划](../business-plan.md)，事实/假设/计划分开 |
| 路演 pitch deck 与 business plan | 14页HTML/PDF/PPTX与讲稿问答；完整商业计划MD/HTML/5页PDF | [材料验证](../../reports/materials-validation.json)、[逐页渲染检查](../../reports/deck-validation.json) |
| 从新工坊走向原 coding 能力 | 项目JSON解包为真实src文件；独立重建后在专业模式打开 | [交接说明](../export-to-expert.md)，6个解包安全测试，初始/重建作品各10项行为验收 |

## 已执行的工程验证

- `corepack pnpm typecheck`：全部工作区通过。
- `corepack pnpm build`：全部包与生产前端构建通过。Vite保留原专业工作台536kB分块提示；专业入口已按需加载，未为消除提示改变其能力。
- `corepack pnpm test`：30个测试文件、283个单元/集成测试通过（23 graph-model +9 graph-query +5 parser +46 agent-runtime +53 web +147 server）。
- `corepack pnpm --filter @graphcode/web exec playwright test e2e/studio.spec.ts`：5/5旅程通过，使用真实本地API；涵盖桌面/手机、三个作品、参数、隔离、导出、刷新和错误重试。
- `corepack pnpm test:expert:visual`：使用临时数据库、随机端口、种子后重开，不改变用户工作区；运行3条原专业界面测试，包含四种视口、图交互/对话框/设置与系统深色。
- 原 `agent-sidebar.spec.ts`：proposal-first全旅程通过，见 `early-browser-batch.log`。该早期混合批次同时保留了后续已修复的工坊失败；工坊最终结果以 `studio-e2e.log` 的5/5为准。
- `GRAPHCODE_RUN_CODEX_E2E=1 corepack pnpm --filter @graphcode/web exec playwright test e2e/codex-workflow.spec.ts`：真实 Codex 规划、编码、审查、应用通过，约34秒。
- `node --test scripts/unpack-project.test.mjs`：6/6；`verify-expert-handoff.mjs` 对导出与重建真实AI作品分别10/10。
- `verify-studio-recovery.mjs`：10/10，覆盖浏览器前进/后退、迟到响应、笔记恢复、弹窗键盘与焦点。
- 独立模型检查：真实创建5次调用/171.722秒，计时器10/10；随后真实修改1次调用/41.457秒，15/15，其余3模块SHA保持一致。小样本结果不代表任意任务成功率。
- MiniBuild-3：一次真实CLI生成3任务，24/24用例；重放0模型调用。图结构与context评估保留正负结果。公开WebApp1K固定前三题另行执行：锁定依赖的原文件布局2题通过/1题被上游大小写导入阻断；字节相同入口别名的兼容诊断为3题、6个原断言通过，不能视作完整1000题榜单分数。

日志保存在 [`reports/validation`](../../reports/validation)，机器报告在 [`reports`](../../reports)。生成时钟测试控制浏览器时间，不修改被测源码；接星测试固定随机数用于可重复玩法检查。

## 发现并处理的问题

1. 新路由注册导致旧错误处理器顺序不正确：原校验测试返回500而非400。将原错误处理器定义原文提前，完整旧路由回归通过。
2. 浏览器历史返回项目A时页面仍显示B：监听hash与过滤过期异步响应后，恢复回归通过。
3. 首次原Codex E2E要求模型添加的guard已存在于上游示例：产生no-op后被原审查流程拒绝。仅在测试临时副本恢复缺陷，再跑真实完整流程通过；产品引擎/示例文件未改。首次失败日志保留。
4. 原视觉测试要求「重新打开的已存工作区」，临时服务首次seed时状态为已索引：改成seed后关闭/重开临时DB，保留测试本身的断言，全部通过。
5. Linux无中文/emoji字体：中文界面与演示材料使用本地OFL字体；试玩与工坊下载将字体以内联data嵌入并保留许可；示例关键形象改用原生SVG/Canvas，避免方框占位。
6. 服务热重启返回非JSON时曾显示底层解析错误；请求层改为明确中文恢复提示，保留输入，新增JSON/非JSON错误连续重试验收。
7. AI修改的首个测试用精确accessible name定位，而生成按钮另有描述性aria-label：保留失败记录，改按指定ID与可见文本验收；未修改生成源码，未新增模型重试。

## 交付边界

- 三个示例是确定性配方，显式标注；只有选择真实提供方的新作品才由模型生成。无静默fallback冒充成功。
- 保存的模块首先存在JSON；导出工具才将它们落成src文件。HTML可独立离线运行，源码导出不依赖托管平台。
- 新层限离线浏览器小作品；原专业入口继续承担通用仓库任务。无AR/VR成品、云端账号、付费配额、教师后台、公开社区或经验证的教学成果。
- 价格/毛利/渠道/预算是规划假设；没有编造营收、客户、签约、融资或竞品胜出。模型成本未从账号额度推断现金成本。
- PowerPoint为视觉保真图片幻灯片，含演讲备注；可编辑原稿是HTML/Markdown。PDF具可选中文字，字体已嵌入。
