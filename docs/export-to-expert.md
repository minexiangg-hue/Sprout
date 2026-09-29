# 从芽芽工坊进入 GraphCode 专业模式

工坊里的每块积木都有真实源码。把「项目文件」下载成 JSON 后，可以拆成普通文件目录，再用保留的 GraphCode 文件图、coding agent、审查和 API 继续开发。

## 导出与拆包

在作品页面点击「项目文件」。回到本仓库根目录，用 Node.js 运行：

```bash
node scripts/unpack-project.mjs /绝对路径/sprout-作品编号.json /绝对路径/我的新作品目录
```

第二个参数必须是**尚不存在的新目录**，它的父目录必须已经存在。不需要安装新的依赖。示例：

```bash
node scripts/unpack-project.mjs reports/benchmarks/studio-live/project.json /tmp/my-sprout-timer
```

脚本会输出：

```text
my-sprout-timer/
├── src/
│   ├── scene.html       # 画面模块的原始源码
│   ├── style.css        # 样式模块的原始源码
│   ├── timer.js         # 交互模块的原始源码
│   └── feedback.js      # 反馈模块的原始源码
├── index.html           # 可直接用浏览器打开的独立作品
├── build.mjs            # 无依赖的入口重建脚本
├── project.json         # 原始计划、配置、依赖、教学提示和生成记录
└── README.md            # 带完整工作区路径的操作说明
```

实际文件名取决于项目的模块计划。`src/` 中的文件与模块源码一一对应；JavaScript 在拆包和重建时仅做语法解析，不会在 Node.js 中执行。

## 运行与继续开发

1. 用浏览器打开新目录的 `index.html`，先试玩原作品。
2. 启动 Sprout，打开 `http://127.0.0.1:5173/#expert`，或点击「专业模式」。端口以实际启动信息为准。
3. 点击原有 **Open workspace**，输入新目录的绝对路径。首次打开按 **Initialize Workspace** 的提示初始化扫描；模型设置继续使用原专业模式的配置。
4. 在文件图中查看 `src/` 下的 HTML、CSS 和 JavaScript 模块，使用原有 agent 编辑、审查、应用修改。
5. 在新目录运行以下命令，然后刷新浏览器：

```bash
node build.mjs
```

`index.html` 会从模块文件重建，保留离线运行的 CSP 和配置注入。直接编辑 `index.html` 会在下次构建时被覆盖；应该编辑 `src/` 中的文件。可以在 `project.json` 调整 `title` 和 `config`，再重建。

部分完成的项目也可以拆包：待搭建模块会生成空文件，并在 README 标注。完成这些源码后，将 `project.json` 中对应模块的 `status` 改成 `done`，保持前置依赖已完成，再执行构建。`src/` 是后续开发的源码依据，JSON 里的原始 `source` 字段保留导出时记录，不要求手动同步。

这个交接不会自动登录账号、初始化 Git、替你调用模型或改变专业模式的 coding 流程。专业模式继续具备原 GraphCode 能力。新目录中的 README 包含它的准确路径，可以直接复制到工作区对话框。

## 文件边界和验证

- 在创建输出目录前验证项目结构、配置、模块依赖、文件名、文件大小和 JavaScript 语法。
- 模块只接受单个 `.html`、`.css` 或 `.js` 文件名，拒绝路径穿越、绝对路径、设备名和重复文件名，包括大小写变体。
- 拒绝已有输出目录或文件；拒绝输入、输出及其祖先路径中的符号链接。
- `html` 字段只能是 HTML 文档或 `null`，不会被当成磁盘路径读取；入口始终根据模块源码重新拼接。
- 重建脚本也检查模块路径和符号链接，只更新本项目的 `index.html`。

运行可复现的文件边界与重建检查：

```bash
node --test scripts/unpack-project.test.mjs
```

对真实生成的计时器运行浏览器验收（使用本仓库已有 Playwright/Chromium，不调用模型）：

```bash
node scripts/verify-expert-handoff.mjs
```

本次验收使用 `reports/benchmarks/studio-live/project.json` 中实际 Codex 生成的计时器，拆包到新的 `/tmp` 目录，核对所有模块源码，并运行独立 `build.mjs`。浏览器验收和结果见 `reports/expert-handoff/`；它证明该导出产物可运行，不代表任意模型生成代码都必然正确。
