/**
 * Between the main board and a personal board there is one strip, and 2 rows growing into it from
 * either end: the Encounters of an Area, and the Companions of whoever sits across from them. Neither
 * is given a fixed share of it. Each takes what it needs, and when the two of them ask for more than
 * there is, one gives way:
 *
 * - the Companions of the player being read never do. Their area is the one the table is turned to,
 *   and the whole point of reading a player is that their cards are laid out to be counted;
 * - everybody else's do, down to the sliver of a row that is left showing where their cards are, and
 *   where the next one is going to land;
 * - the band above a board, when it is drawn, never does either. It is a block of tokens rather than
 *   a row that tightens, and it is authored to reach no further than a full row of Companions.
 *
 * A row that meets nobody is left alone all the way to the line the Companions of every player start
 * on, which is where the column of areas is set and the strip ends. Only the 3 rows leaving the right
 * edge of the board were ever short of room in the first place; the Black and the Gold row start well
 * to the left and rarely reach anyone at all.
 */
import { Area } from '@gamepark/greylune/material/Area'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { getBandRow, getDisplayedPlayer, showsAllBands } from './DisplayedPlayer'
import {
  companionsGap,
  companionsMinSpread,
  crowdedRowsRoom,
  encounterRowAreas,
  EncounterRowArea,
  encounterRowGap,
  playerAreaSpot,
  playerCardsFullSpread,
  playerCardsMaxCount,
  rowCrossesBand,
  rowCrossesCompanions
} from './TableLayout'

type Context = MaterialContext<PlayerColor, MaterialType, LocationType>

/** An Encounter turned over is in no Area for an instant, and lies at the head of the Gold row. */
export const encounterRowArea = (location: Location): EncounterRowArea => (location.id as EncounterRowArea) ?? Area.Wand

const countEncounters = (area: EncounterRowArea, context: Context): number =>
  context.rules
    .material(MaterialType.EncounterCard)
    .location((location) => location.type === LocationType.EncounterRow && encounterRowArea(location) === area).length

const countCompanions = (player: PlayerColor, context: Context): number =>
  context.rules.material(MaterialType.VillageCard).location(LocationType.Companions).player(player).length

/** How many gaps a row of cards shows, whatever it is given to show them in. */
const gapsOf = (cards: number, maxCount = Infinity): number => Math.max(0, Math.min(cards, maxCount) - 1)

/** The middle of a seat's personal board, on the column as it stands for the player being read. */
const seatY = (seat: number, context: Context): number => playerAreaSpot(seat, context.rules.players.length, getBandRow(context)).y

/** How far apart the 2 ends of a row of Companions would be, left to themselves. */
const companionsDemand = (player: PlayerColor, context: Context): number =>
  Math.abs(companionsGap.x ?? 0) * gapsOf(countCompanions(player, context), playerCardsMaxCount)

/**
 * How much of the strip a seat holds against an Encounter row, of the 2 things of theirs that can lie
 * across it: their band, which holds a full row of Companions, and their Companions, which hold the
 * whole of what they are asking for when they are the ones being read, and their bare row otherwise.
 */
const heldBy = (seat: number, area: EncounterRowArea, context: Context): number => {
  const player = context.rules.players[seat]
  const read = player === getDisplayedPlayer(context)
  const y = seatY(seat, context)
  const band = (read || showsAllBands(context)) && rowCrossesBand(area, y) ? playerCardsFullSpread : 0
  const companions = rowCrossesCompanions(area, y) ? (read ? companionsDemand(player, context) : companionsMinSpread) : 0
  return Math.max(band, companions)
}

/**
 * How far apart the 2 ends of an Encounter row end up: what it asks for, or what the tightest of the
 * seats it runs into leaves it, whichever is the smaller.
 */
export const encounterRowSpread = (area: EncounterRowArea, context: Context): number =>
  context.rules.players.reduce(
    (spread, _player, seat) => Math.min(spread, crowdedRowsRoom(area) - heldBy(seat, area, context)),
    (encounterRowGap.x ?? 0) * gapsOf(countEncounters(area, context))
  )

/**
 * How far apart the 2 ends of a row of Companions may be: a full row, less whatever the Encounter rows
 * lying across it have actually taken of the strip they share. A row of Encounters that took only what
 * it needed leaves the Companions all of theirs, and the player being read is left alone by
 * construction, since the Encounters already gave way to the full length of their row.
 *
 * This is what the row is allowed rather than what it uses, so the cards keep their own gap until they
 * really are too many for it, and the place a Companion is dropped on stays the whole row.
 */
export const companionsMaxSpread = (player: PlayerColor, context: Context): number => {
  const y = seatY(Math.max(0, context.rules.players.indexOf(player)), context)
  return encounterRowAreas.reduce(
    (spread, area) => (rowCrossesCompanions(area, y) ? Math.min(spread, crowdedRowsRoom(area) - encounterRowSpread(area, context)) : spread),
    playerCardsFullSpread
  )
}

/**
 * A row of a shared strip no longer moves on its own count alone: it moves as well when the row facing
 * it grows or shrinks, and when the player being read changes. react-game hands `game.view` to every
 * locator for free, so what is left to declare is how many cards the row holds and how far it spreads
 * them, which is everything its positions are computed from.
 */
export const encounterRowDependencies = (location: Location, context: Context) => {
  const area = encounterRowArea(location)
  return { cards: countEncounters(area, context), spread: encounterRowSpread(area, context) }
}

export const companionsDependencies = (player: PlayerColor, context: Context) => ({
  cards: countCompanions(player, context),
  spread: companionsMaxSpread(player, context)
})
