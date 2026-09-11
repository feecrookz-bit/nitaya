/* Line diagrams for the guides. Dimensions are labelled in the units the
   trade uses; nothing decorative. Colours come from the page tokens. */
const ink = 'var(--ink)', ink2 = 'var(--ink-2)', hair = 'var(--hair-2)', sand = 'var(--gold)'
const T = ({ x, y, children, anchor = 'start', size = 12, fill = ink2, weight = 500 }) => <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontFamily="Geist, sans-serif" fontWeight={weight}>{children}</text>

export function BedBuildUp() {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 640 260" role="img" aria-label="Patio build-up: 22 mm slab on a 30 to 40 mm full mortar bed on 100 mm compacted Type 1, over the sub-grade">
        <rect x="40" y="40" width="440" height="24" fill="#B8AE9C" stroke={ink} />
        <rect x="40" y="64" width="440" height="34" fill="#D9D2C4" stroke={ink} />
        <rect x="40" y="98" width="440" height="90" fill="#E8E3DA" stroke={ink} />
        {[...Array(28)].map((_, i) => <circle key={i} cx={52 + (i % 14) * 31} cy={118 + Math.floor(i / 14) * 40} r="5" fill="#C9C1B2" />)}
        <path d="M40 188 H480" stroke={ink} /><path d="M40 210 H480" stroke={hair} strokeDasharray="4 4" />
        <T x={500} y={57} fill={ink}>Riven slab, 22 mm</T>
        <T x={500} y={86} fill={ink}>Full wet bed 30–40 mm</T><T x={500} y={101} size={11}>4:1 sharp sand : cement, slab back primed</T>
        <T x={500} y={140} fill={ink}>MOT Type 1, 100 mm</T><T x={500} y={155} size={11}>two layers, each compacted</T>
        <T x={500} y={203} fill={ink}>Sub-grade</T>
        <path d="M40 40 L40 30 M480 40 L480 30" stroke={ink} /><path d="M40 33 H480" stroke={ink} markerEnd="url(#a)" />
        <T x={260} y={26} anchor="middle" size={11}>fall 1 : 80 — 12.5 mm per metre, away from the house</T>
      </svg>
      <figcaption>The build-up, bottom to top. Falls are set in the Type 1, not made up in the mortar.</figcaption>
    </figure>
  )
}

export function JointWidths() {
  const slab = (x, y, w, h, f) => <rect x={x} y={y} width={w} height={h} fill={f} stroke={ink} strokeWidth="1" />
  return (
    <figure className="diagram">
      <svg viewBox="0 0 640 220" role="img" aria-label="Joint widths: 10 mm for riven sandstone, 3 to 5 mm for rectified porcelain">
        {[[40, 40], [40, 122]].map(([x, y], r) => [0, 1, 2].map(c => slab(x + c * 96 + (r ? 0 : c * 4), y, r ? 92 : 88, 60, r ? '#D9D9D6' : '#C7B9A0')))}
        <T x={355} y={62} fill={ink} weight={600}>Riven sandstone · 10 mm joints</T>
        <T x={355} y={80} size={11}>Riven edges need the room. Point with 3:1 sand and cement or a brush-in compound.</T>
        <T x={355} y={144} fill={ink} weight={600}>Rectified porcelain · 3–5 mm joints</T>
        <T x={355} y={162} size={11}>Two-part resin or a porcelain brush-in compound. Plain mortar cracks against a slab that doesn't move.</T>
        <path d="M128 30 L128 40 M140 30 L140 40" stroke={sand} strokeWidth="2" /><T x={134} y={26} anchor="middle" size={10} fill={sand} weight={600}>10</T>
        <path d="M132 112 L132 122 M136 112 L136 122" stroke={sand} strokeWidth="2" /><T x={134} y={108} anchor="middle" size={10} fill={sand} weight={600}>3–5</T>
      </svg>
      <figcaption>Joint width is decided by the edge of the slab, not by taste.</figcaption>
    </figure>
  )
}

export function MixedPack() {
  const mm = 0.22
  const sizes = [[900, 600], [600, 600], [600, 295], [295, 295]]
  let x = 30
  return (
    <figure className="diagram">
      <svg viewBox="0 0 640 210" role="img" aria-label="The four sizes in a mixed patio pack, drawn to scale: 900 by 600, 600 by 600, 600 by 295 and 295 by 295 millimetres">
        {sizes.map(([w, h], i) => { const el = (<g key={i}><rect x={x} y={30} width={w * mm} height={h * mm} fill="#C7B9A0" stroke={ink} /><T x={x + (w * mm) / 2} y={30 + h * mm + 18} anchor="middle" size={11} fill={ink}>{w} × {h}</T></g>); x += w * mm + 18; return el })}
        <T x={30} y={190} size={11}>18.19 m² per pack · sizes are modular: two 295s plus a 10 mm joint equal a 600 · laid random, no joint longer than ~1.5 m</T>
      </svg>
      <figcaption>Drawn to scale. Don't sort the pack by size — mix as you lay.</figcaption>
    </figure>
  )
}

export function AreaMaths() {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 640 200" role="img" aria-label="Worked example: 6 by 4 metres is 24 square metres, plus 10 percent is 26.4, which rounds up to two 18.19 square metre packs">
        <rect x="30" y="30" width="180" height="120" fill="#EAF0EB" stroke={ink} />
        <T x={120} y={95} anchor="middle" size={14} fill={ink} weight={600}>6 m × 4 m</T>
        <T x={120} y={113} anchor="middle" size={12}>= 24.00 m²</T>
        <T x={250} y={60} fill={ink} weight={600}>+ 10% for cuts</T><T x={250} y={78} size={12}>26.40 m²</T>
        <T x={250} y={112} fill={ink} weight={600}>÷ 18.19 m² per pack</T><T x={250} y={130} size={12}>1.45 → rounds up to 2 packs = 36.38 m²</T>
        <T x={250} y={164} size={11}>The 10 m² left over is your cuts, breakages and the day a slab cracks in five years.</T>
      </svg>
      <figcaption>Whole packs only — mixed sandstone packs can't be split.</figcaption>
    </figure>
  )
}

export const GUIDE_DIAGRAM = { 'laying-indian-sandstone': BedBuildUp, 'laying-20mm-porcelain': JointWidths, 'mixed-patio-pack': MixedPack, 'how-many-packs': AreaMaths }
