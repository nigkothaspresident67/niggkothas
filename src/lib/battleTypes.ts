export type CharId = 'aaditya' | 'aatharva' | 'dhariya' | 'dweeb'

export interface Buff {
  id: string
  label: string
  icon: string
  atkMod?: number
  defMod?: number
  incomingDmgMod?: number
  lingering?: { dmg: number; interval: number; ticksLeft: number }
  turnsLeft?: number
  allMight?: boolean
}

export interface Fighter {
  id: CharId
  name: string
  emoji: string
  color: string
  hp: number
  maxHp: number
  def: number
  buffs: Buff[]
  debuffs: Buff[]
  loadedDih?: boolean
  numbnessActive?: boolean
  ultimateActive?: boolean
  allMightActive?: boolean
  fatJumpUsedTurn?: number
  yumUsedTurn?: number
  fakeJumpAvail?: boolean
}

export interface BattleLog {
  id: number
  text: string
  type: 'atk' | 'heal' | 'buff' | 'debuff' | 'system' | 'special'
}

export type BattlePhase =
  | 'select_player'
  | 'select_opponent'
  | 'battle'
  | 'victory'
  | 'defeat'

export type MiniGameType =
  | 'rta_babu'
  | 'rta_totlapan'
  | 'rta_sharmana'
  | 'sf90'
  | 'gitaur'
  | 'yum'
  | 'none'
