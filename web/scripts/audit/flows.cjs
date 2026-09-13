/*
 * Behaviour audit: keyboard, focus, persistence, edge cases, business details
 * on every page, structured data, route titles, the gate's failure paths.
 *   node scripts/audit/flows.cjs     (from web/, after SINGLE=1 npm run build
 *   and the gated publish/ build served at http://localhost:8765/nitaya/)
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const F = []
const ok = (cond, msg) => { if (!cond) F.push(msg) }
;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const base = 'file://' + process.cwd() + '/dist-single/index.html'
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)))

  // --- business details on every page: footer carries phone, mobile, email, address, hours; JSON-LD present once
  const BIZ = await (async () => { await p.goto(base); await p.waitForTimeout(500); return p.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent || 'null')) })()
  ok(BIZ && BIZ.telephone === '+44 330 236 9227' && BIZ.address.postalCode === 'HP2 7BW' && BIZ.email === 'info@nityastones.co.uk', 'JSON-LD missing or wrong: ' + JSON.stringify(BIZ).slice(0, 120))
  const routes = ['', 'shop', 'product/raj-green', 'collections', 'build', 'guides', 'guide/laying-indian-sandstone', 'projects', 'trade', 'about', 'faq', 'contact', 'samples', 'cart', 'checkout']
  const titles = new Set()
  for (const r of routes) {
    await p.goto(base + '#/' + r); await p.waitForTimeout(450)
    const t = await p.title(); ok(t && t.includes('Nitya Stones'), `title missing brand on #/${r}: ${t}`); ok(!titles.has(t) || r === '', `duplicate title on #/${r}: ${t}`); titles.add(t)
    const foot = await p.evaluate(() => document.querySelector('footer')?.innerText || '')
    for (const need of ['0330 236 9227', '07932 009870', 'info@nityastones.co.uk', '34 Mark Road', 'HP2 7BW', 'Mon–Fri 8–6']) ok(foot.includes(need), `footer on #/${r} lacks "${need}"`)
    const tel = await p.evaluate(() => [...document.querySelectorAll('a[href^="tel:"]')].map(a => a.getAttribute('href')))
    ok(tel.includes('tel:03302369227') && tel.includes('tel:07932009870'), `tel links on #/${r}: ${tel.join(',')}`)
    ok(await p.evaluate(() => document.querySelectorAll('script[type="application/ld+json"]').length) === 1, `JSON-LD count != 1 on #/${r}`)
    ok(await p.evaluate(() => document.querySelectorAll('h1').length) === 1, `h1 count != 1 on #/${r}`)
  }
  // contact page: maps link, whatsapp, hours table
  await p.goto(base + '#/contact'); await p.waitForTimeout(400)
  ok(await p.locator('a[href*="google.com/maps"]').count() >= 1, 'contact: no Google Maps link')
  ok(await p.locator('a[href*="wa.me"]').count() >= 1, 'contact: no WhatsApp link')
  ok((await p.locator('.detail').count()) >= 6, 'contact: hours rows missing')

  // --- keyboard: skip to nav, drawer at 400px, Escape closes, focus visible
  const m = await b.newPage({ viewport: { width: 400, height: 840 }, hasTouch: true, isMobile: true })
  m.on('pageerror', e => errs.push('m:' + e.message.slice(0, 160)))
  await m.goto(base); await m.waitForTimeout(500)
  await m.click('.menu-btn'); await m.waitForTimeout(250)
  ok(await m.evaluate(() => !!document.querySelector('.drawer') && getComputedStyle(document.querySelector('.drawer')).display !== 'none'), 'drawer did not open')
  await m.keyboard.press('Escape'); await m.waitForTimeout(250)
  ok(await m.evaluate(() => { const d = document.querySelector('.drawer'); return !d || getComputedStyle(d).display === 'none' || !d.classList.contains('open') }), 'Escape did not close the drawer')
  await m.close()
  // focus rings on the first 40 focusable elements
  await p.goto(base + '#/shop'); await p.waitForTimeout(400)
  const noRing = await p.evaluate(() => {
    const els = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(e => e.offsetParent).slice(0, 60); const bad = []
    for (const e of els) { e.focus({ focusVisible: true }); const cs = getComputedStyle(e); const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'; if (!ring) bad.push(e.tagName + '.' + (e.className || '').toString().split(' ')[0]) }
    return [...new Set(bad)]
  })
  ok(noRing.length === 0, 'no visible focus ring on: ' + noRing.join(', '))

  // --- lightbox keyboard
  await p.goto(base + '#/product/quartz-white'); await p.waitForTimeout(500)
  await p.click('.gallery .main img'); await p.waitForTimeout(300)
  ok(await p.locator('.lightbox').count() === 1, 'lightbox did not open')
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150)
  ok((await p.locator('.lb-main .g-count').textContent()).startsWith('2 /'), 'lightbox ArrowRight did not advance')
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
  ok(await p.locator('.lightbox').count() === 0, 'lightbox Escape did not close')

  // --- bag persistence and edge cases
  await p.click('.buy .pill'); await p.waitForTimeout(200)
  await p.reload(); await p.waitForTimeout(500)
  ok((await p.locator('.bag-btn').textContent()).includes('1'), 'bag did not persist across reload')
  await p.goto(base + '#/cart'); await p.waitForTimeout(400)
  await p.click('.qty button[aria-label="Fewer"]'); await p.waitForTimeout(200)
  ok(await p.locator('.line').count() === 0 || (await p.locator('.empty').count()) === 1, 'qty to 0 did not remove the line')
  // --- checkout validation
  await p.goto(base + '#/product/raj-green'); await p.waitForTimeout(300); await p.click('.buy .pill'); await p.goto(base + '#/checkout'); await p.waitForTimeout(400)
  ok(await p.locator('button:has-text("Place order")').isDisabled(), 'place order enabled with empty form')
  await p.fill('#coName', 'Test'); await p.fill('#coPhone', '07000000000'); await p.fill('#coLine1', '1 Road'); await p.fill('#coPost', 'ZZ99 9ZZ'); await p.waitForTimeout(200)
  ok(await p.locator('button:has-text("Place order")').isEnabled(), 'place order stays disabled after fields')
  // --- delivery estimate: in band, out of band (ask), invalid
  await p.goto(base + '#/product/raj-green'); await p.waitForTimeout(300)
  for (const [pc, expect] of [['HP2 7BW', 'Local'], ['NW1 6XE', 'London'], ['IV2 3AA', 'ring'], ['hello', 'postcode']]) { await p.fill('#dpc', pc); await p.waitForTimeout(150); const t = await p.locator('.deliv-out').first().textContent(); ok(t.includes(expect), `delivery estimate for ${pc}: ${t.slice(0, 80)}`) }
  // --- search: no results, punctuation
  await p.goto(base + '#/shop'); await p.waitForTimeout(300)
  await p.fill('input[placeholder="Search ranges"]', 'zzzz'); await p.waitForTimeout(200)
  ok((await p.locator('.product').count()) === 0 && /no|0 products/i.test(await p.evaluate(() => document.querySelector('main')?.innerText || document.body.innerText)), 'search with no results lacks a message')
  await p.fill('input[placeholder="Search ranges"]', "raj's (green)"); await p.waitForTimeout(200); ok(errs.length === 0, 'search with punctuation threw')
  // --- back/forward and 404
  await p.goto(base + '#/guides'); await p.waitForTimeout(200); await p.goto(base + '#/trade'); await p.waitForTimeout(200); await p.goBack(); await p.waitForTimeout(300)
  ok((await p.title()).includes('Guides'), 'back did not restore Guides')
  await p.goto(base + '#/nowhere'); await p.waitForTimeout(300)
  ok(/not found/i.test(await p.evaluate(() => document.body.innerText)), 'unknown route has no not-found message')
  await p.goto(base + '#/product/nope'); await p.waitForTimeout(300); ok(/not found/i.test(await p.evaluate(() => document.body.innerText)), 'unknown product has no not-found message')
  // --- theme persistence with no flash: pre-paint script sets dataset before first paint
  await p.evaluate(() => localStorage.setItem('nitya-theme', 'light')); await p.reload(); await p.waitForTimeout(100)
  ok(await p.evaluate(() => document.documentElement.dataset.theme === 'light'), 'theme not applied from storage')
  // --- reduced motion: no Ken Burns animation
  const rm = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }); await rm.goto(base); await rm.waitForTimeout(500)
  ok(await rm.evaluate(() => [...document.querySelectorAll('.slides img, .slide')].every(e => getComputedStyle(e).animationName === 'none' || getComputedStyle(e).animationDuration === '0s')), 'hero animates under reduced motion')
  await rm.close()

  // --- gate: wrong password, session remember, deep link
  const g = await b.newPage({ viewport: { width: 400, height: 840 }, hasTouch: true, isMobile: true })
  await g.goto('http://localhost:8765/nitaya/#/guides'); await g.waitForTimeout(300)
  await g.fill('#pw', 'wrong'); await g.click('#go'); await g.waitForTimeout(2500)
  ok((await g.locator('#err').textContent()).length > 5, 'gate: wrong password gives no message')
  await g.fill('#pw', 'nitya2026!!'); await g.click('#go'); for (let i = 0; i < 60; i++) { await g.waitForTimeout(300); if (await g.evaluate(() => !!document.querySelector('.nav-in'))) break }
  ok((await g.title()).includes('Guides'), 'gate: deep link not honoured after unlock: ' + await g.title())
  await g.reload(); for (let i = 0; i < 60; i++) { await g.waitForTimeout(300); if (await g.evaluate(() => !!document.querySelector('.nav-in'))) break }
  ok(await g.evaluate(() => !!document.querySelector('.nav-in')), 'gate: session not remembered on reload')
  ok(await g.evaluate(async () => { await document.fonts.ready; const fs = [...document.fonts]; return fs.length >= 4 && fs.every(f => f.status !== 'error') && fs.some(f => f.family.replace(/"/g, '') === 'Cinzel' && f.status === 'loaded') }), 'gate: site fonts not loaded after unlock')
  await g.close()
  await b.close()
  ok(errs.length === 0, 'page errors: ' + errs.join(' | '))
  console.log(F.length ? F.map(f => 'FINDING ' + f).join('\n') : 'NO FINDINGS')
})().catch(e => { console.error('FAIL', e.message.slice(0, 300)); process.exit(1) })
