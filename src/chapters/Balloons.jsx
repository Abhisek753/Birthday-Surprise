import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG } from '../config'
import { photos } from '../data/memories'
import { heartBurst, pop, vibrate } from '../utils/fx'

const COLORS = ['#ff5c93', '#ffd27a', '#c084fc', '#60a5fa', '#34d399', '#fb7185', '#f472b6', '#fbbf24', '#a78bfa', '#f87171']

function makeBalloons(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: 5 + ((i * 37) % 85),
    dur: 8 + Math.random() * 5,
    delay: -Math.random() * 10,
    color: COLORS[i % COLORS.length],
    photo: photos.length ? photos[(i * 7 + 3) % photos.length].src : null,
  }))
}

export default function Balloons({ onNext }) {
  const [balloons] = useState(() => makeBalloons(CONFIG.reasons.length))
  const [popped, setPopped] = useState([])
  const [open, setOpen] = useState(null)
  const allPopped = popped.length === balloons.length

  const popBalloon = (b, e) => {
    pop()
    vibrate(25)
    heartBurst({
      particleCount: 18,
      spread: 360,
      startVelocity: 18,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
    })
    setPopped((p) => [...p, b.id])
    setOpen(b)
  }

  return (
    <div className="balloons">
      <div className="balloons-head">
        <h1 className="title">Pop the balloons 🎈</h1>
        <p className="subtitle">
          Each one hides a reason why I love you · {popped.length}/{balloons.length}
        </p>
      </div>

      {balloons.map(
        (b) =>
          !popped.includes(b.id) && (
            <div
              key={b.id}
              className="balloon-wrap"
              style={{ left: `${b.left}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
            >
              <button
                className="balloon"
                style={{ '--c': b.color, animationDelay: `${b.delay / 3}s` }}
                onPointerDown={(e) => popBalloon(b, e)}
                aria-label="Pop balloon"
              >
                💗
              </button>
            </div>
          ),
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              className="polaroid"
              initial={{ scale: 0.3, rotate: -15, y: 80 }}
              animate={{ scale: 1, rotate: -2, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            >
              {open.photo && <img src={open.photo} alt="" />}
              <div className="caption">
                <b>Reason #{open.id + 1}</b>
                <span>{CONFIG.reasons[open.id]}</span>
              </div>
              <small>tap anywhere to continue</small>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {allPopped && !open && (
        <motion.div className="balloons-done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <h2 className="title small">…and a million more reasons 💞</h2>
          <motion.button className="btn" whileTap={{ scale: 0.92 }} onClick={onNext}>
            Next →
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
