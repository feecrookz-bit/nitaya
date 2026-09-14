#!/usr/bin/env node
/*
 * Build the owner pack: present/index.html, one self-contained page.
 *   python3 present/prep.py && node present/build.mjs
 * Screenshots, fonts and the logo are inlined so the page travels as one
 * file and publishes as one artifact.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as C from './content.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const WEB = join(HERE, '..', 'web')
const b64 = (p, type) => `data:${type};base64,${readFileSync(p).toString('base64')}`
const font = (f) => b64(join(WEB, 'src', 'fonts', f), 'font/ttf')
const LOGO = b64(join(WEB, 'src', 'assets', 'logo.png'), 'image/png')
const shot = (name) => { const p = join(HERE, 'shots', 'web', name + '.jpg'); return existsSync(p) ? b64(p, 'image/jpeg') : null }
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const missing = []
const img = (name, alt, cls = '') => { const src = shot(name); if (!src) { missing.push(name); return `<div class="shot missing ${cls}">${esc(name)}</div>` } return `<div class="shot ${cls}"><img src="${src}" alt="${esc(alt)}" loading="lazy"></div>` }

const pair = (p, phone = false) => `
  <figure class="pair ${phone ? 'phone' : ''}">
    <div class="side"><span class="lbl now">Now</span>${img(p.orig, `Current site: ${p.title}`)}</div>
    <div class="side"><span class="lbl new">New</span>${img(p.neu, `New site: ${p.title}`)}</div>
  </figure>`

const html = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(C.META.title)}</title>
<style>
@font-face{font-family:Cinzel;font-weight:600;src:url(${font('Cinzel-600.ttf')}) format("truetype")}
@font-face{font-family:Geist;font-weight:400;src:url(${font('Geist-400.ttf')}) format("truetype")}
@font-face{font-family:Geist;font-weight:500;src:url(${font('Geist-500.ttf')}) format("truetype")}
@font-face{font-family:Geist;font-weight:600 700;src:url(${font('Geist-700.ttf')}) format("truetype")}
:root{--ink:#161616;--ink-2:#4a4a4a;--ink-3:#6f6f6f;--paper:#fbfaf7;--card:#fff;--hair:#e4e0d8;--gold:#8a6a1e;--gold-2:#c9a54b;--dark:#0f0f10}
:root:not([data-theme="light"]) { }
html{color-scheme:light}
body{margin:0;background:var(--paper);color:var(--ink);font-family:Geist,-apple-system,"Helvetica Neue",Arial,sans-serif;font-size:17px;line-height:1.55;padding-inline:clamp(16px,4vw,48px);padding-block:0 60px}
.wrap{max-width:1180px;margin-inline:auto}
h1,h2,h3{font-family:Cinzel,"Times New Roman",serif;font-weight:600;line-height:1.1;margin:0;letter-spacing:.01em}
h1{font-size:clamp(2.2rem,5vw,3.6rem)}
h2{font-size:clamp(1.7rem,3.4vw,2.4rem);margin-bottom:14px}
h2::after{content:"";display:block;width:44px;height:2px;background:var(--gold-2);margin-top:14px}
h3{font-size:1.15rem;font-family:Geist,sans-serif;font-weight:600;margin-bottom:8px}
p{margin:0 0 12px}
.kicker{font-size:.8rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin:0 0 12px}
section{padding-block:clamp(40px,6vw,72px);border-top:1px solid var(--hair)}
section:first-of-type{border-top:0}
.cover{background:var(--dark);color:#fff;margin-inline:calc(-1*clamp(16px,4vw,48px));padding-inline:clamp(16px,4vw,48px);padding-block:clamp(48px,8vw,96px);border:0}
.cover img.logo{height:110px;width:auto;margin-bottom:28px}
.cover h1{color:#fff;max-width:14ch}
.cover .sub{color:rgba(255,255,255,.78);max-width:60ch;font-size:1.1rem;margin-top:18px}
.cover .meta{display:flex;flex-wrap:wrap;gap:12px 32px;margin-top:32px;font-size:.95rem;color:rgba(255,255,255,.85)}
.cover .meta b{display:block;color:var(--gold-2);font-size:.8rem;letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px;font-weight:600}
.cover a{color:#fff}
.cover code{font-family:ui-monospace,Menlo,Consolas,monospace;background:rgba(255,255,255,.1);padding:3px 8px;border-radius:6px;font-size:.95rem}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.three h3{font-family:Cinzel,serif;font-size:1.05rem;letter-spacing:.04em}
.three p{color:var(--ink-2);font-size:.98rem}
.pairs{display:grid;gap:clamp(36px,5vw,64px)}
.pairhead{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:24px;align-items:start;margin-bottom:16px}
.pairhead ul{margin:0;padding-left:18px;color:var(--ink-2);font-size:.98rem}
.pairhead li{margin-bottom:6px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0}
.pair.phone{grid-template-columns:1fr 1fr;max-width:640px}
.side{position:relative}
.lbl{position:absolute;top:10px;left:10px;z-index:1;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;font-weight:600;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.92);color:var(--ink);box-shadow:0 2px 8px rgba(0,0,0,.15)}
.lbl.new{background:var(--gold-2);color:#161616}
.shot{border:1px solid var(--hair);border-radius:10px;overflow:hidden;background:var(--card);box-shadow:0 12px 32px rgba(0,0,0,.08)}
.shot img{display:block;width:100%;height:auto}
.shot.missing{padding:40px;text-align:center;color:var(--ink-3);font-size:.85rem}
.mobiles{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.mobiles h3{margin-top:12px}
.newgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:28px}
.newgrid .shot img{max-height:520px;object-fit:cover;object-position:top}
.newgrid p{color:var(--ink-2);font-size:.98rem}
.badge{display:inline-block;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;font-weight:600;padding:4px 10px;border-radius:999px;background:var(--gold-2);color:#161616;margin-bottom:10px}
ul.plain{list-style:none;padding:0;margin:0;display:grid;gap:10px}
ul.plain li{position:relative;padding-left:26px;color:var(--ink-2)}
ul.plain li::before{content:"";position:absolute;left:2px;top:.55em;width:12px;height:7px;border-left:2px solid var(--gold-2);border-bottom:2px solid var(--gold-2);transform:rotate(-45deg)}
table{width:100%;border-collapse:collapse;font-size:.98rem}
td{padding:12px 10px 12px 0;border-bottom:1px solid var(--hair);vertical-align:top;color:var(--ink-2)}
td:first-child{color:var(--ink);font-weight:600;width:34%}
.decisions{display:grid;gap:26px}
.decisions ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}
.decisions li{position:relative;padding-left:34px;color:var(--ink-2)}
.decisions li::before{content:"";position:absolute;left:0;top:.15em;width:18px;height:18px;border:1.5px solid var(--ink-3);border-radius:4px}
.steps{display:grid;gap:12px}
.step{display:grid;grid-template-columns:90px 1fr;gap:16px;align-items:start;padding:14px 0;border-bottom:1px solid var(--hair)}
.who{font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;font-weight:600;padding:5px 0;color:var(--gold)}
.note{background:var(--card);border-left:2px solid var(--gold-2);padding:14px 18px;color:var(--ink-2);font-size:.95rem;margin-top:18px}
.biz{margin-top:36px;padding-top:24px;border-top:1px solid var(--hair);display:flex;flex-wrap:wrap;gap:8px 22px;font-size:.95rem;color:var(--ink-2)}.biz b{color:var(--ink);font-family:Cinzel,serif;letter-spacing:.06em}.biz a{color:var(--ink-2)}
.foot{padding-top:32px;color:var(--ink-3);font-size:.85rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
@media (max-width:860px){.three,.mobiles,.newgrid{grid-template-columns:1fr}.pairhead{grid-template-columns:1fr}.pair{grid-template-columns:1fr}.pair.phone{grid-template-columns:1fr 1fr}.step{grid-template-columns:1fr}.who{padding:0}td:first-child{width:40%}}
@media print{body{padding:0;background:#fff;font-size:12.5pt}.shot img{max-height:190mm;object-fit:cover;object-position:top}.newgrid .shot img{max-height:110mm}.pair.phone .shot img{max-height:150mm}.mobiles{grid-template-columns:repeat(3,1fr)}.pair{break-inside:avoid;grid-template-columns:1fr 1fr!important;gap:8mm}.pair.phone{max-width:none}.pairhead{grid-template-columns:1fr 1.4fr!important;break-after:avoid;break-inside:avoid}.three{grid-template-columns:repeat(3,1fr)!important}.newgrid{grid-template-columns:repeat(2,1fr)!important}.newgrid>div{break-inside:avoid}.step{grid-template-columns:90px 1fr!important}.shot img{max-height:150mm}section{padding-block:8mm}.cover{padding-block:14mm}.cover img.logo{height:80px}h2{font-size:22pt}.cover{background:#fff;color:#111}.cover h1,.cover a{color:#111}.cover .sub,.cover .meta{color:#333}.shot{box-shadow:none;break-inside:avoid}section{break-inside:auto}h2,h3{break-after:avoid}.pair,.decisions>div,.step{break-inside:avoid}}
</style>

<section class="cover"><div class="wrap">
  <img class="logo" src="${LOGO}" alt="Nitya Stones">
  <p class="kicker">Nitya Stones · ${esc(C.META.date)}</p>
  <h1>${esc(C.META.heading)}</h1>
  <p class="sub">${esc(C.META.sub)}</p>
  <div class="meta">
    <div><b>Private preview</b><a href="${C.META.link}">${esc(C.META.link)}</a></div>
    <div><b>Password</b><code>${esc(C.META.password)}</code></div>
    <div><b>Opens on</b>Any phone or computer</div>
  </div>
</div></section>

<section><div class="wrap">
  <p class="kicker">In one minute</p>
  <div class="three">${C.ONE_MINUTE.map(([h, t]) => `<div><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join('')}</div>
</div></section>

<section><div class="wrap">
  <p class="kicker">Screen by screen</p>
  <h2>The current site beside the new one.</h2>
  <p style="color:var(--ink-2);max-width:70ch">Left is nityastones.co.uk as it is today; right is the demo. Both captured on the same day at the same screen size.</p>
  <div class="pairs" style="margin-top:32px">
  ${C.PAIRS.map(p => `<div><div class="pairhead"><h3 style="font-family:Cinzel,serif;font-size:1.4rem">${esc(p.title)}</h3><ul>${p.points.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>${pair(p)}${p.note ? `<p style="color:var(--ink-3);font-size:.88rem;margin-top:10px">${esc(p.note)}</p>` : ''}</div>`).join('')}
  </div>
</div></section>

<section><div class="wrap">
  <p class="kicker">On a phone</p>
  <h2>Where most customers will see it.</h2>
  <p style="color:var(--ink-2);max-width:70ch">${esc(C.MOBILE_NOTE)}</p>
  <div class="mobiles" style="margin-top:28px">${C.MOBILE.map(m => `<div>${pair(m, true)}<h3>${esc(m.title)}</h3></div>`).join('')}</div>
</div></section>

<section><div class="wrap">
  <p class="kicker">Not on the current site</p>
  <h2>What is new.</h2>
  <div class="newgrid" style="margin-top:28px">${C.NEW_ONLY.map(n => `<div><span class="badge">New</span>${img(n.shot, n.title)}<h3 style="margin-top:14px">${esc(n.title)}</h3><p>${esc(n.text)}</p></div>`).join('')}</div>
</div></section>

<section><div class="wrap">
  <p class="kicker">Unchanged</p>
  <h2>Kept exactly as it is.</h2>
  <ul class="plain" style="margin-top:20px">${C.KEPT.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
</div></section>

<section><div class="wrap">
  <p class="kicker">Honest gaps</p>
  <h2>On the current site, not in the demo yet.</h2>
  <table style="margin-top:20px"><tbody>${C.NOT_YET.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
</div></section>

<section><div class="wrap">
  <p class="kicker">Decisions</p>
  <h2>What we need from you.</h2>
  <p style="color:var(--ink-2);max-width:70ch">Tick, cross out or write on it. Most are yes or no.</p>
  <div class="decisions" style="margin-top:24px">${C.DECISIONS.map(d => `<div><h3>${esc(d.h)}</h3><ul>${d.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join('')}</div>
</div></section>

<section><div class="wrap">
  <p class="kicker">From the yard</p>
  <h2>Files and facts, nothing technical.</h2>
  <table style="margin-top:20px"><tbody>${C.YARD.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
</div></section>

<section><div class="wrap">
  <p class="kicker">Going live</p>
  <h2>In order.</h2>
  <div class="steps" style="margin-top:20px">${C.GO_LIVE.map(([who, t], i) => `<div class="step"><span class="who">${i + 1} · ${esc(who)}</span><span>${esc(t)}</span></div>`).join('')}</div>
</div></section>

<section><div class="wrap">
  <p class="kicker">Option on the table</p>
  <h2>See it laid.</h2>
  <p style="color:var(--ink-2);max-width:70ch">A customer sees the stone laid in their own garden before they order. Three ways to do it; none needed for go-live.</p>
  <table style="margin-top:20px"><tbody>${C.OPTIONS.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
  <p class="note">${esc(C.OPTIONS_NOTE)}</p>
</div></section>

<section><div class="wrap">
  <p class="kicker">How to view it</p>
  <h2>The preview.</h2>
  <ul class="plain" style="margin-top:20px">${C.HOW_TO_VIEW.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
  <p style="margin-top:24px"><a href="${C.META.link}" style="color:var(--gold);font-weight:600">${esc(C.META.link)}</a> · password <code style="font-family:ui-monospace,Menlo,Consolas,monospace">${esc(C.META.password)}</code></p>
  <div class="biz"><b>Nitya Stones</b><span>34 Mark Road, Hemel Hempstead HP2 7BW</span><span><a href="tel:03302369227">0330 236 9227</a> · <a href="tel:07932009870">07932 009870</a></span><span><a href="mailto:info@nityastones.co.uk">info@nityastones.co.uk</a></span><span>Mon–Fri 08:00–18:00 · Sat 08:00–13:00</span></div>
  <div class="foot"><span>Prepared for the owner of Nitya Stones · ${esc(C.META.date)}</span><span>Private. Please don’t forward the password.</span></div>
</div></section>
`
// Every non-ASCII character becomes a numeric entity, so the page reads
// correctly however the host declares (or fails to declare) its charset.
const safe = html.replace(/[^\x00-\x7f]/g, (c) => `&#${c.codePointAt(0)};`)
writeFileSync(join(HERE, 'index.html'), safe)
console.log(`present/index.html ${(html.length / 1024 / 1024).toFixed(1)} MB${missing.length ? ' · missing shots: ' + missing.join(', ') : ''}`)
