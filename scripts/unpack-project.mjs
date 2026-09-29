#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const MAX_JSON_BYTES = 2_000_000;
const PREVIEW_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

function check(condition, message) { if (!condition) throw new Error(message); }
function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function text(value, label, min, max) { check(typeof value === 'string' && value.length >= min && value.length <= max, `${label} must be a string of ${min}–${max} characters.`); }

/** Validate data before creating any output. No source code is executed. */
export function validateProject(project, { readSourcesLater = false } = {}) {
  check(object(project), 'Project must be a JSON object.');
  check(typeof project.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(project.id), 'Invalid project id.');
  text(project.title, 'title', 1, 60); text(project.prompt, 'prompt', 1, 4000);
  check(['star-catcher', 'pet-care', 'focus-timer'].includes(project.template), 'Unsupported template.');
  check(['demo', 'codex', 'api'].includes(project.provider), 'Unsupported provider.');
  for (const key of ['createdAt', 'updatedAt']) check(typeof project[key] === 'string' && Number.isFinite(Date.parse(project[key])), `Invalid ${key}.`);
  check(project.html === null || (typeof project.html === 'string' && project.html.length <= 1_000_000 && /^\s*<!doctype html>/i.test(project.html)), 'html must be an HTML document or null; it is never interpreted as a filename.');
  const config = project.config;
  check(object(config), 'Missing project config.');
  check(typeof config.accent === 'string' && /^#[0-9a-f]{6}$/i.test(config.accent), 'Invalid accent.');
  for (const [key, min, max, integer] of [['speed', .5, 5, false], ['target', 3, 50, true], ['durationMinutes', 1, 60, true]]) {
    check(typeof config[key] === 'number' && Number.isFinite(config[key]) && config[key] >= min && config[key] <= max && (!integer || Number.isInteger(config[key])), `Invalid config.${key}.`);
  }
  text(config.petName, 'config.petName', 1, 24);
  check(Array.isArray(project.modules) && project.modules.length >= 3 && project.modules.length <= 6, 'Expected 3–6 modules.');
  const ids = new Set(), filenames = new Set();
  for (const module of project.modules) {
    check(object(module), 'Invalid module.');
    check(typeof module.id === 'string' && /^[a-z][a-z0-9-]{0,39}$/.test(module.id) && !ids.has(module.id), 'Invalid or repeated module id.');
    text(module.title, 'module.title', 1, 60); text(module.description, 'module.description', 1, 400);
    text(module.concept, 'module.concept', 1, 180); text(module.challenge, 'module.challenge', 1, 240);
    check(['html', 'css', 'js'].includes(module.kind), 'Invalid module kind.');
    check(['ready', 'done'].includes(module.status), 'Invalid module status.');
    check(Array.isArray(module.files) && module.files.length === 1, 'Each module must own exactly one file.');
    const filename = module.files[0];
    check(typeof filename === 'string' && /^[a-zA-Z0-9_-]+\.(html|css|js)$/.test(filename) && filename.endsWith(`.${module.kind}`), 'Module filenames must be plain HTML/CSS/JS filenames, without paths.');
    check(!/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])\./i.test(filename), 'Reserved device filenames are not allowed.');
    check(!filenames.has(filename.toLowerCase()), 'Repeated module filename (including case variants).');
    filenames.add(filename.toLowerCase());
    check(Array.isArray(module.dependsOn) && module.dependsOn.length <= 6 && module.dependsOn.every((id) => typeof id === 'string' && ids.has(id)), 'Dependencies must name earlier modules.');
    check(new Set(module.dependsOn).size === module.dependsOn.length, 'Repeated module dependency.');
    text(module.source, 'module.source', module.status === 'done' && !readSourcesLater ? 1 : 0, 100_000);
    if (module.status === 'ready') check(module.source === '', 'Unbuilt module source must be empty.');
    if (module.status === 'done') {
      check(module.dependsOn.every((id) => project.modules.find((candidate) => candidate.id === id)?.status === 'done'), 'A built module has an unbuilt dependency.');
      if (module.kind === 'js' && !readSourcesLater) new Script(module.source, { filename }); // Parse only; never execute.
    }
    ids.add(module.id);
  }
  check(project.modules.some((module) => module.kind === 'html') && project.modules.some((module) => module.kind === 'js'), 'Project needs HTML and JavaScript modules.');
  check(Array.isArray(project.activity) && project.activity.length <= 100, 'Invalid activity history.');
  for (const entry of project.activity) {
    check(object(entry) && typeof entry.id === 'string' && typeof entry.at === 'string' && Number.isFinite(Date.parse(entry.at)) && ['plan', 'build', 'edit'].includes(entry.kind) && typeof entry.message === 'string' && entry.message.length <= 3000, 'Invalid activity entry.');
  }
  return project;
}

/** Reject symlinks in every existing component, including the leaf. */
function assertNoSymlinks(filename) {
  const absolute = path.resolve(filename);
  const parsed = path.parse(absolute);
  let current = parsed.root;
  for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try { check(!fs.lstatSync(current).isSymbolicLink(), `Symlinks are not allowed: ${current}`); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
  }
}

function readBoundedFile(filename, limit) {
  assertNoSymlinks(filename);
  const descriptor = fs.openSync(filename, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    const info = fs.fstatSync(descriptor);
    check(info.isFile() && info.size <= limit, `Expected a regular file smaller than ${limit} bytes: ${filename}`);
    const content = fs.readFileSync(descriptor, 'utf8');
    check(Buffer.byteLength(content) <= limit, `File grew beyond the size limit: ${filename}`);
    return content;
  } finally { fs.closeSync(descriptor); }
}

function escapeHtml(value) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }

function assembleDocument(project) {
  const done = project.modules.filter((module) => module.status === 'done');
  const css = done.filter((module) => module.kind === 'css').map((module) => `/* src/${module.files[0]} */\n${module.source.replace(/<\/style/gi, '<\\/style')}`).join('\n');
  const html = done.filter((module) => module.kind === 'html').map((module) => `<!-- src/${module.files[0]} -->\n${module.source}`).join('\n');
  const js = done.filter((module) => module.kind === 'js').map((module) => `<script>/* src/${module.files[0]} */\n${module.source.replace(/<\/script/gi, '<\\/script')}\n</script>`).join('\n');
  const config = JSON.stringify(project.config).replace(/</g, '\\u003c');
  return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${escapeHtml(PREVIEW_CSP)}"><title>${escapeHtml(project.title)}</title><style>:root{--accent:${project.config.accent}}body{font-family:system-ui,sans-serif;padding:8px}\n${css}</style></head><body>${html || '<p>🌱 请先完成画面模块。</p>'}<script>window.SPROUT_CONFIG=${config};</script>${js}</body></html>\n`;
}

function rebuildScript() {
  return `// Generated by Sprout. Reads source text and rebuilds index.html; does not execute source.\nimport fs from 'node:fs';\nimport path from 'node:path';\nimport { fileURLToPath } from 'node:url';\nimport { Script } from 'node:vm';\nconst PREVIEW_CSP = ${JSON.stringify(PREVIEW_CSP)};\n${[check, object, text, validateProject, assertNoSymlinks, readBoundedFile, escapeHtml, assembleDocument].map((fn) => fn.toString()).join('\n\n')}\nconst directory = path.dirname(fileURLToPath(import.meta.url));\nconst project = validateProject(JSON.parse(readBoundedFile(path.join(directory, 'project.json'), ${MAX_JSON_BYTES})), { readSourcesLater: true });\nfor (const module of project.modules) {\n  module.source = readBoundedFile(path.join(directory, 'src', module.files[0]), 400000);\n}\nvalidateProject(project);\nconst destination = path.join(directory, 'index.html');\nassertNoSymlinks(destination);\nconst descriptor = fs.openSync(destination, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | (fs.constants.O_NOFOLLOW || 0), 0o600);\ntry { fs.writeFileSync(descriptor, assembleDocument(project)); } finally { fs.closeSync(descriptor); }\nconsole.log('Rebuilt ' + destination);\n`;
}

function readme(project, directory) {
  const modules = project.modules.map((module) => `| ${module.title.replace(/\|/g, '/')} | \`src/${module.files[0]}\` | ${module.status === 'done' ? '已搭建' : '待搭建（空文件）'} |`).join('\n');
  return `# ${project.title.replace(/[\r\n]/g, ' ')}\n\n从芽芽工坊导出的可编辑项目。来源：${project.provider === 'demo' ? '预设演示模板（未调用 AI）' : 'AI 生成作品'}。\n\n## 运行与修改\n\n1. 用浏览器打开 \`index.html\`，无需安装依赖。\n2. 修改 \`src/\` 中的 HTML、CSS、JavaScript 文件。\n3. 在此目录执行 \`node build.mjs\`，再刷新浏览器。构建只拼接源码，不执行生成的 JavaScript。\n4. 在 \`project.json\` 中修改 \`title\` 或 \`config\` 后，同样运行构建。\n\n\`index.html\` 是自动生成的独立入口，请编辑源码文件后重建。\`project.json\` 保留原始模块计划、依赖和教学提示；源码文件是后续开发的依据，JSON 内原始 source 字段不会自动同步。待搭建模块不会进入入口；完成源码后将对应模块 status 改为 done，再构建。\n\n## 进入 GraphCode 专业模式\n\n1. 启动 Sprout，打开 \`http://127.0.0.1:5173/#expert\`（以实际前端地址为准）。\n2. 使用原有“打开工作区 / Open workspace”选择下方完整目录；首次打开按界面提示初始化扫描。\n3. 在文件图里查看 \`src/\` 模块文件，配置原有 coding agent 后继续开发。完成修改后执行 \`node build.mjs\` 预览。\n\n工作区路径：\n\n\`\`\`text\n${directory}\n\`\`\`\n\n本工具生成普通源码目录，不会自动连接账号、配置代理、初始化 Git 或改动现有工作区。浏览器运行源码；专业模式保留原来的 API、审查与代码流程。\n\n## 模块地图\n\n| 模块 | 源码文件 | 状态 |\n| --- | --- | --- |\n${modules}\n`;
}

export function unpackProject(input, destination) {
  const inputPath = path.resolve(input), directory = path.resolve(destination);
  const project = validateProject(JSON.parse(readBoundedFile(inputPath, MAX_JSON_BYTES)));
  assertNoSymlinks(directory);
  check(!fs.existsSync(directory), 'Output must be a new directory; existing files and directories are never overwritten.');
  const parent = path.dirname(directory);
  check(fs.statSync(parent).isDirectory(), 'The output parent directory must already exist.');
  // Exclusive mkdir is the final overwrite guard, including competing invocations.
  fs.mkdirSync(directory, { mode: 0o700 });
  try {
    fs.mkdirSync(path.join(directory, 'src'), { mode: 0o700 });
    const write = (filename, content) => fs.writeFileSync(path.join(directory, filename), content, { flag: 'wx', mode: 0o600 });
    for (const module of project.modules) write(path.join('src', module.files[0]), module.source);
    write('project.json', JSON.stringify(project, null, 2) + '\n');
    write('build.mjs', rebuildScript());
    write('index.html', assembleDocument(project));
    write('README.md', readme(project, directory));
  } catch (error) {
    // Only remove the directory exclusively created by this invocation.
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }
  return { directory, files: project.modules.map((module) => `src/${module.files[0]}`), builtModules: project.modules.filter((module) => module.status === 'done').length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    check(process.argv.length === 4, 'Usage: node scripts/unpack-project.mjs <downloaded-project.json> <new-output-directory>');
    console.log(JSON.stringify(unpackProject(process.argv[2], process.argv[3]), null, 2));
  } catch (error) { console.error(`Sprout export: ${error.message}`); process.exitCode = 1; }
}
