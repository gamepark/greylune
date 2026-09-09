import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialContext } from '@gamepark/react-game'
import { getBandRow } from './DisplayedPlayer'
import { playerAreaSpot } from './TableLayout'

type Context = MaterialContext<PlayerColor, MaterialType, LocationType>

/** Which of the 4 seats a player sits in. Fixed for the whole game, so positions never move. */
export const seatOf = (context: Context, player?: number): number => Math.max(0, context.rules.players.indexOf(player as PlayerColor))

/** The middle of a player's personal board, once the column has settled which row carries the band. */
export const areaOf = (context: MaterialContext, player?: PlayerColor) =>
  playerAreaSpot(seatOf(context, player), context.rules.players.length, getBandRow(context))

/**
 * Several players share one space: the Village, a season circle, a score shield, the tents of the
 * camp. Spread them around the middle of that space rather than stacking them out of sight.
 */
export const fanBySeat = (context: Context, player: number | undefined, step: number): number =>
  (seatOf(context, player) - (context.rules.players.length - 1) / 2) * step
