import { Area } from '@gamepark/greylune/material/Area'
import { HeroicQuestArea } from '@gamepark/greylune/material/QuestTile'
import { Gap } from '@gamepark/greylune/material/Village'
import { VpTokenValue } from '@gamepark/greylune/material/VpToken'
import { Season } from '@gamepark/greylune/Season'
import { Coordinates, XYCoordinates } from '@gamepark/rules-api'

/**
 * The whole table, in centimetres, at the scale of the real components.
 *
 * The main board sits at the origin. The Village grid unfolds to its left, the Season board lies
 * underneath it, and the revealed Encounters line up along the right edge of the main board. The
 * table is exactly as tall as the 2 Encounter rows lying above and below the main board, and one
 * player area stands to the right of everything: the area of the player being read, whoever that is.
 * Nothing is ever rotated.
 *
 * Coordinates printed on a board (a track, a slot) are given in centimetres from the top-left corner
 * of its artwork, exactly as they were measured on the image, and converted here. Keep it that way:
 * re-measuring a spot on the picture then stays a one-line change.
 */

// ------------------------------------------------------------------ component sizes

/** The footprint of anything laid flat on the table, in centimetres like everything else here. */
type Size = { width: number; height: number }

export const mainBoardSize = { width: 20.98, height: 28 }
export const seasonBoardSize = { width: 26.54, height: 12.7 }
export const playerBoardSize = { width: 18.78, height: 13.94 }
export const villageCardSize = { width: 7, height: 7 }
/** The rounded corners of a Village card, which the drop areas drawn between them borrow. */
export const villageCardBorderRadius = 0.35
/**
 * A card of the player's own that has been used is laid on its side: a quarter turn to the right, and
 * back up next Autumn (rulebook p.7). Village cards are square, so it turns in place — the row it
 * lies in neither moves nor opens up, and the picture on the card is the only thing saying it is
 * spent, exactly as on the table.
 */
export const tiltedCardAngle = 90
export const encounterCardSize = { width: 5.2, height: 8 }
export const eventTileSize = { width: 7.71, height: 9.94 }
export const questTileSize = { width: 3.75, height: 4.13 }
export const sealSize = { width: 2.12, height: 2.23 }
/** A Villager figure, its baked-in shadow included, as `VillagerDescription` draws it. */
const villagerWidth = 1.87
const villagerHeight = 3.04

/** Anything laid on a board has to clear its thickness, or it disappears inside it. */
const onBoard = 0.6

/**
 * A board a card is pushed *under* is itself lifted off the table, so that the card can pass below it
 * and still stand above the table. Nothing is ever drawn at a negative height: the table is a plane of
 * its own and takes every click aimed at what lies behind it, so a card slid under the table rather
 * than under the board is not merely hidden, it is out of reach.
 *
 * The lift is smaller than {@link onBoard}, so everything laid on the board stays over it, and larger
 * than the whole depth a full fan of Stories takes: that fan is what sizes it, see {@link storiesDepth}.
 */
const boardLevel = 0.4

/**
 * The other side of {@link boardLevel}: where a card pushed under a board comes to rest, between the
 * board and the table. The table is drawn without perspective, so the figure only ever settles an
 * order — what it has to hold is a whole game of Stories sinking under one another (see
 * {@link storiesGap}) without ever reaching the table.
 */
const underBoard = 0.35

/**
 * How high the Village gaps, and everything standing in them, are drawn. It is not a height on the
 * table but a matter of what covers what: the areas of the locations are painted before every
 * component, so a strip left at the height of the board is buried under it where the grid bites into
 * its edge, and only a frank lift clears it — the one the framework itself gives a drop area it
 * brings forward. The Villagers ride the same level and keep the strip under their feet, being drawn
 * after it; an armed strip adds that lift once more and passes over them. Nothing moves on screen:
 * the table is drawn without perspective, so a height only ever settles an order.
 */
export const villageGapLevel = 5

/**
 * Village and Encounter cards are not laid beside the main board but slotted into the notches cut
 * for them along its edges. Each card is pushed this far past the edge, which covers the notch
 * without hiding the outline drawn around it. The same bite as the one the Village grid takes.
 */
const notchOverlap = 0.34

/** The air left between the outermost component and the left and right edges of the table. */
const tableMargin = 1

/**
 * The air left above the Encounter row lying over the main board, and under the one lying below it: a
 * millimetre and a half, so the table is as tall as the main board and its 2 rows and nothing more.
 */
const tableEdgeAir = 0.15

/**
 * A marker is drawn seen from a hair above the table: the disc or the shield that has to register
 * with the space printed under it is the top face, and the thickness of the token and its shadow are
 * drawn below it. The centre of the image is therefore a touch above the centre of that face, and a
 * marker aimed straight at its space leaves the space showing underneath. Every marker spot is thus
 * the printed space nudged by this much, measured on the artwork of each marker.
 */
const markerDrop = {
  season: { x: 0.01, y: 0.08 },
  score: { x: 0.02, y: 0.05 },
  quest: { x: 0.03, y: 0.04 }
}

// ------------------------------------------------------------------ main board

export const mainBoardSpot: XYCoordinates = { x: 0, y: 0 }

const onMainBoard = (x: number, y: number): Coordinates => ({
  x: mainBoardSpot.x + x - mainBoardSize.width / 2,
  y: mainBoardSpot.y + y - mainBoardSize.height / 2,
  z: onBoard
})

/** The track snakes up the left column (0 to 12) then back down the right one (13 to 24). */
export const scoreTrackSpot = (score: number): Coordinates => {
  const { x, y } = markerDrop.score
  return score <= 12 ? onMainBoard(1.58 + x, 23.1 + y - 1.81 * score) : onMainBoard(3.43 + x, 2.25 + y + 1.808 * (score - 13))
}

/**
 * The 2 shields at the foot of the track, under the 0: the victory point tokens of every player wait
 * there, one pile per value, until their owner has crossed that many points.
 */
export const vpTokenStackSpots: Record<VpTokenValue, Coordinates> = {
  [VpTokenValue.Vp25]: onMainBoard(1.55, 25.36),
  [VpTokenValue.Vp75]: onMainBoard(3.46, 25.36)
}

/**
 * The ground of each {@link Area}: the open space printed on the board where its Adventurers stand,
 * and what a player aims at to walk one there. Greylune is the walled town itself; the 5 others are
 * the clear stretches the road leaves between its bends and the edge of the board, each one under
 * the banner of its Area and beside the notch its Encounter cards are slotted into — which is why
 * they are found at the same coordinate along the edge as those notches.
 *
 * The riders printed on the map are not spaces: they are the road from one Area to the next, drawn
 * halfway between two banners, and an Adventurer set down on one stands nowhere in particular.
 */
const areaSpaces: Record<Area, XYCoordinates & Size> = {
  [Area.Village]: { x: 8.5, y: 23.2, width: 6.8, height: 4 },
  [Area.Wand]: { x: 14.65, y: 26.6, width: 5.2, height: 2.7 },
  [Area.Bow]: { x: 19.65, y: 23.1, width: 2.6, height: 3.8 },
  [Area.Hammer]: { x: 19.65, y: 13.9, width: 2.6, height: 3.8 },
  [Area.Swords]: { x: 19.65, y: 4.9, width: 2.6, height: 3.8 },
  [Area.Edge]: { x: 14.65, y: 1.3, width: 5.2, height: 2.6 }
}

export const areaSpot = (area: Area): Coordinates => onMainBoard(areaSpaces[area].x, areaSpaces[area].y)

export const areaSize = (area: Area): Size => ({ width: areaSpaces[area].width, height: areaSpaces[area].height })

/**
 * The same open ground, measured from the middle of the main board: an Area is a space printed on
 * the map and carries no piece of its own to hang a menu on, so the button offering to walk an
 * Adventurer there is drawn on the board itself and has to find its way back out to it (see
 * `TravelMenu`).
 */
export const areaBoardOffset = (area: Area): XYCoordinates => ({
  x: areaSpaces[area].x - mainBoardSize.width / 2,
  y: areaSpaces[area].y - mainBoardSize.height / 2
})

/**
 * Where the offer to go no further sits on the Adventurer wearing it: just off its right shoulder,
 * near enough to belong to that pawn and not to the one standing beside it in the same area, and its
 * label written back over the map (see {@link ItemMenuButton}).
 */
export const adventurerStaySpot: XYCoordinates = { x: -2, y: 0 }

/**
 * Several Adventurers standing in the same Area line up along the length of the space they share:
 * across the board in Greylune and in the 2 Areas that lie against the top and the bottom edge, down
 * it in the 3 that lie against the right edge, where the space is taller than it is wide. A step
 * shorter than a pawn, either way: they crowd the space rather than run out of it.
 */
export const areaGap = (area: Area): Partial<XYCoordinates> => (areaSpaces[area].width > areaSpaces[area].height ? { x: 1.4 } : { y: 1.1 })

/**
 * Two Adventurers alone in Greylune have the whole town to themselves: they stand well apart, each
 * one still on the ground of the town, instead of crowding its middle the way a group of 3 or 4 must.
 */
export const villagePairGap: Partial<XYCoordinates> = { x: 3 }

/**
 * Two markers on the same space of a track are one on top of the other. Each one is set down leaning
 * a little further, so a pile of four still reads as four and the bottom one keeps standing on its
 * space.
 */
const markerStackStep: Coordinates = { x: -0.1, y: -0.1, z: 0.1 }

export const stacked = (spot: Coordinates, level = 0): Coordinates => ({
  x: spot.x + markerStackStep.x * level,
  y: spot.y + markerStackStep.y * level,
  z: (spot.z ?? 0) + markerStackStep.z * level
})

/** The map at the centre of the board, where the Event pile and its revealed tile sit. */
export const eventSpot = onMainBoard(8.3, 14.5)

/**
 * The 5 free spaces of the Festival, in percentage of the tile they are drawn on: one at the top
 * between the Magic and the 2 points, two down each side, and the last two either side of the Force
 * at the bottom. Standing on one is choosing the 2 bonuses it lies between, so both the Villagers
 * and the buttons that send them there are placed from this one list.
 *
 * Not quite on the printed frames: a Villager is 1.87 by 3.04 em where the tile is 7.71 by 9.94, so
 * a pawn set square on a frame reaches a good way over whatever is printed above it — and what is
 * printed above is one of the 2 bonuses the space pays. The 4 side spaces are carried outwards and
 * the top one lifted, far enough to let the bonuses be read past the pawns, not so far that a space
 * stops belonging to the frame it stands for.
 */
export const festivalSpaces: Record<number, XYCoordinates> = {
  0: { x: 50, y: 29 },
  1: { x: 20, y: 42 },
  2: { x: 80, y: 42 },
  3: { x: 23, y: 72 },
  4: { x: 77, y: 72 }
}

/**
 * Where a button that claims one of those spaces is drawn, in em from the middle of the tile: on the
 * space, then nudged a little further out along the same line, so that the space it claims and the
 * 2 bonuses printed either side of it stay in sight under it.
 */
export const festivalSpaceSpot = (option: number): XYCoordinates => {
  const { x, y } = festivalSpaces[option] ?? { x: 50, y: 50 }
  const dx = ((x - 50) / 100) * eventTileSize.width
  const dy = ((y - 50) / 100) * eventTileSize.height
  const distance = Math.hypot(dx, dy) || 1
  return { x: dx + (dx / distance) * festivalSpaceNudge, y: dy + (dy / distance) * festivalSpaceNudge }
}

/**
 * Half the width of the button, near enough: a disc pushed out by its own radius leaves the space it
 * claims where the eye can still find it, and the ring of 5 clear of one another.
 */
const festivalSpaceNudge = 1

/**
 * Where the Villagers of a tile that is not the Festival stand: the middle of the scroll, a little
 * above centre, since such a tile draws its options as a line of icons at its foot and the crowd
 * must leave them readable.
 */
export const eventTileCrowdSpace: XYCoordinates = { x: 50, y: 49 }

/**
 * The step from one Villager to the next when several stand on the same Event space. Every tile but
 * the Festival draws its options on one and the same space, so the Villagers of all the players who
 * took part that year end up there together, and a step narrower than a Villager is wide lets them
 * overlap the way figures crowded on a board do.
 */
export const eventSpaceGap: Partial<XYCoordinates> = { x: 1.4 }

/**
 * The 3 Heroic Quest spaces, each on the road just past the banner of its Area — the farther the
 * space, the more it pays: 7/5 laurels past the purple banner, 8/6 past the red one, 9/7 past the
 * black one, which lies across the sea in the top-left corner.
 */
export const questTileSpots: Record<HeroicQuestArea, Coordinates> = {
  [Area.Hammer]: onMainBoard(14.71, 14.62),
  [Area.Swords]: onMainBoard(14.71, 6.39),
  [Area.Edge]: onMainBoard(7.83, 3.56)
}

/**
 * The 2 medals drawn on the board under each Quest space, below the plaque printing its 2 rewards: the
 * left one for the player who achieved it first, which pays more, the right one for everybody after
 * them. The plaque itself is left showing, so the points a marker stands for can still be read.
 */
const questRewardSpots: Record<HeroicQuestArea, XYCoordinates> = {
  [Area.Hammer]: { x: 13.805, y: 18.65 },
  [Area.Swords]: { x: 13.805, y: 10.42 },
  [Area.Edge]: { x: 6.925, y: 7.59 }
}

/** From the left medal to the right one. */
const questRewardSpotsGap = 1.77

export const questRewardSpot = (area: HeroicQuestArea, first: boolean): Coordinates => {
  const { x, y } = questRewardSpots[area]
  return onMainBoard(x + (first ? 0 : questRewardSpotsGap) + markerDrop.quest.x, y + markerDrop.quest.y)
}

/**
 * Everybody after the first shares the right medal. Piled up like the markers of the score track, only
 * the one on top would show its colour: each is laid half a marker to the right of the one before it,
 * so every player who achieved the Quest can be told apart.
 */
export const questRewardFanStep: Coordinates = { x: 0.5, y: 0, z: 0.1 }

/**
 * Revealed Encounters lie in a row per Area, and the first card of each row is slotted into the
 * notch printed for it. Red, Purple and Green have theirs cut into the right edge, so those 3 rows
 * hang off that edge, one per printed slot. Black and Gold have theirs cut into the top and the
 * bottom edge instead: those 2 rows sit above and below the board, and start well to the left of the
 * other 3, over the notch they belong to. Every row then runs to the right.
 */
const rightNotchX = mainBoardSize.width - notchOverlap + encounterCardSize.width / 2
const topBottomNotchX = 14.67

/** Every Area but Greylune itself: no Encounter is met in the village, so no row starts there. */
export type EncounterRowArea = Exclude<Area, Area.Village>

const encounterRowStart: Record<EncounterRowArea, XYCoordinates> = {
  [Area.Edge]: { x: topBottomNotchX, y: notchOverlap - encounterCardSize.height / 2 },
  [Area.Swords]: { x: rightNotchX, y: 4.91 },
  [Area.Hammer]: { x: rightNotchX, y: 13.98 },
  [Area.Bow]: { x: rightNotchX, y: 23.12 },
  [Area.Wand]: { x: topBottomNotchX, y: mainBoardSize.height - notchOverlap + encounterCardSize.height / 2 }
}

export const encounterRowSpot = (area: EncounterRowArea): Coordinates => onMainBoard(encounterRowStart[area].x, encounterRowStart[area].y)

export const encounterRowGap = 5.8

/**
 * How many Encounters a row lays side by side. Every row is given 3, which is what the table is made
 * wide enough for. A year deals 7 cards at most over the 5 rows, and never more than 5 to one Area, so
 * a row is a line of 3 and 2 cards over.
 */
const encounterRowLine = 3

/** The 5 rows from the top of the board down, so that each one can look up what lies on either side of it. */
const encounterRowsTopDown = (Object.keys(encounterRowStart).map(Number) as EncounterRowArea[]).sort((a, b) => encounterRowStart[a].y - encounterRowStart[b].y)

/**
 * The rows a row may lay its 2 extra Encounters over, the one below it first. The board prints its 5
 * notches barely more than a card apart, so a second line of cards is a line *on top of a neighbouring
 * row* and nowhere else — and that is room the table really has: a year deals 7 Encounters over the 5
 * Areas, so an Area that got 4 or 5 of them has left the others 2 cards to share between them, and the
 * rows on either side of it are all but bare.
 *
 * Which of the 2 a row borrows is therefore read off the table rather than fixed here (see
 * `EncounterRowLocator`): the emptier of them, and the only one there is for the 2 rows slotted into
 * the top and the bottom edge of the board, whose other side is the edge of the table.
 */
export const encounterRowNeighbours = (area: EncounterRowArea): EncounterRowArea[] => {
  const index = encounterRowsTopDown.indexOf(area)
  return [encounterRowsTopDown[index + 1], encounterRowsTopDown[index - 1]].filter((row) => row !== undefined)
}

/**
 * A line of Encounters is lifted a hair over anything laid on its own line, so a row that borrows the
 * line of a neighbour never covers the cards the neighbour itself was dealt.
 */
const encounterRowLift = 0.05

/**
 * Where the Encounter of rank `index` lies in the row of an Area. The first 3 make the line, left to
 * right from the notch the Area is dealt into; the fourth goes over the third and the fifth over the
 * second — the borrowed line filled backwards, so the card that has just landed is always the one
 * nearest the board — and `over` is the neighbouring row whose line they are laid on.
 */
export const encounterRowSlot = (area: EncounterRowArea, index: number, over?: EncounterRowArea): Coordinates => {
  const extra = index >= encounterRowLine
  const column = extra ? Math.max(0, 2 * encounterRowLine - 1 - index) : index
  const { x } = encounterRowSpot(area)
  const { y } = encounterRowSpot((extra && over) || area)
  return { x: x + column * encounterRowGap, y, z: extra ? 0 : encounterRowLift }
}

/**
 * The top and the bottom of what the table shows: the outer edges of the 2 rows slotted into the top
 * and the bottom edge of the main board. Everything else is laid out between those 2 lines.
 */
const tableInsideTop = encounterRowSpot(Area.Edge).y - encounterCardSize.height / 2
const tableInsideBottom = encounterRowSpot(Area.Wand).y + encounterCardSize.height / 2

// ------------------------------------------------------------------ around the main board

/** 3x3 grid, spaced wide enough to slip a Villager between two neighbouring cards. */
const villageGridCenter: XYCoordinates = { x: -22.8, y: 0 }
const villageGridGap = 9.15
export const villageGridSpot = (x: number, y: number): XYCoordinates => ({
  x: villageGridCenter.x + (x - 1) * villageGridGap,
  y: villageGridCenter.y + (y - 1) * villageGridGap
})

/**
 * A full deck leans up and to the left by a hair per card, and a whole centimetre once it holds the
 * 20 cards the framework draws of it.
 */
const deckLean = 1

/**
 * The row of the Village deck, the bank and the Seal stack, over the grid: as high as a full deck
 * leaning out of it still stays on the table.
 */
const supplyRowY = tableInsideTop + villageCardSize.height / 2 + deckLean

/** The Village deck stands above the middle column of the grid it feeds, and the pile builds up from there. */
export const villageDeckSpot: XYCoordinates = { x: villageGridSpot(1, 0).x, y: supplyRowY }

/**
 * Villagers standing in the same gap line up across it, so the gap reads as one crowded space: down
 * the gaps that run between two columns, and across the ones that run between two rows.
 *
 * They share the length of the gap the way `space-around` shares a flex line: it is cut into as many
 * equal shares as there are Villagers, each standing in the middle of its own. So the step from one
 * to the next is that length divided by the crowd — the line tightens as it fills instead of growing
 * out over the cards, and it never leaves the strip between them.
 */
export const villageGapGap = (gap: Gap, villagers: number): Partial<XYCoordinates> =>
  Number.isInteger(gap.x) ? { x: villageCardSize.width / Math.max(1, villagers) } : { y: villageCardSize.height / Math.max(1, villagers) }

/**
 * The bare strip of table a gap leaves free between its 2 cards: as long as the side of a card, and
 * as wide as what the grid spacing leaves over once a card is deducted. That strip is exactly what a
 * Villager is dropped on, so it is exactly what the drop area covers.
 */
export const villageGapSize = (gap: Gap): Size =>
  Number.isInteger(gap.x)
    ? { width: villageCardSize.width, height: villageGridGap - villageCardSize.height }
    : { width: villageGridGap - villageCardSize.width, height: villageCardSize.height }

/**
 * The bank, spread to the left of the Village deck. The deck itself leans 1 cm that way once it is
 * full, so the heap starts a centimetre further still, and it lies flat: a scatter far wider than
 * tall, loose change nobody ever counts out rather than 2 neat stacks.
 */
export const coinReserveSpot: XYCoordinates = { x: villageGridSpot(0, 0).x, y: supplyRowY }
/** The Encounter deck stands at the head of the Gold row it feeds. */
export const encounterDeckSpot: XYCoordinates = {
  x: encounterRowSpot(Area.Wand).x - encounterRowGap,
  y: encounterRowSpot(Area.Wand).y
}
/**
 * The Seal stack, right of the Village deck, in a heap narrower than it is tall: pushed against the
 * deck, it leaves the strip over the main board to the reserves of Villagers.
 */
export const sealStackSpot: XYCoordinates = { x: villageDeckSpot.x + 7, y: supplyRowY }
export const sealStackRadius: XYCoordinates = { x: 2.2, y: 2.4 }

/**
 * The Villagers every player has set aside (rulebook p.3), all of them always in sight: they stand in
 * the strip over the main board, between the Seal stack and the head of the Black Encounter row. Each
 * player's 4 stand in a row, and the rows make 2 columns, one line per pair of seats, centred in the
 * strip.
 */
const villagerReserveZone = {
  left: sealStackSpot.x + sealStackRadius.x + sealSize.width / 2 + 0.3,
  right: encounterRowSpot(Area.Edge).x - encounterCardSize.width / 2 - 0.3,
  top: tableInsideTop,
  bottom: -mainBoardSize.height / 2
}

/** From one Villager of a reserve to the next: a little less than a figure is wide, shadow included. */
export const villagerReserveGap = 1.4

/** The stretch of table the 4 Villagers of a reserve stand on: a row of them, and no more. */
export const villagerReserveSize = { width: 3 * villagerReserveGap + villagerWidth, height: villagerHeight }

/**
 * The middle of the row of a seat's reserve. The lines share the height of the strip the way
 * `space-around` shares a flex line: as much air under the bottom line, between the 2 and over the top
 * one, so the block reads as one thing standing in the strip rather than as 2 rows pinned to its edges.
 */
export const villagerReserveSpot = (seat: number, players: number): XYCoordinates => {
  const { left, right, top, bottom } = villagerReserveZone
  const lines = Math.ceil(players / 2)
  const line = Math.floor(seat / 2)
  const air = (bottom - top - lines * villagerReserveSize.height) / (lines + 1)
  return {
    x: seat % 2 ? right - villagerReserveSize.width / 2 : left + villagerReserveSize.width / 2,
    y: (top + bottom) / 2 + (line - (lines - 1) / 2) * (villagerReserveSize.height + air)
  }
}

// ------------------------------------------------------------------ season board

export const seasonBoardSpot: XYCoordinates = { x: -22.75, y: 16.7 }

const onSeasonBoard = (x: number, y: number): Coordinates => ({
  x: seasonBoardSpot.x + x - seasonBoardSize.width / 2,
  y: seasonBoardSpot.y + y - seasonBoardSize.height / 2,
  z: onBoard
})

const onSeasonSpace = (x: number, y: number): Coordinates => onSeasonBoard(x + markerDrop.season.x, y + markerDrop.season.y)

/**
 * Winter has no space of its own: it is the year's upkeep, resolved with the marker still on Spring.
 * The 3 circles are the same size but not quite in line: the one of Summer is printed a little lower
 * than its neighbours, so it gets its own height rather than the height of the row.
 */
export const seasonSpots: Record<Season, Coordinates> = {
  [Season.Winter]: onSeasonSpace(13.26, 9.16),
  [Season.Spring]: onSeasonSpace(13.26, 9.16),
  [Season.Summer]: onSeasonSpace(17.67, 9.38),
  [Season.Autumn]: onSeasonSpace(22.1, 9.16)
}

/**
 * The button that walks a marker on to the next season, measured from the marker itself: right under
 * the pawn's foot, and under the track rather than along it — the spaces on either side are where
 * the markers of the other players stand (see `ChangeSeasonMenu`). The circles are printed all but
 * on the bottom edge of the board, so it hangs a little below the parchment, over the open table:
 * still the width of a Villager clear of the bottom of the table itself.
 */
export const changeSeasonButtonSpot: XYCoordinates = { x: 2, y: 2 }

/** The tents to the left of the Season board, where spent Villagers rest until Autumn. */
const campOnBoard: XYCoordinates = { x: 5.15, y: 6.05 }

export const campSpot = onSeasonBoard(campOnBoard.x, campOnBoard.y)

/**
 * The same tents, measured from the middle of the Season board: the camp carries no piece of its own
 * to hang a menu on, so the button that sends a Villager there is drawn on the board itself and has
 * to find its way back out to them (see {@link CampMenu}).
 */
export const campBoardOffset: XYCoordinates = {
  x: campOnBoard.x - seasonBoardSize.width / 2,
  y: campOnBoard.y - seasonBoardSize.height / 2
}

/** The tents printed on the board, all of them: what the camp covers, and what a Villager is dropped on. */
export const campAreaSize = { width: 6.3, height: 6.3 }

/** The Villagers resting in the camp are scattered over the tents, and every figure stays whole on them. */
export const campRadius: XYCoordinates = {
  x: (campAreaSize.width - villagerWidth) / 2,
  y: (campAreaSize.height - villagerHeight) / 2
}

/**
 * Where a button offering a card sits on it: low and to the right, off the middle so that what is
 * drawn there stays readable, and past the middle so that its label falls back inside rather than
 * out over the card next door (see {@link ItemMenuButton}).
 */
export const actionButtonSpot: XYCoordinates = { x: -1, y: 1 }

/** The Seals of a card overlap in their column, each one this far below the one before it. */
export const sealColumnGap = 1.4

/** A little more than a button is tall, so that the buttons of one card stand clear of one another. */
const sealButtonStep = 2.4

/**
 * Where the button that spends a Seal sits on it: just off its right side, over the gap between the
 * card and its neighbour, so the value printed on the token stays in sight (see `ActivateSealButton`).
 *
 * A button is taller than the step between two Seals, so the buttons of one card fan out from the
 * middle of the column until they stand {@link sealButtonStep} apart. A Seal keeps its place in the
 * column when another is spent, so `position` and `middle` are places in the column, not ranks.
 */
export const sealButtonSpot = (position: number, middle: number): XYCoordinates => ({
  x: sealSize.width / 2 + 1.3,
  y: (position - middle) * (sealButtonStep - sealColumnGap)
})

/**
 * Where the buttons an Object of the player's own wears sit on it (see `ItemCardMenu`). Its own spot
 * rather than the one above: an Object lies in a column beside the player's board, hard against its
 * neighbours and away from the Village, so the room a button has there is not the room it has in the
 * grid, and the two are free to move apart.
 *
 * As long as the column has room for them all, each card is whole and the buttons are stacked in its
 * middle. Once it tightens up, every card but the top one shows only its lower part, so the buttons go
 * side by side across the middle of that strip (see {@link itemsStep}).
 *
 * `index` is the rank of the button among the `buttons` the card wears.
 */
export const itemActionSpot = (count: number, players: number, index = 0, buttons = 1): XYCoordinates => {
  const stacked = (index - (buttons - 1) / 2) * itemButtonStep
  const step = itemsStep(count, players)
  if (step >= playerCardsGap) return { x: 0, y: stacked }
  return { x: stacked, y: villageCardSize.height / 2 - step / 2 }
}

/** A little more than a button is wide, so that two of them stand clear of one another. */
const itemButtonStep = 2.4

/**
 * The Seals already spent lie in the strip the bottom-left corner of the table leaves open, between
 * the right edge of the Season board and the Encounter deck: the only room left down there, and the
 * spent tokens are out of the way of the stack they are drawn from again, up over the Village grid.
 */
const sealDiscardGap = { left: seasonBoardSpot.x + seasonBoardSize.width / 2, right: encounterDeckSpot.x - 4 }

export const sealDiscardSpot: XYCoordinates = {
  x: (sealDiscardGap.left + sealDiscardGap.right) / 2,
  y: encounterDeckSpot.y
}

/**
 * The strip is narrow and there is room to spare down it, so the heap is flattened to what fits
 * between its 2 neighbours rather than spilling over them: half the gap, less half a Seal.
 */
export const sealDiscardRadius: XYCoordinates = { x: (sealDiscardGap.right - sealDiscardGap.left - sealSize.width) / 2, y: 2 }

// ------------------------------------------------------------------ player area

/**
 * One area only, to the right of everything the players share and clear of 2 Encounters in each of
 * the rows starting at the right edge of the main board. It is the area of the player being read:
 * every player's material is laid out on the very same spots, and only the one being read is drawn
 * (see `DisplayedPlayer`).
 *
 * The area is as narrow as the material allows: the personal board, a column of Village cards hung on
 * either side of it (Companions on the left, Objects on the right), and underneath the board, the
 * pieces a player keeps out of it and the panels of all the players.
 */

/**
 * The personal board is drawn inside its own file with a shadow all round it: the ink stops 1.42 short
 * of the edge of the image and the shadow fades out over the 0.44 beyond it (measured on the alpha
 * channel of PlayerBoard.png). What is laid against the board is laid against the ink.
 */
export const playerBoardShadow = 1.42

/** How far above and below the middle of a board its ink reaches. */
const printedHalf = playerBoardSize.height / 2 - playerBoardShadow

/**
 * Companions to the left of the board, Objects to the right, each in a column. The first card is laid
 * against the printed edge, level with the middle of the board, and the column climbs from there: a
 * player owning one Companion has it where the board says it belongs, and it does not move when the
 * second one arrives. A column climbs as far as the table allows it and tightens up rather than going
 * further (see {@link playerColumnMaxGap}).
 */
const playerCardsGap = villageCardSize.width + 0.2
const sideColumnX = playerBoardSize.width / 2 - playerBoardShadow + villageCardSize.width / 2

/** Nobody ever recruits more than 3 Companions (rulebook p.7), so that column is never short of room. */
export const playerCardsMaxCount = 3

/** From the middle of the board to the outer edge of either column: half the width of the area. */
const playerAreaHalfWidth = sideColumnX + villageCardSize.width / 2

/**
 * The length a row of Encounters is given: 3 cards in each of the 3 rows that start at the right edge
 * of the board, which is what the player area is set clear of. The Black and the Gold row start
 * further left along the board and have that much more; a row that holds more than 3 lays them out on
 * a line of its own rather than asking for room (see {@link encounterRowSlot}).
 */
const encounterRowReserve = (encounterRowLine - 1) * encounterRowGap

const playerAreaLeft = encounterRowSpot(Area.Hammer).x + encounterRowReserve + encounterCardSize.width / 2 + tableMargin

/**
 * The panels of all the players, 2 at the foot of the area and 2 at its head, each pair filling its
 * width. The seats are given the bottom line first, so the empty spot of a game of 3 is the top right
 * corner and a game of 2 has the whole head of the area free. A panel is not the player's material and
 * is drawn whoever is read: clicking it is how a player is read (see `PlayerPanelContent`).
 *
 * StyledPlayerPanel is authored as a box 28 em wide, so the width settles the scale. Its height is
 * pinned rather than measured: the name, the line the timer is given and the one line of counters come
 * to a height of type whose exact size is the browser's business and not ours, and the table cannot
 * have a spot that moves with a font.
 */
const playerPanelGap = 0.4
export const playerPanelWidth = playerAreaHalfWidth - playerPanelGap / 2
export const playerPanelScale = playerPanelWidth / 28
export const playerPanelEms = 12.2
export const playerPanelHeight = playerPanelEms * playerPanelScale

/** The line the bottom panels start on, and the one the top panels end on. */
const bottomPanelsTop = tableInsideBottom - playerPanelHeight
const topPanelsBottom = tableInsideTop + playerPanelHeight

/**
 * The middle of the personal board: as low as the 2 panels at the foot of the area allow, the printed
 * edge of the board a centimetre over them. Everything the player owns is read upwards from there —
 * the 2 columns of cards, the 2 fans of Stories and the 2 tokens standing over the board — so the
 * material is given the whole height of the area and the board itself is where the eye starts.
 */
const boardOverPanels = 1

export const playerAreaSpot: XYCoordinates = {
  x: playerAreaLeft + playerAreaHalfWidth,
  y: bottomPanelsTop - boardOverPanels - (playerBoardSize.height / 2 - playerBoardShadow)
}

const onPlayerBoard = (x: number, y: number): Coordinates => ({
  x: playerAreaSpot.x + x - playerBoardSize.width / 2,
  y: playerAreaSpot.y + y - playerBoardSize.height / 2,
  z: onBoard
})

const besidePlayerBoard = (x: number, y: number): XYCoordinates => ({ x: playerAreaSpot.x + x, y: playerAreaSpot.y + y })

/**
 * How high what a player keeps beside their board may climb: the top of the table, or the foot of the
 * panel lying over that half of the area — the left one is there from 3 players on, the right one at 4.
 * Nothing of the player's own ever slides under a panel.
 */
const panelAir = 0.2
const playerColumnTop = (players: number, left: boolean): number => ((left ? players >= 3 : players >= 4) ? topPanelsBottom + panelAir : tableInsideTop)

/**
 * How far a column of cards may climb from the first card: the top card ends against the ceiling of its
 * half of the area, and the column tightens up rather than going further. A player may own as many as
 * 7 Objects, far more than the column can lay out whole.
 */
export const playerColumnMaxGap = (players: number, left: boolean): Partial<XYCoordinates> => ({
  y: playerColumnTop(players, left) + villageCardSize.height / 2 - playerAreaSpot.y
})

/** The step from one Object to the next, which is also the strip each card but the top one shows. */
export const itemsStep = (count: number, players: number): number =>
  Math.min(playerCardsGap, Math.abs(playerColumnMaxGap(players, false).y!) / Math.max(1, count - 1))

/** The one board something is slid under, hence the only one lifted off the table: see {@link boardLevel}. */
export const playerBoardSpot: Coordinates = { ...playerAreaSpot, z: boardLevel }

export const strengthTrackSpot = (level: number) => onPlayerBoard(8.15, 11.26 - 1.62 * level)
export const magicTrackSpot = (level: number) => onPlayerBoard(10.58, 11.26 - 1.62 * level)

export const questMarkerSpot = (index: number) => onPlayerBoard(12.44 + markerDrop.quest.x + 1.415 * index, 7.66 + markerDrop.quest.y)
export const incomeTokenSpot = (index: number) => onPlayerBoard(4.83, 5.85 + 2.3 * index)

/**
 * The frame at the foot of the board, where the Villagers ready to be sent out stand: the middle of
 * its row of 3, which is the middle of the frame (see {@link ActiveVillagersLocator}).
 */
export const activeVillagersSpot = onPlayerBoard(13.85, 10.2)

/**
 * From one Villager of the frame to the next: across a row, a hair more than the figure itself is
 * wide once its halo of shadow is left out, so neighbours stand shoulder to shoulder; from one row to
 * the next, much less than a figure is tall, so the row behind shows its heads between the ones in
 * front. A row nearer the eye is drawn over the one behind it, hence the step up in height.
 */
export const activeVillagersStep: Coordinates = { x: 1.5, y: 0.9, z: 0.1 }

/**
 * The house printed in the upper right of the board, where the Villager of the year stands: the
 * middle of the drawing, which is what the buttons it carries are hung beside, and the line its base
 * is drawn on, which is what the Villager itself has to stand on.
 */
const specialActionHouse = { x: 13.83, y: 3.6, base: 4.14 }

/**
 * How far below the middle of its own picture a Villager's feet are.
 *
 * The figures are drawn standing, the halo of shadow baked in all round them except underneath,
 * where the base is flush with the bottom edge of the artwork (see `PawnImages`). So a pawn aimed at
 * a spot does not stand on it but a good centimetre below it. The 7 figures agree to within a pixel:
 * their base falls at 0.925 of the height of the picture.
 */
const villagerBaseDrop = (0.925 - 0.5) * villagerHeight

/**
 * The Villager stands on the line drawn at the foot of the house rather than in the middle of it, the
 * way a pawn set down anywhere else on the table stands on the space it is put in. So the spot is
 * that line, raised by everything the pawn's own picture carries under its middle.
 */
export const specialActionSpot = onPlayerBoard(specialActionHouse.x, specialActionHouse.base - villagerBaseDrop)

/**
 * Where the offers the special action carries are hung (see `SpecialActionMenu`).
 *
 * The space holds no piece of its own until a Villager is standing in it, and the 3 things it can be
 * spent on are printed as a line of icons under it, on nothing anybody puts anything on — so both
 * the offer to go there and the offer of each option are hung on the board itself and walk back out
 * to the space. Beside it rather than on it: the doorway is where the pawn is about to stand, or
 * already stands, and the buttons keep off both. To the right, which is where the board leaves room.
 */
export const specialActionBoardOffset: XYCoordinates = {
  x: specialActionHouse.x + 2.6 - playerBoardSize.width / 2,
  y: specialActionHouse.y - playerBoardSize.height / 2
}

/**
 * Where a skill marker wears the offer to climb its track (see `ChooseSkillMenu`): a step above it,
 * which is where it would go.
 */
export const skillMarkerMenuSpot: XYCoordinates = { x: 0, y: -2 }

/**
 * Where each of the 3 options of the special action is offered (see `SpecialActionOption`).
 *
 * Not under the doorway, where the board prints them closer together than 3 buttons could stand, but
 * on the piece each one would move: the line of tiers the Tavern pays by, printed on the board at the
 * height of {@link specialActionStoryOffset} and ending a good centimetre short of the rolled edge;
 * the Adventurer, off its left flank, mirroring the offer to stay put on its right; and the Magic
 * marker, a step above it, which is where it would go.
 */
export const specialActionStoryOffset: XYCoordinates = { x: 16.5 - playerBoardSize.width / 2, y: 6.05 - playerBoardSize.height / 2 }
export const specialActionTravelSpot: XYCoordinates = { x: 2, y: 0 }
export const specialActionMagicSpot: XYCoordinates = skillMarkerMenuSpot

/** Where the first card of each column goes, and which way the ones after it climb. */
export const companionsSpot = besidePlayerBoard(-sideColumnX, 0)
export const itemsSpot = besidePlayerBoard(sideColumnX, 0)
export const playerCardsGapUp: Partial<XYCoordinates> = { y: -playerCardsGap }

/** All a Story ever shows once it is pushed home: the top quarter of the card, and nothing more. */
const storyReveal = encounterCardSize.height / 4

/**
 * Resolved Encounters are pushed under the board, untold on its left half, told on its right. A fan is
 * one card wide and stands on the mark printed for it rather than on the middle of whatever room is
 * left beside it: the board carries the 2 marks, one on either side of its centre and the same
 * distance from it, so one figure measured on the artwork places both fans.
 */
const storiesX = 4.05

/**
 * Where the first Story of a fan comes to rest: pushed in until only {@link storyReveal} of it is left
 * showing above the printed edge of the board. What is under the board is under it for good — a Story
 * is read by its top quarter, and the fan is what makes the rest of it worth nothing to look at.
 */
const storiesAnchorY = -printedHalf - storyReveal + encounterCardSize.height / 2

export const untoldStoriesSpot: Coordinates = { ...besidePlayerBoard(-storiesX, storiesAnchorY), z: underBoard }
export const toldStoriesSpot: Coordinates = { ...besidePlayerBoard(storiesX, storiesAnchorY), z: underBoard }

/**
 * The depth each Story takes from the one before it, which is the whole of what puts a fan in order:
 * every card of it lies in the same plane, and only this figure says which is in front.
 *
 * It is not a hair, and cannot be one. A browser sorts a scene in depth with a tolerance of its own,
 * and two cards nearer than that are taken for one plane and drawn in the order they stand in the
 * page — the order the cards were created in, which owes nothing to the fan. Measured on a fan of 20,
 * the order comes apart at 0.03 px of separation and holds from 0.06 px up; this figure is a third of
 * a pixel on a table drawn at its usual size, and still clear of the tolerance on the smallest window.
 *
 * The whole Encounter deck is 41 cards, so a fan sinks at most 0.32 below {@link underBoard} and stands
 * clear of the table — which is what {@link boardLevel} is sized on.
 */
const storiesDepth = 0.008

/**
 * Every Story after the first is pushed in *under* the ones already there and a quarter of a card
 * higher, so each shows its own quarter and the fan climbs away from the board. Hence both signs: the
 * step up the table, and the hair of depth that puts the newcomer behind its elders.
 */
export const storiesGap: Partial<Coordinates> = { y: -storyReveal, z: -storiesDepth }

/**
 * What a full fan keeps between its top edge and whatever is above it: half the button it wears there
 * (see {@link endStoryButtonSpot}), 2.2 tall, and a hair more.
 */
const storiesClearance = 1.2

/** A fan climbs as high as its half of the area allows, and closes up rather than climbing past it. */
export const storiesMaxGap = (players: number, told: boolean): Partial<XYCoordinates> => ({
  y: playerColumnTop(players, !told) + storiesClearance - (untoldStoriesSpot.y - encounterCardSize.height / 2)
})

/** Everything but the quarter it shows: how far a Story travels while it is being pushed in. */
export const storiesPush = encounterCardSize.height - storyReveal

/**
 * Where the button that tells a Story is worn, measured from the middle of its card (see
 * `TellStoryButton`). The quarter left showing is the whole of what a player sees of an Encounter
 * once it is pushed in, so the button is hung level with it — and off the right edge of the card
 * rather than over it, since that quarter is the one strip of the card that has anything to read.
 *
 * Off the right edge is the middle of the alley the 2 fans leave between them: the button is a hair
 * over 2 wide and the alley 2.9, so hanging it a whole {@link storiesX} out from the untold fan puts
 * it dead centre of the gap, clear of the card it belongs to and of the told Stories opposite.
 */
export const storyButtonSpot: XYCoordinates = {
  x: storiesX,
  y: -encounterCardSize.height / 2 + storyReveal / 2
}

/**
 * Where the offer to close a story is worn, measured from the middle of the Story it is hung on (see
 * `EndStoryButton`): the last one told, on its top edge. It rides the head of the pile and is never
 * buried: the Story that has just joined is the one wearing it.
 */
export const endStoryButtonSpot: XYCoordinates = { x: 0, y: -encounterCardSize.height / 2 }

/**
 * The highest a Story may be lined up before it is pushed in: its top edge against the ceiling of its
 * half of the area. A card that has to travel further than that affords starts here instead — only the
 * first cards of a fan are given the whole {@link storiesPush}.
 */
export const storiesCeiling = (players: number, told: boolean): number => playerColumnTop(players, !told) + encounterCardSize.height / 2

export const playerPanelSpot = (seat: number, _players: number): XYCoordinates => ({
  x: playerAreaSpot.x + ((seat % 2 ? 1 : -1) * (playerPanelWidth + playerPanelGap)) / 2,
  y: seat < 2 ? tableInsideBottom - playerPanelHeight / 2 : tableInsideTop + playerPanelHeight / 2
})

/**
 * What a player keeps out of their board stands on the 2 pieces of furniture it belongs to rather than
 * floating around the board: the gold under the first Companion, the 3 Bonus tokens under the first
 * Object, both on the one line the strip between those cards and the panels leaves them.
 */
const underCardsY = (playerAreaSpot.y + villageCardSize.height / 2 + bottomPanelsTop) / 2

export const playerCoinsSpot: XYCoordinates = besidePlayerBoard(-sideColumnX, underCardsY - playerAreaSpot.y)

/**
 * Coins are money: identical pieces merge into one item with a quantity, so they have no rank and no
 * spot of their own. A scatter as wide as the card it lies under and no taller than the strip it is
 * given - a heap of gold, not a countable row.
 */
export const playerCoinsRadius: XYCoordinates = { x: villageCardSize.width / 2 - 1.2, y: 0.3 }

export const bonusTokensGap: Partial<XYCoordinates> = { x: 2.1 }
/** The middle slot of the 3: each token keeps its own, so spending one leaves a hole. */
export const bonusTokensSpot: XYCoordinates = besidePlayerBoard(sideColumnX, underCardsY - playerAreaSpot.y)

/**
 * The 2 pieces that stand over the board, in the alley the 2 fans of Stories leave between them: the
 * point token a player has earned, just over the printed edge, and the First player token above it.
 * They are the 2 things read at a glance rather than counted, and the alley is the one strip of the
 * area nothing else ever crosses.
 */
const vpTokenSize = { width: 1.86, height: 2.3 }
const firstPlayerTokenSize = { width: 3.44, height: 5.7 }
const overBoardAir = 0.2

export const playerVpTokensSpot: XYCoordinates = besidePlayerBoard(0, -printedHalf - overBoardAir - vpTokenSize.height / 2)

const firstPlayerTokenZ = 1
export const firstPlayerTokenSpot: Coordinates = {
  ...besidePlayerBoard(0, -printedHalf - 2 * overBoardAir - vpTokenSize.height - firstPlayerTokenSize.height / 2),
  /** A standing figure, not a flat piece: it is raised above the table so it reads as such. */
  z: firstPlayerTokenZ
}

// ------------------------------------------------------------------ table boundaries

/** Left, the Village grid; right, the player area; top and bottom, the 2 Encounter rows over and under the main board. */
export const tableBoundaries = {
  xMin: villageGridSpot(0, 1).x - villageCardSize.width / 2 - tableMargin,
  xMax: playerAreaSpot.x + playerAreaHalfWidth + tableMargin,
  yMin: tableInsideTop - tableEdgeAir,
  yMax: tableInsideBottom + tableEdgeAir
}

/** The table less the air it keeps all round: what a card seen up close is kept inside (see `CardHover`). */
export const tableInside = {
  xMin: tableBoundaries.xMin + tableMargin,
  xMax: tableBoundaries.xMax - tableMargin,
  yMin: tableInsideTop,
  yMax: tableInsideBottom
}
