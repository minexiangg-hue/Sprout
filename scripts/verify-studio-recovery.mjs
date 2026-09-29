#!/usr/bin/env node
/** Focused live-UI regression for navigation, interrupted work, learning notes and dialogs. */
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from '@playwright/test';
const base=process.env.STUDIO_URL || 'http://127.0.0.1:5173';
const output=path.resolve('reports/studio-recovery.json');
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
const checks=[],errors=[],created=[];
page.on('pageerror',error=>errors.push(error.message));
const check=(name,passed,evidence)=>{checks.push({name,passed,evidence});if(!passed)throw Error(name);};
const readTitle=()=>page.locator('.project-heading h1').innerText();
try {
 const create=async(template,title)=>{
  const response=await page.request.post(base+'/api/studio/plan',{data:{prompt:'导航恢复审计专用示例',template,provider:'demo'}});
  if(!response.ok())throw Error(await response.text());const p=await response.json();created.push(p.id);
  return (await page.request.patch(base+'/api/studio/projects/'+p.id,{data:{title}})).json();
 };
 const suffix=Date.now().toString(36),a=await create('star-catcher','导航 A '+suffix),b=await create('focus-timer','导航 B '+suffix);
 await page.goto(base+'/#project='+a.id);await page.getByRole('heading',{name:a.title,exact:false}).waitFor();
 await page.locator('.recent-list button').filter({hasText:b.title}).click();await page.getByRole('heading',{name:b.title,exact:false}).waitFor();
 await page.goBack();await page.getByRole('heading',{name:a.title,exact:false}).waitFor({timeout:10000});
 check('browser-back-restores-matching-project',page.url().includes(a.id)&&(await readTitle()).includes(a.title),page.url());
 await page.goForward();await page.getByRole('heading',{name:b.title,exact:false}).waitFor({timeout:10000});
 check('browser-forward-restores-matching-project',page.url().includes(b.id)&&(await readTitle()).includes(b.title),page.url());
 // Delay an actual build response; navigating away must invalidate only its UI update.
 let release;const hold=new Promise(resolve=>{release=resolve;});
 await page.route('**/api/studio/projects/'+b.id+'/build',async route=>{const response=await route.fetch();await hold;await route.fulfill({response});},{times:1});
 await page.getByRole('button',{name:/搭建下一块 ·/}).click();
 await page.goBack();await page.getByRole('heading',{name:a.title,exact:false}).waitFor({timeout:10000});
 release();await page.waitForTimeout(250);
 check('late-build-response-cannot-switch-project',page.url().includes(a.id)&&(await readTitle()).includes(a.title),page.url());
 await page.unrouteAll({behavior:'wait'});
 for(let i=0;i<a.modules.length;i++){
  await page.getByRole('button',{name:/搭建下一块 ·/}).click();
  await page.getByText(`${i+1} / ${a.modules.length} 已搭建`,{exact:true}).waitFor();
 }
 check('demo-free-text-modification-disabled',await page.locator('#revision').isDisabled()&&await page.getByRole('button',{name:'修改当前模块'}).isDisabled(),null);
 await page.getByLabel('我已经试玩，并能说出一个模块的作用').check();
 await page.getByLabel('我的发现').fill('我把目标看作变量，规则控制什么时候完成。');
 await page.reload();await page.getByLabel('我的发现').waitFor();
 check('learning-note-survives-reload',(await page.getByLabel('我的发现').inputValue())==='我把目标看作变量，规则控制什么时候完成。',null);
 check('self-check-survives-reload',await page.getByLabel('我已经试玩，并能说出一个模块的作用').isChecked(),null);
 await page.getByRole('button',{name:'创作设置',exact:true}).click();
 const modal=page.getByRole('dialog',{name:'创作设置'});await modal.waitFor();
 check('dialog-receives-focus',await modal.evaluate(element=>element.contains(document.activeElement)),null);
 await page.keyboard.press('Shift+Tab');check('dialog-tab-is-contained',await modal.evaluate(element=>element.contains(document.activeElement)),null);
 await page.keyboard.press('Escape');await modal.waitFor({state:'hidden'});
 check('escape-restores-trigger-focus',await page.getByRole('button',{name:'创作设置',exact:true}).evaluate(element=>element===document.activeElement),null);
 check('no-runtime-errors',errors.length===0,errors);
} catch(error) {checks.push({name:'regression-run',passed:false,evidence:error.message});process.exitCode=1;}
finally {
 await browser.close();fs.mkdirSync(path.dirname(output),{recursive:true});
 const report={schemaVersion:1,generatedAt:new Date().toISOString(),base,provider:'demo (no model calls)',createdProjectIds:created,checks,errors,passed:checks.length===10&&checks.every(check=>check.passed)};
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}
