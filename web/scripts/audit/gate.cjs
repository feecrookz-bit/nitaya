const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for (const mobile of [false,true]) {
  const ctx = await b.newContext(mobile?{viewport:{width:400,height:840},hasTouch:true,isMobile:true}:{viewport:{width:1440,height:900}});
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('nitya-offer', String(Date.now())) } catch { /* private mode */ } }) // the offer pop-up has its own test
  const errs=[], bad=[];
  p.on('pageerror',e=>errs.push(e.message.slice(0,140)));
  p.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url().slice(-60)); });
  await p.goto('http://localhost:8765/nitaya/',{waitUntil:'load'}); await p.waitForTimeout(300);
  await p.fill('#pw','nitya2026!!'); await p.click('#go');
  for(let i=0;i<60;i++){ await p.waitForTimeout(300); if(await p.evaluate(()=>!!document.querySelector('.nav-in'))) break; }
  console.log((mobile?'M':'D'),'unlocked', await p.evaluate(()=>!!document.querySelector('.nav-in')), 'gate size', await p.evaluate(()=>performance.getEntriesByType('navigation')[0]?.transferSize));
  await p.waitForTimeout(2500);
  console.log(' 3D canvas', await p.locator('canvas').count(), 'chunk', await p.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('StoneScene'))));
  // every product page
  const ids = await p.evaluate(()=>[...document.querySelectorAll('a[href^="#/product/"]')].map(a=>a.getAttribute('href').slice(10)));
  await p.evaluate(()=>{location.hash='#/shop'}); await p.waitForTimeout(600);
  const all = await p.evaluate(()=>[...new Set([...document.querySelectorAll('a[href^="#/product/"]')].map(a=>a.getAttribute('href').slice(10)))]);
  let tot=0, min=99, noStory=[];
  for (const id of all) { await p.evaluate(h=>{location.hash='#/product/'+h},id); await p.waitForTimeout(350);
    const n = await p.locator('.thumbs button').count(); const s = await p.locator('.story').count(); const h1=await p.locator('h1').textContent();
    if(!s) noStory.push(id); tot+=n; min=Math.min(min,n||1); if(!h1) errs.push('no h1 '+id); }
  console.log(' products', all.length, 'gallery frames total', tot, 'min per product', min, 'without story', noStory.join(',')||'none');
  // gallery interactions on one
  await p.evaluate(()=>{location.hash='#/product/quartz-white'}); await p.waitForTimeout(500);
  await p.locator('.thumbs button').nth(5).click(); await p.waitForTimeout(200); console.log(' thumb->', await p.locator('.g-count').first().textContent());
  await p.locator('.gallery .main img').click(); await p.waitForTimeout(300); console.log(' lightbox', await p.locator('.lightbox').count()); await p.locator('.lb-close').click(); await p.waitForTimeout(200);
  await p.waitForTimeout(1500);
  console.log(' errors:', errs.join('; ')||'none', '| bad responses:', bad.slice(0,5).join('; ')||'none');
  await ctx.close();
  }
  await b.close();
})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
