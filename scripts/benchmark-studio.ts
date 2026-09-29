/** Live product-service smoke. One fixed task, no retries/repairs; consume Codex quota. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { StudioService } from '../apps/local-server/src/studio/service';

const output = path.resolve(process.env.STUDIO_BENCHMARK_OUTPUT || 'reports/benchmarks/studio-live');
fs.mkdirSync(output, { recursive: true });
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sprout-studio-benchmark-'));
const service = new StudioService(directory);
const prompt = '做一个太空专注计时器。界面文字为中文，明确显示 mm:ss 倒计时，从 window.SPROUT_CONFIG.durationMinutes 分钟开始。三个按钮准确叫“开始”“暂停”“重置”。开始后每秒减少1；暂停保持当前值；重置恢复初始时长并停止。归零后明确显示“任务完成”，并支持重置后再玩。必须可以真实操作。所有模块共同实现这个需求；不要装饰性占位。';
const request = { prompt, template: 'focus-timer' as const, provider: 'codex' as const };
fs.writeFileSync(path.join(output, 'request.json'), JSON.stringify(request, null, 2) + '\n');
const report: Record<string, unknown> = {
  schemaVersion: 1, name: 'Studio live focus timer smoke', generatedAt: new Date().toISOString(),
  boundary: 'StudioService -> StudioModels -> actual Codex CLI; no mocked provider',
  provider: 'codex', requestedModel: process.env.SPROUT_CODEX_MODEL || 'CLI default with --ignore-user-config', cliVersion: spawnSync(process.env.SPROUT_CODEX_COMMAND || 'codex', ['--version'], { encoding: 'utf8' }).stdout?.trim() || null, repairAttempts: 0, attemptsPerOperation: 1, operations: [], passed: false,
  limitations: ['One self-selected task; no claim of general success rate.', 'Service generation is measured here; browser behavior is a separate report.', 'No external paid API provider or competitor was measured.']
};
const operations = report.operations as Array<Record<string, unknown>>;
const save = () => fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(report, null, 2) + '\n');
try {
  let started = performance.now();
  let project = await service.plan(request);
  operations.push({ operation: 'plan', latencyMs: Math.round(performance.now() - started), passed: true, moduleCount: project.modules.length });
  fs.writeFileSync(path.join(output, 'project.json'), JSON.stringify(project, null, 2) + '\n'); save();
  process.stdout.write(`Plan generated ${project.modules.length} modules\n`);
  for (const module of project.modules) {
    started = performance.now();
    project = await service.build(project.id, { moduleId: module.id });
    operations.push({ operation: 'build', moduleId: module.id, kind: module.kind, latencyMs: Math.round(performance.now() - started), passed: true });
    fs.writeFileSync(path.join(output, 'project.json'), JSON.stringify(project, null, 2) + '\n');
    fs.writeFileSync(path.join(output, 'preview.html'), project.html || ''); save();
    process.stdout.write(`Built ${module.id} (${module.kind})\n`);
  }
  report.passed = project.modules.every(module => module.status === 'done');
  report.summary = { plannedModules: project.modules.length, builtModules: project.modules.filter(module => module.status === 'done').length, providerCalls: operations.length, totalLatencyMs: operations.reduce((sum, operation) => sum + Number(operation.latencyMs || 0), 0) };
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  operations.push({ operation: operations.length ? 'build' : 'plan', passed: false });
  process.exitCode = 1;
} finally { save(); fs.rmSync(directory, { recursive: true, force: true }); }
