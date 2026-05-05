import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type CharId = 'aaditya' | 'aatharva' | 'dhariya' | 'dweeb'
type Phase = 'select' | 'fight' | 'gameover'

interface Fighter {
  id: CharId
  name: string
  emoji: string
  color: string
  hp: number
  maxHp: number
  def: number
  atkMult: number   // multiplier on top of base
  buffs: Buff[]
  debuffs: Debuff[]
  turnCount: number  // total turns taken
  ultReady: boolean
  // special flags
  loadedDih: boolean       // aaditya skill2 loaded
  fatJumpUsed: number      // dweeb: last turn fat jump used
  yumUsed: number          // dweeb: last turn yum used
  numbnessActive: boolean  // aatharva
  numbnessStrength: number // 0-100%
  introvertTicks: number   // aaditya lingering ticks left
  allMightActive: boolean  // dweeb ult
}

interface Buff  { name: string; value: number; turnsLeft: number }
interface Debuff { name: string; value: number; turnsLeft: number }

type MinigameType =
  | 'rta_babu'      // dhariya skill3
  | 'rta_totlapan'  // aatharva skill2
  | 'sf90'          // aaditya skill3
  | 'guitar_goon'   // secret ult
  | 'sharmana'      // dweeb skill1
  | 'yum'           // dweeb skill3
  | 'slur_shot'     // dhariya skill2 (auto)
  | null

// ─────────────────────────────────────────────
// CHARACTER DEFINITIONS
// ─────────────────────────────────────────────
const CHAR_DEFS: Record<CharId, { name: string; emoji: string; color: string; title: string; bio: string }> = {
  dhariya:  { name: 'Dhariya',  emoji: '🥺', color: '#00d4ff', title: 'The Mission™',    bio: 'Shy. Dramatic. Missionary.' },
  aatharva: { name: 'Aatharva', emoji: '🍼', color: '#b44fff', title: 'The Unhinged™',   bio: 'Baby energy. Dangerous thoughts.' },
  aaditya:  { name: 'Aaditya',  emoji: '🎸', color: '#ff2d9b', title: 'The Chikna™',     bio: 'Yes daddy. Quietly devastating.' },
  dweeb:    { name: 'Dweeb',    emoji: '🤓', color: '#39ff14', title: 'The Big Daddy™',  bio: 'Yo shawty. Ran the numbers.' },
}

function makeFighter(id: CharId): Fighter {
  return {
    id, ...CHAR_DEFS[id],
    hp: 100, maxHp: 100, def: 0, atkMult: 1,
    buffs: [], debuffs: [], turnCount: 0, ultReady: false,
    loadedDih: false, fatJumpUsed: -99, yumUsed: -99,
    numbnessActive: false, numbnessStrength: 0,
    introvertTicks: 0, allMightActive: false,
  }
}

function clamp(n: number, min = 0, max = 100) { return Math.max(min, Math.min(max, n)) }

// Apply defense reduction to incoming damage
function applyDef(dmg: number, def: number) {
  const reduced = dmg * (1 - def / 100)
  return Math.max(0, Math.round(reduced))
}

// ─────────────────────────────────────────────
// SKILL DEFINITIONS (labels only — logic in reducer)
// ─────────────────────────────────────────────
const SKILLS: Record<CharId, { label: string; desc: string; key: string }[]> = {
  dhariya: [
    { key: 'stalker',  label: '👁️ Stalker Eyes',    desc: '+10% ATK, +15% DEF' },
    { key: 'slur',     label: '💬 Stuttering Shot',  desc: '15 DMG (1×15 slurs)' },
    { key: 'babu',     label: '💋 Babu Shona',       desc: 'RTA → 25 DMG' },
    { key: 'ult',      label: '🌑 CHAATI (ULT)',      desc: '+69% DEF, +30% ATK' },
  ],
  aatharva: [
    { key: 'goon',     label: '🍆 Infertile Gooning', desc: '10 DMG, +20 DEF, Numbness' },
    { key: 'totla',    label: '👶 Totlapan',          desc: 'RTA → 35 DMG +10 DEF' },
    { key: 'gay',      label: '🌈 Gayness',           desc: '+20 HP, +10 DEF (heal)' },
    { key: 'ult',      label: '🍼 GOON GOON GAGA (ULT)', desc: 'Numbness+60%, ATK+30%, DEF+20%' },
  ],
  aaditya: [
    { key: 'sad',      label: '😢 Emotional Sadmapan', desc: 'Introvert buff: 10 DMG/tick ×4' },
    { key: 'load',     label: '⏳ Loaded Dih',         desc: 'Skip → next: 60% DMG, 2nd Nut' },
    { key: 'sf90',     label: '🏎️ SF90',               desc: 'Ferrari assembly → 60% DMG + full HP' },
    { key: 'ult',      label: '🎸 ULTIMATE GITUAR (ULT)', desc: '+40% ATK, +20% DEF, buffs ×2' },
  ],
  dweeb: [
    { key: 'sharma',   label: '🫣 Sharmana',     desc: 'Hide & surprise, RTA 1-click' },
    { key: 'fatjump',  label: '🏋️ Fat Jump',     desc: '30% DMG, fake once/5 turns (E)' },
    { key: 'yum',      label: '🍜 Yum',          desc: '59s eating → full HP heal (1/5 turns)' },
    { key: 'ult',      label: '💪 ALL MIGHT (ULT)', desc: 'Stats ×2, debuffs ÷2' },
  ],
}

// ─────────────────────────────────────────────
// MINIGAME COMPONENTS
// ─────────────────────────────────────────────

/** Generic RTA button — click in the green window */
function RTAGame({ label, onResult }: { label: string; onResult: (success: boolean) => void }) {
  const [phase, setPhase] = useState<'wait'|'now'|'done'>('wait')
  const [result, setResult] = useState<boolean|null>(null)
  const waitRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const windowRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const delay = 1000 + Math.random() * 2000
    waitRef.current = setTimeout(() => {
      setPhase('now')
      windowRef.current = setTimeout(() => {
        setPhase('done'); setResult(false); onResult(false)
      }, 800)
    }, delay)
    return () => { clearTimeout(waitRef.current ?? undefined); clearTimeout(windowRef.current ?? undefined) }
  }, [])

  const handleClick = () => {
    if (phase !== 'now') { clearTimeout(waitRef.current ?? undefined); setPhase('done'); setResult(false); onResult(false); return }
    clearTimeout(windowRef.current ?? undefined); setPhase('done'); setResult(true); onResult(true)
  }

  return (
    <div className="mg-rta">
      <p className="mg-label">{label}</p>
      <motion.button
        className={`mg-rta-btn ${
          phase === 'wait' ? 'mg-rta-wait' :
          phase === 'now'  ? 'mg-rta-now'  : result ? 'mg-rta-hit' : 'mg-rta-miss'
        }`}
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
        disabled={phase === 'done'}
      >
        {phase === 'wait' ? 'WAIT...' : phase === 'now' ? '⚡ CLICK NOW!' : result ? '✅ HIT!' : '❌ MISS!'}
      </motion.button>
      {phase === 'done' && <p className="mg-result">{result ? 'Perfect timing! 💥' : 'Too slow! Turn wasted.'}</p>}
    </div>
  )
}

/** SF90 Ferrari assembly — cross layout */
function SF90Game({ onResult }: { onResult: (success: boolean) => void }) {
  const PARTS = ['body','frontwing','spoiler','wheels'] as const
  type Part = typeof PARTS[number]
  const [placed, setPlaced] = useState<Set<Part>>(new Set())
  const [timeLeft, setTimeLeft] = useState(60)
  const [done, setDone] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); if (!done) { setDone(true); setSuccess(false); onResult(false) } return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [done])

  const place = (part: Part) => {
    if (done || placed.has(part)) return
    const next = new Set(placed)
    next.add(part)
    setPlaced(next)
  }

  const allPlaced = PARTS.every(p => placed.has(p))

  const confirm = () => {
    if (!allPlaced || done) return
    setDone(true); setSuccess(true); onResult(true)
  }

  return (
    <div className="mg-sf90">
      <div className="sf90-timer" style={{ color: timeLeft < 15 ? '#ff2d9b' : '#ffd700' }}>
        ⏱ {timeLeft}s
      </div>
      <p className="mg-label">🏎️ Assemble the Ferrari SF90!</p>
      <div className="sf90-cross">
        {/* TOP — body */}
        <div className="sf90-slot sf90-top">
          <button className={`sf90-part-btn ${placed.has('body') ? 'sf90-placed' : ''}`}
            onClick={() => place('body')} disabled={placed.has('body') || done}>
            {placed.has('body') ? '✅' : '🚗'} Body
          </button>
        </div>
        {/* MIDDLE ROW */}
        <div className="sf90-middle-row">
          <div className="sf90-slot sf90-left">
            <button className={`sf90-part-btn ${placed.has('frontwing') ? 'sf90-placed' : ''}`}
              onClick={() => place('frontwing')} disabled={placed.has('frontwing') || done}>
              {placed.has('frontwing') ? '✅' : '🔩'} Front Wing
            </button>
          </div>
          <div className="sf90-centre">
            {allPlaced && !done
              ? <motion.button className="sf90-confirm" onClick={confirm}
                  animate={{ scale: [1,1.08,1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                  🔥 CONFIRM!
                </motion.button>
              : <div className="sf90-car-icon">{placed.size}/4</div>
            }
          </div>
          <div className="sf90-slot sf90-right">
            <button className={`sf90-part-btn ${placed.has('spoiler') ? 'sf90-placed' : ''}`}
              onClick={() => place('spoiler')} disabled={placed.has('spoiler') || done}>
              {placed.has('spoiler') ? '✅' : '💨'} Spoiler
            </button>
          </div>
        </div>
        {/* BOTTOM — wheels */}
        <div className="sf90-slot sf90-bottom">
          <button className={`sf90-part-btn ${placed.has('wheels') ? 'sf90-placed' : ''}`}
            onClick={() => place('wheels')} disabled={placed.has('wheels') || done}>
            {placed.has('wheels') ? '✅' : '🛞'} Wheels
          </button>
        </div>
      </div>
      {done && (
        <motion.div className={`sf90-result ${success ? 'sf90-win' : 'sf90-lose'}`}
          initial={{ scale: 0 }} animate={{ scale: 1 }}>
          {success ? '🏎️ A TRUE MERCEDES FAN!' : '😢 Carlos Sainz 2023 Las Vegas...'}
        </motion.div>
      )}
    </div>
  )
}

/** Guitar Gooning — rapid alternating L/R clicks for 60s */
function GuitarGoonGame({ onResult }: { onResult: (success: boolean) => void }) {
  const [side, setSide] = useState<'L'|'R'>('L')
  const [hits, setHits] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [done, setDone] = useState(false)
  const [missed, setMissed] = useState(false)
  const TARGET = 40 // hits needed to win

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); setDone(true); onResult(false); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [done])

  const hit = (clickSide: 'L'|'R') => {
    if (done) return
    if (clickSide !== side) { setMissed(true); setTimeout(() => setMissed(false), 300); return }
    const next = hits + 1
    setHits(next)
    setSide(s => s === 'L' ? 'R' : 'L')
    if (next >= TARGET) { setDone(true); onResult(true) }
  }

  return (
    <div className="mg-guitar">
      <p className="mg-label">🎸 GUITAR GOONING — alternate L & R! ({TARGET} hits to win)</p>
      <div className="guitar-stats">
        <span style={{ color: '#ffd700' }}>⏱ {timeLeft}s</span>
        <span style={{ color: '#ff2d9b' }}>Hits: {hits}/{TARGET}</span>
      </div>
      {done
        ? <div className="mg-result">{hits >= TARGET ? '🎸 INSTANT KNOCKOUT!' : '💀 YOU WERE ELIMINATED!'}</div>
        : <div className="guitar-btns">
            <motion.button
              className={`guitar-btn ${side==='L'?'guitar-active':''} ${missed?'guitar-miss':''}`}
              onClick={() => hit('L')} whileTap={{ scale: 0.9 }}>
              ← L
            </motion.button>
            <motion.button
              className={`guitar-btn ${side==='R'?'guitar-active':''} ${missed?'guitar-miss':''}`}
              onClick={() => hit('R')} whileTap={{ scale: 0.9 }}>
              R →
            </motion.button>
          </div>
      }
    </div>
  )
}

/** Sharmana — 1 click RTA */
function SharmanaGame({ onResult }: { onResult: (success: boolean) => void }) {
  return <RTAGame label="🫣 Sharmana — click when the shadow appears!" onResult={onResult} />
}

/** Yum — 59s eating wait */
function YumGame({ onResult }: { onResult: () => void }) {
  const [timeLeft, setTimeLeft] = useState(59)
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); onResult(); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="mg-yum">
      <div className="yum-emoji">🍜</div>
      <p className="mg-label">Dweeb is eating ramen... please wait.</p>
      <div className="yum-timer">{timeLeft}s</div>
      <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>your opponent is just standing there</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// BATTLE LOG
// ─────────────────────────────────────────────
function BattleLog({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight) }, [lines])
  return (
    <div className="battle-log" ref={ref}>
      {lines.map((l, i) => <div key={i} className="log-line">{l}</div>)}
    </div>
  )
}

// ─────────────────────────────────────────────
// HP BAR
// ─────────────────────────────────────────────
function HpBar({ fighter, isPlayer }: { fighter: Fighter; isPlayer: boolean }) {
  const pct = Math.max(0, (fighter.hp / fighter.maxHp) * 100)
  const col = pct > 50 ? '#39ff14' : pct > 25 ? '#ffd700' : '#ff2d9b'
  return (
    <div className={`hpbar-wrap ${isPlayer ? 'hpbar-player' : 'hpbar-enemy'}`}
      style={{ '--cc': fighter.color } as any}>
      <div className="hpbar-header">
        <span className="hpbar-emoji">{fighter.emoji}</span>
        <span className="hpbar-name" style={{ color: fighter.color, textShadow: `0 0 10px ${fighter.color}` }}>
          {fighter.name}
        </span>
        <span className="hpbar-hp">{Math.max(0,fighter.hp)}/{fighter.maxHp}</span>
      </div>
      <div className="hpbar-bg">
        <motion.div className="hpbar-fill"
          style={{ background: col, boxShadow: `0 0 8px ${col}` }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
      </div>
      <div className="hpbar-stats">
        <span>DEF: {Math.round(fighter.def)}%</span>
        <span>ATK: ×{fighter.atkMult.toFixed(1)}</span>
        {fighter.numbnessActive && <span className="buff-tag">NUMB {fighter.numbnessStrength}%</span>}
        {fighter.introvertTicks > 0 && <span className="debuff-tag">INTRO ×{fighter.introvertTicks}</span>}
        {fighter.loadedDih && <span className="buff-tag">LOADED 💥</span>}
        {fighter.allMightActive && <span className="buff-tag">ALL MIGHT 💪</span>}
        {fighter.ultReady && <span className="ult-tag">ULT READY ⚡</span>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN BATTLE COMPONENT
// ─────────────────────────────────────────────
export default function Battle({ onExit }: { onExit: () => void }) {
  const ALL: CharId[] = ['aaditya','aatharva','dhariya','dweeb']

  const [phase, setPhase] = useState<Phase>('select')
  const [playerChar, setPlayerChar] = useState<CharId|null>(null)
  const [player, setPlayer] = useState<Fighter|null>(null)
  const [enemy, setEnemy] = useState<Fighter|null>(null)
  const [enemies, setEnemies] = useState<Fighter[]>([])   // queue
  const [enemyIdx, setEnemyIdx] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const [minigame, setMinigame] = useState<MinigameType>(null)
  const [playerTurn, setPlayerTurn] = useState(true)
  const [winner, setWinner] = useState<'player'|'enemy'|null>(null)
  const [pendingSkill, setPendingSkill] = useState<string|null>(null)
  const [fatJumpPending, setFatJumpPending] = useState(false)
  const [introTickInterval, setIntroTickInterval] = useState<ReturnType<typeof setInterval>|null>(null)

  const addLog = (msg: string) => setLog(l => [...l, msg])

  // ── helpers ──
  const dealDamage = useCallback((target: Fighter, rawDmg: number, setTarget: (f:Fighter)=>void, label='') => {
    let dmg = rawDmg
    // numbness on target reduces incoming
    if (target.numbnessActive) dmg = Math.round(dmg * (1 - target.numbnessStrength/100))
    // all might: debuffs doubled if active
    const actual = applyDef(dmg, target.def)
    const newHp = clamp(target.hp - actual)
    setTarget({ ...target, hp: newHp })
    addLog(`💥 ${label || ''} ${actual} damage dealt! (${target.name}: ${target.hp}→${newHp} HP)`)
    return newHp
  }, [])

  const healTarget = (target: Fighter, amount: number, setTarget:(f:Fighter)=>void, label='') => {
    const newHp = clamp(target.hp + amount, 0, target.maxHp)
    setTarget({ ...target, hp: newHp })
    addLog(`💚 ${label} +${amount} HP (${target.name}: ${target.hp}→${newHp} HP)`)
  }

  // Check win/loss
  const checkEnd = useCallback((p: Fighter, e: Fighter) => {
    if (e.hp <= 0) {
      if (enemyIdx + 1 >= enemies.length) {
        setWinner('player'); setPhase('gameover')
      } else {
        const nextIdx = enemyIdx + 1
        setEnemyIdx(nextIdx)
        setEnemy({ ...enemies[nextIdx] })
        addLog(`🔥 ${e.name} defeated! Next: ${enemies[nextIdx].name}!`)
      }
    }
    if (p.hp <= 0) { setWinner('enemy'); setPhase('gameover') }
  }, [enemies, enemyIdx])

  // ── Start battle ──
  const startBattle = (charId: CharId) => {
    setPlayerChar(charId)
    const others = ALL.filter(c => c !== charId)
    const shuffled = [...others].sort(() => Math.random()-0.5)
    const queue = shuffled.map(makeFighter)
    setEnemies(queue)
    setPlayer(makeFighter(charId))
    setEnemy({ ...queue[0] })
    setEnemyIdx(0)
    setLog([`⚔️ Battle start! ${CHAR_DEFS[charId].name} vs ${queue.map(q=>q.name).join(', ')}!`])
    setPhase('fight')
    setPlayerTurn(true)
  }

  // ── Tick introverted damage ──
  useEffect(() => {
    if (!player || !enemy || player.introvertTicks <= 0) return
    const t = setInterval(() => {
      setEnemy(e => {
        if (!e) return e!
        const newHp = clamp(e.hp - 10)
        addLog(`😢 Introvert lingering: 10 dmg to ${e.name}! (${e.hp}→${newHp})`)
        return { ...e, hp: newHp }
      })
      setPlayer(p => {
        if (!p) return p!
        const ticks = p.introvertTicks - 1
        return { ...p, introvertTicks: ticks }
      })
    }, 5000)
    return () => clearInterval(t)
  }, [player?.introvertTicks])

  // ── Enemy AI turn ──
  const enemyTurn = useCallback((p: Fighter, e: Fighter) => {
    if (!p || !e) return
    setTimeout(() => {
      const skills = SKILLS[e.id].filter(s => s.key !== 'ult')
      const pick = skills[Math.floor(Math.random()*skills.length)]
      let dmg = 0
      let newP = { ...p }
      let newE = { ...e }

      // simple AI — just deal damage based on skill
      switch(e.id) {
        case 'dhariya':
          if (pick.key==='stalker') { newE.atkMult+=0.1; newE.def=clamp(newE.def+15); addLog(`👁️ ${e.name} used Stalker Eyes! ATK+10%, DEF+15%`) }
          else if (pick.key==='slur') { dmg=15; addLog(`💬 ${e.name} used Stuttering Shot! 15 DMG`) }
          else { dmg=25; addLog(`💋 ${e.name} used Babu Shona! 25 DMG`) }
          break
        case 'aatharva':
          if (pick.key==='goon') { dmg=10; newE.def=clamp(newE.def+20); newE.numbnessActive=true; newE.numbnessStrength=clamp(newE.numbnessStrength+20); addLog(`🍆 ${e.name} used Infertile Gooning! 10 DMG, DEF+20, Numbness!`) }
          else if (pick.key==='totla') { dmg=35; newE.def=clamp(newE.def+10); addLog(`👶 ${e.name} used Totlapan! 35 DMG`) }
          else { newE.hp=clamp(newE.hp+20,0,newE.maxHp); newE.def=clamp(newE.def+10); addLog(`🌈 ${e.name} used Gayness! Healed 20 HP`) }
          break
        case 'aaditya':
          if (pick.key==='sad') { newE.introvertTicks=4; addLog(`😢 ${e.name} used Emotional Sadmapan! Introvert ×4 ticks`) }
          else if (pick.key==='load') { addLog(`⏳ ${e.name} is loading...`); newE.loadedDih=true }
          else { dmg=30; addLog(`🏎️ ${e.name} used SF90! 30 DMG`) }
          break
        case 'dweeb':
          if (pick.key==='sharma') { dmg=20; addLog(`🫣 ${e.name} used Sharmana! 20 DMG`) }
          else if (pick.key==='fatjump') { dmg=30; addLog(`🏋️ ${e.name} used Fat Jump! 30 DMG`) }
          else { newE.hp=clamp(newE.hp+100,0,newE.maxHp); addLog(`🍜 ${e.name} used Yum! Full HP restored`) }
          break
      }

      if (dmg > 0) {
        const base = Math.round(dmg * newE.atkMult)
        const actual = applyDef(base, newP.def)
        newP.hp = clamp(newP.hp - actual)
        addLog(`💥 ${actual} damage to ${p.name}!`)
      }

      setPlayer(newP)
      setEnemy(newE)
      checkEnd(newP, newE)
      setPlayerTurn(true)
    }, 1200)
  }, [checkEnd])

  // ── Player skill handler ──
  const useSkill = (skillKey: string) => {
    if (!playerTurn || !player || !enemy || minigame) return
    const p = { ...player }
    const e = { ...enemy }

    // Check ult
    if (skillKey === 'ult') {
      if (!p.ultReady) { addLog('⚡ Ultimate not ready yet!'); return }
      p.ultReady = false
    }

    // Check secret ultimate condition
    const isSecretUlt = (skillKey === 'ult') &&
      ((p.id==='aaditya' && e.id==='aatharva') || (p.id==='aatharva' && e.id==='aaditya'))

    if (isSecretUlt) {
      addLog(`🎸 SECRET ULTIMATE UNLOCKED — GUITAR GOONING!`)
      setMinigame('guitar_goon')
      setPendingSkill('guitar_goon')
      return
    }

    // Tick up turn counter
    p.turnCount += 1
    if (p.turnCount % 5 === 0) p.ultReady = true

    let skipEnemyTurn = false
    let newP = { ...p }
    let newE = { ...e }

    // ── DHARIYA ──
    if (p.id === 'dhariya') {
      if (skillKey==='stalker') {
        newP.atkMult = +(newP.atkMult + 0.1).toFixed(2)
        newP.def = clamp(newP.def + 15)
        addLog(`👁️ Stalker Eyes! Realised he's been stalking Yoshi Yoshi. ATK+10%, DEF+15%`)
      } else if (skillKey==='slur') {
        const dmg = Math.round(15 * newP.atkMult)
        const actual = applyDef(dmg, newE.def)
        newE.hp = clamp(newE.hp - actual)
        addLog(`💬 Stuttering Shot! 15 slurs fired! ${actual} DMG to ${e.name}!`)
      } else if (skillKey==='babu') {
        setMinigame('rta_babu'); setPendingSkill('babu'); return
      } else if (skillKey==='ult') {
        newP.def = clamp(newP.def + 69)
        newP.atkMult = +(newP.atkMult * 1.3).toFixed(2)
        addLog(`🌑 CHAATI! Gaurav appears! DEF+69%, ATK+30%!`)
      }
    }

    // ── AATHARVA ──
    if (p.id === 'aatharva') {
      if (skillKey==='goon') {
        const dmg = Math.round(10 * newP.atkMult)
        const actual = applyDef(dmg, newE.def)
        newE.hp = clamp(newE.hp - actual)
        newP.def = clamp(newP.def + 20)
        newP.numbnessActive = true
        newP.numbnessStrength = clamp(newP.numbnessStrength + 20)
        addLog(`🍆 Infertile Gooning! Gooned twice, dih hurts. ${actual} DMG, +20 DEF, Numbness active!`)
      } else if (skillKey==='totla') {
        setMinigame('rta_totlapan'); setPendingSkill('totla'); return
      } else if (skillKey==='gay') {
        newP.hp = clamp(newP.hp + 20, 0, newP.maxHp)
        newP.def = clamp(newP.def + 10)
        addLog(`🌈 Gayness! No damage — healed 20 HP, +10 DEF!`)
      } else if (skillKey==='ult') {
        newP.numbnessStrength = clamp(newP.numbnessStrength + 60)
        newP.atkMult = +(newP.atkMult * 1.3).toFixed(2)
        newP.def = clamp(newP.def + 20)
        addLog(`🍼 GOON GOON GAGA! Numbness+60%, ATK+30%, DEF+20%!`)
      }
    }

    // ── AADITYA ──
    if (p.id === 'aaditya') {
      if (skillKey==='sad') {
        newP.introvertTicks = 4
        addLog(`😢 Emotional Sadmapan! So lonely... Introvert buff: 10 DMG/tick for 4 ticks!`)
      } else if (skillKey==='load') {
        if (newP.loadedDih) {
          // Release the load
          const base = Math.round(newE.maxHp * 0.6)
          const actual = applyDef(base, newE.def)
          newE.hp = clamp(newE.hp - actual)
          const selfDmg = Math.round(base * 0.3)
          newP.hp = clamp(newP.hp - selfDmg)
          newP.loadedDih = false
          addLog(`💥 LOADED DIH RELEASED! ${actual} DMG to ${e.name}! 2nd Nut: ${selfDmg} self-damage!`)
        } else {
          newP.loadedDih = true
          addLog(`⏳ Loaded Dih — loading up... next turn will RELEASE!`)
          skipEnemyTurn = false // enemy still gets turn
        }
      } else if (skillKey==='sf90') {
        setMinigame('sf90'); setPendingSkill('sf90'); return
      } else if (skillKey==='ult') {
        newP.atkMult = +(newP.atkMult * 1.4).toFixed(2)
        newP.def = clamp(newP.def + 20)
        newP.buffs = newP.buffs.map(b => ({ ...b, value: b.value * 2 }))
        addLog(`🎸 ULTIMATE GITUAR! ATK+40%, DEF+20%, all buffs ×2!`)
      }
    }

    // ── DWEEB ──
    if (p.id === 'dweeb') {
      if (skillKey==='sharma') {
        setMinigame('sharmana'); setPendingSkill('sharma'); return
      } else if (skillKey==='fatjump') {
        const canFake = (p.turnCount - p.fatJumpUsed) >= 5
        if (canFake && fatJumpPending) {
          // Faked! Free turn
          newP.fatJumpUsed = newP.turnCount
          setFatJumpPending(false)
          addLog(`🏋️ Fat Jump FAKED! Free turn gained!`)
          setPlayer(newP); setEnemy(newE)
          setPlayerTurn(true); return
        }
        if (canFake) {
          setFatJumpPending(true)
          addLog(`🏋️ Fat Jump ready — press E to fake or click again to attack!`)
          setPlayer(newP); return
        }
        const dmg = Math.round(newE.maxHp * 0.3 * newP.atkMult)
        const actual = applyDef(dmg, newE.def)
        newE.hp = clamp(newE.hp - actual)
        addLog(`🏋️ Fat Jump! ${actual} DMG to ${e.name}!`)
      } else if (skillKey==='yum') {
        const canYum = (p.turnCount - p.yumUsed) >= 5
        if (!canYum) { addLog(`🍜 Yum on cooldown! (${5-(p.turnCount-p.yumUsed)} turns left)`); return }
        newP.yumUsed = newP.turnCount
        setMinigame('yum'); setPendingSkill('yum'); return
      } else if (skillKey==='ult') {
        newP.atkMult = +(newP.atkMult * 2).toFixed(2)
        newP.def = clamp(newP.def * 2)
        newP.allMightActive = true
        addLog(`💪 ALL MIGHT! Stats ×2! Debuffs ÷2! Incoming debuffs ×2 warning!`)
      }
    }

    setPlayer(newP)
    setEnemy(newE)
    checkEnd(newP, newE)
    if (newP.hp > 0 && newE.hp > 0) {
      setPlayerTurn(false)
      enemyTurn(newP, newE)
    }
  }

  // ── Minigame result handler ──
  const onMinigameResult = (success: boolean) => {
    setMinigame(null)
    if (!player || !enemy) return
    const p = { ...player }
    const e = { ...enemy }
    p.turnCount += 1
    if (p.turnCount % 5 === 0) p.ultReady = true

    if (pendingSkill === 'babu') {
      if (success) {
        const dmg = Math.round(25 * p.atkMult)
        const actual = applyDef(dmg, e.def)
        e.hp = clamp(e.hp - actual)
        addLog(`💋 Babu Shona HIT! ${actual} DMG to ${e.name}!`)
      } else {
        addLog(`💋 Babu Shona FAILED! Turn wasted.`)
      }
    } else if (pendingSkill === 'totla') {
      if (success) {
        const dmg = Math.round(35 * p.atkMult)
        const actual = applyDef(dmg, e.def)
        e.hp = clamp(e.hp - actual)
        p.def = clamp(p.def + 10)
        addLog(`👶 Totlapan HIT! "lu calnot tolk!" ${actual} DMG, +10 DEF!`)
      } else {
        addLog(`👶 Totlapan FAILED! Baby language too confusing. Turn wasted.`)
      }
    } else if (pendingSkill === 'sf90') {
      if (success) {
        const dmg = Math.round(e.maxHp * 0.6)
        const actual = applyDef(dmg, e.def)
        e.hp = clamp(e.hp - actual)
        p.hp = p.maxHp
        addLog(`🏎️ SF90 SUCCESS! 🏎️ A TRUE MERCEDES FAN! ${actual} DMG, full HP restored!`)
      } else {
        const selfDmg = Math.round(p.maxHp * 0.3)
        p.hp = clamp(p.hp - selfDmg)
        p.def = clamp(p.def - 40)
        addLog(`💥 SF90 FAILED! 😢 Carlos Sainz 2023 Las Vegas... Car blew up! ${selfDmg} self-DMG, DEF-40%!`)
      }
    } else if (pendingSkill === 'sharma') {
      if (success) {
        const dmg = Math.round(p.maxHp * 0.2 * p.atkMult)
        const actual = applyDef(dmg, e.def)
        e.hp = clamp(e.hp - actual)
        addLog(`🫣 Sharmana SUCCESS! Surprise attack! ${actual} DMG!`)
      } else {
        const selfDmg = Math.round(p.maxHp * 0.2)
        p.hp = clamp(p.hp - selfDmg)
        addLog(`🫣 Sharmana FAILED! ${selfDmg} self-damage!`)
      }
    } else if (pendingSkill === 'guitar_goon') {
      if (success) {
        e.hp = 0
        addLog(`🎸 GUITAR GOONING SUCCESS! INSTANT KNOCKOUT! ${e.name} is ELIMINATED!`)
      } else {
        p.hp = 0
        addLog(`🎸 GUITAR GOONING FAILED! You are ELIMINATED!`)
      }
    }

    setPendingSkill(null)
    setPlayer(p)
    setEnemy(e)
    checkEnd(p, e)
    if (p.hp > 0 && e.hp > 0) {
      setPlayerTurn(false)
      enemyTurn(p, e)
    }
  }

  const onYumResult = () => {
    if (!player) return
    const p = { ...player, hp: player.maxHp }
    setPlayer(p)
    setMinigame(null)
    addLog(`🍜 Yum complete! ${p.name} fully healed!`)
    setPlayerTurn(false)
    if (enemy) enemyTurn(p, enemy)
  }

  // ── Fat Jump E key ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && fatJumpPending && player) {
        const p = { ...player, fatJumpUsed: player.turnCount }
        setFatJumpPending(false)
        setPlayer(p)
        addLog(`🏋️ Fat Jump FAKED with E! Free turn!`)
        setPlayerTurn(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fatJumpPending, player])

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="battle-root">

      {/* ── CHARACTER SELECT ── */}
      {phase === 'select' && (
        <motion.div className="battle-select"
          initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}>
          <div className="battle-select-header">
            <div className="battle-diamond-row">◆ ◇ ◆ ◇ ◆</div>
            <h2 className="battle-title">CHOOSE YOUR STAND USER</h2>
            <p className="battle-sub">You will face 3 random opponents. Choose wisely.</p>
          </div>
          <div className="battle-char-grid">
            {ALL.map(id => (
              <motion.button key={id} className="battle-char-btn"
                style={{ '--bc': CHAR_DEFS[id].color } as any}
                onClick={() => startBattle(id)}
                whileHover={{ scale:1.05, y:-4 }} whileTap={{ scale:0.95 }}>
                <span className="bchar-emoji">{CHAR_DEFS[id].emoji}</span>
                <span className="bchar-name" style={{ color: CHAR_DEFS[id].color, textShadow:`0 0 12px ${CHAR_DEFS[id].color}` }}>
                  {CHAR_DEFS[id].name}
                </span>
                <span className="bchar-title">{CHAR_DEFS[id].title}</span>
                <span className="bchar-bio">{CHAR_DEFS[id].bio}</span>
                <div className="bchar-skills">
                  {SKILLS[id].map(s=><span key={s.key} className="bchar-skill-tag">{s.label}</span>)}
                </div>
              </motion.button>
            ))}
          </div>
          <button className="battle-exit-btn" onClick={onExit}>✕ Exit</button>
        </motion.div>
      )}

      {/* ── FIGHT ── */}
      {phase === 'fight' && player && enemy && (
        <div className="battle-fight">
          {/* HP bars */}
          <div className="battle-hpbars">
            <HpBar fighter={player} isPlayer={true} />
            <div className="battle-vs">⚔️</div>
            <HpBar fighter={enemy} isPlayer={false} />
          </div>

          {/* Enemy queue */}
          <div className="battle-queue">
            {enemies.map((e,i) => (
              <span key={e.id} className={`queue-chip ${i===enemyIdx?'queue-active':i<enemyIdx?'queue-dead':''}`}
                style={{ '--qc': e.color } as any}>
                {e.emoji} {e.name} {i<enemyIdx?'💀':''}
              </span>
            ))}
          </div>

          {/* Minigame overlay */}
          <AnimatePresence>
            {minigame && (
              <motion.div className="minigame-overlay"
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
                {minigame==='rta_babu'    && <RTAGame label="💋 Babu Shona — click when the heart appears!" onResult={onMinigameResult} />}
                {minigame==='rta_totlapan'&& <RTAGame label='👶 Totlapan — "lu calnot tolk!" click on time!' onResult={onMinigameResult} />}
                {minigame==='sf90'        && <SF90Game onResult={onMinigameResult} />}
                {minigame==='guitar_goon' && <GuitarGoonGame onResult={onMinigameResult} />}
                {minigame==='sharmana'    && <SharmanaGame onResult={onMinigameResult} />}
                {minigame==='yum'         && <YumGame onResult={onYumResult} />}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skill buttons */}
          {playerTurn && !minigame && (
            <div className="battle-skills">
              <div className="skills-label">YOUR TURN — Choose a move:</div>
              <div className="skills-grid">
                {SKILLS[player.id].map(s => {
                  const isUlt = s.key==='ult'
                  const disabled = isUlt && !player.ultReady
                  return (
                    <motion.button key={s.key}
                      className={`skill-btn ${isUlt?'skill-ult':''} ${disabled?'skill-disabled':''}`}
                      style={{ '--sc': player.color } as any}
                      onClick={() => useSkill(s.key)}
                      disabled={disabled}
                      whileHover={!disabled?{ scale:1.04 }:{}}
                      whileTap={!disabled?{ scale:0.96 }:{}}>
                      <span className="skill-btn-label">{s.label}</span>
                      <span className="skill-btn-desc">{s.desc}</span>
                      {isUlt && !player.ultReady && (
                        <span className="skill-ult-charge">
                          {5-(player.turnCount%5)} turns
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
              {fatJumpPending && (
                <div className="fatjump-hint">Press <kbd>E</kbd> to FAKE the jump!</div>
              )}
            </div>
          )}

          {!playerTurn && !minigame && (
            <div className="enemy-thinking">
              <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ repeat:Infinity, duration:1 }}>
                ⚔️ {enemy.name} is thinking...
              </motion.div>
            </div>
          )}

          <BattleLog lines={log} />
          <button className="battle-exit-btn" onClick={onExit}>✕ Forfeit</button>
        </div>
      )}

      {/* ── GAME OVER ── */}
      {phase === 'gameover' && (
        <motion.div className="battle-gameover"
          initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}>
          <div className="gameover-diamond">◆</div>
          <h2 className="gameover-title" style={{ color: winner==='player'?'#ffd700':'#ff2d9b' }}>
            {winner==='player' ? '🏆 STAND VICTORIOUS!' : '💀 YOU HAVE BEEN ELIMINATED'}
          </h2>
          <p className="gameover-sub">
            {winner==='player'
              ? 'Your Stand has proven itself. YARE YARE DAZE.'
              : 'The enemy Stand was stronger. Touch grass and try again.'}
          </p>
          <div className="gameover-btns">
            <button className="quiz-start-btn" onClick={() => {
              setPhase('select'); setPlayer(null); setEnemy(null)
              setEnemies([]); setLog([]); setWinner(null); setEnemyIdx(0)
              setFatJumpPending(false); setMinigame(null); setPendingSkill(null)
            }}>◆ Play Again</button>
            <button className="battle-exit-btn" onClick={onExit}>✕ Exit</button>
          </div>
        </motion.div>
      )}

    </div>
  )
}
