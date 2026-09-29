/** Reproduce the upstream loaded-workspace visual gate without resetting user data. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildServer } from '../apps/local-server/src/server';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'sprout-visual-'));
async function freePort():Promise<number>{return await new Promise(resolve=>{const socket=net.createServer();socket.listen(0,'127.0.0.1',()=>{const port=(socket.address() as net.AddressInfo).port;socket.close(()=>resolve(port));});});}
const serverPort=await freePort(),webPort=await freePort();
const options={dbPath:path.join(directory,'graph.sqlite'),selfRootPath:root,studioDataPath:path.join(directory,'studio')};
const seeded=await buildServer({...options,seedSelf:true});await seeded.close();
const app=await buildServer(options);await app.listen({host:'127.0.0.1',port:serverPort});
const env={...process.env,GRAPHCODE_WEB_PORT:String(webPort),GRAPHCODE_API_PROXY_TARGET:`http://127.0.0.1:${serverPort}`,GRAPHCODE_TEST_BASE_URL:`http://127.0.0.1:${webPort}`,GRAPHCODE_DISABLE_NATIVE_FOLDER_PICKER:'1'};
const vite=spawn(process.execPath,[path.join(root,'apps/web/node_modules/vite/bin/vite.js')],{cwd:path.join(root,'apps/web'),env,stdio:'ignore'});
try{
 let ready=false;
 for(let i=0;i<80;i++){try{ready=(await fetch(env.GRAPHCODE_TEST_BASE_URL+'/api/health')).ok;}catch{}if(ready)break;await new Promise(resolve=>setTimeout(resolve,250));}
 if(!ready)throw Error('Isolated Vite server did not become ready.');
 const code=await new Promise<number>(resolve=>{const test=spawn(process.execPath,[path.join(root,'node_modules/@playwright/test/cli.js'),'test','e2e/visual-smoke.spec.ts'],{cwd:path.join(root,'apps/web'),env,stdio:'inherit'});test.on('close',code=>resolve(code??1));test.on('error',()=>resolve(1));});
 process.exitCode=code;
}finally{vite.kill('SIGTERM');await app.close();fs.rmSync(directory,{recursive:true,force:true});}
