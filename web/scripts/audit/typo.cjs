/*
 * Typography, colour and contrast audit over the single-file build.
 *   node scripts/audit/typo.cjs            (run from web/)
 * Reports: fonts that failed to load, font weights requested that no face
 * covers, text under the size floor, every distinct text colour per theme
 * with where it is used, and text/background pairs under WCAG contrast.
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const ROUTES = ['', 'shop', 'product/raj-green', 'product/calacatta-blanco', 'collections', 'build', 'guides', 'guide/laying-indian-sandstone', 'projects', 'trade', 'about', 'faq', 'contact', 'samples', 'cart', 'checkout']
const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const base = 'file://' + process.cwd() + '/dist-single/index.html'
  const findings = [], colours = {}
  for (const theme of ['dark', 'light']) for (const w of [1440, 400]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } })
    await p.goto(base); await p.evaluate(t => { try { localStorage.setItem('nitya-theme', t); localStorage.setItem('nitya-bag', JSON.stringify([{ id: 'bodo-white', qty: 2 }])) } catch (e) {} }, theme); await p.reload(); await p.waitForTimeout(400)
    for (const r of ROUTES) {
      await p.goto(base + '#/' + r); await p.waitForTimeout(500)
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(res => setTimeout(res, 40)) } scrollTo(0, 0) })
      await p.waitForTimeout(300)
      const res = await p.evaluate(async (theme) => {
        await document.fonts.ready
        const fonts = [...document.fonts].map(f => ({ family: f.family, weight: f.weight, status: f.status }))
        const parse = c => { const m = c.match(/[\d.]+/g); return m ? m.slice(0, 4).map(Number) : null }
        const bgOf = el => { let e = el; while (e && e !== document.documentElement) { const cs = getComputedStyle(e); const c = parse(cs.backgroundColor); if (cs.backgroundImage !== 'none' && !/gradient/.test(cs.backgroundImage)) return { image: true }; if (c && (c.length < 4 || c[3] > 0.9)) return { rgb: c.slice(0, 3) }; e = e.parentElement } return { rgb: parse(getComputedStyle(document.body).backgroundColor).slice(0, 3) } }
        const out = []
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        let n
        while ((n = walker.nextNode())) {
          const t = n.textContent.trim(); if (t.length < 2) continue
          const el = n.parentElement; if (!el || el.closest('script,style,[aria-hidden="true"],.slides,.marquee,canvas')) continue
          const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue
          const rect = el.getBoundingClientRect(); if (!rect.width || !rect.height) continue
          const col = parse(cs.color); if (!col || (col.length === 4 && col[3] === 0)) continue
          const bg = bgOf(el)
          const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').filter(Boolean).slice(0, 2).join('.') : '')
          out.push({ sel, text: t.slice(0, 40), color: col.slice(0, 3).join(','), size: parseFloat(cs.fontSize), weight: cs.fontWeight, family: cs.fontFamily.split(',')[0].replace(/"/g, ''), bg: bg.image ? 'image' : bg.rgb.join(','), overImage: !!(bg.image || el.closest('.hero-cine,.banner,.scene,.scene-card,.hero-in,.feature-pic,.lb-main,.wetdry')) })
        }
        return { fonts, out }
      }, theme)
      for (const f of res.fonts) if (f.status !== 'loaded') findings.push(`FONT not loaded: ${f.family} ${f.weight} (${theme} ${w} #/${r})`)
      const covers = (fam, w) => res.fonts.some(f => f.family.replace(/"/g, '') === fam && (() => { const [a, b] = f.weight.split(' ').map(Number); return b ? w >= a && w <= b : w === a })())
      for (const e of res.out) {
        const key = `${theme}|${e.color}`
        colours[key] = colours[key] || { n: 0, where: new Set() }; colours[key].n++; if (colours[key].where.size < 6) colours[key].where.add(`${e.sel}@${r}`)
        if (e.size < 12) findings.push(`SIZE ${e.size}px ${e.sel} "${e.text}" (${theme} ${w} #/${r})`)
        if (w === 400 && /^(p|li|dd|td)$/.test(e.sel.split('.')[0]) && e.size < 14 && !/note|small|meta|spec|cap|kicker/.test(e.sel)) findings.push(`BODY ${e.size}px ${e.sel} "${e.text}" (${theme} 400 #/${r})`)
        if (/Geist|Cinzel/.test(e.family) && !covers(e.family, parseInt(e.weight))) findings.push(`WEIGHT ${e.family} ${e.weight} has no face: ${e.sel} (${theme} #/${r})`)
        if (!e.overImage && e.bg !== 'image') { const c = contrast(e.color.split(',').map(Number), e.bg.split(',').map(Number)); const large = e.size >= 24 || (e.size >= 18.66 && parseInt(e.weight) >= 700); if (c < (large ? 3 : 4.5)) findings.push(`CONTRAST ${c.toFixed(2)} ${e.sel} "${e.text}" ${e.color} on ${e.bg} (${theme} ${w} #/${r})`) }
      }
    }
    await p.close()
  }
  await b.close()
  const uniq = [...new Set(findings)]
  console.log('== distinct text colours per theme')
  for (const [k, v] of Object.entries(colours).sort()) console.log(`${k}  ×${v.n}  ${[...v.where].join(' ')}`)
  console.log(`\n== findings: ${uniq.length}`); uniq.slice(0, 200).forEach(f => console.log(f))
})().catch(e => { console.error('FAIL', e.message); process.exit(1) })
