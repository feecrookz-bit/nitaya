const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const base='file://'+process.cwd()+'/dist-single/index.html';
  const routes=['','shop','shop?cat=offers','collections','build','samples','projects','guides','guide/laying-indian-sandstone','trade','about','faq','contact','cart','checkout','product/raj-green','product/bodo-white','product/cladding'];
  const widths=[360,400,768,1024,1440];
  const findings=[];
  for (const w of widths) {
    const p = await b.newPage({viewport:{width:w,height:820}});
    p.on('pageerror',e=>findings.push(`JS ERROR @${w}: ${e.message.slice(0,120)}`));
    await p.goto(base); await p.waitForTimeout(500);
    await p.evaluate(()=>{ try{localStorage.setItem('nitya-bag',JSON.stringify([{id:'bodo-white',qty:2},{id:'sample:raj-green',qty:1}]))}catch(e){} });
    for (const r of routes) {
      await p.goto(base+'#/'+r); await p.waitForTimeout(650);
      await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,40)); } window.scrollTo(0,0); });
      await p.waitForTimeout(300);
      const f = await p.evaluate((route)=>{
        const out=[]; const vw=window.innerWidth;
        if (document.documentElement.scrollWidth > vw+1) out.push(`horizontal overflow: ${document.documentElement.scrollWidth}px > ${vw}px`);
        const seen=new Set();
        for (const el of document.querySelectorAll('section,div,figure,img,button,a,input,select,h1,h2,h3,p')) {
          const r=el.getBoundingClientRect(); if (r.width===0||r.height===0) continue;
          if (r.right > vw+2 && !el.closest('.marquee') && !el.closest('.slides') && !el.closest('.thumbs')) { const k=el.tagName+'.'+(el.className||'').toString().split(' ')[0]; if(!seen.has(k)){seen.add(k); out.push(`pokes past viewport: ${k} right=${Math.round(r.right)}`)} }
        }
        for (const el of document.querySelectorAll('h1,h2,h3,p,span,b,a,button')) {
          const cs=getComputedStyle(el); if (cs.overflow==='hidden' && cs.whiteSpace==='nowrap' && el.scrollWidth>el.clientWidth+2 && !el.classList.contains('sr-only')) out.push(`clipped text: ${el.tagName}.${(el.className||'').toString().split(' ')[0]} "${el.textContent.trim().slice(0,30)}"`);
        }
        for (const el of document.querySelectorAll('a.pill,button.pill,.bag-btn,.menu-btn,.theme-btn,.seg button,.qty button,.chip,.more,.links a')) {
          const r=el.getBoundingClientRect(); if (r.width===0) continue; if (r.height<40 && !el.classList.contains('more') && !el.closest('.links')) out.push(`small target: ${el.className.toString().split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)} "${el.textContent.trim().slice(0,20)}"`);
        }
        // text overlapping images at the hero: h1 must be within viewport
        const h1=document.querySelector('.hero-cine h1'); if(h1){const r=h1.getBoundingClientRect(); if(r.right>vw) out.push('hero h1 overflows')}
        return [...new Set(out)].map(x=>`#/${route} @${window.innerWidth}: ${x}`);
      }, r);
      findings.push(...f);
    }
    await p.close();
  }
  console.log(findings.length ? findings.join('\n') : 'NO FINDINGS');
  await b.close();
})();
