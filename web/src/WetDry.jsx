import { useRef, useState } from 'react'
/*
 * Drag slider: dry on the left, wet on the right. `wet` should be a photo of
 * the same slab hosed; until one exists the wet side is simulated from the
 * dry image (darker, richer, a soft sheen) and labelled as such.
 */
export default function WetDry({ dry, wet, name }) {
  const [pos, setPos] = useState(50)
  const ref = useRef()
  const simulated = !wet
  const move = (clientX) => { const r = ref.current.getBoundingClientRect(); setPos(Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100))) }
  return (
    <div className="wetdry" ref={ref}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX) }}
      onPointerMove={e => { if (e.buttons) move(e.clientX) }}>
      <img className="dry" src={dry} alt={`${name}, dry`} draggable="false" />
      <div className="wet" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={wet || dry} alt={`${name}, wet`} draggable="false" style={simulated ? { filter: 'brightness(.72) saturate(1.45) contrast(1.12)' } : undefined} />
        {simulated && <div className="sheen" />}
      </div>
      <div className="handle" style={{ left: `${pos}%` }} role="slider" aria-label="Compare dry and wet" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)} tabIndex={0}
        onKeyDown={e => { if (e.key === 'ArrowLeft') setPos(p => Math.max(2, p - 4)); if (e.key === 'ArrowRight') setPos(p => Math.min(98, p + 4)) }}>
        <span>‹ ›</span>
      </div>
      <span className="lbl l">Dry</span>
      <span className="lbl r">{simulated ? 'Wet · simulated' : 'Wet'}</span>
    </div>
  )
}
