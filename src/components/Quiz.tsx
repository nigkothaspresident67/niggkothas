import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const questions = [
  {
    id: 1,
    question: 'Your ideal first move is...',
    options: [
      { text: 'A soft strum on the guitar while making intense eye contact 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 1 } },
      { text: 'Grabbing you by the hand and dragging you into chaos 🌪️', scores: { aaditya: 0, aatharva: 3, dhariya: 1 } },
      { text: 'A sharp salute followed by "permission to proceed, sir/ma\'am?" 🎖️', scores: { aaditya: 1, aatharva: 0, dhariya: 3 } },
      { text: 'Saying absolutely nothing but somehow you\'re already undressed 👀', scores: { aaditya: 2, aatharva: 1, dhariya: 1 } },
    ]
  },
  {
    id: 2,
    question: 'What energy do you need in your life RIGHT NOW?',
    options: [
      { text: 'Quiet devastation. The type that ruins you slowly 🥀', scores: { aaditya: 3, aatharva: 0, dhariya: 1 } },
      { text: 'FULL CHAOS. MAXIMUM SPEED. ZERO BRAKES 🔥', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: 'Disciplined passion. Intense but structured. Like a military operation 🎯', scores: { aaditya: 0, aatharva: 1, dhariya: 3 } },
      { text: 'Unpredictable. Keeps me on my toes. Slightly unhinged 😈', scores: { aaditya: 1, aatharva: 2, dhariya: 1 } },
    ]
  },
  {
    id: 3,
    question: 'Your ideal date night is...',
    options: [
      { text: 'Candlelight, guitar serenades, and "yes daddy" whispered at 2am 🕯️', scores: { aaditya: 3, aatharva: 0, dhariya: 1 } },
      { text: 'Spontaneous road trip to nowhere with 3 energy drinks and bad decisions 🚗', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: 'A precise 7-course dinner followed by a tactical debrief in the bedroom 🍽️', scores: { aaditya: 0, aatharva: 0, dhariya: 3 } },
      { text: 'Whatever feels right. Probably something illegal but romantic 💋', scores: { aaditya: 1, aatharva: 2, dhariya: 1 } },
    ]
  },
  {
    id: 4,
    question: 'How do you like your chaos served?',
    options: [
      { text: 'Slow-cooked. Simmering tension that explodes at exactly the right moment 🌡️', scores: { aaditya: 3, aatharva: 0, dhariya: 1 } },
      { text: 'RAW. UNFILTERED. STRAIGHT TO THE FACE 💥', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: 'With a side of protocol and a mission briefing beforehand 📋', scores: { aaditya: 0, aatharva: 0, dhariya: 3 } },
      { text: 'Surprise me. I trust the process 🎲', scores: { aaditya: 1, aatharva: 2, dhariya: 1 } },
    ]
  },
  {
    id: 5,
    question: 'Which red flag is actually a green flag for you?',
    options: [
      { text: 'Says "yes daddy" to everything but somehow always gets exactly what he wants 😏', scores: { aaditya: 3, aatharva: 0, dhariya: 0 } },
      { text: 'Calls you at 3am because he had a vision and needs to tell you RIGHT NOW 📞', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: 'Has a 47-step morning routine and expects you to follow it too 🌅', scores: { aaditya: 0, aatharva: 0, dhariya: 3 } },
      { text: 'All of the above simultaneously 🤡', scores: { aaditya: 1, aatharva: 1, dhariya: 1 } },
    ]
  },
  {
    id: 6,
    question: 'What\'s your love language?',
    options: [
      { text: 'Guitar strings and loaded silence that says more than words ever could 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0 } },
      { text: 'Being the main character in someone\'s unhinged adventure 🌪️', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: 'Acts of service. Very specific. Very intense. Very military 🪖', scores: { aaditya: 0, aatharva: 0, dhariya: 3 } },
      { text: 'All of the above but make it chaotic and slightly illegal 😈', scores: { aaditya: 1, aatharva: 1, dhariya: 1 } },
    ]
  },
  {
    id: 7,
    question: 'In bed, you prefer someone who...',
    options: [
      { text: 'Takes their time. Agonisingly slow. Knows exactly what they\'re doing 🐍', scores: { aaditya: 3, aatharva: 0, dhariya: 1 } },
      { text: 'Goes from 0 to 100 instantly with no warning and no apologies 💣', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: 'Follows a very specific protocol but executes it with terrifying precision 🎯', scores: { aaditya: 0, aatharva: 0, dhariya: 3 } },
      { text: 'Surprises you every single time. You never know what you\'re getting 🎁', scores: { aaditya: 1, aatharva: 2, dhariya: 1 } },
    ]
  },
  {
    id: 8,
    question: 'Your toxic trait is...',
    options: [
      { text: 'Being attracted to the quiet ones who ruin you with a single look 🥀', scores: { aaditya: 3, aatharva: 0, dhariya: 0 } },
      { text: 'Loving chaos so much you\'d follow it off a cliff 🌪️', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: 'Finding military discipline inexplicably attractive 🪖', scores: { aaditya: 0, aatharva: 0, dhariya: 3 } },
      { text: 'Having terrible taste and loving it 💅', scores: { aaditya: 1, aatharva: 1, dhariya: 1 } },
    ]
  },
  {
    id: 9,
    question: 'What\'s the vibe you\'re going for?',
    options: [
      { text: 'Soft boy energy with main character damage 🎭', scores: { aaditya: 3, aatharva: 0, dhariya: 0 } },
      { text: 'Unhinged gremlin who somehow makes it work 🌪️', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: 'Sharp, clean, dangerous — like a loaded weapon in a suit 💼', scores: { aaditya: 0, aatharva: 0, dhariya: 3 } },
      { text: 'A cursed blend of all three that should not exist 🧬', scores: { aaditya: 1, aatharva: 1, dhariya: 1 } },
    ]
  },
  {
    id: 10,
    question: 'Final question: what do you whisper at 3am?',
    options: [
      { text: '"Play me something on the guitar..." 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0 } },
      { text: '"Let\'s do something absolutely terrible" 😈', scores: { aaditya: 0, aatharva: 3, dhariya: 0 } },
      { text: '"Report for duty, soldier" 🪖', scores: { aaditya: 0, aatharva: 0, dhariya: 3 } },
      { text: '"yes daddy" (to all three simultaneously) 👁️', scores: { aaditya: 1, aatharva: 1, dhariya: 1 } },
    ]
  }
]

const results = {
  aaditya: {
    name: 'Aaditya',
    emoji: '🎸',
    color: '#ff2d9b',
    glow: 'rgba(255,45,155,0.5)',
    title: 'The Chikna is Your Destiny',
    desc: 'You crave the slow burn. The lingering looks. The guitar strum at midnight that says everything without saying anything. Aaditya is your person — smooth, charming, quietly devastating. He\'ll say "yes daddy" but somehow end up being the one in control. You\'re doomed in the best possible way. 🥀',
    warning: 'WARNING: May cause irreversible emotional attachment and an obsession with guitar music.',
    nickname: 'Not Pink Floyd, Pink Pussy is the way to go 🌸'
  },
  aatharva: {
    name: 'Aatharva',
    emoji: '🌪️',
    color: '#b44fff',
    glow: 'rgba(180,79,255,0.5)',
    title: 'Chaos Has Chosen You',
    desc: 'You don\'t just tolerate chaos — you NEED it. You\'re the type to follow someone off a cliff because they said it\'d be fun. Aatharva is your soulmate. Full send, zero brakes, maximum lust. He\'ll ruin your sleep schedule, your sanity, and your standards for everyone else. Congratulations. 🌪️',
    warning: 'WARNING: Side effects include sleep deprivation, questionable decisions, and being perpetually on 1000%.',
    nickname: 'Chuma Chati with Guitar 🎸💋'
  },
  dhariya: {
    name: 'Dhariya',
    emoji: '🎖️',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.5)',
    title: 'Riya Has Reported For Your Duty',
    desc: 'You like things precise. Intentional. Done with military-grade commitment. Dhariya is your match — sharp jawline, sharper instincts, and a dedication to the mission (missionary) that borders on obsessive. He\'ll execute your every desire with terrifying accuracy. The discipline is 0. The chatti is 100. 🎖️',
    warning: 'WARNING: May narrate your entire relationship like a war documentary. This is non-negotiable.',
    nickname: 'Riya 🎖️'
  }
}

export default function Quiz() {
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState({ aaditya: 0, aatharva: 0, dhariya: 0 })
  const [result, setResult] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [started, setStarted] = useState(false)

  const handleAnswer = (optionScores: { aaditya: number; aatharva: number; dhariya: number }) => {
    const newScores = {
      aaditya: scores.aaditya + optionScores.aaditya,
      aatharva: scores.aatharva + optionScores.aatharva,
      dhariya: scores.dhariya + optionScores.dhariya
    }
    setScores(newScores)
    setSelected(null)

    if (current + 1 >= questions.length) {
      const winner = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0][0]
      setTimeout(() => setResult(winner), 400)
    } else {
      setTimeout(() => setCurrent(c => c + 1), 400)
    }
  }

  const reset = () => {
    setCurrent(0)
    setScores({ aaditya: 0, aatharva: 0, dhariya: 0 })
    setResult(null)
    setSelected(null)
    setStarted(false)
  }

  const q = questions[current]
  const res = result ? results[result as keyof typeof results] : null

  return (
    <section id="quiz" className="quiz-section">
      <div className="quiz-bg-diamonds" />
      <div className="quiz-bg-glow" />

      <div className="section-header">
        <motion.div
          className="section-tag jojo-tag"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          ✦ STAND: PARTNER FINDER ✦
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Which <span className="text-accent-gold">Niggkotha</span> Are You??
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          10 questions. zero chill. your destiny awaits. YARE YARE DAZE...
        </motion.p>
      </div>

      <div className="quiz-container">
        <AnimatePresence mode="wait">
          {!started && !result && (
            <motion.div
              key="intro"
              className="quiz-intro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="quiz-intro-diamond">◆</div>
              <h3 className="quiz-intro-title">YOUR STAND AWAITS</h3>
              <p className="quiz-intro-sub">
                The universe has conspired to bring you here. Answer 10 cursed questions and discover which niggkotha is your destined partner in chaos, lust, and questionable life decisions.
              </p>
              <div className="quiz-intro-chars">
                {Object.values(results).map((r) => (
                  <div key={r.name} className="quiz-intro-char" style={{ '--qc': r.color } as any}>
                    <span className="quiz-intro-emoji">{r.emoji}</span>
                    <span>{r.name}</span>
                  </div>
                ))}
              </div>
              <motion.button
                className="quiz-start-btn"
                onClick={() => setStarted(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✦ FIND YOUR STAND ✦
              </motion.button>
            </motion.div>
          )}

          {started && !result && (
            <motion.div
              key={`q-${current}`}
              className="quiz-card"
              initial={{ opacity: 0, x: 80, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -80, rotateY: 15 }}
              transition={{ duration: 0.35 }}
            >
              <div className="quiz-progress">
                <div className="quiz-progress-text">
                  <span className="quiz-q-num">◆ {current + 1} / {questions.length}</span>
                </div>
                <div className="quiz-progress-bar-bg">
                  <motion.div
                    className="quiz-progress-bar-fill"
                    animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <h3 className="quiz-question">{q.question}</h3>

              <div className="quiz-options">
                {q.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    className={`quiz-option ${selected === i ? 'quiz-option-selected' : ''}`}
                    onClick={() => {
                      setSelected(i)
                      setTimeout(() => handleAnswer(opt.scores), 300)
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ x: 6, scale: 1.01 }}
                    disabled={selected !== null}
                  >
                    <span className="quiz-option-diamond">◆</span>
                    <span>{opt.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {result && res && (
            <motion.div
              key="result"
              className="quiz-result"
              initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{ '--res-color': res.color, '--res-glow': res.glow } as any}
            >
              <div className="result-glow-ring" />
              <motion.div
                className="result-emoji"
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                {res.emoji}
              </motion.div>
              <div className="result-stand-label">✦ YOUR STAND IS ✦</div>
              <h3 className="result-name" style={{ color: res.color }}>{res.name}</h3>
              <div className="result-nickname">aka: {res.nickname}</div>
              <h4 className="result-title">{res.title}</h4>
              <p className="result-desc">{res.desc}</p>
              <div className="result-scores">
                {Object.entries(scores).map(([char, score]) => (
                  <div key={char} className="result-score-row">
                    <span className="result-score-name">{char}</span>
                    <div className="result-score-bar-bg">
                      <motion.div
                        className="result-score-bar"
                        style={{ background: results[char as keyof typeof results].color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / 30) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <span className="result-score-val">{score}</span>
                  </div>
                ))}
              </div>
              <p className="result-warning">{res.warning}</p>
              <motion.button
                className="quiz-restart-btn"
                onClick={reset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ◆ Try Again (Touch Grass First) ◆
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
