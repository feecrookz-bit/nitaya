/*
 * Pack maths, once, for the site and the stock system.
 *
 * A pack is { mode: 'fixed' | 'mixed', unit: 'slab' | 'box' | 'bucket' | 'piece',
 *   perPack, slabM2, perBox, sizes: [[name, count, m2], ...], split }
 * `sizes` is only set for mixed packs. `split` says whether loose units are sold.
 *
 * quantify(pack, m2) turns an area into what leaves the yard: whole packs plus
 * the loose units that make up the rest. Mixed packs split in their own sizes,
 * single-size packs by the slab, boxes and buckets stay whole.
 */
export const round2 = (n) => Math.round(n * 100) / 100

export function coverOf(k) {
  if (k.mode === 'mixed') return round2(k.sizes.reduce((s, [, n, m2]) => s + n * m2, 0))
  return round2(k.perPack * k.slabM2)
}

/* Loose slabs for a mixed pack: the remainder made up in the pack's own sizes.
 * First the sizes in the pack's proportion, then the last bit largest slab
 * first, so the overshoot is never more than one small slab. */
export function mixFill(k, rem) {
  const cover = coverOf(k), counts = k.sizes.map(() => 0)
  let left = rem
  k.sizes.forEach(([, n, m2], i) => { const c = Math.floor(rem * n / cover); counts[i] += c; left -= c * m2 })
  const order = k.sizes.map((sz, i) => [sz[2], i]).sort((a, b) => b[0] - a[0])
  for (const [m2, i] of order) { const c = Math.floor(left / m2 + 1e-9); counts[i] += c; left -= c * m2 }
  if (left > 1e-9) { const [, i] = order[order.length - 1]; counts[i] += 1; left -= k.sizes[i][2] }
  const m2 = round2(k.sizes.reduce((t, [, , sm2], i) => t + counts[i] * sm2, 0))
  return { counts, slabs: counts.reduce((a, b) => a + b, 0), m2 }
}

export const mixText = (k, counts) => k.sizes.map(([name], i) => counts[i] ? `${counts[i]} × ${name}` : null).filter(Boolean).join(', ')

export function quantify(k, m2) {
  const cover = coverOf(k)
  if (!cover) return { packs: Math.max(1, Math.ceil(m2 - 1e-9)), slabs: 0, m2: Math.max(1, Math.ceil(m2 - 1e-9)) }
  if (k.split && k.mode === 'mixed') {
    const packs = Math.floor(m2 / cover + 1e-9), rem = m2 - packs * cover
    if (rem <= 1e-9) return { packs: Math.max(1, packs), slabs: 0, m2: round2(Math.max(1, packs) * cover) }
    const fill = mixFill(k, rem)
    if (fill.slabs >= k.sizes.reduce((t, [, n]) => t + n, 0)) return { packs: packs + 1, slabs: 0, m2: round2((packs + 1) * cover) }
    return { packs, slabs: fill.slabs, mix: fill.counts, mixM2: fill.m2, m2: round2(packs * cover + fill.m2) }
  }
  if (k.split) {
    let packs = Math.floor(m2 / cover + 1e-9); const rem = m2 - packs * cover
    let slabs = rem > 1e-9 ? Math.ceil(rem / k.slabM2 - 1e-9) : 0
    if (slabs >= k.perPack) { packs += 1; slabs = 0 }
    if (packs === 0 && slabs === 0) slabs = 1
    return { packs, slabs, m2: round2(packs * cover + slabs * k.slabM2) }
  }
  const packs = Math.max(1, Math.ceil(m2 / cover - 1e-9))
  return { packs, slabs: 0, m2: round2(packs * cover) }
}

/* Build a pack from product and component rows as the stock system stores them. */
export function packFrom(product, components = []) {
  const unit = (product.base_unit || 'slab').toLowerCase()
  if (product.mode === 'mixed' && components.length) {
    const sizes = components.map(c => [c.size.split('/').map(Number).sort((a, b) => b - a).join(' × '), c.per_pack, c.m2_per_unit])
    return { mode: 'mixed', unit, sizes, split: true, perPack: sizes.reduce((t, [, n]) => t + n, 0) }
  }
  const perBox = product.per_box || 0
  const split = unit === 'slab' && !perBox && product.family !== 'cladding'
  return { mode: 'fixed', unit: perBox ? 'box' : unit, perPack: product.per_pallet, slabM2: product.m2_per_unit || 0, perBox, split }
}

/* Every unit price the site shows, from one per-m² price. */
export const slabPrice = (k, m2Price) => k.slabM2 ? round2(m2Price * k.slabM2) : null
export const packPrice = (k, m2Price) => round2(m2Price * coverOf(k))
