/** Adds three fully-built deterministic examples. Never clears existing work or calls an LLM. */
const base=(process.env.SPROUT_DEMO_BASE_URL||'http://127.0.0.1:3010').replace(/\/$/,'');
async function request(path,body){const r=await fetch(base+'/api/studio'+path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});const data=await r.json();if(!r.ok)throw Error(data.message);return data;}
const {projects}=await request('/projects');
for(const [template,prompt]of [
 ['star-catcher','演示作品：接住星星，试着调整目标、速度和颜色。'],
 ['pet-care','演示作品：照顾芽芽，发现饱腹、快乐和精力怎样变化。'],
 ['focus-timer','演示作品：让小树陪你专注，试一试暂停和继续。']
]){
 let p=projects.find(x=>x.provider==='demo'&&x.template===template&&x.prompt===prompt)||await request('/plan',{provider:'demo',template,prompt});
 while(p.modules.some(m=>m.status!=='done'))p=await request('/projects/'+p.id+'/build',{});
 console.log(`${p.title}: ${base.replace(':3010',':5173')}/#project=${p.id}`);
}
