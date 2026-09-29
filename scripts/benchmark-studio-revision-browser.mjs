#!/usr/bin/env node
/** Functional checks for the one-call timer revision; no generation or source editing. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {chromium} from '@playwright/test';
const output=path.resolve(process.env.STUDIO_REVISION_OUTPUT || 'reports/benchmarks/studio-revision');
const project=JSON.parse(fs.readFileSync(path.join(output,'project.json'),'utf8'));
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1100,height:800}});
const checks=[],errors=[],network=[];
page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
const check=(name,passed,evidence)=>checks.push({name,passed,evidence});
const report={schemaVersion:1,generatedAt:new Date().toISOString(),name:'Studio revised timer browser check',originalProjectId:project.id,artifactSha256:crypto.createHash('sha256').update(project.html).digest('hex'),providerCalls:0,browser:'Chromium',sandbox:'allow-scripts',controlledClock:true,harnessNote:'An initial role-name selector incorrectly required the accessible name to equal visible text; generated button has a longer descriptive aria-label. The final check validates the explicitly requested id and visible text. Original failure is retained; generated source and model calls were unchanged.',checks,errors,networkRequests:network,passed:false};
try {
 await page.clock.install({time:new Date('2026-09-29T08:00:00Z')});
 await page.setContent('<iframe title="Revised project" sandbox="allow-scripts" style="border:0;width:100%;height:750px"></iframe>');
 await page.locator('iframe').evaluate((element,html)=>{element.srcdoc=html;},project.html);
 const frame=page.frameLocator('iframe');await frame.getByRole('button',{name:'开始',exact:true}).waitFor();
 const body=()=>frame.locator('body').innerText();
 const display=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 const initial=project.config.durationMinutes*60;
 check('initial-value',(await body()).includes(display(initial)),display(initial));
 await frame.getByRole('button',{name:'开始',exact:true}).click();await page.clock.runFor(2100);
 check('original-countdown-works',(await body()).includes(display(initial-2)),display(initial-2));
 await frame.getByRole('button',{name:'暂停',exact:true}).click();
 const add=frame.locator('button#add-minute');
 check('requested-button-id-and-visible-text',await add.innerText()==='加一分钟',{id:'add-minute',text:await add.innerText()});
 await add.click();check('paused-adds-60-seconds',(await body()).includes(display(initial-2+60)),display(initial-2+60));
 const paused=await body();await page.clock.runFor(3000);
 check('add-preserves-paused-state',(await body())===paused,null);
 await frame.getByRole('button',{name:'开始',exact:true}).click();await page.clock.runFor(1100);
 check('resume-after-paused-add',(await body()).includes(display(initial-3+60)),display(initial-3+60));
 await add.click();check('running-adds-60-seconds',(await body()).includes(display(initial-3+120)),display(initial-3+120));
 await page.clock.runFor(1100);check('add-preserves-running-state',(await body()).includes(display(initial-4+120)),display(initial-4+120));
 await frame.getByRole('button',{name:'重置',exact:true}).click();check('reset-restores-original-duration',(await body()).includes(display(initial)),display(initial));
 await page.clock.runFor(2000);check('reset-stays-stopped',(await body()).includes(display(initial)),display(initial));
 await frame.getByRole('button',{name:'开始',exact:true}).click();await page.clock.runFor(initial*1000+1000);
 const finished=await body();check('completion-reaches-zero',finished.includes('00:00'),'00:00');check('completion-feedback-preserved',finished.includes('任务完成'),'任务完成');
 await frame.getByRole('button',{name:'重置',exact:true}).click();check('replay-after-completion',(await body()).includes(display(initial)),display(initial));
 await page.screenshot({path:path.join(output,'preview.png'),fullPage:true});
} catch(error) {check('browser-execution',false,error.message);process.exitCode=1;}
finally {
 check('no-runtime-errors',errors.length===0,errors);check('no-network-requests',network.length===0,network);
 report.passed=checks.length===15&&checks.every(item=>item.passed);
 fs.writeFileSync(path.join(output,'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 await browser.close();if(!report.passed)process.exitCode=1;
}
