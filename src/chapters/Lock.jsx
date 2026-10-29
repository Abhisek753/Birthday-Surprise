import { Fragment, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CONFIG } from '../config'
import { formatBirthday, parseBirthday } from '../data/memories'
import { chime, heartBurst, vibrate } from '../utils/fx'

const GROUPS = [
  { label: 'Day', ph: 'D', size: 2 },
  { label: 'Month', ph: 'M', size: 2 },
  { label: 'Year', ph: 'Y', size: 4 },
]
const KEYS =['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '♥']

export default function Lock({ onNext, onUnlock }) {
  const [code, setCode] = useState('')
  const [fails, setFails] = useState(0)
  const [msg, setMsg] = useState(CONFIG.secretHint)
  const [unlocked, setUnlocked] = useState(false)
  const len = GROUPS.reduce((n, g) => n + g.size, 0)

  const press = (k) => {
    if (unlocked) return
    if (k === '⌫') return setCode((c) => c.slice(0, -1))
    if (k === '♥') return setCode('')
    const c = (code + k).slice(0, len)
    setCode(c)
    if (c.length < len) return
    const birthday = parseBirthday(c)
    if (birthday && (!CONFIG.secret || c === CONFIG.secret)) {
      setUnlocked(true)
      onUnlock(birthday)
      setMsg(`Welcome, my ${CONFIG.name} — ${formatBirthday(birthday, true)} 🎂💖`)
      chime()
      heartBurst({ particleCount: 90 })
      setTimeout(onNext, 2600)
    } else {
      setMsg(birthday ? CONFIG.teases[fails % (CONFIG.teases.length - 1)] : CONFIG.teases.at(-1))
      setFails((f) => f + 1)
      vibrate(200)
      setTimeout(() => setCode(''), 900)
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('⌫')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="lock">
      <motion.div
        className="lock-heart"
        animate={unlocked ? { scale: [1, 1.4, 4], opacity: [1, 1, 0] } : { scale: [1, 1.12, 1] }}
        transition={unlocked ? { duration: 1.2 } : { duration: 1.1, repeat: Infinity }}
      >
        {unlocked ? '💖' : '🔒'}
      </motion.div>
      <h1 className="title">Only for {CONFIG.name}</h1>
      <motion.p key={msg} className="subtitle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        {msg}
      </motion.p>

      <motion.div
        key={fails}
        className="dots"
        animate={fails ? { x: [0, -14, 14, -10, 10, -4, 0] } : {}}
        transition={{ duration: 0.45 }}
      >
        {GROUPS.map((g, gi) => {
          const start = GROUPS.slice(0, gi).reduce((n, x) => n + x.size, 0)
          return (
            <Fragment key={g.label}>
              {gi > 0 && <span className="slot-sep">/</span>}
              <div className="slot-group">
                <div className="slot-row">
                  {Array.from({ length: g.size }, (_, j) => {
                    const i = start + j
                    return (
                      <span
                        key={i}
                        className={`slot ${i < code.length ? 'filled' : ''} ${i === code.length && !unlocked ? 'active' : ''}`}
                      >
                        {code[i] ?? g.ph}
                      </span>
                    )
                  })}
                </div>
                <small>{g.label}</small>
              </div>
            </Fragment>
          )
        })}
      </motion.div>

      <div className="keypad">
        {KEYS.map((k) => (
          <motion.button
            key={k}
            className="key glass"
            whileTap={{ scale: 0.85, backgroundColor: 'rgba(255,92,147,.45)' }}
            onClick={() => press(k)}
          >
            {k}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
