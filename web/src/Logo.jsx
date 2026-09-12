import logo from './assets/logo.png'
/* The original Nitya Stones mark — gold monogram in a ring under a
   flourished arch, NITYA STONES beneath — cleaned of its background-removal
   fringe and upscaled for retina. Height set by context. */
export default function Logo({ compact = false }) {
  return <img className={`logo ${compact ? 'compact' : ''}`} src={logo} alt="Nitya Stones" width={compact ? 106 : 160} height={compact ? 54 : 82} />
}
