import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG } from '../config'
import { birthdayAge, formatBirthday } from '../data/memories'
import { celebrate, vibrate } from '../utils/fx'

const CANDLES = 5
const DRIPS = [18, 30, 14, 26, 20, 34, 16, 24]
const SPRINKLES = [
  [12, 40, '#ffd27a'], [28, 62, '#60a5fa'], [45, 35, '#fff'], [60, 70, '#34d399'],
  [75, 45, '#ffd27a'], [88, 65, '#c084fc'], [20, 80, '#fff'], [52, 82, '#60a5fa'], [82, 85, '#34d399'],
]

export default function Cake({ onNext, birthday }) {
  const [lit, setLit] = useState(() => Array(CANDLES).fill(true))
  const [listening, setListening] = useState(false)
  const [micError, setMicError] = useState('')
  const [level, setLevel] = useState(0)
  const stopMic = useRef(null)
  const allOut = lit.every((l) => !l)

  const blowOut = (index) => {
    setLit((prev) => {
      const i = index ?? prev.findIndex(Boolean)
      if (i < 0 || !prev[i]) return prev
      const n = [...prev]
      n[i] = false
      return n
    })
    vibrate(30)
  }

  useEffect(() => {
    if (!allOut) return
    stopMic.current?.()
    celebrate()
    const id = setTimeout(celebrate, 900)
    return () => clearTimeout(id)
  }, [allOut])

  useEffect(() => () => stopMic.current?.(), [])

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      let raf
      let strong = 0
      let lastBlow = 0
      const loop = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const v of data) {
          const x = (v - 128) / 128
          sum += x * x
        }
        const rms = Math.sqrt(sum / data.length)
        setLevel(rms)
        strong = rms > 0.12 ? strong + 1 : Math.max(0, strong - 1)
        const now = performance.now()
        if (strong > 4 && now - lastBlow > 280) {
          lastBlow = now
          blowOut()
        }
        raf = requestAnimationFrame(loop)
      }
      loop()
      setListening(true)
      stopMic.current = () => {
        cancelAnimationFrame(raf)
        stream.getTracks().forEach((t) => t.stop())
        ctx.close()
        setListening(false)
        stopMic.current = null
      }
    } catch {
      setMicError('Mic not available — tap the flames to blow them out 🌬️')
    }
  }

  return (
    <div className="cake-chapter">
      <AnimatePresence mode="wait">
        {allOut ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <h1 className="title">Happy Birthday, {CONFIG.name}! 🎉</h1>
            <p className="subtitle">
              {birthday ? `${formatBirthday(birthday)} is officially your day. ` : ''}Your wish is on its way to the stars ✨
            </p>
          </motion.div>
        ) : (
          <motion.div key="wish" exit={{ opacity: 0 }}>
            <h1 className="title">Make a wish ✨</h1>
            <p className="subtitle">Close your eyes, make a wish… then blow out the candles!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cake">
        <div className="candles">
          {lit.map((on, i) => (
            <div key={i} className="candle" onClick={() => blowOut(i)}>
              <AnimatePresence>
                {on ? (
                  <motion.div
                    className="flame"
                    exit={{ scaleY: 0, opacity: 0 }}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  />
                ) : (
                  <motion.span
                    className="smoke"
                    initial={{ opacity: 0.8, y: 0, scale: 0.6 }}
                    animate={{ opacity: 0, y: -50, scale: 1.6 }}
                    transition={{ duration: 1.4 }}
                  >
                    ☁
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="tier top">
          <div className="frosting">
            {DRIPS.map((h, i) => (
              <span key={i} style={{ height: h, left: `${(i / DRIPS.length) * 100 + 3}%` }} />
            ))}
          </div>
        </div>
        <div className="tier bottom">
          {SPRINKLES.map(([x, y, c], i) => (
            <i key={i} style={{ left: `${x}%`, top: `${y}%`, background: c }} />
          ))}
          <span className="cake-name">
            {CONFIG.name}
            {birthday && <small>turning {birthdayAge(birthday)}</small>}
          </span>
        </div>
        <div className="plate" />
      </div>

      {!allOut && (
        <div className="mic-area">
          {listening ? (
            <>
              <p className="subtitle">Blow into your mic now! 🌬️</p>
              <div className="meter">
                <div style={{ width: `${Math.min(100, level * 450)}%` }} />
              </div>
            </>
          ) : (
            <motion.button className="btn" whileTap={{ scale: 0.92 }} onClick={startMic}>
              🎤 Blow with the mic
            </motion.button>
          )}
          <p className="hint">{micError || 'or just tap a flame'}</p>
        </div>
      )}

      {allOut && (
        <motion.button
          className="btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          whileTap={{ scale: 0.92 }}
          onClick={onNext}
        >
          Next surprise →
        </motion.button>
      )}
    </div>
  )
}
