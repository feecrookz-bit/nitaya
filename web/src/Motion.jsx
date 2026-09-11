import { useEffect, useRef, useState } from 'react'

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Cross-fading Ken Burns slideshow. Each slide drifts and zooms for the
   length of its turn; the next fades over the top. Reads like footage, made
   from the yard's own stills. The first slide is visible immediately. */
export function HeroSlides({ slides, interval = 6500 }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduced() || slides.length < 2) return
    const t = setInterval(() => setI(n => (n + 1) % slides.length), interval)
    return () => clearInterval(t)
  }, [slides.length, interval])
  return (
    <div className="slides" aria-hidden="true">
      {slides.map((s, n) => (
        <div key={s.src} className={`slide ${n === i ? 'on' : ''} kb${n % 4}`} style={{ backgroundImage: `url(${s.src})` }} />
      ))}
      <div className="slide-caption" key={i}>{slides[i].caption}</div>
    </div>
  )
}

/* Infinite horizontal drift of tiles. Two copies of the row so the loop is
   seamless; direction flips per row. Pauses on hover. */
export function Marquee({ items, reverse = false, speed = 60 }) {
  return (
    <div className={`marquee ${reverse ? 'reverse' : ''}`} style={{ '--dur': `${speed}s` }}>
      <div className="marquee-track">
        {[...items, ...items].map((it, n) => (
          <a key={n} className="marquee-tile" href={it.href} tabIndex={n < items.length ? 0 : -1} aria-hidden={n >= items.length}>
            <img src={it.img} alt={n < items.length ? it.name : ''} />
            <span>{it.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

/* Counts from 0 to the target the first time it scrolls into view. */
export function CountUp({ to, prefix = '', suffix = '', duration = 1400, plain = false }) {
  const ref = useRef()
  const [v, setV] = useState(reduced() ? to : 0)
  useEffect(() => {
    if (reduced() || !ref.current || !('IntersectionObserver' in window)) { setV(to); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const step = (t) => { const k = Math.min(1, (t - t0) / duration); const ease = 1 - Math.pow(1 - k, 3); setV(Math.round(to * ease)); if (k < 1) requestAnimationFrame(step) }
      requestAnimationFrame(step)
    }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [to, duration])
  return <span ref={ref}>{prefix}{plain ? String(v) : v.toLocaleString('en-GB')}{suffix}</span>
}

/* Adds .in to [data-reveal] elements as they enter the viewport. Elements
   render visible by default; the class only drives the entrance for ones
   below the fold. */
export function useReveal(dep) {
  useEffect(() => {
    if (reduced() || !('IntersectionObserver' in window)) return
    const els = [...document.querySelectorAll('[data-reveal]:not(.in)')]
    const vh = window.innerHeight
    els.forEach(el => { if (el.getBoundingClientRect().top > vh * 0.9) el.classList.add('pre') })
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); e.target.classList.remove('pre'); io.unobserve(e.target) } }), { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}

/* Gentle parallax: moves the child a fraction of the scroll distance. */
export function Parallax({ children, amount = 0.12, className = '' }) {
  const ref = useRef()
  useEffect(() => {
    if (reduced() || !ref.current) return
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const r = ref.current.getBoundingClientRect(); const mid = r.top + r.height / 2 - window.innerHeight / 2
      ref.current.style.setProperty('--py', `${(-mid * amount).toFixed(1)}px`) }) }
    on(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [amount])
  return <div ref={ref} className={`parallax ${className}`}>{children}</div>
}
