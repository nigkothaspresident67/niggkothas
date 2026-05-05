import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Fighter, BattleLog, BattlePhase, MiniGameType, CharId } from '../lib/battleTypes'
import { makeFighter, applyDamage, applyHeal, getAtkMult, tickLingeringDebuffs, CHAR_META, aiChooseSkill } from '../lib/battleEngine'

const ALL_CHARS: CharId[] = ['aaditya', 'aatharva', 'dhariya', 'dweeb']

function pct(v: number, m: number) { return Math.max(0, Math.min(100, (v / m) * 100)) }
function rnd(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a }

// ── HP Card ────────────────────────────────────────────────────────────────────
function HpCard({ fighter, side }: { fighter: Fighter; side: 'left' | 'right' }) {
  const p = pct(fighter.hp, fighter.maxHp)
  const barColor = p > 50 ? '#39ff14' : p > 25 ? '#ffd700' : '#ff2d9b'
  return (
    <div className={`bc ${side === 'right' ? 'bc-right' : ''}`} style={{ '--bc': fighter.color } as any}>
      <div className="bc-head">
        <span className="bc-emoji">{fighter.emoji}</span>
        <div className="bc-info">
          <div className="bc-name" style={{ color: fighter.color, textShadow: `0 0 12px ${fighter.color}` }}>{fighter.name}</div>
          <div className="bc-stand">{CHAR_META[fighter.id].stand}</div>
        </div>
        <div className="bc-hp-num">{Math.ceil(fighter.hp)}<span>/100</span></div>
      </div>
      <div className="bc-bar-bg">
        <motion.div className="bc-bar-fill" style={{ background: barColor, boxShadow: `0 0 8px ${barColor}` }}
          animate={{ width: `${p}%` }} transition={{ duration: 0.4 }} />
      </div>
      <div className="bc-stats-row">
        <span>🛡 {Math.round(fighter.def)}</span>
        {fighter.loadedDih && <span className="bc-tag" style={{ color: '#ff6b35' }}>⚡LOADED</span>}
        {fighter.numbnessActive && <span className="bc-tag" style={{ color: '#b44fff' }}>😶NUMB</span>}
        {fighter.ultimateActive && <span className="bc-tag" style={{ color: '#ffd700' }}>◆ULT</span>}
        {fighter.allMightActive && <span className="bc-tag" style={{ color: '#39ff14' }}>💪ALL MIGHT</span>}
      </div>
      <div className="bc-tags">
        {fighter.buffs.map(b => <span key={b.id} className="bc-buff">{b.icon} {b.label}</span>)}
        {fighter.debuffs.map(b => <span key={b.id} className="bc-debuff">{b.icon} {b.label}</span>)}
      </div>
    </div>
  )
}

// ── RTA Mini-game ─────────────────────────────────────────────────────────────
function RTAGame({ title, windowMs, onDone }: { title: string; windowMs: number; onDone: (hit: boolean) => void }) {
  const [phase, setPhase] = useState<'wait' | 'now' | 'done'>('wait')
  const [hit, setHit] = useState<boolean | null>(null)
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const delay = rnd(1000, 2800)
    t.current = setTimeout(() => {
      setPhase('now')
      t.current = setTimeout(() => { setHit(false); setPhase('done'); setTimeout(() => onDone(false), 700) }, windowMs)
    }, delay)
    return () => clearTimeout(t.current)
  }, [])

  const press = () => {
    clearTimeout(t.current)
    if (phase !== 'now') { setHit(false); setPhase('done'); setTimeout(() => onDone(false), 700); return }
    setHit(true); setPhase('done'); setTimeout(() => onDone(true), 700)
  }

  return (
    <div className="mg-overlay">
      <div className="mg-box">
        <div className="mg-title">{title}</div>
        <p className="mg-sub">{phase === 'wait' ? '⏳ Get ready...' : phase === 'now' ? '⚡ NOW! PRESS!' : hit ? '✅ HIT!' : '❌ TOO SLOW!'}</p>
        <motion.button className={`rta-btn ${phase === 'now' ? 'rta-btn-go' : ''}`}
          animate={phase === 'now' ? { scale: [1, 1.15, 1], boxShadow: ['0 0 10px #ffd700', '0 0 50px #ffd700', '0 0 10px #ffd700'] } : {}}
          transition={{ repeat: Infinity, duration: 0.25 }}
          onClick={press} disabled={phase === 'done'}>
          {phase === 'wait' ? 'WAIT...' : phase === 'now' ? '⚡ PRESS!' : hit ? '🔥 NICE!' : '💀 MISSED!'}
        </motion.button>
      </div>
    </div>
  )
}

// ── SF90 Mini-game ────────────────────────────────────────────────────────────
const SF90_PARTS = ['🚗 Body', '🔧 Wheels', '💨 Spoiler', '⚡ Front Wing']
function SF90Game({ onDone }: { onDone: (ok: boolean) => void }) {
  const [remaining, setRemaining] = useState([...SF90_PARTS])
  const [attached, setAttached] = useState<string[]>([])
  const [t, setT] = useState(60)

  useEffect(() => {
    if (t <= 0) { onDone(false); return }
    const id = setInterval(() => setT(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [t])

  const attach = (p: string) => {
    const next = attached.concat(p)
    const rem = remaining.filter(x => x !== p)
    setAttached(next); setRemaining(rem)
    if (rem.length === 0) setTimeout(() => onDone(true), 400)
  }

  return (
    <div className="mg-overlay">
      <div className="mg-box">
        <div className="mg-title">🏎 SF90 ASSEMBLY</div>
        <div className="mg-timer" style={{ color: t < 15 ? '#ff2d9b' : '#ffd700' }}>{t}s</div>
        <p className="mg-sub">Attach all 4 Ferrari parts before time runs out!</p>
        <div className="sf90-grid">
          {remaining.map(p => (
            <motion.button key={p} className="sf90-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={() => attach(p)}>{p}</motion.button>
          ))}
        </div>
        <div className="sf90-done-row">
          {attached.map(p => <span key={p} className="sf90-done-item">✅ {p}</span>)}
        </div>
      </div>
    </div>
  )
}

// ── Gitaur Gooning ────────────────────────────────────────────────────────────
function GitaurGame({ onDone }: { onDone: (ok: boolean) => void }) {
  const [hits, setHits] = useState(0)
  const [side, setSide] = useState<'L' | 'R'>('L')
  const [t, setT] = useState(60)
  const [flash, setFlash] = useState(false)
  const TARGET = 30

  useEffect(() => {
    if (t <= 0) { onDone(hits >= TARGET); return }
    const id = setInterval(() => setT(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [t])

  useEffect(() => { if (hits >= TARGET) onDone(true) }, [hits])

  const hit = (s: 'L' | 'R') => {
    if (s !== side) return
    setHits(h => h + 1)
    setSide(prev => prev === 'L' ? 'R' : 'L')
    setFlash(true); setTimeout(() => setFlash(false), 120)
  }

  return (
    <div className="mg-overlay">
      <div className="mg-box">
        <div className="mg-title" style={{ color: '#ff2d9b' }}>🎸 GITAUR GOONING</div>
        <div className="mg-timer">{t}s</div>
        <p className="mg-sub">Hit {TARGET} alternating chords! Now: <strong style={{ color: '#ffd700' }}>{side}</strong></p>
        <div className="gitaur-prog-bg">
          <motion.div className="gitaur-prog-fill" animate={{ width: `${(hits / TARGET) * 100}%` }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>{hits}/{TARGET}</p>
        <div className="gitaur-btns">
          <motion.button className={`gitaur-btn ${side === 'L' ? 'gitaur-active' : ''}`} whileTap={{ scale: 0.88 }} onClick={() => hit('L')}>← L</motion.button>
          <motion.button className={`gitaur-btn ${side === 'R' ? 'gitaur-active' : ''}`} whileTap={{ scale: 0.88 }} onClick={() => hit('R')}>R →</motion.button>
        </div>
        {flash && <div className="gitaur-flash">ORA!</div>}
      </div>
    </div>
  )
}

// ── Yum Game ──────────────────────────────────────────────────────────────────
function YumGame({ onDone }: { onDone: () => void }) {
  const [t, setT] = useState(59)
  useEffect(() => {
    if (t <= 0) { onDone(); return }
    const id = setInterval(() => setT(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [t])
  return (
    <div className="mg-overlay">
      <div className="mg-box">
        <div className="mg-title">🍜 YUM</div>
        <motion.div style={{ fontSize: '4rem', textAlign: 'center' }}
          animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>🍜</motion.div>
        <div className="mg-timer">{t}s</div>
        <p className="mg-sub">Dweeb is eating ramen...<br />Please wait patiently 😤</p>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>*slurping intensifies*</p>
      </div>
    </div>
  )
}

// ── Skill Button ──────────────────────────────────────────────────────────────
function SkillBtn({ label, desc, color, tag, disabled, onClick }: {
  label: string; desc: string; color: string; tag?: string; disabled: boolean; onClick: () => void
}) {
  return (
    <motion.button className="skill-btn" style={{ '--sk': color } as any}
      onClick={onClick} disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
      whileTap={{ scale: 0.96 }}>
      <div className="skill-label">{label}</div>
      <div className="skill-desc">{desc}</div>
      {tag && <div className="skill-tag">{tag}</div>}
    </motion.button>
  )
}

// ── Character Select ──────────────────────────────────────────────────────────
function CharSelect({ title, exclude, onPick, onBack }: {
  title: string; exclude?: CharId; onPick: (id: CharId) => void; onBack: () => void
}) {
  const opts = ALL_CHARS.filter(c => c !== exclude)
  return (
    <div className="battle-select">
      <div className="bsel-bg" />
      <motion.div className="bsel-box" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bsel-diamonds">◆ ◇ ◆ ◇ ◆</div>
        <div className="bsel-title">{title}</div>
        <div className="bsel-grid">
          {opts.map(id => (
            <motion.button key={id} className="bsel-card" style={{ '--bc': CHAR_META[id].color } as any}
              onClick={() => onPick(id)}
              whileHover={{ scale: 1.06, y: -4 }} whileTap={{ scale: 0.96 }}>
              <div className="bsel-emoji">{CHAR_META[id].emoji}</div>
              <div className="bsel-name" style={{ color: CHAR_META[id].color, textShadow: `0 0 12px ${CHAR_META[id].color}` }}>
                {CHAR_META[id].name}
              </div>
              <div className="bsel-stand">◆ {CHAR_META[id].stand}</div>
            </motion.button>
          ))}
        </div>
        <button className="bsel-back" onClick={onBack}>← Back</button>
      </motion.div>
    </div>
  )
}

// ── Skill definitions ─────────────────────────────────────────────────────────
function getSkills(id: CharId, self: Fighter, opp: Fighter) {
  const isSecret = (id === 'aatharva' && opp.id === 'aaditya') || (id === 'aaditya' && opp.id === 'aatharva')
  const ultLabel = isSecret ? '🎸 GITAUR GOONING' : {
    dhariya: '👥 CHAATI', aatharva: '🍼 GOON GOON GAGA', aaditya: '🎸 ULTIMATE GITUAR', dweeb: '💪 ALL MIGHT'
  }[id]
  const ultDesc = isSecret ? 'SECRET ULT — Instant KO or be eliminated' : {
    dhariya: 'Summon Gaurav! DEF +69, ATK +30%',
    aatharva: 'Numbness +60%, ATK +30%, DEF +20%',
    aaditya: 'ATK +40%, DEF +20%, all buffs ×2',
    dweeb: 'Stats ×2, debuffs ÷2 (may heal)',
  }[id]

  const base: Record<CharId, { label: string; desc: string; color: string; tag?: string }[]> = {
    dhariya: [
      { label: '👁 Stalker Eyes', desc: 'ATK +10%, DEF +15%', color: '#00d4ff' },
      { label: '💬 Stuttering Shot', desc: '15 DMG (1 per slur × 15)', color: '#00d4ff' },
      { label: '💋 Babu Shona', desc: 'RTA → 25 DMG if timed right', color: '#ff2d9b' },
      { label: ultLabel!, desc: ultDesc!, color: '#ffd700', tag: isSecret ? '🔓 SECRET ULT' : 'ULTIMATE' },
    ],
    aatharva: [
      { label: '🍼 Infertile Gooning', desc: '10 DMG + Numbness buff (-20% inc.)', color: '#b44fff' },
      { label: '🗣 Totlapan', desc: 'RTA → 35 DMG + DEF +10', color: '#b44fff' },
      { label: '🏳️‍🌈 Gayness', desc: 'Heal +20 HP + DEF +10 (no damage)', color: '#ff2d9b' },
      { label: ultLabel!, desc: ultDesc!, color: '#ffd700', tag: isSecret ? '🔓 SECRET ULT' : 'ULTIMATE' },
    ],
    aaditya: [
      { label: '🥀 Emotional Sadmapan', desc: 'Lingering 10 DMG/5s × 4 ticks', color: '#ff2d9b' },
      { label: self.loadedDih ? '💥 RELEASE THE LOAD' : '⚡ Loaded Dih (Charge)', desc: self.loadedDih ? '60 DMG + 2nd Nut debuff (30% self)' : 'Skip turn → next turn: 60 DMG', color: '#ff6b35' },
      { label: '🏎 SF90', desc: '60s assembly: win=60 DMG+full HP, fail=30 self DMG', color: '#ff2d9b' },
      { label: ultLabel!, desc: ultDesc!, color: '#ffd700', tag: isSecret ? '🔓 SECRET ULT' : 'ULTIMATE' },
    ],
    dweeb: [
      { label: '🫥 Sharmana', desc: 'RTA → 20 DMG surprise attack', color: '#39ff14' },
      { label: '🦘 Fat Jump', desc: '30 DMG (press E to fake, 1/5 turns)', color: '#39ff14' },
      { label: '🍜 Yum', desc: '59s eating → Full HP heal (1/5 turns)', color: '#39ff14' },
      { label: ultLabel!, desc: ultDesc!, color: '#ffd700', tag: 'ULTIMATE' },
    ],
  }
  return base[id]
}

// ── Main Battle ───────────────────────────────────────────────────────────────
export default function Battle({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<BattlePhase>('select_player')
  const [playerChar, setPlayerChar] = useState<CharId | null>(null)
  const [player, setPlayer] = useState<Fighter | null>(null)
  const [opponent, setOpponent] = useState<Fighter | null>(null)
  const [turn, setTurn] = useState(0)
  const [turnNum, setTurnNum] = useState(1)
  const [logs, setLogs] = useState<BattleLog[]>([])
  const [logId, setLogId] = useState(0)
  const [miniGame, setMiniGame] = useState<MiniGameType>('none')
  const [miniGameCb, setMiniGameCb] = useState<((r: any) => void) | null>(null)
  const [sfResult, setSfResult] = useState<'success' | 'fail' | null>(null)
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState<'player' | 'opp' | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  const addLog = useCallback((text: string, type: BattleLog['type'] = 'system') => {
    idRef.current += 1
    const id = idRef.current
    setLogs(l => [...l.slice(-40), { id, text, type }])
  }, [])

  useEffect(() => { logRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }) }, [logs])

  // Lingering tick every 5s
  useEffect(() => {
    if (phase !== 'battle') return
    const id = setInterval(() => {
      setPlayer(p => {
        if (!p) return p
        const c = JSON.parse(JSON.stringify(p)) as Fighter
        const { logs: ls } = tickLingeringDebuffs(c)
        ls.forEach(l => addLog(l, 'debuff'))
        if (c.hp <= 0) setTimeout(() => setPhase('defeat'), 300)
        return c
      })
      setOpponent(o => {
        if (!o) return o
        const c = JSON.parse(JSON.stringify(o)) as Fighter
        const { logs: ls } = tickLingeringDebuffs(c)
        ls.forEach(l => addLog(l, 'debuff'))
        if (c.hp <= 0) setTimeout(() => setPhase('victory'), 300)
        return c
      })
    }, 5000)
    return () => clearInterval(id)
  }, [phase])

  // AI turn
  useEffect(() => {
    if (phase !== 'battle' || turn !== 1 || busy) return
    setBusy(true)
    setTimeout(() => {
      setOpponent(opp => {
        setPlayer(pl => {
          if (!opp || !pl) return pl
          const skillIdx = aiChooseSkill(opp, pl, turnNum)
          addLog(`🤖 ${opp.name} uses ${getSkills(opp.id, opp, pl)[skillIdx]?.label || 'a move'}!`, 'system')
          doSkill(skillIdx, false, opp, pl)
          return pl
        })
        return opp
      })
      setBusy(false)
    }, 1200)
  }, [turn, phase])

  function startBattle(pId: CharId, oId: CharId) {
    const p = makeFighter(pId)
    const o = makeFighter(oId)
    setPlayer(p); setOpponent(o)
    setPhase('battle'); setTurn(0); setTurnNum(1)
    setLogs([])
    addLog(`⚔️ ${p.name} vs ${o.name} — FIGHT!`, 'system')
  }

  function endTurn() {
    setTurn(t => 1 - t)
    setTurnNum(n => n + 1)
    setBusy(false)
  }

  // Core skill execution
  function doSkill(skillIdx: number, isPlayer: boolean, atkFighter: Fighter, tgtFighter: Fighter) {
    const setAtk = isPlayer ? setPlayer : setOpponent
    const setTgt = isPlayer ? setOpponent : setPlayer
    const atkMult = getAtkMult(atkFighter)

    const dealDmg = (raw: number) => {
      const clone = JSON.parse(JSON.stringify(tgtFighter)) as Fighter
      const actual = applyDamage(clone, raw * atkMult)
      setTgt(clone)
      setShake(isPlayer ? 'opp' : 'player')
      setTimeout(() => setShake(null), 400)
      if (clone.hp <= 0) setTimeout(() => setPhase(isPlayer ? 'victory' : 'defeat'), 500)
      return actual
    }

    const dealSelfDmg = (raw: number) => {
      const clone = JSON.parse(JSON.stringify(atkFighter)) as Fighter
      applyDamage(clone, raw)
      setAtk(clone)
      if (clone.hp <= 0) setTimeout(() => setPhase(isPlayer ? 'defeat' : 'victory'), 500)
    }

    const healSelf = (amt: number) => {
      setAtk(a => {
        if (!a) return a
        const c = JSON.parse(JSON.stringify(a)) as Fighter
        const got = applyHeal(c, amt)
        addLog(`💚 ${a.name} healed ${got} HP!`, 'heal')
        return c
      })
    }

    // DHARIYA
    if (atkFighter.id === 'dhariya') {
      if (skillIdx === 0) {
        setAtk(a => a ? { ...a, buffs: [...a.buffs, { id: 'stalker', label: 'Stalker Eyes', icon: '👁', atkMod: 0.1 }], def: a.def + 2 } : a)
        addLog(`👁 STALKER EYES — ATK +10%, DEF +15%!`, 'buff')
        endTurn()
      } else if (skillIdx === 1) {
        const d = dealDmg(15)
        addLog(`💬 STUTTERING SHOT — 15 slurs! ${d} DMG!`, 'atk')
        endTurn()
      } else if (skillIdx === 2) {
        if (isPlayer) {
          setMiniGame('rta_babu')
          setMiniGameCb(() => (hit: boolean) => {
            setMiniGame('none'); setMiniGameCb(null)
            if (hit) { const d = dealDmg(25); addLog(`💋 BABU SHONA hits! ${d} DMG!`, 'atk') }
            else addLog(`💔 BABU SHONA failed — rejected!`, 'system')
            endTurn()
          })
        } else {
          if (Math.random() > 0.5) { const d = dealDmg(25); addLog(`💋 AI BABU SHONA! ${d} DMG!`, 'atk') }
          else addLog(`💔 AI BABU SHONA failed.`, 'system')
          endTurn()
        }
      } else if (skillIdx === 3) {
        const isSecret = tgtFighter.id === 'aaditya' || tgtFighter.id === 'aatharva'
        if (isSecret && isPlayer) {
          setMiniGame('gitaur')
          setMiniGameCb(() => (ok: boolean) => {
            setMiniGame('none'); setMiniGameCb(null)
            if (ok) { setOpponent(o => o ? { ...o, hp: 0 } : o); addLog(`🎸 GITAUR GOONING — INSTANT KO!`, 'special'); setPhase('victory') }
            else { setPlayer(p => p ? { ...p, hp: 0 } : p); addLog(`🎸 GITAUR GOONING failed — eliminated!`, 'special'); setPhase('defeat') }
          })
        } else {
          setAtk(a => a ? { ...a, def: a.def + 69, ultimateActive: true, buffs: [...a.buffs, { id: 'chaati', label: 'CHAATI', icon: '👥', atkMod: 0.3 }] } : a)
          addLog(`👥 CHAATI ULTIMATE — Gaurav appears! DEF +69, ATK +30%!`, 'special')
          endTurn()
        }
      }
    }

    // AATHARVA
    else if (atkFighter.id === 'aatharva') {
      if (skillIdx === 0) {
        const d = dealDmg(10)
        setAtk(a => a ? { ...a, def: a.def + 20, numbnessActive: true, buffs: [...a.buffs, { id: 'numb', label: 'Numbness', icon: '😶', incomingDmgMod: -0.2 }] } : a)
        addLog(`🍼 INFERTILE GOONING — ${d} DMG! DEF +20, NUMBNESS!`, 'atk')
        endTurn()
      } else if (skillIdx === 1) {
        if (isPlayer) {
          setMiniGame('rta_totlapan')
          setMiniGameCb(() => (hit: boolean) => {
            setMiniGame('none'); setMiniGameCb(null)
            if (hit) {
              const d = dealDmg(35)
              setAtk(a => a ? { ...a, def: a.def + 10 } : a)
              addLog(`🗣 TOTLAPAN! "lu calnot tolk!" ${d} DMG + DEF +10!`, 'atk')
            } else addLog(`🗣 TOTLAPAN failed — gibberish unclear.`, 'system')
            endTurn()
          })
        } else {
          if (Math.random() > 0.45) { const d = dealDmg(35); addLog(`🗣 AI TOTLAPAN! ${d} DMG!`, 'atk') }
          else addLog(`🗣 AI TOTLAPAN failed.`, 'system')
          endTurn()
        }
      } else if (skillIdx === 2) {
        healSelf(20)
        setAtk(a => a ? { ...a, def: a.def + 10 } : a)
        addLog(`🏳️‍🌈 GAYNESS — no damage, +20 HP, +10 DEF!`, 'heal')
        endTurn()
      } else if (skillIdx === 3) {
        const isSecret = tgtFighter.id === 'aaditya'
        if (isSecret && isPlayer) {
          setMiniGame('gitaur')
          setMiniGameCb(() => (ok: boolean) => {
            setMiniGame('none'); setMiniGameCb(null)
            if (ok) { setOpponent(o => o ? { ...o, hp: 0 } : o); addLog(`🎸 GITAUR GOONING — INSTANT KO!`, 'special'); setPhase('victory') }
            else { setPlayer(p => p ? { ...p, hp: 0 } : p); addLog(`🎸 GITAUR GOONING failed!`, 'special'); setPhase('defeat') }
          })
        } else {
          setAtk(a => {
            if (!a) return a
            const nb = a.buffs.map(b => b.id === 'numb' ? { ...b, incomingDmgMod: (b.incomingDmgMod || 0) - 0.6 } : b)
            return { ...a, def: a.def * 1.2, ultimateActive: true, buffs: nb }
          })
          addLog(`🍼 GOON GOON GAGA! Numbness +60%, ATK +30%, DEF +20%!`, 'special')
          endTurn()
        }
      }
    }

    // AADITYA
    else if (atkFighter.id === 'aaditya') {
      if (skillIdx === 0) {
        setTgt(t => t ? { ...t, debuffs: [...t.debuffs, { id: 'sadmapan', label: 'Introvertedness', icon: '🥀', lingering: { dmg: 10, interval: 5, ticksLeft: 4 } }] } : t)
        addLog(`🥀 EMOTIONAL SADMAPAN — Introvertedness! 10 DMG/5s × 4 ticks!`, 'debuff')
        endTurn()
      } else if (skillIdx === 1) {
        if (!atkFighter.loadedDih) {
          setAtk(a => a ? { ...a, loadedDih: true } : a)
          addLog(`⚡ LOADED DIH — charging... next turn: 60 DMG!`, 'buff')
          endTurn()
        } else {
          const d = dealDmg(60)
          const selfHit = Math.round(60 * 0.3)
          dealSelfDmg(selfHit)
          setAtk(a => a ? { ...a, loadedDih: false, debuffs: [...a.debuffs, { id: '2ndnut', label: '2nd Nut', icon: '😵' }] } : a)
          addLog(`💥 LOADED DIH RELEASED! ${d} DMG to opponent, ${selfHit} self (2nd Nut)!`, 'atk')
          endTurn()
        }
      } else if (skillIdx === 2) {
        if (isPlayer) {
          setMiniGame('sf90')
          setMiniGameCb(() => (ok: boolean) => {
            setMiniGame('none'); setMiniGameCb(null)
            setSfResult(ok ? 'success' : 'fail')
            setTimeout(() => setSfResult(null), 3500)
            if (ok) {
              const d = dealDmg(60)
              setAtk(a => a ? { ...a, hp: a.maxHp } : a)
              addLog(`🏎 SF90 ASSEMBLED! A true Mercedes fan! ${d} DMG + FULL HP!`, 'special')
            } else {
              dealSelfDmg(30)
              setAtk(a => a ? { ...a, def: Math.max(0, a.def * 0.6) } : a)
              addLog(`💥 SF90 EXPLODED! Carlos Sainz 2023 Las Vegas... 30 self DMG, DEF -40%!`, 'debuff')
            }
            endTurn()
          })
        } else {
          if (Math.random() > 0.4) { const d = dealDmg(60); addLog(`🏎 AI SF90 success! ${d} DMG!`, 'atk') }
          else { dealSelfDmg(30); addLog(`💥 AI SF90 exploded!`, 'debuff') }
          endTurn()
        }
      } else if (skillIdx === 3) {
        const isSecret = tgtFighter.id === 'aatharva'
        if (isSecret && isPlayer) {
          setMiniGame('gitaur')
          setMiniGameCb(() => (ok: boolean) => {
            setMiniGame('none'); setMiniGameCb(null)
            if (ok) { setOpponent(o => o ? { ...o, hp: 0 } : o); addLog(`🎸 GITAUR GOONING — INSTANT KO!`, 'special'); setPhase('victory') }
            else { setPlayer(p => p ? { ...p, hp: 0 } : p); addLog(`🎸 GITAUR GOONING failed!`, 'special'); setPhase('defeat') }
          })
        } else {
          setAtk(a => {
            if (!a) return a
            const nb = a.buffs.map(b => ({ ...b, atkMod: b.atkMod ? b.atkMod * 2 : b.atkMod }))
            return { ...a, def: a.def * 1.2, ultimateActive: true, buffs: [...nb, { id: 'ult_g', label: 'ULT GITUAR', icon: '🎸', atkMod: 0.4 }] }
          })
          addLog(`🎸 ULTIMATE GITUAR! ATK +40%, DEF +20%, all buffs ×2!`, 'special')
          endTurn()
        }
      }
    }

    // DWEEB
    else if (atkFighter.id === 'dweeb') {
      if (skillIdx === 0) {
        if (isPlayer) {
          setMiniGame('rta_sharmana')
          setMiniGameCb(() => (hit: boolean) => {
            setMiniGame('none'); setMiniGameCb(null)
            if (hit) { const d = dealDmg(20); addLog(`🫥 SHARMANA — surprise! ${d} DMG!`, 'atk') }
            else { dealSelfDmg(4); addLog(`🫥 SHARMANA failed — 20% self DMG!`, 'debuff') }
            endTurn()
          })
        } else {
          if (Math.random() > 0.4) { const d = dealDmg(20); addLog(`🫥 AI SHARMANA! ${d} DMG!`, 'atk') }
          else addLog(`🫥 AI SHARMANA failed.`, 'system')
          endTurn()
        }
      } else if (skillIdx === 1) {
        const canFake = isPlayer && (!atkFighter.fatJumpUsedTurn || turnNum - atkFighter.fatJumpUsedTurn >= 5)
        if (canFake) {
          setAtk(a => a ? { ...a, fakeJumpAvail: true, fatJumpUsedTurn: turnNum } : a)
          addLog(`🦘 FAT JUMP incoming! Press E to fake it!`, 'system')
          // auto-fire after 2.5s if not faked
          setTimeout(() => {
            setPlayer(p => {
              if (p && p.fakeJumpAvail) {
                const d = dealDmg(30)
                addLog(`🦘 FAT JUMP lands! ${d} DMG!`, 'atk')
                endTurn()
                return { ...p, fakeJumpAvail: false }
              }
              return p
            })
          }, 2500)
        } else {
          const d = dealDmg(30)
          addLog(`🦘 FAT JUMP! ${d} DMG!`, 'atk')
          endTurn()
        }
      } else if (skillIdx === 2) {
        const canYum = !atkFighter.yumUsedTurn || turnNum - atkFighter.yumUsedTurn >= 5
        if (!canYum) {
          addLog(`🍜 YUM on cooldown! (${5 - (turnNum - (atkFighter.yumUsedTurn || 0))} turns left)`, 'system')
          endTurn()
        } else if (isPlayer) {
          setAtk(a => a ? { ...a, yumUsedTurn: turnNum } : a)
          setMiniGame('yum')
          setMiniGameCb(() => () => {
            setMiniGame('none'); setMiniGameCb(null)
            setPlayer(p => p ? { ...p, hp: p.maxHp } : p)
            addLog(`🍜 YUM complete! Fully healed!`, 'heal')
            endTurn()
          })
        } else {
          setAtk(a => a ? { ...a, hp: a.maxHp, yumUsedTurn: turnNum } : a)
          addLog(`🍜 AI YUM — fully healed!`, 'heal')
          endTurn()
        }
      } else if (skillIdx === 3) {
        setAtk(a => {
          if (!a) return a
          const nb = a.buffs.map(b => ({ ...b, atkMod: b.atkMod ? b.atkMod * 2 : b.atkMod, incomingDmgMod: b.incomingDmgMod ? b.incomingDmgMod * 2 : b.incomingDmgMod }))
          const nd = a.debuffs.map(b => ({
            ...b,
            lingering: b.lingering ? { ...b.lingering, dmg: b.lingering.dmg <= 0 ? b.lingering.dmg : -b.lingering.dmg * 0.5 } : undefined
          }))
          return { ...a, allMightActive: true, ultimateActive: true, buffs: nb, debuffs: nd }
        })
        addLog(`💪 ALL MIGHT! Stats ×2, debuffs ÷2 (may heal), incoming debuffs ×2!`, 'special')
        endTurn()
      }
    }
  }

  function playerUseSkill(idx: number) {
    if (turn !== 0 || busy || !player || !opponent || miniGame !== 'none') return
    setBusy(true)
    doSkill(idx, true, player, opponent)
  }

  function fakeJump() {
    setPlayer(p => p ? { ...p, fakeJumpAvail: false } : p)
    addLog(`🦘 FAT JUMP faked! Opponent gets a free turn.`, 'system')
    endTurn()
  }

  const skills = player && opponent ? getSkills(player.id, player, opponent) : []

  // ── Render ──
  if (phase === 'select_player') return <CharSelect title="⚔️ CHOOSE YOUR STAND USER" onPick={id => { setPlayerChar(id); setPhase('select_opponent') }} onBack={onExit} />
  if (phase === 'select_opponent') return <CharSelect title="⚔️ CHOOSE YOUR OPPONENT" exclude={playerChar!} onPick={id => startBattle(playerChar!, id)} onBack={() => setPhase('select_player')} />

  return (
    <div className="battle-arena">
      <div className="battle-arena-bg" />

      {/* SF90 result flash */}
      <AnimatePresence>
        {sfResult && (
          <motion.div className={`sf90-flash sf90-${sfResult}`}
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {sfResult === 'success' ? '🏎 A true Mercedes fan!' : '💥 Carlos Sainz 2023 Las Vegas...'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini-games */}
      {miniGame === 'rta_babu' && <RTAGame title="💋 BABU SHONA — Time it!" windowMs={800} onDone={miniGameCb!} />}
      {miniGame === 'rta_totlapan' && <RTAGame title='🗣 TOTLAPAN — "lu calnot tolk!"' windowMs={700} onDone={miniGameCb!} />}
      {miniGame === 'rta_sharmana' && <RTAGame title="🫥 SHARMANA — Spot the surprise!" windowMs={600} onDone={miniGameCb!} />}
      {miniGame === 'sf90' && <SF90Game onDone={miniGameCb!} />}
      {miniGame === 'gitaur' && <GitaurGame onDone={miniGameCb!} />}
      {miniGame === 'yum' && miniGameCb && <YumGame onDone={() => miniGameCb(null)} />}

      {/* HP Cards */}
      {player && opponent && (
        <div className="battle-fighters">
          <motion.div animate={shake === 'player' ? { x: [-8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.3 }}>
            <HpCard fighter={player} side="left" />
          </motion.div>
          <div className="battle-vs">⚔️<br /><span>VS</span></div>
          <motion.div animate={shake === 'opp' ? { x: [-8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.3 }}>
            <HpCard fighter={opponent} side="right" />
          </motion.div>
        </div>
      )}

      {/* Turn bar */}
      <div className="battle-turn-bar">
        <span className={`turn-ind ${turn === 0 ? 'turn-active' : ''}`}>YOUR TURN</span>
        <span className="turn-num-label">Turn {turnNum}</span>
        <span className={`turn-ind ${turn === 1 ? 'turn-active' : ''}`}>AI TURN</span>
      </div>

      {/* Skills */}
      {turn === 0 && player && opponent && !busy && (
        <div className="battle-skills">
          {skills.map((s, i) => (
            <SkillBtn key={i} {...s} disabled={miniGame !== 'none'} onClick={() => playerUseSkill(i)} />
          ))}
          {player.fakeJumpAvail && (
            <motion.button className="fake-e-btn"
              animate={{ scale: [1, 1.12, 1], boxShadow: ['0 0 10px #39ff14', '0 0 30px #39ff14', '0 0 10px #39ff14'] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              onClick={fakeJump}>[ E ] FAKE IT!</motion.button>
          )}
        </div>
      )}
      {(turn === 1 || busy) && <div className="ai-thinking">💀 {opponent?.name} is plotting...</div>}

      {/* Log */}
      <div className="battle-log" ref={logRef}>
        {logs.map(l => (
          <motion.div key={l.id} className={`log-line log-${l.type}`}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            {l.text}
          </motion.div>
        ))}
      </div>

      {/* End screen */}
      <AnimatePresence>
        {(phase === 'victory' || phase === 'defeat') && (
          <motion.div className={`battle-end battle-end-${phase}`}
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="end-emoji">{phase === 'victory' ? '🏆' : '💀'}</div>
            <div className="end-title">{phase === 'victory' ? 'VICTORY!' : 'DEFEATED!'}</div>
            <div className="end-sub">
              {phase === 'victory'
                ? `${player?.name} stands victorious! YARE YARE DAZE...`
                : `${opponent?.name} wins. You got cooked.`}
            </div>
            <div className="end-btns">
              <button className="end-btn-p" onClick={() => { if (playerChar) startBattle(playerChar, opponent!.id) }}>Rematch</button>
              <button className="end-btn-s" onClick={() => setPhase('select_player')}>New Fight</button>
              <button className="end-btn-s" onClick={onExit}>Exit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
