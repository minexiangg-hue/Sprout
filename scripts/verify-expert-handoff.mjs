#!/usr/bin/env node
/** Rebuild and browser-check the real generated timer's editable export. No model calls. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {unpackProject} from './unpack-project.mjs';
const output=path.resolve('reports/expert-handoff');fs.mkdirSync(output,{recursive:true});
const container=fs.mkdtempSync(path.join(os.tmpdir(),'sprout-handoff-browser-'));
const destination=path.join(container,'workspace');
const input=path.resolve('reports/benchmarks/studio-live/project.json');
const result=unpackProject(input,destination);
const original=JSON.parse(fs.readFileSync(input,'utf8'));
const exactSources=original.modules.map(module=>({file:module.files[0],identical:fs.readFileSync(path.join(destination,'src',module.files[0]),'utf8')===module.source}));
fs.writeFileSync(path.join(output,'unpack.json'),JSON.stringify({generatedAt:new Date().toISOString(),input,...result,exactSources},null,2)+'\n');
if(exactSources.some(file=>!file.identical))throw Error('Export changed source');
for(const stage of ['initial','rebuilt']) {
 if(stage==='rebuilt') {
  const rebuild=spawnSync(process.execPath,[path.join(destination,'build.mjs')],{stdio:'inherit'});
  if(rebuild.status!==0)process.exit(rebuild.status??1);
 }
 const run=spawnSync(process.execPath,['scripts/benchmark-studio-browser.mjs'],{stdio:'inherit',env:{...process.env,STUDIO_ARTIFACT_HTML:path.join(destination,'index.html'),STUDIO_BROWSER_REPORT:path.join(output,stage+'.json')}});
 if(run.status!==0)process.exit(run.status??1);
}
