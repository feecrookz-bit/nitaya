import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
const StoneScene = lazy(() => import('./StoneScene.jsx'))
import WetDry from './WetDry.jsx'
import { GUIDE_DIAGRAM } from './Diagrams.jsx'
import Logo from './Logo.jsx'
import logoPng from './assets/logo.png'
import { HeroSlides, Marquee, CountUp, useReveal, Parallax } from './Motion.jsx'
import { BUSINESS, IMG, CATS, CAT_LABEL, PRODUCTS, byId, SAMPLE, SCENES, MIXED, PATTERNS, FAQ, REVIEWS, EDITIONS, SEASON, FAMILIES, FAMILY_COLOUR, DELIVERY, deliveryFor, SEARCH_TAGS, COLOUR_TAGS, PAIRS, money, quantify, exVat, slabPrice, m2Price, workingDaysFrom, fmtDay } from './data.js'
import { GUIDES, guideBySlug } from './guides.js'

const PHONE = BUSINESS.phone
const PHONE_HREF = BUSINESS.phoneHref
const VAT = 0.2

/* ---------------- tiny hash router ---------------- */
function useStructuredData() {
  useEffect(() => {
    const el = document.createElement('script'); el.type = 'application/ld+json'
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', name: BUSINESS.name, url: BUSINESS.site,
      telephone: '+44 ' + BUSINESS.phone.slice(1), email: BUSINESS.email, foundingDate: String(BUSINESS.since),
      address: { '@type': 'PostalAddress', streetAddress: BUSINESS.address[0], addressLocality: BUSINESS.address[1], postalCode: BUSINESS.postcode, addressCountry: 'GB' },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '13:00' },
      ],
      sameAs: BUSINESS.socials.filter(([n]) => n !== 'WhatsApp').map(([, u]) => u),
    })
    document.head.appendChild(el)
    return () => el.remove()
  }, [])
}

function useRoute() {
  const parse = () => {
    const raw = window.location.hash.replace(/^#\/?/, '')
    const [h, anchor] = raw.split('#')
    const [path, qs] = h.split('?')
    const parts = path.split('/').filter(Boolean)
    return { page: parts[0] || 'home', id: parts[1] || null, q: new URLSearchParams(qs || ''), anchor: anchor || null }
  }
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    if (!route.anchor) return
    const t = setTimeout(() => { const el = document.getElementById(route.anchor); if (el) el.scrollIntoView({ block: 'start' }) }, 60)
    return () => clearTimeout(t)
  }, [route])
  return route
}
const go = (to) => { window.location.hash = to }
const href = (to) => '#/' + to

/* ---------------- bag ---------------- */
function useBag() {
  const [lines, setLines] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nitya-bag') || '[]') } catch { return [] }
  })
  useEffect(() => { try { localStorage.setItem('nitya-bag', JSON.stringify(lines)) } catch { /* private mode */ } }, [lines])
  const add = (id, qty = 1) => setLines(ls => {
    const i = ls.findIndex(l => l.id === id)
    if (i < 0) return [...ls, { id, qty }]
    const copy = ls.slice(); copy[i] = { ...copy[i], qty: copy[i].qty + qty }; return copy
  })
  const set = (id, qty) => setLines(ls => qty <= 0 ? ls.filter(l => l.id !== id) : ls.map(l => l.id === id ? { ...l, qty } : l))
  const clear = () => setLines([])
  const count = lines.length
  return { lines, add, set, clear, count }
}
const lineProduct = (id) => id.startsWith('sample:') ? { ...SAMPLE, id, name: `Sample — ${byId(id.slice(7))?.name || ''}`, img: byId(id.slice(7))?.img }
  : id.startsWith('slabs:') ? (() => { const b = byId(id.slice(6)); return b && { ...b, id, base: b, name: `${b.name} · loose slabs`, unit: 'per slab', cover: null, price: slabPrice(b), packing: null, split: false, slabM2: b.packing?.slabM2 } })()
  : byId(id)
const lineUnitPrice = (p) => p.unit === 'per m²' && p.cover ? p.price * p.cover : p.price
const packWord = (p) => p.packing?.unit === 'box' && p.cat !== 'outdoor' ? 'box' : (p.cat === 'outdoor' || p.unit === 'per pallet') ? 'pallet' : 'pack'
const plural = (w, n) => n === 1 ? w : w === 'box' ? 'boxes' : w + 's'
const lineUnitLabel = (p) => p.unit === 'per m²' ? (p.cover ? `${packWord(p)} of ${p.cover.toFixed(2)} m²` : 'per m²') : p.unit === 'per pallet' ? 'pallet' : p.unit === 'per kit' ? 'kit' : p.unit === 'per slab' ? `slab of ${p.slabM2} m²` : 'each'
const num = (v, d = 0) => { const n = parseFloat(v); return isFinite(n) && n >= 0 ? n : d }
const round2 = (n) => Math.round(n * 100) / 100
/* A quantity is packs plus, for ranges that split, loose slabs. */
const qtyLine = (p, q) => {
  if (!p.cover) return `${q.m2.toFixed(2)} m², by the m²`
  const parts = []
  if (q.packs) parts.push(`${q.packs} × ${p.cover.toFixed(2)} m²`)
  if (q.slabs) parts.push(`${q.slabs} × ${p.packing.slabM2} m²`)
  return `${parts.join(' + ')} = ${q.m2.toFixed(2)} m²`
}
const qtyWords = (p, q) => {
  if (!p.cover) return `${q.m2.toFixed(2)} m²`
  const a = []
  if (q.packs) a.push(`${q.packs} ${plural(packWord(p), q.packs)}`)
  if (q.slabs) a.push(`${q.slabs} loose ${plural('slab', q.slabs)}`)
  return a.join(' + ')
}
const addQuantity = (bag, p, q) => { if (q.packs) bag.add(p.id, q.packs); if (q.slabs) bag.add('slabs:' + p.id, q.slabs) }
/* Pallets for the delivery estimate: boxes and loose slabs share a pallet. */
const palletsOf = (items) => Math.max(1, Math.ceil(items.reduce((n, l) => {
  const p = l.p; if (!p || p.unit === 'each') return n
  if (p.unit === 'per slab') return n + l.qty / (p.base?.packing?.perPack || 40)
  if (p.packing?.unit === 'box' && p.cat !== 'outdoor') return n + l.qty * p.packing.perBox / p.packing.perPack
  return n + (p.cover || p.unit === 'per kit' ? l.qty : 0)
}, 0) - 1e-9))
function Qty({ value, set, min = 1, max = 999, label }) {
  return <div className="qty" role="group" aria-label={label}><button type="button" onClick={() => set(Math.max(min, value - 1))} aria-label="Fewer">−</button><output aria-live="polite">{value}</output><button type="button" onClick={() => set(Math.min(max, value + 1))} aria-label="More">+</button></div>
}

/* ---------------- shared bits ---------------- */
function Price({ p, big }) {
  return (
    <div className="price">
      <b style={big ? { fontSize: '2rem' } : undefined}>{money(p.price)}</b>
      {p.was && <s>{money(p.was)}</s>}
      <small>{p.unit} + VAT</small>
    </div>
  )
}
const saving = (p) => p.was ? Math.round((1 - p.price / p.was) * 100) : 0

function ProductCard({ p, featured = false }) {
  const pct = saving(p)
  const feature = featured && p.feature && p.gallery[0]
  return (
    <a className={feature ? 'product feature' : 'product'} href={href('product/' + p.id)} style={{ '--fc': FAMILY_COLOUR[p.cat].c, '--tc': p.tag === 'Splits' ? 'var(--green)' : p.tag === 'Pallet deal' ? 'var(--rust)' : 'var(--gold-2)' }}>
      {feature ? <div className="feature-pic"><img src={p.gallery[0]} alt={`${p.name} laid in a customer's garden`} loading="lazy" /><img className="inset" src={p.img} alt="" loading="lazy" /></div>
        : <img src={p.img} alt={p.name} loading="lazy" />}
      {pct >= 10 && <span className="save">Save {pct}%</span>}
      <div className="product-body">
        {feature && <span className="kicker">Editor’s pick</span>}
        {p.tag && <span className="tag">{p.tag}</span>}
        <span className="fam">{CAT_LABEL[p.cat]}</span>
        <h3>{p.name}</h3>
        {feature && <p className="why">{p.feature}</p>}
        <span className="spec">{p.size} · {p.thick}</span>
        <Price p={p} />
      </div>
    </a>
  )
}

function rng(seed) { let s = seed >>> 0; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 } }
function shade(hex, t) { const n = parseInt(hex.slice(1), 16); const f = 1 - t; return `rgb(${Math.round(((n >> 16) & 255) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})` }
function Pattern({ p }) {
  const rects = useMemo(() => {
    const W = 300, H = 210, mm = 6.2, joint = 10 / mm, out = [], r = rng(19); let n = 0
    if (p.kind === 'mixed') {
      for (let y = 0; y < H;) { const rowH = (r() > 0.55 ? 600 : 295) / mm
        for (let x = -6; x < W;) { let opts = MIXED.filter(s => Math.abs(s[1] / mm - rowH) < 1); if (!opts.length) opts = [[600, rowH * mm]]
          const w = opts[Math.floor(r() * opts.length)][0] / mm; out.push({ x, y, w, h: rowH, i: n++ }); x += w + joint }
        y += rowH + joint }
    } else {
      const sw = p.w / mm, sh = p.h / mm, off = p.kind === 'stack' ? 0 : p.kind === 'third' ? sw / 3 : sw / 2; let row = 0
      for (let y = -sh * 0.3; y < H; y += sh + joint) { const shift = p.kind === 'third' ? (row % 3) * off : (row % 2) * off
        for (let x = -shift - sw * 0.3; x < W; x += sw + joint) out.push({ x, y, w: sw, h: sh, i: n++ }); row++ }
    }
    return out
  }, [p])
  const dark = shade(p.tint, 0.6)
  return (
    <figure className="pattern">
      <svg viewBox="0 0 300 210" role="img" aria-label={`${p.title} laying pattern, drawn to scale`}>
        <rect width="300" height="210" fill={dark} />
        {rects.map(q => <rect key={q.i} x={q.x.toFixed(1)} y={q.y.toFixed(1)} width={q.w.toFixed(1)} height={q.h.toFixed(1)} fill={shade(p.tint, (q.i % 5) * 0.05)} stroke={dark} strokeWidth="0.6" />)}
      </svg>
      <b>{p.title}</b><span>{p.sub}</span>
    </figure>
  )
}

/* ---------------- calculator (shared by Home and product pages) ---------------- */
function AreaRows({ areas, setAreas, idp }) {
  const upd = (i, k, v) => setAreas(a => a.map((r, j) => j === i ? { ...r, [k]: v } : r))
  return (
    <div className="areas">
      {areas.map((r, i) => <div key={i} className="area-row">
        <div className="field"><label htmlFor={`${idp}L${i}`}>Length (m)</label><input id={`${idp}L${i}`} type="number" min="0" step="0.1" value={r.len} onChange={e => upd(i, 'len', e.target.value)} /></div>
        <div className="field"><label htmlFor={`${idp}W${i}`}>Width (m)</label><input id={`${idp}W${i}`} type="number" min="0" step="0.1" value={r.wid} onChange={e => upd(i, 'wid', e.target.value)} /></div>
        <output className="area-m2" aria-label={`Area ${i + 1}`}>{(num(r.len) * num(r.wid)).toFixed(2)} m²</output>
        {areas.length > 1 && <button type="button" className="remove" onClick={() => setAreas(a => a.filter((_, j) => j !== i))} aria-label={`Remove area ${i + 1}`}>Remove</button>}
      </div>)}
      <button type="button" className="more" onClick={() => setAreas(a => [...a, { len: '', wid: '' }])}>+ Add another area</button>
    </div>
  )
}
function CutAllowance({ on, setOn, pct, setPct, id }) {
  return (
    <div className="allow">
      <label className="check" htmlFor={id}><input id={id} type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} /> Add an allowance for cuts</label>
      {on && <div className="seg" role="group" aria-label="Allowance for cuts">{[5, 10, 15, 20].map(v => <button key={v} type="button" aria-pressed={pct === v} onClick={() => setPct(v)}>{v}%</button>)}</div>}
    </div>
  )
}

function Calculator({ initial = 'autumn-brown', bag, compact = false }) {
  const [pid, setPid] = useState(initial)
  const [areas, setAreas] = useState([{ len: '6', wid: '4' }])
  const [allow, setAllow] = useState(true), [pct, setPct] = useState(10)
  const p = byId(pid)
  const net = areas.reduce((t, r) => t + num(r.len) * num(r.wid), 0), gross = net * (1 + (allow ? pct : 0) / 100)
  const q = quantify(p, gross), ex = exVat(p, q)
  const idp = compact ? 'c2' : 'c1'
  return (
    <div className="calc"><div className="calc-grid">
      <div className="calc-in">
        {!compact && <div className="field"><label htmlFor="calcRange">Range</label>
          <select id="calcRange" value={pid} onChange={e => setPid(e.target.value)}>
            {PRODUCTS.filter(x => x.unit !== 'per kit').map(x => <option key={x.id} value={x.id}>{x.name} — {CAT_LABEL[x.cat]}</option>)}
          </select></div>}
        <AreaRows areas={areas} setAreas={setAreas} idp={idp} />
        <CutAllowance on={allow} setOn={setAllow} pct={pct} setPct={setPct} id={idp + 'Allow'} />
        <p className="note">10% covers a straight patio; circles, diagonals and lots of edges want 15–20%. {p.split ? 'This range splits: whole packs plus the loose slabs you need.' : p.cover ? `Sold in whole ${plural(packWord(p), 2)} of ${p.cover.toFixed(2)} m².` : 'Sold by the m².'}</p>
      </div>
      <div className="calc-out">
        <div className="row"><span className="k">Area{areas.length > 1 ? ` · ${areas.length} areas` : ''}</span><span className="v">{net.toFixed(2)} m²</span></div>
        <div className="row"><span className="k">{allow ? `With ${pct}% for cuts` : 'No allowance for cuts'}</span><span className="v">{gross.toFixed(2)} m²</span></div>
        <div className="row"><span className="k">{p.cover ? (p.split && q.slabs ? 'Packs + slabs' : plural(packWord(p), 2).replace(/^./, c => c.toUpperCase())) : 'Supplied'}</span><span className="v">{qtyLine(p, q)}</span></div>
        <div className="row"><span className="k">{p.name}, ex VAT</span><span className="v">{money(ex)}</span></div>
        <div className="row"><span className="k">VAT at 20%</span><span className="v">{money(ex * VAT)}</span></div>
        <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * (1 + VAT))}</span></div>
        {bag && <div className="buy-actions" style={{ marginTop: 8 }}>
          <button className="pill" type="button" onClick={() => { addQuantity(bag, p, q); go('cart') }}>Add {qtyWords(p, q)} to bag</button>
          {!compact && <a className="more" href={href('product/' + p.id)}>View {p.name}</a>}
        </div>}
      </div>
    </div></div>
  )
}

function DeliveryEstimate({ pallets = 1, compact = false }) {
  const [pc, setPc] = useState(() => { try { return localStorage.getItem('nitya-pc') || '' } catch { return '' } })
  const r = deliveryFor(pc)
  useEffect(() => { try { localStorage.setItem('nitya-pc', pc) } catch { /* private mode */ } }, [pc])
  return (
    <div className="deliv">
      <div className="deliv-row">
        <div className="field"><label htmlFor={compact ? 'dpc2' : 'dpc'}>Delivery postcode</label><input id={compact ? 'dpc2' : 'dpc'} type="text" autoComplete="postal-code" placeholder="e.g. HP2 7BW" value={pc} onChange={e => setPc(e.target.value)} /></div>
      </div>
      <p className="deliv-out">
        {!pc ? <>Enter a postcode for an indicative delivery cost, or <b>collect free from Mark Road</b>.</>
          : !r ? <>That doesn’t look like a UK postcode yet.</>
          : r.ask ? <>We deliver there but price it by the job — <b>ring {PHONE}</b> for a quote, or collect free.</>
          : <>Indicative delivery to <b>{pc.toUpperCase()}</b> ({r.band.name}): <b>{money(r.band.perPallet)} per pallet</b>{pallets > 1 ? <> · {pallets} pallets ≈ <b>{money(r.band.perPallet * pallets)}</b></> : null}.{r.band.key === 'london' ? <> Orders over £500 inside the M25 travel free.</> : null} Confirmed by phone before you pay. Collection from HP2 7BW is free.</>}
      </p>
    </div>
  )
}

/* ---------------- pages ---------------- */
function Newsletter() {
  const [email, setEmail] = useState(''); const [ok, setOk] = useState('')
  return (
    <div className="newsletter">
      <div><p className="kicker" style={{ color: 'var(--gold)' }}>Early access</p><h2>New pallets, first.</h2><p>When a range lands, a finish changes or a pallet deal opens up, you hear before it goes on the site. One email a month, from the yard.</p></div>
      <form onSubmit={e => { e.preventDefault(); if (email.includes('@')) { setOk('You’re on the list. First email when the next pallets land.'); setEmail('') } }}>
        <input id="nlEmail" type="email" placeholder="you@example.co.uk" value={email} onChange={e => setEmail(e.target.value)} aria-label="Email address" />
        <button className="pill" type="submit">Join</button>
        {ok && <span className="ok" role="status">{ok}</span>}
      </form>
    </div>
  )
}

function Editions() {
  return (
    <div className="editions">
      {EDITIONS.map(ed => {
        const items = ed.ids.map(byId)
        return (
          <div key={ed.num} className={`edition ${ed.featured ? 'featured' : ''}`}>
            {ed.featured && <span className="badge">Most laid</span>}
            <span className="num">{ed.num}</span>
            <h3>{ed.name}</h3>
            <p className="why">{ed.why}</p>
            <div className="edition-pics">{items.slice(0, 3).map(p => <img key={p.id} src={p.img} alt={p.name} loading="lazy" />)}</div>
            <ul>{items.map(p => <li key={p.id}><a href={href('product/' + p.id)} style={{ textDecoration: 'none' }}>{p.name}</a><span>{money(p.price)} {p.unit === 'per m²' ? '/m²' : p.unit.replace('per ', '/')}</span></li>)}</ul>
            <p className="from"><b>{money(ed.from)}</b> per m² + VAT, from</p>
            <a className={`pill ${ed.featured ? 'accent' : 'ghost'}`} href={href('collections#' + ed.num.split(' ')[1])}>Explore {ed.name}</a>
          </div>
        )
      })}
    </div>
  )
}

function Atlas() {
  const pic = { sandstone: byId('raj-green').gallery[0] || byId('raj-green').img, limestone: byId('black-limestone').img, outdoor: byId('bodo-white').gallery[0] || byId('bodo-white').img, cladding: byId('cladding-kandla-grey').img }
  return (
    <div className="atlas">
      {FAMILIES.map(f => (
        <a key={f.key} className="family" href={href('shop?cat=' + f.cat)} style={{ '--fc': FAMILY_COLOUR[f.cat].c }}>
          <img src={pic[f.key]} alt="" loading="lazy" />
          <div><span className="lat">{f.lat}</span><h3>{f.name}</h3><p>{f.text}</p><small>{f.note}</small></div>
        </a>
      ))}
    </div>
  )
}

function Home({ bag }) {
  const season = SEASON.ids.map(byId)
  useReveal('home')
  return (
    <>
      <section className="hero-cine">
        <HeroSlides slides={[
          { src: SCENES[1].img, caption: 'Bodo White · Hemel Hempstead' },
          { src: SCENES[0].img, caption: 'Autumn Brown · laid random' },
          { src: SCENES[5].img, caption: 'Quartz White · poolside' },
          { src: SCENES[3].img, caption: 'Raj Green · after rain' },
          { src: IMG.hero, caption: 'Kandla Grey porcelain · from above' },
        ]} interval={7500} />
        <div className="wrap"><div className="hero-in">
          <img className="hero-mark" src={logoPng} alt="" aria-hidden="true" />
          <div className="trust"><span><b>Since 2016</b> · Mark Road, Hemel Hempstead</span><span className="dot">·</span><span><b>36 stones</b> on the ground</span><span className="dot">·</span><span><b>3–5 working days</b> to your drive</span></div>
          <h1>Natural stone, sourced direct.<span>Hand-picked from the quarries we buy from, held at our own yard, priced straight. Every garden in these pictures left Mark Road on a pallet.</span></h1>
          <div className="actions">
            <a className="pill" href={href('shop')}>Shop this season’s palette</a>
            <a className="pill ghost" href={href('build')}>Build your patio</a>
          </div>
        </div></div>
        <div className="scroll-cue" aria-hidden="true" />
      </section>
      <div className="hero-strip">
        <div><b><CountUp to={2016} plain /></b>Trading from the same Hemel Hempstead yard.</div>
        <div><b><CountUp to={36} /></b>Ranges in stock — sandstone, limestone, porcelain, cladding.</div>
        <div><b>3–5 days</b>Working days from cleared payment. We call on the day.</div>
        <div><b>Trade</b>Accounts, pallet pricing and site delivery for landscapers and builders. <a className="more" href={href('trade')} style={{ fontSize: '.84rem' }}>Open an account</a></div>
      </div>

      <section className="slab-moment" data-reveal>
        <div className="wrap narrow"><p className="kicker">Turn it over</p><h2>Split, not sawn.</h2><p className="intro">Drag it. Raj Green from the yard, cleft along its bedding the way the stone wants to break, so no two faces match and the surface still grips when it’s wet. Calibrated to 22 mm underneath.</p></div>
        <div className="wrap"><Suspense fallback={<div className="hero-3d" aria-hidden="true" />}><StoneScene texture={IMG.slabTexture} /></Suspense><div className="hero-static"><img src={byId('raj-green').img} alt="Raj Green riven sandstone slab" /></div><p className="slab-hint">Drag to rotate</p></div>
      </section>

      <section className="chapter" style={{ paddingBottom: 0 }} data-reveal><div className="wrap">
        <div className="head-row"><div><p className="kicker">On the ground now</p><h2>Thirty-six stones, passing by.</h2></div><a className="more" href={href('shop')}>Shop all</a></div>
      </div>
        <Marquee items={PRODUCTS.slice(0, 18).map(p => ({ img: p.img, name: p.name, href: href('product/' + p.id) }))} speed={70} />
        <Marquee items={PRODUCTS.slice(18).map(p => ({ img: p.img, name: p.name, href: href('product/' + p.id) }))} speed={80} reverse />
      </section>

      <section className="chapter dark-collections" data-reveal><div className="wrap">
        <div className="narrow"><p className="kicker">The collections</p><h2>Three editions. One yard.</h2><p className="intro">Every stone we hold, arranged by what it’s for rather than what it’s called. Same shop prices — the editions are the curation.</p></div>
        <div className="media"><Editions /></div>
      </div></section>

      <section className="chapter sand" data-reveal><div className="wrap">
        <div className="head-row"><div><p className="kicker">This season</p><h2>{SEASON.title}.</h2><p className="intro">Four stones that suit the light this time of year: the warm sandstones that come up richer wet, and the dark ones that hide leaf litter.</p></div><a className="more" href={href('shop')}>All 36 stones</a></div>
        <div className="grid">{season.map(p => <ProductCard key={p.id} p={p} />)}</div>
      </div></section>

      <section className="chapter" data-reveal><div className="wrap">
        <div className="head-row"><div><p className="kicker">Offers</p><h2>Below list this month.</h2><p className="intro">The shop’s current was/now prices, in one place. Same pallets, same yard.</p></div><a className="more" href={href('shop?cat=offers')}>All offers</a></div>
        <div className="grid">{PRODUCTS.filter(p => saving(p) >= 15).slice(0, 4).map(p => <ProductCard key={p.id} p={p} />)}</div>
      </div></section>

      <section className="chapter" data-reveal><div className="wrap builder-teaser">
        <div className="narrow"><p className="kicker">Build your patio</p><h2>Pick the stone. Draw the area. Get the packs.</h2><p className="intro">Choose from the 36 stones on the ground, put in your dimensions, pick a laying pattern, and it works out the whole packs, the price and a saved design you can come back to or reorder from.</p>
          <div className="actions"><a className="pill accent" href={href('build')}>Start building</a><a className="more" href={href('samples')}>Or order £5 samples first</a></div></div>
      </div></section>

      <section className="chapter sage" data-reveal><div className="wrap">
        <div className="narrow"><p className="kicker">Stone families</p><h2>Know what you’re laying.</h2><p className="intro">Four materials, four geologies, four ways of behaving in a Hertfordshire winter.</p></div>
        <div className="media"><Atlas /></div>
      </div></section>

      <section className="chapter" data-reveal><div className="wrap">
        <div className="narrow"><p className="kicker">Customers’ gardens</p><h2>Laid, not stacked.</h2><p className="intro">Every one of these left Mark Road on a pallet. Tap a garden to shop the stone in it.</p></div>
        <div className="media scenes">
          {SCENES.slice(0, 7).map(s => <a key={s.title} className="scene" href={href(s.product ? 'product/' + s.product : 'shop?cat=' + s.cat)}><img src={s.img} alt={s.title} loading="lazy" /><figcaption><b>{s.title}</b><span>{s.sub}</span></figcaption></a>)}
        </div>
      </div></section>

      <section className="chapter manifesto" data-reveal><div className="wrap">
        <p className="kicker">Sourcing</p>
        <h2 className="manifesto-h">From the quarry<br />to Mark Road.</h2>
        <div className="creed">
          <div><b>Bought direct.</b><p>Sandstone hand-split in the quarry districts of Rajasthan. Limestone sawn and honed from Sinai. Porcelain pressed in Spain and Gujarat. No middlemen, so the price on the slab is the price of the slab.</p></div>
          <div><b>Held on our ground.</b><p>Every range is on pallets at Mark Road, not in a catalogue. Come and stand on it, hose it, take a piece home. What you see in the yard is what arrives.</p></div>
          <div><b>Looked at before it leaves.</b><p>Each pallet is checked in and checked out by the same people who opened the yard in 2016. If it isn’t right, it doesn’t leave.</p></div>
        </div>
        <Parallax amount={0.06}><div className="yard-pics wide"><img src={IMG.yard} alt="The Nitya Stones showroom on Mark Road" loading="lazy" /><img src={IMG.pallets} alt="Pallets of paving in the Nitya Stones yard" loading="lazy" /></div></Parallax>
        <div className="stats"><div className="stat"><b><CountUp to={2016} plain /></b><span>Same yard, same people</span></div><div className="stat"><b><CountUp to={36} /></b><span>Stones in stock today</span></div><div className="stat"><b><CountUp to={120} suffix=" m²" /></b><span>Custom finishes from</span></div></div>
        <div className="actions" style={{ justifyContent: 'flex-start' }}><a className="more" href={href('about')}>About the yard</a></div>
      </div></section>

      <section className="chapter" id="calculator" data-reveal><div className="wrap">
        <div className="head-row"><div><p className="kicker">Quick price</p><h2>Measure once. Order once.</h2></div><a className="more" href={href('build')}>Or build the full design</a></div>
        <Calculator bag={bag} />
      </div></section>

      <section className="chapter grey" data-reveal><div className="wrap">
        <div className="head-row"><div><p className="kicker">From customers</p><h2>Said about the yard.</h2></div><a className="more" href="https://nityastones.co.uk" target="_blank" rel="noreferrer">More reviews</a></div>
        <div className="quotes">
          {REVIEWS.map(r => <blockquote key={r.who} className="quote"><p>“{r.quote}”</p><cite><b>{r.who}</b><span>{r.what}</span></cite></blockquote>)}
          <div className="quote quote-since"><b>Since 2016</b><span>Ten seasons supplying landscapers, builders and homeowners from Mark Road.</span></div>
        </div>
      </div></section>

      <section className="chapter slate" data-reveal><div className="wrap">
        <div className="head-row"><div><p className="kicker">Guides</p><h2>Know before you lay.</h2><p className="intro">Laying, choosing, sealing, cleaning — written by the yard, not a content agency.</p></div><a className="more" href={href('guides')}>All guides</a></div>
        <div className="guides">{GUIDES.slice(0, 3).map(g => <GuideCard key={g.slug} g={g} />)}</div>
      </div></section>

      <section className="chapter" data-reveal><div className="wrap"><Newsletter /></div></section>
    </>
  )
}

function GuideCard({ g }) {
  return (
    <a className="guide" href={href('guide/' + g.slug)} style={{ '--fc': FAMILY_COLOUR[g.family].c }}>
      <span className="meta">{CAT_LABEL[g.family]}</span>
      <h3>{g.title}</h3>
      <p>{g.standfirst}</p>
      <span className="read">{g.minutes} min read</span>
    </a>
  )
}

function Guides() {
  return (
    <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap">
      <div className="narrow"><p className="kicker">Guides</p><h1 className="pg">Know before you lay.</h1><p className="intro">What we tell customers across the counter, written down. Choosing, laying, sealing, cleaning and what happens on delivery day.</p></div>
      <h2 className="sr-only">All guides</h2><div className="media guides">{GUIDES.map(g => <GuideCard key={g.slug} g={g} />)}</div>
    </div></section>
  )
}

function Guide({ route }) {
  const g = guideBySlug(route.id)
  if (!g) return <div className="wrap empty"><h2>Not found</h2><p style={{ marginTop: 12 }}><a className="more" href={href('guides')}>All guides</a></p></div>
  const others = GUIDES.filter(x => x.slug !== g.slug).slice(0, 3)
  return (
    <div className="wrap">
      <article className="article" style={{ '--fc': FAMILY_COLOUR[g.family].c }}>
        <nav className="crumbs" aria-label="Breadcrumb"><a href={href('guides')}>Guides</a><span>/</span><span>{CAT_LABEL[g.family]}</span></nav>
        <span className="meta">{CAT_LABEL[g.family]} · {g.minutes} min read</span>
        <h1>{g.title}</h1>
        <p className="stand">{g.standfirst}</p>
        {GUIDE_DIAGRAM[g.slug] && (() => { const D = GUIDE_DIAGRAM[g.slug]; return <D /> })()}
        {g.sections.map(sec => <section key={sec.h}><h2>{sec.h}</h2>{sec.p.map((t, i) => <p key={i}>{t}</p>)}</section>)}
        <div className="related">
          <p className="kicker">Shop the stone</p>
          <div className="grid">{g.related.map(byId).filter(Boolean).map(p => <ProductCard key={p.id} p={p} />)}</div>
        </div>
        <div className="related">
          <p className="kicker">More guides</p>
          <h2 className="sr-only">All guides</h2><div className="guides">{others.map(x => <GuideCard key={x.slug} g={x} />)}</div>
        </div>
      </article>
    </div>
  )
}

function Projects() {
  return (
    <>
      <section className="banner"><img src={SCENES[1].img} alt="" /><div className="wrap"><p className="kicker">Projects</p><h1 style={{ fontSize: 'clamp(2rem,4.6vw,3.4rem)' }}>Gardens laid with Mark Road stone.</h1><p className="intro">Customers’ patios, terraces and pool surrounds. Every one left the yard on a pallet; tap a project to shop the stone.</p></div></section>
      <section className="chapter" style={{ paddingTop: 'clamp(28px,4vw,48px)' }}><div className="wrap">
        <div className="scenes">
          {SCENES.map(sc => { const p = sc.product ? byId(sc.product) : null; return <a key={sc.title} className="scene" href={href(sc.product ? 'product/' + sc.product : 'shop?cat=' + sc.cat)}><img src={sc.img} alt={sc.title} loading="lazy" /><figcaption><b>{sc.title}</b><span>{sc.sub}</span>{p ? <span style={{ color: 'var(--gold)', marginTop: 4 }}>{p.name} · {money(p.price)} {p.unit} + VAT</span> : <span style={{ color: 'var(--gold)', marginTop: 4 }}>Shop {CAT_LABEL[sc.cat].toLowerCase()}</span>}</figcaption></a> })}
        </div>
        <div className="narrow" style={{ marginTop: 56 }}><p className="kicker">Your garden here</p><h2>Send us the finished job.</h2><p className="intro">Every project on this page came from a customer’s phone. Send yours to info@nityastones.co.uk with the stone you laid and we’ll add it — and put a sample pack of your choice in the post as a thank-you.</p></div>
      </div></section>
    </>
  )
}

function Trade() {
  const [f, setF] = useState({ company: '', name: '', phone: '', email: '', type: 'Landscaper', volume: 'Under 100 m² a year', msg: '' })
  const [copied, setCopied] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const text = `NITYA STONES — TRADE ACCOUNT\n\nCompany:  ${f.company || '—'}\nName:     ${f.name || '—'}\nPhone:    ${f.phone || '—'}\nEmail:    ${f.email || '—'}\nTrade:    ${f.type}\nVolume:   ${f.volume}\n\n${f.msg || '(current jobs, stones you use most, where you deliver)'}`
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied('Copied — email it to info@nityastones.co.uk or ring the yard') } catch { setCopied('Select the text and copy it') } }
  return (
    <>
      <section className="banner"><img src={IMG.pallets} alt="" /><div className="wrap"><p className="kicker">Trade</p><h1 style={{ fontSize: 'clamp(2rem,4.6vw,3.4rem)' }}>Wholesale from the same yard.</h1><p className="intro">Landscapers, builders and developers buy the same stone from the same pallets — on account, by the load, with a name at the yard who knows your jobs.</p></div></section>
      <section className="chapter" style={{ paddingTop: 'clamp(28px,4vw,48px)' }}><div className="wrap">
        <h2 className="sr-only">What a trade account includes</h2><div className="values">
          <div className="value"><h3>Account terms</h3><p>Open an account and order by phone or email against it. Ask the yard about terms — card, bank transfer and Klarna are all taken.</p></div>
          <div className="value"><h3>Pallet and load pricing</h3><p>Multi-pallet and full-load prices on every range. Ask for the trade sheet — it’s the shop price list with the volume column filled in.</p></div>
          <div className="value"><h3>Site delivery</h3><p>Kerbside on a tail-lift, 3–5 working days from payment, 8am–6pm, with a call on the day. Multiple drops on one job by arrangement.</p></div>
          <div className="value"><h3>Samples for your client</h3><p>Sample boards and 100×100 pieces for client sign-off, posted to you or to them.</p></div>
          <div className="value"><h3>Custom from 120 m²</h3><p>A size, colour or finish we don’t hold, run for your project. Allow eight weeks.</p></div>
          <div className="value"><h3>Collect any time</h3><p>Mon–Fri 8–6, Sat 8–1 from 34 Mark Road. No minimum, forked onto your vehicle.</p></div>
        </div>
      </div></section>
      <section className="chapter grey"><div className="wrap contact-grid">
        <div><p className="kicker">Apply</p><h2>Open a trade account.</h2><p className="intro">Fill this in and send it over, or ring {PHONE} and we'll set it up on the call.</p>
          <div className="form">
            <div className="two"><div className="field"><label htmlFor="tCo">Company</label><input id="tCo" autoComplete="organization" value={f.company} onChange={set('company')} /></div><div className="field"><label htmlFor="tName">Your name</label><input id="tName" autoComplete="name" value={f.name} onChange={set('name')} /></div></div>
            <div className="two"><div className="field"><label htmlFor="tPhone">Phone</label><input id="tPhone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} /></div><div className="field"><label htmlFor="tEmail">Email</label><input id="tEmail" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div></div>
            <div className="two">
              <div className="field"><label htmlFor="tType">Trade</label><select id="tType" value={f.type} onChange={set('type')}>{['Landscaper', 'Builder', 'Developer', 'Garden designer', 'Tiler', 'Merchant'].map(o => <option key={o}>{o}</option>)}</select></div>
              <div className="field"><label htmlFor="tVol">Volume</label><select id="tVol" value={f.volume} onChange={set('volume')}>{['Under 100 m² a year', '100–500 m² a year', '500–2,000 m² a year', 'Over 2,000 m² a year'].map(o => <option key={o}>{o}</option>)}</select></div>
            </div>
            <div className="field"><label htmlFor="tMsg">About your work</label><textarea id="tMsg" value={f.msg} onChange={set('msg')} placeholder="Current jobs, the stones you use most, where you deliver" /></div>
            <div className="buy-actions"><button className="pill" type="button" onClick={copy}>Copy application</button><a className="pill ghost" href={PHONE_HREF}>Call {PHONE}</a><span className="copied" role="status" aria-live="polite">{copied}</span></div>
          </div>
        </div>
        <div><p className="kicker">Most laid by trade</p><h2>The four that go on every van.</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 22 }}>{['kandla-grey', 'bodo-white', 'raj-green', 'black-limestone'].map(byId).map(p => <ProductCard key={p.id} p={p} />)}</div>
        </div>
      </div></section>
    </>
  )
}

function Collections() {
  return (
    <>
      <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)', paddingBottom: 0 }}><div className="wrap narrow"><p className="kicker">Collections</p><h1 className="pg">Three editions.</h1><p className="intro">Every stone we hold, arranged by what it’s for. Same shop prices — the editions are the curation, not a different price list.</p></div></section>
      {EDITIONS.map((ed, i) => (
        <div key={ed.num} id={ed.num.split(' ')[1]}>
          <section className="banner" style={{ marginTop: i === 0 ? 40 : 0 }}><img src={[SCENES[0].img, SCENES[1].img, SCENES[5].img][i]} alt="" /><div className="wrap"><p className="kicker">{ed.num}{ed.featured ? ' · Most laid' : ''}</p><h2>{ed.name}.</h2><p className="intro">{ed.why}</p><p className="from">from <b>{money(ed.from)}</b> per m² + VAT</p></div></section>
          <section className="chapter" style={{ paddingBlock: 'clamp(36px,5vw,64px)' }}><div className="wrap"><div className="grid">{ed.ids.map(byId).map(p => <ProductCard key={p.id} p={p} />)}</div></div></section>
        </div>
      ))}
    </>
  )
}

function PatternThumb({ p }) {
  const rects = useMemo(() => {
    const W = 300, H = 180, mm = 7, joint = 10 / mm, out = [], r = rng(7); let n = 0
    if (p.kind === 'mixed') { for (let y = 0; y < H;) { const rowH = (r() > 0.55 ? 600 : 295) / mm; for (let x = -6; x < W;) { let o = MIXED.filter(s => Math.abs(s[1] / mm - rowH) < 1); if (!o.length) o = [[600, rowH * mm]]; const w = o[Math.floor(r() * o.length)][0] / mm; out.push({ x, y, w, h: rowH, i: n++ }); x += w + joint } y += rowH + joint } }
    else { const sw = p.w / mm, sh = p.h / mm, off = p.kind === 'stack' ? 0 : p.kind === 'third' ? sw / 3 : sw / 2; let row = 0; for (let y = -sh * .3; y < H; y += sh + joint) { const sh_ = p.kind === 'third' ? (row % 3) * off : (row % 2) * off; for (let x = -sh_ - sw * .3; x < W; x += sw + joint) out.push({ x, y, w: sw, h: sh, i: n++ }); row++ } }
    return out
  }, [p])
  return <svg viewBox="0 0 300 180" aria-hidden="true"><rect width="300" height="180" fill="#3a3a3a" />{rects.map(q => <rect key={q.i} x={q.x} y={q.y} width={q.w} height={q.h} fill={['#d6d2ca', '#cbc7bf', '#c2beb6', '#d0ccc4', '#c8c4bc'][q.i % 5]} />)}</svg>
}

function Build({ bag }) {
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('nitya-designs') || '[]') } catch { return [] } })
  const [pid, setPid] = useState('raj-green')
  const [len, setLen] = useState('6'), [wid, setWid] = useState('4'), [waste, setWaste] = useState('10')
  const [pat, setPat] = useState(0)
  const [msg, setMsg] = useState('')
  const p = byId(pid)
  const net = num(len, 0) * num(wid, 0), pct = Math.min(num(waste, 10), 40), gross = net * (1 + pct / 100)
  const q = quantify(p, gross), packs = q.packs, ex = exVat(p, q)
  const patterns = p.size.includes('Mixed') ? [PATTERNS[0]] : p.cat === 'cladding' ? [PATTERNS[3]] : p.size.includes('600 × 600') ? [PATTERNS[2], PATTERNS[1]] : [PATTERNS[1], PATTERNS[2]]
  const pattern = patterns[Math.min(pat, patterns.length - 1)]
  const persist = (list) => { setSaved(list); try { localStorage.setItem('nitya-designs', JSON.stringify(list)) } catch { /* private mode */ } }
  const save = () => { const d = { id: Date.now(), pid, len, wid, waste, pattern: pattern.title, packs, slabs: q.slabs, ex }; persist([d, ...saved].slice(0, 8)); setMsg('Design saved — it’s on this device to come back to or reorder from.') }
  const load = (d) => { setPid(d.pid); setLen(d.len); setWid(d.wid); setWaste(d.waste); setPat(0); window.scrollTo({ top: 0 }) }
  const byFamily = CATS.map(([k, l]) => [l, PRODUCTS.filter(x => x.cat === k && x.unit !== 'per kit')])
  return (
    <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap">
      <div className="head-row"><div><p className="kicker">Build your patio</p><h1 className="pg">Pick the stone. Draw the area. Get the packs.</h1><p className="intro">36 stones on the ground. Choose one, put in the dimensions, pick how it lays, and the design on the right is what leaves the yard.</p></div></div>
      <h2 className="sr-only">Choose the stone and the area</h2><div className="builder">
        <div>
          <div className="bstep"><h3><i>I</i> Choose the stone</h3>
            {byFamily.map(([label, list]) => <div key={label}><p className="note" style={{ marginBottom: 8, fontWeight: 500, color: 'var(--ink-2)' }}>{label}</p>
              <div className="stone-pick">{list.map(x => <button key={x.id} type="button" aria-pressed={pid === x.id} onClick={() => { setPid(x.id); setPat(0) }}><img src={x.img} alt="" loading="lazy" /><b>{x.name}</b><small>{money(x.price)} {x.unit === 'per m²' ? '/m²' : x.unit.replace('per ', '/')}</small></button>)}</div></div>)}
          </div>
          <div className="bstep"><h3><i>II</i> Draw the area</h3>
            <div className="three">
              <div className="field"><label htmlFor="bLen">Length (m)</label><input id="bLen" type="number" min="0" step="0.1" value={len} onChange={e => setLen(e.target.value)} /></div>
              <div className="field"><label htmlFor="bWid">Width (m)</label><input id="bWid" type="number" min="0" step="0.1" value={wid} onChange={e => setWid(e.target.value)} /></div>
              <div className="field"><label htmlFor="bWaste">Cuts allowance (%)</label><input id="bWaste" type="number" min="0" max="40" step="1" value={waste} onChange={e => setWaste(e.target.value)} /></div>
            </div>
            <p className="note">10% covers a straight patio. Circles, diagonals and lots of edges want 15–20%.</p>
          </div>
          <div className="bstep"><h3><i>III</i> Pick the lay</h3>
            <div className="pattern-pick">{patterns.map((q, i) => <button key={q.title} type="button" aria-pressed={i === Math.min(pat, patterns.length - 1)} onClick={() => setPat(i)}><PatternThumb p={q} /><b>{q.title}</b><span className="note">{q.sub}</span></button>)}</div>
          </div>
          {saved.length > 0 && <div className="saved"><p className="kicker" style={{ marginBottom: 0 }}>Saved designs</p>
            {saved.map(d => { const x = byId(d.pid); return <div key={d.id} className="saved-row"><img src={x.img} alt="" /><div><b>{x.name}</b><small>{d.len} × {d.wid} m · {d.pattern} · {x.cover ? qtyWords(x, { packs: d.packs, slabs: d.slabs || 0 }) : `${d.packs} m²`} · {money(d.ex * (1 + VAT))} inc VAT</small></div><div style={{ display: 'flex', gap: 8 }}><button className="more" type="button" onClick={() => load(d)}>Open</button><button className="remove" type="button" onClick={() => persist(saved.filter(s => s.id !== d.id))}>Remove</button></div></div> })}
          </div>}
        </div>
        <aside className="design">
          <h3>Your design</h3>
          <img src={p.img} alt={p.name} />
          <div className="row"><span className="k">Stone</span><span className="v">{p.name}</span></div>
          <div className="row"><span className="k">Area</span><span className="v">{net.toFixed(2)} m² · +{pct}% = {gross.toFixed(2)} m²</span></div>
          <div className="row"><span className="k">Lay</span><span className="v">{pattern.title}</span></div>
          <div className="row"><span className="k">{p.cover ? (q.slabs ? 'Packs + slabs' : plural(packWord(p), 2).replace(/^./, c => c.toUpperCase())) : 'Supplied'}</span><span className="v">{qtyLine(p, q)}</span></div>
          <div className="row"><span className="k">Stone, ex VAT</span><span className="v">{money(ex)}</span></div>
          <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * (1 + VAT))}</span></div>
          <button className="pill" type="button" onClick={() => { addQuantity(bag, p, q); go('cart') }}>Add {qtyWords(p, q)} to bag</button>
          <button className="pill ghost" type="button" onClick={save}>Save this design</button>
          {msg && <p className="note" role="status" style={{ color: 'var(--gold)' }}>{msg}</p>}
          <p className="note">Delivery is quoted on quantity and postcode before you pay. Collection from HP2 7BW is free.</p>
        </aside>
      </div>
    </div></section>
  )
}

function Shop({ route }) {
  const cat = route.q.get('cat') || 'all'
  const [q, setQ] = useState(route.q.get('q') || '')
  const [sort, setSort] = useState('featured')
  let list = PRODUCTS.filter(p => cat === 'all' || (cat === 'offers' ? saving(p) >= 10 : p.cat === cat))
  if (q.trim()) { const words = q.trim().toLowerCase().split(/\s+/); list = list.filter(p => { const hay = (p.name + ' ' + CAT_LABEL[p.cat] + ' ' + SEARCH_TAGS[p.cat] + ' ' + (COLOUR_TAGS[p.id] || '') + ' ' + p.size + ' ' + p.thick + ' ' + p.finish + ' ' + p.origin + ' ' + p.blurb).toLowerCase(); return words.every(w => hay.includes(w)) }) }
  if (sort === 'low') list = [...list].sort((a, b) => (a.unit === 'per m²' ? a.price : a.price / (a.cover || 1)) - (b.unit === 'per m²' ? b.price : b.price / (b.cover || 1)))
  if (sort === 'high') list = [...list].sort((a, b) => (b.unit === 'per m²' ? b.price : b.price / (b.cover || 1)) - (a.unit === 'per m²' ? a.price : a.price / (a.cover || 1)))
  if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  const current = cat === 'offers' ? ['offers', 'Offers', 'Everything currently below its list price. Same stone, same yard — the price has moved, not the quality.'] : CATS.find(c => c[0] === cat)
  const banner = { sandstone: SCENES[3].img, limestone: SCENES[0].img, outdoor: SCENES[1].img, indoor: byId('calacatta-blanco').img, cladding: SCENES[6].img }[cat] || SCENES[2].img
  return (
    <>
    <section className="banner"><img src={banner} alt="" /><div className="wrap"><p className="kicker">Shop</p><h1 style={{ fontSize: 'clamp(2rem,4.6vw,3.4rem)' }}>{current ? current[1] : 'Every range'}</h1><p className="intro">{current ? current[2] : 'Prices per m² ex VAT, as sold at the yard. Every image is our own stock.'}</p></div></section>
    <section className="chapter" style={{ paddingTop: 'clamp(28px,4vw,48px)' }}><div className="wrap">
      <div className="toolbar">
        <div className="seg" role="group" aria-label="Category">
          <button type="button" aria-pressed={cat === 'all'} onClick={() => go('shop')}>All</button>
          {CATS.map(([k, l]) => <button key={k} type="button" aria-pressed={cat === k} onClick={() => go('shop?cat=' + k)}>{l}</button>)}
          <button type="button" className="offers-seg" aria-pressed={cat === 'offers'} onClick={() => go('shop?cat=offers')}>Offers</button>
        </div>
        <div className="search">
          <input id="shopSearch" type="search" placeholder="Search ranges" value={q} onChange={e => setQ(e.target.value)} aria-label="Search ranges" />
          <select id="shopSort" className="select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort">
            <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="az">A – Z</option>
          </select>
        </div>
      </div>
      <p className="count" style={{ marginBottom: 16 }}>{list.length} {list.length === 1 ? 'product' : 'products'}</p>
      <h2 className="sr-only">Products</h2><div className="grid">{list.map(p => <ProductCard key={p.id} p={p} featured={sort === 'featured' && !q} />)}</div>
    </div></section>
    </>
  )
}

function Gallery({ p }) {
  const pics = [{ src: p.img, alt: `${p.name} studio render` }, ...(p.unit !== 'per kit' ? [{ src: p.img, alt: `${p.name} in 3D, drag to turn`, kind: '3d' }] : []), ...p.gallery.map((src, i) => ({ src, alt: `${p.name} photo ${i + 1}` }))]
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const touch = useRef(null)
  const go = (d) => setI(n => (n + d + pics.length) % pics.length)
  useEffect(() => {
    if (!open) return
    const key = (e) => { if (e.key === 'Escape') setOpen(false); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    window.addEventListener('keydown', key); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = '' }
  }, [open])
  const swipe = {
    onTouchStart: (e) => { touch.current = e.touches[0].clientX },
    onTouchEnd: (e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1) },
  }
  const frame = (big) => {
    const three = pics[i].kind === '3d' && !big
    return (
    <div className={(big ? 'lb-main' : 'main') + (three ? ' g3d' : '')} {...(three ? {} : swipe)}>
      {three
        ? <><Suspense fallback={<div className="hero-3d" aria-hidden="true" />}><StoneScene {...stoneProps(p)} mode="slab" /></Suspense><span className="g-hint" aria-hidden="true">Drag to turn</span></>
        : <img src={pics[i].src} alt={pics[i].alt} onClick={() => !big && setOpen(true)} />}
      {pics.length > 1 && <>
        <button type="button" className="g-nav prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); go(-1) }}>‹</button>
        <button type="button" className="g-nav next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); go(1) }}>›</button>
        <span className="g-count">{i + 1} / {pics.length}</span>
      </>}
      {!big && !three && <span className="g-zoom" aria-hidden="true">Tap to enlarge</span>}
    </div>
  ) }
  return (
    <div className="gallery">
      {frame(false)}
      {pics.length > 1 && <div className="thumbs" aria-label="Photos">{pics.map((x, k) => <button key={k} type="button" aria-pressed={i === k} aria-label={x.alt} onClick={() => setI(k)} className={x.kind === '3d' ? 'is3d' : ''}><img src={x.src} alt="" loading="lazy" />{x.kind === '3d' && <span className="g-badge" aria-hidden="true">3D</span>}</button>)}</div>}
      {open && createPortal(<div className="lightbox" role="dialog" aria-modal="true" aria-label={`${p.name} photos`} onClick={() => setOpen(false)}>
        <button type="button" className="lb-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        <div onClick={(e) => e.stopPropagation()}>{frame(true)}<p className="lb-cap">{pics[i].alt} · {p.name}</p></div>
      </div>, document.body)}
    </div>
  )
}

function ProductStory({ p }) {
  const c = p.content
  if (!c) return null
  const packTotal = c.pack ? c.pack.reduce((n, [, q]) => n + q, 0) : 0
  return (
    <section className="chapter story"><div className="wrap">
      <div className="story-grid">
        <div className="story-main">
          <p className="kicker">About the stone</p>
          <h2>{p.name}, in detail.</h2>
          {c.body.map((t, i) => <p key={i} className="story-p">{t}</p>)}
          {c.features && <ul className="features" aria-label="Features">{c.features.map(f => <li key={f}>{f}</li>)}</ul>}
          {c.laying && <><p className="kicker" style={{ marginTop: 34 }}>Laying and care</p><ol className="laying">{c.laying.map((t, i) => <li key={i}>{t}</li>)}</ol></>}
          {c.note && <p className="story-note">{c.note}</p>}
        </div>
        <aside className="story-side">
          {c.pack && <div className="panel"><h3>What’s in the pack</h3>
            <table className="pack-table"><tbody>{c.pack.map(([size, q]) => <tr key={size}><td>{size}</td><td>{q}</td></tr>)}<tr className="tot"><td>{packTotal} slabs</td><td>{p.cover ? p.cover.toFixed(2) + ' m²' : ''}</td></tr></tbody></table>
            <p className="panel-note">Laid random from the four sizes. Sizes are nominal; the riven face varies a few millimetres.</p></div>}
          {c.details && <div className="panel"><h3>Specification</h3>
            <dl className="details">{c.details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>}
          <div className="panel"><h3>Delivery and collection</h3>
            <p className="panel-note">Kerbside pallet delivery in 3–5 working days, quoted by postcode before anything is charged. Free collection from 34 Mark Road, Hemel Hempstead HP2 7BW, Mon–Fri 8–6, Sat 8–1.</p>
            <a className="more" href={href('about#delivery')}>Delivery details</a></div>
        </aside>
      </div>
    </div></section>
  )
}

/* The order box: the unit table (per m², single slab, pack), order by the
 * pack or by the area, loose slabs where the range splits, and the delivery
 * and collection facts a customer wants before they add anything. */
function OrderBox({ p, bag, setAdded, added }) {
  const [mode, setMode] = useState('pack'), [packs, setPacks] = useState(1), [slabs, setSlabs] = useState(0), [area, setArea] = useState('')
  const k = p.packing, w = packWord(p), cap = (t) => t.replace(/^./, c => c.toUpperCase())
  const q = mode === 'area' ? quantify(p, num(area)) : p.cover ? { packs, slabs: p.split ? slabs : 0, m2: round2(packs * p.cover + (p.split ? slabs * k.slabM2 : 0)) } : { packs, slabs: 0, m2: packs }
  const ex = exVat(p, q), empty = !q.packs && !q.slabs
  const add = () => { if (empty) return; addQuantity(bag, p, q); setAdded(`Added ${qtyWords(p, q)} to your bag`) }
  const packLabel = !k ? cap(w) : k.mode === 'mixed' ? `${cap(w)} · ${p.slabs} slabs, four sizes` : k.unit === 'box' && p.cat !== 'outdoor' ? `${cap(w)} · ${k.perBox} ${p.cat === 'cladding' ? 'strips' : 'tiles'}` : `${cap(w)} · ${k.perPack} slabs`
  return (
    <div className="buy">
      {p.cover ? <table className="units"><caption className="sr-only">Prices by unit, ex VAT</caption>
        <thead><tr><th scope="col">Unit</th><th scope="col">Covers</th><th scope="col">Price + VAT</th></tr></thead>
        <tbody>
          <tr><td>Per m²</td><td>1 m²</td><td>{p.was && <s>{money(p.unit === 'per pallet' ? p.was / p.cover : p.was)}</s>}<b>{money(m2Price(p))}</b></td></tr>
          {p.split && <tr><td>Single slab</td><td>{k.slabM2} m²</td><td><b>{money(slabPrice(p))}</b></td></tr>}
          <tr><td>{packLabel}</td><td>{p.cover.toFixed(2)} m²</td><td>{p.was && <s>{money(p.unit === 'per pallet' ? p.was : p.was * p.cover)}</s>}<b>{money(lineUnitPrice(p))}</b></td></tr>
        </tbody></table>
        : <div className="row"><span>{p.unit === 'per kit' ? 'Complete kit' : 'Per m²'}</span><b>{money(p.price)} + VAT</b></div>}
      {p.cover && <div className="seg" role="group" aria-label="Order by"><button type="button" aria-pressed={mode === 'pack'} onClick={() => setMode('pack')}>By the {w}</button><button type="button" aria-pressed={mode === 'area'} onClick={() => setMode('area')}>By the area</button></div>}
      {mode === 'pack' || !p.cover
        ? <div className="order-row">
          <div className="field"><span className="lbl">{p.cover ? plural(cap(w), 2) : p.unit === 'per kit' ? 'Kits' : 'm²'}</span><Qty value={packs} set={setPacks} min={p.split ? 0 : 1} label={plural(cap(w), 2)} /></div>
          {p.split && <div className="field"><span className="lbl">Loose slabs</span><Qty value={slabs} set={setSlabs} min={0} max={k.perPack - 1} label="Loose slabs" /></div>}
        </div>
        : <div className="order-row area">
          <div className="field"><label htmlFor="obArea">Area to cover (m²)</label><input id="obArea" type="number" min="0" step="0.1" placeholder="e.g. 24" value={area} onChange={e => setArea(e.target.value)} /></div>
          <p className="deliv-out">{num(area) > 0 ? <>Supplied as <b>{qtyLine(p, q)}</b>{p.split ? '' : ` — whole ${plural(w, 2)} only`}. Add 10% for cuts if you haven’t.</> : 'Type the area, with any allowance for cuts.'}</p>
        </div>}
      <div className="row"><span>{empty ? 'Nothing selected' : qtyWords(p, q)}{!empty && p.cover ? ` · ${q.m2.toFixed(2)} m²` : ''}</span><b>{money(ex)} + VAT</b></div>
      <div className="buy-actions">
        <button className="pill" type="button" onClick={add} disabled={empty}>Add to bag · {money(ex * (1 + VAT))} inc VAT</button>
        <span className="added" role="status" aria-live="polite">{added}</span>
      </div>
      <ul className="facts-list">
        <li>Delivery from <b>{fmtDay(workingDaysFrom(3))}</b>: 3–5 working days from payment, kerbside on a tail-lift, we ring on the day.</li>
        <li>Orders over £500 inside the M25 travel free. Elsewhere, an indicative cost by postcode below, confirmed by phone before you pay.</li>
        <li>Collect free from {BUSINESS.address[0]}, {BUSINESS.postcode}: {BUSINESS.hoursShort}. No minimum.</li>
        {p.split ? <li>Loose slabs travel on the same pallet. Any split-pack handling is confirmed with the delivery cost.</li> : p.cover && p.packing?.unit !== 'box' ? <li>Sold in whole {plural(w, 2)} only.</li> : null}
      </ul>
      <DeliveryEstimate pallets={palletsOf([{ p, qty: q.packs }, ...(q.slabs ? [{ p: lineProduct('slabs:' + p.id), qty: q.slabs }] : [])])} />
      <div className="buy-actions">
        <button className="more" type="button" onClick={() => { bag.add('sample:' + p.id, 1); setAdded('Sample added to your bag — £5') }}>Order a 100×100 mm sample · £5</button>
      </div>
    </div>
  )
}

/* See it in 3D: the product's own face texture on a slab, laid in its pattern,
 * dry or wet. The wet look is a simulation until the hosed photos are shot. */
const stoneProps = (p) => {
  const m = p.size.match(/(\d+)\s*×\s*(\d+)/)
  const size = p.packing?.mode === 'mixed' ? [900, 600] : m ? [+m[1], +m[2]] : [900, 600]
  return { size, pattern: p.cat === 'cladding' ? 'wall' : p.packing?.mode === 'mixed' ? 'mixed' : size[0] === size[1] ? 'stack' : 'half', riven: /riven/i.test(p.finish) && p.cat !== 'outdoor', thick: parseInt(p.thick) || 20, texture: p.texture || p.gallery[0] || p.img }
}
function Stone3D({ p }) {
  const [mode, setMode] = useState('slab'), [wet, setWet] = useState(false)
  const { size, pattern, riven, thick, texture } = stoneProps(p)
  return (
    <section className="chapter" style={{ paddingBlock: 'clamp(40px,6vw,80px)', paddingTop: 0 }}><div className="wrap">
      <div className="head-row"><div><p className="kicker">See it in 3D</p><h2>{p.name}, turned in the hand and laid on the ground.</h2></div>
        <div className="seg-row">
          <div className="seg" role="group" aria-label="View"><button type="button" aria-pressed={mode === 'slab'} onClick={() => setMode('slab')}>{p.cat === 'cladding' ? 'One strip' : 'One slab'}</button><button type="button" aria-pressed={mode === 'laid'} onClick={() => setMode('laid')}>{p.cat === 'cladding' ? 'On the wall' : 'Laid'}</button></div>
          <div className="seg" role="group" aria-label="Dry or wet"><button type="button" aria-pressed={!wet} onClick={() => setWet(false)}>Dry</button><button type="button" aria-pressed={wet} onClick={() => setWet(true)}>Wet</button></div>
        </div>
      </div>
      <div className={`stone3d ${wet ? 'wet' : ''}`}>
        <Suspense fallback={<div className="hero-3d" aria-hidden="true" />}><StoneScene texture={texture} mode={mode} wet={wet} size={size} pattern={pattern} riven={riven} thick={thick} /></Suspense>
        <div className="hero-static"><img src={p.gallery[0] || p.img} alt="" /></div>
      </div>
      <p className="note">Drag to turn. The face is the yard’s own photograph wrapped on the stone; {mode === 'laid' ? (p.cat === 'cladding' ? 'the wall is a running bond of 600 × 150 strips' : `laid ${pattern === 'mixed' ? 'random from the four-size pack' : pattern === 'stack' ? 'stack bond' : 'half bond'} with 10 mm pointed joints`) : 'at true proportions'}. Wet is simulated from the dry photograph until the hosed slabs are shot; real stone comes up darker and richer than any screen shows.</p>
    </div></section>
  )
}

function Product({ route, bag }) {
  const p = byId(route.id)
  const [added, setAdded] = useState('')
  useEffect(() => { if (!p) return; document.body.classList.add('has-sticky'); return () => document.body.classList.remove('has-sticky') }, [p])
  if (!p) return <div className="wrap empty"><h2>Not found</h2><p style={{ marginTop: 12 }}><a className="more" href={href('shop')}>Back to the shop</a></p></div>
  const unitPrice = lineUnitPrice(p)
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4)
  const pairs = (PAIRS[p.id] || []).map(byId).filter(Boolean)
  const addToBag = () => { bag.add(p.id, 1); setAdded(`Added 1 × ${lineUnitLabel(p)} to your bag`) }
  return (
    <>
      <div className="wrap pdp">
        <div className="gallery-col">
          <Gallery key={p.id} p={p} />
          {(p.cat === 'sandstone' || p.cat === 'limestone') && p.unit !== 'per kit' && <div style={{ marginTop: 14 }}><WetDry dry={p.img} wet={p.wet} name={p.name} /><p className="wetdry-note">Drag to compare. {p.wet ? 'Both photos are the same slab, hosed and dry.' : 'The wet side is simulated from the dry photo until we’ve shot the slab hosed — natural stone comes up darker and richer than any screen shows.'}</p></div>}
        </div>
        <div>
          <nav className="crumbs" aria-label="Breadcrumb"><a href={href('shop')}>Shop</a><span>/</span><a href={href('shop?cat=' + p.cat)}>{CAT_LABEL[p.cat]}</a><span>/</span><span>{p.name}</span></nav>
          {p.tag && <span className="tag">{p.tag}</span>}
          <h1>{p.name}</h1>
          <p className="origin">{p.origin} · {p.size} · {p.thick}</p>
          <Price p={p} big />
          <p className="blurb">{p.blurb}</p>
          {p.content?.features && <ul className="ticks" aria-label="Key features">{p.content.features.slice(0, 5).map(f => <li key={f}>{f}</li>)}</ul>}
          <dl className="spec-table">
            <div><dt>Size</dt><dd>{p.size}</dd></div>
            <div><dt>Thickness</dt><dd>{p.thick}</dd></div>
            <div><dt>Finish</dt><dd>{p.finish}</dd></div>
            <div><dt>Sold as</dt><dd>{p.pack}</dd></div>
            <div><dt>Delivery</dt><dd>From {fmtDay(workingDaysFrom(3))} · 3–5 working days · free over £500 inside the M25 · collect free from HP2 7BW</dd></div>
            <div><dt>Split packs</dt><dd>{p.split ? 'Yes — whole packs plus loose slabs' : p.packing?.unit === 'box' && p.cat !== 'outdoor' ? 'Sold by the box' : p.cover ? 'No — sold as a full ' + packWord(p) : 'No'}</dd></div>
          </dl>
          <OrderBox p={p} bag={bag} setAdded={setAdded} added={added} />
        </div>
      </div>
      {p.unit !== 'per kit' && <Stone3D p={p} />}
      <ProductStory p={p} />
      {pairs.length > 0 && <section className="chapter" style={{ paddingBlock: 'clamp(40px,6vw,80px)', paddingTop: 0 }}><div className="wrap">
        <div className="head-row"><div><p className="kicker">Pairs with</p><h2>Laid next to {p.name}.</h2></div></div>
        <div className="pairs">{pairs.map(x => <a key={x.id} className="pair" href={href('product/' + x.id)}><img src={p.img} alt="" /><img src={x.img} alt={x.name} /><div><b>{p.name} + {x.name}</b><span>{x.cat === 'cladding' ? 'Wall behind the patio' : x.cat === p.cat ? 'Border, step or contrast band' : CAT_LABEL[x.cat] + ' · ' + money(x.price) + ' ' + x.unit}</span></div></a>)}</div>
      </div></section>}
      <div className="sticky-buy"><div><b>{money(unitPrice * (1 + VAT))}</b><small>{lineUnitLabel(p)} inc VAT</small></div><button className="pill" type="button" onClick={addToBag}>Add to bag</button></div>
      {p.unit !== 'per kit' && <section className="chapter grey" style={{ paddingBlock: 'clamp(40px,6vw,80px)' }}><div className="wrap">
        <div className="head-row"><div><p className="kicker">How many packs</p><h2>Price your area in {p.name}.</h2></div></div>
        <Calculator key={p.id} initial={p.id} bag={bag} compact />
      </div></section>}
      {related.length > 0 && <section className="chapter" style={{ paddingBlock: 'clamp(40px,6vw,80px)' }}><div className="wrap">
        <div className="head-row"><div><p className="kicker">Also in {CAT_LABEL[p.cat]}</p><h2>Alongside {p.name}.</h2></div><a className="more" href={href('shop?cat=' + p.cat)}>All {CAT_LABEL[p.cat].toLowerCase()}</a></div>
        <div className="grid">{related.map(x => <ProductCard key={x.id} p={x} />)}</div>
      </div></section>}
    </>
  )
}

function Samples({ bag }) {
  const [added, setAdded] = useState('')
  return (
    <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap">
      <div className="narrow"><p className="kicker">Samples · £5 each</p><h1 className="pg">Look before you lay.</h1><p className="intro">100×100 mm pieces of the real stone, posted out or collected from the counter. Put one where the patio’s going, look at it wet and dry, then order the pallets.</p><p className="added" style={{ marginTop: 14 }} role="status" aria-live="polite">{added}</p></div>
      <h2 className="sr-only">Samples by range</h2><div className="media grid">
        {PRODUCTS.filter(p => p.unit !== 'per kit').map(p => (
          <div key={p.id} className="product">
            <img src={p.img} alt={p.name} loading="lazy" />
            <div className="product-body"><h3>{p.name}</h3><span className="spec">{CAT_LABEL[p.cat]} · {p.size}</span>
              <div className="buy-actions" style={{ marginTop: 12 }}><button className="pill ghost" type="button" style={{ padding: '9px 16px', fontSize: '.88rem' }} onClick={() => { bag.add('sample:' + p.id, 1); setAdded(`${p.name} sample added — £5`) }}>Add sample · £5</button></div>
            </div>
          </div>
        ))}
      </div>
    </div></section>
  )
}

function Bag({ bag }) {
  const items = bag.lines.map(l => ({ ...l, p: lineProduct(l.id) })).filter(l => l.p)
  const ex = items.reduce((s, l) => s + lineUnitPrice(l.p) * l.qty, 0)
  if (!items.length) return <div className="wrap empty"><h1 className="pg">Your bag is empty.</h1><p style={{ marginTop: 12 }}><a className="more" href={href('shop')}>Shop the ranges</a></p></div>
  return (
    <div className="wrap bag">
      <div>
        <p className="kicker">Your bag</p><h1 className="pg" style={{ marginBottom: 24 }}>{bag.count} {bag.count === 1 ? 'item' : 'items'}</h1>
        <div className="lines">
          {items.map(l => (
            <div key={l.id} className="line">
              <img src={l.p.img} alt="" />
              <div><div className="name">{l.p.name}</div><div className="meta">{lineUnitLabel(l.p)} · {money(lineUnitPrice(l.p))} + VAT{l.p.cover ? <> · <b>{l.qty} {plural(packWord(l.p), l.qty)} = {(l.qty * l.p.cover).toFixed(2)} m²</b></> : l.p.unit === 'per slab' ? <> · <b>{l.qty} {plural('slab', l.qty)} = {(l.qty * l.p.slabM2).toFixed(2)} m²</b></> : null}</div>
                <div className="qty" style={{ marginTop: 10 }}><button type="button" onClick={() => bag.set(l.id, l.qty - 1)} aria-label="Fewer">−</button><output>{l.qty}</output><button type="button" onClick={() => bag.set(l.id, l.qty + 1)} aria-label="More">+</button></div></div>
              <div className="right"><span className="sum">{money(lineUnitPrice(l.p) * l.qty)}</span><button className="remove" type="button" onClick={() => bag.set(l.id, 0)}>Remove</button></div>
            </div>
          ))}
        </div>
      </div>
      <h2 className="sr-only">Order summary</h2><aside className="summary">
        <h3>Summary</h3>
        <div className="row"><span className="k">Goods, ex VAT</span><span className="v">{money(ex)}</span></div>
        <div className="row"><span className="k">VAT at 20%</span><span className="v">{money(ex * VAT)}</span></div>
        <div className="row"><span className="k">Delivery</span><span className="v">{palletsOf(items)} {palletsOf(items) === 1 ? 'pallet' : 'pallets'} · from {fmtDay(workingDaysFrom(3))}</span></div>
        <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * (1 + VAT))}</span></div>
        <DeliveryEstimate pallets={palletsOf(items)} compact />
        <a className="pill" href={href('checkout')}>Checkout</a>
        <a className="more" href={href('shop')} style={{ justifySelf: 'center' }}>Keep shopping</a>
      </aside>
    </div>
  )
}

function Checkout({ bag }) {
  const items = bag.lines.map(l => ({ ...l, p: lineProduct(l.id) })).filter(l => l.p)
  const ex = items.reduce((s, l) => s + lineUnitPrice(l.p) * l.qty, 0)
  const [f, setF] = useState({ name: '', email: '', phone: '', line1: '', town: '', postcode: '', method: 'delivery', pay: 'card', notes: '' })
  const [order, setOrder] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ok = f.name && f.phone && (f.method === 'collection' || (f.line1 && f.postcode))
  if (order) return <div className="wrap done"><p className="kicker">Order received</p><h1 className="pg">Thank you, {order.name.split(' ')[0]}.</h1><p className="intro">{order.method === 'collection' ? 'We’ll ring when it’s ready to collect from Mark Road — usually the same day.' : 'We’ll confirm the delivery cost by phone before anything is charged, then it’s 3–5 working days.'}</p><p className="num">Order {order.ref} · {money(order.total)} inc VAT{order.method === 'delivery' ? ' + delivery' : ''}</p><p className="note" style={{ marginTop: 22 }}>Demo checkout — no payment has been taken. The live store connects this to WooCommerce.</p><div className="actions"><a className="pill ghost" href={href('shop')}>Back to the shop</a></div></div>
  if (!items.length) return <div className="wrap empty"><h1 className="pg">Nothing to check out.</h1><p style={{ marginTop: 12 }}><a className="more" href={href('shop')}>Shop the ranges</a></p></div>
  return (
    <div className="wrap checkout">
      <div style={{ display: 'grid', gap: 18 }}>
        <p className="kicker">Checkout</p><h1 className="pg" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>Your order.</h1>
        <h2 className="sr-only">Your details</h2><div className="panel"><h3>Contact</h3>
          <div className="two"><div className="field"><label htmlFor="coName">Name</label><input id="coName" autoComplete="name" value={f.name} onChange={set('name')} /></div><div className="field"><label htmlFor="coPhone">Phone</label><input id="coPhone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} /></div></div>
          <div className="field"><label htmlFor="coEmail">Email</label><input id="coEmail" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
        </div>
        <div className="panel"><h3>Delivery or collection</h3>
          <div className="choice">
            <label><input type="radio" name="method" checked={f.method === 'delivery'} onChange={() => setF({ ...f, method: 'delivery' })} /><div><b>Deliver it · from {fmtDay(workingDaysFrom(3))}</b><span>3–5 working days from payment, 8am–6pm, kerbside on a tail-lift, we call on the day. Free over £500 inside the M25; elsewhere the cost is confirmed by phone before you’re charged.</span></div></label>
            <label><input type="radio" name="method" checked={f.method === 'collection'} onChange={() => setF({ ...f, method: 'collection' })} /><div><b>Collect from Mark Road</b><span>Free, no minimum. {BUSINESS.address.join(', ')} (<a href={BUSINESS.maps} target="_blank" rel="noreferrer">map</a>). {BUSINESS.hoursShort.replace(' · ', ', ')}. We ring when it’s ready, usually the same day.</span></div></label>
          </div>
          {f.method === 'delivery' && <>
            <div className="field"><label htmlFor="coLine1">Address</label><input id="coLine1" autoComplete="address-line1" value={f.line1} onChange={set('line1')} /></div>
            <div className="two"><div className="field"><label htmlFor="coTown">Town</label><input id="coTown" autoComplete="address-level2" value={f.town} onChange={set('town')} /></div><div className="field"><label htmlFor="coPost">Postcode</label><input id="coPost" autoComplete="postal-code" value={f.postcode} onChange={set('postcode')} /></div></div>
            {f.postcode && (() => { const r = deliveryFor(f.postcode); const pallets = palletsOf(items); const free = r && !r.ask && r.band.key === 'london' && ex * (1 + VAT) > 500; return <p className="deliv-out">{!r ? 'Check the postcode.' : r.ask ? <>Priced by the job for this postcode — we’ll ring you with the cost.</> : free ? <>Inside the M25 and over £500: <b>delivery is free</b>. Kerbside, {pallets} {pallets === 1 ? 'pallet' : 'pallets'}.</> : <>Indicative: <b>{money(r.band.perPallet)} per pallet</b> × {pallets} = <b>{money(r.band.perPallet * pallets)}</b> ({r.band.name}). Confirmed by phone before payment.</>}</p> })()}
            {items.some(l => l.p.unit === 'per slab') && <p className="deliv-out">Loose slabs travel on the same pallet as the packs. Any split-pack handling is confirmed with the delivery cost.</p>}
            <div className="field"><label htmlFor="coNotes">Access notes</label><input id="coNotes" placeholder="Narrow drive, no kerb, leave on the lawn…" value={f.notes} onChange={set('notes')} /></div>
          </>}
        </div>
        <div className="panel"><h3>Payment</h3>
          <div className="choice">
            <label><input type="radio" name="pay" checked={f.pay === 'card'} onChange={() => setF({ ...f, pay: 'card' })} /><div><b>Card</b><span>Visa, Mastercard, Maestro.</span></div></label>
            <label><input type="radio" name="pay" checked={f.pay === 'klarna'} onChange={() => setF({ ...f, pay: 'klarna' })} /><div><b>Klarna</b><span>Pay in 3, interest free.</span></div></label>
            <label><input type="radio" name="pay" checked={f.pay === 'phone'} onChange={() => setF({ ...f, pay: 'phone' })} /><div><b>Pay by phone</b><span>We'll ring you on {PHONE} to take payment and confirm delivery.</span></div></label>
          </div>
          <img className="payments" src={IMG.payments} alt="Mastercard, Maestro, Visa and Klarna accepted" />
        </div>
        <button className="pill" type="button" disabled={!ok} onClick={() => { setOrder({ name: f.name, method: f.method, total: ex * (1 + VAT), ref: 'NS-' + Date.now().toString(36).toUpperCase().slice(-6) }); bag.clear() }}>Place order · {money(ex * (1 + VAT))} inc VAT</button>
        <p className="note">Demo checkout — nothing is charged. In the live store this step hands off to WooCommerce with the same fields.</p>
      </div>
      <h2 className="sr-only">Order summary</h2><aside className="summary">
        <h3>{bag.count} {bag.count === 1 ? 'item' : 'items'}</h3>
        {items.map(l => <div key={l.id} className="row"><span className="k">{l.qty} × {l.p.name}{l.p.cover ? <small> · {(l.qty * l.p.cover).toFixed(2)} m²</small> : l.p.unit === 'per slab' ? <small> · {(l.qty * l.p.slabM2).toFixed(2)} m²</small> : null}</span><span className="v">{money(lineUnitPrice(l.p) * l.qty)}</span></div>)}
        <div className="row"><span className="k">VAT at 20%</span><span className="v">{money(ex * VAT)}</span></div>
        <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * (1 + VAT))}</span></div>
      </aside>
    </div>
  )
}

function About() {
  return (
    <>
      <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap yard">
        <div>
          <p className="kicker">About</p><h1 className="pg">A yard, not a website with a warehouse somewhere.</h1>
          <p className="intro">Nitya Stones has supplied Indian sandstone, limestone and porcelain from 34 Mark Road, Hemel Hempstead since 2016 — wholesale to landscapers and builders, retail to anyone with a patio to lay. We buy from quarries and manufacturers we know, hold the stock ourselves and check every pallet in before it goes out.</p>
          <div className="stats"><div className="stat"><b>2016</b><span>Trading from Mark Road</span></div><div className="stat"><b>36</b><span>Ranges on the ground</span></div><div className="stat"><b>120 m²</b><span>Custom orders from</span></div></div>
        </div>
        <div className="yard-pics"><img src={IMG.yard} alt="The Nitya Stones showroom on Mark Road" /><img src={IMG.pallets} alt="Pallets in the yard" /></div>
      </div></section>
      <section className="chapter grey"><div className="wrap">
        <div className="narrow"><p className="kicker">How we buy</p><h2>Direct, held, checked.</h2><p className="intro">Sandstone hand-split in the quarry districts of Rajasthan. Limestone sawn and honed from Sinai and Kota. Porcelain pressed in Spain and Gujarat. Bought direct, landed at Mark Road, and looked at before it goes out.</p></div>
        <div className="media values">
          <div className="value"><h3>Wholesale and retail</h3><p>Landscapers on account and homeowners with one patio get the same stone at the same yard. There’s no trade-only counter.</p></div>
          <div className="value"><h3>Batch-matched</h3><p>Every pallet carries its batch number. Order for one patio and we pull from one batch where we can, and tell you honestly when we can’t.</p></div>
          <div className="value"><h3>No minimum to collect</h3><p>Three slabs for a repair or thirty pallets for a development — collection is free and any quantity.</p></div>
          <div className="value"><h3>Custom from 120 m²</h3><p>A size, colour or finish we don’t hold can be run for you at 120 m² and above. Allow eight weeks.</p></div>
        </div>
      </div></section>
      <section className="chapter" id="delivery"><div className="wrap">
        <div className="head-row"><div><p className="kicker">Sample, measure, pay, delivered</p><h2>How ordering works.</h2></div></div>
        <div className="bands" style={{ marginBottom: 26 }}>
          {DELIVERY.bands.map(b => <div key={b.key} className="band"><span>{b.name}</span><b>{money(b.perPallet)} per pallet</b><span>{b.note}{b.areas ? ' · ' + b.areas.slice(0, 6).join(', ') + (b.areas.length > 6 ? '…' : '') : ''}</span></div>)}
          <div className="band"><span>Collection</span><b>Free</b><span>34 Mark Road, HP2 7BW · no minimum</span></div>
        </div>
        <p className="note" style={{ marginBottom: 26 }}>Delivery figures are indicative, kerbside on a tail-lift, and confirmed by phone before you pay. Scotland, the far South West, islands and Northern Ireland are priced by the job.</p>
        <div className="steps">
          <div className="step"><span className="num">I</span><h3>Take a sample</h3><p>100×100 mm, £5, posted. Look at it wet and dry, in daylight, where it’s going.</p></div>
          <div className="step"><span className="num">II</span><h3>Measure the area</h3><p>Length × width, plus 10% for cuts. The calculator rounds it to whole packs.</p></div>
          <div className="step"><span className="num">III</span><h3>Pay</h3><p>Card or Klarna online, or ring {PHONE}. Delivery cost is confirmed before you pay.</p></div>
          <div className="step"><span className="num">IV</span><h3>Delivered or collected</h3><p>3–5 working days from payment, 8am–6pm, we call on the day. Or collect from HP2 7BW, free.</p></div>
        </div>
      </div></section>
      <section className="chapter"><div className="wrap">
        <div className="narrow"><p className="kicker">Drawn to scale · 10 mm joints</p><h2>How it lays out.</h2><p className="intro">The pack you buy decides the pattern you get. Mixed patio packs come as four sizes to be laid random; single sizes give you a bond.</p></div>
        <div className="media patterns">{PATTERNS.map(p => <Pattern key={p.title} p={p} />)}</div>
      </div></section>
    </>
  )
}

function Faq() {
  return <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap">
    <div className="narrow"><p className="kicker">Asked most often</p><h1 className="pg">Straight answers.</h1></div>
    <h2 className="sr-only">Questions</h2><div className="media faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
  </div></section>
}

function Contact() {
  const [f, setF] = useState({ name: '', phone: '', want: 'A quote for a patio', msg: '' })
  const [copied, setCopied] = useState('')
  const text = `NITYA STONES — ENQUIRY\n\nName:    ${f.name || '—'}\nPhone:   ${f.phone || '—'}\nEnquiry: ${f.want}\n\n${f.msg || '(what you need, area in m², postcode)'}`
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied('Copied — paste it into an email to info@nityastones.co.uk') } catch { setCopied('Select the text and copy it') } }
  return <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap contact-grid">
    <div><p className="kicker">Contact</p><h1 className="pg">Talk to the yard.</h1><p className="intro">Trade accounts, custom orders from 120 m², or a straight quote — ring, or write it here and send it over.</p>
      <div className="form">
        <div className="two"><div className="field"><label htmlFor="cName">Name</label><input id="cName" autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div><div className="field"><label htmlFor="cPhone">Phone</label><input id="cPhone" type="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div></div>
        <div className="field"><label htmlFor="cWant">What do you need</label><select id="cWant" value={f.want} onChange={e => setF({ ...f, want: e.target.value })}>{['A quote for a patio', 'Samples', 'Trade account / repeat supply', 'Custom order, 120 m²+', 'Checking stock for collection'].map(o => <option key={o}>{o}</option>)}</select></div>
        <div className="field"><label htmlFor="cMsg">Message</label><textarea id="cMsg" value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} placeholder="Range, area in m², postcode, when you need it" /></div>
        <div className="buy-actions"><button className="pill" type="button" onClick={copy}>Copy enquiry</button><a className="pill ghost" href={PHONE_HREF}>Call {PHONE}</a><span className="copied" role="status" aria-live="polite">{copied}</span></div>
      </div>
    </div>
    <div><p className="kicker">The yard</p><h2>Mark Road.</h2>
      <dl className="detail-list">
        <div className="detail"><dt className="k">Address</dt><dd className="v">{BUSINESS.address.map((l, i) => <span key={l}>{l}{i < BUSINESS.address.length - 1 && <br />}</span>)}<br /><a className="more" href={BUSINESS.maps} target="_blank" rel="noreferrer">Open in Google Maps</a></dd></div>
        <div className="detail"><dt className="k">Phone</dt><dd className="v"><a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a><br /><a href={BUSINESS.mobileHref}>{BUSINESS.mobile}</a> · <a href={BUSINESS.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a></dd></div>
        <div className="detail"><dt className="k">Email</dt><dd className="v"><a href={'mailto:' + BUSINESS.email}>{BUSINESS.email}</a></dd></div>
        {BUSINESS.hours.map(([d, h]) => <div className="detail" key={d}><dt className="k">{d}</dt><dd className="v">{h}</dd></div>)}
      </dl>
      <img className="payments" style={{ marginTop: 22 }} src={IMG.payments} alt="Mastercard, Maestro, Visa and Klarna accepted" />
    </div>
  </div></section>
}

/* ---------------- shell ---------------- */
const TITLES = { home: 'Nitya Stones — Sandstone, Limestone & Porcelain Paving, Hemel Hempstead', shop: 'Shop', collections: 'Collections', build: 'Build your patio', samples: 'Samples', cart: 'Your bag', checkout: 'Checkout', about: 'About the yard', faq: 'FAQ', contact: 'Contact', guides: 'Guides', projects: 'Projects', trade: 'Trade accounts', notfound: 'Page not found' }

function useTheme() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('nitya-theme') || 'dark' } catch { return 'dark' } })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0F0F10' : '#161616')
    try { localStorage.setItem('nitya-theme', theme) } catch { /* private mode */ }
  }, [theme])
  return [theme, () => setTheme(t => t === 'dark' ? 'light' : 'dark')]
}

function ThemeButton({ theme, toggle }) {
  return (
    <button className="theme-btn" type="button" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} aria-pressed={theme === 'dark'}>
      {theme === 'dark'
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}
      <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}

/* Offer pop-up: the biggest real saving on the site, from the store's own
 * was/now prices. Once a week per browser, after a pause or when the mouse
 * heads for the tab bar, never on the bag, checkout or builder. */
function OfferPopup({ route }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const offers = useMemo(() => PRODUCTS.filter(x => x.was && x.was > x.price).map(x => ({ x, pct: Math.round((1 - x.price / x.was) * 100) })).sort((a, b) => b.pct - a.pct), [])
  const quiet = ['checkout', 'cart', 'build', 'notfound'].includes(route.page)
  useEffect(() => {
    if (!offers.length || quiet) return
    let seen = 0; try { seen = +localStorage.getItem('nitya-offer') || 0 } catch { /* private mode */ }
    if (Date.now() - seen < 7 * 864e5) return
    let t = 0
    const show = () => { window.clearTimeout(t); document.removeEventListener('mouseleave', leave); try { localStorage.setItem('nitya-offer', String(Date.now())) } catch { /* private mode */ } setOpen(true) }
    const leave = (e) => { if (e.clientY <= 0) show() }
    t = window.setTimeout(show, 9000)
    document.addEventListener('mouseleave', leave)
    return () => { window.clearTimeout(t); document.removeEventListener('mouseleave', leave) }
  }, [quiet, offers.length])
  useEffect(() => { if (!open) return; ref.current?.focus(); const key = (e) => { if (e.key === 'Escape') setOpen(false) }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [open])
  if (!open || quiet || !offers.length) return null
  const top = offers[0]
  return createPortal(
    <div className="offer-pop" onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="offer-card" role="dialog" aria-modal="true" aria-labelledby="offerT" tabIndex={-1} ref={ref}>
        <img src={top.x.img} alt="" />
        <div className="offer-body">
          <p className="kicker">Offers on now</p>
          <h2 id="offerT">Up to {top.pct}% off, across {offers.length} ranges.</h2>
          <p>{top.x.name} is {money(top.x.price)} {top.x.unit} + VAT, down from {money(top.x.was)}. Sale prices as listed at the yard, no code needed.</p>
          <div className="buy-actions"><a className="pill" href={href('shop?cat=offers')} onClick={() => setOpen(false)}>See the offers</a><button className="more" type="button" onClick={() => setOpen(false)}>Not now</button></div>
        </div>
        <button className="offer-close" type="button" aria-label="Close" onClick={() => setOpen(false)}>×</button>
      </div>
    </div>, document.body)
}

export default function App() {
  const route = useRoute()
  useStructuredData()
  const bag = useBag()
  const [theme, toggleTheme] = useTheme()
  useEffect(() => {
    const t = route.page === 'product' ? (byId(route.id)?.name || TITLES.notfound) : route.page === 'guide' ? (guideBySlug(route.id)?.title || TITLES.notfound) : (TITLES[route.page] || TITLES.notfound)
    document.title = route.page === 'home' || !t ? TITLES.home : `${t} — Nitya Stones`
  }, [route])
  const [menu, setMenu] = useState(false)
  useEffect(() => { if (!menu) return; const key = (e) => { if (e.key === 'Escape') setMenu(false) }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [menu])
  const NAV = [['shop', 'Shop'], ['collections', 'Collections'], ['build', 'Build your patio'], ['projects', 'Projects'], ['guides', 'Guides'], ['trade', 'Trade'], ['contact', 'Contact']]
  const page = {
    home: <Home bag={bag} />, shop: <Shop key={route.q.toString()} route={route} />, product: <Product key={route.id} route={route} bag={bag} />, samples: <Samples bag={bag} />,
    cart: <Bag bag={bag} />, checkout: <Checkout bag={bag} />, about: <About />, faq: <Faq />, contact: <Contact />, collections: <Collections />, build: <Build bag={bag} />, guides: <Guides />, guide: <Guide key={route.id} route={route} />, projects: <Projects />, trade: <Trade />,
  }[route.page] || <div className="wrap empty"><h1 className="pg">Not found</h1><p style={{ marginTop: 12 }}>That page isn’t here. <a className="more" href={href('')}>Back to the start</a> or <a className="more" href={href('shop')}>shop the ranges</a>.</p></div>
  return (
    <>
      <header className="nav"><div className="wrap">
        <div className="nav-in">
          <a className="brand" href={href('')} aria-label="Nitya Stones, home"><Logo compact /></a>
          <nav className="links" aria-label="Primary">{NAV.map(([k, l]) => <a key={k} href={href(k)} className={route.page === k ? 'active' : ''}>{l}</a>)}</nav>
          <ThemeButton theme={theme} toggle={toggleTheme} />
          <a className="bag-btn" href={href('cart')}>Bag {bag.count > 0 && <b>{bag.count}</b>}</a>
          <button className="menu-btn" type="button" aria-expanded={menu} onClick={() => setMenu(m => !m)}>Menu</button>
        </div>
        <nav className={`drawer ${menu ? 'open' : ''}`} aria-label="Mobile">{NAV.map(([k, l]) => <a key={k} href={href(k)} onClick={() => setMenu(false)}>{l}</a>)}<a href={PHONE_HREF}>Call {PHONE}</a></nav>
      </div></header>
      <main>{page}</main>
      <OfferPopup route={route} />
      <footer><div className="wrap">
        <div className="foot">
          <div><Logo /><p style={{ marginTop: 14, maxWidth: '32ch' }}>Wholesale and retail suppliers of outdoor and indoor porcelain, sandstone, limestone and cladding. {BUSINESS.address.join(', ')}.</p></div>
          <div><h3 className="foot-h">Shop</h3>{CATS.map(([k, l]) => <a key={k} href={href('shop?cat=' + k)}>{l}</a>)}<a href={href('shop?cat=offers')}>Offers</a><a href={href('samples')}>Samples</a></div>
          <div><h3 className="foot-h">Help</h3><a href={href('trade')}>Trade accounts</a><a href={href('projects')}>Projects</a><a href={href('about')}>About the yard</a><a href={href('guides')}>Guides</a><a href={href('build')}>Build your patio</a><a href={href('collections')}>Collections</a><a href={href('faq')}>FAQ</a><a href={href('about')}>Ordering &amp; delivery</a><a href={href('about')}>Laying patterns</a><a href={href('contact')}>Contact</a></div>
          <div><h3 className="foot-h">The yard</h3><a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a><a href={BUSINESS.mobileHref}>{BUSINESS.mobile}</a><a href={'mailto:' + BUSINESS.email}>{BUSINESS.email}</a><a href={BUSINESS.maps} target="_blank" rel="noreferrer">{BUSINESS.address.join(', ')}</a><span style={{ display: 'block', paddingTop: 3 }}>{BUSINESS.hoursShort}</span>
            <div className="social">{BUSINESS.socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer">{n}</a>)}</div></div>
        </div>
        <div className="foot-bottom"><span>© Nitya Stones · Photography © Nitya Stones</span><img className="payments" src={IMG.payments} alt="Cards and Klarna accepted" /></div>
      </div></footer>
    </>
  )
}
