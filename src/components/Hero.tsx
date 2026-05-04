import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const floatingWords = ['CHAOTIC', 'LUSTFUL', 'UNHINGED', 'EFFECTIVE', 'ZESTY', 'DADDY', 'ICONIC']

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0)
  const [particles, setParticles] = useState<{x:number,y:number,size:number,color:string,speed:number}[]>([])

  useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % floatingWords.length), 1800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setParticles(Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      color: ['#ff2d9b', '#b44fff', '#00d4ff', '#ff6b35'][Math.floor(Math.random() * 4)],
      speed: Math.random() * 3 + 2
    })))
  }, [])

  return (
    <section id="hero" className="hero-section">
      <div className="hero-bg" style={{ backgroundImage: 'url(/images/hero-bg.png)' }} />
      <div className="hero-overlay" />

      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut'
          }}
        />
      ))}

      <div className="hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          🔥 warning: may cause obsession
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Not Normal.<br />
          Not Professional.<br />
          <span className="title-accent">Just Effective.</span>
        </motion.h1>

        <motion.div
          className="hero-rotating-word"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="rotating-label">currently:</span>
          <motion.span
            key={wordIdx}
            className="rotating-word"
            initial={{ opacity: 0, y: 20, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {floatingWords[wordIdx]}
          </motion.span>
        </motion.div>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          Three completely unhinged personalities. One unstoppable force.
          We get it done — <em>from the front or the back.</em> 😈
        </motion.p>

        <motion.div
          className="hero-chars-preview"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          {[
            { name: 'Aaditya', emoji: '🎸', color: '#ff2d9b', label: 'the chikna' },
            { name: 'Aatharva', emoji: '🌪️', color: '#b44fff', label: 'the chaos' },
            { name: 'Dhariya', emoji: '🎖️', color: '#00d4ff', label: 'the mission' }
          ].map((c, i) => (
            <motion.div
              key={c.name}
              className="hero-char-pill"
              style={{ '--pill-color': c.color } as any}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 + i * 0.15, type: 'spring' }}
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <span className="pill-emoji">{c.emoji}</span>
              <div>
                <div className="pill-name">{c.name}</div>
                <div className="pill-label">{c.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
        >
          <button className="btn-primary" onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>
            Book the Madness 🔥
          </button>
          <button className="btn-ghost" onClick={() => document.getElementById('chaos')?.scrollIntoView({ behavior: 'smooth' })}>
            Meet the Chaos ↓
          </button>
        </motion.div>
      </div>

      <div className="hero-scroll-hint">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          scroll if you dare ↓
        </motion.div>
      </div>
    </section>
  )
}
