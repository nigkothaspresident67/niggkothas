import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="nav-logo" onClick={() => scrollTo('hero')}>
        <span className="logo-main">nigg</span><span className="logo-accent">kothas</span>
        <span className="logo-dot">⚡</span>
      </div>
      <div className="nav-links">
        {[['chaos', 'chaos'], ['services', 'services'], ['quiz', 'find ur stand'], ['testimonials', 'testimonials'], ['cta', 'hire us']].map(([id, label]) => (
          <button key={id} className="nav-link" onClick={() => scrollTo(id)}>
            {label}
          </button>
        ))}
      </div>
    </motion.nav>
  )
}
