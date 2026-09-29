#!/usr/bin/env node
/** Hash the upstream engine and advanced workspace, with separately reported entrypoint diffs. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const commit='423912335b494ed259a0432f64334873dc461e7e';
const git=args=>{
  const result=spawnSync('git',args,{cwd:root,maxBuffer:20*1024*1024});
  if(result.status!==0) throw Error(result.stderr.toString());
  return result.stdout;
};
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const paths=git(['ls-tree','-r','--name-only',commit,'packages','apps/local-server/src','apps/web/src','apps/web/index.html','apps/web/playwright.config.ts','apps/web/e2e','LICENSE']).toString().trim().split('\n');
const integrationPaths=new Set(['apps/local-server/src/server.ts','apps/web/src/main.tsx','apps/web/index.html','apps/web/playwright.config.ts','apps/web/e2e/agent-sidebar.spec.ts','apps/web/e2e/codex-workflow.spec.ts','apps/web/e2e/visual-smoke.spec.ts']);
const files=paths.map(file=>{
  const original=git(['show',`${commit}:${file}`]);
  const present=fs.existsSync(path.join(root,file));
  const current=present?fs.readFileSync(path.join(root,file)):null;
  return {path:file,category:integrationPaths.has(file)?'entrypoint-review':'preserved-core',originalSha256:sha(original),currentSha256:current?sha(current):null,identical:current!==null&&original.equals(current)};
});
const core=files.filter(file=>file.category==='preserved-core');
const entrypoints=files.filter(file=>file.category==='entrypoint-review').map(file=>({...file,diff:git(['diff',commit,'--',file.path]).toString()}));
const report={schemaVersion:1,generatedAt:new Date().toISOString(),upstream:'https://github.com/JustinLinKK/graph-code',upstreamCommit:commit,method:'Git object bytes vs current filesystem SHA-256; every originally tracked file under four packages and both application src trees, plus LICENSE; original entrypoints/browser test integration files are reported separately. New files are additive and are not part of the original-file comparison.',summary:{coreFiles:core.length,unchangedCoreFiles:core.filter(file=>file.identical).length,changedCoreFiles:core.filter(file=>!file.identical).map(file=>file.path),entrypoints:entrypoints.length,corePreserved:core.every(file=>file.identical)},files:core,entrypoints,limitations:['Byte identity establishes preserved implementation, not successful operation of every external provider or unchanged behavior under every dependency/environment.','Entrypoint/browser integration files require human inspection and regression tests; they are not silently counted as unchanged.','New Studio behavior is separate and is not evidence that the original advanced coding pipeline supports all Studio features.']};
const output=path.join(root,'reports/preservation.json');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
process.stdout.write(JSON.stringify(report.summary,null,2)+'\n');
if(!report.summary.corePreserved) process.exitCode=1;
