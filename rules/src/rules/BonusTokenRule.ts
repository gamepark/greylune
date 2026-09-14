import { isDeleteItemType, ItemMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { BonusToken, bonusTokenGains } from '../material/Tokens'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * Crossing 8 points, and then 20 (rulebook p.12): the player picks one of their Bonus tokens,
 * resolves it and puts it back in the box. The rulebook sends the last one back to the box too, but it
 * is left on the table: it gets in no one's way and shows at a glance what the player passed over. The
 * number of tokens still there is the record of how far the player has come (see `gainVp`).
 */
export class BonusTokenRule extends GreyluneRule {
  get tokens() {
    return this.material(MaterialType.BonusToken).location(LocationType.BonusTokens).player(this.player)
  }

  getPlayerMoves(): GreyluneMove[] {
    return this.tokens.deleteItems()
  }

  beforeItemMove(move: ItemMove): GreyluneMove[] {
    if (!isDeleteItemType(MaterialType.BonusToken)(move)) return []
    this.pushGains(bonusTokenGains[this.material(MaterialType.BonusToken).getItem<BonusToken>(move.itemIndex).id], true)
    return this.endOfAction()
  }
}
