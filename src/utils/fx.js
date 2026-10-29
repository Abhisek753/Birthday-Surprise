import confetti from 'canvas-confetti'

const COLORS = ['#ff5c93', '#ffd27a', '#ffffff', '#c084fc', '#ff8fb1']
let heartShape

function heart() {
  heartShape ??= confetti.shapeFromText({ text: '💖', scalar: 2 })
  return heartShape
}

export function heartBurst(opts = {}) {
  confetti({
    particleCount: 50,
    spread: 100,
    startVelocity: 35,
    shapes: [heart()],
    scalar: 2,
    origin: { y: 0.6 },
    ...opts,
  })
}

export function celebrate() {
  const base = { colors: COLORS, spread: 70, startVelocity: 50 }
  confetti({ ...base, particleCount: 90, angle: 60, origin: { x: 0, y: 0.75 } })
  confetti({ ...base, particleCount: 90, angle: 120, origin: { x: 1, y: 0.75 } })
  setTimeout(() => heartBurst({ particleCount: 40 }), 300)
}

export function fireworks(duration = 7000) {
  const end = Date.now() + duration
  const id = setInterval(() => {
    if (Date.now() > end) return clearInterval(id)
    confetti({
      particleCount: 45,
      startVelocity: 28,
      spread: 360,
      ticks: 80,
      gravity: 0.8,
      colors: COLORS,
      origin: { x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.35 },
    })
  }, 380)
  return () => clearInterval(id)
}

// Tiny synthesized sounds — no audio files needed
let ctx
function audio() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

export function pop() {
  try {
    const a = audio()
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(700, a.currentTime)
    o.frequency.exponentialRampToValueAtTime(110, a.currentTime + 0.12)
    g.gain.setValueAtTime(0.35, a.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.15)
    o.connect(g).connect(a.destination)
    o.start()
    o.stop(a.currentTime + 0.16)
  } catch {
    /* sound is optional */
  }
}

export function chime() {
  try {
    const a = audio()
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = a.createOscillator()
      const g = a.createGain()
      const t = a.currentTime + i * 0.12
      o.type = 'sine'
      o.frequency.value = f
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
      o.connect(g).connect(a.destination)
      o.start(t)
      o.stop(t + 0.65)
    })
  } catch {
    /* sound is optional */
  }
}

export const vibrate = (p) => navigator.vibrate?.(p)
