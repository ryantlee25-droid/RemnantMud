import type { Room } from '@/types/game'

// ============================================================
// THE BREAKS — 20 Rooms
// Canyon wilderness. No faction. Pure survival. Act I–II.
// Entry from cr_01_approach (south) — Survival 5 gate.
// ============================================================

export const BREAKS_ROOMS: Room[] = [

  // ----------------------------------------------------------
  // BR-01: Canyon Mouth
  // ----------------------------------------------------------
  {
    id: 'br_01_canyon_mouth',
    name: 'Canyon Mouth',
    zone: 'the_breaks',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { fastTravelWaypoint: true },
    description: 'The highway ends here in a way that roads end when the land decides it\'s done cooperating. The asphalt runs out mid-sentence and the canyon country begins — a drop in the terrain, a change in the air, the hard smell of juniper and dry earth replacing the road smell of asphalt and exhaust memory. The canyon walls are a burnt orange that deepens to red in afternoon light, striated with the geological patience of things that don\'t think about time. The gap ahead narrows to a slot-canyon entrance where the walls are close enough to touch simultaneously from the center. Before it, scratched into the highway\'s crumbling edge: BREAKS STARTS HERE. GOES AS FAR AS YOU GO. Someone has drawn a crude arrow pointing down. It is not wrong.',
    descriptionNight: 'The canyon mouth at night. The highway behind you catches what moon there is. The canyon ahead does not. There is a quality to the darkness in canyon country that flat ground doesn\'t have: vertical, textured, the canyon walls making a narrow sky above. You can still hear the highway. The sounds change when you pass the entrance.',
    shortDescription: 'The highway ends and the canyon begins — burnt orange walls, juniper smell, and a scratched sign that means what it says.',
    exits: {
      north: 'cr_01_approach',
      south: 'br_02_the_wash',
    },
    richExits: {
      south: {
        destination: 'br_02_the_wash',
        skillGate: { skill: 'survival', dc: 5, failMessage: 'The canyon country ahead looks rough. You\'re not prepared enough for open wilderness. Get more experience before pushing south.' },
        descriptionVerbose: 'the canyon mouth, south into The Breaks — Survival 5 required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.5, dusk: 1.5, night: 2.5, dawn: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 75, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
    },
    extras: [
      {
        keywords: ['asphalt', 'highway', 'road', 'end'],
        description: 'The road simply stops — not from damage but from design. Highway 550 was never extended into the canyon country. The survey engineers looked at the geology and made a pragmatic decision. The canyon country didn\'t want roads and said so in sandstone. The pavement edge has been crumbling for decades; the frost heaves and the canyon weather have continued what the builders stopped.',
      },
      {
        keywords: ['walls', 'canyon', 'orange', 'red', 'stone', 'color'],
        description: 'Entrada sandstone — you might know the name from before, from geology class or a nature documentary. Two hundred and fifty million years of sediment compressed into the color palette of a dying sun. The strata are visible as horizontal bands: lighter tan, then buff, then the deep red-orange that dominates. The exposed faces are smooth where wind has worked them, rough where it hasn\'t gotten there yet.',
      },
      {
        keywords: ['sign', 'scratched', 'highway edge', 'arrow'],
        description: 'BREAKS STARTS HERE. The scratching is deep — a knife, probably, worked in multiple passes. The letter quality suggests someone careful about their words if not their medium. Below the text: GOES AS FAR AS YOU GO. Then the arrow. This is either encouragement, warning, or the canyon country\'s version of a welcome mat, which amounts to the same thing.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'breaks_waypoint_traveler',
        spawnChance: 0.25,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A traveler with a loaded pack stands at the canyon entrance, studying a hand-drawn map, rotating it to orient against the actual canyon walls with the focused patience of someone who knows that wrong direction here matters more than wrong direction most places.', weight: 2 },
          { desc: 'A Drifter scout at the canyon mouth is checking her water supply before heading in, counting container capacity with the practiced efficiency of someone for whom this calculation is automatic.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'br_waypoint_traveler',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // BR-02: The Wash
  // ----------------------------------------------------------
  {
    id: 'br_02_the_wash',
    name: 'The Breaks — The Wash',
    zone: 'the_breaks',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { waterSource: true },
    description: 'The wash is a dry riverbed now — has been for months, the streambed showing the white salt deposits and cracked clay that mark where water was and isn\'t. But the signs of previous flow are everywhere: the banks cut steep and clean, the boulders rounded, the driftwood lodged at heights that tell you how high this channel ran in the last significant rain. Flash flood country. The canyon walls crowd close on both sides, and the wash winds south between them in a series of gradual bends that each reveal the next section in sequence. The flora along the margins: cottonwoods with their roots in whatever subsurface moisture remains, willows that confirm that moisture exists, the particular company of plants that survives in the memory of water.',
    descriptionNight: 'The wash at night is one of the more dangerous passages in The Breaks. The walls create a corridor effect that channels sound in ways that make distance and direction unreliable. You hear things around the next bend at amplified volume, which sounds like warning until it\'s the canyon itself playing tricks.',
    shortDescription: 'A dry riverbed between steep-cut banks — the plants remember the water even if it\'s been months, and the bends keep their secrets until you turn each one.',
    exits: {
      north: 'br_01_canyon_mouth',
      south: 'br_03_narrow_slot_canyon',
      east: 'br_07_canyon_crossroads',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.5, dusk: 1.5, night: 3.0, dawn: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.3, awareAggressive: 0.3 },
      activityPool: {
        shuffler: [
          { desc: 'moves in the streambed with the current that isn\'t there anymore, following an old-world path through the canyon, feet finding the smooth stones without looking down', weight: 3 },
        ],
      },
    },
    extras: [
      {
        keywords: ['driftwood', 'flood line', 'water mark', 'height'],
        description: 'The highest driftwood is lodged in a willow fork at eight feet above the current streambed. That\'s how high the water came in the last significant flood — and it was moving fast enough to carry wood into a tree fork. The soil beside the willow has the layered stratigraphy of multiple flood events. You read it the way you\'d read a document: the canyon has had this conversation before.',
        skillCheck: { skill: 'survival', dc: 9, successAppend: 'Spring-melt timing and the storm pattern you\'ve observed tells you the next flood risk is three to six weeks out. When it comes, this wash will fill within twenty minutes of significant rain upstream. The canyon walls offer no exit once the water is moving.' },
      },
      {
        keywords: ['cottonwoods', 'willows', 'trees', 'plants', 'vegetation'],
        description: 'The cottonwoods are the largest living things in this canyon section — fifty-foot giants with the thick scaly bark and silver-green leaves that shake in the slightest breeze. Their presence confirms subsurface water within root reach. The willows are denser along the cut banks. Between them, the smaller things: saltbush, rabbitbrush, the occasional red-tipped fire wheel that grows wherever the soil is deep enough.',
      },
      {
        keywords: ['clay', 'salt', 'streambed', 'cracked', 'white'],
        description: 'The streambed itself is a geology text: white salt deposits where the evaporation was highest, cracked clay medallions the size of dinner plates where the silt dried and curled at the edges, and at the deepest point, polished stones that show what the water thought of them over decades of attention. You can walk the centerline without difficulty until the bends.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'fresh_water_container',
        spawnChance: 0.20,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A small seep pool has collected in a flat rock depression at the base of the east bank — seasonal water, but here today.',
        depletion: { cooldownMinutes: { min: 60, max: 240 }, respawnChance: 0.25 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-03: Narrow Slot Canyon
  // ----------------------------------------------------------
  {
    id: 'br_03_narrow_slot_canyon',
    name: 'The Breaks — Narrow Slot Canyon',
    zone: 'the_breaks',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: { noCombat: false },
    description: 'The slot canyon is the showcase of The Breaks and the nightmare of its threat. The walls are close enough to span with outstretched arms, the rock worn smooth by millennia of water into curves that look sculpted, the colors shifting from burnt orange to deep burgundy to a coral that has no better name in a language made for other purposes. The light comes from a gap twenty meters above — a blue stripe of sky that the canyon frames like an accident of architecture. And on the wall at chest height, for maybe thirty meters of corridor, claw marks. Not the marks of an animal: methodical, repeated, the groove pattern of fingers applied with intent rather than panic. The marks face into the canyon. Whatever made them was coming out.',
    descriptionNight: 'The slot canyon at night is a sensory narrowing. The sky gap above shows stars — a narrow strip of them, the Milky Way visible if the angle is right, impossibly clear in that small frame. The walls press. The claw marks are invisible until your light hits them.',
    shortDescription: 'Water-sculpted walls, coral and burgundy, light from twenty meters up, and claw marks that face the wrong way.',
    exits: {
      north: 'br_02_the_wash',
      south: 'br_05_bone_hollow',
      up: 'br_04_ledge_trail',
    },
    richExits: {
      up: {
        destination: 'br_04_ledge_trail',
        skillGate: { skill: 'climbing', dc: 10, failMessage: 'The ledge access is a technical climb. You can see the handholds, but making that sequence without the skill for it ends badly.' },
        descriptionVerbose: 'a chimney exit to the ledge trail above — Climbing DC 10',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.8, dusk: 1.8, night: 3.5, dawn: 1.5 },
      threatPool: [
        { type: 'remnant', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'shuffler', weight: 30, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'brute', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.3, awareAggressive: 0.5 },
      noiseModifier: -4,
    },
    extras: [
      {
        keywords: ['claw marks', 'marks', 'walls', 'grooves', 'scratches'],
        description: 'You count the marks. Eighteen separate sets of marks, over roughly thirty meters of wall, all at approximately the same height. The groove pattern: four parallel lines, approximately finger-spaced. The depth is significant — these aren\'t surface scratches but gouges that required force and extended contact. The pattern points north, toward the open canyon. Whatever made these marks was facing this direction, working at this wall, for long enough to leave this quantity of evidence. The marks have weathered into the stone — they\'re not new. But they\'re not old either.',
        skillCheck: { skill: 'tracking', dc: 12, successAppend: 'The marks are Hollow. Specifically, they\'re the marks of a Hollow type with enhanced physical capability — the force required rules out a shuffler. Remnant, possibly, or something higher. The height tells you it was humanoid and standard size. The repetition tells you it was here for a long time. The north-facing direction tells you something was keeping it from going that way.' },
      },
      {
        keywords: ['light', 'sky gap', 'blue', 'above', 'ceiling'],
        description: 'Twenty meters up, the canyon walls almost meet without quite meeting. The gap is two feet wide at its narrowest. Through it: sky. On a clear day, blue so pure it looks wrong against the orange of the stone. Late afternoon, the light comes through at an angle that moves down the west wall in a slow column, and when it hits the claw marks, the shadows make them visible from across the canyon width. Someone knew about this. The positioning of the marks suggests someone wanted them seen.',
      },
      {
        keywords: ['colors', 'stone', 'burgundy', 'coral', 'orange', 'walls'],
        description: 'The water has done everything to these walls that water does over geological time: carved the curves, polished the faces, selected for the minerals that show. The color shifts are strata exposed in cross-section — the orange is iron oxide, the burgundy is manganese, the pale bands are calcium carbonate. The canyon is its own geological diagram, accurate to two hundred million years. You would appreciate it more fully if the claw marks weren\'t here.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'mineral_sample',
        spawnChance: 0.30,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A few fragments of colored stone on the canyon floor — broken from the walls by some previous force.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.40 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-04: The Ledge Trail
  // ----------------------------------------------------------
  {
    id: 'br_04_ledge_trail',
    name: 'The Breaks — The Ledge Trail',
    zone: 'the_breaks',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: {},
    description: 'The ledge trail is a two-foot-wide path cut into the canyon rim, running at irregular height along the east face above the slot canyon floor. In places it widens to four feet and you breathe easier. In places it narrows to one and the wall is close enough to touch with your shoulder and the canyon floor is thirty meters down and you don\'t look down. The rock surface is good — friction, not scree — but weathered in sections where the face has been undercut by water and you can see daylight beneath the ledge at those points. The view from up here: the slot canyon laid out below you, the claw marks visible in miniature, and beyond the canyon rim, the broader canyon country spreading in a landscape that manages to be both beautiful and indifferent to whether you survive the viewing.',
    descriptionNight: 'The ledge trail at night is a different proposition. The darkness takes away your depth cues. The path is the path. You go slowly.',
    shortDescription: 'A two-foot ledge above the slot canyon — the view is extraordinary, the undercutting under your feet is notable, and you don\'t look down.',
    exits: {
      down: 'br_03_narrow_slot_canyon',
      north: 'br_07_canyon_crossroads',
      south: 'br_06_the_overhang',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.6, dusk: 1.5, night: 2.5, dawn: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.3, awareAggressive: 0.3 },
    },
    extras: [
      {
        keywords: ['undercut', 'ledge', 'daylight', 'beneath'],
        description: 'The section where the ledge is undercut: fifteen feet of trail where the water has worked at the rock beneath your feet from below and the surface is a shelf with air under it in places. You can hear the difference when you stamp — a different resonance. The stone is still thick enough. Probably. The canyon has been making this assessment for decades without changing its answer.',
        skillCheck: { skill: 'climbing', dc: 8, successAppend: 'You can identify the safest line through the undercut section — the thicker ridge close to the wall, not the outer edge. This path reduces the risk from unacceptable to merely uncomfortable.' },
      },
      {
        keywords: ['view', 'below', 'slot canyon', 'landscape', 'country'],
        description: 'From the ledge looking down: the slot canyon is a different space entirely seen from above. The claw marks are a stripe at the base of the east wall. The colors change — the top of the canyon wall is paler, bleached by exposure, and the deep colors are in the lower sections. The sky gap is at your height now and you can step back far enough to see the whole canyon system spreading south: ridge lines, rim edges, the shadow of each cut. It\'s very large. You\'re very small in it. Both things are accurate.',
      },
      {
        keywords: ['rock', 'friction', 'surface', 'path', 'trail'],
        description: 'The ledge trail has been used. Boot prints are visible in the dust in the wider sections, and the high-friction rock at the narrow points shows the patina of passage at the contact zones. Not a current-season footpath — older. Someone made this trail years ago or used it for years, and the trail has kept their marks.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // BR-05: Bone Hollow
  // ----------------------------------------------------------
  {
    id: 'br_05_bone_hollow',
    name: 'The Breaks — Bone Hollow',
    zone: 'the_breaks',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true },
    description: 'The hollow is a natural bowl in the canyon floor, sheltered by overhanging walls on three sides and open to the south. It gets its name from what\'s in it: bones. Dozens of them, distributed across the basin floor in the particular disorder of things that were brought here rather than moving here, then reduced over years by exposure. Some are animal — elk, deer, smaller things. Some are not. The not-animal bones have been here long enough to bleach. This is where the canyon collects its dead, or where something brought them. The lore of this place, for the rare people who know it: the first group that came through The Breaks, in year one, found the hollow empty. When they came back in year two, it was like this. Something was here, between those two visits, that is not here now.',
    descriptionNight: 'The hollow at night. The walls amplify sound from the south, and the south is where the canyon opens onto the broken country that connects to territory that nobody holds for good reasons. You lie still and listen and eventually you hear movement that may or may not be animal.',
    shortDescription: 'A natural bowl of bleached bones — some animal, some not — that was empty in year one and like this in year two.',
    exits: {
      north: 'br_03_narrow_slot_canyon',
      south: 'br_07_canyon_crossroads',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.30,
      timeModifier: { day: 0.6, dusk: 2.0, night: 4.0, dawn: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 40, quantity: { min: 2, max: 4, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'whisperer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.1, awarePassive: 0.2, awareAggressive: 0.7 },
      activityPool: {
        whisperer: [
          { desc: 'crouches at the hollow\'s edge calling a name in a voice that is close enough to right to be worse than wrong', weight: 3 },
        ],
        brute: [
          { desc: 'stands in the center of the bone field, its weight shifting from foot to foot in the pattern of something too large for simple stillness', weight: 2 },
        ],
      },
    },
    extras: [
      {
        keywords: ['bones', 'human', 'non-animal', 'skeletal'],
        description: 'The human-type bones are distributed in no pattern that implies burial — they were deposited, not placed. Skull fragments, long bones, ribs. Fully bleached and weathered, meaning years of exposure. The quantity: three to five individuals, based on what\'s countable. More may be under the surface deposits. The lack of clothing fragments suggests the bones have been here longer than fabric lasts in canyon conditions.',
        skillCheck: { skill: 'field_medicine', dc: 10, successAppend: 'The bone density and dental wear on the visible skull fragment suggests adult individuals. No obvious cause of death in the skeletal remains — the soft tissue evidence is long gone. What\'s notable: no clustering of bones. They weren\'t killed here together. They were moved here, separately, over time.' },
      },
      {
        keywords: ['hollow', 'bowl', 'basin', 'shape'],
        description: 'The hollow is acoustically strange — the three overhanging walls create a resonance that makes sounds from outside the hollow both amplified and directionless. You hear the canyon around you as if it\'s very close and from every direction simultaneously. This would be interesting in other circumstances. In these circumstances, it means you can\'t locate movement by sound.',
      },
      {
        keywords: ['year one', 'year two', 'history', 'empty', 'changed'],
        description: 'The first survey of The Breaks in Year One was conducted by a Drifter mapping team. Their report: the hollow was clear. Bone Hollow didn\'t have a name then. Year Two, a Crossroads scout passed through and found what you\'re standing in now. The bones weren\'t fresh — they were already weathering. Whatever happened here happened in the interval, and the interval was eight months. The scout\'s report is in Crossroads\' archive. Cross has a copy. The Salters have a copy. Nobody has gone back to investigate formally.',
        cycleGate: 2,
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'scavenging_useful_bones',
        spawnChance: 0.35,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A few large animal bones that could serve as tools or materials lie near the hollow edge.',
        depletion: { cooldownMinutes: { min: 90, max: 240 }, respawnChance: 0.30 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-06: The Overhang
  // ----------------------------------------------------------
  {
    id: 'br_06_the_overhang',
    name: 'The Breaks — The Overhang',
    zone: 'the_breaks',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { safeRest: true, campfireAllowed: true },
    description: 'A natural shelter — a sandstone overhang that provides cover from rain, shade from midday sun, and a defensible position with sightlines on three approach directions. Dry, sheltered, with a blackened fire circle at the back wall that has been used dozens of times. The smoke staining on the overhang ceiling tells the history of those fires in overlapping layers. On the back wall, under the overhang\'s deepest protection, the cave paintings: ancient pictographs in red ochre — hunting scenes, animal silhouettes, hand prints. Overlaid on them, in more recent layers: graffiti, tags, small drawings, a name and a date from 1987, a memorial to someone who died here in 2033. The wall is a three-thousand-year conversation that people have been adding to for as long as there\'s been anyone to add.',
    descriptionNight: 'The overhang at night is the safest rest in The Breaks. The fire circle, the stone shelter, the limited approach routes — it\'s the right room for this. With a fire, the warmth reflects from the back wall and the space becomes, briefly, comfortable. The cave paintings move in firelight.',
    shortDescription: 'A dry overhang with a fire circle, three-thousand-year-old paintings, and graffiti from 1987 and 2033 added to the conversation.',
    exits: {
      north: 'br_04_ledge_trail',
      south: 'br_07_canyon_crossroads',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cave paintings', 'pictographs', 'red ochre', 'ancient'],
        description: 'The pictographs: hunting scenes with stylized human figures and deer or elk in motion. Three to four thousand years old, the ochre faded but readable. The deer are depicted with the specific anatomical exaggeration of people who studied what they needed to study to eat — enlarged haunches, the line of the spine. The human figures are abstract. The handprints are not abstract: pressed flat against the stone, palm and all five fingers, some large, some that could be children\'s.',
      },
      {
        keywords: ['graffiti', 'modern', 'names', 'dates', 'layered'],
        description: 'Above the pictographs, in rough historical order: a 1987 RICK + LINDA in spray paint, badly faded. Several hiking party signatures from the early 2000s. A 2019 hash tag that already looks ancient. And then, from Year Two of the Collapse: a carefully drawn memorial — a name, CASSIDY VANCE, surrounded by a border of small hand-drawn flames, and below it: WE CAME HERE. WE WERE HERE. THIS IS A TRUE THING. The last-written entry.',
      },
      {
        keywords: ['fire circle', 'blackened', 'smoke', 'ceiling'],
        description: 'The fire circle is a permanent installation — river stones set in a ring, the interior blackened to carbon. The smoke staining on the ceiling above it is a layered record: some staining is ancient, some is fresh. The most recent fire was maybe a week ago, based on the ash pile. Someone was here a week ago, used this fire circle, left no other trace. In The Breaks, that\'s either good news or neutral news. Both are acceptable outcomes.',
      },
      {
        keywords: ['handprints', 'hands', 'palm', 'print'],
        description: 'The handprints are clustered at about shoulder height — adults. Some lower — children, maybe, or the same adults kneeling. They\'re pressed flat against the stone with pigment on the palm, a direct touch. Three thousand years ago, a person stood here and put their hand to this rock as a statement of presence: I was here. The rock kept it. You put your hand over one of the larger prints. Close. Not quite matching.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'breaks_wanderer_at_rest',
        spawnChance: 0.30,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A Drifter traveler sits at the fire circle, tending a small fire, their pack set against the wall. They look up at you with the calm assessment of someone who has been in enough wilderness shelters to have a practiced response: neutral, watchful, not unfriendly.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'br_overhang_shelter_traveler',
      },
    ],
    itemSpawns: [
      {
        entityId: 'tinder_bundle',
        spawnChance: 0.45,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.6, max: 1.0 },
        groundDescription: 'A bundle of dry tinder left at the fire circle by a previous traveler.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.40 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-07: Canyon Crossroads
  // ----------------------------------------------------------
  {
    id: 'br_07_canyon_crossroads',
    name: 'The Breaks — Canyon Crossroads',
    zone: 'the_breaks',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { fastTravelWaypoint: true },
    description: 'Four canyon corridors meet at a widening in the canyon floor that\'s just large enough to see all four directions before they curve out of sight. The problem is that the curves are close and the canyon walls are uniform enough that without a map or careful tracking, the four directions look like three and you won\'t know which one you came from. The junction is the disorientation point of The Breaks — the place where people have been turning themselves around since long before the Collapse. Sand on the floor shows multiple overlapping boot tracks going in various directions, which is less help than it sounds. A cairn at the center, built to knee height, serves as orientation reference. Someone tends it: the top stone is recent.',
    descriptionNight: 'The crossroads at night. Without a map and without stars — the canyon walls are high and the sky is a narrow strip — you are navigating by the texture of the walls and the angle of the incline. Most people stop here until dawn.',
    shortDescription: 'Four canyon corridors meeting in a space just wide enough to see them all, the cairn at the center tended by someone, and the boot tracks that help less than they should.',
    exits: {
      north: 'br_02_the_wash',
      south: 'br_05_bone_hollow',
      east: 'br_09_petroglyph_wall',
      west: 'br_08_nesting_gallery',
      up: 'br_12_canyon_rim_west',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.6, dusk: 1.5, night: 2.5, dawn: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 55, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.3, awareAggressive: 0.4 },
    },
    extras: [
      {
        keywords: ['cairn', 'stones', 'marker', 'orientation'],
        description: 'The cairn is seven stones high, which is enough to be visible but not enough to be a significant landmark from distance. The top stone is sandstone, unweathered at the contact surfaces — placed within days. Someone passes through here regularly enough to maintain this navigation aid, which means someone has reasons to move through the crossroads regularly, which in canyon country means they know where they\'re going in a way that makes them worth paying attention to.',
        skillCheck: { skill: 'tracking', dc: 10, successAppend: 'The boot prints in the sand around the cairn: overlapping, multiple individuals, multiple dates. But one consistent set — a small boot, specific tread pattern — appears in conjunction with the fresh top stone. This person has been here within the last few days, came from the west, left to the east. Lucid, maybe. Or a scout. Someone with a reason to move through here quietly.' },
      },
      {
        keywords: ['tracks', 'boot prints', 'footprints', 'sand'],
        description: 'The boot tracks in the crossroads sand are a palimpsest: each new set of feet partially obliterates the last. You can identify perhaps six separate individuals by tread pattern and size. All six came from at least two different directions, which means they came through, not from. The crossroads is a transit point. People don\'t live here. They pass through here on their way to something else, and the something else is in the four directions that curve out of sight.',
      },
      {
        keywords: ['disorienting', 'orientation', 'directions', 'navigation'],
        description: 'The disorientation is a feature of the canyon geometry: the walls curve at the same radius in each direction. Without differential landmarks — a specific rock formation, a change in the wall coloration, the angle of shadow at a known time — the four corridors are optically equivalent. You\'ve been here for two minutes and you are already less certain which corridor you arrived from than you were when you arrived. You make a note of a crack pattern in the east wall before you move.',
        skillCheck: { skill: 'survival', dc: 8, successAppend: 'You triangulate using the sun angle, the canyon wall shadow patterns, and the moss growth differential on north-facing surfaces. You have a reliable orientation now. You also spot a waymark scratch on the south wall that someone else made first.' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // BR-08: Nesting Gallery
  // ----------------------------------------------------------
  {
    id: 'br_08_nesting_gallery',
    name: 'The Breaks — Nesting Gallery',
    zone: 'the_breaks',
    act: 1,
    difficulty: 4,
    visited: false,
    flags: { questHub: true },
    description: 'The gallery is a wide section of canyon where the walls develop a series of horizontal shelves — natural ledges in the sandstone strata, each three to ten feet wide and running the length of the widened section. On these ledges, and on the canyon floor below them, a Hollow nesting site. The specific word is appropriate: this is not random Hollow density, this is organized occupation. Organic material arranged into sleeping depressions. Movement patterns that suggest individuals returning to specific locations. The smell is the particular compound of bodies and biological waste and something specific to Hollow that is not fully either. You count eight to twelve currently visible. The motion pattern among the ledges is the behavior of a group with spatial memory. They haven\'t noticed you yet. The caveat is: yet.',
    descriptionNight: 'The nesting gallery at night has more Hollow, not fewer. They converge here after dark. The ledges are full. The floor is occupied. The count doubles. Coming in at night is a decision with a specific character of consequence.',
    shortDescription: 'A canyon widening with natural ledges, eight to twelve Hollow organized in a true nesting site, and the singular tactical reality of yet.',
    exits: {
      east: 'br_07_canyon_crossroads',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.90,
      timeModifier: { night: 1.4, dawn: 0.8, dusk: 1.2, day: 0.6 },
      threatPool: [
        { type: 'screamer', weight: 2, quantity: { min: 1, max: 1, distribution: 'flat' } },
        { type: 'brute', weight: 1, quantity: { min: 1, max: 2, distribution: 'flat' } },
        { type: 'shuffler', weight: 3, quantity: { min: 2, max: 4, distribution: 'flat' } },
      ],
      awarenessRoll: { unaware: 0.1, awarePassive: 0.2, awareAggressive: 0.7 },
      noiseModifier: -5,
    },
    extras: [
      {
        keywords: ['ledges', 'shelves', 'strata', 'nesting', 'organized'],
        description: 'The nests: organic debris organized into rough depressions on the widest ledges. Sticks, fabric, hair — the material Hollow carry and collect without apparent purpose until the nesting behavior activates, which it apparently has. The depressions have a consistent diameter and depth. Whoever or whatever organized these applied a consistent template. That should not be possible for shufflers. It is possible for remnants. The question of how many remnants are in this gallery is one you have a strong interest in resolving quickly.',
        skillCheck: { skill: 'tracking', dc: 12, successAppend: 'Remnant sign: three of the ledge nests show evidence of extended occupation and modification — a remnant returns to the same nest, maintains it. Shufflers don\'t do this. You\'re looking at a remnant-organized nesting site, with shufflers as the general population. There\'s a hierarchy here. The hierarchy means there\'s something to neutralize that\'s not just volume.' },
      },
      {
        keywords: ['loot', 'deep loot', 'items', 'collected', 'gathered'],
        description: 'Hollow collect things in nesting behavior — not tools, not purposefully, but the accumulation of what they carry from former environments. On the ledge surfaces: fabric fragments, a rusted can, a broken knife handle, the remnant of a backpack. In the deeper nesting depressions: items protected by the Hollow\'s spatial preference. Things worth the extraction cost, which is a number that depends on how many you can deal with at once.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'hollow_nest_salvage',
        spawnChance: 0.60,
        quantity: { min: 2, max: 4, distribution: 'bell' },
        conditionRoll: { min: 0.2, max: 0.7 },
        groundDescription: 'Salvage items collected and deposited in the nesting gallery over months of Hollow occupation.',
        depletion: { cooldownMinutes: { min: 240, max: 720 }, respawnChance: 0.30 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-09: Petroglyph Wall
  // ----------------------------------------------------------
  {
    id: 'br_09_petroglyph_wall',
    name: 'The Breaks — Petroglyph Wall',
    zone: 'the_breaks',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { safeRest: false },
    description: 'The petroglyph wall is a twenty-meter section of flat sandstone face where the canyon briefly opens into a wider corridor, the surface smooth enough for detailed work and facing the right direction for light. The original petroglyphs cover the lower third: hammered and incised images, the deep red-black of desert varnish worked away — spirals, human figures, animal hunts, celestial objects, a sequence that appears to be a calendar. Above them, spray paint and knife engravings and marker tags span the last century of visitors. And above all of that, new: recent scratching in the stone, the work of the last five years. Symbols from the Collapse: CHARON-7\'s double helix, rendered twice in careful knife work. Faction marks. A map. The wall keeps receiving.',
    descriptionNight: 'The wall at night shows the petroglyphs differently — a lantern held close throws the hammered grooves into shadow and they\'re more visible, not less. The modern marks disappear; the ancient ones come forward.',
    shortDescription: 'Three thousand years of marks on one wall — petroglyphs, spray paint, and the double helix of CHARON-7 carved in the last five years.',
    exits: {
      west: 'br_07_canyon_crossroads',
      south: 'br_10_dry_spring',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.5, dusk: 1.5, night: 2.5, dawn: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
    },
    extras: [
      {
        keywords: ['petroglyphs', 'ancient', 'hammered', 'spiral', 'calendar', 'incised'],
        description: 'The ancient petroglyphs: spirals, which appear in rock art across the Southwest and which archaeologists have argued about for a century without definitive consensus. Human figures in the specific stylized abstraction of pre-historic rock art — body as torso-stroke, limbs as lines, head as circle. Animal hunts where the relationship between predator and prey is depicted with the knowledge of someone who participated in hunts. The calendar sequence: a serpentine line of marks that may track a lunar cycle. Three thousand years of someone\'s careful observation, still legible.',
      },
      {
        keywords: ['charon', 'double helix', 'collapse', 'new marks', 'modern'],
        description: 'The CHARON-7 double helix, carved twice in careful knife work, sits at eye height in the center of the post-Collapse section. Below it: THEY MADE US. Below that: AND THEN THEY MADE THEM. The statement positions whoever carved it as "us" — which faction, which belief, which faction of which belief is not clear. Above the helix, in different handwriting: AND WE\'RE STILL HERE. The conversation continues.',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'The double helix symbol predates common knowledge of MERIDIAN. It appeared on early Collapse-era documents from the facility before the bombing. Whoever carved this knew the symbol and its source. They were connected to MERIDIAN information before it became public, if it ever became public. That\'s either a Salter, a Reclaimer, or someone with access to things that most people don\'t have access to.' },
      },
      {
        keywords: ['map', 'carved map', 'scratched', 'routes'],
        description: 'In the northeast section of the wall, a scratched map in recent knife work. You can identify the canyon system around you, and beyond it, points labeled in small script. One point: GROTTO (arrow west, with what might be a distance notation). One point: RIM (arrow up). One point: SOUTH EXIT (large arrow, pointing south, with underline). And one point, in slightly different script that may be a different hand: SIGNAL (north, with a frequency notation that might be a radio frequency).',
      },
    ],
    npcSpawns: [],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // BR-10: The Dry Spring
  // ----------------------------------------------------------
  {
    id: 'br_10_dry_spring',
    name: 'The Breaks — The Dry Spring',
    zone: 'the_breaks',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { waterSource: true },
    description: 'The Dry Spring is misnamed, or honestly named depending on the season. Right now there is no water visible — the spring mouth in the rock face is dark and dry and surrounded by the mineral staining of water that was here recently and left no forwarding address. The cottonwoods nearby are not dead, which means water is in reach of their roots, which means within several feet of the surface, water exists. The signifiers of a working spring: the growth ring of moisture-preferring plants around the site, the slight depression in the ground at the spring mouth, the worn path to it from multiple approach directions. The spring will run again. Seasonality is a pattern, not a disaster.',
    descriptionNight: 'The spring at night. The cottonwoods are rustling in a breeze that\'s coming down the canyon from the north. The spring mouth is audible if you crouch near it and listen — a faint below-ground sound that might be water moving in rock, might be the canyon settling.',
    shortDescription: 'A spring that isn\'t running today but that the cottonwoods\' roots confirm exists below the surface — seasonal patience required.',
    exits: {
      north: 'br_09_petroglyph_wall',
      south: 'br_11_feral_kill_site',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.5, dusk: 1.5, night: 2.5, dawn: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
    },
    extras: [
      {
        keywords: ['cottonwoods', 'trees', 'roots', 'water', 'groundwater'],
        description: 'Cottonwood roots seek water at depth. The two cottonwoods flanking the spring are healthy — green leaves, full canopy, the specific vitality of trees with good water access. Their root systems reach to where the seasonal water table sits. That\'s your information: water is present in the geology, several feet down, accessible if you know to dig where you know to dig.',
        skillCheck: { skill: 'survival', dc: 8, successAppend: 'You read the ground depression and the plant distribution correctly and identify the subsurface flow path. Digging eighteen inches at the right spot produces seep water — slow, cold, clean enough to treat and drink. Approximately two liters per hour at this flow rate.' },
      },
      {
        keywords: ['mineral staining', 'water line', 'spring mouth', 'dry'],
        description: 'The staining around the spring mouth: orange-brown iron oxide, white calcium carbonate, the specific pattern of evaporation deposits. The most recent water line is at the spring mouth lip — within the last few weeks. Before that, the water was higher, and you can read the withdrawal as a sequence of mineral rings like tree rings, the season\'s recession recorded in chemistry.',
      },
      {
        keywords: ['path', 'worn', 'approach', 'trails', 'tracks'],
        description: 'Multiple approach paths converge on this spring, worn to bare earth from repeated use. The paths have a quality of time — not made in a season but established over years of foot traffic converging on water. Animal paths and human paths, both, and the older human paths are from before the Collapse, which means this spring was known and used long before the current set of problems.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'fresh_water_container',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A small amount of seep water has collected in a rock basin at the spring mouth.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.35 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-11: Feral Kill Site
  // ----------------------------------------------------------
  {
    id: 'br_11_feral_kill_site',
    name: 'The Breaks — Feral Kill Site',
    zone: 'the_breaks',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: {},
    description: 'The kill site is recent — recent enough that the smell is still present, the specific iron-copper smell of blood that hasn\'t fully dried. A deer carcass, mostly consumed, positioned in the way prey is positioned by something that eats with intent rather than accident. The pattern of the consumption and the position of what remains tell a story that you read against your will: no tool marks, no fire, no human-type processing. The animal was held while being consumed, based on the position of the spinal remains. The prints in the soft earth around the site are bipedal, narrow-footed, light-stepping — heel-strike minimal, ball of foot primary, the gait of something faster than a running human and quieter. Not Hollow. Sanguine. The first Sanguine sign you\'ve found in The Breaks.',
    descriptionNight: 'At night, with the iron smell still in the air, the kill site is the wrong place to be. The thing that made this came back to its kills, historically. The canyon acoustics will not help you determine from which direction.',
    shortDescription: 'A fresh deer kill consumed without tools — bipedal prints, heel-light gait, iron smell — the first Sanguine evidence in The Breaks.',
    exits: {
      north: 'br_10_dry_spring',
      west: 'br_07_canyon_crossroads',
      south: 'br_17_wind_carved_passage',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.08,
      timeModifier: { day: 0.3, dusk: 1.5, night: 2.5, dawn: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
    },
    extras: [
      {
        keywords: ['prints', 'tracks', 'bipedal', 'footprints', 'gait'],
        description: 'You crouch at the clearest print. Barefoot or minimal footwear — the full foot impression is present. The arch is deep and defined. The toe spread is wider than typical human. Most importantly: the heel impression is shallow and the ball impression is deep — a toe-heavy gait, the movement pattern of something that runs on its forefoot. Something fast, something quiet, something that evolved or was evolved for hunting in terrain exactly like this.',
        skillCheck: { skill: 'tracking', dc: 11, successAppend: 'Single individual. Came from the south, ate, left to the west. The approach and departure paths are different, which means the approach was the hunt and the departure was casual — the Sanguine wasn\'t concerned about backtracking its own trail. That suggests it knows this territory well enough to navigate it casually. It\'s been here before. It may live here.' },
      },
      {
        keywords: ['carcass', 'deer', 'blood', 'consumption', 'kill'],
        description: 'The carcass is positioned against the base of the east wall — backed against stone, which is where a predator that doesn\'t want to be approached from behind positions its meal. The consumption is efficient: the large muscle groups are gone, the organs are gone, the blood is consumed or dried. What remains is structural — bones, hide in sections, the extremities. This is not scavenging. This is systematic.',
      },
      {
        keywords: ['sanguine', 'feral', 'vampire', 'evidence', 'sign'],
        description: 'This is the first Sanguine evidence in The Breaks, but it\'s not the first kill here. Now that you know what you\'re looking for, you identify two older sites in the vicinity: bleached bone arrangements at the base of the east wall, the pattern of the earlier kills. The territory is established. The Sanguine that hunts here has been hunting here for at least a season, possibly longer.',
        cycleGate: 2,
        skillCheck: { skill: 'lore', dc: 12, successAppend: 'Feral Sanguine behavior: nomadic, territorial, avoid human settlements except when hunting, maintain a specific circuit range. A Feral hunting this canyon system would return on a regular cycle. The interval between old kills and this one suggests a seven to fourteen day return pattern.' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // BR-12: Canyon Rim West
  // ----------------------------------------------------------
  {
    id: 'br_12_canyon_rim_west',
    name: 'The Breaks — Canyon Rim, West',
    zone: 'the_breaks',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: {},
    description: 'The west rim is where the canyon country shows you what it is. You\'ve been in the cuts and corridors; now you\'re on top and the scale becomes visible. The canyon system below you spreads south for miles, the ridgelines and cut edges creating a three-dimensional geography of shadow and stone. The Breaks earned their name from up here — the land breaks repeatedly, the terrain refusing to be continuous. You can see the slot canyon from above, a dark line in the rock. You can see movement in a distant clearing that might be animals. You can see, to the east, the beginning of what might be Duskhollow territory — a manor on a rise, barely visible, but the roofline is recognizable as something that was built to be seen from a distance.',
    descriptionNight: 'The rim at night. The canyon below is pure darkness, the depth invisible. The Duskhollow manor has lights — not many, but specific, the lights of a building that is occupied and intends to remain so. From up here you can understand the geography of who controls what. The manor commands a view of everything you\'re standing in.',
    shortDescription: 'The west rim — the canyon system below in full scale, the slot canyon a dark line, and the Duskhollow manor just visible on its rise to the east.',
    exits: {
      down: 'br_07_canyon_crossroads',
      east: 'br_13_canyon_rim_east',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.5, dusk: 1.5, night: 2.0, dawn: 0.8 },
      threatPool: [
        { type: 'remnant', weight: 60, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.3, awareAggressive: 0.3 },
    },
    extras: [
      {
        keywords: ['view', 'canyon', 'below', 'scale', 'landscape'],
        description: 'The canyon system from above: ridgelines running roughly north-south, the cut corridors between them holding shadow throughout the day. You can see the wash as a lighter thread through the darker canyon floor. You can identify the widening at the nesting gallery by its shape. The petroglyph wall catches western light and is visible as a pale section of east-facing cliff. The scale of what you\'ve been moving through becomes intelligible from up here in a way it wasn\'t while you were inside it.',
      },
      {
        keywords: ['duskhollow', 'manor', 'east', 'roofline', 'sanguine'],
        description: 'The Duskhollow manor: a Victorian-era structure on a natural promontory to the east, the roofline and upper stories visible above the canyon rim. The architectural style is unmistakable and deliberate — this building was already there, and whoever occupies it chose it for the same reasons its original owner did: commanding position, sight lines in all directions, the social message of elevation. The Covenant of Dusk. You\'ve heard about them.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'Movement on the manor\'s upper story. A figure, at the window, looking out — looking toward where you\'re standing. They can\'t see you at this distance, in this light. You tell yourself this with the confidence of someone who doesn\'t fully know what they\'re dealing with.' },
      },
      {
        keywords: ['rappel', 'rope', 'descent', 'climbing'],
        description: 'A section of the west rim edge has been worn smooth at a specific point and shows rope friction marks on the rock face — a rappel point, used regularly enough to leave consistent wear. From this point, the descent to the canyon floor is forty feet. A skilled climber can free-climb it. A smart climber uses a rope. A rope isn\'t here right now.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // BR-13: Canyon Rim East
  // ----------------------------------------------------------
  {
    id: 'br_13_canyon_rim_east',
    name: 'The Breaks — Canyon Rim, East',
    zone: 'the_breaks',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: {},
    description: 'The east rim has a different quality than the west — closer to Duskhollow territory, which changes the ambient character of the space from exposure to proximity. From here the manor is clear: one mile, maybe less, on its promontory. The architecture is Victorian in ways that nobody is building Victorian architecture anymore, which means the Covenant of Dusk moved into something that already existed and made it theirs. The estate grounds below the manor are visible as geometric dark areas that might be gardens, might be other things. At this distance, with daylight, nothing specific is visible in the manor windows. At dusk, if you\'re still here, that changes.',
    descriptionNight: 'From the east rim at dusk and after: the manor is lit, and the figures in the lit windows are more visible. Not clearly — not enough to identify — but the silhouettes have the general shape of people and the movement has a specific quality of awareness that makes you certain you\'re being watched in return. This is the first visual of Duskhollow. This is what it looks like from the outside.',
    shortDescription: 'The east rim — Duskhollow manor at under a mile, Victorian architecture against the canyon sky, and the quality of being watched that you can\'t quite confirm.',
    exits: {
      west: 'br_12_canyon_rim_west',
      east: 'br_16_south_exit',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.4, dusk: 1.8, night: 2.5, dawn: 1.0 },
      threatPool: [
        { type: 'remnant', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'shuffler', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
    },
    extras: [
      {
        keywords: ['manor', 'duskhollow', 'victorian', 'building', 'architecture'],
        description: 'The manor was built in 1887, if the county courthouse records you found in Covenant are accurate. Three stories, wraparound porch on the lower two, peaked dormers at the roofline. Built for a mining claim family that had too much money and a preference for the aesthetic of somewhere else. When they left — or when their line ended — the building stayed. The Covenant of Dusk found it occupied and undamaged in Year One. They considered this significant.',
      },
      {
        keywords: ['grounds', 'gardens', 'estate', 'territory'],
        description: 'The dark geometric areas below the manor: from this distance, you can identify what looks like structured planting — gardens, yes, but also areas that have been cleared and maintained in specific shapes. The Covenant of Dusk maintains their territory with the same care they bring to the manor itself. This is territorial management of the kind that takes permanent occupation to produce.',
      },
      {
        keywords: ['watching', 'window', 'silhouette', 'seen', 'observed'],
        description: 'The quality of being watched has a physical sensation that you\'ve learned to trust. Standing at the east rim, in the direction of a manor occupied by Sanguine with enhanced senses, at a distance that might or might not exceed their range: you feel it. Whether it\'s accurate perception or appropriate anxiety is a question that you can\'t answer until you\'ve been closer, which you have decided to file for later consideration.',
        skillCheck: { skill: 'perception', dc: 13, successAppend: 'Confirmation: upper story window, east face. A figure, still enough to be watching, movement minimal. And — you\'re almost certain — a second figure in the adjacent window, not watching you but watching the first figure. They\'re aware of you. They\'re discussing you. The Covenant of Dusk knows you\'re on their perimeter.' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // BR-14: The Hidden Grotto
  // ----------------------------------------------------------
  {
    id: 'br_14_hidden_grotto',
    name: 'The Breaks — The Hidden Grotto',
    zone: 'the_breaks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { hiddenRoom: true, safeRest: true },
    description: 'The grotto is behind a rockfall that looks, from every angle, like the approach to a dead end. The gap requires a specific entry sequence — down between two boulders, through a crack that you need to turn sideways for, and then suddenly: a natural room the size of a large living space, the ceiling twenty feet up, a seep spring running clean water down the back wall. Someone has been using this space for an extended period. Evidence: a sleeping mat in good condition, a supply cache in a natural stone alcove, light cooking gear, and a small radio unit wired to a power cell salvaged from a vehicle. And books — four of them, a pre-Collapse medical text and three notebooks in careful handwriting that you recognize, if you know the style of Lucid Sanguine documentation, as the record-keeping of someone trying to solve a very specific biological problem from inside it.',
    descriptionNight: 'The grotto is the same at night — the seep spring sounds louder, the radio is off or idle. If someone is using this space, they tend to use it more at night, not less. Sanguine are active after dark.',
    shortDescription: 'A hidden room behind a rockfall — spring water, a supply cache, a radio, and four books that read like a Lucid Sanguine\'s medical research journal.',
    exits: {
      east: 'br_07_canyon_crossroads',
    },
    richExits: {
      east: {
        destination: 'br_07_canyon_crossroads',
        hidden: true,
        discoverSkill: 'tracking',
        discoverDc: 14,
        descriptionVerbose: 'the hidden grotto entrance — Tracking DC 14 to find',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['notebooks', 'books', 'writing', 'medical', 'research'],
        description: 'The notebooks: three volumes, hand-written, dense. The handwriting is careful and consistent — a scientist\'s notation. The subject: CHARON-7 viral expression in Sanguine physiology, the attempt to develop a suppressor compound, and a running assessment of therapeutic options. The author identifies themselves by initials only: A.O. The medical text — Gray\'s Anatomy, post-Collapse edition — has margin notes in the same hand, cross-referencing the notebook entries with standard anatomy at specific page numbers. Dr. Ama Osei. You\'ve heard the name.',
        cycleGate: 2,
        skillCheck: { skill: 'field_medicine', dc: 13, successAppend: 'The suppressor compound work in notebook three is seven pages into a promising approach — a silver compound analog that targets the CHARON-7 expression without the systemic toxicity of pure silver. This is not theoretical. The trial data notation suggests active experimentation. Osei is close to something. The data is three months old.' },
      },
      {
        keywords: ['radio', 'power cell', 'signal', 'frequency'],
        description: 'The radio unit is a simple handheld, modified with an external antenna wired to the back wall. The frequency display is set. You recognize the frequency as one of the fragments you may have encountered at the petroglyph wall: SIGNAL (north). This radio is pointed at the MERIDIAN broadcast. Someone in this grotto has been listening to the signal long enough to need a permanent setup.',
      },
      {
        keywords: ['spring', 'seep', 'water', 'clean'],
        description: 'The seep spring runs a slow consistent trickle down the back wall into a natural stone basin. The water is clear and cold and smells clean. It\'s been tested: beside the basin, a small chemistry kit with the testing drops used for water purification assessment, the most recent test paper still readable — clean. This is a considered, long-term occupation of a water source. This space was chosen.',
      },
      {
        keywords: ['supply cache', 'alcove', 'food', 'gear', 'cache'],
        description: 'The alcove cache: dried food for two weeks, a first aid kit in excellent condition, spare power cells for the radio, three knives in different sizes, a set of climbing equipment, and in the back of the alcove, carefully wrapped in oil cloth: a vial case with six filled vials, labeled with Osei\'s initials and a date from eight months ago. What the vials contain is not labeled. The oil cloth is not accidental protection. The vials matter to someone.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'lucid_sanguine_osei',
        spawnChance: 0.25,
        spawnType: 'event',
        activityPool: [
          { desc: 'A woman sits at the far end of the grotto with a notebook in her lap and a pen in one hand, writing by the light of a chemical glow stick. She doesn\'t startle when you come through the gap. She was already listening.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.4, wary: 0.4, hostile: 0.1 },
        dialogueTree: 'br_osei_grotto_encounter',
        narrativeNotes: 'Dr. Ama Osei. Lucid Sanguine virologist. Optional encounter. Her questline connects to the cure ending.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'osei_research_notebook',
        spawnChance: 0.80,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 0.9 },
        groundDescription: 'A notebook with careful scientific handwriting, left open at a page of compound formulas.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-15: Mesa Top
  // ----------------------------------------------------------
  {
    id: 'br_15_mesa_top',
    name: 'The Breaks — Mesa Top',
    zone: 'the_breaks',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: { fastTravelWaypoint: true, scavengingZone: true },
    description: 'The mesa is flat, exposed, and exactly what mesas are: a table of rock above the surrounding geography with a 360-degree view and no cover. The view from up here is the view that the Four Corners gives you when you\'ve earned altitude: the canyon systems to the south and west, the highway corridor to the north, Duskhollow Manor on its promontory to the east, and the distant mountains to the north where the Scar sits in its mountain geography. The weather station here is pre-Collapse Forest Service equipment, largely non-functional but maintaining one component that still works: a radio receiver on a still-live power cell, connected to a salvaged speaker. The receiver is picking up a signal. The signal is coming from the north.',
    descriptionNight: 'The mesa at night is the best place in The Breaks to look at the sky, and the sky gives you: the MERIDIAN signal, the stars, and the cold. All three are consistent.',
    shortDescription: 'A flat-topped mesa with 360-degree view, a Forest Service weather station, and a radio receiver still picking up a signal from the north.',
    exits: {
      down: 'br_07_canyon_crossroads',
      east: 'br_18_the_chimney',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.6, dusk: 1.5, night: 2.0, dawn: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 55, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
    },
    extras: [
      {
        keywords: ['radio', 'signal', 'receiver', 'frequency', 'north'],
        description: 'The radio receiver is on. The speaker produces: static, then a signal, then static again — intermittent, repeating on a cycle. The signal contains voice data, processed into a repeating pattern that doesn\'t resolve into speech at this distance and this equipment quality. But it\'s structured, not random. It repeats on a seventeen-second cycle. Automated broadcast, almost certainly. Coming from the northern mountains. Coming from where MERIDIAN is.',
        skillCheck: { skill: 'electronics', dc: 11, successAppend: 'You clean the signal enough to distinguish syllables in the repeating pattern: two or three words, cycling. You can\'t decode them at this equipment quality, but you can record the pattern in your notes. Someone with better radio equipment — Sparks at Crossroads, maybe, or the Reclaimers\' array — could decode it from your transcription.' },
      },
      {
        keywords: ['view', '360', 'landscape', 'mountains', 'scar'],
        description: 'Standing at the mesa center with 360 degrees available: south and west is canyon country, the Breaks spreading in its broken geography. North is the highway corridor and beyond it, the mountains. Northeast is Duskhollow manor. Northwest, barely visible at the limit of clear-day sight, a smudge on the mountain that might be the Stacks, the Reclaimers\' facility. The Scar is further north — forty miles minimum, in the high altitude range, not visible directly but the direction is clear: north, into the mountains, toward the snow line.',
      },
      {
        keywords: ['weather station', 'forest service', 'equipment'],
        description: 'The Forest Service station is mostly non-functional: the anemometer is seized, the precipitation gauge is cracked, the solar panels are clouded with years of mineral deposit. But the receiver is running because its power cell is better made than the rest and because someone, within the last year, connected it to the speaker. Someone knew the receiver was functional. Someone wanted the signal to be audible here.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'radio_signal_fragment',
        spawnChance: 0.90,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.8 },
        groundDescription: 'A paper log beside the receiver with someone\'s partial transcription of the signal pattern — handwritten, left for anyone who might follow.',
        depletion: { cooldownMinutes: { min: 720, max: 2160 }, respawnChance: 0.50 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-16: South Exit
  // ----------------------------------------------------------
  {
    id: 'br_16_south_exit',
    name: 'The Breaks — South Exit',
    zone: 'the_breaks',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: {},
    description: 'The canyon country ends at its southern edge not in a clean boundary but in the gradual way that one kind of territory yields to another. The canyon walls flatten and spread, the slot corridors opening into wide draws, the ground cover transitioning from canyon flora to the rougher scrub of the lower elevation country that connects to Duskhollow territory. The exit itself is a dry wash mouth where the canyon floor levels out and the surrounding terrain loses its vertical dimension. Beyond it: the beginnings of the road to the Pens, Duskhollow Manor visible on its ridge three miles out, and the sense of being past the boundary of somewhere and not yet inside the boundary of somewhere else. The in-between space. In this world, the in-between spaces are where things find you.',
    descriptionNight: 'At night the south exit is the most exposed position in The Breaks. No canyon walls to your back. The open country beyond. Duskhollow manor lit on its ridge. Whatever hunts the canyon country will follow you out if you leave after dark.',
    shortDescription: 'Where canyon country ends and Duskhollow territory begins — the in-between space, three miles from the manor, no canyon walls behind you.',
    exits: {
      north: 'br_13_canyon_rim_east',
      west: 'br_19_bleached_mesa_edge',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.6, dusk: 2.0, night: 3.5, dawn: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 45, quantity: { min: 2, max: 4, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.2, awareAggressive: 0.6 },
    },
    extras: [
      {
        keywords: ['duskhollow', 'manor', 'ridge', 'three miles', 'territory'],
        description: 'The manor is three miles, maybe slightly less. Its promontory is visible as a dark shape against the lighter sky. The road from here to the manor is a former county lane, maintained enough to be recognizable as a road. The Covenant of Dusk patrols this road at irregular intervals, which is a piece of information you\'ve gathered from various sources that you now have occasion to use.',
        cycleGate: 2,
      },
      {
        keywords: ['in-between', 'transition', 'boundary', 'exposed', 'open'],
        description: 'The in-between space has its own character: too exposed for comfortable travel, too close to Duskhollow territory for strategic safety, too far from The Breaks for the canyon walls to offer anything. This is the point where the adventurous assessment of your route has to yield to the practical assessment of your exposure. The question is not whether to proceed but whether you are prepared for what proceeding means.',
      },
      {
        keywords: ['road', 'county lane', 'path', 'approach'],
        description: 'The former county lane is two cracked tire tracks with weeds down the center, maintained to recognizability by periodic use. Someone drives or walks it. The tire track width is consistent with a vehicle — the Covenant of Dusk has vehicles, according to sources. The most recent tracks are too old to date precisely but too recent to predate the Collapse. Someone has been on this road in the last several months.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'dusk_covenant_patrol',
        spawnChance: 0.20,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'Two figures in dark, well-tailored clothing move along the county lane toward the canyon exit. They see you before you\'re certain you see them. One of them holds up a hand — halt, or greeting; at this distance, the difference requires interpretation.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.4, wary: 0.4, hostile: 0.1 },
        dialogueTree: 'br_dusk_patrol_encounter',
        narrativeNotes: 'First possible encounter with Covenant of Dusk. Act II introduction.',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // BR-17: Wind-Carved Passage
  // ----------------------------------------------------------
  {
    id: 'br_17_wind_carved_passage',
    name: 'The Breaks — Wind-Carved Passage',
    zone: 'the_breaks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: {},
    description: 'The passage runs between two walls of sandstone that the wind has shaped into something the rock never intended. The forms are aerodynamic — smooth concavities at ground level, fluted ridges at head height, the entire corridor sculpted by centuries of prevailing current into a gallery of erosion. The wind is constant here and directional, funneled by the canyon geometry into a steady draw from the south that dries the skin on your face and carries the smell of dust and something mineral and sharp. The floor is bare rock, scoured clean of sand and debris by the same current that shaped the walls. Every loose thing that was ever here has been moved somewhere else. What remains is architecture: clean, curved, and stripped to the specific beauty of things that survive by having nothing left to lose.',
    descriptionNight: 'The wind does not stop at night. It changes pitch — lower, steadier, the temperature drop making the air denser and the sound deeper. The passage becomes a wind instrument, the fluted walls producing a tone that is not quite a whistle and not quite a moan, sustained and unbroken. You move through it the way you move through sound: aware that it is everywhere and that you are inside it.',
    shortDescription: 'A wind-sculpted corridor of bare rock and fluted walls — the air constant, directional, carrying dust and the mineral smell of a canyon that has been refining itself for centuries.',
    exits: {
      north: 'br_11_feral_kill_site',
      east: 'br_19_bleached_mesa_edge',
      up: 'br_18_the_chimney',
    },
    richExits: {
      up: {
        destination: 'br_18_the_chimney',
        skillGate: { skill: 'climbing', dc: 11, failMessage: 'The chimney walls are smooth from wind polish. You can see the holds, but the sequence requires a confidence in vertical movement that you haven\'t earned yet.' },
        descriptionVerbose: 'a vertical chimney in the rock, climbing up — Climbing DC 11',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.18,
      timeModifier: { day: 0.5, dusk: 1.5, night: 3.0, dawn: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.3, awareAggressive: 0.4 },
      noiseModifier: -3,
    },
    extras: [
      {
        keywords: ['wind', 'air', 'current', 'sound', 'noise'],
        description: 'The wind is a consistent twelve to fifteen miles per hour — enough to affect sound propagation, enough to carry scent in one direction and deny it in the other. You are downwind of everything to the south and upwind of everything to the north, which is tactically significant in a way that the canyon makes you learn: anything approaching from the south will smell you long before you hear it. Anything approaching from the north, you will hear through the wind and it will not smell you at all. The canyon has opinions about which direction is safer.',
        skillCheck: { skill: 'survival', dc: 10, successAppend: 'The wind pattern tells you something about this corridor\'s weather behavior: in a storm, the funneling effect would triple the wind speed. Flash weather in this passage means forty-five-mile-per-hour gusts in a corridor barely wider than your wingspan. The scour marks on the walls confirm this. You do not want to be here when the weather changes.' },
      },
      {
        keywords: ['walls', 'fluted', 'sculpted', 'erosion', 'carved'],
        description: 'The wall surfaces are a textbook of aeolian erosion — the smooth concavities at ground level are ventifacts, carved by centuries of sand-laden wind. The fluted ridges higher up are where the airflow separates and accelerates, cutting deeper channels into the less resistant strata. You run your hand along one of the ridges: silk-smooth, the grain of the sandstone polished to a finish that no tool could replicate. The canyon spent longer on this wall than human civilization has existed.',
      },
      {
        keywords: ['floor', 'rock', 'bare', 'scoured', 'clean'],
        description: 'The floor is wind-polished bedrock, the surface showing the ripple texture of the underlying formation. Nothing accumulates here — no sand, no debris, no organic material. The wind cleans this corridor the way a river cleans its channel: constantly and without discrimination. Any tracks you leave will be gone by morning. Any tracks left by something else are already gone. The passage keeps no record of who moves through it.',
        skillCheck: { skill: 'tracking', dc: 13, successAppend: 'Not entirely true. At the base of the east wall, in a sheltered concavity where the wind eddies rather than scours, you find a partial print. Narrow foot, deep ball impression, minimal heel — the same gait signature as the feral kill site to the north. The Sanguine uses this passage. The sheltered print is recent.' },
      },
      {
        keywords: ['smell', 'mineral', 'sharp', 'dust', 'air quality'],
        description: 'The mineral smell is specific: calcium sulfate, the breakdown product of gypsum deposits somewhere in the canyon system to the south. The sharpness is ozone — the friction of wind against stone produces it in trace amounts, the same phenomenon that makes the air before a thunderstorm taste electric. Breathing here is breathing the canyon\'s chemistry directly. Your lungs register it as dry and clean and very slightly abrasive, the air equivalent of drinking water with high mineral content.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'mineral_sample',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A chunk of gypsum crystal, wind-exposed in the wall, loosened enough to extract.',
        depletion: { cooldownMinutes: { min: 180, max: 480 }, respawnChance: 0.30 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-18: The Chimney
  // ----------------------------------------------------------
  {
    id: 'br_18_the_chimney',
    name: 'The Breaks — The Chimney',
    zone: 'the_breaks',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { scavengingZone: true },
    description: 'The chimney is a natural vertical shaft in the canyon rock, fifteen feet in diameter and sixty feet tall, open at the top to a circle of sky that frames the weather like a lens. The interior walls are layered sandstone in alternating bands of rust and cream, each band a different hardness, the softer layers eroded into horizontal shelves that serve as the only way up or down. Halfway up, a ledge wide enough to stand on holds the remains of a pre-Collapse climbing anchor — bolted steel, the expansion bolt still solid in the rock, the carabiner gate rusted open. Someone established this route formally. The rope is gone. At the base of the chimney, in a depression that collects what the wind drops from above: bird bones, feathers, the desiccated remains of a pack rat midden, and a human femur, standing upright in the debris like a post. It fell from somewhere above. Everything here fell from somewhere above.',
    descriptionNight: 'The chimney at night is a well of darkness with a circle of stars at the top. The acoustic properties change — sounds from above echo down with a clarity that makes the distance uncertain. A coyote call from the rim sounds like it\'s in the shaft with you. Your own breathing comes back to you from the walls.',
    shortDescription: 'A sixty-foot vertical shaft, open sky at the top, climbing anchors halfway up, and everything at the bottom arrived by falling.',
    exits: {
      down: 'br_17_wind_carved_passage',
      west: 'br_15_mesa_top',
    },
    richExits: {
      down: {
        destination: 'br_17_wind_carved_passage',
        descriptionVerbose: 'down the chimney to the wind-carved passage below',
      },
      west: {
        destination: 'br_15_mesa_top',
        descriptionVerbose: 'west along the rim trail to the mesa top',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.6, dusk: 1.8, night: 2.5, dawn: 1.0 },
      threatPool: [
        { type: 'remnant', weight: 55, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'shuffler', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.3, awareAggressive: 0.5 },
      noiseModifier: -4,
    },
    extras: [
      {
        keywords: ['anchor', 'bolt', 'climbing', 'carabiner', 'route'],
        description: 'The climbing anchor is a three-bolt station, drilled and set with expansion bolts rated for lead climbing falls. Pre-Collapse recreational installation — someone climbed this chimney for fun, in the era when fun was a category of activity that people planned weekends around. The bolts are solid. The hangers are corroded but functional. The carabiner is frozen open, which means it\'s a display piece now, not hardware. The anchor tells you this route was climbed regularly enough to justify a permanent installation.',
        skillCheck: { skill: 'mechanics', dc: 10, successAppend: 'The bolt placement is textbook — equalized, redundant, oriented to hold an outward pull. The second bolt from the left has a hairline crack in the surrounding rock that wasn\'t there at installation. Load-bearing capacity is reduced but not compromised. You would use bolts one and three and skip two. You note this the way you note all structural assessments: automatically and without choosing to.' },
      },
      {
        keywords: ['femur', 'bone', 'human', 'upright', 'debris'],
        description: 'The femur is adult, fully bleached, standing in the debris at an angle that gravity and the debris pile conspired to produce — it wasn\'t placed, it landed. The fall from the chimney rim to the base is sixty feet. You look up and consider the angles. A person fell, or was dropped, and the soft tissue decomposed here at the chimney base while the bones distributed according to the physics of decomposition in an enclosed vertical space. The femur is the largest surviving fragment at the surface. There may be more beneath the midden.',
        skillCheck: { skill: 'field_medicine', dc: 11, successAppend: 'The bone shows no perimortem fracture at the visible end — no spiral break from the fall impact, which means the bone you\'re seeing separated from the skeleton post-mortem. The fall was not necessarily the cause of death. Someone could have been dead before they went over the edge. That distinction matters less to the dead person than it does to your assessment of what happens at the top of this chimney.' },
      },
      {
        keywords: ['walls', 'layers', 'bands', 'sandstone', 'shelves'],
        description: 'The alternating bands are a geological core sample turned vertical: the rust layers are iron-rich sandstone, harder, forming the shelves you climb on. The cream layers are calcium-rich, softer, eroding inward to create the horizontal gaps between shelves. The pattern repeats with the regularity of a thing that took forty million years to establish. Each shelf is between six inches and two feet deep — enough for a handhold, enough for a foothold, not enough for comfort. The chimney was not designed for climbing. The climbing is a consequence of the geology, not a feature of it.',
      },
      {
        keywords: ['sky', 'circle', 'top', 'above', 'opening'],
        description: 'The circle of sky at the chimney top is fifteen feet across and sixty feet up. It frames weather systems as discrete events — a cloud passes through the circle like a slide in a projector. Birds cross it occasionally: ravens, mostly, their silhouettes the specific ragged-wing shape that distinguishes them from everything else at altitude. One raven lands on the rim and looks down at you with the patient assessment of something that has evolved to recognize opportunity in things that can\'t climb out.',
      },
      {
        keywords: ['midden', 'pack rat', 'feathers', 'bird bones', 'debris pile'],
        description: 'The pack rat midden at the chimney base is a compressed history of everything that fell or was carried here: juniper twigs, bird bones, feathers in stages of decomposition from recent to ancient, small mammal bones, seed casings, and the human remains distributed through the upper layer. The midden is three feet deep at its center. Beneath the organic layer: sand, stone fragments, and at the very bottom, if you dig, the polished bedrock of the chimney floor. Everything above the bedrock is deposit. The chimney collects.',
        skillCheck: { skill: 'scavenging', dc: 9, successAppend: 'In the midden, lodged between compressed debris layers: a waterproof stuff sack, faded red, containing a pre-Collapse first aid kit in fair condition. Someone\'s climbing pack, separated from its owner at the chimney top and deposited here by the same gravity that deposited everything else.' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'first_aid_kit_basic',
        spawnChance: 0.35,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'A faded red stuff sack wedged in the debris pile at the chimney base — a climber\'s first aid kit, separated from its owner.',
        depletion: { cooldownMinutes: { min: 480, max: 1440 }, respawnChance: 0.15 },
      },
      {
        entityId: 'scrap_metal',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'Corroded climbing hardware scattered in the debris — carabiners, a piton, fragments of a cam device.',
        depletion: { cooldownMinutes: { min: 360, max: 720 }, respawnChance: 0.20 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-19: Bleached Mesa Edge
  // ----------------------------------------------------------
  {
    id: 'br_19_bleached_mesa_edge',
    name: 'The Breaks — Bleached Mesa Edge',
    zone: 'the_breaks',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: {},
    description: 'The mesa edge is where the land runs out of argument. The sandstone shelf extends south and then stops, a clean vertical drop of a hundred and twenty feet to the broken talus field below, the edge worn smooth by the specific patience of weather applied to stone without interruption. The rock here is bleached pale — almost white in direct sun, the iron content leached out by millennia of exposure, leaving a calcium-white surface that reflects heat and light with equal indifference. The edge itself is fractured in places, hairline cracks running perpendicular to the drop, each crack a future where the mesa is smaller than it is now. A juniper tree grows at the edge, its root system visibly gripping the fractured rock in a display of botanical stubbornness that would be admirable if it weren\'t also holding together the section of edge you\'re standing on.',
    descriptionNight: 'The mesa edge at night is a line between the pale rock at your feet and the void beyond it. The drop is invisible — you know it\'s there because you saw it in daylight. The juniper is a dark shape against the stars. The talus field below produces occasional sounds: the thermal contraction of rock, the movement of things that prefer the dark, the specific silence of a hundred and twenty feet of empty air.',
    shortDescription: 'A bleached shelf of white stone ending at a hundred-and-twenty-foot drop — fractured edge, one stubborn juniper, and the talus field far below.',
    exits: {
      west: 'br_17_wind_carved_passage',
      east: 'br_16_south_exit',
      down: 'br_20_seep_grotto',
    },
    richExits: {
      down: {
        destination: 'br_20_seep_grotto',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 12,
        discoverMessage: 'Behind the juniper\'s root mass, where the edge fracture has opened a gap in the rock face, you notice airflow — cool and damp, rising from below. A narrow chimney descends into darkness. It\'s passable.',
        skillGate: { skill: 'climbing', dc: 12, failMessage: 'The descent is a tight chimney with minimal holds. You can feel the damp air rising from below but the route down requires more skill than you currently possess.' },
        descriptionVerbose: 'a narrow chimney behind the juniper roots, descending — Perception DC 12 to discover, Climbing DC 12 to descend',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.14,
      timeModifier: { day: 0.4, dusk: 1.5, night: 2.5, dawn: 1.0 },
      threatPool: [
        { type: 'remnant', weight: 45, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'shuffler', weight: 35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.3, awareAggressive: 0.4 },
    },
    extras: [
      {
        keywords: ['edge', 'drop', 'cliff', 'vertical', 'fall'],
        description: 'You approach the edge on your stomach for the last two meters, which is the correct approach. The drop is clean — vertical sandstone, the face showing the same alternating rust-and-cream banding as the chimney, but at a scale that turns geological layers into a wall you could spend minutes reading. At the base: talus, the broken rock of previous collapses, a field of boulders ranging from car-sized to house-sized. The distance down is the kind of distance that your body processes before your mind does. Your hands grip the rock harder without being told to.',
        skillCheck: { skill: 'survival', dc: 11, successAppend: 'The crack pattern at the edge tells you something specific: this section of mesa is in active recession. The hairline fractures are frost-wedge cracks — water enters, freezes, expands, and the rock separates a fraction of a millimeter per cycle. The juniper section has perhaps a decade before the fracture network isolates it completely. You make a note to not stand on the juniper section longer than necessary.' },
      },
      {
        keywords: ['juniper', 'tree', 'roots', 'edge', 'grip'],
        description: 'The juniper is a Utah juniper, Juniperus osteosperma, and it has been growing at this edge for what the trunk diameter suggests is two hundred years. Its root system is visible where the edge erosion has exposed it — a network of woody tendrils gripping the fractured rock the way fingers grip a ledge. The tree is alive and healthy in the way that junipers are healthy: slowly, stubbornly, without visible enthusiasm. Its canopy extends over the drop, casting shade on nothing. The berries on its lower branches are ripe — small, blue-purple, aromatic with the specific gin-botanical smell of juniper oil.',
        skillCheck: { skill: 'field_medicine', dc: 9, successAppend: 'Juniper berries: antimicrobial, diuretic, the active compounds useful in a field medicine context for urinary tract infections and as a mild antiseptic wash. You collect a handful. They\'re also edible in small quantities, which is the kind of information that\'s trivial until it isn\'t.' },
      },
      {
        keywords: ['bleached', 'white', 'pale', 'rock', 'calcium', 'surface'],
        description: 'The bleaching is chemical: iron oxide leached from the sandstone by long-term water exposure, leaving the calcium carbonate matrix visible. The effect is striking — a white shelf amid the surrounding red-orange canyon country, visible from distance and from below. The surface is reflective enough in direct sun to produce a glare that makes the edge harder to judge, which is a design flaw in an already dangerous geography. The rock is warm to the touch even at dusk, the thermal mass of a light-colored stone that has been absorbing sunlight all day.',
      },
      {
        keywords: ['talus', 'below', 'boulders', 'field', 'base'],
        description: 'The talus field at the base of the drop is the accumulated evidence of the mesa\'s erosion history — every boulder down there was once part of the edge you\'re standing on. The largest blocks are house-sized, their flat faces showing the same bleached white as the mesa top, their impact sites visible as depressions in the surrounding debris. The field extends south for a hundred meters before the terrain levels. Among the boulders: shadow, shelter, and the specific quality of spaces that things use to hide. You watch the shadows for movement. The shadows do not move. This is not the same as nothing being there.',
        skillCheck: { skill: 'tracking', dc: 12, successAppend: 'Movement. Southeast quadrant of the talus field, in the shadow between two car-sized blocks. Not Hollow — the movement pattern is too fast, too deliberate. A figure, bipedal, moving between cover points with the practiced efficiency of something that knows this terrain. Sanguine, or human. At this distance you cannot distinguish. It does not look up.' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'wild_herbs',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'Wild sage and juniper berries growing at the mesa edge, accessible if you don\'t mind the proximity to the drop.',
        depletion: { cooldownMinutes: { min: 180, max: 480 }, respawnChance: 0.45 },
      },
    ],
  },

  // ----------------------------------------------------------
  // BR-20: The Seep Grotto
  // ----------------------------------------------------------
  {
    id: 'br_20_seep_grotto',
    name: 'The Breaks — The Seep Grotto',
    zone: 'the_breaks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { hiddenRoom: true, safeRest: true, waterSource: true, campfireAllowed: true },
    description: 'The chimney descent opens into a space that the canyon has been keeping to itself. A grotto carved into the mesa\'s interior by water that is still here — seeping from three separate points in the domed ceiling, running in slow threads down walls coated in mineral deposit and living moss, collecting in a stone basin at the room\'s center that is clear and cold and deep enough to submerge your hands to the wrists. The light is indirect, entering through the chimney above and through a horizontal crack in the south wall that admits a blade of daylight across the basin surface. The air is fifteen degrees cooler than outside and carries the green smell of wet stone and growing things. On the grotto walls, where the mineral deposits have built up in flowstone curtains: the preserved tracks of water\'s patient work, each ripple in the flowstone a year, each curtain a century. Someone has been here before you — a fire ring near the south wall, a carved shelf in the softer stone holding a sealed tin, and on the wall beside it, scratched in careful letters: DRINK. REST. LEAVE IT BETTER.',
    descriptionNight: 'The grotto at night is unchanged by the hour — the light from the chimney shifts from daylight to starlight, the horizontal crack goes dark, and the seep water continues without reference to any schedule. With a fire in the ring, the flowstone walls catch the light and the mineral deposits glow amber and white, the grotto becoming something that looks designed rather than discovered. The water sounds are louder in the dark. The temperature holds.',
    shortDescription: 'A hidden grotto inside the mesa — seep water, moss, flowstone walls, a fire ring, and a carved message that says everything necessary in six words.',
    exits: {
      up: 'br_19_bleached_mesa_edge',
    },
    richExits: {
      up: {
        destination: 'br_19_bleached_mesa_edge',
        descriptionVerbose: 'up the chimney to the bleached mesa edge',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.5, dusk: 1.0, night: 1.5, dawn: 0.5 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    extras: [
      {
        keywords: ['water', 'basin', 'seep', 'pool', 'drink'],
        description: 'The basin is natural — a depression in the bedrock floor, widened and deepened by centuries of water dissolving the softer stone. The water is clear to the bottom, which is about eighteen inches down. You can see the mineral deposits on the basin floor: white calcite, a faint green tinge from copper trace. The water is cold enough to numb your fingers in ten seconds. It tastes clean — mineral, slightly sweet, with none of the organic taint that surface water in canyon country carries. This is filtered through a hundred feet of sandstone. It is the best water you have encountered in The Breaks.',
        skillCheck: { skill: 'survival', dc: 7, successAppend: 'The flow rate from the three ceiling seeps is consistent — approximately a liter per hour combined. The basin overflows through a crack in the south wall, which means the water level is self-regulating. You could fill every container you have and the basin would recover by morning. This is a permanent, reliable water source. You understand immediately why someone carved a message asking you to leave it better than you found it.' },
      },
      {
        keywords: ['flowstone', 'mineral', 'walls', 'deposits', 'curtains'],
        description: 'The flowstone is spectacular in the clinical sense — each curtain is a record of mineral-laden water depositing its calcium carbonate load over decades. The oldest curtains near the floor are thick and opaque, the calcite dense and layered. The newer ones near the ceiling seeps are translucent, thin enough in places to see the rock behind them. Where the firelight or daylight hits them, they glow: amber in the thicker sections, white where the calcite is purest, a faint green where copper compounds have infiltrated the deposit. You are inside a geological process that is still running.',
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'The flowstone growth rate tells you this grotto has been actively seeping for at least eight thousand years. The thickest curtain near the floor is a continuous record of water chemistry stretching back to when this canyon was a different climate entirely — wetter, colder, the mesa above covered in pine forest rather than juniper scrub. The grotto remembers a world that no longer exists. It is not the only thing in the Four Corners with that quality.' },
      },
      {
        keywords: ['tin', 'sealed', 'shelf', 'cache', 'carved shelf'],
        description: 'The sealed tin is a pre-Collapse tobacco tin, repurposed as a cache container. Inside: a packet of water purification tablets, a small coil of fishing line, three waterproof matches, and a folded note. The note reads: This grotto is shared. Take what you need. Replace what you can. The next person is you in a different body. Unsigned. The handwriting is neat and unhurried. The items are in good condition. Someone maintains this cache the way someone maintains the cairn at the canyon crossroads — quietly, consistently, for reasons that don\'t require explanation.',
        skillCheck: { skill: 'scavenging', dc: 8, successAppend: 'Behind the tin, wedged into the back of the carved shelf: a second container, smaller, wrapped in oilcloth. Inside, a hand-drawn map of The Breaks on treated paper, more detailed than any you\'ve seen. It marks the grotto, the chimney route, the wind passage, water sources, Hollow density zones, and — in red ink — a circuit marked FERAL RANGE with estimated dates. Someone has been studying the Sanguine\'s hunting pattern from this grotto. The map is recent.' },
      },
      {
        keywords: ['moss', 'green', 'growing', 'life', 'plants'],
        description: 'The moss is a deep green that looks wrong against the desert context of everything outside this room. It grows wherever the seep water touches the wall — thick cushions of it, the kind of moss that requires consistent moisture and stable temperature. You touch it and your finger comes away damp and smelling of chlorophyll and wet earth. In the cracks where the moss is thickest, small ferns — maidenhair, by the frond shape — grow in the perpetual mist of the seep. This room is a microclimate, a pocket of temperate biology inside an arid mesa, sustained by geology and indifferent to the desert ten feet above it.',
      },
      {
        keywords: ['fire ring', 'fire', 'message', 'carved', 'scratched', 'letters'],
        description: 'The fire ring is small and carefully built — flat stones set in a circle barely a foot across, sized for a cooking fire, not a warming fire. The smoke staining on the ceiling above it is channeled toward the chimney by the natural airflow, which means someone tested the ventilation before building the ring here. The carved message beside the shelf: DRINK. REST. LEAVE IT BETTER. Six words in letters an inch tall, cut into the stone with the depth of someone who intended them to outlast their author. The message has been obeyed. The grotto is clean. The cache is maintained. Someone is listening to the carved words, even now.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'breaks_wanderer_at_rest',
        spawnChance: 0.15,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A figure sits beside the basin with their boots off and their feet in the water, eyes closed, breathing the cool air with the specific gratitude of someone who has been in the canyon heat for too long. They open their eyes when you arrive but don\'t reach for a weapon. The grotto has that effect.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.5, wary: 0.1, hostile: 0.0 },
        dialogueTree: 'br_overhang_shelter_traveler',
      },
    ],
    itemSpawns: [
      {
        entityId: 'fresh_water_container',
        spawnChance: 0.70,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.9, max: 1.0 },
        groundDescription: 'Clear, cold water collected in the natural stone basin from three ceiling seeps.',
        depletion: { cooldownMinutes: { min: 30, max: 90 }, respawnChance: 0.80 },
      },
      {
        entityId: 'purification_tabs',
        spawnChance: 0.50,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A packet of water purification tablets left in the cache tin on the carved shelf.',
        depletion: { cooldownMinutes: { min: 1440, max: 4320 }, respawnChance: 0.40 },
      },
      {
        entityId: 'tinder_bundle',
        spawnChance: 0.35,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.6, max: 0.9 },
        groundDescription: 'A small bundle of dry tinder left beside the fire ring by a previous visitor.',
        depletion: { cooldownMinutes: { min: 240, max: 720 }, respawnChance: 0.35 },
      },
    ],
  },
]
