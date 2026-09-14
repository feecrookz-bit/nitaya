/* Text over photographs: run after SINGLE=1 npm run build. Needs pngjs (PNGJS=<path to pngjs>). ONLY='{"theme":"dark","w":400,"route":"/"}' narrows; DUMP=1 writes crops of failures to scripts/audit/out/. */
// Contrast of text laid over photographs: for every text node inside a
// photo-backed block, hide the text, screenshot what is behind each line box,
// and compare the text colour with the brightest pixels behind it (worst case
// for light text) and the darkest (for dark text).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { PNG } = require(process.env.PNGJS || 'pngjs');
const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b) };
const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
const SEL = '.scene figcaption b, .scene figcaption span, .banner h1, .banner h2, .banner .kicker, .banner .intro, .banner .from, .hero h1, .hero h1 span, .hero p, .hero .kicker, .hero .facts *, .product.feature figcaption *, .product.feature .pick, .lightbox .count, .marquee figcaption';
(async () => {
  const b = await chromium.launch(); const rows = [];
  const ONLY = process.env.ONLY ? JSON.parse(process.env.ONLY) : null;
  for (const theme of ONLY ? [ONLY.theme] : ['dark', 'light']) for (const [w, h] of ONLY ? [[ONLY.w, 840]] : [[1440, 900], [400, 840]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.addInitScript(() => { try { localStorage.setItem('nitya-offer', String(Date.now())) } catch { /* private mode */ } }) // the offer pop-up has its own test
    for (const route of ONLY ? [ONLY.route] : ['/', '/projects', '/shop', '/collections', '/product/raj-green']) {
      await p.goto('file:///home/user/nitaya/web/dist-single/index.html#' + route);
      await p.evaluate(t => localStorage.setItem('nitya-theme', t), theme); await p.reload(); await p.waitForTimeout(800);
      const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 500) { await p.mouse.wheel(0, 500); await p.waitForTimeout(40); }
      await p.waitForTimeout(1200); await p.evaluate(() => window.scrollTo(0, 0));
      await p.evaluate(async () => { const st = document.createElement('style'); st.textContent = 'html{scroll-behavior:auto!important} *,*::before,*::after{transition:none!important;animation:none!important} .reveal,[data-reveal],[data-reveal].pre > .wrap,.in,.scene,.banner,.hero{opacity:1!important;transform:none!important}'; document.head.appendChild(st); for (const i of document.images) i.loading = 'eager'; await Promise.race([Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r }))), new Promise(r => setTimeout(r, 4000))]); });
      await p.waitForTimeout(400);
      const items = await p.evaluate((sel) => {
        const out = []; let i = 0;
        for (const el of document.querySelectorAll(sel)) {
          const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || !el.textContent.trim()) continue;
          const rects = []; const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let n; while ((n = walker.nextNode())) { if (!n.textContent.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); for (const q of r.getClientRects()) if (q.width > 4 && q.height > 4) rects.push({ x: q.left + scrollX, y: q.top + scrollY, w: q.width, h: q.height }); }
          if (!rects.length) continue;
          el.dataset.op = String(i++);
          out.push({ id: el.dataset.op, tag: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''), color: cs.color, size: parseFloat(cs.fontSize), weight: cs.fontWeight, text: el.textContent.trim().slice(0, 40), rects });
        }
        const st = document.createElement('style'); st.textContent = '[data-op]{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important}'; document.head.appendChild(st);
        return out;
      }, SEL);
      if (!items.length) continue;
      const pngFull = PNG.sync.read(await p.screenshot({ fullPage: true, type: 'png' })); if (process.env.DUMP) console.log('page', H, 'capture', pngFull.height);
      for (const it of items) {
        let png = pngFull;
        if (H > 15000 || pngFull.height < H - 10 || it.rects.some(r => r.y + r.h > 15000)) { // Chromium scales or clips full-page captures of very tall pages
          const vr = await p.evaluate(async (id) => { const el = document.querySelector(`[data-op="${id}"]`); el.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 500)); const rects = []; const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = walker.nextNode())) { if (!n.textContent.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); for (const q of r.getClientRects()) if (q.width > 4 && q.height > 4) rects.push({ x: q.left, y: q.top, w: q.width, h: q.height }); } return rects; }, it.id);
          const shot = await p.screenshot({ type: 'png' }); if (process.env.DUMP) require('fs').writeFileSync(`scripts/audit/out/overphoto-vp-${theme}-${w}-${it.id}.png`, shot); png = PNG.sync.read(shot); it.rects = vr; if (process.env.DUMP) console.log('vp rects', JSON.stringify(vr));
        }
        const m = it.color.match(/[\d.]+/g).map(Number); const alpha = m[3] ?? 1; if (alpha < .5) continue;
        const tl = lum(m); let worst = 99;
        for (const r of it.rects) {
          const L = [];
          for (let y = Math.floor(r.y); y < Math.min(png.height, r.y + r.h); y++) for (let x = Math.floor(r.x); x < Math.min(png.width, r.x + r.w); x++) { const k = (y * png.width + x) * 4; L.push(lum([png.data[k], png.data[k + 1], png.data[k + 2]])); }
          if (!L.length) continue; L.sort((a, b) => a - b);
          const bg = tl > .5 ? L[Math.floor(L.length * .95)] : L[Math.floor(L.length * .05)]; // 5% worst pixels behind the text
          worst = Math.min(worst, cr(tl, bg));
        }
        const large = it.size >= 24 || (it.size >= 18.66 && +it.weight >= 700);
        rows.push({ theme, w, route, tag: it.tag, text: it.text, size: it.size, contrast: +worst.toFixed(2), need: large ? 3 : 4.5 });
        if (worst < (large ? 3 : 4.5) && process.env.DUMP) { const r = it.rects[0]; const x0 = Math.max(0, Math.floor(r.x) - 40), y0 = Math.max(0, Math.floor(r.y) - 120), cw = Math.min(png.width - x0, 400), ch = Math.min(png.height - y0, 260); const out = new PNG({ width: cw, height: ch }); PNG.bitblt(png, out, x0, y0, cw, ch, 0, 0); require('fs').writeFileSync(`scripts/audit/out/overphoto-fail-${theme}-${w}-${it.id}.png`, PNG.sync.write(out)); }
      }
    }
    await p.close();
  }
  await b.close();
  const bad = rows.filter(r => r.contrast < r.need);
  console.log('measured', rows.length, 'below threshold', bad.length);
  for (const r of bad.sort((a, b) => a.contrast - b.contrast)) console.log(`${r.theme} ${r.w} ${r.route} ${r.tag} ${r.size}px ${r.contrast}:1 (need ${r.need}) "${r.text}"`);
  require('fs').writeFileSync('scripts/audit/out/overphoto.json', JSON.stringify(rows, null, 1));
})();
