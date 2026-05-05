import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import MeetTheChaos from './components/MeetTheChaos'
import WhatWeDo from './components/WhatWeDo'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Navbar from './components/Navbar'
import Cursor from './components/Cursor'
import Quiz from './components/Quiz'
import Battle from './components/Battle'
import { JojoFloatingText } from './components/JojoEffects'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [battleOpen, setBattleOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="app-root">
      <Cursor />

      <AnimatePresence>
        {!loaded && (
          <motion.div key="loader" className="loader-screen"
            exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.7 }}>
            <div className="loader-jojo-bg" />
            <motion.div className="loader-text"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="loader-diamond-row">
                {['◆','◇','◆','◇','◆'].map((d,i) => (
                  <motion.span key={i} className="loader-diamond"
                    animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.2,0.8] }}
                    transition={{ duration:1.2, repeat:Infinity, delay:i*0.2 }}>{d}</motion.span>
                ))}
              </div>
              <span className="loader-brand">niggkothas</span>
              <motion.p className="loader-jojo-sub" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
                YARE YARE DAZE... loading chaos 🔥
              </motion.p>
              <motion.p className="loader-muda"
                initial={{ opacity:0, scale:0.5 }}
                animate={{ opacity:[0,1,1,0], scale:[0.5,1.2,1,0.8] }}
                transition={{ delay:0.9, duration:1.2 }}>
                MUDA MUDA MUDA!
              </motion.p>
              <div className="loader-bar-wrap">
                <motion.div className="loader-bar"
                  initial={{ width:0 }} animate={{ width:'100%' }}
                  transition={{ duration:1.8, ease:'easeInOut' }} />
              </div>
              <div className="loader-diamond-row" style={{ marginTop:'1rem' }}>
                {['◇','◆','◇','◆','◇'].map((d,i) => (
                  <motion.span key={i} className="loader-diamond"
                    animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.2,0.8] }}
                    transition={{ duration:1.2, repeat:Infinity, delay:i*0.2+0.6 }}>{d}</motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loaded && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }}>
          <JojoFloatingText />
          <Navbar />
          <Hero />
          <MeetTheChaos />
          <WhatWeDo />
          <Quiz />
          <Testimonials />
          <CTA onBattle={() => setBattleOpen(true)} />
          <footer className="site-footer">
            <div className="footer-diamonds">◆ ◇ ◆ ◇ ◆</div>
            <p>© 2025 niggkothas. all rights reserved. no refunds. no regrets.</p>
            <p className="footer-sub">made with chaos, caffeine & the power of STAND ◆</p>
          </footer>
        </motion.div>
      )}

      {/* Battle overlay */}
      <AnimatePresence>
        {battleOpen && (
          <motion.div className="battle-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <Battle onExit={() => setBattleOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
