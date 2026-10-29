import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { photos } from '../data/memories'
import { celebrate, pop, vibrate } from '../utils/fx'

const GOAL = 20
const BASKET_Y = 0.86

export default function CatchHearts({ onNext }) {
  const areaRef = useRef(null)
  const basketRef = useRef(0.5)
  const itemsRef = useRef([])
  const scoreRef = useRef(0)
  const [basketX, setBasketX] = useState(0.5)
  const [items, setItems] = useState([])
  const [score, setScore] = useState(0)
  const [floaters, setFloaters] = useState([])
  const [started, setStarted] = useState(false)
  const done = score >= GOAL

  useEffect(() => {
    if (!started || done) return
    let raf
    let last = performance.now()
    let spawn = 0
    let id = 0
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      spawn -= dt
      if (spawn <= 0) {
        spawn = 0.5
        const r = Math.random()
        const kind = r < 0.18 ? 'broken' : r < 0.38 ? 'photo' : 'heart'
        itemsRef.current.push({
          id: `${now}-${id++}`,
          x: 0.06 + Math.random() * 0.88,
          y: -0.05,
          v: 0.22 + Math.random() * 0.2 + scoreRef.current * 0.006,
          kind,
          photo: kind === 'photo' && photos.length ? photos[Math.floor(Math.random() * photos.length)].src : null,
        })
      }
      const bx = basketRef.current
      itemsRef.current = itemsRef.current.filter((it) => {
        it.y += it.v * dt
        if (it.y > BASKET_Y - 0.05 && it.y < BASKET_Y + 0.03 && Math.abs(it.x - bx) < 0.11) {
          const delta = it.kind === 'broken' ? -2 : it.kind === 'photo' ? 2 : 1
          scoreRef.current = Math.max(0, scoreRef.current + delta)
          setScore(scoreRef.current)
          setFloaters((f) => [...f.slice(-5), { id: it.id, x: it.x, text: delta > 0 ? `+${delta}` : `${delta}` }])
          if (delta > 0) pop()
          vibrate(delta > 0 ? 20 : 120)
          if (scoreRef.current >= GOAL) celebrate()
          return false
        }
        return it.y < 1.05
      })
      setItems([...itemsRef.current])
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [started, done])

  const move = (e) => {
    const r = areaRef.current.getBoundingClientRect()
    const x = Math.min(0.95, Math.max(0.05, (e.clientX - r.left) / r.width))
    basketRef.current = x
    setBasketX(x)
  }

  const pct = Math.min(100, Math.round((score / GOAL) * 100))

  return (
    <div className="catch-chapter">
      <div className="meter-box">
        <span>Love meter</span>
        <div className="meter big">
          <motion.div animate={{ width: `${pct}%` }} />
        </div>
        <b>{pct}%</b>
      </div>

      <div ref={areaRef} className="game" onPointerMove={move} onPointerDown={move}>
        {items.map((it) => (
          <div key={it.id} className="fall" style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%` }}>
            {it.kind === 'photo' ? <img src={it.photo} alt="" /> : it.kind === 'broken' ? '💔' : '💖'}
          </div>
        ))}
        {floaters.map((f) => (
          <span key={f.id} className={`floater ${f.text.startsWith('-') ? 'neg' : ''}`} style={{ left: `${f.x * 100}%`, top: `${BASKET_Y * 100 - 8}%` }}>
            {f.text}
          </span>
        ))}
        <div className="basket" style={{ left: `${basketX * 100}%`, top: `${BASKET_Y * 100}%` }}>
          🧺
        </div>

        {!started && (
          <div className="game-intro">
            <h1 className="title">Catch my love 💖</h1>
            <p className="subtitle">
              Move your finger to catch the falling hearts.
              <br />
              💖 = +1 · photo = +2 · 💔 = −2
            </p>
            <motion.button className="btn" whileTap={{ scale: 0.92 }} onClick={() => setStarted(true)}>
              Start ▶
            </motion.button>
          </div>
        )}

        {done && (
          <motion.div className="game-intro" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}>
            <h1 className="title">Love meter: 100% 💯</h1>
            <p className="subtitle">You caught all my love… now see what it made 💞</p>
            <motion.button className="btn" whileTap={{ scale: 0.92 }} onClick={onNext}>
              The grand finale 🎆
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
