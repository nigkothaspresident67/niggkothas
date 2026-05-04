import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CTA() {
  const [clicked, setClicked] = useState(false)
  const [particles, setParticles] = useState<{x:number,y:number,color:string}[]>([])

  const handleClick = () => {
    setClicked(true)
    setParticles(Array.from({ length: 20 }, () => ({
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      color: ['#ff2d9b', '#b44fff', '#00d4ff', '#ff6b35'][Math.floor(Math.random() * 4)]
    })))
    setTimeout(() => {
      setClicked(false)
    }, 800)
  }

  return (
    <section id="cta" className="cta-section">
      <div className="cta-bg-glow" />

      <motion.div
        className="cta-content"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="cta-tag">🚀 ready to lose control?</div>

        <h2 className="cta-title">
          Let's Cause
          <br />
          <span className="cta-title-accent">Problems.</span>
        </h2>

        <p className="cta-sub">
          You've met the chaos. You've seen what we do.
          <br />
          Now stop being shy and <strong>come get it.</strong> 😈
        </p>

        <div className="cta-trio">
          {[
            { emoji: '🎸', name: 'Aaditya', line: '"yes daddy, let\'s do this"' },
            { emoji: '🌪️', name: 'Aatharva', line: '"I\'m already on 1000%"' },
            { emoji: '🎖️', name: 'Dhariya', line: '"mission: accepted"' }
          ].map((c, i) => (
            <motion.div
              key={c.name}
              className="cta-char"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="cta-char-emoji">{c.emoji}</div>
              <div className="cta-char-name">{c.name}</div>
              <div className="cta-char-line">{c.line}</div>
            </motion.div>
          ))}
        </div>

        <div className="cta-btn-wrap">
          <motion.button
            className={`cta-btn ${clicked ? 'cta-btn-clicked' : ''}`}
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {clicked ? '🔥 chaos initiated...' : 'Book the Madness 🔥'}
          </motion.button>

          <AnimatePresence>
            {clicked && particles.map((p, i) => (
              <motion.div
                key={i}
                className="cta-particle"
                style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>

          <motion.button
            className="cta-btn-alt"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.03 }}
          >
            Let's Cause Problems ☠️
          </motion.button>
        </div>

        <p className="cta-disclaimer">
          * by clicking above you agree to receive maximum chaos, zero refunds, and occasional emotional damage.
          <br />
          niggkothas is not responsible for any life improvements that occur as a result of our services.
        </p>
      </motion.div>
    </section>
  )
}
