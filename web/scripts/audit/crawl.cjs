const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx = await b.newContext({viewport:{width:1280,height:900}});
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('nitya-offer', String(Date.now())) } catch { /* private mode */ } }) // the offer pop-up has its own test
  const base='file://'+process.cwd()+'/dist-single/index.html';
  const problems=[]; const errs=[];
  p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  p.on('console',m=>{ if(m.type()==='error' && !/CONNECTION_RESET|fonts\.g/.test(m.text())) errs.push('console: '+m.text().slice(0,200)); });
  const seen=new Set(); const queue=['']; const external=new Set(); let pages=0;
  while(queue.length){
    const route=queue.shift(); if(seen.has(route)) continue; seen.add(route);
    await p.goto(base+'#/'+route); await p.waitForTimeout(500); await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=600){ scrollTo(0,y); await new Promise(r=>setTimeout(r,140)); } scrollTo(0,0); }); await p.waitForTimeout(1200); pages++;
    const info = await p.evaluate(()=>{
      const links=[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
      const imgs=[...document.images].map(i=>({src:(i.currentSrc||i.src).slice(0,60), ok:!(i.complete&&i.naturalWidth===0), alt:i.hasAttribute('alt')}));
      const notFound=/Not found/.test(document.querySelector('main')?.textContent||'');
      const empty=(document.querySelector('main')?.textContent||'').trim().length<20;
      const unlabeled=[...document.querySelectorAll('input,select,textarea')].filter(el=>!el.id||!document.querySelector(`label[for="${el.id}"]`)).filter(el=>!el.getAttribute('aria-label')).map(el=>el.id||el.name||el.type);
      const buttonsNoName=[...document.querySelectorAll('button')].filter(b=>!(b.textContent.trim()||b.getAttribute('aria-label'))).length;
      const h1=document.querySelectorAll('h1').length;
      return {links,imgs,notFound,empty,unlabeled,buttonsNoName,h1,title:document.title};
    });
    if(info.notFound) problems.push(`NOT FOUND page: #/${route}`);
    if(info.empty) problems.push(`EMPTY page: #/${route}`);
    if(route!=='' && info.h1>1) problems.push(`multiple h1 on #/${route}`);
    info.imgs.filter(i=>!i.ok).forEach(i=>problems.push(`broken image on #/${route}: ${i.src}`));
    info.imgs.filter(i=>!i.alt).forEach(i=>problems.push(`img without alt on #/${route}: ${i.src}`));
    if(info.unlabeled.length) problems.push(`unlabeled fields on #/${route}: ${info.unlabeled.join(',')}`);
    if(info.buttonsNoName) problems.push(`${info.buttonsNoName} unnamed buttons on #/${route}`);
    for(const h of info.links){
      if(h.startsWith('#/')){ const r=h.slice(2).split('#')[0]; if(!seen.has(r)) queue.push(r); }
      else if(/^(https?:|tel:|mailto:)/.test(h)) external.add(h);
      else problems.push(`odd href on #/${route}: ${h}`);
    }
  }
  // functional flows
  const flow=[];
  await p.goto(base+'#/product/bodo-white'); await p.waitForTimeout(600);
  await p.click('.qty button[aria-label="More"]'); await p.click('text=Add to bag');
  await p.waitForTimeout(300);
  flow.push('bag count after add x2: '+await p.textContent('.bag-btn'));
  await p.click('text=Order a 100×100 mm sample'); await p.waitForTimeout(200);
  await p.goto(base+'#/cart'); await p.waitForTimeout(600);
  flow.push('cart lines: '+await p.locator('.line').count()+' total: '+await p.textContent('.summary .row.total .v'));
  await p.goto(base+'#/checkout'); await p.waitForTimeout(600);
  flow.push('place order disabled before fields: '+await p.locator('button:has-text("Place order")').isDisabled());
  await p.fill('#coName','Test Person'); await p.fill('#coPhone','07000000000'); await p.fill('#coLine1','1 Road'); await p.fill('#coPost','HP2 7BW');
  flow.push('enabled after fields: '+!(await p.locator('button:has-text("Place order")').isDisabled()));
  await p.click('button:has-text("Place order")'); await p.waitForTimeout(400);
  flow.push('confirmation: '+(await p.textContent('.done h1')).trim()+' / bag now: '+(await p.textContent('.bag-btn')).trim());
  await p.goto(base+'#/build'); await p.waitForTimeout(600);
  await p.fill('#bLen','5'); await p.fill('#bWid','5'); await p.click('button:has-text("Save this design")'); await p.waitForTimeout(300);
  flow.push('builder saved rows: '+await p.locator('.saved-row').count()+' total: '+await p.textContent('.design .row.total .v'));
  await p.goto(base+'#/shop?cat=indoor'); await p.waitForTimeout(600);
  flow.push('indoor shop cards: '+await p.locator('.product').count());
  await p.fill('#shopSearch','raj'); await p.waitForTimeout(300);
  flow.push('search "raj" in indoor: '+await p.locator('.product').count()+' (expect 0)');
  await p.goto(base+'#/shop'); await p.waitForTimeout(400); await p.fill('#shopSearch','raj'); await p.waitForTimeout(300);
  flow.push('search "raj" all: '+await p.locator('.product').count());
  await p.goto(base+'#/collections#II'); await p.waitForTimeout(800);
  flow.push('collections#II scrollY: '+await p.evaluate(()=>window.scrollY)+' (expect >0)');
  await p.goto(base+'#/contact'); await p.waitForTimeout(400); await p.fill('#cName','A'); await p.click('button:has-text("Copy enquiry")'); await p.waitForTimeout(200);
  flow.push('contact copy status: '+(await p.textContent('.copied')).slice(0,40));
  // mobile menu
  const m = await ctx.newPage(); await m.setViewportSize({width:400,height:820}); await m.goto(base); await m.waitForTimeout(600);
  await m.addInitScript(() => { try { localStorage.setItem('nitya-offer', String(Date.now())) } catch { /* private mode */ } }) // the offer pop-up has its own test
  await m.click('.menu-btn'); await m.waitForTimeout(200);
  flow.push('mobile drawer visible: '+await m.locator('.drawer.open').isVisible());
  await m.click('.drawer a:has-text("Guides")'); await m.waitForTimeout(500);
  flow.push('mobile nav to guides: '+/guides/.test(m.url())+' drawer closed: '+!(await m.locator('.drawer.open').count()));
  console.log(JSON.stringify({pages, routes:[...seen].length, external:[...external], problems, errs:[...new Set(errs)], flow},null,1));
  await b.close();
})();
