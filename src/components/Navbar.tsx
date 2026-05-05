import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  ['chaos', 'chaos'],
  ['services', 'services'],
  ['quiz', 'find ur stand'],
  ['testimonials', 'testimonials'],
  ['cta', 'hire us'],
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300)
  }

  return (
    <>
      <motion.nav
        className={`navbar navbar-solid ${scrolled ? 'navbar-scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* DIO dashing across the navbar */}
        <div className="nav-dio-track">
          <motion.span
            className="nav-dio"
            animate={{ x: ['-120px', 'calc(100vw + 120px)'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
          >
            DIO ◆ WRYYYY
          </motion.span>
        </div>

        <div className="nav-logo" onClick={() => scrollTo('hero')}>
          <span className="logo-main">nigg</span>
          <span className="logo-accent">kothas</span>
          <span className="logo-dot">◆</span>
        </div>

        <div className="nav-links">
          {navItems.map(([id, label]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}
        </div>

        <button
          className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="ham-line ham-line-1" />
          <span className="ham-line ham-line-2" />
          <span className="ham-line ham-line-3" />
        </button>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div className="mobile-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)} />
            <motion.div className="mobile-drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="drawer-header">
                <span className="drawer-logo">
                  <span className="logo-main">nigg</span><span className="logo-accent">kothas</span>
                </span>
                <button className="drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
              </div>
              <div className="drawer-diamonds">◆ ◇ ◆ ◇ ◆</div>
              <nav className="drawer-nav">
                {navItems.map(([id, label], i) => (
                  <motion.button key={id} className="drawer-link" onClick={() => scrollTo(id)}
                    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }} whileTap={{ scale: 0.96 }}>
                    <span className="drawer-link-diamond">◆</span>
                    {label}
                  </motion.button>
                ))}
              </nav>
              <div className="drawer-diamonds" style={{ marginTop: 'auto' }}>◇ ◆ ◇ ◆ ◇</div>
              <p className="drawer-footer">YARE YARE DAZE...</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
