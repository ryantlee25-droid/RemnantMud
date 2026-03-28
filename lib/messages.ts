import type { GameMessage } from '@/types/game'

export function msg(text: string, type: GameMessage['type'] = 'narrative'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

export function systemMsg(text: string): GameMessage {
  return msg(text, 'system')
}

export function combatMsg(text: string): GameMessage {
  return msg(text, 'combat')
}

export function errorMsg(text: string): GameMessage {
  return msg(text, 'error')
}
