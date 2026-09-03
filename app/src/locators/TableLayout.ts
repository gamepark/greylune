import { Distance } from '@gamepark/greylune/material/Distance'
import { HeroicQuestDistance } from '@gamepark/greylune/material/QuestTile'
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
export const encounterCardSize = { width: 5.2, height: 8 }
export const eventTileSize = { width: 7.71, height: 9.94 }
export const questTileSize = { width: 3.75, height: 4.13 }

/** Anything laid on a board has to clear its thickness, or it disappears inside it. */
const onBoard = 0.1

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
 * Two markers on the same space of a track are one on top of the other. Each one is set down leaning
 * a little further, so a pile of four still reads as four and the bottom one keeps standing on its
 * space.
 */
const markerStackStep: Coordinates = { x: 0.25, y: -0.3, z: 0.45 }

export const stacked = (spot: Coordinates, level = 0): Coordinates => ({
  x: spot.x + markerStackStep.x * level,
  y: spot.y + markerStackStep.y * level,
  z: (spot.z ?? 0) + markerStackStep.z * level
})

/** The map at the centre of the board, where the Event pile and its revealed tile sit. */
export const eventSpot = onMainBoard(8.3, 14.5)

/**
 * The 3 Heroic Quest spaces, each on the road just past the banner of its Distance — the farther the
 * space, the more it pays: 7/5 laurels past the purple banner, 8/6 past the red one, 9/7 past the
 * black one, which lies across the sea in the top-left corner.
 */
export const questTileSpots: Record<HeroicQuestDistance, Coordinates> = {
  [Distance.Purple]: onMainBoard(14.88, 14.84),
  [Distance.Red]: onMainBoard(14.84, 6.5),
  [Distance.Black]: onMainBoard(7.88, 3.32)
}

/**
 * Revealed Encounters lie in a row per Distance, just off the right edge of the board. The Red,
 * Purple and Green rows line up with the 3 card slots printed there; Black and Gold continue the
 * same rhythm above and below.
 */
const encounterRowY: Record<Distance, number> = {
  [Distance.Black]: -3.6,
  [Distance.Red]: 5,
  [Distance.Purple]: 13.94,
  [Distance.Green]: 23.04,
  [Distance.Gold]: 31.64
}

export const encounterRowSpot = (distance: Distance): Coordinates => onMainBoard(23.78, encounterRowY[distance])

export const encounterRowGap: Partial<XYCoordinates> = { x: 5.8 }

/** A row that happens to collect many cards tightens up rather than running into the supply. */
export const encounterRowMaxGap: Partial<XYCoordinates> = { x: 17.4 }

// ------------------------------------------------------------------ around the main board

/** 3x3 grid, spaced wide enough to slip a Villager between two neighbouring cards. */
const villageGridCenter: XYCoordinates = { x: -24.2, y: 0 }
const villageGridGap = 9.2
export const villageGridSpot = (x: number, y: number): XYCoordinates => ({
  x: villageGridCenter.x + (x - 1) * villageGridGap,
  y: villageGridCenter.y + (y - 1) * villageGridGap
})

/** Village deck and discard, in the left margin, beside the grid they feed. */
export const villageDeckSpot: XYCoordinates = { x: -46, y: -8 }
export const villageDiscardSpot: XYCoordinates = { x: -46, y: 1 }

/**
 * The general supply, in the right margin: the Encounter deck and discard, the bank, the Seal stack,
 * the Income tokens, and the Villagers each player keeps out of the game until they earn them.
 */
export const encounterDeckSpot: XYCoordinates = { x: 40, y: -20 }
export const encounterDiscardSpot: XYCoordinates = { x: 40, y: -11 }
export const coinReserveSpot: XYCoordinates = { x: 38.5, y: 0 }
export const sealStackSpot: XYCoordinates = { x: 38.5, y: 5 }
export const incomeTokenStockSpot: XYCoordinates = { x: 38, y: 9 }
export const villagerReserveSpot = (seat: number): XYCoordinates => ({ x: 41, y: 15 + 4 * seat })

// ------------------------------------------------------------------ season board

export const seasonBoardSpot: XYCoordinates = { x: -24, y: 21.5 }

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

/** The tents to the left of the Season board, where spent Villagers rest until Autumn. */
export const campSpot = onSeasonBoard(5.07, 6.34)

// ------------------------------------------------------------------ player areas

/** The 4 seats, left to right. Seats beyond the player count stay empty. */
export const playerAreasX = [-55, -20, 15, 50]
export const playerAreaY = 46

const onPlayerBoard = (seat: number, x: number, y: number): Coordinates => ({
  x: playerAreasX[seat] + x - playerBoardSize.width / 2,
  y: playerAreaY + y - playerBoardSize.height / 2,
  z: onBoard
})

const besidePlayerBoard = (seat: number, x: number, y: number): XYCoordinates => ({ x: playerAreasX[seat] + x, y: playerAreaY + y })

export const playerBoardSpot = (seat: number): XYCoordinates => ({ x: playerAreasX[seat], y: playerAreaY })

export const strengthTrackSpot = (seat: number, level: number) => onPlayerBoard(seat, 8.15, 11.26 - 1.62 * level)
export const magicTrackSpot = (seat: number, level: number) => onPlayerBoard(seat, 10.58, 11.26 - 1.62 * level)

export const questMarkerSpot = (seat: number, index: number) => onPlayerBoard(seat, 12.48 + 1.4 * index, 7.7)
export const incomeTokenSpot = (seat: number, index: number) => onPlayerBoard(seat, 4.83, 5.85 + 2.3 * index)
export const activeVillagersSpot = (seat: number) => onPlayerBoard(seat, 14.08, 10)
export const specialActionSpot = (seat: number) => onPlayerBoard(seat, 13.83, 3.72)

/** Resolved Encounters are slid over the top edge of the board, untold on the left, told on the right. */
export const untoldStoriesSpot = (seat: number) => onPlayerBoard(seat, 5.34, -1.8)
export const toldStoriesSpot = (seat: number) => onPlayerBoard(seat, 13.57, -1.8)
export const storiesGap: Partial<XYCoordinates> = { x: 1.4 }

/** Companions to the left of the board, Objects to the right, 3 of each at most. */
export const companionsSpot = (seat: number) => besidePlayerBoard(seat, -13.5, -3)
export const itemsSpot = (seat: number) => besidePlayerBoard(seat, 13.5, -3)
export const playerCardsGap: Partial<XYCoordinates> = { y: 2.6 }

export const bonusTokensSpot = (seat: number) => besidePlayerBoard(seat, -6, 9.3)
export const playerCoinsSpot = (seat: number) => besidePlayerBoard(seat, 1.5, 9.3)

/**
 * Coins are money: identical pieces merge into one item with a quantity, so they have no rank and no
 * spot of their own. A scatter, over a strip wider than tall, with a minimum distance that keeps an
 * edge of every piece showing — a heap of gold, not a countable row.
 */
export const playerCoinsRadius: XYCoordinates = { x: 2.6, y: 1 }
export const playerVpTokensSpot = (seat: number) => besidePlayerBoard(seat, 6.5, 9.3)
export const firstPlayerTokenSpot = (seat: number) => besidePlayerBoard(seat, -9, -11)

// ------------------------------------------------------------------ table boundaries

export const tableBoundaries = { xMin: -73, xMax: 68, yMin: -26, yMax: 60 }
