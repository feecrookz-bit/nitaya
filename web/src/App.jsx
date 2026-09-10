import { useEffect, useMemo, useState } from 'react'
import StoneScene from './StoneScene.jsx'
import Logo from './Logo.jsx'
import { IMG, CATS, CAT_LABEL, PRODUCTS, byId, SAMPLE, SCENES, MIXED, PATTERNS, FAQ, REVIEWS, money } from './data.js'

const PHONE = '0330 236 9227'
const PHONE_HREF = 'tel:03302369227'
const VAT = 0.2

/* ---------------- tiny hash router ---------------- */
function useRoute() {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '')
    const [path, qs] = h.split('?')
    const parts = path.split('/').filter(Boolean)
    return { page: parts[0] || 'home', id: parts[1] || null, q: new URLSearchParams(qs || '') }
  }
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
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
const lineUnitLabel = (p) => p.unit === 'per m²' ? (p.cover ? `pack of ${p.cover.toFixed(2)} m²` : 'per m²') : p.unit === 'per pallet' ? 'pallet' : p.unit === 'per kit' ? 'kit' : 'each'

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
    <a className="product" href={href('product/' + p.id)}>
      <img src={p.img} alt={p.name} loading="lazy" />
      <div className="product-body">
        {p.tag && <span className="tag">{p.tag}</span>}
        <h3>{p.name}</h3>
        <span className="spec">{p.size} · {p.thick} · {CAT_LABEL[p.cat]}</span>
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

/* ---------------- pages ---------------- */
function Home({ bag }) {
  const featured = ['kandla-grey', 'bodo-white', 'raj-green', 'black-limestone', 'calacatta-blanco', 'copper-slate', 'sinai-pearl', 'himalayan-white'].map(byId)
  const catImg = { sandstone: byId('raj-green').gallery || byId('raj-green').img, limestone: byId('black-limestone').img, outdoor: SCENES[1].img, indoor: byId('calacatta-blanco').img, cladding: byId('cladding').img }
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="kicker">Hemel Hempstead · Trade &amp; retail · Since 2016</p>
          <h1>Stone, off the pallet.<span>Indian sandstone · Limestone · 20 mm porcelain</span></h1>
          <p className="intro">Held at our Mark Road yard and on your site in three to four working days. No minimum for collection. Price match on everything.</p>
          <div className="actions">
            <a className="pill" href={href('shop')}>Shop the ranges</a>
            <a className="pill ghost" href={href('samples')}>Order samples · £5</a>
          </div>
        </div>
        <div className="wrap"><StoneScene /></div>
        <div className="hero-strip">
          <div><b>3–4 working days</b>From cleared payment. We call on the day.</div>
          <div><b>Price match</b>Same stone cheaper elsewhere? We'll match it.</div>
          <div><b>Split packs</b>Outdoor porcelain and Kandla Grey 600×900.</div>
          <div><b>Card, Klarna, phone</b>Pay online or ring the yard.</div>
          <div><b>Collect free</b>HP2 7BW · Mon–Fri 8–6 · Sat 8–1.</div>
        </div>
      </section>

      <section className="chapter"><div className="wrap">
        <div className="head-row"><div><p className="kicker">Shop by range</p><h2>Five materials. One yard.</h2></div><a className="more" href={href('shop')}>All 36 products</a></div>
        <div className="cats">
          {CATS.map(([k, label, sub]) => <a key={k} className="cat" href={href('shop?cat=' + k)}><img src={catImg[k]} alt="" loading="lazy" /><span><b>{label}</b><small>{sub}</small></span></a>)}
        </div>
      </div></section>

      <section className="chapter grey"><div className="wrap">
        <div className="head-row"><div><p className="kicker">Most laid this season</p><h2>The ones people come back for.</h2></div><a className="more" href={href('shop')}>Shop all</a></div>
        <div className="grid">{featured.map(p => <ProductCard key={p.id} p={p} />)}</div>
      </div></section>

      <section className="chapter"><div className="wrap">
        <div className="narrow"><p className="kicker">Customers' gardens</p><h2>Laid, not stacked.</h2><p className="intro">Every one of these left Mark Road on a pallet. Tap a garden to shop the stone in it.</p></div>
        <div className="media scenes">
          {SCENES.map(s => <a key={s.title} className="scene" href={href('product/' + s.product)}><img src={s.img} alt={s.title} loading="lazy" /><figcaption><b>{s.title}</b><span>{s.sub}</span></figcaption></a>)}
        </div>
      </div></section>

      <section className="chapter grey" id="calculator"><div className="wrap">
        <div className="narrow"><p className="kicker">Price it</p><h2>Measure once. Order once.</h2><p className="intro">Length by width, plus an allowance for cuts, rounded up to whole packs — the number that actually leaves the yard.</p></div>
        <div className="media"><Calculator bag={bag} /></div>
      </div></section>

      <section className="chapter" id="samples"><div className="wrap">
        <div className="narrow"><p className="kicker">Before you order forty square metres</p><h2>The colour on your screen is not the colour on your patio.</h2><p className="intro">Natural stone shifts between batches and changes again when it's wet. A £5 sample on the ground where the patio is going, looked at over two days, is the only honest way to choose.</p>
          <div className="actions"><a className="pill" href={href('samples')}>Order samples</a></div></div>
        <div className="media samples">
          {['raj-green', 'rippon-buff', 'kandla-grey', 'fossil-mint', 'autumn-brown', 'black-limestone'].map(id => { const p = byId(id); return <figure key={id}><img src={p.img} alt={p.name} loading="lazy" /><figcaption>{p.name}</figcaption></figure> })}
        </div>
      </div></section>

      <section className="chapter grey"><div className="wrap yard">
        <div className="yard-pics"><img src={IMG.yard} alt="The Nitya Stones showroom on Mark Road" loading="lazy" /><img src={IMG.pallets} alt="Pallets of paving in the Nitya Stones yard" loading="lazy" /></div>
        <div>
          <p className="kicker">34 Mark Road, HP2 7BW</p>
          <h2>Stock on the ground, not on a lead time.</h2>
          <p className="intro">Wholesale and retail from the same yard since 2016. We buy from quarries and manufacturers we know, hold the pallets ourselves and check them in before they go out. Walk in, see the slabs, take a sample home.</p>
          <div className="stats"><div className="stat"><b>2016</b><span>Same Hemel Hempstead yard</span></div><div className="stat"><b>36</b><span>Ranges in stock</span></div><div className="stat"><b>3–4</b><span>Working days to your drive</span></div></div>
          <div className="actions" style={{ justifyContent: 'flex-start' }}><a className="more" href={href('about')}>About the yard</a></div>
        </div>
      </div></section>

      <section className="chapter"><div className="wrap">
        <div className="head-row"><div><p className="kicker">From customers</p><h2>Said about the yard.</h2></div></div>
        <div className="quotes">
          {REVIEWS.map(r => <blockquote key={r.who} className="quote"><p>“{r.quote}”</p><cite><b>{r.who}</b><span>{r.what}</span></cite></blockquote>)}
          <div className="quote quote-since"><b>Since 2016</b><span>Ten seasons supplying landscapers and homeowners from Mark Road.</span></div>
        </div>
      </div></section>
    </>
  )
}

function Shop({ route }) {
  const cat = route.q.get('cat') || 'all'
  const [q, setQ] = useState(route.q.get('q') || '')
  const [sort, setSort] = useState('featured')
  let list = PRODUCTS.filter(p => cat === 'all' || p.cat === cat)
  if (q.trim()) { const t = q.trim().toLowerCase(); list = list.filter(p => (p.name + ' ' + p.cat + ' ' + p.size + ' ' + p.finish + ' ' + p.origin).toLowerCase().includes(t)) }
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
          {pics.length > 1 && <div className="thumbs">{pics.map((src, i) => <button key={i} type="button" aria-pressed={img === i} onClick={() => setImg(i)}><img src={src} alt="" /></button>)}</div>}
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
              <div><div className="name">{l.p.name}</div><div className="meta">{lineUnitLabel(l.p)} · {money(lineUnitPrice(l.p))} + VAT</div>
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
        <div className="row"><span className="k">Delivery</span><span className="v">Quoted at checkout</span></div>
        <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * (1 + VAT))}</span></div>
        <a className="pill" href={href('checkout')}>Checkout</a>
        <a className="more" href={href('shop')} style={{ justifySelf: 'center' }}>Keep shopping</a>
        <p className="note">Delivery depends on quantity and postcode and is confirmed before you pay. Collection from Mark Road is free with no minimum.</p>
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
  const NAV = [['shop', 'Shop'], ['samples', 'Samples'], ['about', 'About'], ['faq', 'FAQ'], ['contact', 'Contact']]
  const page = {
    home: <Home bag={bag} />, shop: <Shop key={route.q.toString()} route={route} />, product: <Product key={route.id} route={route} bag={bag} />, samples: <Samples bag={bag} />,
    cart: <Bag bag={bag} />, checkout: <Checkout bag={bag} />, about: <About />, faq: <Faq />, contact: <Contact />,
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
          <div><h4>Help</h4><a href={href('faq')}>FAQ</a><a href={href('about')}>Ordering &amp; delivery</a><a href={href('about')}>Laying patterns</a><a href={href('contact')}>Trade accounts</a></div>
          <div><h4>The yard</h4><a href={PHONE_HREF}>{PHONE}</a><a href="mailto:info@nityastones.co.uk">info@nityastones.co.uk</a><span style={{ display: 'block', paddingTop: 3 }}>Mon–Fri 8–6 · Sat 8–1</span></div>
        </div>
        <div className="foot-bottom"><span>© Nitya Stones · Photography © Nitya Stones</span><img className="payments" src={IMG.payments} alt="Cards and Klarna accepted" /></div>
      </div></footer>
    </>
  )
}
