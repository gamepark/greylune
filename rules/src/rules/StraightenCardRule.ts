import { ItemMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/** One tilted card stands straight again, and is ready to be used a second time this year. */
export class StraightenCardRule extends GreyluneRule {
  getPlayerMoves(): GreyluneMove[] {
    return this.playerCards.rotation(true).rotateItems(false)
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    return move.itemType === MaterialType.VillageCard ? this.endOfAction() : []
  }
}
