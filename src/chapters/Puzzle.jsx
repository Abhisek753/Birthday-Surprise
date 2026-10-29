import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CONFIG } from '../config'
import { findPhoto, photos } from '../data/memories'
import { celebrate, pop, vibrate } from '../utils/fx'

const N = 3

function shuffled() {
  const a = Array.from({ length: N * N }, (_, i) => i)
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
  } while (a.every((t, i) => t === i))
  return a
}

export default function Puzzle({ onNext }) {
  const photo = findPhoto(CONFIG.puzzlePhoto) ?? photos[Math.floor(photos.length / 2)]
  const [img, setImg] = useState(null)
  const [tiles, setTiles] = useState(shuffled)
  const [sel, setSel] = useState(null)
  const [peek, setPeek] = useState(false)
  const [moves, setMoves] = useState(0)
  const solved = tiles.every((t, i) => t === i)

  // Crop the photo to a centred square so the tiles are not stretched
  useEffect(() => {
    const im = new Image()
    im.onload = () => {
      const s = Math.min(im.width, im.height)
      const c = document.createElement('canvas')
      c.width = c.height = Math.min(s, 900)
      c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, c.width, c.height)
      setImg(c.toDataURL('image/jpeg', 0.9))
    }
    im.src = photo.src
  }, [photo.src])

  const tap = (pos) => {
    if (solved) return
    if (sel === null) return setSel(pos)
    if (sel === pos) return setSel(null)
    const next = [...tiles]
    ;[next[sel], next[pos]] = [next[pos], next[sel]]
    setTiles(next)
    setSel(null)
    setMoves((m) => m + 1)
    pop()
    vibrate(20)
    if (next.every((t, i) => t === i)) setTimeout(celebrate, 500)
  }

  return (
    <div className="puzzle-chapter">
      <h1 className="title">{solved ? 'Perfect match 💞' : 'Put us back together 🧩'}</h1>
      <p className="subtitle">
        {solved ? 'Just like us — every piece fits.' : `Tap two pieces to swap them · ${moves} moves`}
      </p>

      <div className={`puzzle ${solved ? 'solved' : ''}`}>
        {img &&
          tiles.map((t, pos) => (
            <motion.button
              key={t}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className={`tile ${sel === pos ? 'sel' : ''}`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundPosition: `${(t % N) * 50}% ${Math.floor(t / N) * 50}%`,
              }}
              whileTap={{ scale: 0.92 }}
              onClick={() => tap(pos)}
            />
          ))}
        {img && peek && <img className="puzzle-peek" src={img} alt="" />}
      </div>

      {solved ? (
        <motion.button
          className="btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={onNext}
        >
          Enter our universe ✨
        </motion.button>
      ) : (
        <div className="row">
          <button
            className="btn ghost"
            onPointerDown={() => setPeek(true)}
            onPointerUp={() => setPeek(false)}
            onPointerLeave={() => setPeek(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            👀 Hold to peek
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              setTiles(shuffled())
              setSel(null)
            }}
          >
            🔀 Shuffle
          </button>
        </div>
      )}
    </div>
  )
}
