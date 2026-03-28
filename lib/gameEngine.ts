// ============================================================
// gameEngine.ts — Central game dispatcher
// Pure class, no React. All side effects are async Supabase calls.
// Action handlers live in lib/actions/*.
// ============================================================

import { msg, systemMsg, combatMsg } from '@/lib/messages'
import type {
  Action,
  CycleSnapshot,
  EndingChoice,
  GameState,
  GameMessage,
  Player,
  PlayerLedger,
  Room,
  Stat,
  StashItem,
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
import { getItem } from '@/data/items'
import { ALL_ROOMS } from '@/data/rooms/index'
import { quantityRoll, computePressure, pressureModifier } from '@/lib/spawn'
import type { EngineCore } from '@/lib/actions/types'
import { handleMove, handleLook, exitsLine, npcsLine, enemiesLine, handleUnlock } from '@/lib/actions/movement'
import { handleAttack, handleFlee, handleDefend, handleWait, handleAnalyze, handleCombatUse } from '@/lib/actions/combat'
import { handleAbility } from '@/lib/abilities'
import { handleTake, handleDrop, handleEquip, handleUnequip, handleUse, handleStash, handleUnstash, handleStashList, handleRead, handleJournal } from '@/lib/actions/items'
import { handleTalk, handleSearch, handleRep, handleQuests, handleDialogueChoice, handleDialogueLeave, handleDialogueBlocked, handleGive } from '@/lib/actions/social'
import { handleStats, handleInventory, handleHelp, handleHint, handleBoost, handleTutorialHint } from '@/lib/actions/system'
import { handleExamineExtra, handleSmell, handleListen, handleTouch, handleExamineSpatial } from '@/lib/actions/examine'
import { handleRest, handleCamp, handleDrink } from '@/lib/actions/survival'
import { echoRetentionFactor } from '@/lib/fear'
import { handleTrade, handleBuy, handleSell } from '@/lib/actions/trade'
import { handleMap, handleTravel } from '@/lib/actions/travel'
import { handleCraft } from '@/lib/actions/craft'
import { attemptStealth } from '@/lib/stealth'
import { createCycleSnapshot, computeInheritedReputation } from '@/lib/echoes'
import { suggestVerb as parserSuggestVerb } from '@/lib/parser'

// ------------------------------------------------------------
// XP thresholds for level progression
// Index = level you're advancing TO (e.g. XP_THRESHOLDS[2] = 100 means level 2 requires 100 XP)
// ------------------------------------------------------------

export const XP_THRESHOLDS: Record<number, number> = {
  2: 50,      // was 100 — first level-up comes faster
  3: 150,     // was 250
  4: 350,     // was 500
  5: 600,     // was 850
  6: 1000,    // was 1300
  7: 1500,    // was 1900
  8: 2200,    // was 2700
  9: 3100,    // was 3800
  10: 4200,   // was 5000
}

/** Return the XP needed for the next level, or null if at max level. */
export function xpForNextLevel(currentLevel: number): number | null {
  return XP_THRESHOLDS[currentLevel + 1] ?? null
}

// Alias for gameEngine internal use
function rollQuantity(q: QuantityConfig): number {
  return quantityRoll(q)
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

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
// Unknown-command suggestion helper
// ------------------------------------------------------------

function suggestVerb(input: string): string | null {
  return parserSuggestVerb(input) ?? null
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
    roomsExplored: 0,
    endingTriggered: false,
    endingChoice: null,
    activeBuffs: [],
    pendingStatIncrease: false,
    weather: 'clear',
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
    if (newLog.length > 600) {
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

          rolledNpcs.push({ npcId: entry.npcId, activity, disposition, dialogueTree: entry.dialogueTree })
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
    const { error } = await supabase
      .from('players')
      .update({
        hp: player.hp,
        max_hp: player.maxHp,
        current_room_id: player.currentRoomId,
        xp: player.xp,
        level: player.level,
        actions_taken: player.actionsTaken ?? 0,
        vigor: player.vigor,
        grit: player.grit,
        reflex: player.reflex,
        wits: player.wits,
        presence: player.presence,
        shadow: player.shadow,
        faction_reputation: player.factionReputation ?? {},
        quest_flags: player.questFlags ?? {},
        active_buffs: JSON.stringify(this.state.activeBuffs ?? []),
        pending_stat_increase: this.state.pendingStatIncrease ?? false,
      })
      .eq('id', player.id)
    if (error) {
      console.error('Failed to save player:', error.message)
      this._appendMessages([systemMsg('Warning: Failed to save progress.')])
    }
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

    // Save cycle snapshot before wiping inventory
    const snapshot = createCycleSnapshot(player)
    const cycleHistory = [...(this.state.cycleHistory ?? []), snapshot]
    this._setState({ cycleHistory })

    // Persist death + cycle history to DB
    const supabase = createSupabaseBrowserClient()
    const { error: deathError } = await supabase
      .from('players')
      .update({
        hp: 0,
        is_dead: true,
        total_deaths: (player.totalDeaths ?? 0) + 1,
      })
      .eq('id', player.id)
    if (deathError) console.error('Failed to persist death:', deathError.message)

    const { error: ledgerError } = await supabase
      .from('player_ledger')
      .update({
        cycle_history: cycleHistory,
        discovered_enemies: this.state.ledger?.discoveredEnemies ?? [],
      })
      .eq('player_id', player.id)
    if (ledgerError) console.error('Failed to persist cycle history:', ledgerError.message)
  }

  // ----------------------------------------------------------
  // Level progression
  // ----------------------------------------------------------

  // Levels that grant a stat increase choice
  private static readonly STAT_INCREASE_LEVELS = new Set([3, 6, 9])

  _checkLevelUp(): void {
    const { player } = this.state
    if (!player) return

    let leveled = false
    let pendingStatIncrease = this.state.pendingStatIncrease ?? false
    let currentPlayer = { ...player }

    // Loop to handle multiple level-ups in one check
    while (currentPlayer.level < 10) {
      const threshold = XP_THRESHOLDS[currentPlayer.level + 1]
      if (threshold === undefined || currentPlayer.xp < threshold) break

      currentPlayer = {
        ...currentPlayer,
        level: currentPlayer.level + 1,
        maxHp: currentPlayer.maxHp + 2,
        hp: Math.min(currentPlayer.hp + 2, currentPlayer.maxHp + 2),
      }
      leveled = true

      this._appendMessages([
        systemMsg(`You reach Level ${currentPlayer.level}. Max HP increased to ${currentPlayer.maxHp}. (+2 HP healed)`),
      ])

      // Grant stat increase at milestone levels
      if (GameEngine.STAT_INCREASE_LEVELS.has(currentPlayer.level)) {
        pendingStatIncrease = true
        this._appendMessages([
          systemMsg(`LEVEL UP! You've reached level ${currentPlayer.level}. Choose a stat to increase: type 'boost [stat]'.`),
          systemMsg(`Options: vigor, grit, reflex, wits, presence, shadow`),
        ])
      }
    }

    if (leveled) {
      this._setState({ player: currentPlayer, pendingStatIncrease })
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
      discovered_enemies: [],
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
    await handleTutorialHint(this, 'first_room')
    if (startRoom.items.length > 0) await handleTutorialHint(this, 'first_item')
    if (startRoom.enemies.length > 0) await handleTutorialHint(this, 'first_enemy')
    if (startRoom.npcs.length > 0) await handleTutorialHint(this, 'first_npc')
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
      active_buffs: string | null
      pending_stat_increase: boolean | null
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

    // Parse cycle history from ledger
    const rawCycleHistory = ledgerRow?.cycle_history
    const parsedCycleHistory: CycleSnapshot[] = Array.isArray(rawCycleHistory) ? rawCycleHistory : []

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
      cycleHistory: parsedCycleHistory,
      discoveredEnemies: Array.isArray(ledgerRow.discovered_enemies) ? ledgerRow.discovered_enemies : [],
    } : null

    // Phase 5: faction memory rates would be loaded here from player_faction_memory table
    // and applied to faction reputation scores on rebirth. Placeholder until faction system exists.

    // Load stash (persists across death/rebirth)
    const { data: stashRows } = await supabase
      .from('player_stash')
      .select('*')
      .eq('player_id', userId)

    const stash: StashItem[] = (stashRows ?? [])
      .map((row: { id: string; player_id: string; item_id: string; quantity: number }) => {
        const item = getItem(row.item_id)
        if (!item) return null
        return {
          id: row.id,
          playerId: row.player_id,
          itemId: row.item_id,
          item,
          quantity: row.quantity,
        }
      })
      .filter((si: StashItem | null): si is StashItem => si !== null)

    // Count rooms already visited by this player
    const { count: visitedCount } = await supabase
      .from('generated_rooms')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', userId)
      .eq('visited', true)

    // Restore persisted buffs and pending stat increase
    const restoredBuffs = row.active_buffs ? JSON.parse(row.active_buffs) : []
    const restoredPending = row.pending_stat_increase ?? false

    this._setState({
      player,
      currentRoom,
      inventory,
      combatState: null,
      loading: false,
      initialized: true,
      ledger,
      stash,
      roomsExplored: visitedCount ?? 0,
      cycleHistory: parsedCycleHistory,
      activeBuffs: restoredBuffs,
      pendingStatIncrease: restoredPending,
      log: [
        systemMsg(`Welcome back, ${player.name}.`),
        msg(currentRoom.visited ? currentRoom.shortDescription : this._getRoomDescriptionForTime(currentRoom, player.actionsTaken)),
        msg(exitsLine(currentRoom)),
        ...npcsLine(currentRoom) ? [msg(npcsLine(currentRoom))] : [],
        ...enemiesLine(currentRoom) ? [combatMsg(enemiesLine(currentRoom))] : [],
      ],
    })

    // Restore ending state if player was mid-ending
    const endingFlag = player.questFlags?.ending_triggered
    if (endingFlag && typeof endingFlag === 'string') {
      this._setState({ endingTriggered: true, endingChoice: endingFlag as EndingChoice })
    }

    if (currentRoom.items.length > 0) await handleTutorialHint(this, 'first_item')
    if (currentRoom.enemies.length > 0) await handleTutorialHint(this, 'first_enemy')
    if (currentRoom.npcs.length > 0) await handleTutorialHint(this, 'first_npc')

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

    // Compute echo stats: floor(previousStat * retention), min = class floor from CLASS_DEFINITIONS
    // Higher grit = better stat retention on rebirth (base 0.7, up to 0.85 at grit 8)
    const allStats: Stat[] = ['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow']
    const classDef = CLASS_DEFINITIONS[player.characterClass]
    const base = 2
    const retention = echoRetentionFactor(player.grit)
    const echoStats: StatBlock = {} as StatBlock
    for (const s of allStats) {
      const classFloor = base + (classDef.classBonus[s] ?? 0)
      const echoed = Math.max(classFloor, Math.floor(player[s] * retention))
      echoStats[s] = echoed
    }

    const newCycle = (player.cycle ?? 1) + 1
    const newTotalDeaths = (player.totalDeaths ?? 0) + 1
    const newHp = 8 + (echoStats.vigor - 2) * 2
    const pressure = computePressure(newCycle)

    // Compute inherited faction reputation from cycle history
    const cycleHistory = this.state.cycleHistory ?? []
    const lastSnapshot = cycleHistory.length > 0 ? cycleHistory[cycleHistory.length - 1] : undefined
    const inheritedRep = lastSnapshot ? computeInheritedReputation(lastSnapshot) : {}
    const hasInheritedRep = Object.keys(inheritedRep).length > 0

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
        faction_reputation: inheritedRep,
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

    // Show echo message if inherited reputation was applied
    if (hasInheritedRep) {
      this._appendMessages([
        msg('Echoes of your previous life linger. Some factions remember you.', 'echo'),
      ])
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
    const retention = echoRetentionFactor(player.grit)
    const echo: StatBlock = {} as StatBlock
    for (const s of allStats) {
      const classFloor = base + (classDef.classBonus[s] ?? 0)
      echo[s] = Math.max(classFloor, Math.floor(player[s] * retention))
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

    // Compute inherited faction reputation from cycle history
    const cycleHistory = this.state.cycleHistory ?? []
    const lastSnapshot = cycleHistory.length > 0 ? cycleHistory[cycleHistory.length - 1] : undefined
    const inheritedRep = lastSnapshot ? computeInheritedReputation(lastSnapshot) : {}
    const hasInheritedRep = Object.keys(inheritedRep).length > 0

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
        faction_reputation: inheritedRep,
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
        .update({ current_cycle: newCycle, total_deaths: newTotalDeaths, pressure_level: pressure, discovered_enemies: this.state.ledger?.discoveredEnemies ?? [] })
        .eq('player_id', player.id)
    } else {
      await supabase.from('player_ledger').insert({
        player_id: player.id,
        world_seed: player.worldSeed,
        current_cycle: newCycle,
        total_deaths: newTotalDeaths,
        pressure_level: pressure,
        discovered_enemies: this.state.ledger?.discoveredEnemies ?? [],
      })
    }

    await supabase.from('player_inventory').delete().eq('player_id', player.id)

    const found = await this.loadPlayer(player.id)
    if (!found) {
      this._setState({ loading: false })
      throw new Error('Failed to reload player after rebirth')
    }

    // Show echo message if inherited reputation was applied
    if (hasInheritedRep) {
      this._appendMessages([
        msg('Echoes of your previous life linger. Some factions remember you.', 'echo'),
      ])
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

    // Presence modifier: on positive rep changes, presence above 5 grants a bonus
    let effectiveDelta = delta
    let presenceBonus = 0
    if (delta > 0) {
      presenceBonus = Math.floor((player.presence - 5) / 2)
      if (presenceBonus > 0) {
        effectiveDelta = delta + presenceBonus
      }
    }

    const oldRep = (player.factionReputation ?? {})[faction] ?? 0
    const newRep = Math.max(-3, Math.min(3, oldRep + effectiveDelta))
    if (newRep === oldRep) return

    const newFactionRep = { ...(player.factionReputation ?? {}), [faction]: newRep }
    const updatedPlayer: Player = { ...player, factionReputation: newFactionRep }
    this._setState({ player: updatedPlayer })

    // Persist
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('players')
      .update({ faction_reputation: newFactionRep })
      .eq('id', player.id)
    if (error) console.error('Failed to persist reputation:', error.message)

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
      const bonusNote = presenceBonus > 0 ? ` (Presence +${presenceBonus})` : ''
      this._appendMessages([msg(`${fName} now know you as ${newLabel}.${bonusNote}`)])
    } else {
      const bonusNote = presenceBonus > 0 ? ` (Presence +${presenceBonus})` : ''
      this._appendMessages([msg(`Your standing with ${fName} shifts.${bonusNote}`)])
    }
  }

  // ----------------------------------------------------------
  // Quest flags
  // ----------------------------------------------------------

  private static readonly VALID_ENDINGS: Set<string> = new Set(['cure', 'weapon', 'seal', 'throne'])

  async setQuestFlag(flag: string, value: string | boolean | number): Promise<void> {
    const { player } = this.state
    if (!player) return

    const newFlags = { ...(player.questFlags ?? {}), [flag]: value }
    const updatedPlayer: Player = { ...player, questFlags: newFlags }
    this._setState({ player: updatedPlayer })

    const supabase = createSupabaseBrowserClient()
    const { error: flagError } = await supabase
      .from('players')
      .update({ quest_flags: newFlags })
      .eq('id', player.id)
    if (flagError) console.error('Failed to persist quest flag:', flagError.message)

    // Detect ending trigger
    if (flag === 'charon_choice' && typeof value === 'string' && GameEngine.VALID_ENDINGS.has(value)) {
      const choice = value as EndingChoice

      // Save cycle snapshot with the ending choice
      const snapshot = createCycleSnapshot(player, choice)
      const cycleHistory = [...(this.state.cycleHistory ?? []), snapshot]
      this._setState({ cycleHistory })

      const supabase2 = createSupabaseBrowserClient()
      const { error: snapshotError } = await supabase2
        .from('player_ledger')
        .update({
          cycle_history: cycleHistory,
          discovered_enemies: this.state.ledger?.discoveredEnemies ?? [],
        })
        .eq('player_id', player.id)
      if (snapshotError) console.error('Failed to persist ending snapshot:', snapshotError.message)

      if (choice === 'seal') {
        // SEAL: facility self-destruct — show countdown, then auto-navigate to exit
        this._appendMessages([
          msg('FACILITY SELF-DESTRUCT INITIATED. FOUR MINUTES.', 'system'),
          msg('The building shudders. Dust falls from the ceiling. You need to move.', 'narrative'),
        ])

        // Brief delay, then auto-navigate to the exit and trigger ending
        setTimeout(async () => {
          try {
            // Move to scar_15_the_exit
            const exitRoom = await getRoom('scar_15_the_exit', player.id)
            if (exitRoom) {
              const populated = this._applyPopulation(exitRoom)
              this._setState({ currentRoom: populated })
              this._appendMessages([
                msg('You sprint up the emergency staircase as the charges begin to fire below you.', 'narrative'),
                msg(populated.description, 'narrative'),
              ])
              await markVisited('scar_15_the_exit', player.id)
            }

            // Trigger ending after reaching exit
            setTimeout(async () => {
              try {
                const supabase3 = createSupabaseBrowserClient()
                const { error: endError } = await supabase3
                  .from('players')
                  .update({ quest_flags: { ...player.questFlags, ending_triggered: choice } })
                  .eq('id', player.id)
                if (endError) console.error('Failed to persist ending:', endError.message)
                this._setState({ endingTriggered: true, endingChoice: choice })
              } catch (err) {
                console.error('Ending trigger failed:', err)
                this._setState({ endingTriggered: true, endingChoice: choice })
              }
            }, 2000)
          } catch (err) {
            console.error('SEAL sequence failed:', err)
            this._setState({ endingTriggered: true, endingChoice: choice })
          }
        }, 3000)
      } else {
        // CURE, WEAPON, THRONE: trigger ending directly after brief pause
        setTimeout(async () => {
          try {
            const supabase3 = createSupabaseBrowserClient()
            const { error: endError } = await supabase3
              .from('players')
              .update({ quest_flags: { ...player.questFlags, ending_triggered: choice } })
              .eq('id', player.id)
            if (endError) console.error('Failed to persist ending:', endError.message)
            this._setState({ endingTriggered: true, endingChoice: choice })
          } catch (err) {
            console.error('Ending trigger failed:', err)
            this._setState({ endingTriggered: true, endingChoice: choice })
          }
        }, 3000)
      }
    }
  }

  // ----------------------------------------------------------
  // Weather
  // ----------------------------------------------------------

  private static readonly WEATHER_MESSAGES: Record<string, string> = {
    clear: 'The clouds part. Pale sun.',
    overcast: 'The sky closes over, flat and grey.',
    rain: 'Rain begins to fall — thin, persistent, tasting of metal.',
    dust_storm: 'The wind picks up. Visibility drops. Dust gets in everything.',
    fog: 'Fog rolls in, swallowing the middle distance.',
  }

  private _rollWeather(): void {
    const prevWeather = this.state.weather
    const roll = Math.random()
    let newWeather: GameState['weather']
    if (roll < 0.4)       newWeather = 'clear'
    else if (roll < 0.6)  newWeather = 'overcast'
    else if (roll < 0.75) newWeather = 'rain'
    else if (roll < 0.9)  newWeather = 'fog'
    else                  newWeather = 'dust_storm'

    this._setState({ weather: newWeather })

    // Only narrate if weather actually changed
    if (newWeather !== prevWeather) {
      const weatherMsg = GameEngine.WEATHER_MESSAGES[newWeather]
      if (weatherMsg) {
        this._appendMessages([msg(weatherMsg)])
      }
    }
  }

  // ----------------------------------------------------------
  // Sneak handler
  // ----------------------------------------------------------

  async _handleSneak(direction: string | undefined): Promise<void> {
    const { player, currentRoom } = this.state
    if (!player || !currentRoom) return

    if (!direction) {
      this._appendMessages([{ id: crypto.randomUUID(), text: 'Sneak which direction?', type: 'error' }])
      return
    }

    // Check if enemies are present in the current or target room
    const hasEnemiesHere = currentRoom.enemies.length > 0

    // If no enemies nearby, just move normally
    if (!hasEnemiesHere) {
      await handleMove(this, direction)
      return
    }

    // Enemies present — attempt stealth check
    const result = attemptStealth(player, currentRoom)
    if (result.success) {
      // Move without triggering combat
      const prevEnemies = currentRoom.enemies
      const stealthRoom = { ...currentRoom, enemies: [] }
      this._setState({ currentRoom: stealthRoom })
      await handleMove(this, direction)
      // Restore enemies in the room we left (they didn't follow)
      if (this.state.currentRoom?.id !== currentRoom.id) {
        // Successfully moved — enemies stay behind
      } else {
        // Failed to move (exit blocked etc.), restore enemies
        this._setState({ currentRoom: { ...this.state.currentRoom!, enemies: prevEnemies } })
      }
      this._appendMessages([{ id: crypto.randomUUID(), text: result.message, type: 'system' }])
    } else {
      // Failed stealth — move normally (may trigger combat via handleMove)
      this._appendMessages([{ id: crypto.randomUUID(), text: result.message, type: 'system' }])
      await handleMove(this, direction)
    }
  }

  // ----------------------------------------------------------
  // Main dispatcher
  // ----------------------------------------------------------

  // Actions that advance in-world time (exclude meta/info commands)
  private static readonly TIME_ADVANCING_VERBS = new Set([
    'go', 'take', 'drop', 'attack', 'flee', 'talk', 'search', 'use', 'open', 'rest', 'camp', 'drink', 'buy', 'sell',
    'ability', 'defend', 'wait', 'analyze', 'equip', 'unequip',
    'craft', 'sneak', 'unlock', 'give', 'climb', 'swim',
  ])

  async executeAction(action: Action): Promise<GameMessage[]> {
    const before = this.state.log.length

    // Remind player of pending stat increase (don't block, just remind)
    if (this.state.pendingStatIncrease && action.verb !== 'boost' && action.verb !== 'help' && action.verb !== 'stats') {
      this._appendMessages([systemMsg("You have a stat increase pending. Type 'boost [stat]' to choose.")])
    }

    try {
    switch (action.verb) {
      case 'boost':    await handleBoost(this, action.noun)
        break
      case 'go':       await handleMove(this, action.noun)
        break
      case 'look':          await handleLook(this, action.noun)
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
      case 'ability':  await handleAbility(this)
        break
      case 'defend':   await handleDefend(this)
        break
      case 'wait':     await handleWait(this)
        break
      case 'analyze':  await handleAnalyze(this)
        break
      case 'talk':     await handleTalk(this, action.noun)
        break
      case 'search':   await handleSearch(this)
        break
      case 'use':
        if (this.state.combatState?.active) {
          await handleCombatUse(this, action.noun)
        } else {
          await handleUse(this, action.noun)
        }
        break
      case 'read':     await handleRead(this, action.noun)
        break
      case 'journal':  await handleJournal(this)
        break
      case 'stats':    await handleStats(this)
        break
      case 'inventory': await handleInventory(this)
        break
      case 'help':     await handleHelp(this, action.noun)
        break
      case 'smell':    await handleSmell(this, action.noun ?? '')
        break
      case 'listen':   await handleListen(this, action.noun ?? '')
        break
      case 'touch':    await handleTouch(this, action.noun ?? '')
        break
      case 'hint':     await handleHint(this)
        break
      case 'examine_spatial': await handleExamineSpatial(this, action.noun ?? '')
        break
      case 'attack_called': {
        const { combatState, player: attackPlayer } = this.state
        if (!combatState?.active || !attackPlayer) {
          this._appendMessages([{ id: crypto.randomUUID(), text: 'You are not in combat.', type: 'error' }])
          break
        }
        const nounTokens = (action.noun ?? '').split(/\s+/)
        const bodyPart = nounTokens[nounTokens.length - 1] ?? 'torso'
        const { playerCalledShot } = await import('@/lib/combat')
        const equipped = this.state.inventory.find(ii => ii.equipped && ii.item.type === 'weapon')
        const weaponTraits = (equipped?.item.weaponTraits ?? []) as string[]
        const calledResult = playerCalledShot(attackPlayer, combatState.enemy, bodyPart, combatState, weaponTraits)
        this._appendMessages(calledResult.messages)
        this._setState({ combatState: { ...combatState, ...calledResult.newState } })
        break
      }
      case 'open':     this._appendMessages([msg("You try it. It doesn't budge.", 'narrative')])
        break
      case 'save':     await this._savePlayer()
                       this._appendMessages([systemMsg('Progress saved.')])
        break
      case 'quit':     await this._savePlayer()
                       this._appendMessages([systemMsg('Progress saved. Refresh the page to return to the landing page.')])
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
      case 'trade':    await handleTrade(this, action.noun)
        break
      case 'buy':      await handleBuy(this, action.noun)
        break
      case 'sell':     await handleSell(this, action.noun)
        break
      case 'map':      await handleMap(this)
        break
      case 'travel':   await handleTravel(this, action.noun)
        break
      case 'craft':    await handleCraft(this, action.noun)
        break
      case 'give':     await handleGive(this, action.noun)
        break
      case 'unlock':   await handleUnlock(this, action.noun ?? '')
        break
      case 'sneak':    await this._handleSneak(action.noun)
        break
      case 'climb':    await handleMove(this, action.noun)
        break
      case 'swim':     await handleMove(this, action.noun)
        break
      case 'dialogue_choice':  await handleDialogueChoice(this, action.noun)
        break
      case 'dialogue_leave':   await handleDialogueLeave(this)
        break
      case 'dialogue_blocked': await handleDialogueBlocked(this)
        break
      default: {
        const suggestion = suggestVerb(action.raw.split(' ')[0] ?? '')
        if (suggestion) {
          this._appendMessages([{ id: crypto.randomUUID(), text: `Unknown command. Did you mean '${suggestion}'? Type 'help' for a list.`, type: 'error' }])
        } else {
          this._appendMessages([{ id: crypto.randomUUID(), text: `Unknown command. Type 'help' for a list of commands.`, type: 'error' }])
        }
      }
    }

    // Advance in-world time for meaningful actions
    if (GameEngine.TIME_ADVANCING_VERBS.has(action.verb) && this.state.player) {
      const oldCount = this.state.player.actionsTaken ?? 0
      const newCount = oldCount + 1
      this._setState({ player: { ...this.state.player, actionsTaken: newCount } })

      // Emit a narrative message when time-of-day shifts (every 20 actions)
      if (Math.floor(oldCount / 20) !== Math.floor(newCount / 20)) {
        const newTime = computeTimeOfDay(newCount)
        const transitionMessages: Record<TimeOfDay, string> = {
          day:   'The sun climbs. Light reaches into the shadows.',
          dusk:  'The light softens. Shadows lengthen.',
          night: 'Darkness falls. The world contracts to what you can hear.',
          dawn:  'A grey line appears on the horizon. Another day.',
        }
        this._appendMessages([msg(transitionMessages[newTime])])
        // Roll new weather on each time-of-day shift
        this._rollWeather()
      }

      // Expire temporary stat buffs
      const activeBuffs = this.state.activeBuffs ?? []
      if (activeBuffs.length > 0) {
        const expired: typeof activeBuffs = []
        const remaining: typeof activeBuffs = []
        for (const b of activeBuffs) {
          (newCount >= b.expiresAt ? expired : remaining).push(b)
        }
        if (expired.length > 0 && this.state.player) {
          let p = { ...this.state.player }
          const expiredDescs: string[] = []
          for (const buff of expired) {
            const key = buff.stat as keyof typeof p
            if (key in p && typeof p[key] === 'number') {
              p = { ...p, [key]: (p[key] as number) - buff.bonus }
              expiredDescs.push(buff.stat)
            }
          }
          this._setState({ player: p, activeBuffs: remaining })
          const statNames = [...new Set(expiredDescs)]
          const label = statNames.join(', ')
          this._appendMessages([msg(`The stim effect wears off. Your ${label} returns to normal.`)])
        }
      }
    }

    } catch (err) {
      console.error('Action failed:', err)
      this._appendMessages([systemMsg('Something went wrong. Try again.')])
    }

    return this.state.log.slice(before)
  }
}
