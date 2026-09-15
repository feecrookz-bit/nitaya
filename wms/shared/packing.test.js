import { test } from 'node:test'
import assert from 'node:assert/strict'
import { coverOf, quantify, mixFill, mixText, packFrom } from './packing.js'

const MIXED_22 = { mode: 'mixed', unit: 'slab', split: true, sizes: [['900 × 600', 16, 0.54], ['600 × 600', 16, 0.36], ['600 × 290', 16, 0.174], ['290 × 290', 12, 0.0841]] }
const KANDLA_900 = { mode: 'fixed', unit: 'slab', split: true, perPack: 40, slabM2: 0.54, perBox: 0 }
const QUARTZ = { mode: 'fixed', unit: 'slab', split: true, perPack: 40, slabM2: 0.54, perBox: 0 }
const INDOOR_1200 = { mode: 'fixed', unit: 'box', split: false, perPack: 64, slabM2: 0.72, perBox: 2 }

test('mixed pack covers 18.19 m² in 60 slabs', () => {
  assert.equal(coverOf(MIXED_22), 18.19)
})

test('55 m² of a mixed pack is 3 packs + 2 loose slabs = 55.01 m², not 4 packs', () => {
  const q = quantify(MIXED_22, 55)
  assert.equal(q.packs, 3); assert.equal(q.slabs, 2); assert.equal(q.m2, 55.01)
  assert.equal(mixText(MIXED_22, q.mix), '1 × 600 × 600, 1 × 290 × 290')
})

test('a whole number of mixed packs stays whole', () => {
  assert.deepEqual(quantify(MIXED_22, 36.38), { packs: 2, slabs: 0, m2: 36.38 })
})

test('26.4 m² of a 900 × 600 porcelain is 1 pallet + 9 slabs = 26.46 m²', () => {
  assert.deepEqual(quantify(QUARTZ, 26.4), { packs: 1, slabs: 9, m2: 26.46 })
})

test('loose slabs that reach a whole pack become one', () => {
  assert.deepEqual(quantify(KANDLA_900, 21.6), { packs: 1, slabs: 0, m2: 21.6 })
  assert.deepEqual(quantify(KANDLA_900, 43.1), { packs: 2, slabs: 0, m2: 43.2 })
})

test('boxes round up and never split', () => {
  const q = quantify({ ...INDOOR_1200, perPack: 2, slabM2: 0.72 }, 5)
  assert.equal(q.packs, 4); assert.equal(q.slabs, 0); assert.equal(q.m2, 5.76)
})

test('the smallest order is one slab', () => {
  assert.deepEqual(quantify(KANDLA_900, 0.1), { packs: 0, slabs: 1, m2: 0.54 })
})

test('mixFill never overshoots by more than one small slab', () => {
  for (let m2 = 0.1; m2 < 18.19; m2 += 0.37) {
    const f = mixFill(MIXED_22, m2)
    assert.ok(f.m2 >= m2 - 1e-9 && f.m2 - m2 <= 0.0841 + 1e-9, `${m2} -> ${f.m2}`)
  }
})

test('packFrom builds a pack from stock-system rows', () => {
  const p = packFrom({ base_unit: 'slab', mode: 'mixed', family: 'sandstone' }, [
    { size: '600/900', per_pack: 16, m2_per_unit: 0.54 }, { size: '600/600', per_pack: 16, m2_per_unit: 0.36 },
    { size: '290/600', per_pack: 16, m2_per_unit: 0.174 }, { size: '290/290', per_pack: 12, m2_per_unit: 0.0841 }])
  assert.equal(coverOf(p), 18.19); assert.equal(p.perPack, 60)
  const box = packFrom({ base_unit: 'slab', mode: 'fixed', family: 'indoor', per_pallet: 64, per_box: 2, m2_per_unit: 0.72 })
  assert.equal(box.unit, 'box'); assert.equal(box.split, false)
  const clad = packFrom({ base_unit: 'slab', mode: 'fixed', family: 'cladding', per_pallet: 196, per_box: 7, m2_per_unit: 0.09 })
  assert.equal(clad.split, false)
})
