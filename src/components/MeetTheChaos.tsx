import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const characters = [
  {
    id: 'aaditya',
    name: 'Aaditya',
    title: 'The Chikna™',
    nickname: 'Not Pink Floyd, Pink Pussy is the way to go 🌸',
    emoji: '🎸',
    color: '#ff2d9b',
    glow: 'rgba(255,45,155,0.5)',
    image: '/images/aaditya.png',
    tagline: '"yes daddy."',
    vibe: 'smooth • charming • main character energy',
    hoverLine: 'stroking his guitar... or something else 👀',
    bio: 'Aaditya is the guy who walks into a room and suddenly everyone forgets what they were saying. Silky smooth, criminally charming, and deceptively dangerous. Talks less, does more. The "shy one" who somehow always ends up at the center of everything. Has main character energy so strong it bends reality. His guitar strings have caused more emotional damage than therapy can fix.',
    skills: ['Smooth Talking', 'Guitar Serenades', 'Saying "yes daddy"', 'Looking Effortlessly Hot', 'Quiet Devastation'],
    quote: '"I don\'t chase. I attract. And then I say yes daddy."',
    stats: { charm: 99, chaos: 45, lust: 88, discipline: 60, assTightness: 50, mouthTightness: 100 },
    special: { label: 'Guitar Stroking 🎸', value: 100, isDebuff: false },
    positions: ['Missionary', 'Blowjob - Kneeling', 'Cowboy - Reverse', 'Spoons', '69 - Sideways', 'Lap Dance', 'Deep Throat', 'Lotus', 'Bodyguard', 'Pile Driver'],
    voiceText: 'Aaditya... come here baby',
    voicePitch: 1.3,
    voiceRate: 0.75,
  },
  {
    id: 'aatharva',
    name: 'Aatharva',
    title: 'The Unhinged™',
    nickname: 'Chuma Chati with Guitar 🎸💋',
    emoji: '🍼',
    color: '#b44fff',
    glow: 'rgba(180,79,255,0.5)',
    image: '/images/aatharva.png',
    tagline: '"full send or no send."',
    vibe: 'soft baby • secretly chaotic • uwu but make it dangerous',
    hoverLine: 'blushing but thinking very bad thoughts 🍼',
    bio: 'Don\'t be fooled by the soft eyes and the baby energy. Aatharva looks like he needs a hug and a juice box, but the moment you give him either — it\'s over for you. Shy in the streets, absolutely unhinged in the sheets. Says "hehe" before doing something that should be illegal. The type to blush when you look at him and then destroy your entire emotional stability by the end of the night.',
    skills: ['Baby Energy', 'Dangerous Shyness', 'Uwu Manipulation', 'Unexpected Chaos', 'Blush and Devour'],
    quote: '"h-hehe... s-sorry i didn\'t mean to— actually yes i did mean to. every single thing."',
    stats: { charm: 88, chaos: 75, lust: 97, discipline: 12, assTightness: 100, mouthTightness: 100 },
    special: { label: 'Guitar Stroking 🎸', value: 69, isDebuff: false },
    positions: ['Doggy Style', 'Cowboy - Standing', 'Bulldog', 'Spit Roast', 'Triple Penetration', 'Pile Driver - Reverse', 'Rimjob - Doggy', 'Bumper Cars', '69 - Standing', 'Anal Train'],
    voiceText: 'Aatharva... aww come here you little baby',
    voicePitch: 1.3,
    voiceRate: 0.78,
  },
  {
    id: 'dhariya',
    name: 'Dhariya',
    title: 'The Mission™',
    nickname: 'Riya 🎖️',
    emoji: '🥺',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.5)',
    image: '/images/dhariya.png',
    tagline: '"mission: missionary."',
    vibe: 'soft military boy • shy • dramatic about it',
    hoverLine: 'blushing in camo 🥺🎖️',
    bio: 'Dhariya likes the army. He thinks the uniforms are cute, the structure is comforting, and the discipline is... aspirational. In practice? He\'s the shyest person in the room. Will hold the door open for you, look away when you smile at him, and then go home and write about it in his diary. Sharp jawline, soft heart. Looks like he could bench press a tank but gets flustered when you say his name. The mission is missionary. He\'s just too shy to say it.',
    skills: ['Shy Boy Energy', 'Secret Softness', 'Uniform Appreciation', 'Blushing On Command', 'Quiet Intensity'],
    quote: '"I-I\'m not blushing. It\'s just... warm in here. The mission is... um. Hi."',
    stats: { charm: 85, chaos: 35, lust: 90, discipline: 0, assTightness: 70, mouthTightness: 30 },
    special: { label: 'Chatti 🫦', value: 100, isDebuff: false },
    positions: ['Missionary', 'Spoons', 'Lotus', 'Bodyguard', 'Lap Dance', 'Rear Entry', 'Scissors', 'Side by Side', 'Teaspoons', 'Deep Impact'],
    voiceText: 'Dhariya... oh my god you\'re so cute when you\'re shy',
    voicePitch: 1.25,
    voiceRate: 0.74,
  },
  {
    id: 'dweeb',
    name: 'Dweeb',
    title: 'The Big Daddy™',
    nickname: 'Secretly the Hottest One 🤓🔥',
    emoji: '🤓',
    color: '#39ff14',
    glow: 'rgba(57,255,20,0.5)',
    image: '/images/dweeb.png',
    tagline: '"yo shawty you tryna smash?"',
    vibe: 'nerdy • secretly dangerous • surprisingly freaky',
    hoverLine: 'calculating your rizz score... it\'s high 🤓',
    bio: 'Don\'t let the glasses fool you. Dweeb is the most dangerous one in the room because nobody sees him coming. Quiet, bookish, slightly awkward — until the lights go off. Then suddenly it\'s a completely different story. Knows 47 languages, 3 martial arts, and exactly what you want before you do. The nerd arc is a villain arc. You\'ve been warned.',
    skills: ['Hidden Freakiness', 'Big Brain Energy', 'Surprising Stamina', 'Knowing Everything', 'Unexpected Rizz'],
    quote: '"I calculated the probability of you falling for me. It was 100%. I ran the numbers twice."',
    stats: { charm: 72, chaos: 30, lust: 95, discipline: 88, assTightness: 85, mouthTightness: 92 },
    special: { label: 'Infertility 🧬 (DEBUFF)', value: 98, isDebuff: true },
    positions: ['Missionary', 'Deep Impact', 'Lotus', '69 - Sitting', 'Spoons', 'Folded Deck Chair', 'Pile Driver', 'Suspended Congress', 'Scissors', 'Mirror of Pleasure'],
    voiceText: 'Dweeeeb... oh my god you\'re so smart and so hot',
    voicePitch: 1.35,
    voiceRate: 0.78,
  },
]

// ── Voice helper ──────────────────────────────────────────────────────────────
function speakName(text: string, pitch: number, rate: number, onDone?: () => void) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.pitch = pitch
  utter.rate = rate
  utter.volume = 1
  const voices = window.speechSynthesis.getVoices()
  const femaleVoice =
    voices.find(v => /female|woman|girl|zira|samantha|victoria|karen|moira|tessa|fiona|veena|allison|ava|susan/i.test(v.name)) ||
    voices.find(v => v.name.includes('Google UK English Female')) ||
    voices.find(v => v.name.includes('Google US English')) ||
    voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB') ||
    voices[0]
  if (femaleVoice) utter.voice = femaleVoice
  utter.onend = () => onDone?.()
  window.speechSynthesis.speak(utter)
}

// ── StatBar ───────────────────────────────────────────────────────────────────
function StatBar({ label, value, color, isDebuff }: { label: string; value: number; color: string; isDebuff?: boolean }) {
  return (
    <div className="stat-row">
      <span className="stat-label" style={isDebuff ? { color: '#ff4444' } : {}}>{label}</span>
      <div className="stat-bar-bg">
        <motion.div
          className="stat-bar-fill"
          style={{
            background: isDebuff ? 'linear-gradient(90deg, #ff4444, #ff0000)' : color,
            boxShadow: isDebuff ? '0 0 8px #ff4444' : `0 0 8px ${color}`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
      <span className="stat-val" style={isDebuff ? { color: '#ff4444' } : {}}>{isDebuff ? `${value} ☠️` : value}</span>
    </div>
  )
}

// ── VoiceButton ───────────────────────────────────────────────────────────────
function VoiceButton({ char }: { char: typeof characters[0] }) {
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    setSpeaking(true)
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speakName(char.voiceText, char.voicePitch, char.voiceRate, () => setSpeaking(false))
      }
    } else {
      speakName(char.voiceText, char.voicePitch, char.voiceRate, () => setSpeaking(false))
    }
  }

  return (
    <motion.button
      className={`voice-btn ${speaking ? 'voice-btn-speaking' : ''}`}
      style={{ '--vc': char.color } as any}
      onClick={handleSpeak}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
      title={`Hear someone call ${char.name} flirtatiously 💋`}
    >
      <AnimatePresence>
        {speaking && [0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="voice-ripple"
            style={{ borderColor: char.color }}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{}}
            transition={{ duration: 1.2, delay: i * 0.35, repeat: Infinity, repeatDelay: 0.7 }}
          />
        ))}
      </AnimatePresence>
      <span className="voice-icon">{speaking ? '🔊' : '🔈'}</span>
      <span className="voice-label">
        {speaking ? `calling ${char.name}...` : `say "${char.name}" 💋`}
      </span>
    </motion.button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MeetTheChaos() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section id="chaos" className="chaos-section">
      <div className="section-header">
        <motion.div
          className="section-tag"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          👥 the quartet
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Meet the <span className="text-accent-pink">Chaos</span>
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          four personalities. zero chill. infinite results.
        </motion.p>
      </div>

      <div className="chaos-grid">
        {characters.map((char, i) => (
          <motion.div
            key={char.id}
            className={`char-card ${expanded === char.id ? 'char-card-expanded' : ''}`}
            style={{ '--char-color': char.color, '--char-glow': char.glow } as any}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            onHoverStart={() => setHovered(char.id)}
            onHoverEnd={() => setHovered(null)}
            onClick={() => setExpanded(expanded === char.id ? null : char.id)}
          >
            <div className="char-card-inner">
              <div className="char-img-wrap">
                <img src={char.image} alt={char.name} className="char-img" />
                <div className="char-img-glow" />
                <AnimatePresence>
                  {hovered === char.id && (
                    <motion.div
                      className="char-hover-line"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      {char.hoverLine}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="char-info">
                <div className="char-emoji">{char.emoji}</div>

                {/* ✨ Neon glowing name */}
                <h3
                  className="char-name char-name-glow"
                  style={{
                    color: char.color,
                    textShadow: `0 0 10px ${char.color}, 0 0 30px ${char.color}, 0 0 60px ${char.color}`,
                  }}
                >
                  {char.name}
                </h3>

                <div className="char-title">{char.title}</div>
                <div className="char-nickname">aka: {char.nickname}</div>
                <div className="char-tagline">{char.tagline}</div>
                <div className="char-vibe">{char.vibe}</div>

                <div onClick={e => e.stopPropagation()}>
                  <VoiceButton char={char} />
                </div>

                <div className="char-expand-hint">
                  {expanded === char.id ? '▲ collapse' : '▼ click to expose'}
                </div>
              </div>

              <AnimatePresence>
                {expanded === char.id && (
                  <motion.div
                    className="char-expanded"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="char-bio">{char.bio}</p>
                    <div className="char-skills">
                      {char.skills.map(s => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                    <div className="char-stats">
                      <StatBar label="Charm" value={char.stats.charm} color={char.color} />
                      <StatBar label="Chaos" value={char.stats.chaos} color={char.color} />
                      <StatBar label="Lust" value={char.stats.lust} color={char.color} />
                      <StatBar label="Discipline" value={char.stats.discipline} color={char.color} />
                      <div className="stats-divider">🍑 the real metrics</div>
                      <StatBar label="Ass 🍑" value={char.stats.assTightness} color={char.color} />
                      <StatBar label="Mouth 👄" value={char.stats.mouthTightness} color={char.color} />
                      <div className={`stats-divider ${char.special.isDebuff ? 'debuff-divider' : 'special-divider'}`}>
                        {char.special.isDebuff ? '☠️ debuff' : '⭐ signature skill'}
                      </div>
                      <StatBar
                        label={char.special.label}
                        value={char.special.value}
                        color={char.color}
                        isDebuff={char.special.isDebuff}
                      />
                    </div>
                    <div className="positions-section">
                      <div className="stats-divider">🔥 favourite positions</div>
                      <div className="positions-grid">
                        {char.positions.map((pos: string, idx: number) => (
                          <span key={idx} className="position-tag" style={{ borderColor: char.color, color: char.color }}>
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>
                    <blockquote className="char-quote">{char.quote}</blockquote>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
