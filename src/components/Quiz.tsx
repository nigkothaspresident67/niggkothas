import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Scores = { aaditya: number; aatharva: number; dhariya: number; dweeb: number }

const TIMER_SECONDS = 10

const questions = [
  {
    id: 1,
    question: '✦ A mysterious stranger locks eyes with you across the room. What\'s their opening move?',
    options: [
      { text: 'Slow guitar strum. Doesn\'t break eye contact. Doesn\'t blink. You\'re already in love 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: 'Trips over nothing, blushes, then somehow ends up sitting next to you 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 1, dweeb: 0 } },
      { text: 'Looks away immediately when you catch them staring. Writes about it later 🥺', scores: { aaditya: 1, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: 'Walks up and says "yo shawty you tryna smash?" with full confidence 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 2,
    question: '✦ ZA WARUDO — time stops. What\'s your type doing in the frozen moment?',
    options: [
      { text: 'Still playing guitar. Time means nothing to him 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 0 } },
      { text: 'Somehow still moving. Chaos transcends time 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Frozen mid-blush, diary in hand 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: 'Already calculated how to use frozen time for maximum efficiency 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 3,
    question: '✦ It\'s 3AM. Your phone lights up. What\'s the text?',
    options: [
      { text: '"can\'t sleep. wrote a song about you. yes daddy" 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: '"hehe i just did something really bad wanna hear" 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: '"i saw you today and my heart did a thing. sorry. goodnight." 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 1 } },
      { text: '"yo shawty statistically speaking we should be dating" 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 4,
    question: '✦ MUDA MUDA MUDA — your ideal chaos is served how?',
    options: [
      { text: 'Slow burn. Months of tension. One look that destroys you completely 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: 'Immediate. Unhinged. Zero warning. Maximum baby energy 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Shy and quiet until suddenly it\'s the most intense thing that\'s ever happened 🥺', scores: { aaditya: 0, aatharva: 1, dhariya: 3, dweeb: 0 } },
      { text: 'Scientifically optimised chaos delivered at peak efficiency 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 5,
    question: '✦ Which Stand ability would your person definitely have?',
    options: [
      { text: 'PINK FLOYD — makes anyone fall in love with a single chord 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 0 } },
      { text: 'BABY RAGE — transforms from soft to unhinged in 0.3 seconds 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'SILENT RIYA — makes you feel everything without saying a word 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: 'BIG DADDY — calculates your weaknesses and exploits them academically 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 6,
    question: '✦ Requiem. Your ideal love language — evolved form:',
    options: [
      { text: 'Playing a song that\'s clearly about you but he\'ll never admit it 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 0 } },
      { text: 'Sending memes at 4AM followed by "hehe sorry were you sleeping" 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 1 } },
      { text: 'Doing everything for you without saying a word and blushing if noticed 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: 'Creating a 47-slide presentation on why you two are compatible 🤓', scores: { aaditya: 1, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 7,
    question: '✦ ORA ORA ORA — in bed, your Stand user...',
    options: [
      { text: 'Takes. Their. Time. Every. Single. Second. Agonising. Perfect. 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: 'Says "hehe" before doing something that should be in a warning label 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Shy the whole time but somehow the most devastating experience of your life 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 1 } },
      { text: 'Has clearly studied. Extensively. With citations. 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 8,
    question: '✦ This is your villain arc. What\'s your toxic attraction?',
    options: [
      { text: 'The quiet ones who destroy you with a single "yes daddy" 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 0 } },
      { text: 'Baby-faced chaotic gremlins with zero impulse control 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Shy boys with hidden intensity who write poetry about you 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: 'Nerds who say "yo shawty" and somehow you\'re into it 🤓', scores: { aaditya: 0, aatharva: 1, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 9,
    question: '✦ GOLDEN EXPERIENCE — what\'s the vibe you\'re manifesting?',
    options: [
      { text: 'Main character energy. Soft destruction. Guitar at midnight. 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 1, dweeb: 0 } },
      { text: 'Chaotic baby energy. Soft face. Dangerous thoughts. Maximum hehe. 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: 'Shy military boy who blushes but also has the mission. 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
      { text: 'Big Daddy with glasses and a spreadsheet and zero shame. 🤓', scores: { aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 3 } },
    ]
  },
  {
    id: 10,
    question: '✦ Final Stand — it\'s 3AM and you whisper into the darkness...',
    options: [
      { text: '"play me something..." 🎸', scores: { aaditya: 3, aatharva: 0, dhariya: 0, dweeb: 0 } },
      { text: '"hehe... wanna do something stupid?" 🍼', scores: { aaditya: 0, aatharva: 3, dhariya: 0, dweeb: 0 } },
      { text: '"I saw you blushing. I liked it. A lot." 🥺', scores: { aaditya: 0, aatharva: 0, dhariya: 3, dweeb: 0 } },
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
    title: 'Baby Chaos Has Chosen You',
    desc: 'You are attracted to soft faces and unhinged energy. Aatharva will say "hehe" and then do something catastrophic. He\'s the baby of the group and also the most dangerous. You\'ve been warned. You won\'t listen. 🌪️',
    warning: 'WARNING: Side effects include sleep deprivation, questionable decisions, and perpetual hehe energy.',
    nickname: 'Chuma Chati with Guitar 🎸💋'
  },
  dhariya: {
    name: 'Dhariya',
    emoji: '🥺',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.5)',
    title: 'Riya Has Reported For Your Duty',
    desc: 'You like soft intensity. Someone who blushes when you look at them but somehow still ends up being the most intense experience of your life. Dhariya is your match — shy on the outside, missionary on the inside. He will write about this. Multiple entries. 🥺',
    warning: 'WARNING: He will write about this in his diary. Multiple entries. Illustrated.',
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

function playJojoTheme(audioRef: React.MutableRefObject<AudioContext | null>) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioRef.current = ctx
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.18, ctx.currentTime)
    master.connect(ctx.destination)
    const notes: [number, number, number, OscillatorType][] = [
      [0.0, 329.63, 0.18, 'sawtooth'], [0.2, 392.00, 0.18, 'sawtooth'],
      [0.4, 493.88, 0.18, 'sawtooth'], [0.6, 659.25, 0.35, 'sawtooth'],
      [1.0, 587.33, 0.18, 'sawtooth'], [1.2, 493.88, 0.18, 'sawtooth'],
      [1.4, 440.00, 0.35, 'sawtooth'], [1.9, 493.88, 0.18, 'sawtooth'],
      [2.1, 392.00, 0.18, 'sawtooth'], [2.3, 329.63, 0.35, 'sawtooth'],
      [2.8, 261.63, 0.18, 'sawtooth'], [3.0, 293.66, 0.18, 'sawtooth'],
      [3.2, 329.63, 0.55, 'sawtooth'], [4.0, 392.00, 0.18, 'square'],
      [4.2, 440.00, 0.18, 'square'],   [4.4, 493.88, 0.18, 'square'],
      [4.6, 587.33, 0.35, 'square'],   [5.1, 659.25, 0.18, 'square'],
      [5.3, 587.33, 0.18, 'square'],   [5.5, 523.25, 0.55, 'square'],
      [6.1, 493.88, 0.18, 'square'],   [6.3, 440.00, 0.18, 'square'],
      [6.5, 392.00, 0.35, 'square'],   [7.0, 349.23, 0.18, 'square'],
      [7.2, 329.63, 0.18, 'square'],   [7.4, 293.66, 0.55, 'square'],
    ]
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
  } catch (e) { console.log('Audio not supported') }
}

export default function Quiz() {
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Scores>({ aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 0 })
  const [result, setResult] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [started, setStarted] = useState(false)
  const [playingMusic, setPlayingMusic] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [timerActive, setTimerActive] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer logic
  useEffect(() => {
    if (!timerActive || result) return
    if (timeLeft <= 0) {
      // auto-pick random answer on timeout
      const q = questions[current]
      const randomIdx = Math.floor(Math.random() * q.options.length)
      handleAnswer(q.options[randomIdx].scores as Scores, true)
      return
    }
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive, timeLeft, current, result])

  // Reset timer on new question
  useEffect(() => {
    if (!started || result) return
    setTimeLeft(TIMER_SECONDS)
    setTimerActive(true)
  }, [current, started])

  const handleStart = () => {
    setStarted(true)
    setPlayingMusic(true)
    setTimeLeft(TIMER_SECONDS)
    setTimerActive(true)
    playJojoTheme(audioRef)
    setTimeout(() => setPlayingMusic(false), 8000)
  }

  const handleAnswer = (optionScores: Scores, auto = false) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerActive(false)
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
      setTimeout(() => setResult(winner), auto ? 100 : 400)
    } else {
      setTimeout(() => setCurrent(c => c + 1), auto ? 100 : 350)
    }
  }

  const reset = () => {
    if (audioRef.current) { audioRef.current.close(); audioRef.current = null }
    if (timerRef.current) clearInterval(timerRef.current)
    setCurrent(0)
    setScores({ aaditya: 0, aatharva: 0, dhariya: 0, dweeb: 0 })
    setResult(null)
    setSelected(null)
    setStarted(false)
    setPlayingMusic(false)
    setTimeLeft(TIMER_SECONDS)
    setTimerActive(false)
  }

  const timerPct = (timeLeft / TIMER_SECONDS) * 100
  const timerColor = timeLeft > 6 ? '#ffd700' : timeLeft > 3 ? '#ff6b35' : '#ff2d9b'

  const q = questions[current]
  const res = result ? results[result as keyof typeof results] : null

  return (
    <section id="quiz" className="quiz-section">
      <div className="quiz-bg-diamonds" />
      <div className="quiz-bg-glow" />

      <div className="section-header">
        <motion.div className="section-tag jojo-tag"
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          ✦ STAND: PARTNER FINDER ✦
        </motion.div>
        <motion.h2 className="section-title"
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          Which <span className="text-accent-gold">Niggkotha</span> Is Your Stand?
        </motion.h2>
        <motion.p className="section-sub"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          10 questions. 10 seconds each. your destiny awaits. YARE YARE DAZE...
        </motion.p>
      </div>

      <div className="quiz-container">
        <AnimatePresence mode="wait">

          {/* INTRO */}
          {!started && !result && (
            <motion.div key="intro" className="quiz-intro"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="quiz-intro-diamond">◆</div>
              <h3 className="quiz-intro-title">YOUR STAND AWAITS</h3>
              <p className="quiz-intro-sub">
                The universe has conspired to bring you here. 10 cursed questions, 10 seconds each — discover which niggkotha is your destined Stand partner in chaos, lust, and questionable life decisions.
              </p>
              <div className="quiz-intro-chars">
                {Object.values(results).map((r) => (
                  <div key={r.name} className="quiz-intro-char" style={{ '--qc': r.color } as any}>
                    <span className="quiz-intro-emoji">{r.emoji}</span>
                    <span>{r.name}</span>
                  </div>
                ))}
              </div>
              <motion.button className="quiz-start-btn" onClick={handleStart}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {playingMusic ? '🎵 CHAOS INITIATED...' : '✦ FIND YOUR STAND ✦'}
              </motion.button>
              {playingMusic && (
                <motion.p className="quiz-music-note"
                  initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: 3 }}>
                  ♪ giorno's theme has entered the chat ♪
                </motion.p>
              )}
            </motion.div>
          )}

          {/* QUESTION */}
          {started && !result && (
            <motion.div key={`q-${current}`} className="quiz-card"
              initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }} transition={{ duration: 0.3 }}>

              {/* top bar: progress + timer */}
              <div className="quiz-top-bar">
                <span className="quiz-q-num">◆ {current + 1} / {questions.length}</span>
                <div className={`quiz-timer-badge ${timeLeft <= 3 ? 'timer-danger' : timeLeft <= 6 ? 'timer-warn' : ''}`}>
                  <svg className="timer-ring" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke={timerColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="94.2"
                      strokeDashoffset={94.2 - (timerPct / 100) * 94.2}
                      style={{ filter: `drop-shadow(0 0 4px ${timerColor})`, transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                      transition={{ duration: 0.4 }}
                    />
                  </svg>
                  <span className="timer-number" style={{ color: timerColor }}>{timeLeft}</span>
                </div>
              </div>

              {/* progress bar */}
              <div className="quiz-progress-bar-bg" style={{ marginBottom: '1.5rem' }}>
                <motion.div className="quiz-progress-bar-fill"
                  animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.4 }} />
              </div>

              <h3 className="quiz-question">{q.question}</h3>

              <div className="quiz-options">
                {q.options.map((opt, i) => (
                  <motion.button key={i}
                    className={`quiz-option ${selected === i ? 'quiz-option-selected' : ''}`}
                    onClick={() => {
                      if (selected !== null) return
                      setSelected(i)
                      setTimeout(() => handleAnswer(opt.scores as Scores), 320)
                    }}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
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

          {/* RESULT */}
          {result && res && (
            <motion.div key="result" className="quiz-result"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{ '--res-color': res.color, '--res-glow': res.glow } as any}>
              <div className="result-glow-ring" />
              <motion.div className="result-emoji"
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, delay: 0.3 }}>
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
                      <motion.div className="result-score-bar"
                        style={{ background: results[char as keyof typeof results].color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / 30) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }} />
                    </div>
                    <span className="result-score-val">{score}</span>
                  </div>
                ))}
              </div>
              <p className="result-warning">{res.warning}</p>
              <motion.button className="quiz-restart-btn" onClick={reset}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                ◆ Try Again (Touch Grass First) ◆
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  )
}
