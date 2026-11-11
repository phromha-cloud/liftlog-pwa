// Disposable local browser storage only. Run like tests/ui.cjs.
const assert=require('node:assert/strict');
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.TEST_URL||'http://127.0.0.1:4180/';
assert.ok(['localhost','127.0.0.1'].includes(new URL(url).hostname));
(async()=>{
 const engine=process.env.BROWSER||'chromium', b=await pw[engine].launch(engine==='chromium'?{channel:'chromium'}:{});
 try{
  const ctx=await b.newContext({serviceWorkers:'block'}),a=await ctx.newPage(),other=await ctx.newPage();
  const read=p=>p.evaluate(async()=>(await import('./db.js')).loadState());
  const open=async p=>{await p.goto(url);await p.locator('[data-route=settings]').click();};
  await open(a);await open(other);const orig=await read(a);
  const upload=async(p,s)=>p.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});
  const bad=structuredClone(orig);bad.users[0].bodyWeight='"><img id="injected" src=x>';
  await upload(a,bad);await a.getByRole('alert').waitFor();assert.equal(await a.locator('[data-action=confirm-import],#injected').count(),0);
  assert.deepEqual(await read(a),orig);await a.getByRole('alert').locator('button').click();
  await a.evaluate(()=>{const f=new File(['x'],'big.json');Object.defineProperty(f,'size',{value:33*1024*1024});const dt=new DataTransfer();dt.items.add(f);const el=document.querySelector('#import-file');el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}));});
  await a.getByRole('alert').filter({hasText:'32 MiB'}).waitFor();assert.deepEqual(await read(a),orig);
  const good=structuredClone(orig);good.users[0].name='Recovered';await upload(a,good);await a.locator('[data-action=confirm-import]').click();await a.locator('.profile-chip').filter({hasText:'Recovered'}).waitFor();
  await other.locator('[data-setting=appearance][data-value=dark]').click();await other.getByRole('alert').waitFor();
  assert.equal((await read(a)).users[0].name,'Recovered');assert.equal((await read(a)).settings.appearance,orig.settings.appearance);
  await other.reload();await other.locator('.profile-chip').filter({hasText:'Recovered'}).waitFor();
  await other.locator('[data-route=settings]').click();await other.locator('[data-setting=appearance][data-value=dark]').click();
  await other.waitForFunction(()=>document.documentElement.dataset.mode==='dark');assert.equal((await read(a)).users[0].name,'Recovered');
  // If an old, damaged record is already on disk, let its owner recover the exact bytes as JSON.
  const damaged=await read(a);damaged.users[0].bodyWeight={invalid:true};
  await a.evaluate(async s=>{await (await import('./db.js')).saveState(s);},damaged);
  await a.reload();const dl=a.waitForEvent('download');await a.locator('[data-boot-export]').click();
  const file=await (await dl).path();assert.deepEqual(JSON.parse(require('node:fs').readFileSync(file,'utf8')),damaged);
  assert.deepEqual(await read(a),damaged);
  console.log('PASS '+engine+': invalid/oversize restore preserves state, valid restore, stale write rejected, reload and retry.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
