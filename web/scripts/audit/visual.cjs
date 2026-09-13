/*
 * Visual pass: every route at three widths in both themes, tiled into
 * contact sheets for a human look. Also prints two pages to PDF.
 *   node scripts/audit/visual.cjs   -> scripts/audit/out/sheet-*.jpg, *.pdf
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const fs = require('node:fs'), path = require('node:path')
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true })
const ROUTES = ['', 'shop', 'shop?cat=offers', 'product/raj-green', 'product/calacatta-blanco', 'collections', 'build', 'guides', 'guide/laying-indian-sandstone', 'projects', 'trade', 'about', 'faq', 'contact', 'samples', 'cart', 'checkout']
;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const base = 'file://' + process.cwd() + '/dist-single/index.html'
  for (const theme of ['dark', 'light']) for (const w of [400, 768, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: w < 500 ? 840 : 900 }, reducedMotion: 'reduce' })
    await p.goto(base); await p.evaluate(t => { try { localStorage.setItem('nitya-theme', t); localStorage.setItem('nitya-bag', JSON.stringify([{ id: 'bodo-white', qty: 2 }, { id: 'sample:raj-green', qty: 1 }])) } catch (e) {} }, theme); await p.reload(); await p.waitForTimeout(400)
    for (const r of ROUTES) {
      await p.goto(base + '#/' + r); await p.waitForTimeout(500)
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(res => setTimeout(res, 50)) } scrollTo(0, 0) })
      await p.waitForTimeout(400)
      await p.screenshot({ path: path.join(OUT, `${theme}-${w}-${(r || 'home').replace(/[^a-z0-9]+/gi, '_')}.png`), fullPage: true })
    }
    if (theme === 'dark' && w === 1440) { for (const r of ['product/raj-green', 'about']) { await p.goto(base + '#/' + r); await p.waitForTimeout(500); await p.emulateMedia({ media: 'print' }); await p.pdf({ path: path.join(OUT, r.replace(/\W/g, '_') + '.pdf'), format: 'A4', printBackground: true }); await p.emulateMedia({ media: 'screen' }) } }
    await p.close()
  }
  await b.close(); console.log('shots in', OUT)
})().catch(e => { console.error('FAIL', e.message); process.exit(1) })
