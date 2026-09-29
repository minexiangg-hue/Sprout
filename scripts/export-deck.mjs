import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'docs','slides');await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1304,height:808},deviceScaleFactor:1});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.goto(pathToFileURL(path.join(root,'docs/pitch-deck.html')).href);
await page.evaluate(()=>document.fonts.ready);
const slides=await page.locator('.slide').count();
const checks=[];
for(let number=1;number<=slides;number++) {
 await page.evaluate(n=>{location.hash='slide-'+n},number);
 await page.waitForFunction(n=>document.querySelector('#slide-'+n)?.classList.contains('active'),number);
 const slide=page.locator('.slide.active');
 const overflow=await slide.evaluate(el=>{
  const box=el.getBoundingClientRect();
  return [...el.querySelectorAll('h1,h2,h3,p,.footer,.number,.arr-value,.price,.statement,.competition')].filter(child=>{
   const rect=child.getBoundingClientRect();return rect.width&&rect.height&&(rect.right>box.right+1||rect.bottom>box.bottom+1||rect.left<box.left-1||rect.top<box.top-1);
  }).map(child=>child.textContent?.slice(0,100));
 });
 const contentOverlap=await slide.evaluate(el=>{
  const footer=el.querySelector('.footer')?.getBoundingClientRect();
  if(!footer)return[];
  return [...el.querySelectorAll('.content p,.content h3,.content .number,.content .card,.content .guardrail')].filter(child=>child.getBoundingClientRect().bottom>footer.top-3).map(child=>child.textContent?.slice(0,80));
 });
 await slide.screenshot({path:path.join(output,String(number).padStart(2,'0')+'.png')});
 checks.push({page:number,title:await slide.getAttribute('data-title'),overflow,contentOverlap});
}
await page.keyboard.press('Home');await page.waitForFunction(()=>document.querySelector('#slide-1')?.classList.contains('active'));
await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('#slide-2')?.classList.contains('active'));
await page.keyboard.press('End');await page.waitForFunction(()=>document.querySelector('#slide-14')?.classList.contains('active'));
await page.pdf({path:path.join(root,'docs/pitch-deck.pdf'),preferCSSPageSize:true,printBackground:true});
await fs.writeFile(path.join(root,'reports/deck-validation.json'),JSON.stringify({checkedAt:new Date().toISOString(),slides,localFonts:await page.evaluate(()=>document.fonts.check('16px SproutSansSC')),loadedScreenshots:await page.locator('.shot-body.has-shot').count(),keyboardNavigation:true,errors,checks},null,2));
await browser.close();
console.log(JSON.stringify({slides,errors,overflow:checks.filter(c=>c.overflow.length||c.contentOverlap.length)},null,2));
if(slides!==14||errors.length||checks.some(c=>c.overflow.length||c.contentOverlap.length))process.exitCode=1;
