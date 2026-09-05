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

// ------------------------------------------------------------------ main board

export const mainBoardSpot: XYCoordinates = { x: 0, y: 0 }

const onMainBoard = (x: number, y: number): Coordinates => ({
  x: mainBoardSpot.x + x - mainBoardSize.width / 2,
  y: mainBoardSpot.y + y - mainBoardSize.height / 2,
  z: onBoard
})

/** The track snakes up the left column (0 to 12) then back down the right one (13 to 24). */
export const scoreTrackSpot = (score: number): Coordinates =>
  score <= 12 ? onMainBoard(1.6, 22.96 - 1.8 * score) : onMainBoard(3.5, 2.26 + 1.804 * (score - 13))

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
 * The 3 Heroic Quest spaces, each on the road just past the banner of its Area — the farther the
 * space, the more it pays: 7/5 laurels past the purple banner, 8/6 past the red one, 9/7 past the
 * black one, which lies across the sea in the top-left corner.
 */
export const questTileSpots: Record<HeroicQuestArea, Coordinates> = {
  [Area.Hammer]: onMainBoard(14.88, 14.84),
  [Area.Swords]: onMainBoard(14.84, 6.5),
  [Area.Edge]: onMainBoard(7.88, 3.32)
}

/**
 * The 2 shields drawn under each Quest tile: the left one for the player who achieved it first,
 * which pays more, the right one — marked with an infinity sign — for everybody after them.
 */
export const questRewardSpot = (area: HeroicQuestArea, first: boolean): Coordinates => ({
  ...questTileSpots[area],
  x: questTileSpots[area].x + (first ? -0.95 : 0.95),
  y: questTileSpots[area].y + 2.5
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
  Number.isInteger(gap.x)
    ? { x: villageCardSize.width / Math.max(1, villagers) }
    : { y: villageCardSize.height / Math.max(1, villagers) }

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

/** Winter has no space of its own: it is the year's upkeep, resolved with the marker still on Spring. */
export const seasonSpots: Record<Season, Coordinates> = {
  [Season.Winter]: onSeasonBoard(13.26, 9.17),
  [Season.Spring]: onSeasonBoard(13.26, 9.17),
  [Season.Summer]: onSeasonBoard(17.69, 9.17),
  [Season.Autumn]: onSeasonBoard(22.09, 9.17)
}

/** Top and bottom of everything the players share: the row of decks over the Village grid, and the Season board. */
const commonZoneTop = villageDeckSpot.y - villageCardSize.height / 2 - tableMargin
const commonZoneBottom = seasonBoardSpot.y + seasonBoardSize.height / 2 + tableMargin

/** The tents to the left of the Season board, where spent Villagers rest until Autumn. */
export const campSpot = onSeasonBoard(5.07, 6.34)

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

export const questMarkerSpot = (area: XYCoordinates, index: number) => onPlayerBoard(area, 12.48 + 1.4 * index, 7.7)
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
 * Resolved Encounters fill the middle of the band, over the board, untold on the left half, told on
 * the right half. Each row is a fan centred on its half and tightens up rather than running out over
 * the side rows.
 */
export const untoldStoriesSpot = (area: XYCoordinates) => besidePlayerBoard(area, -4.7, bandCenterY)
export const toldStoriesSpot = (area: XYCoordinates) => besidePlayerBoard(area, 4.7, bandCenterY)
export const storiesGap: Partial<XYCoordinates> = { x: 1.4 }
export const storiesMaxGap: Partial<XYCoordinates> = { x: 4.1 }

/**
 * The 2 ends of the band stand on one line, low enough that the column of 3 Bonus tokens can hang from
 * the very top of the band and no further.
 *
 * Over the Companions, right to left: the Bonus tokens, the gold, then the 4 Villagers held back. They
 * are 1.86, 7.52 and 6.67 wide, which leaves 5.35 of the 21.4 the row is wide, spread as 1.34 of air
 * between them and at both ends.
 *
 * Over the Objects, the 2 point tokens at the far end of the row: the middle of it is the panel, and the
 * near end is left to the First player token, which stands off the board rather than over the cards.
 */
const bandTokensY = bandTop + 3.1

export const bonusTokensSpot = (area: XYCoordinates) => besidePlayerBoard(area, -12.16, bandTokensY)
export const bonusTokensGap: Partial<XYCoordinates> = { y: 2.1 }
export const playerCoinsSpot = (area: XYCoordinates) => besidePlayerBoard(area, -18.19, bandTokensY)
export const villagerReserveSpot = (area: XYCoordinates) => besidePlayerBoard(area, -26.63, bandTokensY)

/** The 2 ends of the row of Objects, on either side of the panel, each wide enough for a token. */
const bandEndSlot = 3.44 + 2 * 0.315

export const playerVpTokensSpot = (area: XYCoordinates) => besidePlayerBoard(area, sideRowX + sideRowWidth / 2 - bandEndSlot / 2, bandTokensY)

/**
 * The First player token is not part of the band and not part of that row either: it stands immediately
 * to the right of the board, resting on the top edge of the first Object card. It is the one thing a
 * player keeps out of their board that is drawn for all of them, read or not — there is only ever one
 * on the table, and it says whose turn the round starts on.
 */
export const firstPlayerTokenSpot = (area: XYCoordinates) =>
  besidePlayerBoard(area, playerBoardSize.width / 2 - playerBoardShadow + 0.3 + 3.44 / 2, -villageCardSize.height / 2 - 5.7 / 2)

/**
 * A player's panel is part of the table, over the middle of their own row of Objects: it takes what the
 * 2 tokens at the ends of that row leave. StyledPlayerPanel is authored as a box 28 em wide, so the
 * width settles the scale, and the panel sits right on top of the cards it belongs to.
 *
 * Its height is pinned rather than measured: the name, the line the timer is given and the row of
 * counters come to 11.81 em of type, whose exact size is the browser's business and not ours, and the
 * table cannot have a spot that moves with a font. 12 em is that content with a hair to spare.
 */
const panelAir = 0.2
export const playerPanelWidth = sideRowWidth - 2 * bandEndSlot
export const playerPanelScale = playerPanelWidth / 28
export const playerPanelEms = 12
export const playerPanelHeight = playerPanelEms * playerPanelScale
export const playerPanelSpot = (area: XYCoordinates, hasBand: boolean) =>
  besidePlayerBoard(
    area,
    sideRowX,
    /**
     * The player being read has their material out above the board, and the panel keeps clear of the
     * cards, just over them. A player who is not read has nothing above their board, so the panel drops
     * onto the Objects instead and hangs from the top edge of the board, where the eye picks up the row.
     */
    hasBand ? -villageCardSize.height / 2 - playerPanelHeight / 2 - panelAir : -printedHalf + playerPanelHeight / 2
  )

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
