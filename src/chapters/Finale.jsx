import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG } from '../config'
import { birthdayAge, formatBirthday, photos, videos } from '../data/memories'
import { celebrate, fireworks } from '../utils/fx'

const RINGS = [1, 0.74, 0.5, 0.27]

// Points on concentric heart curves, normalised to roughly [-1, 1]
function heartPoints(n) {
  const total = RINGS.reduce((a, b) => a + b, 0)
  const counts = RINGS.map((s) => Math.max(1, Math.round((n * s) / total)))
  counts[0] += n - counts.reduce((a, b) => a + b, 0)
  const pts = []
  RINGS.forEach((s, ri) => {
    for (let i = 0; i < counts[ri]; i++) {
      const t = (i / counts[ri]) * Math.PI * 2
      const x = 16 * Math.sin(t) ** 3
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
      pts.push({ x: (x * s) / 17, y: (-y * s) / 17 + 0.15 })
    }
  })
  return pts
}

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return vp
}

export default function Finale({ onRestart, birthday }) {
  const { w, h } = useViewport()
  const [tiles] = useState(() =>
    heartPoints(photos.length).map((p, i) => ({
      ...p,
      src: photos[i].src,
      fromX: (Math.random() - 0.5) * 1600,
      fromY: (Math.random() - 0.5) * 1600,
      fromR: (Math.random() - 0.5) * 360,
      rot: (Math.random() - 0.5) * 16,
    })),
  )
  const [phase, setPhase] = useState('heart')
  const [video, setVideo] = useState(false)

  const size = Math.min(w - 32, h * 0.52, 560)
  const R = size * 0.46
  const tile = size * 0.11
  const assembleMs = tiles.length * 40 + 1800

  useEffect(() => {
    const id = setTimeout(() => setPhase('text'), assembleMs)
    return () => clearTimeout(id)
  }, [assembleMs])

  useEffect(() => {
    if (phase !== 'text') return
    celebrate()
    return fireworks(8000)
  }, [phase])

  const openVideo = () => {
    window.dispatchEvent(new Event('music:pause'))
    setVideo(true)
  }
  const closeVideo = () => {
    setVideo(false)
    window.dispatchEvent(new Event('music:resume'))
  }

  return (
    <div className="finale">
      <motion.div
        className="heart-box"
        style={{ width: size, height: size }}
        animate={phase === 'text' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        {tiles.map((t, i) => (
          <motion.img
            key={i}
            src={t.src}
            alt=""
            className="heart-tile"
            style={{ width: tile, height: tile, left: size / 2 + t.x * R - tile / 2, top: size / 2 + t.y * R - tile / 2 }}
            initial={{ x: t.fromX, y: t.fromY, rotate: t.fromR, opacity: 0, scale: 0.2 }}
            animate={{ x: 0, y: 0, rotate: t.rot, opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 60, damping: 13 }}
            whileHover={{ scale: 2.2, zIndex: 10, rotate: 0 }}
          />
        ))}
      </motion.div>

      {phase === 'text' && (
        <div className="finale-text">
          <svg viewBox="0 0 600 170" className="hb-svg">
            <text x="300" y="70" textAnchor="middle" className="l1">
              Happy Birthday
            </text>
            <text x="300" y="150" textAnchor="middle" className="l2">
              {CONFIG.name} 💖
            </text>
          </svg>
          {birthday && (
            <motion.div className="date-chip" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 3.4 }}>
              🎂 {formatBirthday(birthday)} · turning {birthdayAge(birthday)} 🎉
            </motion.div>
          )}
          <motion.p className="subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }}>
            {CONFIG.finaleMessage}
          </motion.p>
          <motion.div className="row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 5 }}>
            {videos.length > 0 && (
              <button className="btn" onClick={openVideo}>
                🎁 One last gift
              </button>
            )}
            <button className="btn ghost" onClick={onRestart}>
              ↺ Relive it
            </button>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {video && (
          <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeVideo}>
            <motion.video
              className="gift-video"
              src={videos[0]}
              controls
              autoPlay
              playsInline
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
