// Phase 0 acceptance, against a running local Worker (npm run dev in another terminal).
//   node scripts/smoke.mjs [http://localhost:8787]
const base = process.argv[2] || 'http://localhost:8787'
const get = async (path) => { const r = await fetch(base + path); return [r.status, await r.json()] }
const fails = []
const check = (name, ok, detail) => { console.log((ok ? '  ok  ' : '  --  ') + name + (ok ? '' : '  ' + JSON.stringify(detail))); if (!ok) fails.push(name) }

const [hs, h] = await get('/health'); check('health', hs === 200 && h.ok)
const [ms, me] = await get('/me'); check('signed-in user has a role', ms === 200 && me.role === 'admin', me)
const [ps, prods] = await get('/products'); check('active products load', ps === 200 && prods.products.length >= 70, prods.products?.length)
const [as, all] = await get('/products?all=1'); check('every seed row is in the database', as === 200 && all.products.length === 88, all.products?.length)
const mixed = all.products.filter(p => p.mode === 'mixed'); check('mixed packs present', mixed.length === 9, mixed.length)
const [rs, raj] = await get('/products/SS-RAJGREE-MIX-22'); check('Raj Green mixed pack covers 18.19 m² in 60 slabs', rs === 200 && raj.pack.cover === 18.19 && raj.pack.perPack === 60, raj.pack)
const [qs, q] = await get('/quantify?code=SS-AUTOBROW-MIX-22&m2=55'); check('55 m² of Autumn Brown is 3 packs + 2 loose slabs = 55.01 m²', qs === 200 && q.packs === 3 && q.slabs === 2 && q.m2 === 55.01, q)
const [q2s, q2] = await get('/quantify?code=PC-QUARWHIT-600X900-20&m2=26.4'); check('26.4 m² of Quartz White is 1 pallet + 9 slabs = 26.46 m²', q2s === 200 && q2.packs === 1 && q2.slabs === 9 && q2.m2 === 26.46, q2)
const [ss, st] = await get('/stock'); check('stock view answers for every active product', ss === 200 && st.stock.length === prods.products.length && st.stock.every(s => s.on_hand === 0), st.stock?.length)
const [avs, av] = await get('/public/availability?ids=raj-green,quartz-white'); check('public availability by site id', avs === 200 && av.availability.length === 2, av)
const [us, users] = await get('/users'); check('admin can list users', us === 200 && users.users.length >= 1, users)
const [ns] = await get('/nothing'); check('unknown route is 404', ns === 404)
console.log(fails.length ? `\nFAILED: ${fails.join(', ')}` : '\nNO FINDINGS')
process.exit(fails.length ? 1 : 0)
