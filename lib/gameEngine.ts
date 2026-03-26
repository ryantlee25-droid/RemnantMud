// ============================================================
// gameEngine.ts — Central game dispatcher
// Pure class, no React. All side effects are async Supabase calls.
// ============================================================

import type {
  Action,
  GameState,
  GameMessage,
  Player,
  PlayerLedger,
  Room,
  CombatState,
  Stat,
  StatBlock,
  TimeOfDay,
} from '@/types/game'
import { CLASS_DEFINITIONS } from '@/types/game'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { getRoom, canMove, markVisited, updateRoomItems, updateRoomFlags, getExits } from '@/lib/world'
import { persistWorld } from '@/lib/world'
import {
  getInventory,
  addItem,
  removeItem,
  equipItem,
  unequipItem,
} from '@/lib/inventory'
import {
  startCombat,
  playerAttack,
  enemyAttack,
  flee as fleeCombat,
} from '@/lib/combat'
import { generateWorld, generateSeed } from '@/lib/worldGen'
import { getItem } from '@/data/items'
import { getEnemy } from '@/data/enemies'
import { getNPC, getRevenantDialogue } from '@/data/npcs'
import { statModifier } from '@/lib/dice'
import { populateRoom, computePressure } from '@/lib/spawn'
import { ZONE_TEMPLATES } from '@/data/roomTemplates'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'narrative'): GameMessage {
  return { text, type }
}

function systemMsg(text: string): GameMessage {
  return { text, type: 'system' }
}

function errorMsg(text: string): GameMessage {
  return { text, type: 'error' }
}

function combatMsg(text: string): GameMessage {
  return { text, type: 'combat' }
}

function statMod(n: number): string {
  if (n > 0) return `+${n}`
  return String(n)
}

// 20 actions per period; cycles dawn → day → dusk → night → dawn
function computeTimeOfDay(actionsTaken: number): TimeOfDay {
  const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night']
  return TIMES[Math.floor(actionsTaken / 20) % 4]!
}

function exitsLine(room: Room): string {
  const exits = getExits(room)
  if (exits.length === 0) return 'There are no obvious exits.'
  return `Exits: ${exits.map((e) => e.direction).join(', ')}.`
}

function itemsLine(room: Room): string {
  if (room.items.length === 0) return ''
  const names = room.items
    .map((id) => getItem(id)?.name ?? id)
    .join(', ')
  return `You see: ${names}.`
}

function npcsLine(room: Room): string {
  if (room.npcs.length === 0) return ''
  const names = room.npcs
    .map((id) => getNPC(id)?.name ?? id)
    .join(', ')
  return `${names} is here.`
}

function enemiesLine(room: Room): string {
  if (room.enemies.length === 0) return ''
  const names = room.enemies
    .map((id) => getEnemy(id)?.name ?? id)
    .join(', ')
  return `${names} lurks nearby.`
}

// ------------------------------------------------------------
// GameEngine
// ------------------------------------------------------------

export class GameEngine {
  private state: GameState = {
    player: null,
    currentRoom: null,
    inventory: [],
    combatState: null,
    log: [],
    loading: false,
    initialized: false,
    playerDead: false,
    ledger: null,
    stash: [],
  }

  private listeners: Array<(state: GameState) => void> = []

  // ----------------------------------------------------------
  // State subscription
  // ----------------------------------------------------------

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getState(): GameState {
    return this.state
  }

  private setState(partial: Partial<GameState>): void {
    this.state = { ...this.state, ...partial }
    for (const l of this.listeners) l(this.state)
  }

  private appendMessages(messages: GameMessage[]): void {
    this.setState({ log: [...this.state.log, ...messages] })
  }

  // ----------------------------------------------------------
  // Character creation
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // Runtime room population
  // ----------------------------------------------------------

  private applyPopulation(room: Room): Room {
    const template = ZONE_TEMPLATES[room.zone]
    if (!template?.spawnTable) return room

    const timeOfDay = computeTimeOfDay(this.state.player?.actionsTaken ?? 0)
    const cycle = this.state.player?.cycle ?? 1
    const pressure = computePressure(cycle)
    const populated = populateRoom(template.spawnTable, timeOfDay, 1.0, [], pressure)

    return {
      ...room,
      // Dynamic items replace the empty DB array
      items: populated.items.map((si) => si.itemId),
      enemies: populated.enemyIds,
      // Merge static NPCs (e.g. old_mae in start room) with dynamically spawned ones
      npcs: [...new Set([...room.npcs, ...populated.npcs.map((sn) => sn.npcId)])],
      population: populated,
    }
  }

  // ----------------------------------------------------------
  // Character creation
  // ----------------------------------------------------------

  async createCharacter(
    name: string,
    stats: StatBlock,
    characterClass: import('@/types/game').CharacterClass,
    personalLoss?: { type: import('@/types/game').PersonalLossType; detail?: string }
  ): Promise<void> {
    this.setState({ loading: true })

    // Validate stats against class definition
    const base = 2
    const allStats: Stat[] = ['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow']
    const classDef = CLASS_DEFINITIONS[characterClass]
    for (const s of allStats) {
      if (stats[s] < 2 || stats[s] > 8) throw new Error(`Stat ${s} out of range (2–8)`)
      const floor = base + (classDef.classBonus[s] ?? 0)
      if (stats[s] < floor) throw new Error(`${s} cannot be below class minimum of ${floor}`)
    }
    const totalBonus = allStats.reduce((sum, s) => sum + (stats[s] - base), 0)
    const expectedTotal = allStats.reduce((sum, s) => sum + (classDef.classBonus[s] ?? 0), 0) + classDef.freePoints
    if (totalBonus !== expectedTotal) throw new Error(`Point-buy total must be ${expectedTotal}, got ${totalBonus}`)

    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const maxHp = 8 + (stats.vigor - 2) * 2
    const seed = generateSeed()
    const rooms = generateWorld(seed)
    const startRoomId = rooms[0]!.id

    const playerRow = {
      id: user.id,
      name,
      character_class: characterClass,
      vigor: stats.vigor,
      grit: stats.grit,
      reflex: stats.reflex,
      wits: stats.wits,
      presence: stats.presence,
      shadow: stats.shadow,
      hp: maxHp,
      max_hp: maxHp,
      current_room_id: startRoomId,
      world_seed: seed,
      xp: 0,
      level: 1,
      actions_taken: 0,
      personal_loss_type: personalLoss?.type ?? null,
      personal_loss_detail: personalLoss?.detail ?? null,
      squirrel_name: null,  // set when player names the squirrel in-game
      cycle: 1,
      total_deaths: 0,
      is_dead: false,
    }

    const { error } = await supabase.from('players').insert(playerRow)
    if (error) throw new Error(`Failed to create character: ${error.message}`)

    // Create initial ledger
    await supabase.from('player_ledger').insert({
      player_id: user.id,
      world_seed: seed,
      current_cycle: 1,
      total_deaths: 0,
      pressure_level: 1,
    })

    await persistWorld(rooms, user.id, seed)

    const player: Player = {
      id: user.id,
      name,
      characterClass,
      vigor: stats.vigor,
      grit: stats.grit,
      reflex: stats.reflex,
      wits: stats.wits,
      presence: stats.presence,
      shadow: stats.shadow,
      hp: maxHp,
      maxHp,
      currentRoomId: startRoomId,
      worldSeed: seed,
      xp: 0,
      level: 1,
      actionsTaken: 0,
      cycle: 1,
      totalDeaths: 0,
      isDead: false,
    }

    const rawStartRoom = await getRoom(startRoomId, user.id)
    if (!rawStartRoom) throw new Error('Start room not found after world generation')
    const startRoom = this.applyPopulation(rawStartRoom)

    this.setState({
      player,
      currentRoom: startRoom,
      inventory: [],
      combatState: null,
      loading: false,
      initialized: true,
      ledger: null,
      stash: [],
      log: [
        systemMsg('Character created. The world stirs.'),
        msg(startRoom.description),
        msg(exitsLine(startRoom)),
        ...npcsLine(startRoom) ? [msg(npcsLine(startRoom))] : [],
      ],
    })

    await markVisited(startRoomId, user.id)
  }

  // ----------------------------------------------------------
  // Load existing player
  // ----------------------------------------------------------

  async loadPlayer(userId: string): Promise<boolean> {
    this.setState({ loading: true })

    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      this.setState({ loading: false })
      throw new Error(`Failed to load player: ${error.message}`)
    }

    if (!data) {
      this.setState({ loading: false })
      return false
    }

    const row = data as {
      id: string
      name: string
      character_class: import('@/types/game').CharacterClass
      vigor: number
      grit: number
      reflex: number
      wits: number
      presence: number
      shadow: number
      hp: number
      max_hp: number
      current_room_id: string
      world_seed: number
      xp: number
      level: number
      actions_taken: number | null
      personal_loss_type: import('@/types/game').PersonalLossType | null
      personal_loss_detail: string | null
      squirrel_name: 'Chippy' | 'Stumpy' | null
      cycle: number | null
      total_deaths: number | null
      is_dead: boolean | null
    }

    const player: Player = {
      id: row.id,
      name: row.name,
      characterClass: row.character_class,
      vigor: row.vigor,
      grit: row.grit,
      reflex: row.reflex,
      wits: row.wits,
      presence: row.presence,
      shadow: row.shadow,
      hp: row.hp,
      maxHp: row.max_hp,
      currentRoomId: row.current_room_id,
      worldSeed: row.world_seed,
      xp: row.xp,
      level: row.level,
      actionsTaken: row.actions_taken ?? 0,
      personalLossType: row.personal_loss_type ?? undefined,
      personalLossDetail: row.personal_loss_detail ?? undefined,
      squirrelName: row.squirrel_name ?? undefined,
      cycle: row.cycle ?? 1,
      totalDeaths: row.total_deaths ?? 0,
      isDead: row.is_dead ?? false,
    }

    const [rawCurrentRoom, inventory] = await Promise.all([
      getRoom(player.currentRoomId, userId),
      getInventory(userId),
    ])

    if (!rawCurrentRoom) {
      this.setState({ loading: false })
      throw new Error('Current room not found')
    }

    const currentRoom = this.applyPopulation(rawCurrentRoom)

    // Load ledger if it exists
    const { data: ledgerRow } = await supabase
      .from('player_ledger')
      .select('*')
      .eq('player_id', userId)
      .maybeSingle()

    const ledger: PlayerLedger | null = ledgerRow ? {
      playerId: ledgerRow.player_id,
      worldSeed: ledgerRow.world_seed,
      currentCycle: ledgerRow.current_cycle,
      totalDeaths: ledgerRow.total_deaths,
      pressureLevel: ledgerRow.pressure_level,
      discoveredRoomIds: Array.isArray(ledgerRow.discovered_room_ids) ? ledgerRow.discovered_room_ids : [],
      squirrelAlive: ledgerRow.squirrel_alive,
      squirrelTrust: ledgerRow.squirrel_trust,
      squirrelCyclesKnown: ledgerRow.squirrel_cycles_known,
      squirrelName: ledgerRow.squirrel_name ?? undefined,
    } : null

    // Phase 5: faction memory rates would be loaded here from player_faction_memory table
    // and applied to faction reputation scores on rebirth. Placeholder until faction system exists.

    this.setState({
      player,
      currentRoom,
      inventory,
      combatState: null,
      loading: false,
      initialized: true,
      ledger,
      log: [
        systemMsg(`Welcome back, ${player.name}.`),
        msg(currentRoom.visited ? currentRoom.shortDescription : currentRoom.description),
        msg(exitsLine(currentRoom)),
        ...npcsLine(currentRoom) ? [msg(npcsLine(currentRoom))] : [],
        ...enemiesLine(currentRoom) ? [combatMsg(enemiesLine(currentRoom))] : [],
      ],
    })

    return true
  }

  // ----------------------------------------------------------
  // Save player position + HP to Supabase
  // ----------------------------------------------------------

  private async savePlayer(): Promise<void> {
    const { player } = this.state
    if (!player) return
    const supabase = createSupabaseBrowserClient()
    await supabase
      .from('players')
      .update({
        hp: player.hp,
        current_room_id: player.currentRoomId,
        xp: player.xp,
        level: player.level,
        actions_taken: player.actionsTaken ?? 0,
      })
      .eq('id', player.id)
  }

  // ----------------------------------------------------------
  // Main dispatcher
  // ----------------------------------------------------------

  // Actions that advance in-world time (exclude meta/info commands)
  private static readonly TIME_ADVANCING_VERBS = new Set([
    'go', 'take', 'drop', 'attack', 'flee', 'talk', 'search', 'use', 'open',
  ])

  async executeAction(action: Action): Promise<GameMessage[]> {
    const before = this.state.log.length

    switch (action.verb) {
      case 'go':       await this.handleMove(action.noun)
        break
      case 'look':     await this.handleLook(action.noun)
        break
      case 'examine':  await this.handleLook(action.noun)
        break
      case 'take':     await this.handleTake(action.noun)
        break
      case 'drop':     await this.handleDrop(action.noun)
        break
      case 'equip':    await this.handleEquip(action.noun)
        break
      case 'unequip':  await this.handleUnequip(action.noun)
        break
      case 'attack':   await this.handleAttack(action.noun)
        break
      case 'flee':     await this.handleFlee()
        break
      case 'talk':     await this.handleTalk(action.noun)
        break
      case 'search':   await this.handleSearch()
        break
      case 'use':      await this.handleUse(action.noun)
        break
      case 'stats':    await this.handleStats()
        break
      case 'inventory': await this.handleInventory()
        break
      case 'help':     await this.handleHelp()
        break
      case 'open':     this.appendMessages([msg("You try it. It doesn't budge.", 'narrative')])
        break
      case 'save':     await this.savePlayer()
                       this.appendMessages([{ text: 'Progress saved.', type: 'system' }])
        break
      case 'quit':     this.appendMessages([{ text: 'Refresh the page to quit. Your progress is saved.', type: 'system' }])
        break
      case 'stash':    if (action.noun === 'list') { await this.handleStashList() } else { await this.handleStash(action.noun) }
        break
      case 'unstash':  await this.handleUnstash(action.noun)
        break
      default:         this.appendMessages([errorMsg(`Unknown command. Type "help" for a list of commands.`)])
    }

    // Advance in-world time for meaningful actions
    if (GameEngine.TIME_ADVANCING_VERBS.has(action.verb) && this.state.player) {
      const newCount = (this.state.player.actionsTaken ?? 0) + 1
      this.setState({ player: { ...this.state.player, actionsTaken: newCount } })
    }

    return this.state.log.slice(before)
  }

  // ----------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------

  private async handleMove(direction: string | undefined): Promise<void> {
    const { player, currentRoom, combatState } = this.state
    if (!player || !currentRoom) return

    if (combatState?.active) {
      this.appendMessages([errorMsg('You cannot flee this way while in combat. Use "flee" instead.')])
      return
    }

    if (!direction) {
      this.appendMessages([errorMsg('Which direction?')])
      return
    }

    if (!canMove(currentRoom, direction)) {
      this.appendMessages([errorMsg(`You can't go ${direction} from here.`)])
      return
    }

    const nextRoomId = currentRoom.exits[direction as keyof typeof currentRoom.exits]
    if (!nextRoomId) {
      this.appendMessages([errorMsg(`No exit to the ${direction}.`)])
      return
    }

    const rawNextRoom = await getRoom(nextRoomId, player.id)
    if (!rawNextRoom) {
      this.appendMessages([errorMsg('That path leads nowhere.')])
      return
    }

    const nextRoom = this.applyPopulation(rawNextRoom)
    const updatedPlayer: Player = { ...player, currentRoomId: nextRoomId }
    this.setState({ player: updatedPlayer, currentRoom: nextRoom })

    const messages: GameMessage[] = []

    if (!nextRoom.visited) {
      messages.push(msg(nextRoom.description))
      await markVisited(nextRoomId, player.id)
    } else {
      messages.push(msg(nextRoom.shortDescription))
    }

    messages.push(msg(exitsLine(nextRoom)))
    if (npcsLine(nextRoom)) messages.push(msg(npcsLine(nextRoom)))
    if (enemiesLine(nextRoom)) messages.push(combatMsg(enemiesLine(nextRoom)))
    if (itemsLine(nextRoom)) messages.push(msg(itemsLine(nextRoom)))

    // Memory bleeds — triggered at Cycle 4+, 5% base chance
    const playerCycle = this.state.player?.cycle ?? 1
    if (playerCycle >= 4 && Math.random() < 0.05) {
      const bleeds = [
        'A fragment: this corridor, different light. You were here before. You died here.',
        'For a moment you know exactly what is behind the next door. The feeling passes.',
        'Someone is standing where you are standing. You blink and they are gone.',
        'The smell hits you first — specific, wrong. A memory from a cycle you can barely reach.',
        'You have walked this exact path before. Not in this life.',
        'A sound: your name, in a voice you no longer remember the face of.',
        'The scar on your arm throbs. You died near here once. The virus remembers.',
        'Déjà vu, but worse — you know it is real.',
      ]
      const bleed = bleeds[Math.floor(Math.random() * bleeds.length)]!
      messages.push(msg(`[${bleed}]`, 'narrative'))
    }

    this.appendMessages(messages)
    await this.savePlayer()
  }

  private async handleLook(target: string | undefined): Promise<void> {
    const { currentRoom, combatState } = this.state
    if (!currentRoom) return

    if (target) {
      // Try to examine a specific thing
      const targetLower = target.toLowerCase()

      // Check enemies
      const enemyId = currentRoom.enemies.find((id) => {
        const e = getEnemy(id)
        return e && e.name.toLowerCase().includes(targetLower)
      })
      if (enemyId) {
        const enemy = getEnemy(enemyId)!
        const hpDisplay = combatState?.active && combatState.enemy.id === enemyId
          ? ` [${combatState.enemyHp}/${enemy.maxHp} HP]`
          : ''
        this.appendMessages([msg(`${enemy.name}${hpDisplay}: ${enemy.description}`)])
        return
      }

      // Check items in room
      const itemId = currentRoom.items.find((id) => {
        const it = getItem(id)
        return it && it.name.toLowerCase().includes(targetLower)
      })
      if (itemId) {
        const item = getItem(itemId)!
        this.appendMessages([msg(`${item.name}: ${item.description}`)])
        return
      }

      // Check inventory items
      const invItem = this.state.inventory.find((ii) =>
        ii.item.name.toLowerCase().includes(targetLower)
      )
      if (invItem) {
        this.appendMessages([msg(`${invItem.item.name}: ${invItem.item.description}`)])
        return
      }

      // Check NPCs
      const npcId = currentRoom.npcs.find((id) => {
        const n = getNPC(id)
        return n && n.name.toLowerCase().includes(targetLower)
      })
      if (npcId) {
        const npc = getNPC(npcId)!
        this.appendMessages([msg(`${npc.name}: ${npc.description}`)])
        return
      }

      this.appendMessages([errorMsg(`You don't see that here.`)])
      return
    }

    // General look
    const messages: GameMessage[] = [
      msg(currentRoom.description),
      msg(exitsLine(currentRoom)),
    ]
    if (itemsLine(currentRoom)) messages.push(msg(itemsLine(currentRoom)))
    if (npcsLine(currentRoom)) messages.push(msg(npcsLine(currentRoom)))
    if (enemiesLine(currentRoom)) messages.push(combatMsg(enemiesLine(currentRoom)))

    this.appendMessages(messages)
  }

  private async handleTake(noun: string | undefined): Promise<void> {
    const { player, currentRoom } = this.state
    if (!player || !currentRoom) return

    if (!noun) {
      this.appendMessages([errorMsg('Take what?')])
      return
    }

    const nounLower = noun.toLowerCase()
    const itemId = currentRoom.items.find((id) => {
      const it = getItem(id)
      return it && it.name.toLowerCase().includes(nounLower)
    })

    if (!itemId) {
      this.appendMessages([errorMsg(`You don't see that here.`)])
      return
    }

    const item = getItem(itemId)!
    const newItems = currentRoom.items.filter((id) => id !== itemId)

    // Optimistic update
    const updatedRoom: Room = { ...currentRoom, items: newItems }
    this.setState({ currentRoom: updatedRoom })

    this.appendMessages([msg(`You pick up the ${item.name}.`, 'system')])

    await Promise.all([
      addItem(player.id, itemId),
      updateRoomItems(currentRoom.id, player.id, newItems),
    ])

    const inventory = await getInventory(player.id)
    this.setState({ inventory })
  }

  private async handleDrop(noun: string | undefined): Promise<void> {
    const { player, currentRoom, inventory } = this.state
    if (!player || !currentRoom) return

    if (!noun) {
      this.appendMessages([errorMsg('Drop what?')])
      return
    }

    const nounLower = noun.toLowerCase()
    const invItem = inventory.find((ii) =>
      ii.item.name.toLowerCase().includes(nounLower)
    )

    if (!invItem) {
      this.appendMessages([errorMsg(`You don't have that.`)])
      return
    }

    const newItems = [...currentRoom.items, invItem.itemId]
    const updatedRoom: Room = { ...currentRoom, items: newItems }
    this.setState({ currentRoom: updatedRoom })

    this.appendMessages([msg(`You drop the ${invItem.item.name}.`, 'system')])

    await Promise.all([
      removeItem(player.id, invItem.itemId),
      updateRoomItems(currentRoom.id, player.id, newItems),
    ])

    const updatedInventory = await getInventory(player.id)
    this.setState({ inventory: updatedInventory })
  }

  private async handleEquip(noun: string | undefined): Promise<void> {
    const { player, inventory } = this.state
    if (!player) return

    if (!noun) {
      this.appendMessages([errorMsg('Equip what?')])
      return
    }

    const nounLower = noun.toLowerCase()
    const invItem = inventory.find((ii) =>
      ii.item.name.toLowerCase().includes(nounLower)
    )

    if (!invItem) {
      this.appendMessages([errorMsg(`You don't have that.`)])
      return
    }

    if (invItem.item.type !== 'weapon' && invItem.item.type !== 'armor') {
      this.appendMessages([errorMsg(`You can't equip that.`)])
      return
    }

    await equipItem(player.id, invItem.itemId)
    const updatedInventory = await getInventory(player.id)
    this.setState({ inventory: updatedInventory })
    this.appendMessages([systemMsg(`You equip the ${invItem.item.name}.`)])
  }

  private async handleUnequip(noun: string | undefined): Promise<void> {
    const { player, inventory } = this.state
    if (!player) return

    if (!noun) {
      this.appendMessages([errorMsg('Unequip what?')])
      return
    }

    const nounLower = noun.toLowerCase()
    const invItem = inventory.find((ii) =>
      ii.item.name.toLowerCase().includes(nounLower) && ii.equipped
    )

    if (!invItem) {
      this.appendMessages([errorMsg(`That item is not equipped.`)])
      return
    }

    await unequipItem(player.id, invItem.itemId)
    const updatedInventory = await getInventory(player.id)
    this.setState({ inventory: updatedInventory })
    this.appendMessages([systemMsg(`You remove the ${invItem.item.name}.`)])
  }

  private async handleAttack(noun: string | undefined): Promise<void> {
    const { player, currentRoom, combatState, inventory } = this.state
    if (!player || !currentRoom) return

    // If already in combat, attack the current enemy
    if (combatState?.active) {
      await this.doAttackRound()
      return
    }

    // Start combat
    if (currentRoom.enemies.length === 0) {
      this.appendMessages([errorMsg('There is nothing to attack here.')])
      return
    }

    let targetId: string | undefined
    if (noun) {
      const nounLower = noun.toLowerCase()
      targetId = currentRoom.enemies.find((id) => {
        const e = getEnemy(id)
        return e && e.name.toLowerCase().includes(nounLower)
      })
    } else {
      targetId = currentRoom.enemies[0]
    }

    if (!targetId) {
      this.appendMessages([errorMsg(`You don't see that enemy here.`)])
      return
    }

    const enemyTemplate = getEnemy(targetId)
    if (!enemyTemplate) {
      this.appendMessages([errorMsg('Unknown enemy.')])
      return
    }

    // Get equipped weapon
    const equippedWeapon = inventory.find((ii) => ii.equipped && ii.item.type === 'weapon')

    // Clone enemy with fresh HP
    const enemy = { ...enemyTemplate }

    const newCombatState = startCombat(player, enemy)
    this.setState({ combatState: newCombatState })

    const initMsg = newCombatState.playerGoesFirst
      ? `Combat begins. You face the ${enemy.name}. You move first.`
      : `Combat begins. You face the ${enemy.name}. It moves first.`
    this.appendMessages([combatMsg(initMsg)])

    if (!newCombatState.playerGoesFirst) {
      // Enemy gets first attack
      const { damage, messages, newState } = enemyAttack(player, newCombatState)
      this.appendMessages(messages)

      const newHp = Math.max(0, player.hp - damage)
      const updatedPlayer = { ...player, hp: newHp }
      this.setState({ player: updatedPlayer, combatState: newState })

      if (newHp <= 0) {
        await this.handlePlayerDeath()
        return
      }
    }

    // Display weapon hint
    if (equippedWeapon) {
      this.appendMessages([systemMsg(`Fighting with ${equippedWeapon.item.name}.`)])
    }

  }

  private async doAttackRound(): Promise<void> {
    const { player, currentRoom, combatState, inventory } = this.state
    if (!player || !currentRoom || !combatState) return

    const equippedWeapon = inventory.find((ii) => ii.equipped && ii.item.type === 'weapon')
    const equippedArmor = inventory.find((ii) => ii.equipped && ii.item.type === 'armor')
    const armorDefense = equippedArmor?.item.defense ?? 0

    // Player attacks — use equipped weapon's damage range, or bare-hands fallback
    const playerDamageRange: [number, number] = equippedWeapon?.item.damage
      ? [1, equippedWeapon.item.damage]
      : [1, 3]
    const { result: playerResult, newState: afterPlayer } = playerAttack(player, combatState, playerDamageRange)
    this.appendMessages(playerResult.messages)
    this.setState({ combatState: afterPlayer })

    if (playerResult.enemyDefeated) {
      // Award XP, drop loot, remove enemy from room
      const xpGained = combatState.enemy.xp
      const updatedPlayer: Player = { ...player, xp: player.xp + xpGained }
      const newEnemies = currentRoom.enemies.filter((id) => id !== combatState.enemy.id)
      const updatedRoom: Room = { ...currentRoom, enemies: newEnemies }

      this.appendMessages([systemMsg(`You gain ${xpGained} XP.`)])
      this.setState({
        player: updatedPlayer,
        currentRoom: updatedRoom,
        combatState: null,
      })

      // Add loot to room
      if (playerResult.loot && playerResult.loot.length > 0) {
        const newItems = [...updatedRoom.items, ...playerResult.loot]
        const roomWithLoot: Room = { ...updatedRoom, items: newItems }
        this.setState({ currentRoom: roomWithLoot })
        const lootNames = playerResult.loot.map((id) => getItem(id)?.name ?? id).join(', ')
        this.appendMessages([msg(`The ${combatState.enemy.name} dropped: ${lootNames}.`)])
        await updateRoomItems(currentRoom.id, player.id, newItems)
      }

      await this.savePlayer()
      return
    }

    // Enemy attacks back
    const { damage: rawDamage, messages: eMsgs, newState: afterEnemy } = enemyAttack(player, afterPlayer)
    // Apply armor reduction
    const actualDamage = Math.max(0, rawDamage - armorDefense)

    // Rewrite last damage message to reflect armor
    const adjustedMsgs = eMsgs.map((m, i) => {
      if (i === eMsgs.length - 1 && actualDamage !== rawDamage && rawDamage > 0) {
        return { ...m, text: m.text.replace(`[${rawDamage} damage]`, `[${actualDamage} damage after armor]`) }
      }
      return m
    })

    this.appendMessages(adjustedMsgs)

    const newHp = Math.max(0, player.hp - actualDamage)
    const updatedPlayer: Player = { ...player, hp: newHp }
    this.setState({ player: updatedPlayer, combatState: afterEnemy })

    if (newHp <= 0) {
      await this.handlePlayerDeath()
      return
    }

    // Show HP hint
    this.appendMessages([systemMsg(`HP: ${newHp}/${player.maxHp}`)])

    // Weapon stat bonus note
    if (equippedWeapon?.item.statBonus) {
      void equippedWeapon // stats applied at creation time in future
    }

    await this.savePlayer()
  }

  private async handlePlayerDeath(): Promise<void> {
    const { player } = this.state
    if (!player) return

    this.appendMessages([
      msg('The world goes dark. You are still.', 'combat'),
      systemMsg('...'),
    ])

    const updatedPlayer: Player = { ...player, hp: 0, isDead: true }
    this.setState({ player: updatedPlayer, combatState: null, playerDead: true })

    // Persist death to DB
    const supabase = createSupabaseBrowserClient()
    await supabase
      .from('players')
      .update({
        hp: 0,
        is_dead: true,
        total_deaths: (player.totalDeaths ?? 0) + 1,
      })
      .eq('id', player.id)
  }

  async rebirthCharacter(): Promise<void> {
    const { player } = this.state
    if (!player) return

    this.setState({ loading: true })
    const supabase = createSupabaseBrowserClient()

    // Compute echo stats: floor(previousStat * 0.7), min = class floor from CLASS_DEFINITIONS
    const allStats: Stat[] = ['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow']
    const classDef = CLASS_DEFINITIONS[player.characterClass]
    const base = 2
    const echoStats: StatBlock = {} as StatBlock
    for (const s of allStats) {
      const classFloor = base + (classDef.classBonus[s] ?? 0)
      const echoed = Math.max(classFloor, Math.floor(player[s] * 0.7))
      echoStats[s] = echoed
    }

    const newCycle = (player.cycle ?? 1) + 1
    const newTotalDeaths = (player.totalDeaths ?? 0) + 1
    const newHp = 8 + (echoStats.vigor - 2) * 2
    const pressure = Math.min(5, Math.floor(newCycle / 3) + 1)

    // Reset player row
    await supabase
      .from('players')
      .update({
        hp: newHp,
        max_hp: newHp,
        is_dead: false,
        cycle: newCycle,
        total_deaths: newTotalDeaths,
        ...echoStats,
        // Reset position to first shelter room
        // NOTE: currentRoomId stays as-is — player starts at their current location
        // A future improvement would reset to the shelter start room
        xp: 0,
        level: 1,
        actions_taken: 0,
      })
      .eq('id', player.id)

    // Update or create player_ledger
    const { data: ledgerData } = await supabase
      .from('player_ledger')
      .select('*')
      .eq('player_id', player.id)
      .maybeSingle()

    if (ledgerData) {
      await supabase
        .from('player_ledger')
        .update({
          current_cycle: newCycle,
          total_deaths: newTotalDeaths,
          pressure_level: pressure,
        })
        .eq('player_id', player.id)
    } else {
      await supabase
        .from('player_ledger')
        .insert({
          player_id: player.id,
          world_seed: player.worldSeed,
          current_cycle: newCycle,
          total_deaths: newTotalDeaths,
          pressure_level: pressure,
        })
    }

    // Clear inventory (items are lost on death)
    await supabase.from('player_inventory').delete().eq('player_id', player.id)

    // Reload the player fresh
    const found = await this.loadPlayer(player.id)
    if (!found) {
      this.setState({ loading: false })
      throw new Error('Failed to reload player after rebirth')
    }
  }

  // ----------------------------------------------------------
  // Utility: echo stats for rebirth
  // ----------------------------------------------------------

  getEchoStats(): StatBlock | null {
    const { player } = this.state
    if (!player) return null
    const allStats: Stat[] = ['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow']
    const classDef = CLASS_DEFINITIONS[player.characterClass]
    const base = 2
    const echo: StatBlock = {} as StatBlock
    for (const s of allStats) {
      const classFloor = base + (classDef.classBonus[s] ?? 0)
      echo[s] = Math.max(classFloor, Math.floor(player[s] * 0.7))
    }
    return echo
  }

  // Rebirth with player-chosen stats (used when CharacterCreation is shown post-death)
  async rebirthWithStats(
    name: string,
    stats: StatBlock,
    characterClass: import('@/types/game').CharacterClass,
    personalLoss?: { type: import('@/types/game').PersonalLossType; detail?: string },
  ): Promise<void> {
    const { player } = this.state
    if (!player) return

    this.setState({ loading: true })
    const supabase = createSupabaseBrowserClient()

    const newCycle = (player.cycle ?? 1) + 1
    const newTotalDeaths = (player.totalDeaths ?? 0) + 1
    const pressure = Math.min(5, Math.floor(newCycle / 3) + 1)
    const newHp = 8 + (stats.vigor - 2) * 2

    await supabase
      .from('players')
      .update({
        name,
        character_class: characterClass,
        ...stats,
        hp: newHp,
        max_hp: newHp,
        is_dead: false,
        cycle: newCycle,
        total_deaths: newTotalDeaths,
        xp: 0,
        level: 1,
        actions_taken: 0,
        personal_loss_type: personalLoss?.type ?? null,
        personal_loss_detail: personalLoss?.detail ?? null,
      })
      .eq('id', player.id)

    // Upsert ledger
    const { data: ledgerData } = await supabase
      .from('player_ledger')
      .select('id')
      .eq('player_id', player.id)
      .maybeSingle()

    if (ledgerData) {
      await supabase
        .from('player_ledger')
        .update({ current_cycle: newCycle, total_deaths: newTotalDeaths, pressure_level: pressure })
        .eq('player_id', player.id)
    } else {
      await supabase.from('player_ledger').insert({
        player_id: player.id,
        world_seed: player.worldSeed,
        current_cycle: newCycle,
        total_deaths: newTotalDeaths,
        pressure_level: pressure,
      })
    }

    await supabase.from('player_inventory').delete().eq('player_id', player.id)

    const found = await this.loadPlayer(player.id)
    if (!found) {
      this.setState({ loading: false })
      throw new Error('Failed to reload player after rebirth')
    }
  }

  private async handleFlee(): Promise<void> {
    const { player, combatState } = this.state
    if (!player) return

    if (!combatState?.active) {
      this.appendMessages([errorMsg('You are not in combat.')])
      return
    }

    const result = fleeCombat(player)
    this.appendMessages(result.messages)

    if (result.success) {
      this.setState({ combatState: null })
      await this.savePlayer()
    }
  }

  private async handleTalk(noun: string | undefined): Promise<void> {
    const { currentRoom } = this.state
    if (!currentRoom) return

    if (currentRoom.npcs.length === 0) {
      this.appendMessages([errorMsg('There is no one to talk to here.')])
      return
    }

    let npcId: string | undefined
    if (noun) {
      const nounLower = noun.toLowerCase()
      npcId = currentRoom.npcs.find((id) => {
        const n = getNPC(id)
        return n && n.name.toLowerCase().includes(nounLower)
      })
    } else {
      npcId = currentRoom.npcs[0]
    }

    if (!npcId) {
      this.appendMessages([errorMsg(`You don't see that person here.`)])
      return
    }

    const npc = getNPC(npcId)
    if (!npc) {
      this.appendMessages([errorMsg('That person has nothing to say.')])
      return
    }

    const cycle = this.state.player?.cycle ?? 1
    const revenantLine = getRevenantDialogue(npcId, cycle)
    const dialogue = revenantLine ?? npc.dialogue

    this.appendMessages([
      msg(`${npc.name} says: "${dialogue}"`),
    ])
  }

  private async handleSearch(): Promise<void> {
    const { currentRoom, player } = this.state
    if (!currentRoom || !player) return

    if (currentRoom.flags['searched']) {
      this.appendMessages([systemMsg('You have already searched this area.')])
      return
    }

    this.appendMessages([systemMsg('You search the area carefully...')])

    // Nothing extra for now — items are already in the room
    if (currentRoom.items.length > 0) {
      this.appendMessages([msg(itemsLine(currentRoom))])
    } else {
      this.appendMessages([msg('You find nothing of note.')])
    }

    // Mark the room as searched so the guard above fires on future attempts
    await updateRoomFlags(currentRoom.id, player.id, { searched: true })
    const updatedRoom: Room = { ...currentRoom, flags: { ...currentRoom.flags, searched: true } }
    this.setState({ currentRoom: updatedRoom })
  }

  private async handleUse(noun: string | undefined): Promise<void> {
    const { player, inventory } = this.state
    if (!player) return

    if (!noun) {
      this.appendMessages([errorMsg('Use what?')])
      return
    }

    const nounLower = noun.toLowerCase()
    const invItem = inventory.find((ii) =>
      ii.item.name.toLowerCase().includes(nounLower)
    )

    if (!invItem) {
      this.appendMessages([errorMsg(`You don't have that.`)])
      return
    }

    if (invItem.item.type !== 'consumable') {
      this.appendMessages([errorMsg(`You can't use the ${invItem.item.name} like that.`)])
      return
    }

    const healing = invItem.item.healing ?? 0
    const newHp = Math.min(player.maxHp, player.hp + healing)
    const updatedPlayer: Player = { ...player, hp: newHp }

    // Optimistic update
    this.setState({ player: updatedPlayer })
    this.appendMessages([
      msg(`You use the ${invItem.item.name}. +${healing} HP. [${newHp}/${player.maxHp}]`, 'system'),
    ])

    await removeItem(player.id, invItem.itemId)
    const updatedInventory = await getInventory(player.id)
    this.setState({ inventory: updatedInventory })
    await this.savePlayer()
  }

  private async handleStats(): Promise<void> {
    const { player } = this.state
    if (!player) return

    const lines = [
      `Name: ${player.name}  Class: ${player.characterClass}  Cycle: ${player.cycle ?? 1}  Level: ${player.level}  XP: ${player.xp}`,
      `HP: ${player.hp}/${player.maxHp}`,
      `Vigor: ${player.vigor} (${statMod(statModifier(player.vigor))})  ` +
      `Grit: ${player.grit} (${statMod(statModifier(player.grit))})  ` +
      `Reflex: ${player.reflex} (${statMod(statModifier(player.reflex))})`,
      `Wits: ${player.wits} (${statMod(statModifier(player.wits))})  ` +
      `Presence: ${player.presence} (${statMod(statModifier(player.presence))})  ` +
      `Shadow: ${player.shadow} (${statMod(statModifier(player.shadow))})`,
    ]

    this.appendMessages(lines.map((l) => systemMsg(l)))

    const cycle = player.cycle ?? 1
    if (cycle >= 2) {
      const scarLine = cycle >= 13
        ? 'Revenant marks: The viral lines beneath your skin glow faintly in the dark. You have lost count of how many times you have come back.'
        : cycle >= 8
        ? 'Revenant marks: Luminescent scarring traces old wounds. Named NPCs recognize what you are.'
        : cycle >= 4
        ? 'Revenant marks: Faint lines cross older scars. People who knew you notice something wrong.'
        : 'Revenant marks: Thin lines, barely visible. You came back once. You could again.'
      this.appendMessages([systemMsg(scarLine)])
    }
  }

  private async handleInventory(): Promise<void> {
    const { inventory } = this.state

    if (inventory.length === 0) {
      this.appendMessages([systemMsg('You are carrying nothing.')])
      return
    }

    const lines = inventory.map((ii) => {
      const equipped = ii.equipped ? ' [equipped]' : ''
      const qty = ii.quantity > 1 ? ` x${ii.quantity}` : ''
      return `${ii.item.name}${qty}${equipped}`
    })

    this.appendMessages([
      systemMsg('Inventory:'),
      ...lines.map((l) => systemMsg(`  ${l}`)),
    ])
  }

  private async handleStash(noun: string | undefined): Promise<void> {
    const { player, inventory } = this.state
    if (!player) return

    if (!noun) {
      this.appendMessages([errorMsg('Stash what?')])
      return
    }

    const nounLower = noun.toLowerCase()
    const invItem = inventory.find((ii) =>
      ii.item.name.toLowerCase().includes(nounLower)
    )

    if (!invItem) {
      this.appendMessages([errorMsg(`You don't have that.`)])
      return
    }

    const supabase = createSupabaseBrowserClient()

    // Check stash capacity
    const { count } = await supabase
      .from('player_stash')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', player.id)

    if ((count ?? 0) >= 20) {
      this.appendMessages([errorMsg('Your stash is full. (20/20)')])
      return
    }

    // Check if item already in stash
    const { data: existing } = await supabase
      .from('player_stash')
      .select('*')
      .eq('player_id', player.id)
      .eq('item_id', invItem.itemId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('player_stash')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('player_stash')
        .insert({ player_id: player.id, item_id: invItem.itemId, quantity: 1 })
    }

    await removeItem(player.id, invItem.itemId)

    const item = invItem.item
    this.appendMessages([systemMsg(`You stash the ${item.name}. It will survive your death.`)])

    const updatedInventory = await getInventory(player.id)
    this.setState({ inventory: updatedInventory })
  }

  private async handleUnstash(noun: string | undefined): Promise<void> {
    const { player } = this.state
    if (!player) return

    if (!noun) {
      this.appendMessages([errorMsg('Unstash what?')])
      return
    }

    const supabase = createSupabaseBrowserClient()

    const { data: stashRows } = await supabase
      .from('player_stash')
      .select('*')
      .eq('player_id', player.id)

    const nounLower = noun.toLowerCase()
    const matchingRow = (stashRows ?? []).find((row: { item_id: string; quantity: number; id: string }) => {
      const item = getItem(row.item_id)
      return item && item.name.toLowerCase().includes(nounLower)
    })

    if (!matchingRow) {
      this.appendMessages([errorMsg(`That's not in your stash.`)])
      return
    }

    const item = getItem(matchingRow.item_id)!

    if (matchingRow.quantity > 1) {
      await supabase
        .from('player_stash')
        .update({ quantity: matchingRow.quantity - 1 })
        .eq('id', matchingRow.id)
    } else {
      await supabase
        .from('player_stash')
        .delete()
        .eq('id', matchingRow.id)
    }

    await addItem(player.id, matchingRow.item_id)

    this.appendMessages([systemMsg(`You retrieve the ${item.name} from your stash.`)])

    const updatedInventory = await getInventory(player.id)
    this.setState({ inventory: updatedInventory })
  }

  private async handleStashList(): Promise<void> {
    const { player } = this.state
    if (!player) return

    const supabase = createSupabaseBrowserClient()

    const { data: stashRows } = await supabase
      .from('player_stash')
      .select('*')
      .eq('player_id', player.id)

    const rows = stashRows ?? []

    if (rows.length === 0) {
      this.appendMessages([systemMsg('Your stash is empty.')])
      return
    }

    const lines: GameMessage[] = [systemMsg(`Stash (${rows.length}/20):`)]
    for (const row of rows as Array<{ item_id: string; quantity: number }>) {
      const item = getItem(row.item_id)
      const name = item?.name ?? row.item_id
      const qty = row.quantity > 1 ? ` x${row.quantity}` : ''
      lines.push(systemMsg(`  ${name}${qty}`))
    }

    this.appendMessages(lines)
  }

  private async handleHelp(): Promise<void> {
    const lines = [
      'Commands:',
      '  north/south/east/west/up/down — move',
      '  look [thing]                  — look around or examine something',
      '  take [item]                   — pick up an item',
      '  drop [item]                   — drop an item',
      '  equip [item]                  — equip a weapon or armor',
      '  unequip [item]                — remove equipped item',
      '  attack [enemy]                — start or continue combat',
      '  flee                          — attempt to flee combat',
      '  talk [person]                 — speak with an NPC',
      '  search                        — search the room',
      '  use [item]                    — use a consumable item',
      '  inventory / i                 — show inventory',
      '  stash [item]                  — stash an item for safekeeping across deaths',
      '  unstash [item]                — retrieve from stash',
      '  stats                         — show character stats',
      '  help / ?                      — show this message',
    ]

    this.appendMessages(lines.map((l) => systemMsg(l)))
  }
}
