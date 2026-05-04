import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Scores = { aaditya: number; aatharva: number; dhariya: number; dweeb: number }

const questions = [
  {
    id: 1,
    question: 'Your ideal first move is...',
    options: [
      { text: 'A soft strum on the guitar while making intense eye contact 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: 'Grabbing you by the hand and dragging you into chaos 🌪️', scores: { aaditya: 0, aatharva: 3, dhariya: 1, dweeb: 0 } },
      { text: 'A shy glance followed by blushing and looking away 🥺', scores: { aaditya: 1, aatharva: 0, dhariya: 3, dweeb: 1 } },
      { text: 'Reciting your horoscope compatibility stats with 97.3% accuracy 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 2,
    question: 'What energy do you need in your life RIGHT NOW?',
    options: [
      { text: 'Quiet devastation. The type that ruins you slowly 🥀', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: 'FULL CHAOS. MAXIMUM SPEED. ZERO BRAKES 🔥', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Soft and shy but hiding something dangerous 🥺', scores: { aaditya: 0, aatharva: 1, dhariya: 3, dweeb: 1 } },
      { text: 'Someone who knows exactly what you want before you do 🤓', scores: { aaditya: 1, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 3,
    question: 'Your ideal date night is...',
    options: [
      { text: 'Candlelight, guitar serenades, and "yes daddy" whispered at 2am 🕯️', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: 'Spontaneous road trip to nowhere with 3 energy drinks and bad decisions 🚗', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Shy dinner where he blushes every time you smile at him 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 1 } },
      { text: 'A museum followed by him explaining everything in terrifying detail 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 1, dweeb: 3 } },
    ]
  },
  {
    id: 4,
    question: 'How do you like your chaos served?',
    options: [
      { text: 'Slow-cooked. Simmering tension that explodes at exactly the right moment 🌡️', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 1 } },
      { text: 'RAW. UNFILTERED. STRAIGHT TO THE FACE 💥', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Wrapped in a shy smile and zero warning 🥺', scores: { aaditya: 0, aatharva: 1, dhariya: 3, dweeb: 0 } },
      { text: 'Scientifically calculated and delivered with precision 🧬', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 5,
    question: 'Which red flag is actually a green flag for you?',
    options: [
      { text: 'Says "yes daddy" to everything but somehow always gets what he wants 😏', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 0 } },
      { text: 'Calls you at 3am because he had a vision and needs to tell you RIGHT NOW 📞', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Writes about you in his diary but won\'t admit it 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 1 } },
      { text: 'Tells you "yo shawty you tryna smash?" completely unironically 🤓', scores: { aaditya: 0, aatharva: 1, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 6,
    question: 'What\'s your love language?',
    options: [
      { text: 'Guitar strings and loaded silence that says more than words ever could 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 0 } },
      { text: 'Being the main character in someone\'s unhinged adventure 🌪️', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Someone who holds the door and then blushes about it for 3 days 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 1 } },
      { text: 'Being told your compatibility score is statistically perfect 🤓', scores: { aaditya: 1, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 7,
    question: 'In bed, you prefer someone who...',
    options: [
      { text: 'Takes their time. Agonisingly slow. Knows exactly what they\'re doing 🐍', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 1 } },
      { text: 'Goes from 0 to 100 instantly with no warning and no apologies 💣', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Is shy about it but somehow the most intense experience of your life 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 1 } },
      { text: 'Has clearly done extensive research on the subject 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 8,
    question: 'Your toxic trait is...',
    options: [
      { text: 'Being attracted to the quiet ones who ruin you with a single look 🥀', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 1 } },
      { text: 'Loving chaos so much you\'d follow it off a cliff 🌪️', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Finding shy boys with hidden intensity inexplicably irresistible 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: 'Being attracted to someone who says "yo shawty" without irony 🤓', scores: { aaditya: 0, aatharva: 1, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 9,
    question: 'What\'s the vibe you\'re going for?',
    options: [
      { text: 'Soft boy energy with main character damage 🎭', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: 'Unhinged baby who somehow makes it work 🌪️', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Shy military boy who writes poetry about you 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: 'Big Daddy energy with glasses and a spreadsheet 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 10,
    question: 'Final question: what do you whisper at 3am?',
    options: [
      { text: '"Play me something on the guitar..." 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 0 } },
      { text: '"Let\'s do something absolutely terrible" 😈', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: '"I saw you blushing earlier... I liked it" 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: '"yo shawty you tryna smash?" 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
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
    emoji: '🍼',
    color: '#b44fff',
    glow: 'rgba(180,79,255,0.5)',
    title: 'Chaos Has Chosen You',
    desc: 'You don\'t just tolerate chaos — you NEED it. Aatharva is your soulmate. Baby-faced, full-send energy. He\'ll look at you with soft eyes and then absolutely destroy your emotional stability. Congratulations. 🌪️',
    warning: 'WARNING: Side effects include sleep deprivation, questionable decisions, and being perpetually on 1000%.',
    nickname: 'Chuma Chati with Guitar 🎸💋'
  },
  dhariya: {
    name: 'Dhariya',
    emoji: '🥺',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.5)',
    title: 'Riya Has Reported For Your Duty',
    desc: 'You like soft intensity. Someone who blushes when you look at them but somehow still ends up being the most intense experience of your life. Dhariya is your match — shy on the outside, missionary on the inside. 🥺',
    warning: 'WARNING: He will write about this in his diary. Multiple entries.',
    nickname: 'Riya 🎖️'
  },
  dweeb: {
    name: 'Dweeb',
    emoji: '🤓',
    color: '#39ff14',
    glow: 'rgba(57,255,20,0.5)',
    title: 'The Big Daddy Has Found You',
    desc: 'You are attracted to dangerous intelligence wrapped in awkward packaging. Dweeb calculated the exact probability of you two ending up together (it was 100%) and has been preparing ever since. He said "yo shawty you tryna smash?" and somehow it worked. On you. Right now. 🤓',
    warning: 'WARNING: Infertility debuff active. Results may vary. He ran the numbers.',
    nickname: 'Secretly the Hottest One 🤓🔥'
  }
}

// ── JoJo theme via Web Audio API (no external files needed) ──────────────────
function playJojoTheme(audioRef: React.MutableRefObject<AudioContext | null>) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioRef.current = ctx

    const master = ctx.createGain()
    master.gain.setValueAtTime(0.18, ctx.currentTime)
    master.connect(ctx.destination)

    // Giorno's theme opening motif — iconic 4-note rising sequence
    const notes = [
      // time, freq, duration, type
      [0.0,  329.63, 0.18, 'sawtooth'],   // E4
      [0.2,  392.00, 0.18, 'sawtooth'],   // G4
      [0.4,  493.88, 0.18, 'sawtooth'],   // B4
      [0.6,  659.25, 0.35, 'sawtooth'],   // E5
      [1.0,  587.33, 0.18, 'sawtooth'],   // D5
      [1.2,  493.88, 0.18, 'sawtooth'],   // B4
      [1.4,  440.00, 0.35, 'sawtooth'],   // A4
      [1.9,  493.88, 0.18, 'sawtooth'],   // B4
      [2.1,  392.00, 0.18, 'sawtooth'],   // G4
      [2.3,  329.63, 0.35, 'sawtooth'],   // E4
      [2.8,  261.63, 0.18, 'sawtooth'],   // C4
      [3.0,  293.66, 0.18, 'sawtooth'],   // D4
      [3.2,  329.63, 0.55, 'sawtooth'],   // E4
      // second phrase
      [4.0,  392.00, 0.18, 'square'],
      [4.2,  440.00, 0.18, 'square'],
      [4.4,  493.88, 0.18, 'square'],
      [4.6,  587.33, 0.35, 'square'],
      [5.1,  659.25, 0.18, 'square'],
      [5.3,  587.33, 0.18, 'square'],
      [5.5,  523.25, 0.55, 'square'],
      [6.1,  493.88, 0.18, 'square'],
      [6.3,  440.00, 0.18, 'square'],
      [6.5,  392.00, 0.35, 'square'],
      [7.0,  349.23, 0.18, 'square'],
      [7.2,  329.63, 0.18, 'square'],
      [7.4,  293.66, 0.55, 'square'],
    ] as [number, number, number, OscillatorType][]

    notes.forEach(([time, freq, dur, type]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time)
      gain.gain.setValueAtTime(0, ctx.currentTime + time)
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + time + 0.02)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + time + dur)
      osc.connect(gain)
      gain.connect(master)
      osc.start(ctx.currentTime + time)
      osc.stop(ctx.currentTime + time + dur + 0.05)
    })
  } catch (e) {
    console.log('Audio not supported')
  }
}

export default function Quiz() {
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Scores>({ aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 0 })
  const [result, setResult] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [started, setStarted] = useState(false)
  const [playingMusic, setPlayingMusic] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)

  const handleStart = () => {
    setStarted(true)
    setPlayingMusic(true)
    playJojoTheme(audioRef)
    setTimeout(() => setPlayingMusic(false), 8000)
  }

  const handleAnswer = (optionScores: Scores) => {
    const newScores: Scores = {
      aaditya: scores.aaditya + optionScores.aaditya,
      aatharva: scores.aatharva + optionScores.aatharva,
      dhariya: scores.dhariya + optionScores.dhariya,
      dweeb: scores.dweeb + optionScores.dweeb,
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
    if (audioRef.current) { audioRef.current.close(); audioRef.current = null }
    setCurrent(0)
    setScores({ aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 0 })
    setResult(null)
    setSelected(null)
    setStarted(false)
    setPlayingMusic(false)
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
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {playingMusic ? '🎵 CHAOS INITIATED...' : '✦ FIND YOUR STAND ✦'}
              </motion.button>
              {playingMusic && (
                <motion.p
                  className="quiz-music-note"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: 3 }}
                >
                  ♪ giorno's theme has entered the chat ♪
                </motion.p>
              )}
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
                      setTimeout(() => handleAnswer(opt.scores as Scores), 300)
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
              <h3 className="result-name" style={{ color: res.color, textShadow: `0 0 20px ${res.color}` }}>{res.name}</h3>
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
