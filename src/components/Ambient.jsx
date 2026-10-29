import { useEffect } from 'react'

const GLYPHS = ['❤', '✿', '❀', '♥', '✦']
const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 12 + Math.random() * 22,
  dur: 12 + Math.random() * 14,
  delay: -Math.random() * 26,
  glyph: GLYPHS[i % GLYPHS.length],
}))

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 1 + Math.random() * 2,
  delay: Math.random() * 4,
}))

export function FloatingHearts() {
  return (
    <div className="ambient" aria-hidden>
      {STARS.map((s) => (
        <span
          key={`s${s.id}`}
          className="twinkle"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
      {PETALS.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  )
}

const TRAIL = ['💖', '💕', '✨', '💗']

export function HeartTrail() {
  useEffect(() => {
    let last = 0
    const onMove = (e) => {
      const now = performance.now()
      if (now - last < 45) return
      last = now
      const el = document.createElement('span')
      el.className = 'trail-heart'
      el.textContent = TRAIL[Math.floor(Math.random() * TRAIL.length)]
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
      el.style.setProperty('--dx', `${Math.random() * 40 - 20}px`)
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 1000)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return null
}

// One dash per chapter (the first is the birthday lock); visited chapters can be tapped to jump there
export function Progress({ step, maxStep, total, onGo }) {
  return (
    <nav className="progress">
      {Array.from({ length: total }, (_, i) => {
        const target = i
        const reachable = target <= maxStep
        return (
          <button
            key={i}
            className={`${target <= step ? 'on' : ''} ${target === step ? 'current' : ''}`}
            disabled={!reachable || target === step}
            onClick={() => onGo(target)}
            aria-label={`Go to chapter ${target}`}
          >
            <span />
          </button>
        )
      })}
    </nav>
  )
}
