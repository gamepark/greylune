import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { CustomMove, isCustomMoveType, MaterialMove } from '@gamepark/rules-api'

/**
 * Answering with a Companion or a Potion (see `ReactionRule`).
 *
 * The window is opened by whatever is happening — a journey arriving, a price about to be paid — and
 * what answers is the card itself, wherever it lies: a Potion among the Objects, a Companion in its
 * row. So the offer is worn by that card and nowhere else (see `UseReaction`). The bar only says the
 * window is open and gives the one thing the table cannot, which is closing it.
 */

export const isUseReaction = isCustomMoveType(CustomMoveType.UseReaction)

export const reactionData = (move: CustomMove): { card: number; option: number } => move.data as { card: number; option: number }

/** What this card is being offered for, if it is being offered at all. */
export const reactionMoves = (legalMoves: MaterialMove[], card: number): CustomMove[] =>
  legalMoves.filter((move): move is CustomMove => isUseReaction(move) && reactionData(move).card === card)
