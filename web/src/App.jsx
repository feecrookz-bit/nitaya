import { useEffect, useMemo, useState } from 'react'
import StoneScene from './StoneScene.jsx'
import Logo from './Logo.jsx'
import { IMG, RANGES, CAT_LABEL, SCENES, MIXED, PATTERNS, FAQ, REVIEWS, money } from './data.js'

const PHONE = '0330 236 9227'
const PHONE_HREF = 'tel:03302369227'

/* ---------- small pieces ---------- */

function Swatch({ range, className = '' }) {
  return <div className={`swatch ${className}`}><img src={range.img} alt={range.name} loading="lazy" /></div>
}

function Price({ range }) {
  if (!range.price) return <div className="price"><span className="ask">Ask the yard</span><small>{PHONE}</small></div>
  return (
    <div className="price">
      <b>{money(range.price)}</b>
      {range.was && <s>{money(range.was)}</s>}
      <small>{range.unit || 'per m²'} + VAT</small>
    </div>
  )
}

function RangeCard({ range }) {
  return (
    <article className="card">
      <div style={{ position: 'relative' }}>
        <Swatch range={range} />
        {range.tag && <span className="badge">{range.tag}</span>}
      </div>
      <div className="card-body">
        <div className="card-title"><h3>{range.name}</h3><span className="origin">{range.origin}</span></div>
        <dl className="spec">
          <dt>Size</dt><dd>{range.size}</dd>
          <dt>Thickness</dt><dd>{range.thick}</dd>
          <dt>Pack</dt><dd>{range.pack}</dd>
          <dt>Finish</dt><dd>{range.finish}</dd>
        </dl>
        <Price range={range} />
      </div>
    </article>
  )
}

/* Deterministic PRNG so the laying patterns are identical on every render. */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s ^= s << 13; s >>>= 0
    s ^= s >> 17
    s ^= s << 5; s >>>= 0
    return s / 4294967296
  }
}

function shade(hex, t) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const f = 1 - t
  return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`
}

function Pattern({ p }) {
  const rects = useMemo(() => {
    const W = 300, H = 210, mm = 6.2, joint = 10 / mm
    const out = []
    const r = rng(19)
    let n = 0
    if (p.kind === 'mixed') {
      for (let y = 0; y < H;) {
        const rowH = (r() > 0.55 ? 600 : 295) / mm
        for (let x = -6; x < W;) {
          let opts = MIXED.filter(s => Math.abs(s[1] / mm - rowH) < 1)
          if (!opts.length) opts = [[600, rowH * mm]]
          const pick = opts[Math.floor(r() * opts.length)]
          const w = pick[0] / mm
          out.push({ x, y, w, h: rowH, i: n++ })
          x += w + joint
        }
        y += rowH + joint
      }
    } else {
      const sw = p.w / mm, sh = p.h / mm
      const off = p.kind === 'stack' ? 0 : p.kind === 'third' ? sw / 3 : sw / 2
      let row = 0
      for (let y = -sh * 0.3; y < H; y += sh + joint) {
        const shift = p.kind === 'third' ? (row % 3) * off : (row % 2) * off
        for (let x = -shift - sw * 0.3; x < W; x += sw + joint) out.push({ x, y, w: sw, h: sh, i: n++ })
        row++
      }
    }
    return out
  }, [p])
  const dark = shade(p.tint, 0.55)
  return (
    <figure className="pattern">
      <svg viewBox="0 0 300 210" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${p.title} laying pattern, drawn to scale`}>
        <rect x="0" y="0" width="300" height="210" fill={dark} />
        {rects.map(q => (
          <rect key={q.i} x={q.x.toFixed(1)} y={q.y.toFixed(1)} width={q.w.toFixed(1)} height={q.h.toFixed(1)}
            fill={shade(p.tint, (q.i % 5) * 0.05)} stroke={dark} strokeWidth="0.6" />
        ))}
      </svg>
      <figcaption><b>{p.title}</b><span>{p.sub}</span><span className="mono" style={{ color: 'var(--ink-3)' }}>10 mm joint</span></figcaption>
    </figure>
  )
}

/* ---------- page ---------- */

export default function App() {
  const [filter, setFilter] = useState('all')
  const [over, setOver] = useState(true)
  const [calc, setCalc] = useState({ range: 'autumn-brown', len: '6', wid: '4', waste: '10', post: '' })
  const [enq, setEnq] = useState({ name: '', phone: '', want: 'A quote for a patio' })
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const onScroll = () => setOver(window.scrollY < 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const range = RANGES.find(r => r.id === calc.range)
  const num = (v, d) => { const n = parseFloat(v); return isFinite(n) && n >= 0 ? n : d }
  const L = num(calc.len, 0), W = num(calc.wid, 0), pct = Math.min(num(calc.waste, 10), 40)
  const net = L * W
  const gross = net * (1 + pct / 100)
  const packs = range.cover ? Math.ceil(gross / range.cover) : null
  const chargeable = range.cover ? packs * range.cover : gross
  const ex = range.price ? chargeable * range.price : null

  const enquiry = useMemo(() => {
    const lines = [
      'NITYA STONES — ENQUIRY', '',
      `Name:      ${enq.name || '—'}`,
      `Phone:     ${enq.phone || '—'}`,
      `Postcode:  ${calc.post.toUpperCase() || '—'}`,
      `Enquiry:   ${enq.want}`, '',
      `Range:     ${range.name} (${CAT_LABEL[range.cat]})`,
      `Size:      ${range.size}, ${range.thick}`,
      `Finish:    ${range.finish}`, '',
      `Area:      ${net.toFixed(2)} m² (${L} m × ${W} m)`,
      `With cuts: ${gross.toFixed(2)} m² at +${pct}%`,
    ]
    if (packs) lines.push(`Packs:     ${packs} × ${range.cover.toFixed(2)} m²`)
    lines.push(ex != null ? `Est. cost: ${money(ex)} ex VAT (${money(ex * 1.2)} inc)` : 'Est. cost: please quote')
    lines.push('', 'Please confirm delivery cost and the next available date,', 'or stock for collection from Mark Road.')
    return lines.join('\n')
  }, [enq, calc.post, range, net, gross, pct, packs, ex, L, W])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(enquiry)
      setCopied('Copied — paste it into an email to info@nityastones.co.uk')
    } catch {
      setCopied('Select the text above and copy it')
    }
  }

  const visible = RANGES.filter(r => filter === 'all' || r.cat === filter)
  const sampleIds = ['raj-green', 'rippon-buff', 'black-limestone', 'fossil-mint', 'autumn-brown', 'kandla-grey-22mm-sandstone-mixed']

  return (
    <>
      <header className={`masthead ${over ? 'over' : 'solid'}`}>
        <div className="wrap masthead-in">
          <a className="brand" href="#top" aria-label="Nitya Stones, home"><Logo compact /></a>
          <nav className="nav mono" aria-label="Primary">
            <a href="#ranges">Ranges</a>
            <a href="#scenes">Inspiration</a>
            <a href="#calculator">Price my patio</a>
            <a href="#ordering">Ordering</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="callbtn mono" href={PHONE_HREF}>{PHONE}</a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <img src={IMG.hero} alt="Drone view of a customer\u2019s detached house wrapped in Kandla Grey porcelain paving" fetchPriority="high" />
          <StoneScene />
          <div className="wrap hero-overlay"><div className="hero-in">
            <span className="mono eyebrow">Hemel Hempstead · Trade &amp; retail counter</span>
            <h1>Indian sandstone and 20&nbsp;mm porcelain, <em>off the pallet.</em></h1>
            <p className="lede">Wholesale and retail. Riven sandstone, limestone and vitrified porcelain held at the Mark Road yard and on your site in three to four working days. Closer than that, come and collect — there's no minimum off the counter.</p>
            <div className="cta-row">
              <a className="btn" href="#calculator">Price my patio</a>
              <a className="btn btn-ghost" href="#samples">Order samples — £5</a>
            </div>
          </div></div>
        </section>

        <div className="strip"><div className="wrap"><div className="strip-in">
          <div className="strip-item"><b>3–4 working days</b><span>From cleared payment. We call on the day; someone has to sign for it.</span></div>
          <div className="strip-item"><b>Price match</b><span>Find the same stone cheaper and we'll match it.</span></div>
          <div className="strip-item"><b>Split packs</b><span>Outdoor porcelain and Kandla Grey 600×900 only.</span></div>
          <div className="strip-item"><b>Cards accepted</b><span>Pay online or over the phone with the yard.</span></div>
          <div className="strip-item"><b>Collection</b><span>HP2 7BW, Mon–Fri 8–6, Sat 8–1. No minimum.</span></div>
        </div></div></div>

        <section id="ranges"><div className="wrap">
          <div className="sec-head">
            <div><span className="mono eyebrow">What we stock</span><h2>Ranges</h2></div>
            <p>Everything here is held at the yard or on short call-off. Sandstone and limestone are <b>uncalibrated</b> — thickness varies across a pack, which is how riven stone comes out of the ground.</p>
          </div>
          <div className="filters" role="group" aria-label="Filter ranges by category">
            {[['all', 'All'], ...Object.entries(CAT_LABEL)].map(([k, label]) => (
              <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}</button>
            ))}
          </div>
          <div className="ranges">{visible.map(r => <RangeCard key={r.id} range={r} />)}</div>
          <p className="note" style={{ marginTop: 16 }}>Prices are per m² excluding VAT and match the shop. Pallet and pack coverages are nominal. Every photo is our own stock, shot at the yard or on a customer's job — and the £5 sample is still the only honest way to pick a colour.</p>
        </div></section>

        <section id="scenes" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="sec-head">
            <div><span className="mono eyebrow">Where it ends up</span><h2>Laid, not stacked</h2></div>
            <p>Customers' gardens, laid with stock from Mark Road. Bring us a sketch and we'll tell you which pack gets you there.</p>
          </div>
          <div className="scenes">
            {SCENES.map(s => (
              <figure key={s.title} className="scene">
                <img src={s.img} alt={s.title} />
                <figcaption><b>{s.title}</b><span>{s.sub}</span></figcaption>
              </figure>
            ))}
          </div>
        </div></section>

        <section className="prov"><div className="wrap prov-grid">
          <div className="yard-pics">
            <img src={IMG.yard} alt="The Nitya Stones showroom and yard on Mark Road" />
            <img src={IMG.pallets} alt="Pallets of paving stacked in the Nitya Stones yard" />
          </div>
          <div>
            <span className="mono eyebrow">34 Mark Road, HP2 7BW</span>
            <h2>Stock on the ground, not on a lead time.</h2>
            <p>Wholesale and retail from the same yard since 2016. We buy from quarries and manufacturers we know, hold the pallets ourselves, and check them in before they go out. Walk in, see the slabs, take a sample home — or ring and we'll load a van for three-to-four days' time.</p>
            <div className="stats">
              <div className="stat"><b>2016</b><span>Trading from the same Hemel Hempstead yard</span></div>
              <div className="stat"><b>36</b><span>Ranges held in stock at the yard</span></div>
              <div className="stat"><b>3–4</b><span>Working days from payment to your drive</span></div>
            </div>
          </div>
        </div></section>

        <section id="calculator"><div className="wrap">
          <div className="sec-head">
            <div><span className="mono eyebrow">Work out the order</span><h2>Price my patio</h2></div>
            <p>Measure the area you're paving. We add 10% by default for cuts and breakages — raise it for circles, diagonals or lots of edges.</p>
          </div>
          <div className="calc"><div className="calc-grid">
            <div className="calc-in">
              <div className="field"><label htmlFor="calcRange">Range</label>
                <select id="calcRange" value={calc.range} onChange={e => setCalc({ ...calc, range: e.target.value })}>
                  {RANGES.map(r => <option key={r.id} value={r.id}>{r.name} — {CAT_LABEL[r.cat]}</option>)}
                </select></div>
              <div className="two">
                <div className="field"><label htmlFor="calcLen">Length (m)</label><input id="calcLen" type="number" min="0" step="0.1" value={calc.len} onChange={e => setCalc({ ...calc, len: e.target.value })} /></div>
                <div className="field"><label htmlFor="calcWid">Width (m)</label><input id="calcWid" type="number" min="0" step="0.1" value={calc.wid} onChange={e => setCalc({ ...calc, wid: e.target.value })} /></div>
              </div>
              <div className="two">
                <div className="field"><label htmlFor="calcWaste">Wastage (%)</label><input id="calcWaste" type="number" min="0" max="40" step="1" value={calc.waste} onChange={e => setCalc({ ...calc, waste: e.target.value })} /></div>
                <div className="field"><label htmlFor="calcPost">Delivery postcode</label><input id="calcPost" type="text" autoComplete="postal-code" placeholder="HP2 7BW" value={calc.post} onChange={e => setCalc({ ...calc, post: e.target.value })} /></div>
              </div>
              <p className="note">Delivery is quoted on quantity and distance and isn't included. Collection from the yard is free — a pallet of 20&nbsp;mm porcelain is roughly a tonne, so bring something that'll take it.</p>
            </div>
            <div className="calc-out">
              <div className="readout">
                <div className="row"><span className="k">Area to pave</span><span className="v">{net.toFixed(2)} m²</span></div>
                <div className="row"><span className="k">Plus {pct}% for cuts</span><span className="v">{gross.toFixed(2)} m²</span></div>
                {packs
                  ? <><div className="row"><span className="k">Packs needed</span><span className="v">{packs} × {range.cover.toFixed(2)} m²</span></div>
                      <div className="row"><span className="k">Stone supplied</span><span className="v">{(packs * range.cover).toFixed(2)} m²</span></div></>
                  : <div className="row"><span className="k">Packs needed</span><span className="v">Confirmed at order</span></div>}
                {ex != null
                  ? <><div className="row"><span className="k">Stone, ex VAT</span><span className="v">{money(ex)}</span></div>
                      <div className="row"><span className="k">VAT at 20%</span><span className="v">{money(ex * 0.2)}</span></div>
                      <div className="row total"><span className="k">Total inc VAT</span><span className="v">{money(ex * 1.2)}</span></div></>
                  : <div className="row total"><span className="k">Total inc VAT</span><span className="v">Ask the yard</span></div>}
              </div>
              <p className="note">
                {ex != null
                  ? <>{range.name} at {money(range.price)}/m² + VAT{range.cover ? '. Full packs only — we can\'t split a mixed sandstone pack, so the figure above is what leaves the yard.' : '.'} Delivery quoted separately.</>
                  : <>We don't publish a rate for {range.name} online — ring <a href={PHONE_HREF} style={{ color: 'var(--accent)' }}>{PHONE}</a> with the {gross.toFixed(2)} m² figure and we'll price it on the spot.</>}
              </p>
            </div>
          </div></div>
        </div></section>

        <section id="patterns" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="sec-head">
            <div><span className="mono eyebrow">Drawn to scale · 10 mm joints</span><h2>How it lays out</h2></div>
            <p>The pack you buy decides the pattern you get. Mixed patio packs come as four sizes to be laid random; single-size packs give you a bond.</p>
          </div>
          <div className="patterns">{PATTERNS.map(p => <Pattern key={p.title} p={p} />)}</div>
        </div></section>

        <section className="honest" id="samples"><div className="wrap honest-grid">
          <div>
            <span className="mono eyebrow">Before you order 40 square metres</span>
            <h2>The colour on your screen is not the colour on your patio.</h2>
            <p>Our slabs are natural stone, and depending on the batch there can be a genuine difference in shade between one pallet and the next. Riven surfaces change again the moment they're wet. No screen tells you what a Raj Green patio looks like at four o'clock in October.</p>
            <p>So we sell 100×100&nbsp;mm pieces of the real thing for £5. Put one on the ground where the patio is going, look at it over a couple of days, then order the pallets.</p>
            <a className="btn" href="#enquiry">Request samples</a>
          </div>
          <div className="sample-card">
            <span className="mono">Sample · 100 × 100 mm · £5.00</span>
            <div className="sample-swatches">
              {sampleIds.map(id => <Swatch key={id} range={RANGES.find(r => r.id === id)} />)}
            </div>
            <span className="mono" style={{ opacity: .7 }}>Posted out, or pick them up from the counter</span>
          </div>
        </div></section>

        <section id="ordering"><div className="wrap">
          <div className="sec-head">
            <div><span className="mono eyebrow">Sample, measure, pay, delivered</span><h2>Ordering</h2></div>
            <p>Four steps, in this order. Skipping the first is how people end up with a patio two shades off what they pictured.</p>
          </div>
          <div className="steps">
            <div className="step"><span className="num">01</span><h3>Take a sample</h3><p>100×100&nbsp;mm, £5, posted. Look at it wet and dry, in daylight, on the ground it's going on.</p></div>
            <div className="step"><span className="num">02</span><h3>Measure the area</h3><p>Length × width, plus 10% for cuts. Use the calculator, or send a sketch with dimensions and we'll work the packs out.</p></div>
            <div className="step"><span className="num">03</span><h3>Pay</h3><p>Card online, or ring {PHONE} and pay over the phone. Delivery cost is confirmed before you pay.</p></div>
            <div className="step"><span className="num">04</span><h3>Delivered or collected</h3><p>3–4 working days from cleared payment, between 8am and 6pm. We call on the day and someone must sign. Or collect from HP2 7BW.</p></div>
          </div>
          <p className="note" style={{ marginTop: 20 }}><b>Custom orders:</b> we'll run a bespoke size, colour or finish at 120&nbsp;m² and above. Allow up to eight weeks for production and delivery.</p>
        </div></section>

        <section id="reviews" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="sec-head"><div><span className="mono eyebrow">From customers</span><h2>Said about the yard</h2></div></div>
          <div className="quotes">
            {REVIEWS.map(r => <blockquote key={r.who} className="quote"><p>{r.quote}</p><cite><b>{r.who}</b><span>{r.what}</span></cite></blockquote>)}
            <div className="quote quote-since"><b>Since 2016</b><span>Ten seasons supplying landscapers and homeowners from the same Hemel Hempstead yard.</span></div>
          </div>
        </div></section>

        <section id="faq" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="sec-head"><div><span className="mono eyebrow">Asked most often</span><h2>Straight answers</h2></div></div>
          <div className="faq">
            {FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </div></section>

        <section className="contact" id="contact"><div className="wrap contact-grid">
          <div id="enquiry">
            <span className="mono eyebrow">Send it over</span>
            <h2>Get a price</h2>
            <p className="note" style={{ marginTop: 14, fontSize: '.95rem', color: 'var(--ink-2)' }}>Fill this in and it writes your enquiry below — copy it into an email, or read it down the phone. Everything we need to quote you is in it.</p>
            <div className="form">
              <div className="two">
                <div className="field"><label htmlFor="enqName">Name</label><input id="enqName" type="text" autoComplete="name" placeholder="Your name" value={enq.name} onChange={e => setEnq({ ...enq, name: e.target.value })} /></div>
                <div className="field"><label htmlFor="enqPhone">Phone</label><input id="enqPhone" type="tel" autoComplete="tel" placeholder="07…" value={enq.phone} onChange={e => setEnq({ ...enq, phone: e.target.value })} /></div>
              </div>
              <div className="field"><label htmlFor="enqWant">What do you need</label>
                <select id="enqWant" value={enq.want} onChange={e => setEnq({ ...enq, want: e.target.value })}>
                  {['Samples (£5 each)', 'A quote for a patio', 'Trade account / repeat supply', 'Custom order, 120 m²+', 'Checking stock for collection'].map(o => <option key={o}>{o}</option>)}
                </select></div>
              <div className="field"><label htmlFor="enqText">Your enquiry</label><textarea id="enqText" spellCheck="false" value={enquiry} readOnly /></div>
              <div className="cta-row" style={{ marginTop: 0 }}>
                <button className="btn" type="button" onClick={copy}>Copy enquiry</button>
                <a className="btn btn-ghost" href={PHONE_HREF}>Or call {PHONE}</a>
                <span className="copied" role="status" aria-live="polite">{copied}</span>
              </div>
            </div>
          </div>
          <div>
            <span className="mono eyebrow">The yard</span>
            <h2>Mark Road</h2>
            <dl className="detail-list">
              <div className="detail"><dt className="k">Address</dt><dd className="v">34 Mark Road<br />Hemel Hempstead<br />HP2 7BW</dd></div>
              <div className="detail"><dt className="k">Phone</dt><dd className="v"><a href={PHONE_HREF}>{PHONE}</a><br /><a href="tel:07932009870">07932 009870</a></dd></div>
              <div className="detail"><dt className="k">Email</dt><dd className="v"><a href="mailto:info@nityastones.co.uk">info@nityastones.co.uk</a></dd></div>
              <div className="detail"><dt className="k">Mon–Fri</dt><dd className="v">08:00 – 18:00</dd></div>
              <div className="detail"><dt className="k">Saturday</dt><dd className="v">08:00 – 13:00</dd></div>
              <div className="detail"><dt className="k">Sunday</dt><dd className="v">Closed</dd></div>
              <div className="detail"><dt className="k">Payment</dt><dd className="v">All major cards, online or by phone</dd></div>
            </dl>
          </div>
        </div></section>
      </main>

      <footer><div className="wrap foot">
        <div className="foot-row">
          <Logo tone="ink" />
          <span className="mono">Sandstone · Limestone · Porcelain · Cladding</span>
        </div>
        <div className="foot-row">
          <p className="credits">Photography © Nitya Stones — our own stock and customers' completed gardens.</p>
          <img className="payments" src={IMG.payments} alt="Mastercard, Maestro, Visa, Visa Electron and Klarna accepted" width="300" height="50" loading="lazy" />
        </div>
      </div></footer>
    </>
  )
}
