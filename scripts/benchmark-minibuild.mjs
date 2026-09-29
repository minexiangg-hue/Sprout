#!/usr/bin/env node
/** MiniBuild-3: tiny public functional smoke test, NOT an independent coding leaderboard. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {tasks} from './minibuild-spec.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(process.env.MINIBUILD_OUTPUT ?? path.join(root, 'reports/benchmarks/minibuild'));
const replay = process.argv.includes('--replay');
fs.mkdirSync(output, {recursive:true});
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const schema = {type:'object',additionalProperties:false,required:['code'],properties:{code:{type:'string'}}};
const schemaPath = path.join(output, 'response-schema.json');
fs.writeFileSync(schemaPath, JSON.stringify(schema,null,2)+'\n');
const promptFor = task => `You are solving a small JavaScript implementation task. Return ONLY the JSON object requested by the response schema, with code as a string. Define the requested function as a global function declaration, without export/import, filesystem, network, tools, packages, timers, or I/O. Do not inspect local files or use any tool. Use pure synchronous standard JavaScript. Do not include tests.\n\n${task.spec}`;

function run(command,args,options={}) {
  return new Promise(resolve => {
    const child=spawn(command,args,{stdio:['pipe','pipe','pipe'],...options});
    let stdout='',stderr='',timedOut=false;
    const timer=setTimeout(()=>{timedOut=true;child.kill('SIGTERM');},300000);
    child.stdout.on('data',chunk=>stdout+=chunk);
    child.stderr.on('data',chunk=>stderr+=chunk);
    child.on('error',error=>{clearTimeout(timer);resolve({exitCode:null,stdout,stderr:error.message,timedOut});});
    child.on('close',exitCode=>{clearTimeout(timer);resolve({exitCode,stdout,stderr,timedOut});});
    child.stdin.end(options.input ?? '');
  });
}

const version = replay ? null : (await run('codex',['--version'])).stdout.trim();
const results=[];
for (const task of tasks) {
  const prompt=promptFor(task);
  const promptPath=path.join(output,`${task.id}.prompt.txt`);
  const responsePath=path.join(output,`${task.id}.response.json`);
  if(!replay) fs.writeFileSync(promptPath,prompt+'\n');
  let provider={kind:'replay',calls:0};
  if(!replay) {
    // Never mistake a previous successful response for a fresh provider result.
    fs.rmSync(responsePath,{force:true});
    const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'graphcode-minibuild-'));
    const args=['--ask-for-approval','never','exec','--sandbox','read-only','--skip-git-repo-check','--ephemeral','--cd',workspace,'--json','--output-schema',schemaPath,'--output-last-message',responsePath];
    if(process.env.MINIBUILD_MODEL) args.push('--model',process.env.MINIBUILD_MODEL);
    args.push('-');
    const started=performance.now();
    const runResult=await run('codex',args,{cwd:workspace,input:prompt});
    const events=runResult.stdout.split('\n').flatMap(line=>{try{return[JSON.parse(line)];}catch{return[];}});
    provider={kind:'codex-cli',calls:1,cliVersion:version,requestedModel:process.env.MINIBUILD_MODEL ?? 'CLI configured default',latencyMs:Math.round(performance.now()-started),exitCode:runResult.exitCode,timedOut:runResult.timedOut,usage:events.find(event=>event.type==='turn.completed')?.usage ?? null,toolCalls:events.filter(event=>event.type==='item.completed' && ['command_execution','mcp_tool_call','web_search'].includes(event.item?.type)).length};
    // Save only structured errors; raw CLI logs can include machine-specific information.
    if(runResult.exitCode !== 0) provider.error=events.filter(event=>event.type==='error'||event.type==='turn.failed').map(event=>event.message??event.error?.message).filter(Boolean).join('; ') || 'CLI invocation failed; no raw stderr retained';
    fs.rmSync(workspace,{recursive:true,force:true});
  }
  let code='',checks=[],error=null;
  try {
    if(provider.kind==='codex-cli' && provider.exitCode!==0) throw Error(provider.error);
    const response=JSON.parse(fs.readFileSync(responsePath,'utf8'));
    if(typeof response.code!=='string') throw Error('Missing code string');
    code=response.code;
    // Evaluation is bounded and has no injected host APIs. This is a test harness, not a security sandbox.
    for(const [name,args,expected] of task.cases) {
      try {
        const context=vm.createContext(Object.create(null),{codeGeneration:{strings:false,wasm:false}});
        vm.runInContext(code,context,{timeout:1000});
        const expression=`(() => {const args=${JSON.stringify(args)};const before=JSON.stringify(args);const answer=${task.functionName}(...args);return JSON.stringify({answer,unchanged:before===JSON.stringify(args),fresh:answer!==args[0]});})()`;
        const actual=JSON.parse(vm.runInContext(expression,context,{timeout:1000}));
        checks.push({name,passed:isDeepStrictEqual(actual.answer,expected)&&actual.unchanged&&actual.fresh,correct:isDeepStrictEqual(actual.answer,expected),inputsUnchanged:actual.unchanged,freshResult:actual.fresh,expected,actual:actual.answer});
      } catch(err) { checks.push({name,passed:false,error:err.message}); }
    }
  } catch(err) { error=err.message; }
  const passed=checks.length===task.cases.length && checks.every(check=>check.passed);
  results.push({id:task.id,name:task.name,promptSha256:sha(prompt),codeSha256:code?sha(code):null,provider,passed,checks,error});
  process.stdout.write(`${task.id}: ${checks.filter(check=>check.passed).length}/${task.cases.length} checks; ${passed?'PASS':'FAIL'}\n`);
}
const report={schemaVersion:1,name:'GraphCode MiniBuild-3',version:'1.0.0',generatedAt:new Date().toISOString(),mode:replay?'replay':'live',corpusSha256:sha(JSON.stringify(tasks)),machine:{node:process.version,platform:process.platform,arch:process.arch},protocol:{tasks:3,cases:24,attemptsPerTask:1,repairAttempts:0,promptIncludesTests:false,hiddenTests:false,publicCustomBenchmark:true,productStudioPath:false},summary:{passedTasks:results.filter(result=>result.passed).length,totalTasks:3,passedChecks:results.reduce((sum,result)=>sum+result.checks.filter(check=>check.passed).length,0),totalChecks:24,providerCalls:results.reduce((sum,result)=>sum+result.provider.calls,0)},results,limitations:['Custom public three-task corpus authored for this demo, not an independent or obscure third-party benchmark.','Logical unit checks do not establish full application quality, child usability, visual quality, educational value, or safety.','CLI is the same kind of provider available to GraphCode, but this harness does not exercise the product Studio/API or preserved coding-review-apply pipeline.','One attempt per task, no reranking or repairs. No competing product was measured. Model/default/account configuration and service state can affect replication.','No billed cost is inferred from token usage; no provider tokenizer or price configuration is assumed.']};
fs.writeFileSync(path.join(output,replay?'replay.json':'result.json'),JSON.stringify(report,null,2)+'\n');
if(report.summary.passedTasks!==3) process.exitCode=1;
