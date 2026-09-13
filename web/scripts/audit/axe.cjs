/*
 * axe-core accessibility audit over every route in both themes.
 *   AXE=/path/to/axe.min.js node scripts/audit/axe.cjs
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const fs = require('node:fs')
const AXE = fs.readFileSync(process.env.AXE, 'utf8')
const ROUTES = ['', 'shop', 'shop?cat=offers', 'product/raj-green', 'product/calacatta-blanco', 'collections', 'build', 'guides', 'guide/laying-indian-sandstone', 'projects', 'trade', 'about', 'faq', 'contact', 'samples', 'cart', 'checkout']
;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const base = 'file://' + process.cwd() + '/dist-single/index.html'
  const seen = new Map()
  for (const theme of ['dark', 'light']) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
    await p.goto(base); await p.evaluate(t => { try { localStorage.setItem('nitya-theme', t); localStorage.setItem('nitya-bag', JSON.stringify([{ id: 'bodo-white', qty: 2 }])) } catch (e) {} }, theme); await p.reload(); await p.waitForTimeout(400)
    for (const r of ROUTES) {
      await p.goto(base + '#/' + r); await p.waitForTimeout(600)
      await p.addScriptTag({ content: AXE })
      const res = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } })).violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ')) })))
      for (const v of res) { const k = v.id + '|' + theme; const e = seen.get(k) || { ...v, routes: [] }; e.routes.push(r || 'home'); seen.set(k, e) }
    }
    await p.close()
  }
  await b.close()
  const arr = [...seen.values()].sort((a, b) => ['critical', 'serious', 'moderate', 'minor'].indexOf(a.impact) - ['critical', 'serious', 'moderate', 'minor'].indexOf(b.impact))
  console.log('violations (unique id×theme):', arr.length)
  for (const v of arr) console.log(`${v.impact.toUpperCase()} ${v.id} — ${v.help}\n   routes: ${v.routes.join(', ')}\n   e.g. ${v.nodes.join(' | ')}`)
})().catch(e => { console.error('FAIL', e.message); process.exit(1) })
