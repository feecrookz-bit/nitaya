import { Fragment, useEffect, useState } from 'react'
import { api } from './api.js'

/* Hash routes: #/today, #/stock, #/stock/CODE, #/products/CODE, #/users. */
function useRoute() {
  const parse = () => { const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); return { page: parts[0] || 'today', id: parts[1] ? decodeURIComponent(parts[1]) : null } }
  const [route, setRoute] = useState(parse)
  useEffect(() => { const on = () => setRoute(parse()); window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on) }, [])
  return route
}
const href = (p) => '#/' + p

function useLoad(fn, deps) {
  const [state, set] = useState({ loading: true })
  useEffect(() => { let live = true; set({ loading: true }); fn().then(d => live && set({ data: d })).catch(e => live && set({ error: e.message })); return () => { live = false } }, deps)
  return state
}

const unitWord = (p, n) => ({ slab: 'slab', box: 'box', bucket: 'bucket', piece: 'piece' }[p.base_unit] || p.base_unit) + (n === 1 ? '' : p.base_unit === 'box' ? 'es' : 's')
const fmt = (n) => Number(n || 0).toLocaleString('en-GB', { maximumFractionDigits: 2 })

function Today({ user }) {
  const st = useLoad(() => api('/stock'), [])
  if (st.error) return <p className="err">{st.error}</p>
  const rows = st.data?.stock || []
  const low = rows.filter(r => r.min_stock > 0 && r.available < r.min_stock).length
  const empty = rows.filter(r => r.on_hand <= 0).length
  return (
    <>
      <p className="kicker">Today</p>
      <h1>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user.name.split(' ')[0]}.</h1>
      <p className="note" style={{ marginTop: 6 }}>Stock as the ledger says it is. Dispatches, collections and goods in expected appear here from Phase 2.</p>
      <div className="tiles">
        <a className="tile" href={href('stock')}><span className="n">{rows.length}</span><span className="l">active lines</span></a>
        <a className={'tile' + (low ? ' warn' : '')} href={href('stock')}><span className="n">{low}</span><span className="l">below minimum</span></a>
        <a className="tile" href={href('stock')}><span className="n">{empty}</span><span className="l">nothing on the ground</span></a>
        <a className="tile" href={href('stock')}><span className="n">{fmt(rows.reduce((s, r) => s + r.on_hand, 0))}</span><span className="l">units on hand</span></a>
      </div>
    </>
  )
}

function Stock() {
  const st = useLoad(() => api('/stock'), [])
  const [q, setQ] = useState('')
  if (st.error) return <p className="err">{st.error}</p>
  const rows = (st.data?.stock || []).filter(r => !q || (r.name + ' ' + r.code).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <p className="kicker">Stock</p>
      <h1>On the ground</h1>
      <div className="search"><input id="q" type="search" placeholder="Search by name or code" value={q} onChange={e => setQ(e.target.value)} aria-label="Search stock" /></div>
      {st.loading ? <p className="note">Loading…</p> : <div className="list">
        {rows.map(r => (
          <a key={r.code} className={'row' + (r.min_stock > 0 && r.available < r.min_stock ? ' low' : '')} href={href('products/' + encodeURIComponent(r.code))}>
            <span><span className="name">{r.name}</span><br /><span className="sub mono">{r.code}</span></span>
            <span className="qty">{fmt(r.available)}<small>available · {fmt(r.on_hand)} on hand · {fmt(r.allocated)} allocated</small></span>
          </a>))}
        {!rows.length && <p className="note">Nothing matches.</p>}
      </div>}
    </>
  )
}

function Product({ code, user }) {
  const st = useLoad(() => api('/products/' + encodeURIComponent(code)), [code])
  const mv = useLoad(() => api('/stock/' + encodeURIComponent(code) + '/movements'), [code])
  const [m2, setM2] = useState('26.4'); const [q, setQ] = useState(null); const [qErr, setQErr] = useState('')
  useEffect(() => { setQ(null) }, [code])
  if (st.error) return <p className="err">{st.error}</p>
  if (!st.data) return <p className="note">Loading…</p>
  const p = st.data, k = p.pack
  const work = async () => { setQErr(''); try { setQ(await api(`/quantify?code=${encodeURIComponent(code)}&m2=${m2}`)) } catch (e) { setQErr(e.message) } }
  return (
    <>
      <p className="kicker">{p.family}</p>
      <h1>{p.name}</h1>
      <p className="note mono" style={{ marginTop: 4 }}>{p.code}{p.site_id ? ` · on the site as ${p.site_id}` : ' · not on the site'}{p.active ? '' : ' · retired'}</p>
      <div className="grid2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Packing</h2>
          <dl className="facts">
            {k.mode === 'mixed' ? <>
              <dt>Pack</dt><dd>{k.perPack} slabs in four sizes, {k.cover} m²</dd>
              {k.sizes.map(([name, n, sm2]) => <Fragment key={name}><dt>{name}</dt><dd>{n} slabs, {sm2} m² each</dd></Fragment>)}
            </> : <>
              <dt>Per pallet</dt><dd>{p.per_pallet} {unitWord(p, p.per_pallet)}{p.per_box ? ` in boxes of ${p.per_box}` : ''}</dd>
              {p.m2_per_unit > 0 && <><dt>Per {unitWord(p, 1)}</dt><dd>{p.m2_per_unit} m²</dd></>}
              {k.cover > 0 && <><dt>Pallet covers</dt><dd>{k.cover} m²</dd></>}
              <dt>Split</dt><dd>{k.split ? 'sold by the ' + unitWord(p, 1) : 'whole ' + unitWord(p, 2) + ' only'}</dd>
            </>}
            <dt>Size</dt><dd>{p.size} · {p.thickness}</dd>
            <dt>Minimum stock</dt><dd>{p.min_stock || 'none set'}</dd>
          </dl>
          {p.note && <p className="note" style={{ marginTop: 10 }}>{p.note}</p>}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Stock</h2>
          <dl className="facts">
            <dt>On hand</dt><dd>{fmt(p.on_hand ?? 0)}</dd>
            <dt>Allocated</dt><dd>{fmt(p.allocated ?? 0)}</dd>
            <dt>Available</dt><dd>{fmt(p.available ?? 0)}</dd>
          </dl>
          <p className="note" style={{ marginTop: 10 }}>Goods in, counts and adjustments come with Phase 1.</p>
        </div>
      </div>
      {k.cover > 0 && <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0 }}>What leaves the yard for an area</h2>
        <div className="search"><input id="m2" type="number" inputMode="decimal" min="0.1" step="0.1" value={m2} onChange={e => setM2(e.target.value)} aria-label="Area in square metres" /><button className="btn" type="button" onClick={work}>Work it out</button></div>
        {qErr && <p className="err">{qErr}</p>}
        {q && <p className="result">{q.packs} × {k.cover} m²{q.slabs ? ` + ${q.slabs} loose ${unitWord(p, q.slabs)}${q.mixText ? ` (${q.mixText})` : ''}` : ''} = <b>{q.m2} m²</b> for {q.m2Asked} m² asked</p>}
      </div>}
      <h2>Movements</h2>
      {mv.data && (mv.data.movements.length ? <div className="tw"><table><thead><tr><th>When</th><th>Type</th><th>Qty</th><th>Bay</th><th>Who</th><th>Reference</th></tr></thead><tbody>
        {mv.data.movements.map(m => <tr key={m.id}><td className="mono">{m.at}</td><td>{m.type}</td><td className="mono">{fmt(m.quantity)}</td><td>{m.bay_id || ''}</td><td>{m.user_email}</td><td>{m.reference || m.note || ''}</td></tr>)}
      </tbody></table></div> : <p className="note">No movements yet. The first will be goods in.</p>)}
    </>
  )
}

function Users({ user }) {
  const [tick, setTick] = useState(0)
  const st = useLoad(() => api('/users'), [tick])
  const [f, setF] = useState({ email: '', name: '', role: 'warehouse' }); const [msg, setMsg] = useState('')
  if (user.role !== 'admin') return <p className="err">Users are managed by an admin.</p>
  if (st.error) return <p className="err">{st.error}</p>
  const save = async (e) => { e.preventDefault(); setMsg(''); try { await api('/users', f); setF({ email: '', name: '', role: 'warehouse' }); setTick(t => t + 1); setMsg('Saved.') } catch (err) { setMsg(err.message) } }
  return (
    <>
      <p className="kicker">Users</p>
      <h1>Who can sign in</h1>
      <p className="note" style={{ marginTop: 6 }}>Sign-in is by email through Cloudflare Access. A person listed here with a role gets in; anyone else is turned away.</p>
      <div className="list" style={{ marginTop: 14 }}>
        {(st.data?.users || []).map(u => <div key={u.email} className="row"><span><span className="name">{u.name}</span><br /><span className="sub">{u.email}</span></span><span className={'pill ' + u.role}>{u.role}{u.active ? '' : ' · off'}</span></div>)}
      </div>
      <h2>Add or change someone</h2>
      <form className="card" onSubmit={save}>
        <div className="field"><label htmlFor="uEmail">Email</label><input id="uEmail" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
        <div className="field"><label htmlFor="uName">Name</label><input id="uName" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="uRole">Role</label><select id="uRole" value={f.role} onChange={e => setF({ ...f, role: e.target.value })}><option value="warehouse">Warehouse</option><option value="office">Office</option><option value="director">Director</option><option value="admin">Admin</option></select></div>
        <button className="btn" type="submit">Save</button> {msg && <span className="note" style={{ marginLeft: 10 }}>{msg}</span>}
      </form>
    </>
  )
}

export default function App() {
  const route = useRoute()
  const me = useLoad(() => api('/me'), [])
  const TABS = [['today', 'Today'], ['stock', 'Stock'], ['users', 'Users']]
  return (
    <>
      <header className="top"><a className="brand" href={href('today')}>NITYA STONES · STOCK</a>{me.data && <span className="who">{me.data.name} · {me.data.role}</span>}</header>
      <nav className="tabs" aria-label="Sections">{TABS.filter(([k]) => k !== 'users' || me.data?.role === 'admin').map(([k, l]) => <a key={k} href={href(k)} aria-current={route.page === k || (k === 'stock' && route.page === 'products') ? 'page' : undefined}>{l}</a>)}</nav>
      <main>
        {me.error ? <div className="card"><h1>Not signed in</h1><p className="note" style={{ marginTop: 8 }}>{me.error}</p></div>
          : !me.data ? <p className="note">Signing in…</p>
          : route.page === 'stock' ? <Stock />
          : route.page === 'products' && route.id ? <Product code={route.id} user={me.data} />
          : route.page === 'users' ? <Users user={me.data} />
          : <Today user={me.data} />}
      </main>
    </>
  )
}
