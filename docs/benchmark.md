# 可复现评估：MiniBuild 与图工程基线

这组评估为 demo提供可追溯工程证据：包括公开第三方 **WebApp1K** 固定前三题的小样本（第6节）、原仓库图工程回归集、自建 **GraphCode MiniBuild-3 v1.0.0** 与真实产品工作流。每类证据分开报告；不将自建集合包装为第三方benchmark，也不声称胜过任何竞品。

## 1. 原仓库图工程实测

输入是原commit自带的六个合成fixture：independent leaves、shared interface、same-file functions、cycle、cross-package、parent integration。输入和原benchmark实现均未为了结果改写。环境：Linux x64，Node v24.18.0。命令：

```bash
node scripts/benchmark-structure.mjs
```

| 指标 | 实测 | 解释 |
| --- | --- | --- |
| 关系边局部性 | legacy round-robin 0/6；拓扑分区 4/6 (66.7%) | 当前6条fixture关系边的同分区比例，不是编码准确率 |
| 边界覆盖 | 2/2，2个interface contract，0忽略 | 切开的两条边被显式描述 |
| 唯一ownership / 无环 / 确定性 | 全通过 | 同一测试输入的工程不变量 |
| context工作单元 | 18，来自6个fixture | 合成源码按声明行号生成 |
| 新context估计token | 37,101 | 四字符/token保守估计，不是provider计费token |
| legacy coding/review估计token | 20,314 / 19,378 | 使用各unit同tier旧prompt作比较 |
| 相对legacy长度变化 | coding **增加82.6%**；review **增加91.5%** | 当前小样本中结构元数据成本更大；不能说已省token |
| 源码可见/预算 | 全部通过 | 检查语义为“精确owned源码存在，或缺失有显式失败”；不等于模型充分理解 |
| context compiler完整项目读取 | false | 指bounded compiler，旧shadow比较本身读取legacy图 |
| 外部模型调用 | 0 | 不衡量真实模型质量、服务延时、生产并发提速或成本 |

完整机器可读结果：[`agent-partitioning.json`](../reports/benchmarks/agent-partitioning.json)、[`agent-context.json`](../reports/benchmarks/agent-context.json)。比例分母很小，不进行统计显著性或代表性推断。

## 2. MiniBuild-3：真实CLI生成 + 功能验收

语料先写在 [`scripts/minibuild-spec.mjs`](../scripts/minibuild-spec.mjs)，再执行生成。三项分别是接星星游戏状态机、专注计时器、测验评分。每项8个功能用例，总24个；含状态终结、计时归零、缺省答案、数字0、原型属性名、输入不变与返回新对象等边界。模型收到函数接口与完整需求，未收到测试实现，但测试公开，不称作隐藏集。

实测 **3/3任务、24/24功能用例通过**。每项一次生成、无修复、无重排、无工具调用。使用本机 `codex-cli 0.153.4` 已登录账户，CLI配置默认模型（本次CLI事件未提供解析后的model id，因此不作特定模型排名或跨模型比较）。生成响应、prompt、哈希、用例明细、CLI usage与延时全部保留。原样重放也通过24/24。

| 任务 | 功能用例 | 首次生成等待时间 | CLI报告input / output tokens |
| --- | --- | --- | --- |
| Catch the Stars | 8/8 | 8,276 ms | 13,769 / 132 |
| Focus Timer | 8/8 | 11,282 ms | 13,766 / 254 |
| Quiz Score | 8/8 | 9,175 ms | 13,784 / 190 |

token数据包括CLI上下文开销，不能拿任务prompt字符数作为实际成本；账户额度不换算成API价格。延时是本机单次观测，没有置信区间或稳定性保证。

无模型调用的重放：

```bash
node scripts/benchmark-minibuild.mjs --replay
```

重新真实生成（需要本机已登录Codex并消耗该账户额度；默认覆盖本地报告，建议新输出目录保存多次结果）：

```bash
MINIBUILD_OUTPUT=/tmp/minibuild-rerun node scripts/benchmark-minibuild.mjs
# 为对比固定模型时，显式设置本机已授权的 MINIBUILD_MODEL。
```

结果：[`result.json`](../reports/benchmarks/minibuild/result.json)、[`replay.json`](../reports/benchmarks/minibuild/replay.json)。此测试只直接调用同类CLI provider，不经过Studio或原coding-review-apply链路；**不能宣称产品端到端通过率是100%**。它验证简单纯逻辑生成，不能证明界面质量、任意仓库改动、教育效果、儿童安全或总体agent能力。三项任务过于简单且作者自选，下一轮应预先冻结更大任务集，增加完整应用的浏览器行为验收、未通过案例与固定预算重复运行。

## 3. 真实 Studio 模块构建与浏览器验收

为避免只测CLI逻辑而跳过产品，我们另冻结一个中文太空专注计时器需求，实际调用 `StudioService → StudioModels → Codex CLI`（无mock），生成HTML、CSS、计时引擎JS、反馈JS四个模块。**一次plan加四次build，五次真实调用全部完成，未重试、未修复；完整生成等待171,722 ms，约2分52秒。** 各次为30,481 / 20,747 / 53,287 / 37,255 / 29,952 ms，包含最慢的CSS生成，不挑选最快步骤作为整体速度。

调用使用 `codex-cli 0.153.4`，未指定 `SPROUT_CODEX_MODEL`，adapter启用 `--ignore-user-config`，因此只准确记录“CLI默认模型”，不能推测具体model id。结果与完整生成源码在 [`studio-live/result.json`](../reports/benchmarks/studio-live/result.json) 和 [`project.json`](../reports/benchmarks/studio-live/project.json)。

随后对**原样生成的HTML**在真实Chromium的 `sandbox="allow-scripts"` iframe内执行功能验收，控制浏览器时钟而不改生成代码：初始时间、开始后倒计时、暂停保持、重置恢复、重置后停止、归零、完成文字、完成后重玩、无运行时错误、无网络请求，共 **10/10通过**。浏览器证据见 [`browser.json`](../reports/benchmarks/studio-live/browser.json)、[试玩截图](../reports/benchmarks/studio-live/preview.png)、[完整离线作品](../reports/benchmarks/studio-live/preview.html)。

```bash
# 无模型调用：重放已保存的原样产物（需要Playwright Chromium）
node scripts/benchmark-studio-browser.mjs
# 重新真实生成：需要Codex账户，会消耗额度；保存到新目录保留所有运行结果
STUDIO_BENCHMARK_OUTPUT=/tmp/studio-rerun corepack pnpm --filter @graphcode/local-server exec tsx ../../scripts/benchmark-studio.ts
# 再对新产物验收
STUDIO_BENCHMARK_OUTPUT=/tmp/studio-rerun node scripts/benchmark-studio-browser.mjs
```

这是**一个自选任务、一次生成的产品服务与iframe证据**；没有测试更多prompt的泛化，也没有多次采样成功率。服务调用不是HTTP路由或整个Studio UI的端到端验收；完整用户界面的模板创建/操作/导出/刷新和异常恢复由独立Playwright E2E验证。不能据此声称“所有需求100%生成成功”或“生成只需8秒”。

## 4. 一次真实 AI 模块修改与可编辑源码交接

在上面的**同一个**作品副本中，仅选择已完成的 `timer-engine` JS模块，调用真实 `StudioService.build({moduleId,instruction})`，要求添加 `id="add-minute"`、可见文字“加一分钟”的按钮，运行和暂停状态都能增加60秒，且保留原控制与模块接口。**额外1次Codex调用、41,457 ms、无模型修复**。该修改是第3节之后的独立增量实验，不将它计入原五次调用或冒充另一个独立生成样本。

SHA-256比较确认其他三个模块源码完全不变。对原样修改产物做Chromium验证，**15/15检查通过**：按钮契约、暂停/运行加60秒及状态保持、恢复计时、重置恢复初始时长且停止、归零反馈、完成后再玩和无runtime/network错误。证据：[`studio-revision/result.json`](../reports/benchmarks/studio-revision/result.json)、[`browser.json`](../reports/benchmarks/studio-revision/browser.json)、[修改后作品](../reports/benchmarks/studio-revision/preview.html)。

第一次浏览器harness错误地要求按钮accessible name精确等于可见文字；模型给按钮增加了更长的描述性 `aria-label`，导致测试定位超时。该失败[完整保留](../reports/benchmarks/studio-revision/browser-initial-locator-failure.json)。修正harness为验证需求明确指定的 `button#add-minute` 与可见文字后重跑；生成源码的artifact hash不变，未新增模型调用。15项通过并不抹去这次测试实现缺陷。

```bash
# 重放修改后产物，无模型调用
node scripts/benchmark-studio-revision-browser.mjs
# 重新请求同一修改，额外消耗Codex额度，独立保存
STUDIO_REVISION_INPUT="$PWD/reports/benchmarks/studio-live/project.json" STUDIO_REVISION_OUTPUT=/tmp/studio-revision-rerun corepack pnpm --filter @graphcode/local-server exec tsx ../../scripts/benchmark-studio-revision.ts
```

原始生成作品还通过 `scripts/unpack-project.mjs` 转成可编辑目录；四个 `src/` 源码与导出JSON完全一致。初次 `index.html` 与执行 `node build.mjs` 后的产物各通过10项浏览器行为验收。结果：[解包源码比对](../reports/expert-handoff/unpack.json)、[初次产物](../reports/expert-handoff/initial.json)、[重建产物](../reports/expert-handoff/rebuilt.json)。重放全流程：

```bash
node scripts/verify-expert-handoff.mjs
```

另外，独立UI恢复回归确认浏览器Back/Forward对应正确项目、离开页面后的迟到build响应不覆盖新选择、示例自由改写禁用、学习笔记/自查刷新保留，以及dialog键盘焦点行为，共10项通过。见 [`studio-recovery.json`](../reports/studio-recovery.json)；运行中的本地服务可用 `node scripts/verify-studio-recovery.mjs` 重复验证。它使用预设demo项目，**不**把这些检查计为模型生成能力。

## 5. 原专业 coding 工作流的真实回归

原仓库的Codex Playwright流程在修正临时测试输入后，真实完成 planning → coding → review → implementation，**1项通过，34.0秒**。见 [`original-codex-fixed.log`](../reports/validation/original-codex-fixed.log)。它验证原专业入口仍可用，不将它混入自建MiniBuild或Studio的统计。

首次运行失败也保留在 [`original-codex-initial.log`](../reports/validation/original-codex-initial.log)：上游示例已包含测试要求添加的guard，模型产生no-op diff被评审拒绝。修正只在测试创建的临时副本中恢复待修缺陷，原示例和引擎不变。该事实与完整保留范围详见 [`source-audit.md`](source-audit.md)。不要删掉初始失败或宣传未经限定的“全部首次通过”。

## 6. 公开第三方 WebApp1K：固定前三题、官方原测试

补充选择公开的 [WebApp1K官方仓库](https://github.com/onekq/WebApp1k/tree/00895306c81d5329904827b65f4a933ce3cb8746)，固定commit `00895306c81d5329904827b65f4a933ce3cb8746`，许可为 [MIT / ©2024 onekq](https://github.com/onekq/WebApp1k/blob/00895306c81d5329904827b65f4a933ce3cb8746/LICENSE)。它提供React组件生成与Jest测试；我们明确使用原始 `tests/` 的1,000题集合，不使用当前 `run_eval.py` 默认的 `duo_tests` 集合。

**在生成前**将所有 `tests/**/*.test.js` 按仓库相对POSIX路径的codepoint顺序排序，固定取最前3题：`addAltTextToImage`、`addCanonicalUrl`、`addComment`。没有根据结果换题、补题或挑选成功结果；三题都属于blogging类别，因此样本有明显局限。冻结时间、官方题目与SHA见 [`selection.json`](../reports/benchmarks/webapp1k/selection.json)。

直接执行上游 `generate_implementation` 的第一次prompt构造与 `extract_code`；官方协议本来就向模型提供完整测试，因此**不是隐藏测试**。只将模型调用替换为实际Codex CLI 0.153.4，三题均显式指定 `gpt-6-astra`、medium reasoning，每题一次、无工具、无代码修复，三次生成总等待 **40,511 ms**。Codex系统上下文/生成上限与官方托管API适配器不完全相同，不作官方排行榜分数比较。[官方生成器源码](https://github.com/onekq/WebApp1k/blob/00895306c81d5329904827b65f4a933ce3cb8746/generate_code.py)

| 条件 | 官方测试结果 | 判断 |
| --- | --- | --- |
| 原始 `latest` 依赖、原文件布局 | 3套加载失败；0断言执行 | React Router 7与旧Jest解析器不兼容；fetch-mock 12还缺少原测试调用的reset/restore/calls，不能算模型失败 |
| 中间依赖准备、缺node-fetch peer | 3套加载失败；0断言执行 | 环境排错记录完整保留，没有新模型调用 |
| 锁定兼容依赖、**严格原文件布局** | **2题通过，1题加载阻断；已运行4个断言全过** | 第一题import大写 `./AddAltTextToImage`，上游生成器却写小写 `addAltTextToImage.js`；Linux区分大小写 |
| 单独兼容性诊断：仅增加字节相同的大小写文件名别名 | **3题、6个官方原断言全过** | 原题、测试、断言、prompt与生成源码体完全不改；不能将此说成未适配的原始harness结果 |

大小写问题可以直接核查[第一题官方test](https://github.com/onekq/WebApp1k/blob/00895306c81d5329904827b65f4a933ce3cb8746/tests/react/blogging/addAltTextToImage.test.js)与上述生成器文件名规则。所有原始错误、Jest JSON、一次生成输出、prompt、测试、MIT声明、最终依赖manifest/lockfile均在 [`reports/benchmarks/webapp1k/`](../reports/benchmarks/webapp1k/)；完整机器汇总见 [`summary.json`](../reports/benchmarks/webapp1k/summary.json)，安装和重放见 [该目录README](../reports/benchmarks/webapp1k/README.md)。测试SHA与所有生成实现SHA均已再次核对一致。

```bash
# 按reports目录README准备固定commit与锁定依赖后：
node scripts/benchmark-webapp1k.mjs
# 该严格布局命令预期因上游大小写问题退出1；保留结果。
node scripts/benchmark-webapp1k.mjs --case-alias
node scripts/summarize-webapp1k.mjs
# 上述均重放保存的模型输出，不调用模型。
```

这是**公开第三方题目的微型兼容性实测**，不是完整WebApp1K、不是Studio端到端评测、不是儿童创作任务集。不能声称WebApp1K总体100%、统计性pass@1、教育收益或模型/产品领先。对外应同时披露“固定3题、官方原断言、锁定依赖和文件名兼容适配”，并保留严格布局中1题未执行的事实。

## 可直接用于路演的准确措辞

> 我们保留原GraphCode编码引擎，为新手加入模块化创作入口。真实AI生成的计时器和单模块修改经过浏览器验收；MiniBuild与公开WebApp1K固定小样本也保留了代码、原测试和全部错误记录。这些是可复现的demo证据，公开benchmark样本存在已披露的环境兼容适配，不是完整排行榜成绩；当前没有儿童学习效果和竞品优劣的实测结论。

不要使用：“最强coding agent”“比竞品准确率高66.7%”“节省82.6% token”“已有AR/VR”“24个完整应用全部成功”。这些说法均不被本次证据支持。
