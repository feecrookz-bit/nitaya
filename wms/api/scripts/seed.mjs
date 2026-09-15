// Turn wms/seed/products.csv (the warehouse sheet with codes) into migrations/0002_seed.sql.
// Adds the lines the site sells that the sheet does not carry (Sinai Pearl, the six cladding colourways).
//   node scripts/seed.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const csv = readFileSync(join(HERE, '..', '..', 'seed', 'products.csv'), 'utf8').trim().split('\n')
const head = csv[0].split(',')
const rows = csv.slice(1).map(l => { const cells = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { cells.push(cur); cur = '' } else cur += ch } cells.push(cur); return Object.fromEntries(head.map((h, i) => [h, (cells[i] || '').trim()])) })

const FAMILY = { sandstone: 'sandstone', porcelain: 'porcelain', indoor: 'indoor', chemical: 'chemical', cladding: 'cladding', granite: 'granite', circle: 'circle', edging: 'edging', limestone: 'limestone', steps: 'steps' }
const tidy = (s) => s.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
const cap = (s) => s.replace(/\b\w/g, c => c.toUpperCase())
const sizeText = (s) => /^\d+\/\d+$/.test(s) ? s.split('/').map(Number).sort((a, b) => b - a).join(' × ') + ' mm' : s
const q = (s) => s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`
// m² per unit from the stated size, exact, where the size is two dimensions in mm; the sheet rounds to two decimals
// (0.17 for 600 × 290, 0.08 for 290 × 290), which shrinks a mixed pack from 18.19 to 18.08 m².
const m2Of = (size, fallback) => { const m = size.match(/^(\d+)\/(\d+)$/); return m ? Math.round(m[1] * m[2] / 1e6 * 1e4) / 1e4 : +fallback }

// The site's product ids, matched by the sheet's colour and size.
const SITE = [
  [/raj green/i, 'mixed', 'raj-green'], [/rippon/i, 'mixed', 'rippon-buff'], [/autom|autumn/i, 'mixed', 'autumn-brown'], [/fossil/i, 'mixed', 'fossil-mint'],
  [/kandla grey/i, 'mixed', 'kandla-grey', 'sandstone'], [/kandla grey/i, '600/900', 'kandla-grey-900', 'sandstone'], [/fossil/i, '600/900', 'fossil-mint', 'sandstone'],
  [/black limestone|black lime/i, '600/600', 'black-limestone'],
  [/quartz white/i, '600/900', 'quartz-white'], [/kandla grey/i, '600/900', 'kandla-porcelain', 'porcelain'], [/hemalayan|himalayan/i, '600/900', 'himalayan-white'],
  [/bodo/i, '600/900', 'bodo-white'], [/crystal gris/i, '600/900', 'crystal-gris'], [/earth(stone|core) grey/i, '600/900', 'earthstone-grey'], [/noor/i, '600/900', 'noor-grigio'],
  [/hs b(ei|ie)ge/i, '600/900', 'hs-beige'], [/copper|rust slate/i, '600/900', 'copper-slate'], [/quart[sz] white/i, '600/900', 'quartz-white'],
  [/clorado light summer/i, '600/600', 'beige-porcelain'], [/clorado dusk grey/i, '600/600', 'light-grey-porcelain'], [/clorado light midnight/i, '600/600', 'black-porcelain'],
  [/calacatta/i, '600/1200', 'calacatta-blanco'], [/miracle/i, '600/1200', 'miracle-statuario'], [/modern stat/i, '600/1200', 'modern-statuario'], [/saint lawrence|st lawrence/i, '600/1200', 'saint-lawrence'],
  [/saint law/i, '600/1200', 'saint-lawrence'], [/lobbies/i, '600/1200', 'lobbies-silver'], [/jiniva/i, '600/1200', 'jiniva-natural'], [/brit raven/i, '600/600', 'brit-raven'],
  [/aspire grey/i, /^(300\/600|600\/300)$/, 'aspire-grey'], [/stonella/i, /^(300\/600|600\/300)$/, 'dark-stonella'], [/eden ash/i, /^(300\/600|600\/300)$/, 'eden-ash'], [/rovero/i, /^(300\/600|600\/300)$/, 'rovero-dark-grey'], [/sand grig/i, /^(300\/600|600\/300)$/, 'sand-grigio'], [/unika/i, /^(300\/600|600\/300)$/, 'unika-gris'],
  [/kandla grey/i, null, 'step-kandla-grey', 'steps'], [/quart[sz] grey/i, null, 'step-quartz-grey', 'steps'], [/terra grey/i, null, 'edging-terra-grey', 'edging'], [/polar ivory/i, null, 'edging-polar-ivory', 'edging'],
  [/black granite/i, null, 'granite-black', 'granite'], [/silver granite/i, null, 'granite-silver', 'granite'], [/black cobble/i, null, 'granite-black-cobble', 'granite'], [/kandla grey circle/i, null, 'kandla-circle', 'circle'],
  [/joint.?tec.*pitch/i, null, 'jointtec-pitch-black'], [/joint.?tec.*granite/i, null, 'jointtec-granite-grey'], [/joint.?tec.*buff/i, null, 'jointtec-buff-sand'],
  [/por.?tec.*midnight/i, null, 'portec-midnight-grey'], [/por.?tec.*ivory/i, null, 'portec-ivory'], [/por.?tec.*dove/i, null, 'portec-dove'], [/por.?tec.*stro?r?m/i, null, 'portec-storm'], [/^primer$/i, null, 'primer'],
]
// The site sells one thickness per family; a sheet row at another thickness is a different product.
const THICK = { sandstone: '22 mm', limestone: '20 mm', porcelain: '20 mm', indoor: /^(8|9) mm$/ }
const used = new Set()
const siteId = (r) => {
  if (r.active !== 'YES') return null
  const fam = FAMILY[r.material.toLowerCase()]
  for (const [re, size, id, onlyFam] of SITE) {
    if (!re.test(tidy(r.colour))) continue
    if (onlyFam && fam !== onlyFam) continue
    if (size === 'mixed' && r.mode !== 'mixed') continue
    if (size && size !== 'mixed' && (size instanceof RegExp ? !size.test(r.size) : r.size !== size)) continue
    const t = THICK[fam]; if (t && !/clorado/i.test(r.colour) && !(t instanceof RegExp ? t.test(r.thickness) : r.thickness === t)) continue
    if (used.has(id)) continue
    used.add(id); return id
  }
  return null
}

const products = new Map(), components = []
for (const r of rows) {
  const family = FAMILY[r.material.toLowerCase()] || r.material.toLowerCase()
  const colour = cap(tidy(r.colour))
  if (r.component_size) {
    components.push({ code: r.code, size: r.size, per_pack: +r.per_pallet, m2: m2Of(r.size, r.m2_per_unit) })
    if (!products.has(r.code)) products.set(r.code, { code: r.code, name: `${colour} ${r.thickness} mixed patio pack`, family, colour, size: 'mixed', thickness: r.thickness, base_unit: 'slab', mode: 'mixed', per_pallet: 0, per_box: 0, m2_per_unit: 0, active: r.active === 'YES' ? 1 : 0, site_id: siteId(r), note: r.note || null })
    else if (r.active === 'YES') products.get(r.code).active = 1
    continue
  }
  if (products.has(r.code)) { const p = products.get(r.code); p.note = [p.note, r.note].filter(Boolean).join('; ') || null; if (r.active === 'YES') p.active = 1; continue }
  const unit = r.base_unit === 'pcs' ? 'piece' : r.base_unit
  const name = family === 'chemical' ? `${colour} ${r.thickness} ${unit}` : `${colour} ${sizeText(r.size)} ${r.thickness}`.replace(/\s+/g, ' ')
  products.set(r.code, { code: r.code, name, family, colour, size: r.size, thickness: r.thickness, base_unit: unit, mode: 'fixed', per_pallet: +r.per_pallet, per_box: +r.per_box, m2_per_unit: m2Of(r.size, r.m2_per_unit), active: r.active === 'YES' ? 1 : 0, site_id: siteId(r), note: r.note || null })
}
// Not in the sheet: the site sells these. Packing as the site assumes; the yard confirms.
products.set('LS-SINAPEAR-600X600-20', { code: 'LS-SINAPEAR-600X600-20', name: 'Sinai Pearl 600 × 600 mm 20 mm', family: 'limestone', colour: 'Sinai Pearl', size: '600/600', thickness: '20 mm', base_unit: 'slab', mode: 'fixed', per_pallet: 50, per_box: 0, m2_per_unit: 0.36, active: 1, site_id: 'sinai-pearl', note: 'not in the warehouse sheet; 50 slabs assumed, confirm' })
for (const [key, colour] of [['BUFFMIX', 'Buff Mix'], ['SILVQUAR', 'Silver Quartz'], ['MINT', 'Mint'], ['SLATGREE', 'Slate Green'], ['KANDGREY', 'Kandla Grey'], ['PALEGREY', 'Pale Grey']]) {
  const code = `CL-${key}-600X150-22`
  products.set(code, { code, name: `${colour} cladding 600 × 150 mm`, family: 'cladding', colour, size: '600/150', thickness: '22 mm', base_unit: 'slab', mode: 'fixed', per_pallet: 196, per_box: 7, m2_per_unit: 0.09, active: 1, site_id: 'cladding-' + colour.toLowerCase().replace(' ', '-'), note: 'colourway named from the store photograph; the sheet lists four cladding lines without colours' })
}
let sql = '-- Seed from wms/seed/products.csv (the warehouse sheet, September 2026). Generated by scripts/seed.mjs; do not edit by hand.\n'
for (const p of products.values()) sql += `INSERT INTO products (code, name, family, colour, size, thickness, base_unit, mode, per_pallet, per_box, m2_per_unit, active, site_id, note) VALUES (${[p.code, p.name, p.family, p.colour, p.size, p.thickness, p.base_unit, p.mode].map(q).join(', ')}, ${p.per_pallet}, ${p.per_box}, ${p.m2_per_unit}, ${p.active}, ${q(p.site_id)}, ${q(p.note)});\n`
for (const c of components) sql += `INSERT INTO components (code, size, per_pack, m2_per_unit) VALUES (${q(c.code)}, ${q(c.size)}, ${c.per_pack}, ${c.m2});\n`
writeFileSync(join(HERE, '..', 'migrations', '0002_seed.sql'), sql)
const active = [...products.values()].filter(p => p.active).length, mapped = [...products.values()].filter(p => p.site_id).length
console.log(`${products.size} products (${active} active, ${mapped} matched to the site), ${components.length} mixed-pack components`)
