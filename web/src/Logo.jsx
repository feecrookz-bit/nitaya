/*
 * Modernised Nitya Stones mark. The original is a gold, filigreed "N" under a
 * flourished arch with NITYA STONES in Roman caps on green. This keeps the
 * three ideas — monogram, arch, inscriptional caps — redrawn at one stroke
 * weight so it holds at 22 px in a nav bar and at 400 px on a van. The
 * monogram is the only place the brand gold survives on the page.
 */
export function Monogram({ size = 36, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 40c0-16 10-28 24-28s24 12 24 28" />
      <path d="M8 40c-2 4-5 6-7 6M56 40c2 4 5 6 7 6" />
      <path d="M22 50V22l20 28V22" />
    </svg>
  )
}

export default function Logo({ compact = false }) {
  return (
    <span className="logo">
      <Monogram size={compact ? 26 : 40} color="var(--gold)" />
      <span className="logo-word">
        <b>Nitya Stones</b>
        {!compact && <small>Porcelain &amp; Sandstone Supplier</small>}
      </span>
    </span>
  )
}
