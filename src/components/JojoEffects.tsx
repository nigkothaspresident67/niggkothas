import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const JOJO_WORDS = ['MUDA', 'ORA', 'ZA WARUDO', 'WRYYY', 'YARE YARE', 'DAZE', 'KONO DIO DA', 'NIGGKOTHAS']

export function JojoFloatingText() {
  return (
    <div className="jojo-floating-container" aria-hidden>
      {JOJO_WORDS.map((word, i) => (
        <motion.div
          key={word}
          className="jojo-float-word"
          style={{
            left: `${(i * 13 + 5) % 90}%`,
            top: `${(i * 17 + 10) % 85}%`,
            animationDelay: `${i * 0.7}s`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.04, 0.1, 0.04],
            rotate: [0, i % 2 === 0 ? 3 : -3, 0]
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.6
          }}
        >
          {word}
        </motion.div>
      ))}
    </div>
  )
}

export function JojoDiamondBorder() {
  return (
    <div className="jojo-diamond-border" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="jojo-diamond-pip"
          style={{ '--idx': i } as any}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
        >
          ◆
        </motion.div>
      ))}
    </div>
  )
}
