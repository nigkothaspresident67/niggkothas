import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CTAProps { onBattle: () => void }

export default function CTA({ onBattle }: CTAProps) {
  const [clicked, setClicked] = useState(false)
  const [particles, setParticles] = useState<{x:number,y:number,color:string}[]>([])

  const handleMadness = () => {
    setClicked(true)
    setParticles(Array.from({ length: 24 }, () => ({
      x: Math.random() * 240 - 120,
      y: Math.random() * 240 - 120,
      color: ['#ff2d9b','#b44fff','#00d4ff','#ffd700','#39ff14'][Math.floor(Math.random()*5)]
    })))
    setTimeout(() => { setClicked(false); onBattle() }, 900)
  }

  return (
    <section id="cta" className="cta-section">
      <div className="cta-bg-glow" />
      <motion.div className="cta-content"
        initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}>

        <div className="cta-tag">⚔️ ready to fight?</div>
        <h2 className="cta-title">
          Let's Cause<br />
          <span className="cta-title-accent">Problems.</span>
        </h2>
        <p className="cta-sub">
          You've met the chaos. You've seen what we do.<br />
          Now stop being shy and <strong>come get it.</strong> 😈
        </p>

        <div className="cta-trio">
          {[
            { emoji: '🎸', name: 'Aaditya', line: '"yes daddy, let\'s do this"' },
            { emoji: '🍼', name: 'Aatharva', line: '"hehe... wanna fight?"' },
            { emoji: '🥺', name: 'Dhariya', line: '"m-mission: accepted"' },
            { emoji: '🤓', name: 'Dweeb', line: '"yo shawty you tryna smash?"' },
          ].map((c, i) => (
            <motion.div key={c.name} className="cta-char"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08 }}>
              <div className="cta-char-emoji">{c.emoji}</div>
              <div className="cta-char-name">{c.name}</div>
              <div className="cta-char-line">{c.line}</div>
            </motion.div>
          ))}
        </div>

        <div className="cta-btn-wrap">
          <motion.button
            className={`cta-btn ${clicked ? 'cta-btn-clicked' : ''}`}
            onClick={handleMadness} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {clicked ? '⚔️ INITIATING DUEL...' : 'Book the Madness 🔥'}
          </motion.button>

          <AnimatePresence>
            {clicked && particles.map((p, i) => (
              <motion.div key={i} className="cta-particle"
                style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
            ))}
          </AnimatePresence>

          <motion.button className="cta-btn-alt"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.03 }}>
            Let's Cause Problems ☠️
          </motion.button>
        </div>

        <p className="cta-disclaimer">
          * clicking "Book the Madness" initiates a 1v1 STAND duel. no refunds. no mercy.<br />
          niggkothas is not responsible for any emotional damage sustained during combat.
        </p>
      </motion.div>
    </section>
  )
}
