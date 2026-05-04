import { useState } from 'react'
import { motion } from 'framer-motion'

const services = [
  {
    icon: '🍑',
    title: 'Ass Development',
    desc: 'We develop assets so thicc they crash servers. Round, firm, fully optimised for maximum performance — front-end and back-end.',
    tag: 'aaditya\'s domain',
    color: '#ff2d9b'
  },
  {
    icon: '🫳',
    title: 'Cheeks That Slap',
    desc: 'Visuals so loud they leave a mark. Not your boring flat corporate design — we make cheeks that echo across the industry.',
    tag: 'full chaos edition',
    color: '#b44fff'
  },
  {
    icon: '⛪',
    title: 'Missionary Takeover',
    desc: 'We penetrate your market from the most classic angle. Aatharva goes full missionary mode — deep, consistent, and surprisingly spiritual.',
    tag: 'aatharva\'s chaos',
    color: '#b44fff'
  },
  {
    icon: '💋',
    title: 'Sexual Strategy',
    desc: 'Dhariya crafts strategies so seductive your competitors won\'t know what hit them. Executed with military precision. Very intimate. Very effective.',
    tag: 'dhariya\'s mission',
    color: '#00d4ff'
  },
  {
    icon: '🔥',
    title: 'Content Creation',
    desc: 'Content so zesty it makes people question their life choices. We write, shoot, edit — all with maximum drama.',
    tag: 'group effort',
    color: '#ff6b35'
  },
  {
    icon: '🥵',
    title: 'Thark Pleasurement',
    desc: 'We satisfy your deepest business cravings. Whatever you\'re tharki for — results, growth, or just a good time — we deliver from all angles.',
    tag: 'full trio mode',
    color: '#ff2d9b'
  }
]

export default function WhatWeDo() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="services" className="services-section">
      <div className="services-bg-grid" />

      <div className="section-header">
        <motion.div
          className="section-tag"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          🔧 what we do
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Services with <span className="text-accent-purple">Zero Chill</span>
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          we do it all. from the front. from the back. from angles you didn\'t know existed.
        </motion.p>
      </div>

      <div className="services-grid">
        {services.map((svc, i) => (
          <motion.div
            key={i}
            className="service-card"
            style={{ '--svc-color': svc.color } as any}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <div className="svc-glow" />
            <div className="svc-icon">{svc.icon}</div>
            <h3 className="svc-title">{svc.title}</h3>
            <p className="svc-desc">{svc.desc}</p>
            <div className="svc-tag">{svc.tag}</div>
            {hovered === i && (
              <motion.div
                className="svc-hover-bar"
                layoutId="svc-bar"
                style={{ background: svc.color }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="services-bottom-text"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <span>💀 side effects include:</span> uncontrollable growth, excessive results, and mild obsession with our work
      </motion.div>
    </section>
  )
}
