// Run against the flat bundle on localhost using a fresh browser context.
// TEST_URL=http://127.0.0.1:4180 node tests/ui.cjs
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.TEST_URL || 'http://127.0.0.1:4180/';
assert.ok(['127.0.0.1','localhost'].includes(new URL(url).hostname), 'Use a disposable local test origin');

(async () => {
  const engine = process.env.BROWSER === 'webkit' ? webkit : chromium;
  const browser = await engine.launch(engine === chromium ? { channel:'chromium' } : {});
  try {
    const ctx = await browser.newContext({viewport:{width:320,height:740}, reducedMotion:'reduce', serviceWorkers:'block'});
    const p = await ctx.newPage(), errors = [], outside = [];
    p.on('pageerror', e => errors.push(e.message));
    p.on('request', req => {if (new URL(req.url()).origin !== new URL(url).origin) outside.push(req.url());});
    await p.goto(url); await p.locator('#page-title').waitFor();
    await p.evaluate(async () => {
      const c = await import('./core.js'), db = await import('./db.js');
      const s = c.createInitialState(), u = c.activeUser(s);
      u.sessions.push({id:'sample',kind:'strength',bodyWeight:70,startedAt:new Date(Date.now()-86400000).toISOString(),sets:[{id:'a',exerciseId:'bench-press',weight:42.5,reps:8}]});
      const d = c.activePlan(u).days[new Date().getDay()];
      Object.assign(d,{mode:'strength',exercises:[{exerciseId:'bench-press',sets:3,repsBySet:[12,10,8],weight:40},{exerciseId:'barbell-row',sets:3,repsBySet:[12,10,8],weight:40}]});
      await db.saveState(s);
    });
    await p.reload(); await p.locator('.exercise').first().waitFor();
    const nav = r => p.locator('[data-route="'+r+'"]').click();
    async function fits() {
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1),'Page overflow: '+await p.title());
    }
    async function audit(where) {
      if (!process.env.AXE_MODULE) return;
      await p.addScriptTag({path:process.env.AXE_MODULE});
      const issues = await p.evaluate(async () => (await axe.run(document,{
        runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}
      })).violations.map(v=>({rule:v.id,nodes:v.nodes.map(n=>[n.target,n.failureSummary])})));
      assert.deepEqual(issues,[],where+': '+JSON.stringify(issues));
    }
    for(const route of ['today','plans','history','progress','settings']) {
      await nav(route); await fits();
      assert.equal(await p.locator('[aria-current="page"]').getAttribute('data-route'),route);
      if(route !== 'today') assert.ok(await p.locator('#page-title').evaluate(el=>el===document.activeElement));
      await audit('320px TH '+route);
    }
    await p.locator('[data-setting="language"][data-value="en"]').click();
    await nav('progress'); await p.locator('.chart-values summary').click();
    assert.match(await p.locator('.chart-values table').innerText(),/42.5/);
    await p.locator('[data-action="report"]').click();
    await fits(); await p.getByRole('button',{name:'Next period'}).click();
    await audit('weekly report');
    await p.emulateMedia({media:'print'});
    assert.equal(await p.locator('.rail').isVisible(),false);
    assert.ok(await p.locator('.report-paper').isVisible());
    await p.emulateMedia({media:'screen'});
    await nav('settings');
    for (const mode of ['dark','light']) {
      await p.locator('[data-setting="appearance"][data-value="'+mode+'"]').click();
      for(const theme of ['warm','forest','mono','cool']) {
        await p.locator('[data-setting="theme"][data-value="'+theme+'"]').click();
        await p.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
        assert.equal(await p.locator('[data-setting="theme"][data-value="'+theme+'"]').getAttribute('aria-pressed'),'true');
        await audit(mode+' '+theme);
      }
    }
    assert.equal(await p.locator('#toast').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
    await nav('plans'); const newPlan = p.locator('[data-action="new-plan"]');
    await newPlan.focus(); await p.keyboard.press('Enter');
    await p.locator('dialog[open]').waitFor();
    assert.ok(await p.locator('dialog').evaluate(el=>el.contains(document.activeElement)));
    for(let i=0;i<8;i++) {
      await p.keyboard.press('Tab');
      assert.ok(await p.evaluate(()=>!document.querySelector('#app').contains(document.activeElement)));
    }
    await audit('new plan dialog');
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('dialog').count(),0);
    assert.ok(await newPlan.evaluate(el=>el===document.activeElement));
    await nav('today'); await p.locator('[data-action="start-session"]').click();
    for (const width of [320,390,768,1024,1440]) {
      await p.setViewportSize({width,height:900}); await fits();
      assert.equal(await p.locator('.bottom-nav').evaluate(el=>getComputedStyle(el).position),width>=960?'static':'fixed');
      if(width===390||width===1440) await audit('active session '+width);
      if(process.env.SCREEN_DIR && (width===390||width===1440)) await p.screenshot({path:process.env.SCREEN_DIR+'/today-'+width+'.png'});
    }
    const form = p.locator('[data-form="set"]').first();
    await p.evaluate(()=>{
      const put=IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put=function(...args){IDBObjectStore.prototype.put=put; const request=put.apply(this,args); this.transaction.abort();return request;};
    });
    await form.locator('button[type="submit"]').click();
    await p.getByRole('alert').filter({hasText:'Save failed'}).waitFor();
    assert.equal(await p.evaluate(async()=>(await (await import('./db.js')).loadState()).users[0].activeSession.sets.length),0);
    await p.getByRole('button',{name:'Dismiss message'}).click();
    await form.locator('button[type="submit"]').click();await p.locator('.set-row').waitFor();
    // Delay a module to observe first paint; then fail IndexedDB without touching real data.
    const recovery = await ctx.newPage(); let release;
    const gate = new Promise(resolve=>release=resolve);
    await recovery.route('**/app.js',async route=>{await gate;await route.continue();});
    await recovery.addInitScript(()=>{indexedDB.open=()=>{throw Error('test: storage unavailable');};});
    await recovery.goto(url,{waitUntil:'commit'});
    await recovery.getByRole('status').filter({hasText:'Opening journal'}).waitFor(); release();
    await recovery.getByRole('button',{name:/Retry/}).waitFor();
    assert.match(await recovery.locator('main').innerText(),/has not been reset/);
    assert.deepEqual(errors,[]); assert.deepEqual(outside,[]);
    console.log('PASS: navigation, focus, modal keyboard flow, 320–1440px, TH/EN, themes, reduced motion, loading, storage recovery, no external requests');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
