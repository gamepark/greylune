import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { DeleteItem, isDeleteItemType, MaterialMove } from '@gamepark/rules-api'

/** Spending this Bonus token, while the score has just crossed 8 or 20 (see `BonusTokenRule`). */
export const chooseBonusMove = (legalMoves: MaterialMove[], token: number): DeleteItem | undefined =>
  legalMoves.find((move): move is DeleteItem => isDeleteItemType(MaterialType.BonusToken)(move) && move.itemIndex === token)
