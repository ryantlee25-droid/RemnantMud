// ============================================================
// gameEngine.ts — Central game dispatcher
// Pure class, no React. All side effects are async Supabase calls.
// Action handlers live in lib/actions/*.
// ============================================================

import type {
  Action,
  GameState,
  GameMessage,
  Player,
  PlayerLedger,
  Room,
  Stat,
  StatBlock,
  TimeOfDay,
  QuantityConfig,
  FactionType,
  CharacterClass,
  SpawnedNPC,
} from '@/types/game'
import { CLASS_DEFINITIONS } from '@/types/game'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { getRoom, markVisited, persistWorld } from '@/lib/world'
import { getInventory } from '@/lib/inventory'
import { ALL_ROOMS } from '@/data/rooms/index'
import { quantityRoll, computePressure, pressureModifier } from '@/lib/spawn'
import type { EngineCore } from '@/lib/actions/types'
import { handleMove, handleLook, exitsLine, npcsLine, enemiesLine } from '@/lib/actions/movement'
import { handleAttack, handleFlee } from '@/lib/actions/combat'
import { handleTake, handleDrop, handleEquip, handleUnequip, handleUse, handleStash, handleUnstash, handleStashList, handleRead, handleJournal } from '@/lib/actions/items'
import { handleTalk, handleSearch, handleRep, handleQuests } from '@/lib/actions/social'
import { handleStats, handleInventory, handleHelp } from '@/lib/actions/system'
import { handleExamineExtra } from '@/lib/actions/examine'
import { handleRest, handleCamp, handleDrink } from '@/lib/actions/survival'

// Alias for gameEngine internal use
function rollQuantity(q: QuantityConfig): number {
  return quantityRoll(q)
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'narrative'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

function systemMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'system' }
}

function combatMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'combat' }
}

// 20 actions per period; cycles dawn → day → dusk → night → dawn
function computeTimeOfDay(actionsTaken: number): TimeOfDay {
  const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night']
  return TIMES[Math.floor(actionsTaken / 20) % 4]!
}

/** Public accessor for time-of-day — used by action handlers. */
export function getTimeOfDay(actionsTaken: number): TimeOfDay {
  return computeTimeOfDay(actionsTaken)
}

// ------------------------------------------------------------
// GameEngine
// ------------------------------------------------------------

export class GameEngine implements EngineCore {
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

  _setState(partial: Partial<GameState>): void {
    this.state = { ...this.state, ...partial }
    for (const l of this.listeners) l(this.state)
  }

  _appendMessages(messages: GameMessage[]): void {
    let newLog = [...this.state.log, ...messages]
    if (newLog.length > 500) {
      newLog = newLog.slice(-500)
    }
    this._setState({ log: newLog })
  }

  // ----------------------------------------------------------
  // Runtime room population
  // ----------------------------------------------------------

  _applyPopulation(room: Room): Room {
    const timeOfDay = computeTimeOfDay(this.state.player?.actionsTaken ?? 0)
    const cycle = this.state.player?.cycle ?? 1
    const pressure = computePressure(cycle)
    const actionsTakenNow = this.state.player?.actionsTaken ?? 0

    // --- W-4: Enemy defeat persistence constants ---
    const ENEMY_RESPAWN_ACTIONS = 160 // 8 time periods
    const roomCleared = room.flags.room_cleared
    const clearedAt = room.flags.room_cleared_at
    const enemiesRestored = !roomCleared ||
      (typeof clearedAt === 'number' && actionsTakenNow - clearedAt >= ENEMY_RESPAWN_ACTIONS)

    // --- Hollow encounter spawns ---
    // safeRest rooms suppress random Hollow encounters entirely
    // Start with static enemies from room data (parallel to NPCs and items).
    // Suppress all enemies (static + dynamic) while room is cleared and hasn't respawned.
    const enemyIds: string[] = enemiesRestored ? [...room.enemies] : []
    if (room.hollowEncounter && enemiesRestored && !room.flags.safeRest && !room.flags.noCombat) {
      const { baseChance, timeModifier, threatPool } = room.hollowEncounter
      const timeMod = timeModifier[timeOfDay] ?? 1.0
      const pressMod = pressureModifier(pressure)
      const finalChance = Math.min(baseChance * timeMod * pressMod, 0.95)

      if (Math.random() < finalChance && threatPool.length > 0) {
        const total = threatPool.reduce((s, e) => s + e.weight, 0)
        let r = Math.random() * total
        for (const entry of threatPool) {
          r -= entry.weight
          if (r <= 0) {
            const count = rollQuantity(entry.quantity)
            for (let i = 0; i < count; i++) enemyIds.push(entry.type)
            break
          }
        }
      }
    }

    // --- W-2: NPC spawns with activity + disposition rolling ---
    const npcIds: string[] = [...room.npcs]
    const rolledNpcs: SpawnedNPC[] = []
    if (room.npcSpawns) {
      for (const entry of room.npcSpawns) {
        if (Math.random() < entry.spawnChance) {
          npcIds.push(entry.npcId)

          // Roll activity (filtered by current time of day)
          let activity = 'is here'
          if (entry.activityPool && entry.activityPool.length > 0) {
            const filtered = entry.activityPool.filter(
              e => !e.timeRestrict || e.timeRestrict.includes(timeOfDay)
            )
            const pool = filtered.length > 0 ? filtered : entry.activityPool
            const total = pool.reduce((s, e) => s + e.weight, 0)
            let r = Math.random() * total
            for (const a of pool) {
              r -= a.weight
              if (r <= 0) { activity = a.desc; break }
            }
          }

          // Roll disposition
          let disposition: SpawnedNPC['disposition'] = 'neutral'
          if (entry.dispositionRoll) {
            const dr = entry.dispositionRoll
            const dPool: Array<{ key: SpawnedNPC['disposition']; weight: number }> = []
            if (dr.friendly) dPool.push({ key: 'friendly', weight: dr.friendly })
            if (dr.neutral)  dPool.push({ key: 'neutral',  weight: dr.neutral  })
            if (dr.wary)     dPool.push({ key: 'wary',     weight: dr.wary     })
            if (dr.hostile)  dPool.push({ key: 'hostile',  weight: dr.hostile  })
            if (dPool.length > 0) {
              const total = dPool.reduce((s, e) => s + e.weight, 0)
              let r = Math.random() * total
              for (const p of dPool) {
                r -= p.weight
                if (r <= 0) { disposition = p.key; break }
              }
            }
          }

          rolledNpcs.push({ npcId: entry.npcId, activity, disposition })
        }
      }
    }

    // --- W-3: Item spawns with depletion check ---
    const ITEM_RESPAWN_ACTIONS = 80 // 4 time periods
    const itemIds: string[] = [...room.items]
    if (room.itemSpawns) {
      for (const entry of room.itemSpawns) {
        // Skip if depleted and respawn timer hasn't elapsed
        const depletedFlag = room.flags[`depleted_${entry.entityId}`]
        if (depletedFlag) {
          const depletedAt = room.flags[`depleted_${entry.entityId}_at`]
          if (typeof depletedAt !== 'number' || actionsTakenNow - depletedAt < ITEM_RESPAWN_ACTIONS) {
            continue
          }
        }
        const timeMod = entry.timeModifier?.[timeOfDay] ?? 1.0
        const finalChance = Math.min(entry.spawnChance * timeMod, 0.95)
        if (Math.random() < finalChance) {
          const count = rollQuantity(entry.quantity)
          for (let i = 0; i < count; i++) itemIds.push(entry.entityId)
        }
      }
    }

    if (!room.hollowEncounter && !room.npcSpawns && !room.itemSpawns) {
      return room
    }

    return {
      ...room,
      items: itemIds,
      enemies: enemyIds,
      npcs: [...new Set(npcIds)],
      population: {
        items: [],
        enemyIds,
        npcs: rolledNpcs,
        ambientLines: [],
      },
    }
  }

  // ----------------------------------------------------------
  // Save player position + HP to Supabase
  // ----------------------------------------------------------

  /** Pick the time-appropriate room description. */
  private _getRoomDescriptionForTime(room: Room, actionsTaken: number): string {
    const tod = computeTimeOfDay(actionsTaken)
    if (tod === 'night' && room.descriptionNight) return room.descriptionNight
    if (tod === 'dawn' && room.descriptionDawn) return room.descriptionDawn
    if (tod === 'dusk' && room.descriptionDusk) return room.descriptionDusk
    return room.description
  }

  // ----------------------------------------------------------
  // Save player position + HP to Supabase
  // ----------------------------------------------------------

  async _savePlayer(): Promise<void> {
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
  // Player death
  // ----------------------------------------------------------

  async _handlePlayerDeath(): Promise<void> {
    const { player } = this.state
    if (!player) return

    this._appendMessages([
      msg('The world goes dark. You are still.', 'combat'),
      systemMsg('...'),
    ])

    const updatedPlayer: Player = { ...player, hp: 0, isDead: true }
    this._setState({ player: updatedPlayer, combatState: null, playerDead: true })

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

  // ----------------------------------------------------------
  // Character creation
  // ----------------------------------------------------------

  async createCharacter(
    name: string,
    stats: StatBlock,
    characterClass: import('@/types/game').CharacterClass,
    personalLoss?: { type: import('@/types/game').PersonalLossType; detail?: string }
  ): Promise<void> {
    this._setState({ loading: true })

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
    const seed = Math.floor(Math.random() * 2_147_483_647)
    const rooms = ALL_ROOMS
    const devOverrideRoom = process.env.NEXT_PUBLIC_DEV_START_ROOM
    const startRoomId = (devOverrideRoom && rooms.some(r => r.id === devOverrideRoom))
      ? devOverrideRoom
      : rooms[0]!.id

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
      faction_reputation: {},
      quest_flags: {},
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
      factionReputation: {},
      questFlags: {},
    }

    const rawStartRoom = await getRoom(startRoomId, user.id)
    if (!rawStartRoom) throw new Error('Start room not found after world generation')
    const startRoom = this._applyPopulation(rawStartRoom)

    const classFlavorLines: Record<CharacterClass, string> = {
      enforcer: "Your hands remember what to do. They've always been better at this than your head.",
      scout: "First thing: check the exits. Second thing: check them again.",
      wraith: "Nobody saw you come in. That's exactly how you like it.",
      shepherd: "You note the wounded first. Then the dying. Then everybody else.",
      reclaimer: "Something in here is still useful. It's always something.",
      warden: "The terrain reads like a sentence. You already know the last word.",
      broker: "Everyone here wants something. The question is who's most honest about it.",
    }

    this._setState({
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
        msg(this._getRoomDescriptionForTime(startRoom, 0)),
        msg(classFlavorLines[characterClass]),
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
    this._setState({ loading: true })

    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      this._setState({ loading: false })
      throw new Error(`Failed to load player: ${error.message}`)
    }

    if (!data) {
      this._setState({ loading: false })
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
      faction_reputation: Partial<Record<FactionType, number>> | null
      quest_flags: Record<string, boolean | number> | null
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
      factionReputation: (row.faction_reputation as Partial<Record<FactionType, number>>) ?? {},
      questFlags: (row.quest_flags as Record<string, boolean | number>) ?? {},
    }

    const [rawCurrentRoom, inventory] = await Promise.all([
      getRoom(player.currentRoomId, userId),
      getInventory(userId),
    ])

    if (!rawCurrentRoom) {
      this._setState({ loading: false })
      throw new Error('Current room not found')
    }

    const currentRoom = this._applyPopulation(rawCurrentRoom)

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

    this._setState({
      player,
      currentRoom,
      inventory,
      combatState: null,
      loading: false,
      initialized: true,
      ledger,
      log: [
        systemMsg(`Welcome back, ${player.name}.`),
        msg(currentRoom.visited ? currentRoom.shortDescription : this._getRoomDescriptionForTime(currentRoom, player.actionsTaken)),
        msg(exitsLine(currentRoom)),
        ...npcsLine(currentRoom) ? [msg(npcsLine(currentRoom))] : [],
        ...enemiesLine(currentRoom) ? [combatMsg(enemiesLine(currentRoom))] : [],
      ],
    })

    return true
  }

  // ----------------------------------------------------------
  // Rebirth
  // ----------------------------------------------------------

  async rebirthCharacter(): Promise<void> {
    const { player } = this.state
    if (!player) return

    this._setState({ loading: true })
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
    const pressure = computePressure(newCycle)

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
        current_room_id: 'cr_01_approach',
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
      this._setState({ loading: false })
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

    this._setState({ loading: true })
    const supabase = createSupabaseBrowserClient()

    const newCycle = (player.cycle ?? 1) + 1
    const newTotalDeaths = (player.totalDeaths ?? 0) + 1
    const pressure = computePressure(newCycle)
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
        current_room_id: 'cr_01_approach',
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
      this._setState({ loading: false })
      throw new Error('Failed to reload player after rebirth')
    }
  }

  // ----------------------------------------------------------
  // Faction reputation
  // ----------------------------------------------------------

  private static readonly REPUTATION_LABELS: Record<number, string> = {
    [-3]: 'Hunted',
    [-2]: 'Hostile',
    [-1]: 'Wary',
    [0]: 'Unknown',
    [1]: 'Recognized',
    [2]: 'Trusted',
    [3]: 'Blooded',
  }

  async adjustReputation(faction: FactionType, delta: number): Promise<void> {
    const { player } = this.state
    if (!player) return

    const oldRep = (player.factionReputation ?? {})[faction] ?? 0
    const newRep = Math.max(-3, Math.min(3, oldRep + delta))
    if (newRep === oldRep) return

    const newFactionRep = { ...(player.factionReputation ?? {}), [faction]: newRep }
    const updatedPlayer: Player = { ...player, factionReputation: newFactionRep }
    this._setState({ player: updatedPlayer })

    // Persist
    const supabase = createSupabaseBrowserClient()
    await supabase
      .from('players')
      .update({ faction_reputation: newFactionRep })
      .eq('id', player.id)

    // Display name for the faction
    const FACTION_NAMES: Record<string, string> = {
      accord: 'the Accord',
      salters: 'the Salters',
      drifters: 'the Drifters',
      kindling: 'the Kindling',
      reclaimers: 'the Reclaimers',
      covenant_of_dusk: 'the Covenant of Dusk',
      red_court: 'the Red Court',
      ferals: 'the Ferals',
      lucid: 'the Lucid',
    }
    const fName = FACTION_NAMES[faction] ?? faction

    // Check if we crossed a threshold
    const oldLabel = GameEngine.REPUTATION_LABELS[oldRep] ?? 'Unknown'
    const newLabel = GameEngine.REPUTATION_LABELS[newRep] ?? 'Unknown'
    if (oldLabel !== newLabel) {
      this._appendMessages([msg(`${fName} now know you as ${newLabel}.`)])
    } else {
      this._appendMessages([msg(`Your standing with ${fName} shifts.`)])
    }
  }

  // ----------------------------------------------------------
  // Quest flags
  // ----------------------------------------------------------

  async setQuestFlag(flag: string, value: string | boolean | number): Promise<void> {
    const { player } = this.state
    if (!player) return

    const newFlags = { ...(player.questFlags ?? {}), [flag]: value }
    const updatedPlayer: Player = { ...player, questFlags: newFlags }
    this._setState({ player: updatedPlayer })

    const supabase = createSupabaseBrowserClient()
    await supabase
      .from('players')
      .update({ quest_flags: newFlags })
      .eq('id', player.id)
  }

  // ----------------------------------------------------------
  // Main dispatcher
  // ----------------------------------------------------------

  // Actions that advance in-world time (exclude meta/info commands)
  private static readonly TIME_ADVANCING_VERBS = new Set([
    'go', 'take', 'drop', 'attack', 'flee', 'talk', 'search', 'use', 'open', 'rest', 'camp', 'drink',
  ])

  async executeAction(action: Action): Promise<GameMessage[]> {
    const before = this.state.log.length

    switch (action.verb) {
      case 'go':       await handleMove(this, action.noun)
        break
      case 'look':          await handleLook(this, action.noun)
        break
      case 'examine':       await handleLook(this, action.noun)
        break
      case 'examine_extra': await handleExamineExtra(this, action.noun)
        break
      case 'take':     await handleTake(this, action.noun)
        break
      case 'drop':     await handleDrop(this, action.noun)
        break
      case 'equip':    await handleEquip(this, action.noun)
        break
      case 'unequip':  await handleUnequip(this, action.noun)
        break
      case 'attack':   await handleAttack(this, action.noun)
        break
      case 'flee':     await handleFlee(this)
        break
      case 'talk':     await handleTalk(this, action.noun)
        break
      case 'search':   await handleSearch(this)
        break
      case 'use':      await handleUse(this, action.noun)
        break
      case 'read':     await handleRead(this, action.noun)
        break
      case 'journal':  await handleJournal(this)
        break
      case 'stats':    await handleStats(this)
        break
      case 'inventory': await handleInventory(this)
        break
      case 'help':     await handleHelp(this)
        break
      case 'open':     this._appendMessages([msg("You try it. It doesn't budge.", 'narrative')])
        break
      case 'save':     await this._savePlayer()
                       this._appendMessages([systemMsg('Progress saved.')])
        break
      case 'quit':     this._appendMessages([systemMsg('Refresh the page to quit. Your progress is saved.')])
        break
      case 'stash':    if (action.noun === 'list') { await handleStashList(this) } else { await handleStash(this, action.noun) }
        break
      case 'unstash':  await handleUnstash(this, action.noun)
        break
      case 'rep':      await handleRep(this)
        break
      case 'quests':   await handleQuests(this)
        break
      case 'rest':     await handleRest(this)
        break
      case 'camp':     await handleCamp(this)
        break
      case 'drink':    await handleDrink(this)
        break
      default:         this._appendMessages([{ id: crypto.randomUUID(), text: `Unknown command. Type "help" for a list of commands.`, type: 'error' }])
    }

    // Advance in-world time for meaningful actions
    if (GameEngine.TIME_ADVANCING_VERBS.has(action.verb) && this.state.player) {
      const newCount = (this.state.player.actionsTaken ?? 0) + 1
      this._setState({ player: { ...this.state.player, actionsTaken: newCount } })
    }

    return this.state.log.slice(before)
  }
}
