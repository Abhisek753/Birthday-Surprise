import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CONFIG } from '../config'
import { birthdayAge, formatBirthday } from '../data/memories'
import { celebrate, pop, vibrate } from '../utils/fx'

const NEED = 6

export default function GiftBox({ onNext, birthday }) {
  const [taps, setTaps] = useState(0)
  const count = useRef(0)
  const asked = useRef(false)
  const opened = taps >= NEED

  const hit = useCallback(() => {
    if (count.current >= NEED) return
    count.current += 1
    setTaps(count.current)
    vibrate(35)
    pop()
    if (count.current === NEED) setTimeout(celebrate, 250)
  }, [])

  // Shaking the phone also counts as a tap
  useEffect(() => {
    let lastShake = 0
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity
      if (!a) return
      const force = Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z)
      const now = Date.now()
      if (force > 32 && now - lastShake > 450) {
        lastShake = now
        hit()
      }
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [hit])

  const onTap = () => {
    // iOS needs permission for motion events, asked on the first tap
    if (!asked.current && typeof DeviceMotionEvent?.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().catch(() => {})
    }
    asked.current = true
    hit()
  }

  const k = 1 + taps * 0.5

  return (
    <div className="giftbox">
      <h1 className="title">A gift for you 🎁</h1>
      <p className="subtitle">
        {opened ? 'Surprise!' : `Tap the box (or shake your phone!) — ${NEED - taps} more…`}
      </p>

      <div className="gift-stage" onClick={opened ? undefined : onTap}>
        <motion.div
          className="gift-glow"
          animate={{ scale: opened ? 3 : 1 + taps * 0.12, opacity: opened ? 0.9 : 0.35 + taps * 0.08 }}
        />
        <motion.div
          key={taps}
          className="gift"
          animate={opened ? {} : { rotate: [0, -6 * k, 6 * k, -3 * k, 0], y: [0, -8 * k, 0] }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="gift-lid"
            animate={opened ? { y: -260, rotate: -35, opacity: 0 } : {}}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <span className="bow">🎀</span>
          </motion.div>
          <div className="gift-base" />
        </motion.div>

        {opened && (
          <motion.div
            className="gift-message"
            initial={{ y: 40, scale: 0.4, opacity: 0 }}
            animate={{ y: -110, scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
          >
            <div className="title small">Happy Birthday, {CONFIG.name}!</div>
            {birthday && <div className="date-chip">🎂 {formatBirthday(birthday)} · turning {birthdayAge(birthday)} 🎉</div>}
            <p>Your little birthday adventure starts now ✨</p>
          </motion.div>
        )}
      </div>

      {opened && (
        <motion.button
          className="btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileTap={{ scale: 0.92 }}
          onClick={onNext}
        >
          Let's go →
        </motion.button>
      )}
    </div>
  )
}
