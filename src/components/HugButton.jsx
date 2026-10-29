import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { heartBurst, vibrate } from '../utils/fx'

const HOLD_MS = 1500
const R = 26
const CIRC = 2 * Math.PI * R

export default function HugButton() {
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState(false)
  const raf = useRef(0)
  const startT = useRef(0)

  const finish = () => {
    vibrate([80, 40, 80, 40, 220])
    heartBurst({ origin: { x: 0.12, y: 0.9 }, particleCount: 40, angle: 70 })
    setToast(true)
    setTimeout(() => {
      setToast(false)
      setProgress(0)
    }, 2400)
  }

  const tick = (now) => {
    const p = Math.min(1, (now - startT.current) / HOLD_MS)
    setProgress(p)
    if (p < 1) raf.current = requestAnimationFrame(tick)
    else finish()
  }

  const start = (e) => {
    e.stopPropagation()
    if (toast) return
    startT.current = performance.now()
    raf.current = requestAnimationFrame(tick)
  }

  const cancel = () => {
    cancelAnimationFrame(raf.current)
    if (!toast) setProgress(0)
  }

  return (
    <>
      <button
        className="hug-btn glass"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Hold for a hug"
      >
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={R} className="hug-track" />
          <circle
            cx="32"
            cy="32"
            r={R}
            className="hug-fill"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
          />
        </svg>
        <span style={{ transform: `scale(${1 + progress * 0.5})` }}>🤗</span>
        <small>hold</small>
      </button>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast glass"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
          >
            Virtual hug delivered 🤗💞
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
