// Turn the two files Simar's side produces into ledger movements.
//   node scripts/import.mjs opening ../seed/opening_balance.csv   -> migrations/0004_opening_balance.sql
//   node scripts/import.mjs history ../seed/transactions.csv      -> migrations/0005_history.sql
// Every row is checked against the product codes; unknown codes, bad units and bad types stop the run with a list.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const [kind, file] = process.argv.slice(2)
if (!['opening', 'history'].includes(kind) || !file) { console.error('usage: node scripts/import.mjs opening|history <csv>'); process.exit(1) }

const parse = (text) => { const lines = text.replace(/^﻿/, '').trim().split(/\r?\n/); const head = lines[0].split(',').map(h => h.trim().toLowerCase()); return lines.slice(1).filter(Boolean).map(l => { const cells = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { cells.push(cur); cur = '' } else cur += ch } cells.push(cur); return Object.fromEntries(head.map((h, i) => [h, (cells[i] || '').trim()])) }) }
const seed = readFileSync(join(HERE, '..', 'migrations', '0002_seed.sql'), 'utf8')
const products = new Map([...seed.matchAll(/INSERT INTO products \(code, name, family, colour, size, thickness, base_unit, mode[^)]*\) VALUES \('([^']+)', '[^']*', '[^']*', '[^']*', '[^']*', '[^']*', '([^']+)'/g)].map(m => [m[1], m[2]]))
const q = (s) => s == null || s === '' ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`
const rows = parse(readFileSync(file, 'utf8'))
const problems = [], out = []
const TYPES = ['goods_in', 'sale', 'dispatch', 'collection', 'breakage', 'adjustment', 'transfer', 'return']

rows.forEach((r, i) => {
  const line = i + 2
  const code = (r.code || '').toUpperCase()
  if (!products.has(code)) return problems.push(`line ${line}: unknown code ${code || '(blank)'}`)
  const unit = products.get(code)
  if (r.unit && r.unit.toLowerCase() !== unit && !(unit === 'slab' && r.unit.toLowerCase() === 'slabs') && !(r.unit.toLowerCase().replace(/s$/, '') === unit)) return problems.push(`line ${line}: ${code} is counted in ${unit}s, not ${r.unit}`)
  const qty = Number(r.quantity)
  if (!Number.isFinite(qty)) return problems.push(`line ${line}: quantity "${r.quantity}" is not a number`)
  if (kind === 'opening') {
    if (qty < 0) return problems.push(`line ${line}: a count cannot be negative`)
    if (qty === 0) return
    const day = r.counted_on || r.date || new Date().toISOString().slice(0, 10)
    out.push(`INSERT INTO movements (at, user_email, type, code, bay_id, quantity, reference, note) VALUES (${q(day + ' 08:00:00')}, ${q(r.counted_by || 'import')}, 'goods_in', ${q(code)}, ${q(r.bay || 'yard')}, ${qty}, 'opening balance', ${q(r.note)});`)
  } else {
    const type = (r.type || '').toLowerCase()
    if (!TYPES.includes(type)) return problems.push(`line ${line}: type "${r.type}" is not one of ${TYPES.join(', ')}`)
    const signed = ['goods_in', 'return'].includes(type) ? Math.abs(qty) : type === 'adjustment' ? qty : -Math.abs(qty)
    if (!r.at && !r.date) return problems.push(`line ${line}: no date`)
    out.push(`INSERT INTO movements (at, user_email, type, code, bay_id, quantity, reference, note) VALUES (${q(r.at || r.date)}, ${q(r.user || 'tracker')}, ${q(type)}, ${q(code)}, ${q(r.bay || 'yard')}, ${signed}, ${q(r.reference)}, ${q(r.note)});`)
  }
})
if (problems.length) { console.error(`${problems.length} problem(s), nothing written:\n  ` + problems.slice(0, 40).join('\n  ')); process.exit(1) }
const dest = join(HERE, '..', 'migrations', kind === 'opening' ? '0004_opening_balance.sql' : '0005_history.sql')
if (existsSync(dest)) { console.error(`${dest} exists already; remove it first if this is a re-import`); process.exit(1) }
writeFileSync(dest, `-- ${kind === 'opening' ? 'Opening balance' : 'History'} imported from ${file} by scripts/import.mjs\n` + out.join('\n') + '\n')
console.log(`${out.length} movement(s) written to ${dest}`)
