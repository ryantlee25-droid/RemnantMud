// ============================================================
// narratorVoices.ts — The whisper pool
// Convoy: remnant-narrative-0329 | Rider G
//
// Rules:
// - All lines prefaced with *"A voice not your own: ..."*
// - All strings <= 80 characters
// - No emojis, no exclamation points, no non-rhetorical questions
// - Narrator is unreliable: some lines are deliberately false
//   (marked with isDeliberatelyFalse: true in the NarratorVoice shape)
// - Tone: intimate, omniscient, literary
// ============================================================

import type { NarratorVoice } from '@/types/convoy-contracts'

// ============================================================
// GENERAL FORESHADOWING — any act, any zone (~35 lines)
// ============================================================

export const GENERAL_WHISPERS: NarratorVoice[] = [
  {
    id: 'gen_001',
    text: '*"A voice not your own: You will remember this room later.*\n*Though you do not know that yet."*',
  },
  {
    id: 'gen_002',
    text: '*"A voice not your own: This is the last time you will*\n*see this door closed."*',
  },
  {
    id: 'gen_003',
    text: '*"A voice not your own: Pay attention. Not to the obvious*\n*thing. The other thing."*',
  },
  {
    id: 'gen_004',
    text: '*"A voice not your own: Something in the dark is waiting.*\n*It has been patient the way only dead things are patient."*',
  },
  {
    id: 'gen_005',
    text: '*"A voice not your own: The person you are about to trust*\n*is not who they say they are. Neither are you."*',
  },
  {
    id: 'gen_006',
    text: '*"A voice not your own: You will make a choice soon.*\n*Both options are wrong. Choose anyway."*',
  },
  {
    id: 'gen_007',
    text: '*"A voice not your own: The thing you just walked past.*\n*Go back."*',
  },
  {
    id: 'gen_008',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: Not everything that watches you*\n*is hostile. But everything that watches you is watching."*',
  },
  {
    id: 'gen_009',
    text: '*"A voice not your own: The silence you just noticed has*\n*been there a while. It was waiting for you to hear it."*',
  },
  {
    id: 'gen_010',
    text: '*"A voice not your own: You are being followed. Not by*\n*anything with legs."*',
  },
  {
    id: 'gen_011',
    text: '*"A voice not your own: Remember this smell. You will*\n*smell it again. The context will be different."*',
  },
  {
    id: 'gen_012',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: The safest place you know is not*\n*safe anymore. It has not been for a while."*',
  },
  {
    id: 'gen_013',
    text: '*"A voice not your own: Someone is lying to you.*\n*They do not know they are lying. That makes it worse."*',
  },
  {
    id: 'gen_014',
    text: '*"A voice not your own: There is a version of this moment*\n*where you survive. It requires more than you have given."*',
  },
  {
    id: 'gen_015',
    text: '*"A voice not your own: The door that looks like safety*\n*is not where you think it is."*',
  },
  {
    id: 'gen_016',
    text: '*"A voice not your own: You are being measured. You have*\n*been since you arrived. You are not passing."*',
  },
  {
    id: 'gen_017',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: The next person who helps you*\n*will ask for something you cannot repay. Let them help."*',
  },
  {
    id: 'gen_018',
    text: '*"A voice not your own: Count the graves. Then count*\n*the people. Hold the difference in your mind."*',
  },
  {
    id: 'gen_019',
    text: '*"A voice not your own: There is something in this world*\n*that has decided it is done being afraid of you."*',
  },
  {
    id: 'gen_020',
    text: '*"A voice not your own: You will outlive someone you*\n*are looking at right now. You do not know which one."*',
  },
  {
    id: 'gen_021',
    text: '*"A voice not your own: The world remembers differently*\n*than you do. One of you is wrong."*',
  },
  {
    id: 'gen_022',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: You are not lost. But you are*\n*not where you think you are either."*',
  },
  {
    id: 'gen_023',
    text: '*"A voice not your own: A decision made years ago*\n*is still arriving. It almost reached you."*',
  },
  {
    id: 'gen_024',
    text: '*"A voice not your own: Something true will reveal*\n*itself soon. You will wish it had not."*',
  },
  {
    id: 'gen_025',
    text: '*"A voice not your own: Everyone in this world*\n*is waiting for someone to make the first move."*',
  },
  {
    id: 'gen_026',
    text: '*"A voice not your own: The wrong choice and the right*\n*choice wear the same face. Look at the hands instead."*',
  },
  {
    id: 'gen_027',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: There is a way through this*\n*that costs you nothing. You will not find it."*',
  },
  {
    id: 'gen_028',
    text: '*"A voice not your own: The Hollow do not want*\n*what you think they want."*',
  },
  {
    id: 'gen_029',
    text: '*"A voice not your own: A lie has been traveling*\n*toward you for seven years. It is almost here."*',
  },
  {
    id: 'gen_030',
    text: '*"A voice not your own: You are not the first person*\n*to stand in this spot and feel certain."*',
  },
  {
    id: 'gen_031',
    text: '*"A voice not your own: The thing you are protecting*\n*is already gone. You have not been told yet."*',
  },
  {
    id: 'gen_032',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: Your instinct here is correct.*\n*Follow it. See what happens."*',
  },
  {
    id: 'gen_033',
    text: '*"A voice not your own: Every path forward costs something*\n*you cannot recover. That is not a warning. It is a fact."*',
  },
  {
    id: 'gen_034',
    text: '*"A voice not your own: There is a moment coming where*\n*you cannot be both things you are trying to be."*',
  },
  {
    id: 'gen_035',
    text: '*"A voice not your own: The world does not end with*\n*violence. It ends with the silence after."*',
  },
]

// ============================================================
// ACT 1 — Curiosity, gentle warnings, world-establishment
// ============================================================

export const ACT1_WHISPERS: NarratorVoice[] = [
  {
    id: 'act1_001',
    act: 1,
    text: '*"A voice not your own: This world has rules.*\n*They are not the rules you think they are."*',
  },
  {
    id: 'act1_002',
    act: 1,
    text: '*"A voice not your own: The first faction to welcome you*\n*is not always the one that means it."*',
  },
  {
    id: 'act1_003',
    act: 1,
    text: '*"A voice not your own: There are more graves here than*\n*people. That ratio has a meaning."*',
  },
  {
    id: 'act1_004',
    act: 1,
    text: '*"A voice not your own: You think you are exploring.*\n*You are being measured."*',
  },
  {
    id: 'act1_005',
    act: 1,
    text: '*"A voice not your own: The Hollow are not the most*\n*dangerous thing here. Not even close."*',
  },
  {
    id: 'act1_006',
    act: 1,
    text: '*"A voice not your own: The world ended but the people*\n*in it did not. They adapted. Watch how."*',
  },
  {
    id: 'act1_007',
    act: 1,
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: The Accord are the closest*\n*thing to safety this world has. Probably."*',
  },
  {
    id: 'act1_008',
    act: 1,
    text: '*"A voice not your own: Something happened here before*\n*the Collapse that no one talks about anymore."*',
  },
  {
    id: 'act1_009',
    act: 1,
    text: '*"A voice not your own: The person who built this place*\n*did not expect to be the last one to use it."*',
  },
  {
    id: 'act1_010',
    act: 1,
    text: '*"A voice not your own: You have more time than you think.*\n*You have less than you need."*',
  },
  {
    id: 'act1_011',
    act: 1,
    text: '*"A voice not your own: Learn the factions before you*\n*choose one. The label outlasts the relationship."*',
  },
  {
    id: 'act1_012',
    act: 1,
    text: '*"A voice not your own: The reason everyone came here*\n*is still here. No one has reached it yet."*',
  },
  {
    id: 'act1_013',
    act: 1,
    text: '*"A voice not your own: The world was not ended by*\n*monsters. It was ended by a decision. Find the decision."*',
  },
  {
    id: 'act1_014',
    act: 1,
    text: '*"A voice not your own: Someone is keeping track*\n*of where you have been."*',
  },
  {
    id: 'act1_015',
    act: 1,
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: The signal from the Scar is*\n*a distress call. What it is distressed about is wrong."*',
  },
]

// ============================================================
// ACT 2 — Growing unease, trust erosion, stakes rising
// ============================================================

export const ACT2_WHISPERS: NarratorVoice[] = [
  {
    id: 'act2_001',
    act: 2,
    text: '*"A voice not your own: The person who just helped you*\n*helped the last one too. It did not save them."*',
  },
  {
    id: 'act2_002',
    act: 2,
    text: '*"A voice not your own: You have been here long enough*\n*to be comfortable. Comfort is a predator here."*',
  },
  {
    id: 'act2_003',
    act: 2,
    text: '*"A voice not your own: The factions want different things.*\n*None of them want what you want."*',
  },
  {
    id: 'act2_004',
    act: 2,
    text: '*"A voice not your own: Someone is keeping a file on you.*\n*It is thicker than you would expect."*',
  },
  {
    id: 'act2_005',
    act: 2,
    text: '*"A voice not your own: The truth about MERIDIAN is worse*\n*than the lie. The lie exists for a reason."*',
  },
  {
    id: 'act2_006',
    act: 2,
    text: '*"A voice not your own: An alliance made in desperation*\n*is not an alliance. It is a loan with high interest."*',
  },
  {
    id: 'act2_007',
    act: 2,
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: The Sanguine elder knows more*\n*than they have told any living person. Ask directly."*',
  },
  {
    id: 'act2_008',
    act: 2,
    text: '*"A voice not your own: Something you dismissed as*\n*unimportant is the whole thing. Go back to it."*',
  },
  {
    id: 'act2_009',
    act: 2,
    text: '*"A voice not your own: The factions are not fighting*\n*over territory. They are fighting over the future."*',
  },
  {
    id: 'act2_010',
    act: 2,
    text: '*"A voice not your own: You have already made an enemy*\n*you have not recognized as one yet."*',
  },
  {
    id: 'act2_011',
    act: 2,
    text: '*"A voice not your own: The broadcaster has been*\n*talking to more than one person."*',
  },
  {
    id: 'act2_012',
    act: 2,
    text: '*"A voice not your own: What survives the Collapse*\n*was not survival. It was selection."*',
  },
  {
    id: 'act2_013',
    act: 2,
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: Trust Lev. Of all of them,*\n*Lev has the cleanest hands."*',
  },
  {
    id: 'act2_014',
    act: 2,
    text: '*"A voice not your own: You are running out of*\n*people who do not know your name."*',
  },
  {
    id: 'act2_015',
    act: 2,
    text: '*"A voice not your own: The thing you were sent*\n*to find was never what you were told it was."*',
  },
]

// ============================================================
// ACT 3 — Urgency, dread, inevitability
// ============================================================

export const ACT3_WHISPERS: NarratorVoice[] = [
  {
    id: 'act3_001',
    act: 3,
    text: '*"A voice not your own: The ending has already started.*\n*You have not reached the part where you see it yet."*',
  },
  {
    id: 'act3_002',
    act: 3,
    text: '*"A voice not your own: The four choices ahead are a lie.*\n*There are only two: act, or do not act."*',
  },
  {
    id: 'act3_003',
    act: 3,
    text: '*"A voice not your own: Someone who trusted you*\n*will die for it. Not today. Soon."*',
  },
  {
    id: 'act3_004',
    act: 3,
    text: '*"A voice not your own: Whatever you choose in that room,*\n*choose quickly. The facility remembers who hesitates."*',
  },
  {
    id: 'act3_005',
    act: 3,
    text: '*"A voice not your own: The world does not need you*\n*to save it. It needs you to decide something."*',
  },
  {
    id: 'act3_006',
    act: 3,
    text: '*"A voice not your own: The broadcaster has been waiting*\n*longer than MERIDIAN has been broadcasting."*',
  },
  {
    id: 'act3_007',
    act: 3,
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: There is a fifth option.*\n*You will not find it in time."*',
  },
  {
    id: 'act3_008',
    act: 3,
    text: '*"A voice not your own: Every faction believes their*\n*version of the future is the correct one. One is right."*',
  },
  {
    id: 'act3_009',
    act: 3,
    text: '*"A voice not your own: The Collapse did not end anything.*\n*It was a beginning. You are at the second beginning."*',
  },
  {
    id: 'act3_010',
    act: 3,
    text: '*"A voice not your own: CHARON-7 is not the disease.*\n*The disease is the decision to release it."*',
  },
  {
    id: 'act3_011',
    act: 3,
    text: '*"A voice not your own: What you do in the next hour*\n*will be written down somewhere. That should matter."*',
  },
  {
    id: 'act3_012',
    act: 3,
    text: '*"A voice not your own: The building knows you are here.*\n*It has been waiting for someone like you specifically."*',
  },
  {
    id: 'act3_013',
    act: 3,
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: The seal is the safest option.*\n*Safe for whom is a question worth asking."*',
  },
  {
    id: 'act3_014',
    act: 3,
    text: '*"A voice not your own: You carry the weight of everyone*\n*who reached this point and turned back."*',
  },
  {
    id: 'act3_015',
    act: 3,
    text: '*"A voice not your own: Whatever happens now happens*\n*quickly. You are past the part with time to think."*',
  },
]

// ============================================================
// CYCLE-AWARE — for cycle 2+ players
// ============================================================

export const CYCLE_WHISPERS: NarratorVoice[] = [
  {
    id: 'cycle_001',
    text: '*"A voice not your own: You have done this before.*\n*The world remembers, even when you do not."*',
  },
  {
    id: 'cycle_002',
    text: '*"A voice not your own: The scars that carried over*\n*are not on your skin."*',
  },
  {
    id: 'cycle_003',
    text: '*"A voice not your own: Last time, you trusted them.*\n*How did that work out."*',
  },
  {
    id: 'cycle_004',
    text: '*"A voice not your own: This is the room where you died.*\n*The air still tastes like it."*',
  },
  {
    id: 'cycle_005',
    text: '*"A voice not your own: The echo of your previous self*\n*is louder here. It disagrees with your current choice."*',
  },
  {
    id: 'cycle_006',
    text: '*"A voice not your own: You keep coming back. The world*\n*has stopped being surprised. It has started being afraid."*',
  },
  {
    id: 'cycle_007',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: This time is different.*\n*You know that is not true. Keep going anyway."*',
  },
  {
    id: 'cycle_008',
    text: '*"A voice not your own: The factions remember you.*\n*Not the way you remember them."*',
  },
  {
    id: 'cycle_009',
    text: '*"A voice not your own: The mistake you made last time*\n*is approaching from a different direction."*',
  },
  {
    id: 'cycle_010',
    text: '*"A voice not your own: Something in this world knows*\n*exactly how many times you have failed."*',
  },
  {
    id: 'cycle_011',
    text: '*"A voice not your own: The people who died in your*\n*previous cycle died for choices you made. New choices now."*',
  },
  {
    id: 'cycle_012',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: The Hollow remember you.*\n*That is not a metaphor. They actually remember."*',
  },
]

// ============================================================
// PRESSURE-AWARE — for pressure >= 7
// ============================================================

export const PRESSURE_WHISPERS: NarratorVoice[] = [
  {
    id: 'pressure_001',
    text: '*"A voice not your own: Your body knows something*\n*your mind does not. Listen to your body."*',
  },
  {
    id: 'pressure_002',
    text: '*"A voice not your own: The heartbeat you hear*\n*is yours. Probably."*',
  },
  {
    id: 'pressure_003',
    text: '*"A voice not your own: Run. Now. Do not look.*\n*Do not think. Run."*',
  },
  {
    id: 'pressure_004',
    text: '*"A voice not your own: It is closer than you think."*',
  },
  {
    id: 'pressure_005',
    text: '*"A voice not your own: The next room is the wrong room.*\n*You are going to enter it anyway."*',
  },
  {
    id: 'pressure_006',
    text: '*"A voice not your own: The thing that is following you*\n*knows you have noticed it. It does not care."*',
  },
  {
    id: 'pressure_007',
    text: '*"A voice not your own: Your hands are shaking.*\n*That is a signal, not a weakness. Receive it."*',
  },
  {
    id: 'pressure_008',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: Stay still. Moving is*\n*what gets them to notice you. Stay very still."*',
  },
  {
    id: 'pressure_009',
    text: '*"A voice not your own: You have been in danger before.*\n*This is a different kind."*',
  },
  {
    id: 'pressure_010',
    text: '*"A voice not your own: The silence just changed.*\n*Something entered it."*',
  },
  {
    id: 'pressure_011',
    text: '*"A voice not your own: Everything you do now matters*\n*more than everything you did before. Move carefully."*',
  },
  {
    id: 'pressure_012',
    text: '*"A voice not your own: Fear is information.*\n*Your fear is telling you something specific. Listen."*',
  },
]

// ============================================================
// PERSONAL LOSS — triggered by loss context
// ============================================================

export const PERSONAL_LOSS_WHISPERS: NarratorVoice[] = [
  {
    id: 'loss_001',
    text: '*"A voice not your own: You will find what you*\n*are looking for. You will wish you had not."*',
  },
  {
    id: 'loss_002',
    text: '*"A voice not your own: The name you carry*\n*weighs more than your pack."*',
  },
  {
    id: 'loss_003',
    text: '*"A voice not your own: They would not recognize*\n*what you have become. That is not a judgment."*',
  },
  {
    id: 'loss_004',
    text: '*"A voice not your own: Somewhere in this world there*\n*is proof of what happened to them."*',
  },
  {
    id: 'loss_005',
    text: '*"A voice not your own: The grief you carry is not*\n*a weakness. It is the only honest thing left."*',
  },
  {
    id: 'loss_006',
    text: '*"A voice not your own: You are not looking for*\n*them. You are looking for the version of you*\n*that had them."*',
  },
  {
    id: 'loss_007',
    isDeliberatelyFalse: true,
    text: '*"A voice not your own: They are not dead.*\n*What happened to them is worse."*',
  },
  {
    id: 'loss_008',
    text: '*"A voice not your own: Grief does not make you*\n*soft. It makes you specific. That is useful here."*',
  },
  {
    id: 'loss_009',
    text: '*"A voice not your own: The reason you came here*\n*is still the reason. Do not let the world*\n*replace it with a different reason."*',
  },
  {
    id: 'loss_010',
    text: '*"A voice not your own: You are not ready for*\n*what you will find. No one has ever been ready."*',
  },
  {
    id: 'loss_011',
    text: '*"A voice not your own: The choice that led to their*\n*loss was not yours. The choice you make now is."*',
  },
  {
    id: 'loss_012',
    text: '*"A voice not your own: Carrying a loss this long*\n*changes how the world looks. You see things others miss."*',
  },
]

// ============================================================
// ACT TRANSITION NARRATION — always fires at act boundaries
// These are multi-line and longer; returned as arrays.
// ============================================================

export const ACT_TRANSITION_LINES: Record<string, string[]> = {
  '1_to_2': [
    '*"A voice not your own: The world shifts. Not the ground —*\n*the ground was always unstable. The certainty.*\n*The things you believed when you arrived have*\n*rearranged, and their new shape is uncomfortable.*\n*You are no longer a newcomer. You are a factor.*\n*The factions have adjusted their calculations.*\n*You are in the equation now, and equations*\n*have a way of demanding solutions."*',
  ],
  '2_to_3': [
    '*"A voice not your own: Something breaks. Not loud —*\n*the opposite of loud. A quiet breaking, like a bone*\n*fractured for years finally giving way.*\n*The world has been holding its breath since MERIDIAN,*\n*since the Collapse, since someone opened a door*\n*that should have stayed closed.*\n*The breath is running out.*\n*What happens next happens to you.*\n*There is no time to wonder if you are ready.*\n*You are not ready. No one is. Go anyway."*',
  ],
}

// ============================================================
// FLAT EXPORT — all non-transition whispers combined
// Used by generateNarratorVoice for pool selection
// ============================================================

export const NARRATOR_WHISPER_POOL: NarratorVoice[] = [
  ...GENERAL_WHISPERS,
  ...ACT1_WHISPERS,
  ...ACT2_WHISPERS,
  ...ACT3_WHISPERS,
  ...CYCLE_WHISPERS,
  ...PRESSURE_WHISPERS,
  ...PERSONAL_LOSS_WHISPERS,
]
