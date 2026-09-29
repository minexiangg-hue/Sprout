#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tsx=path.join(root,'apps/local-server/node_modules/.bin/tsx');
const output=path.resolve(process.env.STRUCTURE_BENCHMARK_OUTPUT??path.join(root,'reports/benchmarks'));
fs.mkdirSync(output,{recursive:true});
for(const [source,name] of [['agent-partitioning-benchmark','agent-partitioning'],['agent-context-shadow-benchmark','agent-context']]) {
  const result=spawnSync(tsx,[`apps/local-server/src/cli/${source}.ts`,'--format','table','--output',path.join(output,`${name}.json`)],{cwd:root,stdio:'inherit',env:{...process.env,TMPDIR:'/tmp',TEMP:'/tmp',TMP:'/tmp'}});
  if(result.status!==0) process.exit(result.status??1);
}
