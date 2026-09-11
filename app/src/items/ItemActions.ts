import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { CustomMove, isCustomMoveType, isDeleteItemType, MaterialMove } from '@gamepark/rules-api'

/**
 * Using one of the player's Objects (see `SummerRule` and `UseItemRule`).
 *
 * The move names the card and which of its options is taken, because that is what the decision is:
 * the tilt the option asks for is only one of the things it costs, and an option may ask for the
 * card itself instead. So the tilt is a consequence of the move rather than the move, and an Object
 * with 2 options is 2 different moves on the same card.
 */

export const isUseItem = isCustomMoveType(CustomMoveType.UseItem)

export const itemActionData = (move: CustomMove): { card: number; ability: number } => move.data as { card: number; ability: number }

/** The options this Object is offering, if it is offering any: one move per option it can pay for. */
export const itemActionMoves = (legalMoves: MaterialMove[], card: number): CustomMove[] =>
  legalMoves.filter((move): move is CustomMove => isUseItem(move) && itemActionData(move).card === card)

/**
 * Giving this Object up, when one has to go (see `DiscardItemRule`): the card goes back in the box,
 * there being no discard pile for the Village cards, so the move deletes it.
 */
export const discardItemMove = (legalMoves: MaterialMove[], card: number): MaterialMove | undefined =>
  legalMoves.find((move) => isDeleteItemType(MaterialType.VillageCard)(move) && move.itemIndex === card)
