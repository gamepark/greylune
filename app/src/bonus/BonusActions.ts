import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { CustomMove, isCustomMoveType, MaterialMove } from '@gamepark/rules-api'

/** Spending this Bonus token, while the score has just crossed 8 or 20 (see `BonusTokenRule`). */
export const chooseBonusMove = (legalMoves: MaterialMove[], token: number): CustomMove | undefined =>
  legalMoves.find((move): move is CustomMove => isCustomMoveType(CustomMoveType.ChooseBonus)(move) && move.data === token)
