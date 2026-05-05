import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Fighter {
  id: string
  name: string
  emoji: string
  color: string
  hp: number
  maxHp: number
  defense: number
  buffs: Buff[]
  debuffs: Debuff[]
  ultUsed: boolean
  secretUltUsed: boolean
  loadedDih: boolean
  fakeJumpUsed: number   // turn it was last used
  yumUsed: number
}

interface Buff  { id: string; label: string; value: number; turns: number }
interface Debuff { id: string; label: string; value: number; turns: number }

interface LogEntry { text: string; color?: string }

const BASE: Record<string, Omit<Fighter,'buffs'|'debuffs'|'ultUsed'|'secretUltUsed'|'loadedDih'|'fakeJumpUsed'|'yumUsed'>> = {
  dhariya: { id:'dhariya', name:'Dhariya', emoji:'🥺', color:'#00d4ff', hp:100, maxHp:100, defense:0 },
  aatharva:{ id:'aatharva',name:'Aatharva',emoji:'🍼', color:'#b44fff', hp:100, maxHp:100, defense:0 },
  aaditya: { id:'aaditya', name:'Aaditya', emoji:'🎸', color:'#ff2d9b', hp:100, maxHp:100, defense:0 },
  dweeb:   { id:'dweeb',   name:'Dweeb',  emoji:'🤓', color:'#39ff14', hp:100, maxHp:100, defense:0 },
}

function makeFighter(id: string): Fighter {
  return { ...BASE[id], buffs:[], debuffs:[], ultUsed:false, secretUltUsed:false, loadedDih:false, fakeJumpUsed:-99, yumUsed:-99 }
}

// ─── Mini-game types ──────────────────────────────────────────────────────────
type MiniGame =
  | { type:'rta'; label:string; window:number; onSuccess:()=>void; onFail:()=>void }
  | { type:'babble'; words:string[]; idx:number; hits:number; onSuccess:()=>void; onFail:()=>void }
  | { type:'ferrari'; parts:string[]; assembled:string[]; onSuccess:()=>void; onFail:()=>void }
  | { type:'guitar'; side:'L'|'R'; hits:number; total:number; timeLeft:number; onSuccess:()=>void; onFail:()=>void }
  | { type:'sharmana'; onSuccess:()=>void; onFail:()=>void }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v:number,min:number,max:number){ return Math.max(min,Math.min(max,v)) }

function applyDamage(target: Fighter, rawDmg: number): [Fighter, number] {
  const absorbed = Math.min(target.defense, rawDmg)
  const actual = Math.max(0, rawDmg - absorbed)
  const newDef = Math.max(0, target.defense - absorbed)
  return [{ ...target, hp: clamp(target.hp - actual, 0, target.maxHp), defense: newDef }, actual]
}

function applyHeal(target: Fighter, amt: number): Fighter {
  return { ...target, hp: clamp(target.hp + amt, 0, target.maxHp) }
}

function addBuff(f: Fighter, b: Buff): Fighter {
  return { ...f, buffs: [...f.buffs.filter(x=>x.id!==b.id), b] }
}
function addDebuff(f: Fighter, d: Debuff): Fighter {
  return { ...f, debuffs: [...f.debuffs.filter(x=>x.id!==d.id), d] }
}
function hasBuff(f: Fighter, id: string){ return f.buffs.some(b=>b.id===id) }
function hasDebuff(f: Fighter, id: string){ return f.debuffs.some(d=>d.id===id) }

function tickFighter(f: Fighter): [Fighter, LogEntry[]] {
  const logs: LogEntry[] = []
  let next = { ...f }

  // linger damage (aaditya introvertedness)
  if (hasDebuff(next,'linger')) {
    next = { ...next, hp: clamp(next.hp - 10, 0, next.maxHp) }
    logs.push({ text:`💔 ${next.name} takes 10 linger damage!`, color:'#ff2d9b' })
  }

  // tick buffs
  next.buffs = next.buffs.map(b=>({...b,turns:b.turns-1})).filter(b=>b.turns>0)
  // tick debuffs
  next.debuffs = next.debuffs.map(d=>({...d,turns:d.turns-1})).filter(d=>d.turns>0)
  return [next, logs]
}

// ─── Character skill definitions (metadata only) ─────────────────────────────
const SKILLS: Record<string, {id:string;label:string;desc:string;icon:string}[]> = {
  dhariya: [
    { id:'stalker',   label:'Stalker Eyes',    desc:'+10% ATK, +15% DEF',            icon:'👁️' },
    { id:'stutter',   label:'Stuttering Shot',  desc:'15 slurs × 1 dmg = 15 dmg',    icon:'💬' },
    { id:'babu',      label:'Babu Shona',       desc:'RTA flirt — 25 dmg if timed',   icon:'💕' },
    { id:'chaati',    label:'⚡ CHAATI (ULT)',   desc:'DEF +69%, ATK rate +30%',       icon:'🌑' },
  ],
  aatharva: [
    { id:'goon',      label:'Infertile Gooning',desc:'10 dmg + Numbness buff',        icon:'😵' },
    { id:'totla',     label:'Totlapan',         desc:'RTA babble — 35 dmg + DEF+10',  icon:'🍼' },
    { id:'gay',       label:'Gayness',          desc:'Heal self +20 HP, DEF+10',      icon:'🌈' },
    { id:'goonult',   label:'⚡ GOON GOON GAGA', desc:'Numbness ×60%, ATK+30%, DEF+20%',icon:'👶' },
  ],
  aaditya: [
    { id:'sad',       label:'Emotional Sadmapan',desc:'Introvertedness: 10 linger/5s', icon:'😔' },
    { id:'loaded',    label:'Loaded Dih',        desc:'Skip → next turn 60% dmg + 2nd Nut',icon:'💀' },
    { id:'sf90',      label:'SF90',              desc:'Ferrari build — 60% dmg + full heal',icon:'🏎️' },
    { id:'gitult',    label:'⚡ ULTIMATE GITUAR', desc:'ATK+40%, DEF+20%, buffs ×2',   icon:'🎸' },
  ],
  dweeb: [
    { id:'sharmana',  label:'Sharmana',          desc:'Hide + surprise 20% dmg',       icon:'🫣' },
    { id:'fatjump',   label:'Fat Jump',          desc:'30% dmg (or fake with E)',       icon:'💨' },
    { id:'yum',       label:'Yum',               desc:'59s eat → full heal (1/5 turns)',icon:'🍜' },
    { id:'allmight',  label:'⚡ ALL MIGHT (ULT)', desc:'Stats ×2, debuffs flip to heals',icon:'💪' },
  ],
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Battle({ onExit }: { onExit: ()=>void }) {
  const [phase, setPhase] = useState<'select'|'fight'|'over'>('select')
  const [playerChar, setPlayerChar] = useState<string|null>(null)
  const [enemyChar,  setEnemyChar]  = useState<string|null>(null)

  const [player, setPlayer] = useState<Fighter|null>(null)
  const [enemy,  setEnemy]  = useState<Fighter|null>(null)
  const [turn,   setTurn]   = useState<'player'|'enemy'>('player')
  const [turnNum, setTurnNum] = useState(0)
  const [log,    setLog]    = useState<LogEntry[]>([])
  const [mini,   setMini]   = useState<MiniGame|null>(null)
  const [winner, setWinner] = useState<string|null>(null)
  const [msg,    setMsg]    = useState<string>('')
  const [msgColor, setMsgColor] = useState('#ffd700')
  const [loadedCharge, setLoadedCharge] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  const chars = Object.keys(BASE)

  // scroll log
  useEffect(()=>{ logRef.current?.scrollTo(0,9999) },[log])

  function pushLog(entries: LogEntry[]) {
    setLog(l => [...l.slice(-40), ...entries])
  }
  function flash(text:string, color='#ffd700') {
    setMsg(text); setMsgColor(color)
    setTimeout(()=>setMsg(''),2200)
  }

  // ─── Start fight ────────────────────────────────────────────────────────────
  function startFight(pc: string, ec: string) {
    setPlayer(makeFighter(pc))
    setEnemy(makeFighter(ec))
    setTurn('player')
    setTurnNum(0)
    setLog([{ text:`⚔️ STAND BATTLE: ${BASE[pc].name} vs ${BASE[ec].name}!`, color:'#ffd700' }])
    setPhase('fight')
  }

  // ─── Check win ──────────────────────────────────────────────────────────────
  function checkWin(p: Fighter, e: Fighter): boolean {
    if (e.hp <= 0) { setWinner(p.name); setPhase('over'); return true }
    if (p.hp <= 0) { setWinner(e.name); setPhase('over'); return true }
    return false
  }

  // ─── Enemy AI ───────────────────────────────────────────────────────────────
  const enemyTurn = useCallback((p: Fighter, e: Fighter, tn: number) => {
    const skills = SKILLS[e.id]
    const available = skills.filter(s => {
      if (s.id.endsWith('ult')) return !e.ultUsed
      return true
    })
    const pick = available[Math.floor(Math.random() * available.length)]
    let np = { ...p }, ne = { ...e }
    const logs: LogEntry[] = [{ text:`🤖 ${e.name} uses ${pick.label}!`, color: e.color }]

    // simple AI execution (no mini-games for AI, just raw values)
    switch(pick.id) {
      // dhariya
      case 'stalker': ne = addBuff(ne,{id:'stalker',label:'Stalker Eyes',value:10,turns:4}); ne.defense=Math.min(100,ne.defense+15); break
      case 'stutter': { const [np2]=applyDamage(np,15); np=np2; logs.push({text:`💥 15 slur damage!`,color:'#ff4444'}) } break
      case 'babu':    { const [np2]=applyDamage(np,12); np=np2; logs.push({text:`💕 Flirt hit for 12!`,color:'#ff2d9b'}) } break
      case 'chaati':  ne.defense=Math.min(100,ne.defense+25); ne=addBuff(ne,{id:'chaati',label:'CHAATI',value:30,turns:5}); ne.ultUsed=true; logs.push({text:`🌑 CHAATI activated!`,color:'#00d4ff'}); break
      // aatharva
      case 'goon':    { const [np2]=applyDamage(np,10); np=np2; ne.defense=Math.min(100,ne.defense+20); ne=addBuff(ne,{id:'numb',label:'Numbness',value:20,turns:4}) } break
      case 'totla':   { const [np2]=applyDamage(np,25); np=np2; ne.defense=Math.min(100,ne.defense+10) } break
      case 'gay':     ne=applyHeal(ne,20); ne.defense=Math.min(100,ne.defense+10); break
      case 'goonult': ne=addBuff(ne,{id:'goonult',label:'GOON×',value:60,turns:5}); ne.defense=Math.min(100,ne.defense+20); ne.ultUsed=true; break
      // aaditya (nerfed for AI)
      case 'sad':     np=addDebuff(np,{id:'linger',label:'Linger',value:10,turns:5}); break
      case 'loaded':  { const [np2]=applyDamage(np,30); np=np2 } break // nerfed
      case 'sf90':    { const [np2]=applyDamage(np,35); np=np2 } break // nerfed
      case 'gitult':  ne=addBuff(ne,{id:'gitult',label:'GITUAR',value:40,turns:5}); ne.ultUsed=true; break
      // dweeb
      case 'sharmana':{ const [np2]=applyDamage(np,20); np=np2 } break
      case 'fatjump': { const [np2]=applyDamage(np,30); np=np2 } break
      case 'yum':     ne=applyHeal(ne,50); break
      case 'allmight':ne=addBuff(ne,{id:'allmight',label:'ALL MIGHT',value:2,turns:6}); ne.ultUsed=true; break
    }

    const [tp, tpLogs] = tickFighter(np)
    const [te, teLogs] = tickFighter(ne)
    logs.push(...tpLogs,...teLogs)
    pushLog(logs)
    if (!checkWin(tp,te)) {
      setPlayer(tp); setEnemy(te)
      setTurn('player'); setTurnNum(tn+1)
    }
  }, [])

  // ─── Player skill use ────────────────────────────────────────────────────────
  function useSkill(skillId: string) {
    if (!player || !enemy || turn !== 'player' || mini) return
    const p = { ...player }, e = { ...enemy }

    // ATK multiplier from buffs
    const atkMult = 1
      + (hasBuff(p,'stalker') ? 0.10 : 0)
      + (hasBuff(p,'gitult')  ? 0.40 : 0)
      + (hasBuff(p,'goonult') ? 0.30 : 0)
      + (hasBuff(p,'chaati')  ? 0.30 : 0)
      + (hasBuff(p,'allmight')? 1.00 : 0)

    function finishTurn(np: Fighter, ne: Fighter, extraLogs: LogEntry[] = []) {
      const [tp, tpLogs] = tickFighter(np)
      const [te, teLogs] = tickFighter(ne)
      const all = [...extraLogs, ...tpLogs, ...teLogs]
      pushLog(all)
      if (!checkWin(tp, te)) {
        setPlayer(tp); setEnemy(te)
        setTurn('enemy')
        setTimeout(() => enemyTurn(tp, te, turnNum + 1), 1200)
      }
    }

    // ── DHARIYA ──────────────────────────────────────────────────────────────
    if (skillId === 'stalker') {
      const np = addBuff({ ...p, defense: Math.min(100, p.defense + 15) }, {id:'stalker',label:'Stalker Eyes',value:10,turns:4})
      pushLog([{text:`👁️ Dhariya activates STALKER EYES! ATK+10% DEF+15`,color:'#00d4ff'}])
      finishTurn(np, e)
    }
    else if (skillId === 'stutter') {
      const dmg = Math.round(15 * atkMult)
      const [ne, actual] = applyDamage(e, dmg)
      pushLog([{text:`💬 STUTTERING SHOT! 15 slurs fire — ${actual} damage!`,color:'#00d4ff'}])
      finishTurn(p, ne)
    }
    else if (skillId === 'babu') {
      setMini({
        type:'rta', label:'💕 BABU SHONA — click the heart at the right moment!', window:800,
        onSuccess: () => {
          const dmg = Math.round(25 * atkMult)
          const [ne, actual] = applyDamage(e, dmg)
          flash(`💕 FLIRT LANDED! ${actual} damage!`, '#ff2d9b')
          pushLog([{text:`💕 Babu Shona hit for ${actual}!`,color:'#ff2d9b'}])
          setMini(null); finishTurn(p, ne)
        },
        onFail: () => {
          flash('💔 Flirt failed... turn wasted', '#888')
          pushLog([{text:`💔 Babu Shona missed — turn wasted`,color:'#888'}])
          setMini(null); finishTurn(p, e)
        }
      })
    }
    else if (skillId === 'chaati') {
      if (p.ultUsed) { flash('⚡ Ultimate already used!','#888'); return }
      const np = addBuff({ ...p, defense: Math.min(100, p.defense + 40), ultUsed: true },
        {id:'chaati',label:'CHAATI',value:30,turns:6})
      flash('🌑 CHAATI ACTIVATED — Gaurav has arrived!', '#00d4ff')
      pushLog([{text:`🌑 CHAATI: DEF+40, ATK+30%, Gaurav watches over you!`,color:'#00d4ff'}])
      finishTurn(np, e)
    }

    // ── AATHARVA ─────────────────────────────────────────────────────────────
    else if (skillId === 'goon') {
      const dmg = Math.round(10 * atkMult)
      const [ne, actual] = applyDamage(e, dmg)
      const np = addBuff({ ...p, defense: Math.min(100, p.defense + 20) }, {id:'numb',label:'Numbness',value:20,turns:4})
      pushLog([{text:`😵 INFERTILE GOONING — ${actual} dmg + Numbness active!`,color:'#b44fff'}])
      finishTurn(np, ne)
    }
    else if (skillId === 'totla') {
      const words = ['lu','calnot','tolk','tlo','mle','lai','diz','baba','goo','wawa']
      setMini({
        type:'babble', words, idx:0, hits:0,
        onSuccess: () => {
          const dmg = Math.round(35 * atkMult)
          const [ne, actual] = applyDamage(e, dmg)
          const np = { ...p, defense: Math.min(100, p.defense + 10) }
          flash(`🍼 TOTLAPAN HIT! ${actual} dmg!`, '#b44fff')
          pushLog([{text:`🍼 Totlapan babble landed — ${actual} dmg, DEF+10`,color:'#b44fff'}])
          setMini(null); finishTurn(np, ne)
        },
        onFail: () => {
          flash('🍼 Babble failed — turn wasted', '#888')
          pushLog([{text:`🍼 Totlapan failed — turn wasted`,color:'#888'}])
          setMini(null); finishTurn(p, e)
        }
      })
    }
    else if (skillId === 'gay') {
      const np = applyHeal({ ...p, defense: Math.min(100, p.defense + 10) }, 20)
      pushLog([{text:`🌈 GAYNESS — healed 20 HP, DEF+10`,color:'#b44fff'}])
      finishTurn(np, e)
    }
    else if (skillId === 'goonult') {
      if (p.ultUsed) { flash('⚡ Ultimate already used!','#888'); return }
      // secret ult check
      if (e.id === 'aaditya' && !p.secretUltUsed) {
        flash('🎸 SECRET ULTIMATE UNLOCKED — GITAUR GOONING!', '#ffd700')
        const total = 20
        setMini({
          type:'guitar', side:'L', hits:0, total, timeLeft:60,
          onSuccess: () => {
            flash('🎸 GITAUR GOONING — INSTANT KNOCKOUT!','#ffd700')
            pushLog([{text:`🎸 GITAUR GOONING SUCCESS — INSTANT KO!`,color:'#ffd700'}])
            const ne = { ...e, hp: 0 }
            setMini(null); setPlayer({...p,secretUltUsed:true}); setEnemy(ne)
            checkWin({...p,secretUltUsed:true}, ne)
          },
          onFail: () => {
            flash('🎸 Gitaur Gooning failed — YOU are eliminated!','#ff4444')
            pushLog([{text:`🎸 GITAUR GOONING FAILED — player eliminated!`,color:'#ff4444'}])
            const np2 = { ...p, hp: 0, secretUltUsed: true }
            setMini(null); setPlayer(np2); checkWin(np2, e)
          }
        })
        return
      }
      const np = addBuff({ ...p, defense: Math.min(100, p.defense + 20), ultUsed: true },
        {id:'goonult',label:'GOON×',value:60,turns:5})
      flash('👶 GOON GOON GAGA — maximum baby power!','#b44fff')
      pushLog([{text:`👶 GOON GOON GAGA: Numbness ×60%, ATK+30%, DEF+20%`,color:'#b44fff'}])
      finishTurn(np, e)
    }

    // ── AADITYA ──────────────────────────────────────────────────────────────
    else if (skillId === 'sad') {
      const ne = addDebuff(e, {id:'linger',label:'Linger',value:10,turns:5})
      pushLog([{text:`😔 EMOTIONAL SADMAPAN — Introvertedness applied! 10 linger dmg/turn`,color:'#ff2d9b'}])
      finishTurn(p, ne)
    }
    else if (skillId === 'loaded') {
      if (loadedCharge) {
        // release
        const base = Math.round(p.maxHp * 0.45) // nerfed: 45% not 60%
        const dmg  = Math.round(base * atkMult)
        const selfDmg = Math.round(dmg * 0.30)
        const [ne, actual] = applyDamage(e, dmg)
        const [np2] = applyDamage(p, selfDmg)
        setLoadedCharge(false)
        pushLog([{text:`💀 LOADED DIH RELEASED — ${actual} dmg! Self: ${selfDmg} (2nd Nut)`,color:'#ff2d9b'}])
        finishTurn(np2, ne)
      } else {
        setLoadedCharge(true)
        pushLog([{text:`💀 Loaded Dih charging... next turn it fires!`,color:'#ff8800'}])
        finishTurn(p, e)
      }
    }
    else if (skillId === 'sf90') {
      const PARTS = ['Body 🚗','Wheels 🛞','Spoiler 🏁','Front Wing ✈️']
      setMini({
        type:'ferrari', parts:PARTS, assembled:[],
        onSuccess: () => {
          const dmg = Math.round(p.maxHp * 0.45 * atkMult) // nerfed: 45%
          const [ne, actual] = applyDamage(e, dmg)
          const np2 = { ...p, hp: p.maxHp }
          flash('🏎️ A TRUE MERCEDES FAN! Ferrari built — ' + actual + ' damage!', '#39ff14')
          pushLog([{text:`🏎️ SF90 SUCCESS — ${actual} dmg, full heal! A TRUE MERCEDES FAN!`,color:'#39ff14'}])
          setMini(null); finishTurn(np2, ne)
        },
        onFail: () => {
          const selfDmg = Math.round(p.maxHp * 0.30)
          const [np2] = applyDamage({ ...p, defense: Math.max(0, p.defense - 40) }, selfDmg)
          flash('💥 Carlos Sainz 2023 Las Vegas...', '#888')
          pushLog([{text:`💥 SF90 FAILED — Carlos Sainz 2023 Las Vegas... ${selfDmg} self dmg, DEF-40`,color:'#888'}])
          setMini(null); finishTurn(np2, e)
        }
      })
    }
    else if (skillId === 'gitult') {
      if (p.ultUsed) { flash('⚡ Ultimate already used!','#888'); return }
      // secret ult check
      if (e.id === 'aatharva' && !p.secretUltUsed) {
        flash('🎸 SECRET ULTIMATE — GITAUR GOONING!','#ffd700')
        const total = 20
        setMini({
          type:'guitar', side:'L', hits:0, total, timeLeft:60,
          onSuccess: () => {
            pushLog([{text:`🎸 GITAUR GOONING SUCCESS — INSTANT KO!`,color:'#ffd700'}])
            const ne = { ...e, hp: 0 }
            setMini(null); setPlayer({...p,secretUltUsed:true}); setEnemy(ne)
            checkWin({...p,secretUltUsed:true}, ne)
          },
          onFail: () => {
            pushLog([{text:`🎸 GITAUR GOONING FAILED — player eliminated!`,color:'#ff4444'}])
            const np2 = { ...p, hp: 0, secretUltUsed: true }
            setMini(null); setPlayer(np2); checkWin(np2, e)
          }
        })
        return
      }
      const np = addBuff({ ...p, defense: Math.min(100, p.defense + 20), ultUsed: true },
        {id:'gitult',label:'GITUAR',value:40,turns:5})
      flash('🎸 ULTIMATE GITUAR — shredding reality!','#ff2d9b')
      pushLog([{text:`🎸 ULTIMATE GITUAR: ATK+40%, DEF+20%, all buffs ×2`,color:'#ff2d9b'}])
      finishTurn(np, e)
    }

    // ── DWEEB ────────────────────────────────────────────────────────────────
    else if (skillId === 'sharmana') {
      setMini({
        type:'sharmana',
        onSuccess: () => {
          const dmg = Math.round(p.maxHp * 0.20 * atkMult)
          const [ne, actual] = applyDamage(e, dmg)
          flash(`🫣 SURPRISE ATTACK — ${actual} damage!`, '#39ff14')
          pushLog([{text:`🫣 Sharmana surprise hit — ${actual} dmg!`,color:'#39ff14'}])
          setMini(null); finishTurn(p, ne)
        },
        onFail: () => {
          const dmg = Math.round(p.maxHp * 0.20)
          const [np2, actual] = applyDamage(p, dmg)
          flash(`🫣 Sharmana backfired — ${actual} self damage!`, '#ff4444')
          pushLog([{text:`🫣 Sharmana failed — ${actual} self damage!`,color:'#ff4444'}])
          setMini(null); finishTurn(np2, e)
        }
      })
    }
    else if (skillId === 'fatjump') {
      const dmg = Math.round(p.maxHp * 0.30 * atkMult)
      const [ne, actual] = applyDamage(e, dmg)
      pushLog([{text:`💨 FAT JUMP — ${actual} damage!`,color:'#39ff14'}])
      finishTurn(p, ne)
    }
    else if (skillId === 'yum') {
      if (turnNum - p.yumUsed < 5 && p.yumUsed >= 0) {
        flash('🍜 Yum is on cooldown (1 in 5 turns)!','#888'); return
      }
      const np = { ...p, yumUsed: turnNum }
      // 59s countdown handled via mini but simplified to 3s for UX
      flash('🍜 Dweeb is eating... please wait 59 seconds (we sped it up)','#39ff14')
      pushLog([{text:`🍜 YUM — eating ramen... opponent waits...`,color:'#39ff14'}])
      setTimeout(() => {
        const np2 = { ...np, hp: np.maxHp }
        flash('🍜 Dweeb is FULLY HEALED!','#39ff14')
        pushLog([{text:`🍜 YUM complete — full heal!`,color:'#39ff14'}])
        finishTurn(np2, e)
      }, 3000)
      setPlayer(np)
    }
    else if (skillId === 'allmight') {
      if (p.ultUsed) { flash('⚡ Ultimate already used!','#888'); return }
      const np = addBuff({ ...p, ultUsed: true }, {id:'allmight',label:'ALL MIGHT',value:2,turns:6})
      flash('💪 ALL MIGHT — stats ×2, debuffs flip to heals!','#39ff14')
      pushLog([{text:`💪 ALL MIGHT: stats ×2, debuffs become heals!`,color:'#39ff14'}])
      finishTurn(np, e)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="battle-root">

      {/* ── CHARACTER SELECT ── */}
      {phase === 'select' && (
        <motion.div className="battle-select" initial={{opacity:0,y:40}} animate={{opacity:1,y:0}}>
          <button className="battle-exit-btn" onClick={onExit}>✕ EXIT</button>
          <div className="battle-select-diamonds">◆ ◇ ◆ ◇ ◆</div>
          <h2 className="battle-select-title">CHOOSE YOUR STAND USER</h2>
          <p className="battle-select-sub">pick your fighter. the rest will be chosen by fate.</p>

          <div className="battle-char-grid">
            {chars.map(id => (
              <motion.button
                key={id}
                className={`battle-char-btn ${playerChar===id?'battle-char-selected':''}`}
                style={{ '--bc': BASE[id].color } as any}
                onClick={() => setPlayerChar(id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="bcb-emoji">{BASE[id].emoji}</div>
                <div className="bcb-name">{BASE[id].name}</div>
                {playerChar===id && <div className="bcb-chosen">◆ CHOSEN</div>}
              </motion.button>
            ))}
          </div>

          {playerChar && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="battle-enemy-section">
              <p className="battle-select-sub" style={{marginTop:'1.5rem'}}>
                ◆ your opponent will be chosen randomly from the remaining fighters
              </p>
              <motion.button
                className="battle-start-btn"
                onClick={() => {
                  const pool = chars.filter(c => c !== playerChar)
                  const ec = pool[Math.floor(Math.random() * pool.length)]
                  setEnemyChar(ec)
                  startFight(playerChar, ec)
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⚔️ BEGIN THE DUEL
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ── FIGHT ── */}
      {phase === 'fight' && player && enemy && (
        <div className="battle-fight">
          <button className="battle-exit-btn" onClick={onExit}>✕ EXIT</button>

          {/* flash message */}
          <AnimatePresence>
            {msg && (
              <motion.div className="battle-flash" style={{ color: msgColor }}
                initial={{opacity:0,scale:0.7}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:1.2}}>
                {msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* HP bars */}
          <div className="battle-hud">
            <FighterHUD f={player} label="YOU" />
            <div className="battle-vs">⚔️<br/><span className="battle-turn-label">{turn==='player'?'YOUR TURN':'ENEMY TURN'}</span></div>
            <FighterHUD f={enemy} label="ENEMY" flip />
          </div>

          {/* Mini-game overlay */}
          <AnimatePresence>
            {mini && (
              <motion.div className="mini-overlay"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                {mini.type === 'rta'      && <RTAGame      mini={mini} />}
                {mini.type === 'babble'   && <BabbleGame   mini={mini} setMini={setMini as any} />}
                {mini.type === 'ferrari'  && <FerrariGame  mini={mini} />}
                {mini.type === 'guitar'   && <GuitarGame   mini={mini} />}
                {mini.type === 'sharmana' && <SharmanaGame mini={mini} />}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skills */}
          {turn === 'player' && !mini && (
            <div className="battle-skills">
              <p className="battle-skills-label">◆ YOUR MOVES</p>
              <div className="battle-skills-grid">
                {SKILLS[player.id].map(sk => {
                  const isUlt = sk.id.endsWith('ult') || sk.id === 'gitult' || sk.id === 'allmight' || sk.id === 'chaati' || sk.id === 'goonult'
                  const disabled = isUlt && player.ultUsed
                  const isLoaded = sk.id === 'loaded' && loadedCharge
                  return (
                    <motion.button
                      key={sk.id}
                      className={`skill-btn ${isUlt?'skill-ult':''} ${disabled?'skill-disabled':''} ${isLoaded?'skill-charged':''}`}
                      style={{ '--sc': player.color } as any}
                      onClick={() => !disabled && useSkill(sk.id)}
                      whileHover={!disabled?{ scale:1.04, y:-2 }:{}}
                      whileTap={!disabled?{ scale:0.96 }:{}}
                    >
                      <span className="skill-icon">{sk.icon}</span>
                      <span className="skill-label">{isLoaded ? '💥 RELEASE!' : sk.label}</span>
                      <span className="skill-desc">{sk.desc}</span>
                      {isUlt && player.ultUsed && <span className="skill-used">USED</span>}
                    </motion.button>
                  )
                })}
              </div>
              {/* Dweeb fake hint */}
              {player.id === 'dweeb' && (
                <p className="battle-e-hint">press <kbd>E</kbd> during Fat Jump to fake it (1/5 turns)</p>
              )}
            </div>
          )}

          {turn === 'enemy' && !mini && (
            <div className="battle-enemy-thinking">
              <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ repeat:Infinity, duration:1 }}>
                ⏳ {enemy.name} is thinking...
              </motion.div>
            </div>
          )}

          {/* Battle log */}
          <div className="battle-log" ref={logRef}>
            {log.map((l,i) => (
              <div key={i} className="log-line" style={{ color: l.color || 'rgba(245,240,255,0.7)' }}>
                {l.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GAME OVER ── */}
      {phase === 'over' && (
        <motion.div className="battle-over" initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}>
          <div className="over-diamonds">◆ ◇ ◆ ◇ ◆</div>
          <div className="over-emoji">{winner === player?.name ? '🏆' : '💀'}</div>
          <h2 className="over-title" style={{ color: winner===player?.name?'#ffd700':'#ff4444' }}>
            {winner === player?.name ? 'STAND VICTORIOUS!' : 'YOU HAVE BEEN DEFEATED'}
          </h2>
          <p className="over-sub">{winner} wins the duel!</p>
          <div className="over-btns">
            <motion.button className="battle-start-btn" onClick={() => { setPhase('select'); setPlayerChar(null); setEnemyChar(null) }}
              whileHover={{scale:1.05}}>⚔️ REMATCH</motion.button>
            <motion.button className="battle-exit-btn-lg" onClick={onExit} whileHover={{scale:1.05}}>🚪 EXIT</motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Fighter HUD ─────────────────────────────────────────────────────────────
function FighterHUD({ f, label, flip }: { f:Fighter; label:string; flip?:boolean }) {
  const pct = (f.hp / f.maxHp) * 100
  const hpColor = pct > 50 ? '#39ff14' : pct > 25 ? '#ffd700' : '#ff4444'
  return (
    <div className={`fighter-hud ${flip?'fighter-hud-flip':''}`}>
      <div className="fhud-label">{label}</div>
      <div className="fhud-emoji">{f.emoji}</div>
      <div className="fhud-name" style={{ color: f.color, textShadow:`0 0 10px ${f.color}` }}>{f.name}</div>
      <div className="fhud-hp-row">
        <div className="fhud-hp-bar-bg">
          <motion.div className="fhud-hp-bar" style={{ background: hpColor, boxShadow:`0 0 8px ${hpColor}` }}
            animate={{ width:`${pct}%` }} transition={{ duration:0.4 }} />
        </div>
        <span className="fhud-hp-num">{Math.ceil(f.hp)}/{f.maxHp}</span>
      </div>
      {f.defense > 0 && <div className="fhud-def">🛡️ {Math.round(f.defense)}</div>}
      <div className="fhud-status">
        {f.buffs.map(b => <span key={b.id} className="status-buff">↑{b.label}</span>)}
        {f.debuffs.map(d => <span key={d.id} className="status-debuff">↓{d.label}</span>)}
      </div>
    </div>
  )
}

// ─── Mini-games ───────────────────────────────────────────────────────────────

// RTA — click the button in a tight window
function RTAGame({ mini }: { mini: Extract<MiniGame,{type:'rta'}> }) {
  const [active, setActive] = useState(false)
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => {
    const delay = 800 + Math.random() * 1400
    timerRef.current = setTimeout(() => { setActive(true) }, delay)
    const kill = setTimeout(() => {
      if (!done) { setDone(true); mini.onFail() }
    }, delay + mini.window + 600)
    return () => { clearTimeout(timerRef.current!); clearTimeout(kill) }
  }, [])

  const hit = () => {
    if (!active || done) return
    setDone(true)
    mini.onSuccess()
  }

  return (
    <div className="mini-box">
      <p className="mini-title">{mini.label}</p>
      <p className="mini-sub">{active ? '👆 CLICK NOW!' : '⏳ Wait for it...'}</p>
      <motion.button
        className={`mini-rta-btn ${active ? 'mini-rta-active' : ''}`}
        onClick={hit}
        animate={active ? { scale:[1,1.15,1], boxShadow:['0 0 0px #ffd700','0 0 30px #ffd700','0 0 0px #ffd700'] } : {}}
        transition={{ duration:0.4, repeat:Infinity }}
      >
        {active ? '💥 NOW!' : '...'}
      </motion.button>
    </div>
  )
}

// Babble — click words in order
function BabbleGame({ mini, setMini }: { mini: Extract<MiniGame,{type:'babble'}>; setMini: (m:any)=>void }) {
  const [idx, setIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(8)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(t); if(!done){setDone(true); mini.onFail()} return 0 }
      return t - 1
    }), 1000)
    return () => clearInterval(t)
  }, [done])

  const hit = () => {
    if (done) return
    const next = idx + 1
    if (next >= mini.words.length) { setDone(true); mini.onSuccess() }
    else setIdx(next)
  }

  return (
    <div className="mini-box">
      <p className="mini-title">🍼 TOTLAPAN — click each word as it appears!</p>
      <p className="mini-sub">Time: {timeLeft}s</p>
      <div className="mini-babble-word">
        <motion.span key={idx} initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}}>
          {mini.words[idx]}
        </motion.span>
      </div>
      <p className="mini-sub">{idx+1} / {mini.words.length}</p>
      <motion.button className="mini-rta-btn mini-rta-active" onClick={hit} whileTap={{scale:0.9}}>
        TAP! 🍼
      </motion.button>
    </div>
  )
}

// Ferrari — assemble parts
function FerrariGame({ mini }: { mini: Extract<MiniGame,{type:'ferrari'}> }) {
  const [assembled, setAssembled] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(t); if(!done){setDone(true); mini.onFail()} return 0 }
      return t - 1
    }), 1000)
    return () => clearInterval(t)
  }, [done])

  const attach = (part: string) => {
    if (done || assembled.includes(part)) return
    const next = [...assembled, part]
    setAssembled(next)
    if (next.length === mini.parts.length) { setDone(true); mini.onSuccess() }
  }

  return (
    <div className="mini-box">
      <p className="mini-title">🏎️ SF90 — Build the Ferrari! ({timeLeft}s)</p>
      <p className="mini-sub">Tap each part to assemble:</p>
      <div className="mini-parts-grid">
        {mini.parts.map(p => (
          <motion.button key={p}
            className={`mini-part-btn ${assembled.includes(p)?'mini-part-done':''}`}
            onClick={() => attach(p)}
            whileTap={{scale:0.9}}
          >
            {assembled.includes(p) ? '✅ ' : ''}{p}
          </motion.button>
        ))}
      </div>
      <div className="mini-progress-bar-bg">
        <div className="mini-progress-bar-fill" style={{ width:`${(assembled.length/mini.parts.length)*100}%` }} />
      </div>
    </div>
  )
}

// Guitar duel — alternate L/R hits
function GuitarGame({ mini }: { mini: Extract<MiniGame,{type:'guitar'}> }) {
  const [side, setSide] = useState<'L'|'R'>('L')
  const [hits, setHits] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [done, setDone] = useState(false)
  const total = mini.total

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(t); if(!done){setDone(true); mini.onFail()} return 0 }
      return t - 1
    }), 1000)
    return () => clearInterval(t)
  }, [done])

  const hit = (s: 'L'|'R') => {
    if (done || s !== side) return
    const next = hits + 1
    setHits(next)
    setSide(s === 'L' ? 'R' : 'L')
    if (next >= total) { setDone(true); mini.onSuccess() }
  }

  return (
    <div className="mini-box">
      <p className="mini-title">🎸 GITAUR GOONING — alternate L & R! ({timeLeft}s)</p>
      <p className="mini-sub">{hits}/{total} hits — next: <strong>{side}</strong></p>
      <div className="mini-guitar-btns">
        <motion.button className={`mini-guitar-btn ${side==='L'?'guitar-active':''}`}
          onClick={() => hit('L')} whileTap={{scale:0.9}}>🎸 L</motion.button>
        <motion.button className={`mini-guitar-btn ${side==='R'?'guitar-active':''}`}
          onClick={() => hit('R')} whileTap={{scale:0.9}}>🎸 R</motion.button>
      </div>
      <div className="mini-progress-bar-bg">
        <div className="mini-progress-bar-fill" style={{ width:`${(hits/total)*100}%`, background:'#ffd700' }} />
      </div>
    </div>
  )
}

// Sharmana — click at the right moment
function SharmanaGame({ mini }: { mini: Extract<MiniGame,{type:'sharmana'}> }) {
  const [active, setActive] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const delay = 600 + Math.random() * 1200
    const t = setTimeout(() => setActive(true), delay)
    const kill = setTimeout(() => { if(!done){setDone(true); mini.onFail()} }, delay + 700)
    return () => { clearTimeout(t); clearTimeout(kill) }
  }, [])

  return (
    <div className="mini-box">
      <p className="mini-title">🫣 SHARMANA — click when he appears!</p>
      <p className="mini-sub">{active ? '👀 THERE HE IS!' : '🫣 hiding...'}</p>
      <motion.button
        className={`mini-rta-btn ${active?'mini-rta-active':''}`}
        onClick={() => { if(active&&!done){setDone(true); mini.onSuccess()} }}
        animate={active?{scale:[1,1.2,1]}:{}}
        transition={{duration:0.3,repeat:Infinity}}
      >
        {active ? '🫣 CATCH HIM!' : '...'}
      </motion.button>
    </div>
  )
}
