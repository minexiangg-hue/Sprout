#!/usr/bin/env node
/** Fixed first three public WebApp1K tests. Explicit --generate consumes quota once per task. */
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {spawn,spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(process.env.WEBAPP1K_REPO||'/tmp/sprout-webapp1k-0089530');
const output=path.resolve(process.env.WEBAPP1K_OUTPUT||path.join(root,'reports/benchmarks/webapp1k'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'reports/benchmarks/webapp1k/selection.json'),'utf8'));
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const command=(cmd,args,options={})=>{const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:8*1024*1024,...options});if(r.status!==0)throw Error(`${cmd} failed: ${r.stderr}`);return r.stdout;};
const commit=command('git',['-C',repo,'rev-parse','HEAD']).trim();if(commit!==manifest.commit)throw Error('Upstream commit mismatch');
for(const item of manifest.upstreamFiles){
 const current=sha(fs.readFileSync(path.join(repo,item.path)));
 const compatible=path.join(root,'reports/benchmarks/webapp1k/compatible-package.json');
 const environmentOnly=item.path==='staging/package.json'&&fs.existsSync(compatible)&&current===sha(fs.readFileSync(compatible));
 if(current!==item.sha256&&!environmentOnly)throw Error('Upstream source changed: '+item.path);
}
for(const item of manifest.selected){if(sha(fs.readFileSync(path.join(repo,item.path)))!==item.sha256)throw Error('Official test changed: '+item.path);}
fs.mkdirSync(output,{recursive:true});
const helper=path.join(root,'scripts/webapp1k-official.py');
const run=(cmd,args,input,cwd)=>new Promise(resolve=>{
 const child=spawn(cmd,args,{cwd,stdio:['pipe','pipe','pipe']});let stdout='',stderr='';const started=performance.now();
 const timer=setTimeout(()=>child.kill('SIGKILL'),240000);
 child.stdout.on('data',data=>stdout+=data);child.stderr.on('data',data=>stderr+=data);child.stdin.on('error',()=>{});
 child.on('error',error=>{clearTimeout(timer);resolve({exitCode:null,stdout,stderr:error.message,latencyMs:Math.round(performance.now()-started)});});
 child.on('close',exitCode=>{clearTimeout(timer);resolve({exitCode,stdout,stderr,latencyMs:Math.round(performance.now()-started)});});child.stdin.end(input);
});
if(process.argv.includes('--generate')) {
 if(fs.existsSync(path.join(output,'generation.json')))throw Error('Refusing to overwrite prior generation. Set WEBAPP1K_OUTPUT to a new directory for a new experiment.');
 const report={schemaVersion:1,generatedAt:new Date().toISOString(),commit,model:manifest.model,reasoningEffort:'medium',cliVersion:command('codex',['--version']).trim(),attemptsPerTask:1,repairAttempts:0,officialPrompt:true,officialTestsVisibleToModel:true,tasks:[],limitations:['Only the preselected first three of 1000 base tasks; selection is deterministic, not statistically representative.','Uses the official first-attempt prompt and code extractor, replacing hosted inference with Codex CLI. This is not the official full leaderboard run.','No completion is manually edited or regenerated after seeing tests.']};
 for(const item of manifest.selected){
  const id=path.basename(item.path,'.test.js'),directory=path.join(output,id);fs.mkdirSync(directory,{recursive:true});
  const prompt=command('python3',[helper,repo,'prompt',path.join(repo,item.path)]);
  fs.writeFileSync(path.join(directory,'prompt.txt'),prompt);
  const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'webapp1k-model-'));
  const response=path.join(directory,'response.txt');
  const disabled=['shell_tool','unified_exec','apps','plugins','remote_plugin','multi_agent','browser_use','computer_use','image_generation','code_mode','code_mode_host'];
  const args=['--ask-for-approval','never','-c','web_search="disabled"','-c','model_reasoning_effort="medium"',...disabled.flatMap(feature=>['--disable',feature]),'exec','--sandbox','read-only','--skip-git-repo-check','--ephemeral','--ignore-user-config','--model',manifest.model,'--cd',workspace,'--json','--output-last-message',response,'-'];
  const result=await run('codex',args,prompt,workspace);fs.rmSync(workspace,{recursive:true,force:true});
  const events=result.stdout.split('\n').flatMap(line=>{try{return[JSON.parse(line)];}catch{return[];}});
  const record={path:item.path,testSha256:item.sha256,promptSha256:sha(prompt),providerCalls:1,latencyMs:result.latencyMs,exitCode:result.exitCode,usage:events.find(event=>event.type==='turn.completed')?.usage??null,toolCalls:events.filter(event=>event.type==='item.completed'&&['command_execution','mcp_tool_call','web_search'].includes(event.item?.type)).length};
  if(result.exitCode===0&&fs.existsSync(response)){
   const code=command('python3',[helper,repo,'extract',response]);fs.writeFileSync(path.join(directory,item.implementationFilename),code);record.implementationSha256=sha(code);record.responseSha256=sha(fs.readFileSync(response));
  }else record.error=events.filter(event=>['error','turn.failed'].includes(event.type)).map(event=>event.message??event.error?.message).filter(Boolean).join('; ')||'Generation failed; no retry';
  report.tasks.push(record);fs.writeFileSync(path.join(output,'generation.json'),JSON.stringify(report,null,2)+'\n');console.log(`${id}: generation exit=${record.exitCode}, ${record.latencyMs}ms`);
 }
 if(report.tasks.some(task=>task.exitCode!==0))process.exitCode=1;
}else{
 const staging=path.join(repo,'staging');
 const aliases=[];
 for(const item of manifest.selected){
  const id=path.basename(item.path,'.test.js'),target=path.join(staging,'src',path.relative('tests',item.path));fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(repo,item.path),target);
  const generated=path.join(output,id,item.implementationFilename);if(!fs.existsSync(generated))throw Error('Generate once first: '+generated);
  const implementationTarget=path.join(path.dirname(target),item.implementationFilename);
  fs.copyFileSync(generated,implementationTarget);
  const imports=fs.readFileSync(target,'utf8').matchAll(/from ['"]\.\/([A-Za-z][A-Za-z0-9_-]*)['"]/g);
  for(const match of imports){
   const importedName=match[1]+'.js';if(importedName===item.implementationFilename)continue;
   if(importedName.toLowerCase()!==item.implementationFilename.toLowerCase())throw Error('Unsupported relative import mismatch');
   const alias=path.join(path.dirname(target),importedName);
   if(process.argv.includes('--case-alias')){fs.copyFileSync(generated,alias);aliases.push({from:item.implementationFilename,to:importedName,sha256:sha(fs.readFileSync(generated))});}
   else if(fs.existsSync(alias)){if(sha(fs.readFileSync(alias))!==sha(fs.readFileSync(generated)))throw Error('Unexpected existing alias content');fs.unlinkSync(alias);}
  }
 }
 const stagedTests=fs.readdirSync(path.join(staging,'src'),{recursive:true}).filter(file=>file.endsWith('.test.js')).sort();
 const expectedTests=manifest.selected.map(item=>path.relative('tests',item.path)).sort();
 if(JSON.stringify(stagedTests)!==JSON.stringify(expectedTests))throw Error('Staging must contain exactly the three selected official tests');
 const target=process.env.WEBAPP1K_TEST_RESULT||(process.argv.includes('--case-alias')?'pinned-import-mapping':'pinned-original-layout');
 fs.writeFileSync(path.join(output,target+'-layout.json'),JSON.stringify({caseAliasEnabled:process.argv.includes('--case-alias'),aliases,testFiles:stagedTests,testFilesEdited:false,generatedCodeEdited:false},null,2)+'\n');
 const jsonPath=path.join(output,target+'.json'),logPath=path.join(output,target+'.log');
 const result=await run('npm',['test','--','--testPathPattern','src/react/blogging','--runInBand','--json','--outputFile',jsonPath],'',staging);
 fs.writeFileSync(logPath,result.stdout+'\n'+result.stderr);
 console.log(JSON.stringify({exitCode:result.exitCode,latencyMs:result.latencyMs,logPath,jsonPath},null,2));
 for(const item of manifest.selected){const staged=path.join(staging,'src',path.relative('tests',item.path));if(sha(fs.readFileSync(staged))!==item.sha256)throw Error('Test mutated while evaluating');}
 process.exitCode=result.exitCode??1;
}
