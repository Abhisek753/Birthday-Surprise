import { useCallback, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FloatingHearts, HeartTrail, Progress } from './components/Ambient'
import MusicToggle from './components/MusicToggle'
import HugButton from './components/HugButton'
import ErrorBoundary from './components/ErrorBoundary'
import Owner, { OwnerBadge } from './pages/Owner'
import Lock from './chapters/Lock'
import GiftBox from './chapters/GiftBox'
import Cake from './chapters/Cake'
import Balloons from './chapters/Balloons'
import Puzzle from './chapters/Puzzle'
import Universe from './chapters/Universe'
import Letter from './chapters/Letter'
import CatchHearts from './chapters/CatchHearts'
import Finale from './chapters/Finale'
import './App.css'

// One URL per chapter (#/cake, #/universe …) so the phone's back gesture works
const CHAPTERS = [
  { path: '/', Component: Lock, hug: false },
  { path: '/gift', Component: GiftBox },
  { path: '/cake', Component: Cake },
  { path: '/balloons', Component: Balloons },
  { path: '/puzzle', Component: Puzzle },
  { path: '/universe', Component: Universe, hug: false },
  { path: '/letter', Component: Letter },
  { path: '/catch', Component: CatchHearts, hug: false },
  { path: '/finale', Component: Finale },
]

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const step = CHAPTERS.findIndex((c) => c.path === location.pathname)
  // The birthday she typed on the lock screen, kept in memory only
  const [birthday, setBirthday] = useState(null)
  // Furthest chapter reached, so the progress bar can jump back and forward again
  const [maxStep, setMaxStep] = useState(Math.max(step, 0))

  const goTo = useCallback(
    (s) => {
      setMaxStep((m) => Math.max(m, s))
      navigate(CHAPTERS[s].path)
    },
    [navigate],
  )
  const next = useCallback(() => goTo(Math.min(step + 1, CHAPTERS.length - 1)), [goTo, step])
  const restart = useCallback(() => goTo(1), [goTo])

  if (location.pathname === '/owner') {
    return (
      <div className="owner-shell">
        <main className="chapter">
          <Owner />
        </main>
      </div>
    )
  }
  if (step < 0) return <Navigate to="/" replace />
  // She must unlock first; in dev you can open any chapter directly, e.g. localhost:5173/#/cake
  if (step > 0 && !birthday && !import.meta.env.DEV) return <Navigate to="/" replace />

  const { Component: Chapter, hug = true } = CHAPTERS[step]

  return (
    <>
      <FloatingHearts />
      <HeartTrail />
      <MusicToggle />
      {maxStep > 0 && <Progress step={step} maxStep={maxStep} total={CHAPTERS.length} onGo={goTo} />}
      {step > 0 && (
        <button className="back-btn glass" onClick={() => goTo(step - 1)} aria-label="Previous">
          ‹ Back
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="chapter"
          initial={{ opacity: 0, scale: 0.94, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <ErrorBoundary onSkip={next}>
            <Chapter onNext={next} onRestart={restart} onUnlock={setBirthday} birthday={birthday} />
          </ErrorBoundary>
        </motion.main>
      </AnimatePresence>

      {hug && <HugButton />}
      <OwnerBadge />
    </>
  )
}
