import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const floatingWords = ['CHAOTIC', 'LUSTFUL', 'UNHINGED', 'EFFECTIVE', 'ORA ORA ORA', 'MUDA MUDA', 'YES DADDY', 'YARE YARE']

// JoJo-style speed lines that radiate from center
function SpeedLines() {
  return (
    <div className="speed-lines" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="speed-line"
          style={{ transform: `rotate(${i * 18}deg)` }}
        />
      ))}
    </div>
  )
}

// Floating diamond shapes
function FloatingDiamonds() {
  const diamonds = [
    { size: 18, x: '8%',  y: '15%', color: '#ffd700', delay: 0 },
    { size: 10, x: '92%', y: '20%', color: '#ff2d9b', delay: 0.5 },
    { size: 14, x: '5%',  y: '70%', color: '#b44fff', delay: 1 },
    { size: 22, x: '88%', y: '65%', color: '#00d4ff', delay: 0.3 },
    { size: 8,  x: '50%', y: '8%',  color: '#ffd700', delay: 0.8 },
    { size: 12, x: '75%', y: '85%', color: '#ff2d9b', delay: 1.2 },
    { size: 16, x: '20%', y: '88%', color: '#39ff14', delay: 0.6 },
    { size: 9,  x: '60%', y: '92%', color: '#ffd700', delay: 1.5 },
  ]
  return (
    <div className="hero-diamonds" aria-hidden>
      {diamonds.map((d, i) => (
        <motion.div
          key={i}
          className="hero-diamond-pip"
          style={{ left: d.x, top: d.y, fontSize: d.size, color: d.color, textShadow: `0 0 12px ${d.color}` }}
          animate={{ y: [0, -14, 0], rotate: [0, 180, 360], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
        >
          ◆
        </motion.div>
      ))}
    </div>
  )
}

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0)
  const [particles, setParticles] = useState<{x:number,y:number,size:number,color:string,speed:number}[]>([])
  const [mudaFlash, setMudaFlash] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx(i => {
        const next = (i + 1) % floatingWords.length
        if (floatingWords[next] === 'ORA ORA ORA' || floatingWords[next] === 'MUDA MUDA') setMudaFlash(true)
        else setMudaFlash(false)
        return next
      })
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setParticles(Array.from({ length: 35 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      color: ['#ff2d9b', '#b44fff', '#00d4ff', '#ffd700', '#39ff14'][Math.floor(Math.random() * 5)],
      speed: Math.random() * 3 + 2
    })))
  }, [])

  return (
    <section id="hero" className="hero-section">
      <div className="hero-bg" style={{ backgroundImage: 'url(/images/hero-bg.png)' }} />
      <div className="hero-overlay" />
      <SpeedLines />
      <FloatingDiamonds />

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
          animate={{ y: [0, -30, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }}
          transition={{ duration: p.speed, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }}
        />
      ))}

      <div className="hero-content">
        {/* JoJo stand cry banner */}
        <motion.div
          className="hero-jojo-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring' }}
        >
          <span className="jojo-banner-diamond">◆</span>
          <span>YARE YARE DAZE — this is a STAND user site</span>
          <span className="jojo-banner-diamond">◆</span>
        </motion.div>

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

        {/* ORA / MUDA flash effect */}
        <AnimatePresence>
          {mudaFlash && (
            <motion.div
              className="muda-flash"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.1, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6 }}
            >
              {floatingWords[wordIdx]}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="hero-rotating-word"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="rotating-label">stand cry:</span>
          <motion.span
            key={wordIdx}
            className={`rotating-word ${mudaFlash ? 'rotating-word-jojo' : ''}`}
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

        {/* JoJo stand name cards */}
        <motion.div
          className="hero-stand-cards"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          {[
            { name: 'Aaditya', stand: 'PINK FLOYD', emoji: '🎸', color: '#ff2d9b' },
            { name: 'Aatharva', stand: 'BABY CHAOS', emoji: '🍼', color: '#b44fff' },
            { name: 'Dhariya', stand: 'SILENT RIYA', emoji: '🥺', color: '#00d4ff' },
            { name: 'Dweeb',   stand: 'BIG DADDY',  emoji: '🤓', color: '#39ff14' },
          ].map((c, i) => (
            <motion.div
              key={c.name}
              className="hero-stand-card"
              style={{ '--sc': c.color } as any}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.06, y: -4 }}
              onClick={() => document.getElementById('chaos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="stand-card-emoji">{c.emoji}</div>
              <div className="stand-card-label">STAND USER</div>
              <div className="stand-card-name">{c.name}</div>
              <div className="stand-card-stand">◆ {c.stand}</div>
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
            Meet the Stand Users ◆
          </button>
        </motion.div>
      </div>

      <div className="hero-scroll-hint">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          ◆ scroll if you dare ◆
        </motion.div>
      </div>
    </section>
  )
}
