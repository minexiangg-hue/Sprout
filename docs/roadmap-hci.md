# 多模态交互 · 实施操作手册（语音 / 眼动 / VR-AR）

> 目标：让开发者脱离鼠标键盘，用语音下达指令、用眼动辅助指向、用 VR/AR 浏览代码。
> 本文档是一份**可照着做的一步步操作手册**：每一步给出目标、操作、完成标志。**当前只做阶段 0 + 阶段 1（语音）**，阶段 2（眼动）、阶段 3（VR/AR）为后续步骤，不宣称已有实现。

---

## 0. 背景与骨架（为什么要按这个顺序做）

五个词分属三层，**语音、眼动、VR/AR 全部插在同一个底座上**，所以先做底座：

```text
[人] ──音频/视线/手势──► 模态前端（语音/眼动/VR）   不是 MCP，是传感器 + I/O
                             │ 输出统一的「意图」+「当前焦点」
                             ▼
                    [大脑]：把意图解析成动作          LLM / 多模态推理层
                             │ 调用工具
                             ▼
                   GraphCode 动作面（命令层）         ← 这块才是 MCP：工具 schema + 调用
```

三条结论（后面每一步都建立在这之上）：

1. **只有中间那块是 MCP**：要设计的是一个「GraphCode MCP server」= 把命令层暴露成标准工具面；语音/眼动/VR 是插在它前面的不同控制器。
2. **联合交互必须单一融合大脑**：「看着 `parser` 说『这个』」要求一个推理层同时看到语音转写 + 凝视目标，而不是语音、眼动各一个大脑各说各话。
3. **依赖顺序固定**：命令层（0）→ 语音（1）→ 眼动（2）→ VR/AR（3）。命令层是所有模态的地基。

**护城河**（写进 pitch）：不是语音/眼动/VR 本身，而是**「仓库 = 一个可寻址、可操作、有单一命令面的图」**——寻址单位是「parser 那个函数」而不是「第 42 行」，这让三种模态能叠加而不是打架。

---

## 1. 总览：工作拆解一览表

| 阶段 | 步骤数 | 产出 | 一句话验收 |
| --- | --- | --- | --- |
| 阶段 0 命令层 | 4 | `commands.ts` + 命令注册表 + 上下文 | 无键鼠，脚本经 `runCommand` 完成 开仓库→扫描→规划 |
| 阶段 1 语音 | 7 | voice client + 函数 schema + 桥 + 回读 | 全程语音完成 开仓库→扫描→规划→编码→评审→应用，动作有语音回读 |
| 阶段 2 眼动 | 4 | WebGazer 接入 + 凝视上下文 | 看节点 +「这个」+「打开」正确解析，误触低于阈值 |
| 阶段 3 VR/AR | 3 | 3D 图 + 手柄命令 | VR 走架构理解测验 ≥ 2D 对照 |

---

## 阶段 0：命令层底座（先做，决定一切）

### Step 0.1 建立命令注册表

**目标**：新建一个集中的命令层，让任何「控制器」都能用同一套名字触发动作。

**操作**：新建 `apps/web/src/commands.ts`，定义：

- `Command` 类型：`{ name, description, argsSchema, run(ctx, args) => Promise<CommandResult> }`
- `CommandResult`：`{ ok: boolean; summary: string; data?: unknown }` —— `summary` 是**给人念的一句话**，后面 TTS 回读直接用它
- `CommandContext`：`{ projectId, selectedNodeId, viewport, ... }` —— 供命令读取当前焦点
- `registerCommand(...)` / `runCommand(name, args)` / `listCommands()`
- 全局暴露 `window.__graphcode.commands = { runCommand, listCommands }`（仅 dev，便于脚本验证）

**完成标志**：`runCommand` 能注册/查找/执行命令；`listCommands()` 打印出完整命令清单。

### Step 0.2 把高频动作收敛成命令（先做 6 个跑通闭环）

**目标**：把 [App.tsx](../apps/web/src/App.tsx) 里散落的 `handle*` 回调，包装成命名命令。**先做最小闭环的 6 个，不要一次做全。**

**操作**：为以下动作注册命令，`run` 内部调用现有 handler / [api.ts](../apps/web/src/api.ts) 函数：

| 命令名 | 复用现有代码 | 参数 | `summary` 示例 |
| --- | --- | --- | --- |
| `open_workspace` | `handleOpenWorkspaceRequest` / `api.openWorkspace` | `rootPath` | 已打开仓库 `…` |
| `focus_node` | `handleCanvasNodeSelect` / `handleOpenNode` | `nodeId` | 已聚焦 `…` |
| `scan` | `api.runScanningAgent` | `scope` | 扫描完成，发现 N 个模块 |
| `plan` | `handleRunPlanning` | `prompt` | 规划完成，生成 N 个 ticket |
| `code` | `handleStartCode` | `nodeId`, `mode`, `prompt` | 编码完成，产出 diff |
| `review` | `api.runReviewAgent` | `runId` | 评审结论：通过 / 有 bug |

**完成标志**：这 6 个命令能各自执行并返回带 `summary` 的结果。

### Step 0.3 暴露上下文状态

**目标**：把「当前焦点」收敛成机器可读，供 LLM 消歧（「打开**那个**文件」里的「那个」）。

**操作**：把 `App.tsx` 现有的 `selectedNodeId` / `selectedProjectId` / 视口收敛到一个可订阅的 store（或直接喂给 `runCommand` 的 `ctx`）。已有基础：[canvasSession.ts](../apps/web/src/canvasSession.ts) 已持久化视口与 scope。

**完成标志**：任意时刻能从外部读到「当前项目 + 当前选中节点 + 视口」。

### Step 0.4 无键鼠验证命令层

**目标**：证明「命令层 = 手」，之后语音/眼动/VR 只是「握这只手」的不同姿势。

**操作**：在浏览器 console 里依次执行（或写一个临时脚本）：

```js
await __graphcode.commands.runCommand("open_workspace", { rootPath: "…" });
await __graphcode.commands.runCommand("scan", { scope: "medium" });
await __graphcode.commands.runCommand("plan", { prompt: "给 parser 模块做一个去重" });
```

**完成标志**：全程不碰鼠标键盘，仅靠脚本完成 开仓库→扫描→规划。**这是阶段 0 的验收线。**
（可选加固：把现有键盘快捷键监听 [App.tsx](../apps/web/src/App.tsx) 里 `handleUndo` 那处，改为经 `runCommand("undo")` 触发，证明键盘也只是命令层的一个客户端。）

---

## 阶段 1：语音接入（当前重点）

### Step 1.1 准备 Deepgram 与安全边界

**目标**：拿到语音能力，且 **API 密钥绝不进浏览器**。

**操作**：

- 在 [console.deepgram.com](https://console.deepgram.com) 注册，获取 API Key（免费 $200 额度）
- 采用「服务端换短时 token」：Deepgram 支持短时 auth token；浏览器只拿短时 token，不接触主密钥

**完成标志**：主密钥只存在于服务端环境变量 `DEEPGRAM_API_KEY`；浏览器侧无任何密钥硬编码。

### Step 1.2 后端加 `/api/voice/token`

**目标**：让 GraphCode 自己的本地服务端（Fastify，[apps/local-server](../apps/local-server/src)）签发 Deepgram 短时 token。

**操作**：

- 在 `apps/local-server/src` 新增 `POST /api/voice/token`：读取服务端 `DEEPGRAM_API_KEY`，调 Deepgram 的 ephemeral key 接口，返回短时 token 给浏览器
- 与现有路由保持一致（参照 [routes.ts](../apps/local-server/src/routes.ts) 的写法；工坊层 [studio/routes.ts](../apps/local-server/src/studio/routes.ts) 有本机来源校验的样板）

**完成标志**：`curl -X POST http://127.0.0.1:3010/api/voice/token` 返回一个可用的短时 token。

### Step 1.3 前端 voice client（麦克风 → WebSocket → 语音 agent）

**目标**：浏览器采集麦克风音频，接 Deepgram Voice Agent，音频进、音频出。

**操作**：新建 `apps/web/src/voice/client.ts`：

- `getUserMedia` 拿麦克风 → 用短时 token 建 WebSocket 连 Deepgram Voice Agent
- 配置三件套：`listen`(STT nova-3)、`think`(LLM gpt-4o-mini + `instructions` + `functions`)、`speak`(TTS aura-2)
- 收 `ConversationText`、`SettingsApplied` 等事件；二进制帧直接播给扬声器

**完成标志**：连上后能「听到」agent 的 greeting，说一句能「得到」语音回复。
（参考实现：Deepgram UC Berkeley 2026 workshop 的 `main.py` 与 `FunctionCallRequest` 模式；精确字段以 Deepgram 官方文档为准。）

### Step 1.4 定义函数 schema（命令 → Deepgram function）

**目标**：把阶段 0 的命令暴露给语音 agent 作为可调用工具。

**操作**：为每个命令写一个 Deepgram function（含 JSON schema 参数），映射如下：

| Deepgram 函数名 | 对应命令 | 参数 schema |
| --- | --- | --- |
| `open_workspace` | `open_workspace` | `{ rootPath: string }` |
| `focus_node` | `focus_node` | `{ nodeName: string }`（由名称反查 nodeId） |
| `scan_project` | `scan` | `{ scope: "local"\|"medium"\|"global" }` |
| `plan_project` | `plan` | `{ prompt: string }` |
| `code_module` | `code` | `{ nodeName, mode, prompt }` |
| `review_run` | `review` | `{ runId }` |
| `apply_diff` | `apply`（阶段 0 补） | `{ runId }` |
| `git_status` | `git_status`（阶段 0 补） | `{}` |

**完成标志**：agent 的 `functions` 里能看到这些工具，且 schema 能通过校验。

### Step 1.5 function-call → runCommand 桥

**目标**：语音 agent 发出的工具调用，落到真实动作上。

**操作**：在 `on_message` 里处理 `FunctionCallRequest`：

1. 取 `function_name` 与 `input`
2. 映射到 `runCommand(name, args)`
3. 拿 `CommandResult.summary` 作为函数返回值回传（`FunctionCallResponse`）

**完成标志**：说「扫描这个仓库」，能观察到 `/api/agents/scanning` 被真实调用，agent 收到执行结果。

### Step 1.6 上下文注入 + 语音回读

**目标**：补上「消歧」和「反馈」两半，否则是盲操作。

**操作**：

- **上下文注入**：把 Step 0.3 的「当前项目 + 当前选中节点 + 视口」写进 `think.instructions`，让「那个 / 这个」可解析
- **回读**：保证每个 `summary` 是给人念的一句话；agent 收到 function 结果后自然用 TTS 念出（如「已打开 parser 模块」「评审结论：通过」）

**完成标志**：说「打开那个」，能结合当前选中节点正确打开；每个动作后有语音回读。

### Step 1.7 端到端验收

**目标**：达成阶段 1 验收线。

**操作**：全程语音完成一遍完整闭环：开仓库 → 扫描 → 规划 → 编码 → 评审 → 应用 diff，动作均有回读。

**完成标志**：阶段 1 验收通过，可上 demoday。

---

## 阶段 2：眼动（look + say，后续）

### Step 2.1 凝视 → 命中节点

**操作**：引入 WebGazer.js（纯 webcam）；把凝视坐标反查到 React Flow 画布上的节点。

**完成标志**：console 能打印「当前凝视的 nodeId」。

### Step 2.2 凝视目标写入上下文

**操作**：把凝视命中的 nodeId 作为 `CommandContext` 的「当前焦点」高优先级候选。

**完成标志**：`focus_node` 在无语音指明时，也能用凝视目标兜底。

### Step 2.3 look + say 消歧

**操作**：语音说「这个 / 那个」时，用凝视目标消歧（单一融合大脑在此真正生效）。

**完成标志**：看节点 +「这个」+「打开」，正确打开目标。

### Step 2.4 防误触（Midas Touch）

**操作**：不做「盯着就点」；用 dwell 或语音确认（「这个」）作为确认机制。

**完成标志**：误触率低于设定阈值。

---

## 阶段 3：VR/AR（看代码，后续）

### Step 3.1 3D 渲染图

**操作**：用 three.js / WebXR 把 graph（节点 + 边）挤成 3D；复用同一份图数据，零新增动作逻辑。

**完成标志**：能在 3D 里「逛」一个仓库的架构。

### Step 3.2 手柄/手势 → runCommand

**操作**：VR 手柄/手势作为又一个命令控制器，调 `runCommand`。

**完成标志**：在 VR 里手柄能触发放大/聚焦/评审等命令。

### Step 3.3 带眼动头显合并阶段 2

**操作**：Quest Pro / Vision Pro / Tobii 等带眼动头显，一次给齐「眼动 + VR + 手势」，阶段 2 与阶段 3 合并成同一设备形态。

**完成标志**：同一设备上「看 + 说 + 手势」协同可用。

---

## 验收清单（总表）

| 阶段 | 验收 |
| --- | --- |
| 0 命令层 | 无键鼠，脚本经 `runCommand` 完成 开仓库→扫描→规划 |
| 1 语音 | 全程语音完成 开仓库→扫描→规划→编码→评审→应用，动作有语音回读 |
| 2 眼动 | 看节点 +「这个」+「打开」正确解析，误触低于阈值 |
| 3 VR/AR | VR 走架构理解测验 ≥ 2D 对照 |
