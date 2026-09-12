import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
const StoneScene = lazy(() => import('./StoneScene.jsx'))
import WetDry from './WetDry.jsx'
import { GUIDE_DIAGRAM } from './Diagrams.jsx'
import Logo from './Logo.jsx'
import { HeroSlides, Marquee, CountUp, useReveal, Parallax } from './Motion.jsx'
import { IMG, CATS, CAT_LABEL, PRODUCTS, byId, SAMPLE, SCENES, MIXED, PATTERNS, FAQ, REVIEWS, EDITIONS, SEASON, FAMILIES, FAMILY_COLOUR, DELIVERY, deliveryFor, SEARCH_TAGS, COLOUR_TAGS, money } from './data.js'
import { GUIDES, guideBySlug } from './guides.js'

const PHONE = '0330 236 9227'
const PHONE_HREF = 'tel:03302369227'
const VAT = 0.2

/* ---------------- tiny hash router ---------------- */
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
  const count = lines.reduce((n, l) => n + l.qty, 0)
  return { lines, add, set, clear, count }
}
const lineProduct = (id) => id.startsWith('sample:') ? { ...SAMPLE, id, name: `Sample — ${byId(id.slice(7))?.name || ''}`, img: byId(id.slice(7))?.img } : byId(id)
const lineUnitPrice = (p) => p.unit === 'per m²' && p.cover ? p.price * p.cover : p.price
const packWord = (p) => (p.cat === 'outdoor' || p.unit === 'per pallet') ? 'pallet' : 'pack'
const lineUnitLabel = (p) => p.unit === 'per m²' ? (p.cover ? `${packWord(p)} of ${p.cover.toFixed(2)} m²` : 'per m²') : p.unit === 'per pallet' ? 'pallet' : p.unit === 'per kit' ? 'kit' : 'each'

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
function ProductCard({ p }) {
  return (
    <a className="product" href={href('product/' + p.id)} style={{ '--fc': FAMILY_COLOUR[p.cat].c, '--tc': p.tag === 'Splits' ? 'var(--green)' : p.tag === 'Pallet deal' ? 'var(--rust)' : 'var(--gold-2)' }}>
      <img src={p.img} alt={p.name} loading="lazy" />
      <div className="product-body">
        {p.tag && <span className="tag">{p.tag}</span>}
        <span className="fam">{CAT_LABEL[p.cat]}</span>
        <h3>{p.name}</h3>
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
function Calculator({ initial = 'autumn-brown', bag, compact = false }) {
  const [pid, setPid] = useState(initial)
  const [len, setLen] = useState('6'), [wid, setWid] = useState('4'), [waste, setWaste] = useState('10')
  const p = byId(pid)
  const num = (v, d) => { const n = parseFloat(v); return isFinite(n) && n >= 0 ? n : d }
  const net = num(len, 0) * num(wid, 0), pct = Math.min(num(waste, 10), 40), gross = net * (1 + pct / 100)
  const packs = p.cover ? Math.ceil(gross / p.cover) : null
  const chargeable = p.unit === 'per m²' ? (p.cover ? packs * p.cover : gross) : (packs || 1)
  const ex = p.unit === 'per m²' ? chargeable * p.price : (packs || 1) * p.price
  return (
    <div className="calc"><div className="calc-grid">
      <div className="calc-in">
        {!compact && <div className="field"><label htmlFor="calcRange">Range</label>
          <select id="calcRange" value={pid} onChange={e => setPid(e.target.value)}>
            {PRODUCTS.filter(x => x.unit !== 'per kit').map(x => <option key={x.id} value={x.id}>{x.name} — {CAT_LABEL[x.cat]}</option>)}
          </select></div>}
        <div className="two">
          <div className="field"><label htmlFor="calcLen">Length (m)</label><input id="calcLen" type="number" min="0" step="0.1" value={len} onChange={e => setLen(e.target.value)} /></div>
          <div className="field"><label htmlFor="calcWid">Width (m)</label><input id="calcWid" type="number" min="0" step="0.1" value={wid} onChange={e => setWid(e.target.value)} /></div>
        </div>
        <div className="field"><label htmlFor="calcWaste">Allowance for cuts (%)</label><input id="calcWaste" type="number" min="0" max="40" step="1" value={waste} onChange={e => setWaste(e.target.value)} /></div>
        <p className="note">10% covers a straight patio. Raise it for circles, diagonals or lots of edges. Delivery is quoted on quantity and postcode; collection from HP2 7BW is free.</p>
      </div>
      <div className="calc-out">
        <div className="row"><span className="k">Area</span><span className="v">{net.toFixed(2)} m²</span></div>
        <div className="row"><span className="k">With {pct}% for cuts</span><span className="v">{gross.toFixed(2)} m²</span></div>
        {packs
          ? <div className="row"><span className="k">{p.unit === 'per pallet' ? 'Pallets' : 'Packs'}</span><span className="v">{packs} × {p.cover.toFixed(2)} m² = {(packs * p.cover).toFixed(2)} m²</span></div>
          : <div className="row"><span className="k">Supplied</span><span className="v">{gross.toFixed(2)} m², by the m²</span></div>}
        <div className="row"><span className="k">{p.name}, ex VAT</span><span className="v">{money(ex)}</span></div>
        <div className="row"><span className="k">VAT at 20%</span><span className="v">{money(ex * VAT)}</span></div>
        <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * (1 + VAT))}</span></div>
        {bag && <div className="buy-actions" style={{ marginTop: 8 }}>
          <button className="pill" type="button" onClick={() => { bag.add(p.id, packs || Math.ceil(gross)); go('cart') }}>Add {packs || Math.ceil(gross)} {packs ? (p.unit === 'per pallet' ? 'pallets' : 'packs') : 'm²'} to bag</button>
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
          : !r ? <>That doesn't look like a UK postcode yet.</>
          : r.ask ? <>We deliver there but price it by the job — <b>ring {PHONE}</b> for a quote, or collect free.</>
          : <>Indicative delivery to <b>{pc.toUpperCase()}</b> ({r.band.name}): <b>{money(r.band.perPallet)} per pallet</b>{pallets > 1 ? <> · {pallets} pallets ≈ <b>{money(r.band.perPallet * pallets)}</b></> : null}. Confirmed by phone before you pay. Collection from HP2 7BW is free.</>}
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
      <form onSubmit={e => { e.preventDefault(); if (email.includes('@')) { setOk('You\'re on the list. First email when the next pallets land.'); setEmail('') } }}>
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
  const pic = { sandstone: byId('raj-green').gallery || byId('raj-green').img, limestone: byId('black-limestone').img, outdoor: byId('bodo-white').gallery || byId('bodo-white').img, cladding: byId('cladding').img }
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
          <div className="trust"><span><b>Since 2016</b> · Mark Road, Hemel Hempstead</span><span className="dot">·</span><span><b>36 stones</b> on the ground</span><span className="dot">·</span><span><b>3–4 working days</b> to your drive</span></div>
          <h1>Natural stone, sourced direct.<span>Hand-picked from the quarries we buy from, held at our own yard, priced straight. Every garden in these pictures left Mark Road on a pallet.</span></h1>
          <div className="actions">
            <a className="pill" href={href('shop')}>Shop this season's palette</a>
            <a className="pill ghost" href={href('build')}>Build your patio</a>
          </div>
        </div></div>
        <div className="scroll-cue" aria-hidden="true" />
      </section>
      <div className="hero-strip">
        <div><b><CountUp to={2016} plain /></b>Trading from the same Hemel Hempstead yard.</div>
        <div><b><CountUp to={36} /></b>Ranges in stock — sandstone, limestone, porcelain, cladding.</div>
        <div><b>3–4 days</b>Working days from cleared payment. We call on the day.</div>
        <div><b>£0 minimum</b>Collect from HP2 7BW, any quantity. Price match on all of it.</div>
      </div>

      <section className="slab-moment" data-reveal>
        <div className="wrap narrow"><p className="kicker">Turn it over</p><h2>Riven, hand-split, 22 mm.</h2><p className="intro">Drag the slab. This is Raj Green from the yard, cleft along its bedding so no two faces match.</p></div>
        <div className="wrap"><Suspense fallback={<div className="hero-3d" aria-hidden="true" />}><StoneScene /></Suspense><div className="hero-static"><img src={byId('raj-green').img} alt="Raj Green riven sandstone slab" /></div><p className="slab-hint">Drag to rotate</p></div>
      </section>

      <section className="chapter" style={{ paddingBottom: 0 }} data-reveal><div className="wrap">
        <div className="head-row"><div><p className="kicker">On the ground now</p><h2>Thirty-six stones, passing by.</h2></div><a className="more" href={href('shop')}>Shop all</a></div>
      </div>
        <Marquee items={PRODUCTS.slice(0, 18).map(p => ({ img: p.img, name: p.name, href: href('product/' + p.id) }))} speed={70} />
        <Marquee items={PRODUCTS.slice(18).map(p => ({ img: p.img, name: p.name, href: href('product/' + p.id) }))} speed={80} reverse />
      </section>

      <section className="chapter editions" data-reveal><div className="wrap">
        <div className="narrow"><p className="kicker">The collections</p><h2>Three editions. One yard.</h2><p className="intro">Every stone we hold, arranged by what it's for rather than what it's called. Same shop prices — the editions are the curation.</p></div>
        <div className="media"><Editions /></div>
      </div></section>

      <section className="chapter sand" data-reveal><div className="wrap">
        <div className="head-row"><div><p className="kicker">This season</p><h2>{SEASON.title}.</h2><p className="intro">Four stones that suit the light this time of year: the warm sandstones that come up richer wet, and the dark ones that hide leaf litter.</p></div><a className="more" href={href('shop')}>All 36 stones</a></div>
        <div className="grid">{season.map(p => <ProductCard key={p.id} p={p} />)}</div>
      </div></section>

      <section className="chapter" data-reveal><div className="wrap builder-teaser">
        <div className="narrow"><p className="kicker">Build your patio</p><h2>Pick the stone. Draw the area. Get the packs.</h2><p className="intro">Choose from the 36 stones on the ground, put in your dimensions, pick a laying pattern, and it works out the whole packs, the price and a saved design you can come back to or reorder from.</p>
          <div className="actions"><a className="pill accent" href={href('build')}>Start building</a><a className="more" href={href('samples')}>Or order £5 samples first</a></div></div>
      </div></section>

      <section className="chapter sage" data-reveal><div className="wrap">
        <div className="narrow"><p className="kicker">Stone families</p><h2>Know what you're laying.</h2><p className="intro">Four materials, four geologies, four ways of behaving in a Hertfordshire winter.</p></div>
        <div className="media"><Atlas /></div>
      </div></section>

      <section className="chapter" data-reveal><div className="wrap">
        <div className="narrow"><p className="kicker">Customers' gardens</p><h2>Laid, not stacked.</h2><p className="intro">Every one of these left Mark Road on a pallet. Tap a garden to shop the stone in it.</p></div>
        <div className="media scenes">
          {SCENES.map(s => <a key={s.title} className="scene" href={href('product/' + s.product)}><img src={s.img} alt={s.title} loading="lazy" /><figcaption><b>{s.title}</b><span>{s.sub}</span></figcaption></a>)}
        </div>
      </div></section>

      <section className="chapter grey" data-reveal><div className="wrap yard">
        <Parallax amount={0.08}><div className="yard-pics"><img src={IMG.yard} alt="The Nitya Stones showroom on Mark Road" loading="lazy" /><img src={IMG.pallets} alt="Pallets of paving in the Nitya Stones yard" loading="lazy" /></div></Parallax>
        <div>
          <p className="kicker">Sourcing</p>
          <h2>From the quarry to Mark Road.</h2>
          <p className="intro">We opened the yard in 2016 to sell the stone we'd buy ourselves. Sandstone comes hand-split from the quarry districts of Rajasthan, limestone sawn and honed from Sinai, porcelain pressed in Spain and Gujarat. It's bought direct, held on our own ground, and checked in before it goes out — if it isn't right, it doesn't leave.</p>
          <div className="stats"><div className="stat"><b><CountUp to={2016} plain /></b><span>Same yard, same people</span></div><div className="stat"><b><CountUp to={36} /></b><span>Stones in stock today</span></div><div className="stat"><b><CountUp to={120} suffix=" m²" /></b><span>Custom finishes from</span></div></div>
          <div className="actions" style={{ justifyContent: 'flex-start' }}><a className="more" href={href('about')}>About the yard</a></div>
        </div>
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
      <div className="narrow"><p className="kicker">Guides</p><h2>Know before you lay.</h2><p className="intro">What we tell customers across the counter, written down. Choosing, laying, sealing, cleaning and what happens on delivery day.</p></div>
      <div className="media guides">{GUIDES.map(g => <GuideCard key={g.slug} g={g} />)}</div>
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
          <div className="guides">{others.map(x => <GuideCard key={x.slug} g={x} />)}</div>
        </div>
      </article>
    </div>
  )
}

function Collections() {
  return (
    <>
      <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)', paddingBottom: 0 }}><div className="wrap narrow"><p className="kicker">Collections</p><h2>Three editions.</h2><p className="intro">Every stone we hold, arranged by what it's for. Same shop prices — the editions are the curation, not a different price list.</p></div></section>
      {EDITIONS.map((ed, i) => (
        <section key={ed.num} id={ed.num.split(' ')[1]} className={`chapter ${i % 2 ? 'grey' : ''}`}><div className="wrap">
          <div className="head-row"><div><p className="kicker">{ed.num}{ed.featured ? ' · Most laid' : ''}</p><h2>{ed.name}.</h2><p className="intro">{ed.why}</p></div><span className="from" style={{ color: 'var(--ink-3)' }}>from <b style={{ fontFamily: 'Cinzel,serif', fontSize: '1.4rem', color: 'var(--ink)' }}>{money(ed.from)}</b> /m² + VAT</span></div>
          <div className="grid">{ed.ids.map(byId).map(p => <ProductCard key={p.id} p={p} />)}</div>
        </div></section>
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
  const num = (v, d) => { const n = parseFloat(v); return isFinite(n) && n >= 0 ? n : d }
  const net = num(len, 0) * num(wid, 0), pct = Math.min(num(waste, 10), 40), gross = net * (1 + pct / 100)
  const packs = p.cover ? Math.ceil(gross / p.cover) : Math.ceil(gross)
  const ex = p.unit === 'per m²' ? (p.cover ? packs * p.cover : gross) * p.price : packs * p.price
  const patterns = p.size.includes('Mixed') ? [PATTERNS[0]] : p.cat === 'cladding' ? [PATTERNS[3]] : p.size.includes('600 × 600') ? [PATTERNS[2], PATTERNS[1]] : [PATTERNS[1], PATTERNS[2]]
  const pattern = patterns[Math.min(pat, patterns.length - 1)]
  const persist = (list) => { setSaved(list); try { localStorage.setItem('nitya-designs', JSON.stringify(list)) } catch { /* private mode */ } }
  const save = () => { const d = { id: Date.now(), pid, len, wid, waste, pattern: pattern.title, packs, ex }; persist([d, ...saved].slice(0, 8)); setMsg('Design saved — it\'s on this device to come back to or reorder from.') }
  const load = (d) => { setPid(d.pid); setLen(d.len); setWid(d.wid); setWaste(d.waste); setPat(0); window.scrollTo({ top: 0 }) }
  const byFamily = CATS.map(([k, l]) => [l, PRODUCTS.filter(x => x.cat === k && x.unit !== 'per kit')])
  return (
    <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap">
      <div className="head-row"><div><p className="kicker">Build your patio</p><h2>Pick the stone. Draw the area. Get the packs.</h2><p className="intro">36 stones on the ground. Choose one, put in the dimensions, pick how it lays, and the design on the right is what leaves the yard.</p></div></div>
      <div className="builder">
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
            {saved.map(d => { const x = byId(d.pid); return <div key={d.id} className="saved-row"><img src={x.img} alt="" /><div><b>{x.name}</b><small>{d.len} × {d.wid} m · {d.pattern} · {d.packs} {x.unit === 'per pallet' ? 'pallets' : x.cover ? 'packs' : 'm²'} · {money(d.ex * (1 + VAT))} inc VAT</small></div><div style={{ display: 'flex', gap: 8 }}><button className="more" type="button" onClick={() => load(d)}>Open</button><button className="remove" type="button" onClick={() => persist(saved.filter(s => s.id !== d.id))}>Remove</button></div></div> })}
          </div>}
        </div>
        <aside className="design">
          <h3>Your design</h3>
          <img src={p.img} alt={p.name} />
          <div className="row"><span className="k">Stone</span><span className="v">{p.name}</span></div>
          <div className="row"><span className="k">Area</span><span className="v">{net.toFixed(2)} m² · +{pct}% = {gross.toFixed(2)} m²</span></div>
          <div className="row"><span className="k">Lay</span><span className="v">{pattern.title}</span></div>
          <div className="row"><span className="k">{p.unit === 'per pallet' ? 'Pallets' : p.cover ? 'Packs' : 'Supplied'}</span><span className="v">{p.cover ? `${packs} × ${p.cover.toFixed(2)} m²` : `${gross.toFixed(2)} m²`}</span></div>
          <div className="row"><span className="k">Stone, ex VAT</span><span className="v">{money(ex)}</span></div>
          <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * (1 + VAT))}</span></div>
          <button className="pill" type="button" onClick={() => { bag.add(p.id, packs); go('cart') }}>Add to bag</button>
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
  let list = PRODUCTS.filter(p => cat === 'all' || p.cat === cat)
  if (q.trim()) { const words = q.trim().toLowerCase().split(/\s+/); list = list.filter(p => { const hay = (p.name + ' ' + CAT_LABEL[p.cat] + ' ' + SEARCH_TAGS[p.cat] + ' ' + (COLOUR_TAGS[p.id] || '') + ' ' + p.size + ' ' + p.thick + ' ' + p.finish + ' ' + p.origin + ' ' + p.blurb).toLowerCase(); return words.every(w => hay.includes(w)) }) }
  if (sort === 'low') list = [...list].sort((a, b) => (a.unit === 'per m²' ? a.price : a.price / (a.cover || 1)) - (b.unit === 'per m²' ? b.price : b.price / (b.cover || 1)))
  if (sort === 'high') list = [...list].sort((a, b) => (b.unit === 'per m²' ? b.price : b.price / (b.cover || 1)) - (a.unit === 'per m²' ? a.price : a.price / (a.cover || 1)))
  if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  const current = CATS.find(c => c[0] === cat)
  return (
    <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap">
      <div className="head-row"><div><p className="kicker">Shop</p><h2>{current ? current[1] : 'Every range'}</h2><p className="intro">{current ? current[2] : 'Prices per m² ex VAT, as sold at the yard. Every image is our own stock.'}</p></div></div>
      <div className="toolbar">
        <div className="seg" role="group" aria-label="Category">
          <button type="button" aria-pressed={cat === 'all'} onClick={() => go('shop')}>All</button>
          {CATS.map(([k, l]) => <button key={k} type="button" aria-pressed={cat === k} onClick={() => go('shop?cat=' + k)}>{l}</button>)}
        </div>
        <div className="search">
          <input id="shopSearch" type="search" placeholder="Search ranges" value={q} onChange={e => setQ(e.target.value)} aria-label="Search ranges" />
          <select id="shopSort" className="select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort">
            <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="az">A – Z</option>
          </select>
        </div>
      </div>
      <p className="count" style={{ marginBottom: 16 }}>{list.length} {list.length === 1 ? 'product' : 'products'}</p>
      <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </div></section>
  )
}

function Product({ route, bag }) {
  const p = byId(route.id)
  const [img, setImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState('')
  if (!p) return <div className="wrap empty"><h2>Not found</h2><p style={{ marginTop: 12 }}><a className="more" href={href('shop')}>Back to the shop</a></p></div>
  const pics = [p.img, p.gallery].filter(Boolean)
  const unitPrice = lineUnitPrice(p)
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4)
  const addToBag = () => { bag.add(p.id, qty); setAdded(`Added ${qty} × ${lineUnitLabel(p)} to your bag`) }
  return (
    <>
      <div className="wrap pdp">
        <div className="gallery">
          <div className="main"><img src={pics[img]} alt={p.name} /></div>
          {(p.cat === 'sandstone' || p.cat === 'limestone') && p.unit !== 'per kit' && <div><WetDry dry={p.img} wet={p.wet} name={p.name} /><p className="wetdry-note">Drag to compare. {p.wet ? 'Both photos are the same slab, hosed and dry.' : 'The wet side is simulated from the dry photo until we\'ve shot the slab hosed — natural stone comes up darker and richer than any screen shows.'}</p></div>}
          {pics.length > 1 && <div className="thumbs">{pics.map((src, i) => <button key={i} type="button" aria-pressed={img === i} aria-label={i === 0 ? `${p.name} studio render` : `${p.name} in a customer's garden`} onClick={() => setImg(i)}><img src={src} alt="" /></button>)}</div>}
        </div>
        <div>
          <nav className="crumbs" aria-label="Breadcrumb"><a href={href('shop')}>Shop</a><span>/</span><a href={href('shop?cat=' + p.cat)}>{CAT_LABEL[p.cat]}</a><span>/</span><span>{p.name}</span></nav>
          {p.tag && <span className="tag">{p.tag}</span>}
          <h1>{p.name}</h1>
          <p className="origin">{p.origin} · {p.size} · {p.thick}</p>
          <Price p={p} big />
          <p className="blurb">{p.blurb}</p>
          <dl className="spec-table">
            <div><dt>Size</dt><dd>{p.size}</dd></div>
            <div><dt>Thickness</dt><dd>{p.thick}</dd></div>
            <div><dt>Finish</dt><dd>{p.finish}</dd></div>
            <div><dt>Sold as</dt><dd>{p.pack}</dd></div>
            <div><dt>Delivery</dt><dd>3–4 working days, quoted by postcode · free collection from HP2 7BW</dd></div>
            <div><dt>Split packs</dt><dd>{p.tag === 'Splits' || (p.cat === 'outdoor' && p.thick === '20 mm') ? 'Yes' : 'No — sold as a full ' + (p.unit === 'per pallet' ? 'pallet' : 'pack')}</dd></div>
          </dl>
          <div className="buy">
            <div className="row"><span>{p.unit === 'per m²' && p.cover ? `Pack of ${p.cover.toFixed(2)} m²` : p.unit === 'per m²' ? 'Per m²' : p.unit === 'per pallet' ? `Pallet of ${p.cover.toFixed(2)} m²` : 'Complete kit'}</span><b>{money(unitPrice)} + VAT</b></div>
            <div className="buy-actions">
              <div className="qty" role="group" aria-label="Quantity"><button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Fewer">−</button><output aria-live="polite">{qty}</output><button type="button" onClick={() => setQty(q => q + 1)} aria-label="More">+</button></div>
              <button className="pill" type="button" onClick={addToBag}>Add to bag · {money(unitPrice * qty * (1 + VAT))} inc VAT</button>
            </div>
            <DeliveryEstimate />
            <div className="buy-actions">
              <button className="more" type="button" onClick={() => { bag.add('sample:' + p.id, 1); setAdded('Sample added to your bag — £5') }}>Order a 100×100 mm sample · £5</button>
              <span className="added" role="status" aria-live="polite">{added}</span>
            </div>
          </div>
        </div>
      </div>
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
      <div className="narrow"><p className="kicker">Samples · £5 each</p><h2>Look before you lay.</h2><p className="intro">100×100 mm pieces of the real stone, posted out or collected from the counter. Put one where the patio's going, look at it wet and dry, then order the pallets.</p><p className="added" style={{ marginTop: 14 }} role="status" aria-live="polite">{added}</p></div>
      <div className="media grid">
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
  if (!items.length) return <div className="wrap empty"><h2>Your bag is empty.</h2><p style={{ marginTop: 12 }}><a className="more" href={href('shop')}>Shop the ranges</a></p></div>
  return (
    <div className="wrap bag">
      <div>
        <p className="kicker">Your bag</p><h2 style={{ marginBottom: 24 }}>{bag.count} {bag.count === 1 ? 'item' : 'items'}</h2>
        <div className="lines">
          {items.map(l => (
            <div key={l.id} className="line">
              <img src={l.p.img} alt="" />
              <div><div className="name">{l.p.name}</div><div className="meta">{lineUnitLabel(l.p)} · {money(lineUnitPrice(l.p))} + VAT{l.p.cover ? <> · <b>{l.qty} {packWord(l.p)}{l.qty === 1 ? '' : 's'} = {(l.qty * l.p.cover).toFixed(2)} m²</b></> : null}</div>
                <div className="qty" style={{ marginTop: 10 }}><button type="button" onClick={() => bag.set(l.id, l.qty - 1)} aria-label="Fewer">−</button><output>{l.qty}</output><button type="button" onClick={() => bag.set(l.id, l.qty + 1)} aria-label="More">+</button></div></div>
              <div className="right"><span className="sum">{money(lineUnitPrice(l.p) * l.qty)}</span><button className="remove" type="button" onClick={() => bag.set(l.id, 0)}>Remove</button></div>
            </div>
          ))}
        </div>
      </div>
      <aside className="summary">
        <h3>Summary</h3>
        <div className="row"><span className="k">Goods, ex VAT</span><span className="v">{money(ex)}</span></div>
        <div className="row"><span className="k">VAT at 20%</span><span className="v">{money(ex * VAT)}</span></div>
        <div className="row"><span className="k">Delivery</span><span className="v">{items.reduce((n, l) => n + (l.p.cover ? l.qty : 0), 0) || 0} {items.reduce((n, l) => n + (l.p.cover ? l.qty : 0), 0) === 1 ? 'pallet' : 'pallets'} · see below</span></div>
        <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * (1 + VAT))}</span></div>
        <DeliveryEstimate pallets={items.reduce((n, l) => n + (l.p.cover ? l.qty : 0), 0) || 1} compact />
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
  if (order) return <div className="wrap done"><p className="kicker">Order received</p><h2>Thank you, {order.name.split(' ')[0]}.</h2><p className="intro">{order.method === 'collection' ? 'We\'ll ring when it\'s ready to collect from Mark Road — usually the same day.' : 'We\'ll confirm the delivery cost by phone before anything is charged, then it\'s 3–4 working days.'}</p><p className="num">Order {order.ref} · {money(order.total)} inc VAT{order.method === 'delivery' ? ' + delivery' : ''}</p><p className="note" style={{ marginTop: 22 }}>Demo checkout — no payment has been taken. The live store connects this to WooCommerce.</p><div className="actions"><a className="pill ghost" href={href('shop')}>Back to the shop</a></div></div>
  if (!items.length) return <div className="wrap empty"><h2>Nothing to check out.</h2><p style={{ marginTop: 12 }}><a className="more" href={href('shop')}>Shop the ranges</a></p></div>
  return (
    <div className="wrap checkout">
      <div style={{ display: 'grid', gap: 18 }}>
        <p className="kicker">Checkout</p>
        <div className="panel"><h3>Contact</h3>
          <div className="two"><div className="field"><label htmlFor="coName">Name</label><input id="coName" autoComplete="name" value={f.name} onChange={set('name')} /></div><div className="field"><label htmlFor="coPhone">Phone</label><input id="coPhone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} /></div></div>
          <div className="field"><label htmlFor="coEmail">Email</label><input id="coEmail" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
        </div>
        <div className="panel"><h3>Delivery or collection</h3>
          <div className="choice">
            <label><input type="radio" name="method" checked={f.method === 'delivery'} onChange={() => setF({ ...f, method: 'delivery' })} /><div><b>Deliver it</b><span>3–4 working days from payment, 8am–6pm, we call on the day. Cost confirmed by phone before you're charged.</span></div></label>
            <label><input type="radio" name="method" checked={f.method === 'collection'} onChange={() => setF({ ...f, method: 'collection' })} /><div><b>Collect from Mark Road</b><span>Free, no minimum. 34 Mark Road, Hemel Hempstead HP2 7BW. Mon–Fri 8–6, Sat 8–1.</span></div></label>
          </div>
          {f.method === 'delivery' && <>
            <div className="field"><label htmlFor="coLine1">Address</label><input id="coLine1" autoComplete="address-line1" value={f.line1} onChange={set('line1')} /></div>
            <div className="two"><div className="field"><label htmlFor="coTown">Town</label><input id="coTown" autoComplete="address-level2" value={f.town} onChange={set('town')} /></div><div className="field"><label htmlFor="coPost">Postcode</label><input id="coPost" autoComplete="postal-code" value={f.postcode} onChange={set('postcode')} /></div></div>
            {f.postcode && (() => { const r = deliveryFor(f.postcode); const pallets = items.reduce((n, l) => n + (l.p.cover ? l.qty : 0), 0) || 1; return <p className="deliv-out">{!r ? 'Check the postcode.' : r.ask ? <>Priced by the job for this postcode — we'll ring you with the cost.</> : <>Indicative: <b>{money(r.band.perPallet)} per pallet</b> × {pallets} = <b>{money(r.band.perPallet * pallets)}</b> ({r.band.name}). Confirmed by phone before payment.</>}</p> })()}
            <div className="field"><label htmlFor="coNotes">Access notes</label><input id="coNotes" placeholder="Narrow drive, no kerb, leave on the lawn…" value={f.notes} onChange={set('notes')} /></div>
          </>}
        </div>
        <div className="panel"><h3>Payment</h3>
          <div className="choice">
            <label><input type="radio" name="pay" checked={f.pay === 'card'} onChange={() => setF({ ...f, pay: 'card' })} /><div><b>Card</b><span>Visa, Mastercard, Maestro, Visa Electron.</span></div></label>
            <label><input type="radio" name="pay" checked={f.pay === 'klarna'} onChange={() => setF({ ...f, pay: 'klarna' })} /><div><b>Klarna</b><span>Pay in 3, interest free.</span></div></label>
            <label><input type="radio" name="pay" checked={f.pay === 'phone'} onChange={() => setF({ ...f, pay: 'phone' })} /><div><b>Pay by phone</b><span>We'll ring you on {PHONE} to take payment and confirm delivery.</span></div></label>
          </div>
          <img className="payments" src={IMG.payments} alt="Mastercard, Maestro, Visa, Visa Electron and Klarna accepted" />
        </div>
        <button className="pill" type="button" disabled={!ok} onClick={() => { setOrder({ name: f.name, method: f.method, total: ex * (1 + VAT), ref: 'NS-' + Date.now().toString(36).toUpperCase().slice(-6) }); bag.clear() }}>Place order · {money(ex * (1 + VAT))} inc VAT</button>
        <p className="note">Demo checkout — nothing is charged. In the live store this step hands off to WooCommerce with the same fields.</p>
      </div>
      <aside className="summary">
        <h3>{bag.count} {bag.count === 1 ? 'item' : 'items'}</h3>
        {items.map(l => <div key={l.id} className="row"><span className="k">{l.qty} × {l.p.name}</span><span className="v">{money(lineUnitPrice(l.p) * l.qty)}</span></div>)}
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
          <p className="kicker">About</p><h2>A yard, not a website with a warehouse somewhere.</h2>
          <p className="intro">Nitya Stones has supplied Indian sandstone, limestone and porcelain from 34 Mark Road, Hemel Hempstead since 2016 — wholesale to landscapers and builders, retail to anyone with a patio to lay. We buy from quarries and manufacturers we know, hold the stock ourselves and check every pallet in before it goes out.</p>
          <div className="stats"><div className="stat"><b>2016</b><span>Trading from Mark Road</span></div><div className="stat"><b>36</b><span>Ranges on the ground</span></div><div className="stat"><b>120 m²</b><span>Custom orders from</span></div></div>
        </div>
        <div className="yard-pics"><img src={IMG.yard} alt="The Nitya Stones showroom on Mark Road" /><img src={IMG.pallets} alt="Pallets in the yard" /></div>
      </div></section>
      <section className="chapter grey"><div className="wrap">
        <div className="head-row"><div><p className="kicker">Sample, measure, pay, delivered</p><h2>How ordering works.</h2></div></div>
        <div className="bands" style={{ marginBottom: 26 }}>
          {DELIVERY.bands.map(b => <div key={b.key} className="band"><span>{b.name}</span><b>{money(b.perPallet)} per pallet</b><span>{b.note}{b.areas ? ' · ' + b.areas.slice(0, 6).join(', ') + (b.areas.length > 6 ? '…' : '') : ''}</span></div>)}
          <div className="band"><span>Collection</span><b>Free</b><span>34 Mark Road, HP2 7BW · no minimum</span></div>
        </div>
        <p className="note" style={{ marginBottom: 26 }}>Delivery figures are indicative, kerbside on a tail-lift, and confirmed by phone before you pay. Scotland, the far South West, islands and Northern Ireland are priced by the job.</p>
        <div className="steps">
          <div className="step"><span className="num">I</span><h3>Take a sample</h3><p>100×100 mm, £5, posted. Look at it wet and dry, in daylight, where it's going.</p></div>
          <div className="step"><span className="num">II</span><h3>Measure the area</h3><p>Length × width, plus 10% for cuts. The calculator rounds it to whole packs.</p></div>
          <div className="step"><span className="num">III</span><h3>Pay</h3><p>Card or Klarna online, or ring {PHONE}. Delivery cost is confirmed before you pay.</p></div>
          <div className="step"><span className="num">IV</span><h3>Delivered or collected</h3><p>3–4 working days from payment, 8am–6pm, we call on the day. Or collect from HP2 7BW, free.</p></div>
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
    <div className="narrow"><p className="kicker">Asked most often</p><h2>Straight answers.</h2></div>
    <div className="media faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
  </div></section>
}

function Contact() {
  const [f, setF] = useState({ name: '', phone: '', want: 'A quote for a patio', msg: '' })
  const [copied, setCopied] = useState('')
  const text = `NITYA STONES — ENQUIRY\n\nName:    ${f.name || '—'}\nPhone:   ${f.phone || '—'}\nEnquiry: ${f.want}\n\n${f.msg || '(what you need, area in m², postcode)'}`
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied('Copied — paste it into an email to info@nityastones.co.uk') } catch { setCopied('Select the text and copy it') } }
  return <section className="chapter" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}><div className="wrap contact-grid">
    <div><p className="kicker">Contact</p><h2>Talk to the yard.</h2><p className="intro">Trade accounts, custom orders from 120 m², or a straight quote — ring, or write it here and send it over.</p>
      <div className="form">
        <div className="two"><div className="field"><label htmlFor="cName">Name</label><input id="cName" autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div><div className="field"><label htmlFor="cPhone">Phone</label><input id="cPhone" type="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div></div>
        <div className="field"><label htmlFor="cWant">What do you need</label><select id="cWant" value={f.want} onChange={e => setF({ ...f, want: e.target.value })}>{['A quote for a patio', 'Samples', 'Trade account / repeat supply', 'Custom order, 120 m²+', 'Checking stock for collection'].map(o => <option key={o}>{o}</option>)}</select></div>
        <div className="field"><label htmlFor="cMsg">Message</label><textarea id="cMsg" value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} placeholder="Range, area in m², postcode, when you need it" /></div>
        <div className="buy-actions"><button className="pill" type="button" onClick={copy}>Copy enquiry</button><a className="pill ghost" href={PHONE_HREF}>Call {PHONE}</a><span className="copied" role="status" aria-live="polite">{copied}</span></div>
      </div>
    </div>
    <div><p className="kicker">The yard</p><h2>Mark Road.</h2>
      <dl className="detail-list">
        <div className="detail"><dt className="k">Address</dt><dd className="v">34 Mark Road<br />Hemel Hempstead<br />HP2 7BW</dd></div>
        <div className="detail"><dt className="k">Phone</dt><dd className="v"><a href={PHONE_HREF}>{PHONE}</a><br /><a href="tel:07932009870">07932 009870</a></dd></div>
        <div className="detail"><dt className="k">Email</dt><dd className="v"><a href="mailto:info@nityastones.co.uk">info@nityastones.co.uk</a></dd></div>
        <div className="detail"><dt className="k">Mon–Fri</dt><dd className="v">08:00 – 18:00</dd></div>
        <div className="detail"><dt className="k">Saturday</dt><dd className="v">08:00 – 13:00</dd></div>
        <div className="detail"><dt className="k">Sunday</dt><dd className="v">Closed</dd></div>
      </dl>
      <img className="payments" style={{ marginTop: 22 }} src={IMG.payments} alt="Mastercard, Maestro, Visa, Visa Electron and Klarna accepted" />
    </div>
  </div></section>
}

/* ---------------- shell ---------------- */
export default function App() {
  const route = useRoute()
  const bag = useBag()
  const [menu, setMenu] = useState(false)
  const NAV = [['shop', 'Shop'], ['collections', 'Collections'], ['build', 'Build your patio'], ['guides', 'Guides'], ['about', 'About'], ['contact', 'Contact']]
  const page = {
    home: <Home bag={bag} />, shop: <Shop key={route.q.toString()} route={route} />, product: <Product key={route.id} route={route} bag={bag} />, samples: <Samples bag={bag} />,
    cart: <Bag bag={bag} />, checkout: <Checkout bag={bag} />, about: <About />, faq: <Faq />, contact: <Contact />, collections: <Collections />, build: <Build bag={bag} />, guides: <Guides />, guide: <Guide key={route.id} route={route} />,
  }[route.page] || <Home bag={bag} />
  return (
    <>
      <header className="nav"><div className="wrap">
        <div className="nav-in">
          <a className="brand" href={href('')} aria-label="Nitya Stones, home"><Logo compact /></a>
          <nav className="links" aria-label="Primary">{NAV.map(([k, l]) => <a key={k} href={href(k)} className={route.page === k ? 'active' : ''}>{l}</a>)}</nav>
          <a className="bag-btn" href={href('cart')}>Bag {bag.count > 0 && <b>{bag.count}</b>}</a>
          <button className="menu-btn" type="button" aria-expanded={menu} onClick={() => setMenu(m => !m)}>Menu</button>
        </div>
        <nav className={`drawer ${menu ? 'open' : ''}`} aria-label="Mobile">{NAV.map(([k, l]) => <a key={k} href={href(k)} onClick={() => setMenu(false)}>{l}</a>)}<a href={PHONE_HREF}>Call {PHONE}</a></nav>
      </div></header>
      <main>{page}</main>
      <footer><div className="wrap">
        <div className="foot">
          <div><Logo /><p style={{ marginTop: 14, maxWidth: '32ch' }}>Wholesale and retail suppliers of outdoor and indoor porcelain, sandstone, limestone and cladding. 34 Mark Road, Hemel Hempstead HP2 7BW.</p></div>
          <div><h4>Shop</h4>{CATS.map(([k, l]) => <a key={k} href={href('shop?cat=' + k)}>{l}</a>)}<a href={href('samples')}>Samples</a></div>
          <div><h4>Help</h4><a href={href('guides')}>Guides</a><a href={href('build')}>Build your patio</a><a href={href('collections')}>Collections</a><a href={href('faq')}>FAQ</a><a href={href('about')}>Ordering &amp; delivery</a><a href={href('about')}>Laying patterns</a><a href={href('contact')}>Trade accounts</a></div>
          <div><h4>The yard</h4><a href={PHONE_HREF}>{PHONE}</a><a href="mailto:info@nityastones.co.uk">info@nityastones.co.uk</a><span style={{ display: 'block', paddingTop: 3 }}>Mon–Fri 8–6 · Sat 8–1</span></div>
        </div>
        <div className="foot-bottom"><span>© Nitya Stones · Photography © Nitya Stones</span><img className="payments" src={IMG.payments} alt="Cards and Klarna accepted" /></div>
      </div></footer>
    </>
  )
}
