// ============================================================
// lib/actions/social.ts — handleTalk, handleSearch, handleRep, handleQuests
// ============================================================

import type { GameMessage, FactionType, Direction, Player, DialogueNode, DialogueBranch, CycleSnapshot } from '@/types/game'
import type { EngineCore } from './types'
import { getNPC, getRevenantDialogue } from '@/data/npcs'
import { findNpcTopic, getVisibleTopics, NPC_TOPICS } from '@/data/npcTopics'
import { DIALOGUE_TREES } from '@/data/dialogueTrees'
import { updateRoomFlags } from '@/lib/world'
import { itemsLine } from './movement'
import { getStatForSkill, getStatNameForSkill } from '@/lib/skillBonus'
import { rollCheck } from '@/lib/dice'
import { rt } from '@/lib/richText'
import { getItem } from '@/data/items'
import { removeItem, getInventory } from '@/lib/inventory'
import { msg, systemMsg, errorMsg } from '@/lib/messages'

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------

// ------------------------------------------------------------
// Dialogue tree helpers
// ------------------------------------------------------------

/**
 * Check whether a branch's gates are satisfied.
 * Returns { visible, passable, reason } where:
 * - visible: always true (we show locked branches dimmed)
 * - passable: whether the player can actually select this branch
 * - reason: text hint shown next to locked/gated branches
 */
function checkBranchGates(
  branch: DialogueBranch,
  player: Player,
  inventory: { itemId: string }[],
  cycleHistory?: CycleSnapshot[],
): { passable: boolean; reason?: string } {
  const flags = player.questFlags ?? {}
  const rep = player.factionReputation ?? {}

  if (branch.requiresFlag) {
    if (!flags[branch.requiresFlag]) {
      return { passable: false, reason: '(locked)' }
    }
  }

  if (branch.requiresRep) {
    const current = rep[branch.requiresRep.faction] ?? 0
    if (current < branch.requiresRep.min) {
      const factionName = branch.requiresRep.faction.replace(/_/g, ' ')
      return { passable: false, reason: `(requires: ${factionName} reputation +${branch.requiresRep.min})` }
    }
  }

  if (branch.requiresItem) {
    const hasItem = inventory.some(i => i.itemId === branch.requiresItem)
    if (!hasItem) {
      return { passable: false, reason: `(requires: ${branch.requiresItem})` }
    }
  }

  // Echo gates — require cycle history from previous lives
  const history = cycleHistory ?? []
  const lastSnapshot = history.length > 0 ? history[history.length - 1] : undefined

  if (branch.requiresCycleMin != null) {
    if ((player.cycle ?? 1) < branch.requiresCycleMin) {
      return { passable: false, reason: '(requires previous cycle history)' }
    }
  }

  if (branch.requiresPreviousRelationship) {
    const { npcId, relationship } = branch.requiresPreviousRelationship
    if (!lastSnapshot || lastSnapshot.npcRelationships[npcId] !== relationship) {
      return { passable: false, reason: '(requires previous cycle history)' }
    }
  }

  if (branch.requiresPreviousEnding) {
    if (!lastSnapshot || lastSnapshot.endingChoice !== branch.requiresPreviousEnding) {
      return { passable: false, reason: '(requires previous cycle history)' }
    }
  }

  if (branch.requiresPreviousQuest) {
    if (!lastSnapshot || !lastSnapshot.questsCompleted.includes(branch.requiresPreviousQuest)) {
      return { passable: false, reason: '(requires previous cycle history)' }
    }
  }

  // Skill checks are shown as requirement hints but are passable (roll happens on select)
  if (branch.skillCheck) {
    return { passable: true, reason: `(requires: ${branch.skillCheck.skill.replace(/_/g, ' ')} DC ${branch.skillCheck.dc})` }
  }

  return { passable: true }
}

/**
 * Build the display messages for a dialogue node including numbered branch choices.
 */
function buildNodeDisplay(
  node: DialogueNode,
  npcName: string,
  player: Player,
  inventory: { itemId: string }[],
  cycleHistory?: CycleSnapshot[],
): GameMessage[] {
  const messages: GameMessage[] = []

  // NPC speech
  messages.push(msg(`${rt.npc(node.speaker ?? npcName)}: "${node.text}"`))

  // Branch choices
  if (node.branches && node.branches.length > 0) {
    messages.push(msg(''))  // blank line separator
    for (let i = 0; i < node.branches.length; i++) {
      const branch = node.branches[i]!
      const { passable, reason } = checkBranchGates(branch, player, inventory, cycleHistory)
      const num = i + 1
      if (passable) {
        const hint = reason ? ` <keyword>${reason}</keyword>` : ''
        messages.push(systemMsg(`  [${rt.keyword(String(num))}] ${branch.label}${hint}`))
      } else {
        // Dimmed / locked — shown but not selectable
        messages.push(msg(`  [${num}] ${branch.label} ${reason ?? '(locked)'}`, 'echo'))
      }
    }
  }

  return messages
}

/**
 * Apply onEnter effects for a dialogue node (flags, items, rep).
 */
async function applyNodeEffects(engine: EngineCore, node: DialogueNode): Promise<void> {
  if (!node.onEnter) return

  const { player } = engine.getState()
  if (!player) return

  // Set quest flags
  if (node.onEnter.setFlag) {
    if (typeof node.onEnter.setFlag === 'string') {
      await engine.setQuestFlag(node.onEnter.setFlag, true)
    } else {
      for (const [flag, value] of Object.entries(node.onEnter.setFlag)) {
        await engine.setQuestFlag(flag, value)
      }
    }
  }

  // Grant reputation
  if (node.onEnter.grantRep) {
    await engine.adjustReputation(node.onEnter.grantRep.faction, node.onEnter.grantRep.delta)
  }

  // Grant items (just announce — actual item granting uses engine inventory methods if available)
  if (node.onEnter.grantItem && node.onEnter.grantItem.length > 0) {
    for (const itemId of node.onEnter.grantItem) {
      const item = getItem(itemId)
      const name = item ? item.name : itemId
      engine._appendMessages([systemMsg(`Received: ${rt.item(name)}`)])
    }
  }

  // Remove items (announce removal)
  if (node.onEnter.removeItem && node.onEnter.removeItem.length > 0) {
    for (const itemId of node.onEnter.removeItem) {
      const item = getItem(itemId)
      const name = item ? item.name : itemId
      engine._appendMessages([systemMsg(`Lost: ${rt.item(name)}`)])
    }
  }
}

/**
 * Start a dialogue tree for an NPC. Sets activeDialogue and displays the start node.
 */
async function startDialogueTree(engine: EngineCore, npcId: string, treeKey: string, tree: import('@/types/game').DialogueTree): Promise<void> {
  const { player, inventory, cycleHistory } = engine.getState()
  if (!player) return

  const npc = getNPC(npcId)
  const npcName = npc?.name ?? npcId

  const startNode = tree.nodes[tree.startNode]
  if (!startNode) {
    engine._appendMessages([errorMsg('The conversation leads nowhere.')])
    return
  }

  // Set active dialogue state
  engine._setState({
    activeDialogue: {
      npcId,
      treeId: treeKey,
      currentNodeId: tree.startNode,
    },
  })

  // Apply onEnter effects for the start node
  await applyNodeEffects(engine, startNode)

  // Display the node
  const display = buildNodeDisplay(startNode, npcName, player, inventory, cycleHistory)
  engine._appendMessages(display)

  // If no branches, conversation ends immediately
  if (!startNode.branches || startNode.branches.length === 0) {
    engine._setState({ activeDialogue: undefined })
    engine._appendMessages([msg('The conversation ends.')])
  }
}

// ------------------------------------------------------------
// Dialogue choice handler (called when player types 1-9 during dialogue)
// ------------------------------------------------------------

export async function handleDialogueChoice(engine: EngineCore, choiceStr: string | undefined): Promise<void> {
  const state = engine.getState()
  const { player, inventory, activeDialogue, cycleHistory } = state
  if (!player || !activeDialogue) {
    engine._appendMessages([errorMsg("You're not in a conversation.")])
    return
  }

  const tree = DIALOGUE_TREES[activeDialogue.treeId]
  if (!tree) {
    engine._setState({ activeDialogue: undefined })
    engine._appendMessages([errorMsg('The conversation has been lost.')])
    return
  }

  const currentNode = tree.nodes[activeDialogue.currentNodeId]
  if (!currentNode || !currentNode.branches || currentNode.branches.length === 0) {
    engine._setState({ activeDialogue: undefined })
    engine._appendMessages([msg('The conversation ends.')])
    return
  }

  const choiceIndex = parseInt(choiceStr ?? '', 10) - 1
  if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= currentNode.branches.length) {
    engine._appendMessages([errorMsg(`Choose a number between 1 and ${currentNode.branches.length}, or type 'leave' to exit.`)])
    return
  }

  const branch = currentNode.branches[choiceIndex]!
  const npc = getNPC(activeDialogue.npcId)
  const npcName = npc?.name ?? activeDialogue.npcId

  // Check gates
  const { passable } = checkBranchGates(branch, player, inventory, cycleHistory)
  if (!passable) {
    engine._appendMessages([errorMsg("You can't choose that option right now.")])
    return
  }

  // Handle skill check if present
  let targetNodeId = branch.targetNode
  if (branch.skillCheck) {
    const baseStat = getStatForSkill(branch.skillCheck.skill, player) ?? 0
    const buffs = engine.getState().activeBuffs ?? []
    const governingStat = getStatNameForSkill(branch.skillCheck.skill)
    const buffBonus = buffs
      .filter(b => b.stat === governingStat)
      .reduce((sum, b) => sum + b.bonus, 0)
    const stat = baseStat + buffBonus
    const result = rollCheck(stat, branch.skillCheck.dc)
    const skillName = branch.skillCheck.skill.replace(/_/g, ' ')

    if (result.success) {
      const critText = result.critical ? ' (Critical!)' : ''
      engine._appendMessages([
        systemMsg(`${skillName} check: rolled ${result.roll} + ${result.modifier} = ${result.total} vs DC ${result.dc} — Success${critText}`),
      ])
    } else {
      const fumbleText = result.fumble ? ' (Fumble!)' : ''
      engine._appendMessages([
        systemMsg(`${skillName} check: rolled ${result.roll} + ${result.modifier} = ${result.total} vs DC ${result.dc} — Failed${fumbleText}`),
      ])
      if (branch.failNode) {
        targetNodeId = branch.failNode
      }
    }
  }

  // Navigate to next node
  const nextNode = tree.nodes[targetNodeId]
  if (!nextNode) {
    engine._setState({ activeDialogue: undefined })
    engine._appendMessages([msg('The conversation trails off.')])
    return
  }

  // Apply onEnter effects
  await applyNodeEffects(engine, nextNode)

  // Update active dialogue
  engine._setState({
    activeDialogue: {
      ...activeDialogue,
      currentNodeId: targetNodeId,
    },
  })

  // Display node
  const display = buildNodeDisplay(nextNode, npcName, player, inventory, cycleHistory)
  engine._appendMessages(display)

  // If no branches, conversation ends
  if (!nextNode.branches || nextNode.branches.length === 0) {
    engine._setState({ activeDialogue: undefined })
    engine._appendMessages([msg('The conversation ends.')])
  }
}

// ------------------------------------------------------------
// Dialogue leave handler
// ------------------------------------------------------------

export async function handleDialogueLeave(engine: EngineCore): Promise<void> {
  const { activeDialogue } = engine.getState()
  if (!activeDialogue) {
    engine._appendMessages([errorMsg("You're not in a conversation.")])
    return
  }

  engine._setState({ activeDialogue: undefined })
  engine._appendMessages([msg('You end the conversation.')])
}

// ------------------------------------------------------------
// Dialogue blocked handler (player tried a non-dialogue command while in conversation)
// ------------------------------------------------------------

export async function handleDialogueBlocked(engine: EngineCore): Promise<void> {
  const { activeDialogue } = engine.getState()
  if (!activeDialogue) return

  const tree = DIALOGUE_TREES[activeDialogue.treeId]
  const currentNode = tree?.nodes[activeDialogue.currentNodeId]
  const branchCount = currentNode?.branches?.length ?? 0
  const rangeText = branchCount > 0 ? `1-${branchCount}` : '1-3'

  engine._appendMessages([
    errorMsg(`You're in a conversation. Choose an option (${rangeText}) or type 'leave' to exit.`),
  ])
}

// ------------------------------------------------------------
// handleTalk — main talk handler
// ------------------------------------------------------------

export async function handleTalk(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { currentRoom, player } = engine.getState()
  if (!currentRoom || !player) return

  if (currentRoom.npcs.length === 0) {
    engine._appendMessages([errorMsg('There is no one to talk to here.')])
    return
  }

  // Split noun into NPC name and optional topic.
  // e.g. "patch scar" → npcNoun="patch", topicWord="scar"
  // e.g. "marshal cross scar" → need to match "marshal cross" first, then "scar"
  // Strategy: try longest match against room NPCs, remainder is topic.
  let npcId: string | undefined
  let topicWord: string | undefined

  if (noun) {
    const nounLower = noun.toLowerCase()
    // Strip "about" prefix for "ask patch about scar" style input
    // (parser turns "ask patch about scar" into verb=talk, noun="patch about scar")
    const aboutStripped = nounLower.replace(/\babout\b/, '').replace(/\s+/g, ' ').trim()
    const tokens = aboutStripped.split(' ')

    // Try progressively shorter prefixes as NPC name, longest first.
    // This handles multi-word names like "marshal cross".
    for (let split = tokens.length; split >= 1; split--) {
      const candidate = tokens.slice(0, split).join(' ')
      const matched = currentRoom.npcs.find((id) => {
        const n = getNPC(id)
        if (!n) return false
        if (n.name.toLowerCase().includes(candidate)) return true
        if (id.toLowerCase().includes(candidate)) return true
        const rolledNpc = currentRoom.population?.npcs.find(rn => rn.npcId === id)
        if (rolledNpc?.activity && rolledNpc.activity.toLowerCase().includes(candidate)) return true
        if (n.faction && n.faction.toLowerCase().includes(candidate)) return true
        return false
      })
      if (matched) {
        npcId = matched
        const remainder = tokens.slice(split).join(' ').trim()
        if (remainder) topicWord = remainder
        break
      }
    }

    // Fallback: if no NPC matched at all, try the full noun as NPC name
    if (!npcId) {
      npcId = currentRoom.npcs.find((id) => {
        const n = getNPC(id)
        if (!n) return false
        if (n.name.toLowerCase().includes(nounLower)) return true
        if (id.toLowerCase().includes(nounLower)) return true
        const rolledNpc = currentRoom.population?.npcs.find(rn => rn.npcId === id)
        if (rolledNpc?.activity && rolledNpc.activity.toLowerCase().includes(nounLower)) return true
        if (n.faction && n.faction.toLowerCase().includes(nounLower)) return true
        return false
      })
    }
  } else {
    npcId = currentRoom.npcs[0]
  }

  if (!npcId) {
    engine._appendMessages([errorMsg(`You don't see that person here.`)])
    return
  }

  const npc = getNPC(npcId)
  if (!npc) {
    engine._appendMessages([errorMsg('That person has nothing to say.')])
    return
  }

  const messages: GameMessage[] = []
  const talkFlag = `talked_${npcId}`

  // Check rolled disposition from _applyPopulation (W-2)
  const rolledNpc = currentRoom.population?.npcs.find(n => n.npcId === npcId)
  const disposition = rolledNpc?.disposition ?? 'neutral'

  // Hostile NPCs refuse conversation
  if (disposition === 'hostile') {
    const hostileNpcName = npc.name
    engine._appendMessages([
      msg(`${rt.npc(hostileNpcName)} turns away, hand moving toward something at their belt. You're not welcome here.`),
    ])
    return
  }

  // ── Check for dialogue tree ──────────────────────────────
  // Look up dialogue tree: check room's spawned NPC data for a specific tree key, fall back to npcId
  const spawnedNpc = currentRoom.population?.npcs.find(n => n.npcId === npcId)
  const treeKey = spawnedNpc?.dialogueTree ?? npcId
  const tree = DIALOGUE_TREES[treeKey]
  if (tree && !topicWord) {
    // Show NPC description on first talk this session
    if (!currentRoom.flags[talkFlag]) {
      engine._appendMessages([msg(npc.description)])
      await updateRoomFlags(currentRoom.id, player.id, { [talkFlag]: true })
      const updatedRoom = {
        ...currentRoom,
        flags: { ...currentRoom.flags, [talkFlag]: true },
      }
      engine._setState({ currentRoom: updatedRoom })
    }

    await startDialogueTree(engine, npcId, treeKey, tree)
    return
  }

  // ── Topic-specific dialogue ──────────────────────────────
  if (topicWord) {
    const topic = findNpcTopic(npcId, topicWord)
    if (!topic) {
      engine._appendMessages([
        msg(`${rt.npc(npc.name)} looks at you blankly. That's not something they have anything to say about.`),
      ])
      return
    }

    // Check flag gate
    if (topic.requiresFlag) {
      const flags = player.questFlags ?? {}
      if (!flags[topic.requiresFlag]) {
        engine._appendMessages([
          msg(`${rt.npc(npc.name)} studies you for a moment, then shakes their head. "You don't know enough yet for that conversation."`),
        ])
        return
      }
    }

    // Check reputation gate
    if (topic.requiresRep) {
      const rep = player.factionReputation?.[topic.requiresRep.faction] ?? 0
      if (rep < topic.requiresRep.min) {
        engine._appendMessages([
          msg(`${rt.npc(npc.name)} regards you with suspicion. "We don't know each other well enough for that."`),
        ])
        return
      }
    }

    // Wary NPCs give topic responses reluctantly
    if (disposition === 'wary') {
      messages.push(msg(`${rt.npc(npc.name)} hesitates, then speaks in a low voice.`))
    }

    messages.push(msg(topic.response))

    // Topic closure line
    messages.push(msg(`They seem to have said all they intend to.`, 'echo'))

    // Set quest flag if defined
    if (topic.setsFlag) {
      await engine.setQuestFlag(topic.setsFlag, true)
    }

    engine._appendMessages(messages)
    return
  }

  // ── Standard greeting (no topic specified) ───────────────

  // Show NPC description on first talk this session
  if (!currentRoom.flags[talkFlag]) {
    messages.push(msg(npc.description))

    await updateRoomFlags(currentRoom.id, player.id, { [talkFlag]: true })
    const updatedRoom = {
      ...currentRoom,
      flags: { ...currentRoom.flags, [talkFlag]: true },
    }
    engine._setState({ currentRoom: updatedRoom })
  }

  // Dialogue line — wary NPCs are terse
  const cycle = player.cycle ?? 1
  const revenantLine = getRevenantDialogue(npcId, cycle)
  const dialogue = revenantLine ?? npc.dialogue

  if (disposition === 'wary') {
    messages.push(msg(`${rt.npc(npc.name)} doesn't meet your eyes. "${dialogue}"`))
    messages.push(msg(`They don't offer anything else.`))
  } else if (disposition === 'friendly') {
    messages.push(msg(`"${dialogue}" \u2014 ${rt.npc(npc.name)}`))
    messages.push(msg(`${rt.npc(npc.name)} seems willing to talk more if you have questions.`))
  } else {
    messages.push(msg(`"${dialogue}" \u2014 ${rt.npc(npc.name)}`))
  }

  // Show available topics for named NPCs
  const questFlags = player.questFlags ?? {}
  const factionRep = player.factionReputation ?? {}
  const visibleTopics = getVisibleTopics(npcId, questFlags, factionRep)
  if (visibleTopics.length > 0) {
    const topicList = visibleTopics.map(t => `[${rt.keyword(t)}]`).join(' ')
    messages.push(systemMsg(`Topics: ${topicList}`))
  }

  // Generic closure for NPCs without dialogue trees and without topics
  // Disposition-aware lines for atmospheric variation
  const hasTopics = NPC_TOPICS[npcId] !== undefined && NPC_TOPICS[npcId]!.length > 0
  if (!tree && !hasTopics) {
    const closureLines: Record<string, string> = {
      friendly: 'They nod and return to what they were doing.',
      neutral: 'The conversation has run its course.',
      wary: 'They turn away. The exchange is over.',
      hostile: 'They stare at you until you leave.',
    }
    const closureLine = closureLines[disposition] ?? closureLines.neutral!
    messages.push(msg(closureLine, 'echo'))
  }

  engine._appendMessages(messages)
}

export async function handleSearch(engine: EngineCore): Promise<void> {
  const { currentRoom, player } = engine.getState()
  if (!currentRoom || !player) return

  if (currentRoom.flags['searched']) {
    engine._appendMessages([systemMsg('You have already searched this area.')])
    return
  }

  engine._appendMessages([systemMsg('You search the area carefully...')])

  // Nothing extra for now — items are already in the room
  if (currentRoom.items.length > 0) {
    engine._appendMessages([msg(itemsLine(currentRoom))])
  } else {
    engine._appendMessages([msg('You find nothing of note.')])
  }

  // Discover hidden exits via skill checks
  const newFlags: Record<string, boolean | number> = { searched: true }
  if (currentRoom.richExits) {
    for (const dir of Object.keys(currentRoom.richExits) as Direction[]) {
      const richExit = currentRoom.richExits[dir]
      if (!richExit?.hidden) continue
      if (currentRoom.flags[`discovered_exit_${dir}`]) continue

      const skill = richExit.discoverSkill ?? 'perception'
      const dc = richExit.discoverDc ?? 10
      const playerStat = getStatForSkill(skill, player)
      if (playerStat === null) continue

      const roll = Math.floor(Math.random() * 10) + 1 + playerStat
      if (roll >= dc) {
        newFlags[`discovered_exit_${dir}`] = true
        const discoverMsg = richExit.discoverMessage ?? `You notice a passage leading ${dir}.`
        engine._appendMessages([msg(discoverMsg)])
      }
    }
  }

  await updateRoomFlags(currentRoom.id, player.id, newFlags)
  const updatedRoom = { ...currentRoom, flags: { ...currentRoom.flags, ...newFlags } }
  engine._setState({ currentRoom: updatedRoom })
}

// ------------------------------------------------------------
// Reputation display
// ------------------------------------------------------------

const ALL_FACTIONS: FactionType[] = [
  'accord', 'salters', 'drifters', 'kindling', 'reclaimers',
  'covenant_of_dusk', 'red_court', 'ferals', 'lucid',
]

const FACTION_DISPLAY_NAMES: Record<FactionType, string> = {
  accord: 'Accord',
  salters: 'Salters',
  drifters: 'Drifters',
  kindling: 'Kindling',
  reclaimers: 'Reclaimers',
  covenant_of_dusk: 'Covenant of Dusk',
  red_court: 'Red Court',
  ferals: 'Ferals',
  lucid: 'Lucid',
}

const REPUTATION_LABELS: Record<number, string> = {
  [-3]: 'Hunted',
  [-2]: 'Hostile',
  [-1]: 'Wary',
  [0]: 'Unknown',
  [1]: 'Recognized',
  [2]: 'Trusted',
  [3]: 'Blooded',
}

export async function handleRep(engine: EngineCore): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  const rep = player.factionReputation ?? {}
  const lines: string[] = ['Your standing:']

  for (const faction of ALL_FACTIONS) {
    const level = rep[faction] ?? 0
    const label = REPUTATION_LABELS[level] ?? 'Unknown'
    const displayName = FACTION_DISPLAY_NAMES[faction]
    const sign = level > 0 ? '+' : ''
    const padding = '.'.repeat(Math.max(1, 24 - displayName.length))
    lines.push(`  ${displayName} ${padding} ${label} (${sign}${level})`)
  }

  engine._appendMessages([systemMsg(lines.join('\n'))])
}

// ------------------------------------------------------------
// Quest flags display
// ------------------------------------------------------------

export async function handleQuests(engine: EngineCore): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  const flags = player.questFlags ?? {}
  const active = Object.entries(flags).filter(([, v]) => !!v)

  if (active.length === 0) {
    engine._appendMessages([systemMsg('No active quests.')])
    return
  }

  const lines: string[] = ['Active quests:']
  for (const [key, value] of active) {
    const name = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    if (typeof value === 'number') {
      lines.push(`  ${name} (${value})`)
    } else {
      lines.push(`  ${name}`)
    }
  }

  engine._appendMessages([systemMsg(lines.join('\n'))])
}

// ------------------------------------------------------------
// Item IDs considered "medical" or "food" for give interactions
// ------------------------------------------------------------

const MEDICAL_ITEM_IDS = new Set([
  'bandages', 'bandages_clean', 'antibiotics_01', 'quiet_drops', 'stim_shot',
  'field_surgery_kit', 'gauze', 'antiseptic', 'pain_tabs', 'sanguine_blood_vial',
])

const FOOD_ITEM_IDS = new Set([
  'boiled_rations', 'elk_jerky', 'water_bottle_sealed', 'canned_food',
  'canned_food_random', 'canned_food_premium', 'scavenged_rations',
  'preserved_rations', 'salted_rations', 'emergency_rations',
])

// ------------------------------------------------------------
// handleGive — give an item from inventory to an NPC
// ------------------------------------------------------------

export async function handleGive(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { currentRoom, player, inventory } = engine.getState()
  if (!currentRoom || !player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Give what to whom?')])
    return
  }

  // Parse "give <item> to <npc>" or "give <item> <npc>"
  let itemNoun: string
  let npcNoun: string

  if (noun.includes(' to ')) {
    const parts = noun.split(' to ')
    itemNoun = parts[0]!.trim()
    npcNoun = parts.slice(1).join(' to ').trim()
  } else {
    // Split on last word: last word is NPC name, remainder is item name
    const tokens = noun.trim().split(/\s+/)
    if (tokens.length < 2) {
      engine._appendMessages([errorMsg('Give what to whom?')])
      return
    }
    npcNoun = tokens[tokens.length - 1]!
    itemNoun = tokens.slice(0, tokens.length - 1).join(' ')
  }

  // Find item in inventory (partial name match)
  const itemNounLower = itemNoun.toLowerCase()
  const invItem = inventory.find((ii) =>
    ii.item.name.toLowerCase().includes(itemNounLower) ||
    ii.itemId.toLowerCase().includes(itemNounLower)
  )

  if (!invItem) {
    engine._appendMessages([errorMsg("You don't have that.")])
    return
  }

  // Find NPC in current room (same matching as handleTalk)
  const npcNounLower = npcNoun.toLowerCase()
  const npcId = currentRoom.npcs.find((id) => {
    const n = getNPC(id)
    if (!n) return false
    if (n.name.toLowerCase().includes(npcNounLower)) return true
    if (id.toLowerCase().includes(npcNounLower)) return true
    const rolledNpc = currentRoom.population?.npcs.find(rn => rn.npcId === id)
    if (rolledNpc?.activity && rolledNpc.activity.toLowerCase().includes(npcNounLower)) return true
    return false
  })

  if (!npcId) {
    engine._appendMessages([errorMsg("You don't see that person here.")])
    return
  }

  const npc = getNPC(npcId)
  const npcName = npc?.name ?? npcId
  const itemName = invItem.item.name
  const itemId = invItem.itemId

  // Remove item from inventory
  await removeItem(player.id, itemId)
  const updatedInventory = await getInventory(player.id)
  engine._setState({ inventory: updatedInventory })

  // Apply quest flags and reputation for specific item+NPC combinations
  if (itemId === 'meridian_keycard' && npcId === 'lev') {
    engine._appendMessages([
      msg(`You hand the ${rt.item(itemName)} to ${rt.npc(npcName)}.`),
      msg(`${rt.npc(npcName)} takes the keycard with deliberate care, turning it over once to verify the batch number. "This is it. This is the one I needed." They set it down at the center of their workspace with a kind of reverence that makes you think it represents something larger than a door. "I won't forget this."`, 'narrative'),
    ])
    await engine.setQuestFlag('gave_keycard_to_lev', true)
  } else if (npcId === 'patch' && MEDICAL_ITEM_IDS.has(itemId)) {
    engine._appendMessages([
      msg(`You hand the ${rt.item(itemName)} to ${rt.npc(npcName)}.`),
      msg(`${rt.npc(npcName)} examines the ${rt.item(itemName)} with clinical efficiency, already thinking about who needs it most. "Good. This will help." They add it to their supplies without ceremony — in their hands, gratitude looks like competence.`, 'narrative'),
    ])
    await engine.setQuestFlag('helped_patch_medical', true)
    await engine.adjustReputation('drifters', 1)
  } else if (FOOD_ITEM_IDS.has(itemId)) {
    // Giving food to any NPC earns faction reputation for the room's implicit faction
    const roomNpcData = npc
    const faction = roomNpcData?.faction
    engine._appendMessages([
      msg(`You offer the ${rt.item(itemName)} to ${rt.npc(npcName)}.`),
      msg(`${rt.npc(npcName)} accepts it without theatrics — a nod, a brief meeting of eyes. Out here, that's the same as thank you.`, 'narrative'),
    ])
    if (faction) {
      await engine.adjustReputation(faction, 1)
    }
  } else {
    // Generic acceptance
    engine._appendMessages([
      msg(`You hand the ${rt.item(itemName)} to ${rt.npc(npcName)}.`),
      msg(`${rt.npc(npcName)} takes it. "Appreciated." They don't elaborate.`, 'narrative'),
    ])
  }
}
