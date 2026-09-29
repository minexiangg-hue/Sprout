# GraphCode 源码研究与能力保留审计

审计基线：团队原项目 [JustinLinKK/graph-code](https://github.com/JustinLinKK/graph-code)，commit `423912335b494ed259a0432f64334873dc461e7e`。这是本地科研原型；当前创业版在其上增加新手 Studio，原高级工作台作为专业模式保留。下列判断来自实际源码，不把 README 里的长期方向计为已交付功能。

## 原项目实际架构

| 层 | 已实现能力与关键源码 | 产品含义 / 边界 |
| --- | --- | --- |
| 图模型 | `packages/graph-model/src/index.ts`：Zod 类型、节点/边、源码范围、proposal、work unit、模型配置等 | 文件、函数、依赖、流程是结构化数据，不只是绘制图片 |
| 解析器 | `packages/parser/src/index.ts`：TypeScript compiler API 提取 TS/JS 实体与语句级 CFG；其他语言轻量结构解析；相对导入/本地调用；确定性 ID、覆盖率、取消 | TS/JS 深度与其他语言不等价；不能宣传任意语言完整语义分析 |
| 图查询/分区 | `packages/graph-query/src/partitioning/deterministic.ts`、`contracts.ts`：有界子图、边策略、SCC、work-unit ownership、DAG、边界合同、读 halo | 模块化执行可解释；不是把图直接等同于模型推理能力 |
| 运行时 | `packages/agent-runtime/src/index.ts`：planning、coding、review、scanning；小/中/大上下文；CLI 与托管 API adapter | 原项目本来就有完整 coding 接口，不能描述成只会展示文件 |
| 上下文 | `packages/agent-runtime/src/context/` 与 `apps/local-server/src/services/work-unit-context.ts`：源码切片、版本/哈希、合同、预算、来源与遗漏 | work-unit compiler 不调用完整图读取；旧流程仍保留作为兼容与比较基线 |
| 调度与集成 | `workflow-scheduler.ts`、`model-router.ts`、`integration-runner.ts`、`contract-reconciler.ts` | 按依赖、冲突和模型/provider并发；检查实际diff写范围、过期版本、重叠、合同、临时工作区合并与命令结果；人类显式 apply |
| 本地服务/数据 | Fastify `routes.ts`、`workspace.ts`，SQLite `db/`，`.graphcode/graphcode.sqlite` | 本地工作区，不是现成云端多租户SaaS；已有API不能在重做UI时丢掉 |
| 持久记忆 | `apps/local-server/src/memory.ts`：语义/流程/事件条目、源码哈希过期检测、有界检索 | 不是通用向量检索服务，也不应称为无限长期记忆 |
| 专业交互 | `apps/web/src/App.tsx`、`components/WorkspaceCanvas.tsx`、`Inspector.tsx`、`SettingsPage.tsx` | 树/画布/检查器、多层图、节点拖动、框选边界、连接边、布局、配置和proposal评审是真实交互 |

## 编码、API 与安全边界

源码 `createProvider` 保留 `fake`、`openai`、`openrouter`、`deepseek`、`gemini`、`codex`、`claudecode` 七种 provider。托管调用通过 LangChain adapter 与 API key source；Codex/Claude 使用本地 CLI account-plan。API key源解析支持环境变量与已有设置形式。本次审计不读取或输出凭证，也不声称这些存储形式构成生产级密钥托管。

现有 `POST /api/agents/planning`、`/coding`、`/review`、`/scanning`，workflow preview/start/control/context-preview/apply-layer，proposal apply 与项目 settings 路由都属于保留范围。源码存在真实外部 API adapter ≠ 本次逐家完成真实付费联网验收：本次 live 验证使用用户授权的 Codex 额度，其余 provider 的真实账户兼容性仍需各自凭证验证。

原流程不是一种单一权限模式：托管API和 CLI proposal-only返回diff，再经review/apply；独立 CLI approve-for-me/full-access允许直接编辑，但要求干净Git工作区和可验证的范围内新diff。并行 work-unit 与 integration agent 则拒绝直接编辑，保持 proposal-only。新手 Studio 不应把这些高级权限当成默认儿童权限。

## 人机交互与 AR/VR 结论

**保留的是真实桌面图交互；AR/VR 与语音在这个 commit 中尚未实现。** 原README明确写出 voice/VR 是future work。对 `apps/`、`packages/` 的检索未发现 `navigator.xr`、WebXR session、头显/手柄追踪、SpeechRecognition 或 SpeechSynthesis 实现。`WorkspaceCanvas.tsx` 的 boundary/edge gesture 是二维鼠标画布手势，不是空中手势或空间计算。

因此路演可说“图结构适合未来探索空间交互”，不能演示或宣称“已支持AR/VR”。若做空间版本，仍需建立 WebXR/设备输入层、场景空间布局、选中/撤销/评审的一致语义，并做设备与可访问性验证。这些属于 roadmap，不计本次 demo 已有能力。

## 本次改造的兼容性证据

`node scripts/audit-preservation.mjs` 从 Git基线读取原始文件字节，比较四个 `packages/`、原服务端与原前端所有已跟踪源码（含原测试）、LICENSE的SHA-256，输出 [`reports/preservation.json`](../reports/preservation.json)。`server.ts` 与 `main.tsx`作为新功能挂载点单列diff，不把它们算成未改动；页面标题 `index.html`、原E2E进入 `/#expert` 的入口适配与Playwright启动命令也单列为集成变更。原 `App.tsx`、完整组件/样式/API、引擎/图模型/解析/查询、原路由与数据库实现需保持字节一致。

新增 Studio 的模块计划、作品构建、教学挑战、预览与参数交互是产品层扩展；这些不会自动赋予原引擎额外能力。入口挂载的正确性仍须结合应用构建、原测试与实际专业模式打开验证；hash报告只证明源码保留，不能代替运行验收。最终测试与演示证据见交付说明和 [`benchmark.md`](benchmark.md)。

## 新手模块与真实源码目录的区别

Studio内的 `modules[].files` 是模块名到源码字符串的映射，作品保存在服务端JSON；它不会每搭建一块就静默写入原GraphCode工作区。HTML导出是可独立运行的单文件，JSON导出包含模块源码、依赖、配置与教学信息。要获得真正可编辑、可扫描的文件目录，执行 `node scripts/unpack-project.mjs exported.json new-directory`；工具将源码原样写入 `src/*.html|css|js`，并生成 `index.html`、`build.mjs`、`project.json`、README。随后可以在原专业模式打开该目录，继续沿用原coding/review/apply能力。

真实AI计时器已经验证四个源码文件与JSON模块字节一致，解包及重建后的作品各通过10项浏览器检查，证据见 [`reports/expert-handoff/`](../reports/expert-handoff/)。因此“可导出真实源码文件”由显式解包步骤支持，不能把界面里的虚拟文件名映射本身称为已落盘项目。一次真实AI模块修改也验证了只变更选中的JS模块，其余三个模块源码哈希不变；详见 [`benchmark.md`](benchmark.md)。

## 回归验收中的上游测试输入修正

原 `codex-workflow.spec.ts` 要求模型为折扣函数添加最低消费guard，但当前基线的 `examples/review-proposal-lab/src/discount.ts` 已包含该guard。首次真实Codex流程因此产生no-op diff并被review拒绝；这体现原评审保护，没有证据表明是新Studio造成的引擎回归。首次日志保留在 [`original-codex-initial.log`](../reports/validation/original-codex-initial.log)。后续验收仅在该测试创建的临时副本中移除已存在guard，恢复原测试预期的待修缺陷；仓库示例和原引擎不变。此E2E fixture适配也包含在preservation报告的单列diff中。修正输入后，真实Codex provider的planning → coding → review → implementation全流程 **1项通过，34.0秒**，原始日志见 [`original-codex-fixed.log`](../reports/validation/original-codex-fixed.log)。这是一项真实流程验收，不是模型总体成功率。最终保留审计为 **95/95原核心文件字节一致**，7个入口/浏览器集成文件单列审阅。

## 值得展示的差异与尚未证明的命题

可展示“看得见的模块、依赖、源码与审核流程”——这些由原能力和新手Studio共同支撑。实际context benchmark发现小样本上新上下文更长，不能将bounded context宣传成已证实省token；六个fixture的边局部性改善不能推出生产编码成功率改善。既有ablation脚本中有 fake provider 与结构推导proxy指标，不应把其 patch/test success 字段当成真实模型通过率。

儿童学习收益、家庭留存、教师备课效率、支付意愿、生成内容安全、线上多租户隔离、计费与额度、AR/VR均需要后续独立验证/建设。保留原 MIT LICENSE（含 Justin Lin 的版权声明），发行时保留相应声明；这是文件保留记录，不替代正式商业法务审查。
