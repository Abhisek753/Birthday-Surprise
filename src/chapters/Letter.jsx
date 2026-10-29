import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG } from '../config'
import { photos, screenshots } from '../data/memories'

// Use the chat screenshots if there are any, otherwise 4 photos spread across the timeline
const CARDS = screenshots.length
  ? screenshots.slice(0, 4)
  : Array.from({ length: Math.min(4, photos.length) }, (_, i) => photos[Math.floor(((i + 0.5) * photos.length) / 4)])
import { heartBurst, pop } from '../utils/fx'

function ScratchCard({ src, revealed, onReveal, onView }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const lastCheck = useRef(0)

  useEffect(() => {
    const c = canvasRef.current
    const { width, height } = c.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    c.width = width * dpr
    c.height = height * dpr
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)
    const g = ctx.createLinearGradient(0, 0, width, height)
    g.addColorStop(0, '#ff8fb1')
    g.addColorStop(1, '#a855f7')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)
    ctx.font = '18px serif'
    ctx.globalAlpha = 0.35
    for (let i = 0; i < 14; i++) ctx.fillText('♥', ((i * 53) % width) + 4, ((i * 71) % height) + 18)
    ctx.globalAlpha = 1
    ctx.fillStyle = '#fff'
    ctx.font = '600 15px Poppins, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Scratch me 💗', width / 2, height / 2)
  }, [])

  const scratch = (e) => {
    if (!drawing.current || revealed) return
    const c = canvasRef.current
    const r = c.getBoundingClientRect()
    const ctx = c.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, Math.PI * 2)
    ctx.fill()

    const now = performance.now()
    if (now - lastCheck.current < 150) return
    lastCheck.current = now
    const data = ctx.getImageData(0, 0, c.width, c.height).data
    let clear = 0
    let total = 0
    for (let i = 3; i < data.length; i += 64) {
      total++
      if (data[i] === 0) clear++
    }
    if (clear / total > 0.45) onReveal()
  }

  return (
    <div className="scratch" onClick={revealed ? onView : undefined}>
      <img src={src} alt="" />
      <canvas
        ref={canvasRef}
        className={revealed ? 'gone' : ''}
        onPointerDown={(e) => {
          drawing.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          scratch(e)
        }}
        onPointerMove={scratch}
        onPointerUp={() => {
          drawing.current = false
        }}
      />
    </div>
  )
}

function Typewriter({ text, onDone }) {
  const [n, setN] = useState(0)
  const boxRef = useRef(null)

  useEffect(() => {
    if (n >= text.length) {
      onDone()
      return
    }
    const delay = /[.,!?\n]/.test(text[n]) ? 200 : 30
    const id = setTimeout(() => setN(n + 1), delay)
    return () => clearTimeout(id)
  }, [n, text, onDone])

  useEffect(() => {
    const el = boxRef.current?.parentElement
    if (el) el.scrollTop = el.scrollHeight
  }, [n])

  return (
    <p ref={boxRef} className="letter-text" onClick={() => setN(text.length)}>
      {text.slice(0, n)}
      {n < text.length && <span className="caret">|</span>}
    </p>
  )
}

export default function Letter({ onNext }) {
  const [stage, setStage] = useState(CARDS.length ? 'cards' : 'envelope')
  const [revealed, setRevealed] = useState([])
  const [view, setView] = useState(null)
  const [opening, setOpening] = useState(false)
  const [typed, setTyped] = useState(false)
  const allRevealed = revealed.length >= CARDS.length
  const onDone = useCallback(() => setTyped(true), [])

  const reveal = (i) => {
    if (revealed.includes(i)) return
    pop()
    heartBurst({ particleCount: 20, spread: 120 })
    setRevealed((r) => [...r, i])
  }

  const openEnvelope = () => {
    if (opening) return
    setOpening(true)
    pop()
    setTimeout(() => setStage('letter'), 1500)
  }

  return (
    <div className="letter-chapter">
      <AnimatePresence mode="wait">
        {stage === 'cards' && (
          <motion.div key="cards" className="stack" exit={{ opacity: 0, y: -30 }}>
            <h1 className="title">Our little moments 💬</h1>
            <p className="subtitle">Scratch the cards to reveal them</p>
            <div className="scratch-grid">
              {CARDS.map((s, i) => (
                <ScratchCard
                  key={s.file}
                  src={s.src}
                  revealed={revealed.includes(i)}
                  onReveal={() => reveal(i)}
                  onView={() => setView(s.src)}
                />
              ))}
            </div>
            {allRevealed ? (
              <motion.button
                className="btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setStage('envelope')}
              >
                There's a letter for you 💌
              </motion.button>
            ) : (
              <button className="hint link" onClick={() => setStage('envelope')}>
                skip →
              </button>
            )}
          </motion.div>
        )}

        {stage === 'envelope' && (
          <motion.div key="env" className="stack" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.2 }}>
            <h1 className="title">A letter for {CONFIG.name}</h1>
            <p className="subtitle">Tap the envelope to open it</p>
            <motion.div
              className={`envelope ${opening ? 'open' : ''}`}
              onClick={openEnvelope}
              animate={opening ? {} : { y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="env-paper">
                <span>For you 💖</span>
              </div>
              <div className="env-front" />
              <div className="env-flap" />
              <div className="env-seal">💗</div>
            </motion.div>
          </motion.div>
        )}

        {stage === 'letter' && (
          <motion.div key="letter" className="stack" initial={{ opacity: 0, scale: 0.6, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <div className="paper">
              <Typewriter text={CONFIG.letter} onDone={onDone} />
              {typed && (
                <motion.p className="signature" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  — {CONFIG.from} 💞
                </motion.p>
              )}
            </div>
            {typed ? (
              <motion.button
                className="btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.92 }}
                onClick={onNext}
              >
                One more game 💖
              </motion.button>
            ) : (
              <p className="hint">tap the letter to show it all</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view && (
          <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setView(null)}>
            <motion.img className="full-shot" src={view} initial={{ scale: 0.7 }} animate={{ scale: 1 }} alt="" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
