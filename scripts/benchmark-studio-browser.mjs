#!/usr/bin/env node
/** Replay the exact generated Studio artifact in a sandboxed Chromium iframe. No model call. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {chromium} from '@playwright/test';
const output=path.resolve(process.env.STUDIO_BENCHMARK_OUTPUT || 'reports/benchmarks/studio-live');
const project=JSON.parse(fs.readFileSync(path.join(output,'project.json'),'utf8'));
if(!project.html || project.modules.some(module=>module.status!=='done')) throw Error('A complete generated project is required.');
const artifactPath=process.env.STUDIO_ARTIFACT_HTML?path.resolve(process.env.STUDIO_ARTIFACT_HTML):path.join(output,'preview.html');
const artifact=process.env.STUDIO_ARTIFACT_HTML?fs.readFileSync(artifactPath,'utf8'):project.html;
const reportPath=path.resolve(process.env.STUDIO_BROWSER_REPORT || path.join(output,'browser.json'));
fs.mkdirSync(path.dirname(reportPath),{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1100,height:800}});
const errors=[],network=[],checks=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
await page.clock.install({time:new Date('2026-09-29T08:00:00Z')});
const report={schemaVersion:1,name:'Studio generated timer browser replay',generatedAt:new Date().toISOString(),projectId:project.id,artifactPath,artifactSha256:crypto.createHash('sha256').update(artifact).digest('hex'),browser:'Chromium',sandbox:'allow-scripts (no allow-same-origin)',mockedClock:true,providerCalls:0,checks,errors,networkRequests:network,passed:false,limitations:['One generated timer artifact; browser checks do not establish overall generation success rate.','Clock is controlled to make timing behavior deterministic; no model output or generated source is edited.','This validates the generated iframe artifact, not the full Studio UI or original advanced coding workflow.']};
const check=(name,passed,evidence)=>checks.push({name,passed,evidence});
try {
  await page.setContent('<iframe title="Generated project" sandbox="allow-scripts" style="border:0;width:100%;height:750px"></iframe>');
  await page.locator('iframe').evaluate((element,html)=>{element.srcdoc=html;},artifact);
  const frame=page.frameLocator('iframe');
  await frame.getByRole('button',{name:'开始',exact:true}).waitFor({timeout:10000});
  const body=()=>frame.locator('body').innerText();
  const display=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  const initial=project.config.durationMinutes*60;
  let text=await body();check('initial-time',text.includes(display(initial)),display(initial));
  await frame.getByRole('button',{name:'开始',exact:true}).click();
  await page.clock.runFor(2100);
  text=await body();check('counts-down-after-start',text.includes(display(initial-2)),display(initial-2));
  await frame.getByRole('button',{name:'暂停',exact:true}).click();
  const paused=await body();await page.clock.runFor(3000);
  check('pause-keeps-count', (await body())===paused, paused);
  await frame.getByRole('button',{name:'重置',exact:true}).click();
  text=await body();check('reset-restores-duration',text.includes(display(initial)),display(initial));
  await page.clock.runFor(2000);
  check('reset-stays-stopped',(await body()).includes(display(initial)),display(initial));
  await frame.getByRole('button',{name:'开始',exact:true}).click();
  await page.clock.runFor(initial*1000+1000);
  text=await body();check('reaches-zero',text.includes('00:00'),'00:00');
  check('completion-feedback',text.includes('任务完成'),'任务完成');
  await frame.getByRole('button',{name:'重置',exact:true}).click();
  check('replay-after-completion',(await body()).includes(display(initial)),display(initial));
  await page.screenshot({path:process.env.STUDIO_BROWSER_REPORT?reportPath.replace(/\.json$/,'')+'.png':path.join(output,'preview.png'),fullPage:true});
} catch(error) {check('browser-execution',false,error.message);process.exitCode=1;}
finally {
  check('no-runtime-errors',errors.length===0,errors);
  check('no-network-requests',network.length===0,network);
  report.passed=checks.length===10&&checks.every(item=>item.passed);
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks:checks.map(({name,passed})=>({name,passed}))},null,2));
  await browser.close();if(!report.passed)process.exitCode=1;
}
