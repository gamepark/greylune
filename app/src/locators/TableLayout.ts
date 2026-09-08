import { Area } from '@gamepark/greylune/material/Area'
import { HeroicQuestArea } from '@gamepark/greylune/material/QuestTile'
import { Gap } from '@gamepark/greylune/material/Village'
import { VpTokenValue } from '@gamepark/greylune/material/VpToken'
import { Season } from '@gamepark/greylune/Season'
import { Coordinates, XYCoordinates } from '@gamepark/rules-api'

/**
 * The whole table, in centimetres, at the scale of the real components.
 *
 * The main board sits at the origin. The Village grid unfolds to its left, the revealed Encounters
 * line up along its right edge, the Season board lies underneath, and the 4 player areas form a row
 * below everything. Nothing is ever rotated: every player reads their own area, and their
 * opponents', the right way up. At 2 and 3 players the unused areas are simply left empty.
 *
 * Coordinates printed on a board (a track, a slot) are given in centimetres from the top-left corner
 * of its artwork, exactly as they were measured on the image, and converted here. Keep it that way:
 * re-measuring a spot on the picture then stays a one-line change.
 */

// ------------------------------------------------------------------ component sizes

export const mainBoardSize = { width: 20.98, height: 28 }
export const seasonBoardSize = { width: 26.54, height: 12.7 }
export const playerBoardSize = { width: 18.78, height: 13.94 }
export const villageCardSize = { width: 7, height: 7 }
/** The rounded corners of a Village card, which the drop areas drawn between them borrow. */
export const villageCardBorderRadius = 0.35
export const encounterCardSize = { width: 5.2, height: 8 }
export const eventTileSize = { width: 7.71, height: 9.94 }
export const questTileSize = { width: 3.75, height: 4.13 }
export const sealSize = { width: 2.12, height: 2.23 }

/** Anything laid on a board has to clear its thickness, or it disappears inside it. */
const onBoard = 0.1

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

/** The air left between the outermost component and the edge of the table. */
const tableMargin = 1

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

/** Greylune itself, where every Adventurer starts and returns each Autumn. One row for everybody. */
export const villageSpot = onMainBoard(8.5, 23.46)
export const villageGap: Partial<XYCoordinates> = { x: 1.4 }

/**
 * Where an Adventurer stands in each {@link Area}. Greylune is the Village itself; the 5 others are
 * drawn as riders on the map, on the stretch of road just before the notch their Encounter cards
 * are slotted into, so they run anticlockwise: along the bottom edge, up the right one, then along
 * the top.
 */
export const areaSpots: Record<Area, Coordinates> = {
  [Area.Village]: villageSpot,
  [Area.Wand]: onMainBoard(10.6, 26.5),
  [Area.Bow]: onMainBoard(18.65, 26.55),
  [Area.Hammer]: onMainBoard(19, 18.5),
  [Area.Swords]: onMainBoard(19, 9.3),
  [Area.Edge]: onMainBoard(18.5, 1.5)
}

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
 * The 2 shields drawn under each Quest tile: the left one for the player who achieved it first,
 * which pays more, the right one — marked with an infinity sign — for everybody after them.
 */
export const questRewardSpot = (area: HeroicQuestArea, first: boolean): Coordinates => ({
  ...questTileSpots[area],
  x: questTileSpots[area].x + (first ? -0.815 : 0.815) + markerDrop.quest.x,
  y: questTileSpots[area].y + 2.47 + markerDrop.quest.y
})

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

/** The 5 rows, so that a player's Companions can look up which of them run at their own cards. */
export const encounterRowAreas = Object.keys(encounterRowStart).map(Number) as EncounterRowArea[]

export const encounterRowGap: Partial<XYCoordinates> = { x: 5.8 }

/**
 * The length a row has for free: 2 Encounters, which is what the column of player areas is set clear
 * of for the 3 rows that start at the right edge of the board. A longer row is not cut off there —
 * it takes whatever the Companions in its way are not using, see {@link crowdedRowsRoom}.
 */
const encounterRowReserve = encounterRowGap.x ?? 0

// ------------------------------------------------------------------ around the main board

/** 3x3 grid, spaced wide enough to slip a Villager between two neighbouring cards. */
const villageGridCenter: XYCoordinates = { x: -22.8, y: 0 }
const villageGridGap = 9.15
export const villageGridSpot = (x: number, y: number): XYCoordinates => ({
  x: villageGridCenter.x + (x - 1) * villageGridGap,
  y: villageGridCenter.y + (y - 1) * villageGridGap
})

/**
 * The Village deck stands above the middle column of the grid it feeds, on the theoretical slot
 * (1, -1): its base card sits where a 4th row would start, and the pile builds up from there.
 */
export const villageDeckSpot: XYCoordinates = villageGridSpot(1, -1)

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
export const villageGapSize = (gap: Gap): { width: number; height: number } =>
  Number.isInteger(gap.x)
    ? { width: villageCardSize.width, height: villageGridGap - villageCardSize.height }
    : { width: villageGridGap - villageCardSize.width, height: villageCardSize.height }

/**
 * The bank, spread to the left of the Village deck. The deck itself leans 1 cm that way once it is
 * full, so the heap starts a centimetre further still, and it lies flat: a scatter far wider than
 * tall, loose change nobody ever counts out rather than 2 neat stacks.
 */
export const coinReserveSpot: XYCoordinates = villageGridSpot(0, -1)
/**
 * The general supply: the Seal stack and the Income tokens. The Encounter deck is the exception: it
 * stands at the head of the Gold row it feeds.
 */
export const encounterDeckSpot: XYCoordinates = {
  x: encounterRowSpot(Area.Wand).x - (encounterRowGap.x ?? 0),
  y: encounterRowSpot(Area.Wand).y
}
export const sealStackSpot: XYCoordinates = villageGridSpot(2, -1)

/**
 * The 8 Income tokens wait in the gap the top band leaves open between the Seal stack and the head of
 * the Black Encounter row, halfway between the two, in 2 rows of 4.
 */
export const incomeTokenStockSpot: XYCoordinates = {
  x: sealStackSpot.x + 9.5,
  y: sealStackSpot.y
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

/** Top and bottom of everything the players share: the row of decks over the Village grid, and the Season board. */
const commonZoneTop = villageDeckSpot.y - villageCardSize.height / 2 - tableMargin
const commonZoneBottom = seasonBoardSpot.y + seasonBoardSize.height / 2 + tableMargin

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

/** The step from one player's row of tents to the next: they share the space and never overlap. */
export const campRowGap = 2.6

/**
 * The drop area of the camp covers the tents printed on the board, all of them: a Villager coming
 * home is aimed at the camp rather than at the row of it its player's own Villagers line up on, and
 * only ever one player's Villager is ever in the air.
 */
export const campAreaSize = { width: 6.3, height: 6.3 }

/**
 * Where a button offering a card sits on it: low and to the right, off the middle so that what is
 * drawn there stays readable, and past the middle so that its label falls back inside rather than
 * out over the card next door (see {@link ItemMenuButton}).
 */
export const actionButtonSpot: XYCoordinates = { x: -1, y: 1 }

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

// ------------------------------------------------------------------ player areas

/**
 * The 4 areas stand in a column to the right of everything the players share, clear of the longest an
 * Encounter row can ever get. Nothing is ever rotated: everyone reads their own area, and their
 * opponents', the right way up. At 2 and 3 players the unused areas are simply left empty.
 *
 * An area is a fixed rectangle: the personal board, a column of 3 Village cards on either side
 * (Companions on the left, Objects on the right), and a band one Encounter card tall above it for
 * everything else. It stops at the bottom edge of the board — nothing is ever displayed below.
 */

/**
 * The personal board is drawn inside its own file with a shadow all round it: the ink stops 1.42 short
 * of the edge of the image and the shadow fades out over the 0.44 beyond it (measured on the alpha
 * channel of PlayerBoard.png). Two boards set a centimetre apart would therefore read as 3.8 apart, so
 * the rows overlap by that margin, and the air below is counted between what is actually printed.
 */
const playerBoardShadow = 1.42

/**
 * Companions to the left of the board, Objects to the right: 3 cards each, laid side by side, so the
 * margin on either side is 3 Village cards wide. Between the main board and a personal board there is
 * then exactly what has to go there — a row of 2 Encounters, then the 3 Companions.
 *
 * Both rows are anchored on the board rather than centred on the space they are given: the first card
 * is laid against the printed edge, and the row grows away from the board. A player owning one
 * Companion has it where the second one will not push it, and the cards read as belonging to the board
 * they are pushed against.
 */
const playerCardsGap = villageCardSize.width + 0.2
const sideRowStart = playerBoardSize.width / 2 - playerBoardShadow + villageCardSize.width / 2
const sideRowWidth = villageCardSize.width + 2 * playerCardsGap
const sideRowX = sideRowStart + playerCardsGap

/**
 * The band above the board is as thin as the material allows, because with 4 areas stacked every
 * centimetre of it is paid 4 times. The Stories set its height: they are slid over the top edge of the
 * board, the way a player pushes them under it, and they can come down to the top of the level 5 space
 * of the Strength and Magic tracks and no further. What sticks out above the board is the band.
 */
const topTrackSpace = 11.26 - 1.62 * 5 - 1.98 / 2
const bandTop = -playerBoardSize.height / 2 - (encounterCardSize.height - topTrackSpace)
const bandCenterY = bandTop + encounterCardSize.height / 2

/** The rectangle an area has to fit in, measured from the middle of the personal board. */
export const playerAreaBox = {
  left: -sideRowX - sideRowWidth / 2,
  right: sideRowX + sideRowWidth / 2,
  top: bandTop,
  bottom: playerBoardSize.height / 2
}

const printedHalf = playerBoardSize.height / 2 - playerBoardShadow
const playerRowAir = 1

/** How far above the middle of a board its own material reaches: the whole band, or nothing. */
const rowTop = (hasBand: boolean) => (hasBand ? -playerAreaBox.top : printedHalf)

/**
 * The areas are stacked in one column to the right of everything the players share. Past 2 players the
 * band above a board is only ever drawn for one of them at a time, so the column reserves the room for
 * a single band: the rows above the one being read close up over the band they are not using, and the
 * rows below are pushed down by it. The height of the column never changes, whoever is read, so nothing
 * else on the table moves.
 */
export const playerColumnHeight = (rows: number, allBands: boolean) => {
  const bands = allBands ? rows : 1
  const tops = bands * rowTop(true) + (rows - bands) * rowTop(false)
  return tops + rows * printedHalf + (rows - 1) * playerRowAir
}

const playerAreaX = encounterRowSpot(Area.Hammer).x + encounterRowReserve + encounterCardSize.width / 2 + tableMargin - playerAreaBox.left

/** Every area sits on the same column, so the Companions of every player start on the same line. */
const companionsX = playerAreaX - sideRowStart

/**
 * Where the middle of a personal board lands. `bandRow` is the row whose band is drawn; leave it out
 * when every row draws its own.
 */
export const playerAreaSpot = (row: number, rows: number, bandRow?: number): XYCoordinates => {
  const allBands = bandRow === undefined
  const top = (commonZoneTop + commonZoneBottom - playerColumnHeight(rows, allBands)) / 2
  /** The one band the column reserves is inserted before the row that is being read, and only there. */
  const bandAbove = !allBands && row >= bandRow ? rowTop(true) - rowTop(false) : 0
  return {
    x: playerAreaX,
    y: top + row * (printedHalf + playerRowAir) + (row + 1) * rowTop(allBands) + bandAbove
  }
}

const onPlayerBoard = (area: XYCoordinates, x: number, y: number): Coordinates => ({
  x: area.x + x - playerBoardSize.width / 2,
  y: area.y + y - playerBoardSize.height / 2,
  z: onBoard
})

const besidePlayerBoard = (area: XYCoordinates, x: number, y: number): XYCoordinates => ({ x: area.x + x, y: area.y + y })

export const playerBoardSpot = (area: XYCoordinates): XYCoordinates => area

export const strengthTrackSpot = (area: XYCoordinates, level: number) => onPlayerBoard(area, 8.15, 11.26 - 1.62 * level)
export const magicTrackSpot = (area: XYCoordinates, level: number) => onPlayerBoard(area, 10.58, 11.26 - 1.62 * level)

export const questMarkerSpot = (area: XYCoordinates, index: number) =>
  onPlayerBoard(area, 12.44 + markerDrop.quest.x + 1.415 * index, 7.66 + markerDrop.quest.y)
export const incomeTokenSpot = (area: XYCoordinates, index: number) => onPlayerBoard(area, 4.83, 5.85 + 2.3 * index)
export const activeVillagersSpot = (area: XYCoordinates) => onPlayerBoard(area, 14.08, 10)
export const specialActionSpot = (area: XYCoordinates) => onPlayerBoard(area, 13.83, 3.72)

/** Where the first card of each row goes, and which way the ones after it run. */
export const companionsSpot = (area: XYCoordinates) => besidePlayerBoard(area, -sideRowStart, 0)
export const companionsGap: Partial<XYCoordinates> = { x: -playerCardsGap }
export const itemsSpot = (area: XYCoordinates) => besidePlayerBoard(area, sideRowStart, 0)
export const itemsGap: Partial<XYCoordinates> = { x: playerCardsGap }

/** A card raising the limit can bring a 4th Object: the row tightens up rather than leaving its space. */
export const playerCardsMaxCount = 3

/** The 2 ends of a full row of cards: 3 of them, first to last. */
export const playerCardsFullSpread = playerCardsGap * (playerCardsMaxCount - 1)

/**
 * However crowded the strip gets, 2 neighbouring Companions never come closer than a quarter of a card
 * — a quarter is still a card the eye counts, where a perfect stack is one card. The row keeps that
 * much of itself whatever it holds: it is a place on the table, and the place the next Companion is
 * going to land, so the Encounters stop short of it rather than of the cards that happen to be in it.
 */
export const companionsMinSpread = (villageCardSize.width / 4) * (playerCardsMaxCount - 1)

/**
 * An Encounter row and a row of Companions run at each other down the same strip: the Encounters grow
 * to the right from the notch they are slotted into, the Companions grow to the left from the board
 * they are pushed against. This is the room the two of them share, from the right edge of the first
 * Encounter to the left edge of the first Companion, less the air between them.
 *
 * The 3 rows starting at the right edge of the main board hold exactly 2 Encounters and a full row of
 * Companions, which is what the column of areas is set on; the Black and the Gold row start further
 * left along the board and have that much more.
 */
export const crowdedRowsRoom = (area: EncounterRowArea): number =>
  companionsX - villageCardSize.width / 2 - tableMargin - encounterRowSpot(area).x - encounterCardSize.width / 2

/**
 * The 2 strips of a player area an Encounter row can run into, measured from the middle of the board:
 * the row of Companions, and the band above it.
 */
const companionsStrip = { top: -villageCardSize.height / 2, bottom: villageCardSize.height / 2 }
const bandStrip = { top: bandTop, bottom: bandTop + encounterCardSize.height }

const crossesStrip = (area: EncounterRowArea, areaY: number, strip: { top: number; bottom: number }): boolean => {
  const { y } = encounterRowSpot(area)
  return y + encounterCardSize.height / 2 > areaY + strip.top && y - encounterCardSize.height / 2 < areaY + strip.bottom
}

export const rowCrossesCompanions = (area: EncounterRowArea, areaY: number): boolean => crossesStrip(area, areaY, companionsStrip)
export const rowCrossesBand = (area: EncounterRowArea, areaY: number): boolean => crossesStrip(area, areaY, bandStrip)

/**
 * The 2 Companion cards nearest the board, which is all the room the gold and the Villagers are given:
 * the far end of the row is left clear for the Encounter rows that run into the band.
 */
const twoCompanionsRight = -sideRowStart + villageCardSize.width / 2
const twoCompanionsLeft = -sideRowStart - playerCardsGap - villageCardSize.width / 2

/**
 * A player holds one point token at a time, and it stands in the very middle of the band, over the
 * middle of the board, in the gap the 2 rows of Stories leave between them.
 */
const vpTokenSlot = 1.86 + 2 * 0.2

/**
 * Resolved Encounters fill the middle of the band, over the board, untold on the left half, told on
 * the right half. Each row is a fan centred on its half and tightens up rather than running out over
 * what stands beside it: the gold on the left, the Bonus tokens on the right, and the point token
 * between the two of them. A fan is given the tighter of the two sides, so both of them read alike.
 */
const storiesRoom = -twoCompanionsRight - 0.2 - vpTokenSlot / 2
const storiesX = vpTokenSlot / 2 + storiesRoom / 2

export const untoldStoriesSpot = (area: XYCoordinates) => besidePlayerBoard(area, -storiesX, bandCenterY)
export const toldStoriesSpot = (area: XYCoordinates) => besidePlayerBoard(area, storiesX, bandCenterY)
export const storiesGap: Partial<XYCoordinates> = { x: 1.4 }
export const storiesMaxGap: Partial<XYCoordinates> = { x: storiesRoom - encounterCardSize.width }

/**
 * What a player keeps out of their board is not floated in the middle of the band: each pile stands on
 * the row of cards below it and grows upwards from there, so it reads as belonging to that row rather
 * than to the empty air above. They all rest on one line, the same the bottom of the panel is drawn on,
 * and they are 6.2, 4.31 and 3.04 tall — the Bonus tokens, the tallest of them, still clear the top of
 * the band.
 *
 * Over the Companions, the gold and the 4 Villagers held back, and nothing else: 7.52 and 6.67 wide,
 * which is exactly the 14.2 the 2 Companion cards nearest the board cover. They are pushed against that
 * pair rather than centred on the row, the gold over the first card and the Villagers over the second.
 *
 * Over the Objects, only the 3 Bonus tokens, at the near end of the row: the rest of it is the First
 * player token and the panel, both pushed against the outer edge of the area.
 */
const overCardsAir = 0.2
const standingOnCards = (height: number) => -villageCardSize.height / 2 - overCardsAir - height / 2

/** The 2 ends of the row of Objects, each wide enough for a token. */
const bandEndSlot = 3.44 + 2 * 0.315

export const bonusTokensGap: Partial<XYCoordinates> = { y: 2.1 }
export const bonusTokensSpot = (area: XYCoordinates) =>
  besidePlayerBoard(area, sideRowX - sideRowWidth / 2 + bandEndSlot / 2, standingOnCards(2 * bonusTokensGap.y! + 2))
export const playerCoinsSpot = (area: XYCoordinates) => besidePlayerBoard(area, twoCompanionsRight - 7.52 / 2, standingOnCards(4.31))
export const villagerReserveSpot = (area: XYCoordinates) => besidePlayerBoard(area, twoCompanionsLeft + 6.67 / 2, standingOnCards(3.04))

/** The one point token a player can hold, in the middle of the band, between the 2 rows of Stories. */
export const playerVpTokensSpot = (area: XYCoordinates) => besidePlayerBoard(area, 0, bandCenterY)

/** Lifted above everything else on the table: a panel is never covered by a card that reaches it. */
export const panelZ = 20

/**
 * A player's panel is part of the table, over their own row of Objects, pushed against the outer edge
 * of the area: its right edge is the right edge of the last Object card, so the only thing between it
 * and the edge of the table is the margin the table keeps all round. StyledPlayerPanel is authored as a
 * box 28 em wide, so the width settles the scale, and the panel sits right on top of the cards it
 * belongs to.
 *
 * Its height is pinned rather than measured: the name, the line the timer is given and the row of
 * counters come to 11.81 em of type, whose exact size is the browser's business and not ours, and the
 * table cannot have a spot that moves with a font. 12 em is that content with a hair to spare.
 */
export const playerPanelWidth = sideRowWidth - 2 * bandEndSlot
export const playerPanelScale = playerPanelWidth / 28
export const playerPanelEms = 12
export const playerPanelHeight = playerPanelEms * playerPanelScale
export const playerPanelSpot = (area: XYCoordinates, hasBand: boolean) =>
  besidePlayerBoard(
    area,
    sideRowX + sideRowWidth / 2 - playerPanelWidth / 2,
    /**
     * The player being read has their material out above the board, and the panel keeps clear of the
     * cards, just over them. A player who is not read has nothing above their board, so the panel drops
     * onto the Objects instead and hangs from the top edge of the board, where the eye picks up the row.
     */
    hasBand ? -villageCardSize.height / 2 - playerPanelHeight / 2 - overCardsAir : -printedHalf + playerPanelHeight / 2
  )

/**
 * The First player token is not part of the band and not part of that row either: it stands in the slot
 * immediately to the left of the panel, on the same line as the panel of the player holding it. It is
 * the one thing a player keeps out of their board that is drawn for all of them, read or not — there is
 * only ever one on the table, and it says whose turn the round starts on — so it goes down with the
 * panel when that player is not read: wherever the panel is, the token is the piece pinned to it.
 */
const firstPlayerTokenSize = { width: 3.44, height: 5.7 }
export const firstPlayerTokenSpot = (area: XYCoordinates, hasBand: boolean): Coordinates => ({
  ...besidePlayerBoard(
    area,
    sideRowX + sideRowWidth / 2 - playerPanelWidth - bandEndSlot / 2,
    /** Its foot on the line the bottom of the panel is drawn on, whichever of the 2 lines that is. */
    (hasBand ? -villageCardSize.height / 2 : -printedHalf + playerPanelHeight + overCardsAir) - firstPlayerTokenSize.height / 2
  ),
  /** Dropped, it lies over the Object cards, and like the panel it is never the thing covered. */
  z: panelZ
})

/**
 * Coins are money: identical pieces merge into one item with a quantity, so they have no rank and no
 * spot of their own. A scatter, over a strip wider than tall, with a minimum distance that keeps an
 * edge of every piece showing - a heap of gold, not a countable row.
 */
export const playerCoinsRadius: XYCoordinates = { x: 2.6, y: 1 }

// ------------------------------------------------------------------ table boundaries

/**
 * Left, the Village grid; right, the player column. Up and down, whichever of the common zone and the
 * column is the taller, which is why the table depends on the player count: 4 areas claim half again
 * the height 2 do, and reserving 4 rows for a game of 2 would leave the bottom half of the table empty.
 */
export const getTableBoundaries = (players: number, allBands: boolean) => {
  const columnHalf = playerColumnHeight(players, allBands) / 2
  const columnCenter = (commonZoneTop + commonZoneBottom) / 2
  return {
    xMin: villageGridSpot(0, 1).x - villageCardSize.width / 2 - tableMargin,
    xMax: playerAreaX + playerAreaBox.right + tableMargin,
    yMin: Math.min(commonZoneTop, columnCenter - columnHalf - tableMargin),
    yMax: Math.max(commonZoneBottom, columnCenter + columnHalf + tableMargin)
  }
}
