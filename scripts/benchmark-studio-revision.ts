/** One actual AI revision of the completed timer, preserving the original live report. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {StudioService} from '../apps/local-server/src/studio/service';
import type {StudioProject} from '../apps/local-server/src/studio/types';
const input=path.resolve(process.env.STUDIO_REVISION_INPUT || 'reports/benchmarks/studio-live/project.json');
const output=path.resolve(process.env.STUDIO_REVISION_OUTPUT || 'reports/benchmarks/studio-revision');
fs.mkdirSync(output,{recursive:true});
const original=JSON.parse(fs.readFileSync(input,'utf8')) as StudioProject;
const target=original.modules.find(module=>module.id==='timer-engine');
if(!target || target.status!=='done' || target.kind!=='js')throw Error('This frozen revision task requires the original completed timer-engine module.');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'sprout-studio-revision-'));
fs.writeFileSync(path.join(directory,original.id+'.json'),JSON.stringify(original));
const service=new StudioService(directory);
const instruction='保留当前计时器所有开始、暂停、重置、归零反馈及 window.SPROUT_TIMER 和 sprout:timer-update 接口。只修改当前 JavaScript 模块，动态创建一个 <button id="add-minute" type="button">加一分钟</button> 放在重置按钮旁（如果该 id 已存在则复用）。运行中和暂停中点击此按钮时，都给剩余时间增加60秒，并保持原来的运行或暂停状态不变。重置仍恢复配置初始时长，其他模块无需改动。';
const request={moduleId:target.id,instruction};
fs.writeFileSync(path.join(output,'request.json'),JSON.stringify({originalProjectId:original.id,...request},null,2)+'\n');
const hash=(source:string)=>crypto.createHash('sha256').update(source).digest('hex');
const report:Record<string,unknown>={schemaVersion:1,generatedAt:new Date().toISOString(),name:'Studio actual AI module revision',originalProjectId:original.id,originalInput:input,provider:original.provider,requestedModel:process.env.SPROUT_CODEX_MODEL||'CLI default with --ignore-user-config',cliVersion:spawnSync(process.env.SPROUT_CODEX_COMMAND||'codex',['--version'],{encoding:'utf8'}).stdout?.trim()||null,boundary:'StudioService.build(existing completed module) -> actual Codex CLI',additionalProviderCalls:1,attempts:1,repairAttempts:0,passed:false,limitations:['One additional revision of one previously generated timer, not a new independent task corpus.','Original live generation results are retained unchanged; this additional call is not counted as part of their zero-repair result.','Browser behavior is separately validated; syntax/source-scope checks alone do not establish usability.']};
const started=performance.now();
try {
 const project=await service.build(original.id,request);
 report.latencyMs=Math.round(performance.now()-started);
 const comparisons=project.modules.map(module=>{
  const before=original.modules.find(item=>item.id===module.id)!;
  return {id:module.id,selected:module.id===target.id,beforeSha256:hash(before.source),afterSha256:hash(module.source),identical:before.source===module.source};
 });
 report.sourceComparisons=comparisons;
 report.onlySelectedModuleChanged=comparisons.every(module=>module.selected?!module.identical:module.identical);
 report.passed=report.onlySelectedModuleChanged;
 fs.writeFileSync(path.join(output,'project.json'),JSON.stringify(project,null,2)+'\n');
 fs.writeFileSync(path.join(output,'preview.html'),project.html||'');
 if(!report.passed)process.exitCode=1;
} catch(error) {report.latencyMs=Math.round(performance.now()-started);report.error=error instanceof Error?error.message:String(error);process.exitCode=1;}
finally {fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(directory,{recursive:true,force:true});console.log(JSON.stringify(report,null,2));}
