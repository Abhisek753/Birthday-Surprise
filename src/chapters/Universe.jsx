import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Billboard, Html, Image, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import { CONFIG } from '../config'
import { findPhoto, formatDate, groupByMonth, photos } from '../data/memories'
import { heartBurst, chime } from '../utils/fx'

const HOME_POS = [0, 7, 22]

// Each month becomes a constellation on a ring; its photos sit on a small sphere.
function buildLayout() {
  const groups = groupByMonth(photos)
  const items = []
  const clusters = []
  groups.forEach((g, gi) => {
    const angle = (gi / groups.length) * Math.PI * 2
    const center = [Math.cos(angle) * 9, gi % 2 ? 1.4 : -1.4, Math.sin(angle) * 9]
    const n = g.items.length
    const r = 1.4 + Math.sqrt(n) * 0.42
    clusters.push({ label: g.label, center, r })
    g.items.forEach((p, i) => {
      const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2
      const ring = Math.sqrt(1 - y * y)
      const th = i * 2.39996
      items.push({
        ...p,
        center,
        pos: [center[0] + Math.cos(th) * ring * r, center[1] + y * r * 0.85, center[2] + Math.sin(th) * ring * r],
      })
    })
  })
  return { items, clusters }
}

const { items: ITEMS, clusters: CLUSTERS } = buildLayout()
const tmp = new THREE.Vector3()

function PhotoStar({ item, index, active, onSelect }) {
  const ref = useRef()
  const [hover, setHover] = useState(false)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.position.y = item.pos[1] + Math.sin(t * 0.8 + index) * 0.08
    const s = active ? 1.5 : hover ? 1.25 : 1
    ref.current.scale.lerp(tmp.set(s, s, s), 0.12)
  })

  return (
    <Billboard ref={ref} position={item.pos}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.0, 1.24]} />
        <meshBasicMaterial color={active ? '#ffd27a' : '#ff8fb1'} transparent opacity={active ? 0.9 : 0.45} toneMapped={false} />
      </mesh>
      <Image
        url={item.src}
        scale={[0.9, 1.14]}
        radius={0.06}
        transparent
        toneMapped={false}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(index)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = ''
        }}
      />
    </Billboard>
  )
}

function Moon({ onTap }) {
  const ref = useRef()
  useFrame((s) => {
    const k = 1 + Math.sin(s.clock.elapsedTime * 1.5) * 0.04
    ref.current.scale.set(k, k, k)
  })
  return (
    <group position={[0, 9, -16]}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          onTap()
        }}
      >
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshStandardMaterial color="#fff4d6" emissive="#ffe3a3" emissiveIntensity={0.7} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial color="#ffe3a3" transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

function CameraRig({ focusIndex, homeKey }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const goalPos = useRef(new THREE.Vector3(...HOME_POS))
  const goalTarget = useRef(new THREE.Vector3())
  const flying = useRef(false)

  useEffect(() => {
    if (focusIndex == null) return
    const it = ITEMS[focusIndex]
    const p = new THREE.Vector3(...it.pos)
    const out = p.clone().sub(new THREE.Vector3(...it.center))
    if (out.lengthSq() < 1e-4) out.copy(p)
    out.normalize()
    goalTarget.current.copy(p)
    goalPos.current.copy(p).addScaledVector(out, 3.4).add(new THREE.Vector3(0, 0.3, 0))
    flying.current = true
  }, [focusIndex])

  useEffect(() => {
    if (!homeKey) return
    goalTarget.current.set(0, 0, 0)
    goalPos.current.set(...HOME_POS)
    flying.current = true
  }, [homeKey])

  useEffect(() => {
    if (!controls) return
    const stop = () => {
      flying.current = false
    }
    controls.addEventListener('start', stop)
    return () => controls.removeEventListener('start', stop)
  }, [controls])

  useFrame((_, dt) => {
    if (!flying.current || !controls) return
    const k = 1 - Math.pow(0.04, dt)
    camera.position.lerp(goalPos.current, k)
    controls.target.lerp(goalTarget.current, k)
    controls.update()
    if (camera.position.distanceTo(goalPos.current) < 0.01) flying.current = false
  })
  return null
}

function Loader() {
  return (
    <Html center>
      <div className="u-loading">Gathering our stars… ✨</div>
    </Html>
  )
}

export default function Universe({ onNext }) {
  const [selected, setSelected] = useState(null)
  const [journey, setJourney] = useState(false)
  const [homeKey, setHomeKey] = useState(0)
  const [moonTaps, setMoonTaps] = useState(0)
  const [secretOpen, setSecretOpen] = useState(false)
  const secret = findPhoto(CONFIG.secretPhoto) ?? photos[photos.length - 1]

  useEffect(() => {
    if (!journey) return
    const id = setInterval(() => setSelected((s) => (s === null ? 0 : (s + 1) % ITEMS.length)), 3200)
    return () => clearInterval(id)
  }, [journey])

  const tapMoon = () => {
    const n = moonTaps + 1
    setMoonTaps(n)
    if (n >= 3) {
      setMoonTaps(0)
      setJourney(false)
      setSecretOpen(true)
      chime()
      heartBurst({ particleCount: 70 })
    }
  }

  const startJourney = () => {
    setSelected((s) => s ?? 0)
    setJourney(true)
  }

  const current = selected !== null ? ITEMS[selected] : null
  const step = (d) => setSelected((s) => (s + d + ITEMS.length) % ITEMS.length)

  return (
    <div className="universe">
      <Canvas
        camera={{ position: HOME_POS, fov: 55 }}
        dpr={[1, 2]}
        onPointerMissed={() => setJourney(false)}
      >
        <color attach="background" args={['#07030f']} />
        <fog attach="fog" args={['#07030f', 25, 60]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 10, 0]} intensity={40} color="#ff8fb1" />
        <Stars radius={80} depth={40} count={4000} factor={4} saturation={0.6} fade speed={1} />
        <Moon onTap={tapMoon} />
        {CLUSTERS.map((c) => (
          <group key={c.label}>
            <Sparkles position={c.center} count={40} scale={c.r * 2.8} size={3} speed={0.4} color="#ffb6d1" />
            <Html position={[c.center[0], c.center[1] + c.r + 1, c.center[2]]} center>
              <div className="month-label">{c.label}</div>
            </Html>
          </group>
        ))}
        <Suspense fallback={<Loader />}>
          {ITEMS.map((it, i) => (
            <PhotoStar
              key={it.file}
              item={it}
              index={i}
              active={selected === i}
              onSelect={(idx) => {
                setJourney(false)
                setSelected(idx)
              }}
            />
          ))}
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          enablePan={false}
          minDistance={1.5}
          maxDistance={40}
          autoRotate={selected === null && !journey}
          autoRotateSpeed={0.5}
        />
        <CameraRig focusIndex={selected} homeKey={homeKey} />
      </Canvas>

      <div className="u-overlay">
        <div className="u-top">
          <h1 className="title small">Our Little Universe ✨</h1>
          <p className="subtitle">Every star is a memory of us. Drag to fly, tap a photo 💫</p>
        </div>

        <AnimatePresence>
          {current && journey && (
            <motion.div
              key={current.file}
              className="u-mini"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <span>{formatDate(current.date)}</span>
              <small>
                {selected + 1} / {ITEMS.length}
              </small>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="u-bottom">
          <button className="btn ghost" onClick={journey ? () => setJourney(false) : startJourney}>
            {journey ? '⏸ Stop' : '▶ Journey'}
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              setJourney(false)
              setSelected(null)
              setHomeKey((k) => k + 1)
            }}
          >
            🌌 Overview
          </button>
          <button className="btn" onClick={onNext}>
            Continue →
          </button>
        </div>
      </div>

      <AnimatePresence>
        {current && !journey && (
          <motion.div
            className="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              key={current.file}
              className="polaroid big"
              initial={{ scale: 0.6, rotate: 6, opacity: 0 }}
              animate={{ scale: 1, rotate: -1.5, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 170, damping: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={current.src} alt="" />
              <div className="caption">
                <b>{formatDate(current.date)}</b>
                <span>
                  Memory {selected + 1} of {ITEMS.length}
                </span>
              </div>
              <div className="row">
                <button className="btn ghost dark" onClick={() => step(-1)}>
                  ←
                </button>
                <button className="btn ghost dark" onClick={() => setSelected(null)}>
                  ✕
                </button>
                <button className="btn ghost dark" onClick={() => step(1)}>
                  →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {secretOpen && (
          <motion.div
            className="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSecretOpen(false)}
          >
            <motion.div
              className="polaroid big"
              initial={{ scale: 0.2, rotate: -30 }}
              animate={{ scale: 1, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 140, damping: 12 }}
            >
              {secret && <img src={secret.src} alt="" />}
              <div className="caption">
                <b>🌙 Secret unlocked</b>
                <span>{CONFIG.secretMessage}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
