import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { isMoveItemType, MaterialMove } from '@gamepark/rules-api'

/**
 * Standing this card back up, when an effect straightens one (see `StraightenCardRule`): the move
 * turns the card where it lies, nothing changed but its rotation.
 */
export const straightenCardMove = (legalMoves: MaterialMove[], card: number): MaterialMove | undefined =>
  legalMoves.find((move) => isMoveItemType(MaterialType.VillageCard)(move) && move.itemIndex === card)
