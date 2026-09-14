#!/usr/bin/env node
/*
 * Capture the screenshot pairs for the owner pack.
 *
 *   node present/shoot.mjs orig   # current store (nityastones.co.uk)
 *   node present/shoot.mjs new    # the demo, from web/dist-single/index.html
 *
 * The current store is fetched through curl for every request (headless
 * Chromium cannot use the sandbox proxy) and served to the page from that,
 * so the frames are real renders of the live pages.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'shots'); mkdirSync(OUT, { recursive: true })
const run = promisify(execFile)
const mode = process.argv[2] || 'orig'

const ORIG = 'https://nityastones.co.uk'
const ORIG_PAGES = [
  ['home', '/'], ['shop', '/shop/'], ['product', '/product/raj-green-mixed-patio-pack-22mm/'], ['cart', '/cart/'],
  ['blog', '/blog/'], ['wholesale', '/wholesale/'], ['contact', '/contact-us/'], ['about', '/about-us/'],
]
const NEW_PAGES = [
  ['home', ''], ['shop', 'shop'], ['product', 'product/raj-green'], ['cart', 'cart'], ['checkout', 'checkout'],
  ['blog', 'guides'], ['wholesale', 'trade'], ['contact', 'contact'], ['about', 'about'],
  ['collections', 'collections'], ['build', 'build'], ['projects', 'projects'], ['offers', 'shop?cat=offers'], ['samples', 'samples'],
]
const BLOCK = /google-analytics|googletagmanager|doubleclick|facebook\.net|connect\.facebook|hotjar|clarity\.ms|googlesyndication|stats\.wp\.com|pixel/

let n = 0
async function viaCurl(route) {
  const req = route.request(); const url = req.url()
  if (req.method() !== 'GET' || BLOCK.test(url)) return route.abort()
  const tmp = join(tmpdir(), 'shot-' + (n++) + '.bin')
  try {
    const { stdout } = await run('curl', ['-sS', '-L', '--max-time', '40', '-o', tmp, '-w', '%{http_code}\n%{content_type}', url], { maxBuffer: 1 << 20 })
    const [code, type] = stdout.split('\n')
    const body = readFileSync(tmp); unlinkSync(tmp)
    await route.fulfill({ status: parseInt(code) || 200, contentType: type || 'application/octet-stream', body })
  } catch (e) { try { unlinkSync(tmp) } catch {} await route.abort() }
}

async function settle(p, slow = false) {
  await p.evaluate(async (ms) => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, ms)) } scrollTo(0, 0) }, slow ? 400 : 120)
  await p.waitForTimeout(slow ? 2500 : 800)
}

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const [tag, vp, mob] of [['d', { width: 1440, height: 900 }, false], ['m', { width: 400, height: 840 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: mob, isMobile: mob, reducedMotion: 'reduce', ignoreHTTPSErrors: true })
  const p = await ctx.newPage()
  await p.addInitScript(() => { try { localStorage.setItem('nitya-offer', String(Date.now())) } catch { /* private mode */ } }) // the offer pop-up has its own test
  if (mode === 'orig') {
    await p.route('**/*', viaCurl)
    for (const [name, path] of ORIG_PAGES) {
      if (mob && !['home', 'shop', 'product'].includes(name)) continue
      try {
        await p.goto(ORIG + path, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(name === 'home' ? 10000 : 4000); await settle(p, true); await p.waitForTimeout(1500)
        // cookie bars and chat widgets get in the way of a fair frame
        await p.addStyleTag({ content: '#qlwapp,.qlwapp,[id*="cookie"],[class*="cookie"],#njt-wa,[class*="njt-wa"]{display:none!important}' })
        await p.screenshot({ path: join(OUT, `orig-${tag}-${name}.png`), fullPage: !mob })
        if (mob) await p.screenshot({ path: join(OUT, `orig-${tag}-${name}-full.png`), fullPage: true })
        console.log('orig', tag, name, await p.title())
      } catch (e) { console.log('orig FAIL', tag, name, e.message.slice(0, 120)) }
    }
    if (mob) { try { await p.goto(ORIG + '/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200); const btn = await p.$('.menu-toggle, .navbar-toggler, [aria-label*="menu" i], .hamburger, .mobile-menu-toggle, button[class*="menu"]'); if (btn) { await btn.click(); await p.waitForTimeout(800) } await p.screenshot({ path: join(OUT, 'orig-m-menu.png') }); console.log('orig m menu', !!btn) } catch (e) { console.log('orig FAIL menu', e.message.slice(0, 80)) } }
  } else {
    const base = 'file://' + join(HERE, '..', 'web', 'dist-single', 'index.html')
    await p.goto(base); await p.evaluate(() => { try { localStorage.setItem('nitya-theme', 'dark'); localStorage.setItem('nitya-bag', JSON.stringify([{ id: 'raj-green', qty: 2 }, { id: 'sample:bodo-white', qty: 1 }])) } catch (e) {} }); await p.reload(); await p.waitForTimeout(500)
    for (const [name, route] of NEW_PAGES) {
      if (mob && !['home', 'shop', 'product', 'build', 'cart'].includes(name)) continue
      await p.goto(base + '#/' + route); await p.waitForTimeout(1500); await settle(p)
      await p.screenshot({ path: join(OUT, `new-${tag}-${name}.png`), fullPage: !mob })
      if (mob) await p.screenshot({ path: join(OUT, `new-${tag}-${name}-full.png`), fullPage: true })
      console.log('new', tag, name)
    }
    if (mob) { await p.goto(base + '#/'); await p.waitForTimeout(800); await p.click('.menu-btn'); await p.waitForTimeout(500); await p.screenshot({ path: join(OUT, 'new-m-menu.png') }); console.log('new m menu') }
    else {
      // a light-theme frame and the product gallery open, for the "new" section
      await p.goto(base + '#/product/raj-green'); await p.waitForTimeout(800); await p.evaluate(() => document.querySelector('.theme-btn')?.click()); await p.waitForTimeout(600); await p.screenshot({ path: join(OUT, 'new-d-product-light.png') }); await p.evaluate(() => document.querySelector('.theme-btn')?.click())
      await p.goto(base + '#/product/quartz-white'); await p.waitForTimeout(800); await p.click('.gallery .main img'); await p.waitForTimeout(500); await p.screenshot({ path: join(OUT, 'new-d-lightbox.png') })
      // See it in 3D: Raj Green laid random from the pack, wet
      await p.goto(base + '#/product/raj-green'); await p.waitForTimeout(1200); await p.locator('.stone3d').scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
      await p.click('.seg-row .seg:first-child button:nth-child(2)'); await p.click('.seg-row .seg:nth-child(2) button:nth-child(2)'); await p.waitForTimeout(4000)
      await p.evaluate(() => { const el = document.querySelector('.stone3d'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 150) }); await p.waitForTimeout(600)
      await p.screenshot({ path: join(OUT, 'new-d-3d.png') })
    }
  }
  await ctx.close()
}
await b.close()
