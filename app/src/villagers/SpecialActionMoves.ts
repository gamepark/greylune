import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { CustomMove, isCustomMoveType, isMoveItemType, MaterialMove, MoveItem } from '@gamepark/rules-api'

/**
 * The two halves of the special action of a personal board (see `SpecialActionRule`): walking a
 * Villager into the doorway printed on it, then saying what the board pays for it.
 *
 * The first is an item move like any other placement — the Villager goes somewhere and stays there
 * until Autumn. The second names one of the 3 options printed under the doorway, which are drawn as
 * a line of icons and given no space of their own, so nothing is moved and nothing is left to read
 * the choice off (see `SpecialAction`).
 */

type GreyluneMove = MaterialMove<PlayerColor, MaterialType, LocationType>
export type VillagerMove = MoveItem<PlayerColor, MaterialType, LocationType>

/** Walking a Villager into the doorway of one player's own board, whichever Villager it is. */
export const specialActionMoves = (legalMoves: GreyluneMove[], player?: PlayerColor): VillagerMove[] =>
  legalMoves.filter(
    (move): move is VillagerMove =>
      isMoveItemType(MaterialType.Villager)(move) && move.location.type === LocationType.SpecialAction && move.location.player === player
  )

export const isTakeSpecialAction = isCustomMoveType(CustomMoveType.TakeSpecialAction)

/**
 * The options still on offer. They are the acting player's own, so a piece only ever wears one while
 * its owner is the player being waited for — which every one of the 3 hosts checks for itself.
 */
export const specialActionOptions = (legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]): CustomMove[] =>
  legalMoves.filter((move): move is CustomMove => isTakeSpecialAction(move))
