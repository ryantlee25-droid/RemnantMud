// ============================================================
// lib/actions/social.ts — handleTalk, handleSearch, handleRep, handleQuests
// ============================================================

import type { GameMessage, FactionType, Direction, Player, SkillType, DialogueNode, DialogueBranch } from '@/types/game'
import type { EngineCore } from './types'
import { getNPC, getRevenantDialogue } from '@/data/npcs'
import { findNpcTopic, getVisibleTopics, NPC_TOPICS } from '@/data/npcTopics'
import { DIALOGUE_TREES } from '@/data/dialogueTrees'
import { updateRoomFlags } from '@/lib/world'
import { itemsLine } from './movement'
import { getClassSkillBonus } from '@/lib/skillBonus'
import { rollCheck } from '@/lib/dice'
import { rt } from '@/lib/richText'
import { getItem } from '@/data/items'

// ------------------------------------------------------------
// Local message helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'narrative'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

function systemMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'system' }
}

function errorMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'error' }
}

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
): GameMessage[] {
  const messages: GameMessage[] = []

  // NPC speech
  messages.push(msg(`${rt.npc(node.speaker ?? npcName)}: "${node.text}"`))

  // Branch choices
  if (node.branches && node.branches.length > 0) {
    messages.push(msg(''))  // blank line separator
    for (let i = 0; i < node.branches.length; i++) {
      const branch = node.branches[i]!
      const { passable, reason } = checkBranchGates(branch, player, inventory)
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
async function startDialogueTree(engine: EngineCore, npcId: string, tree: import('@/types/game').DialogueTree): Promise<void> {
  const { player, inventory } = engine.getState()
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
      treeId: npcId,
      currentNodeId: tree.startNode,
    },
  })

  // Apply onEnter effects for the start node
  await applyNodeEffects(engine, startNode)

  // Display the node
  const display = buildNodeDisplay(startNode, npcName, player, inventory)
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
  const { player, inventory, activeDialogue } = state
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
  const { passable } = checkBranchGates(branch, player, inventory)
  if (!passable) {
    engine._appendMessages([errorMsg("You can't choose that option right now.")])
    return
  }

  // Handle skill check if present
  let targetNodeId = branch.targetNode
  if (branch.skillCheck) {
    const stat = getStatForSkill(branch.skillCheck.skill, player) ?? 0
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
  const display = buildNodeDisplay(nextNode, npcName, player, inventory)
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
  const tree = DIALOGUE_TREES[npcId]
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

    await startDialogueTree(engine, npcId, tree)
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
// Map skill to player stat + class bonus (local helper)
// ------------------------------------------------------------

function getStatForSkill(skill: string, player: Player | null): number | null {
  if (!player) return null
  const map: Record<string, number> = {
    tracking: player.wits,
    survival: player.vigor,
    perception: player.wits,
    scavenging: player.wits,
    mechanics: player.wits,
    stealth: player.shadow,
    lockpicking: player.shadow,
    negotiation: player.presence,
    brawling: player.vigor,
    climbing: player.vigor,
    lore: player.wits,
    electronics: player.wits,
    marksmanship: player.reflex,
    bladework: player.reflex,
    field_medicine: player.presence,
    intimidation: player.presence,
    blood_sense: player.wits,
    daystalking: player.shadow,
    mesmerize: player.presence,
    vigor: player.vigor,
  }
  const base = map[skill] ?? null
  if (base === null) return null
  return base + getClassSkillBonus(player.characterClass, skill as SkillType)
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
