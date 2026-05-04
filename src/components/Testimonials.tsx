import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const testimonials = [
  {
    name: 'Nehal',
    role: 'CEO, Some Startup',
    avatar: '👩‍💼',
    text: 'I don\'t know what they did but it worked. My website went from a digital corpse to something I\'m actually embarrassed to show my parents because it\'s too hot.',
    rating: 5,
    tag: 'verified chaos'
  },
  {
    name: 'Aryan S.',
    role: 'Confused Entrepreneur',
    avatar: '🧑‍💻',
    text: '10/10 chaos, would hire again. Aatharva showed up to our first meeting with three energy drinks and a vision that made absolutely no sense but somehow made millions.',
    rating: 5,
    tag: 'still processing'
  },
  {
    name: 'Prasad G.',
    role: 'Brand Manager',
    avatar: '👩‍🎨',
    text: 'Aaditya said "yes daddy" to every brief and delivered something better than what I asked for. I\'m concerned about my own feelings now.',
    rating: 5,
    tag: 'emotionally compromised'
  },
  {
    name: 'Moksh',
    role: 'Army General (Retired)',
    avatar: '👨‍✈️',
    text: 'Dhariya handled my rebrand with such military precision I almost saluted my own logo. The mission was missionary-level successful.',
    rating: 5,
    tag: 'mission accomplished'
  },
  {
    name: 'Dweej',
    role: 'Influencer (Recovering)',
    avatar: '👸',
    text: 'They redesigned my entire online presence while arguing with each other the whole time. Somehow the chaos produced the most beautiful thing I\'ve ever seen.',
    rating: 5,
    tag: 'chaotically blessed'
  },
  {
    name: 'Ramesh from Lokhandwala',
    role: 'Venture Capitalist',
    avatar: '🤵',
    text: 'I invested in niggkothas as a joke. Now they\'re my most profitable investment. I\'m not sure how to feel about this.',
    rating: 5,
    tag: 'accidentally rich'
  }
]

export default function Testimonials() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setActive(a => (a + 1) % testimonials.length), 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="section-header">
        <motion.div
          className="section-tag"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          💬 what they said
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Victims & <span className="text-accent-blue">Survivors</span>
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          real reviews from real people who survived the chaos
        </motion.p>
      </div>

      <div className="testimonials-carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="testimonial-card-main"
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className="testimonial-quote-mark">&ldquo;</div>
            <p className="testimonial-text">{testimonials[active].text}</p>
            <div className="testimonial-footer">
              <div className="testimonial-avatar">{testimonials[active].avatar}</div>
              <div>
                <div className="testimonial-name">{testimonials[active].name}</div>
                <div className="testimonial-role">{testimonials[active].role}</div>
              </div>
              <div className="testimonial-tag">{testimonials[active].tag}</div>
            </div>
            <div className="testimonial-stars">
              {'⭐'.repeat(testimonials[active].rating)}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="testimonial-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`t-dot ${i === active ? 't-dot-active' : ''}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className={`testimonial-mini ${i === active ? 'testimonial-mini-active' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActive(i)}
            whileHover={{ scale: 1.03 }}
          >
            <div className="mini-avatar">{t.avatar}</div>
            <div className="mini-name">{t.name}</div>
            <div className="mini-role">{t.role}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
