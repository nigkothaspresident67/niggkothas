import type { Fighter, Buff, CharId } from './battleTypes'

export const BASE_HP = 100
export const BASE_DEF = 0

export const CHAR_META: Record<CharId, { name: string; emoji: string; color: string; stand: string }> = {
  aaditya:  { name: 'Aaditya',  emoji: '🎸', color: '#ff2d9b', stand: 'PINK FLOYD' },
  aatharva: { name: 'Aatharva', emoji: '🍼', color: '#b44fff', stand: 'BABY CHAOS' },
  dhariya:  { name: 'Dhariya',  emoji: '🥺', color: '#00d4ff', stand: 'SILENT RIYA' },
  dweeb:    { name: 'Dweeb',    emoji: '🤓', color: '#39ff14', stand: 'BIG DADDY' },
}

export function makeFighter(id: CharId): Fighter {
  return {
    id,
    name: CHAR_META[id].name,
    emoji: CHAR_META[id].emoji,
    color: CHAR_META[id].color,
    hp: BASE_HP, maxHp: BASE_HP, def: BASE_DEF,
    buffs: [], debuffs: [],
    loadedDih: false, numbnessActive: false,
    ultimateActive: false, allMightActive: false,
    fakeJumpAvail: false,
  }
}

export function applyDamage(target: Fighter, rawDmg: number): number {
  let dmg = rawDmg
  for (const b of target.buffs) {
    if (b.incomingDmgMod) dmg = dmg * (1 + b.incomingDmgMod)
  }
  if (target.allMightActive) dmg *= 2
  dmg = Math.max(0, dmg - target.def * 0.4)
  target.hp = Math.max(0, target.hp - dmg)
  return Math.round(dmg)
}

export function applyHeal(target: Fighter, amt: number): number {
  const before = target.hp
  target.hp = Math.min(target.maxHp, target.hp + amt)
  return Math.round(target.hp - before)
}

export function getAtkMult(f: Fighter): number {
  let m = 1
  for (const b of f.buffs) if (b.atkMod) m += b.atkMod
  return m
}

export function tickLingeringDebuffs(f: Fighter): { logs: string[] } {
  const logs: string[] = []
  for (const b of f.debuffs) {
    if (b.lingering && b.lingering.ticksLeft > 0) {
      const dmg = b.lingering.dmg
      if (dmg < 0) {
        f.hp = Math.min(f.maxHp, f.hp + Math.abs(dmg))
        logs.push(`💚 ${f.name} healed ${Math.abs(dmg)} from ${b.label}`)
      } else {
        f.hp = Math.max(0, f.hp - dmg)
        logs.push(`🩸 ${f.name} takes ${dmg} lingering from ${b.label}`)
      }
      b.lingering.ticksLeft--
    }
  }
  f.debuffs = f.debuffs.filter(b => !b.lingering || b.lingering.ticksLeft > 0)
  return { logs }
}

export function aiChooseSkill(ai: Fighter, player: Fighter, turnNum: number): number {
  if (ai.hp < 30 && ai.id === 'aatharva') return 2
  if (ai.hp < 35 && ai.id === 'dweeb' && (!ai.yumUsedTurn || turnNum - ai.yumUsedTurn >= 5)) return 2
  if (!ai.ultimateActive && turnNum >= 3) return 3
  return Math.floor(Math.random() * 3)
}
