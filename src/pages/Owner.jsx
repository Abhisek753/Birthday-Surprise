import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const ownerImages = Object.values(
  import.meta.glob('../Owner/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}', { eager: true, import: 'default' }),
)

const OWNER = {
  name: 'Abhisek Kumar',
  role: 'Software Developer · Freelance App Builder',
  location: 'Bangalore, India',
  email: 'kumarabhisek753@gmail.com',
  linkedin: 'https://www.linkedin.com/in/dev-abhisek-kumar/',
}

const SERVICES = [
  { icon: '🌐', title: 'Websites', text: 'Business sites, portfolios and landing pages' },
  { icon: '⚡', title: 'Web applications', text: 'Dashboards, admin panels and SaaS products' },
  { icon: '📱', title: 'Mobile apps', text: 'Cross-platform apps for Android and iOS' },
  { icon: '🎨', title: 'Interactive experiences', text: 'Animated, 3D and event microsites' },
]

export function OwnerBadge() {
  const navigate = useNavigate()
  return (
    <motion.button
      className="owner-badge glass"
      onClick={() => navigate('/owner')}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="About the developer"
      title="Built by Abhisek Kumar"
    >
      👨‍💻
    </motion.button>
  )
}

export default function Owner() {
  const navigate = useNavigate()
  const location = useLocation()
  // Return to the previous page; if this page was opened directly, go to the start
  const back = () => (location.key !== 'default' ? navigate(-1) : navigate('/'))
  const [main, second] = ownerImages

  return (
    <div className="owner-page">
      <button className="back-btn glass" onClick={back}>
        ‹ Back
      </button>

      <motion.div
        className="owner-card glass"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      >
        <div className="owner-photos">
          {main && (
            <motion.img
              src={main}
              alt={OWNER.name}
              className="owner-photo"
              initial={{ rotate: -14, x: 30, opacity: 0 }}
              animate={{ rotate: -5, x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
          {second && (
            <motion.img
              src={second}
              alt={OWNER.name}
              className="owner-photo"
              initial={{ rotate: 14, x: -30, opacity: 0 }}
              animate={{ rotate: 5, x: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            />
          )}
        </div>

        <h1 className="owner-name">{OWNER.name}</h1>
        <p className="owner-role">{OWNER.role}</p>
        <span className="owner-status">● Available for new projects</span>

        <p className="owner-intro">
          I design and build fast, modern applications — from a simple website to a complete product. Have an idea?
          Contact me for creating any type of application.
        </p>

        <div className="owner-services">
          {SERVICES.map((s) => (
            <div key={s.title} className="owner-service">
              <span>{s.icon}</span>
              <b>{s.title}</b>
              <small>{s.text}</small>
            </div>
          ))}
        </div>

        <ul className="owner-details">
          <li>
            <span>📍</span>
            {OWNER.location}
          </li>
          <li>
            <span>✉️</span>
            <a href={`mailto:${OWNER.email}`}>{OWNER.email}</a>
          </li>
          <li>
            <span>💼</span>
            <a href={OWNER.linkedin} target="_blank" rel="noreferrer">
              linkedin.com/in/dev-abhisek-kumar
            </a>
          </li>
        </ul>

        <div className="row">
          <a className="btn pro" href={`mailto:${OWNER.email}?subject=Project enquiry`}>
            Start a project →
          </a>
          <a className="btn ghost" href={OWNER.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </motion.div>
    </div>
  )
}
