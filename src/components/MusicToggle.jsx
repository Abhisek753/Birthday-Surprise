import { useEffect, useRef, useState } from 'react'

// Plays /music.mp3 (put your song in the public/ folder). Starts on her first tap,
// because browsers block autoplay. Other parts of the app can pause it with
// window.dispatchEvent(new Event('music:pause')) / 'music:resume'.
export default function MusicToggle() {
  const audioRef = useRef(null)
  const mutedRef = useRef(false)
  const [muted, setMuted] = useState(false)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    const a = audioRef.current
    const start = () => {
      if (a.paused && !mutedRef.current) a.play().catch(() => {})
    }
    const pause = () => a.pause()
    window.addEventListener('pointerdown', start)
    window.addEventListener('music:pause', pause)
    window.addEventListener('music:resume', start)
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('music:pause', pause)
      window.removeEventListener('music:resume', start)
    }
  }, [])

  const toggle = () => {
    const a = audioRef.current
    mutedRef.current = !mutedRef.current
    setMuted(mutedRef.current)
    if (mutedRef.current) a.pause()
    else a.play().catch(() => {})
  }

  return (
    <>
      <audio ref={audioRef} src="/music.mp3" loop preload="auto" onError={() => setAvailable(false)} />
      {available && (
        <button
          className="music-btn glass"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={toggle}
          aria-label={muted ? 'Play music' : 'Mute music'}
        >
          {muted ? '🔇' : '🎵'}
        </button>
      )}
    </>
  )
}
