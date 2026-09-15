/*
 * Go-live audit: run against the deployed site (Cloudflare's pages.dev
 * address, or the real domain) and it checks everything DEPLOY.md asks for.
 *
 *   BASE=https://<project>.pages.dev node scripts/audit/golive.cjs
 *   BASE=https://nityastones.co.uk EXPECT=open node scripts/audit/golive.cjs
 *
 * EXPECT=gated (default) means the password gate should be up; EXPECT=open
 * means it should not be. Every line of public/_redirects is fetched and its
 * redirect checked, including the two old addresses with the invisible
 * character. Exit code 1 if anything fails. Needs Node 22 and Playwright.
 */
const fs = require('fs'), path = require('path')
const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const base = (process.env.BASE || 'http://localhost:8788').replace(/\/$/, '')
const expect = process.env.EXPECT || 'gated'
const F = [], ok = []
const fail = (m) => F.push(m), pass = (m) => ok.push(m)
const get = (u, opts = {}) => fetch(u, { redirect: 'manual', ...opts })

;(async () => {
  // 1. Home
  const home = await get(base + '/'); const html = await home.text()
  home.status === 200 ? pass('home 200') : fail(`home returned ${home.status}`)
  const gated = /Enter the password|unlock/i.test(html) && !/id="root"/.test(html)
  if (expect === 'gated') gated ? pass('password gate is up') : fail('expected the password gate; the site is open')
  else gated ? fail('expected the site open; the password gate is still up (remove SITE_PASSWORD, set PUBLIC_SITE=true)') : pass('site is open, no gate')
  const nosniff = home.headers.get('x-content-type-options'); nosniff === 'nosniff' ? pass('safety headers present') : fail('X-Content-Type-Options header missing (_headers not applied)')

  // 2. Fallback: an unknown path must serve the site with a 200, not a 404 page
  const deep = await get(base + '/product/raj-green')
  deep.status === 200 ? pass('unknown path serves the site (200)') : fail(`/product/raj-green returned ${deep.status}; Cloudflare should serve index.html for it (is there a 404.html in publish/?)`)

  // 3. Assets cached immutable
  const m = html.match(/(assets\/[^"']+\.(?:js|css|jpg|png|webp))/); 
  if (m) { const a = await get(base + '/' + m[1]); const cc = a.headers.get('cache-control') || ''; a.status === 200 && /immutable/.test(cc) ? pass('hashed assets cached immutable') : fail(`asset ${m[1]}: status ${a.status}, cache-control "${cc}"`) }
  else if (!gated) fail('no asset reference found on the home page')
  for (const f of ['favicon.png', 'og.jpg', 'apple-touch-icon.png']) { const r = await get(base + '/' + f); r.status === 200 ? pass(f) : fail(`${f} returned ${r.status}`) }

  // 4. Every redirect line
  const lines = fs.readFileSync(path.join(__dirname, '..', '..', 'public', '_redirects'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  let good = 0
  for (const l of lines) {
    const [from, to, code] = l.split(/\s+/); if (from.includes('*')) continue
    const r = await get(base + from); const loc = r.headers.get('location') || ''
    const want = to.startsWith('http') ? to : base + to
    if (r.status === +(code || 302) && (loc === want || loc === to || loc.replace(/\/$/, '') === want.replace(/\/$/, ''))) good++
    else fail(`redirect ${from} -> got ${r.status} ${loc || '(no location)'}; wanted ${code} ${want}`)
  }
  pass(`${good} of ${lines.filter(l => !l.split(/\s+/)[0].includes('*')).length} redirects fire correctly`)
  for (const w of ['/blog/anything/', '/my-account/lost-password/']) { const r = await get(base + w); (r.status === 301 && /wp\./.test(r.headers.get('location') || '')) ? pass(`wildcard ${w}`) : fail(`wildcard ${w}: ${r.status} ${r.headers.get('location')}`) }
  // Both spellings of the encoding: browsers send %E2%81%A0, other clients may send %e2%81%a0, and Cloudflare matches the text literally.
  const odd = lines.filter(l => l.toLowerCase().includes('%e2%81%a0')); odd.length === 4 ? pass('the two invisible-character addresses are in the list, in both encodings') : fail(`expected 4 invisible-character redirect lines (two addresses, two encodings), found ${odd.length}`)

  // 5. In a browser: the redirects land on the right product, and old paths without the # work
  if (!gated) {
    // Behind an HTTPS proxy (as in the build container) Chromium needs the proxy and must accept its certificate.
    const proxy = process.env.HTTPS_PROXY && (process.env.BASE || '').startsWith('https')
    const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', ...(proxy ? { proxy: { server: process.env.HTTPS_PROXY }, args: ['--ignore-certificate-errors'] } : {}) })
    const p = await (await b.newContext(proxy ? { ignoreHTTPSErrors: true } : {})).newPage()
    await p.addInitScript(() => { try { localStorage.setItem('nitya-offer', String(Date.now())) } catch (e) {} })
    const land = async (u, h1) => { await p.goto(base + u); await p.waitForTimeout(900); const t = (await p.evaluate(() => document.querySelector('h1')?.textContent || '')).trim(); return t.includes(h1) ? pass(`${u} -> "${h1}"`) : fail(`${u} landed on "${t.slice(0, 40)}", expected "${h1}"`) }
    await land('/product/raj-green-mixed-patio-pack-22mm/', 'Raj Green')
    await land('/product/%e2%81%a0noor-grigio-porcelain/', 'Noor Grigio')
    await land('/product/%E2%81%A0noor-grigio-porcelain/', 'Noor Grigio')
    await land('/product/%e2%81%a0light-grey-porcelain/', 'Light Grey')
    await land('/product/%E2%81%A0light-grey-porcelain/', 'Light Grey')
    await land('/product/raj-green', 'Raj Green')
    await land('/guide/laying-indian-sandstone/', 'How to lay Indian sandstone')
    await land('/product-category/sandstones/', 'Sandstone')
    const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(base + '/#/checkout'); await p.waitForTimeout(800)
    errs.length ? fail('page errors: ' + errs.join(' | ')) : pass('no page errors on checkout')
    await b.close()
  } else pass('browser checks skipped while gated (run with EXPECT=open after go-live)')

  console.log(ok.map(x => '  ok  ' + x).join('\n'))
  if (F.length) { console.log('\nFAILED\n' + F.map(x => '  --  ' + x).join('\n')); process.exit(1) }
  console.log('\nNO FINDINGS')
})().catch(e => { console.error(e); process.exit(1) })
