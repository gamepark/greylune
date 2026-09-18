import { isDeleteItemType, ItemMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { BonusToken, bonusTokenGains } from '../material/Tokens'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * Crossing 8 points, and then 20 (rulebook p.12): the player picks one of their Bonus tokens,
 * resolves it and puts it back in the box. The second time, the last one goes back to the box too,
 * unresolved. The number of tokens still there is the record of how far the player has come (see
 * `gainVp`).
 */
export class BonusTokenRule extends GreyluneRule {
  get tokens() {
    return this.material(MaterialType.BonusToken).location(LocationType.BonusTokens).player(this.player)
  }

  getPlayerMoves(): GreyluneMove[] {
    return this.tokens.deleteItems()
  }

  /**
   * A token is only ever picked out of 3, or out of 2: the last one deleted is the one left over,
   * going back to the box without being resolved.
   */
  beforeItemMove(move: ItemMove): GreyluneMove[] {
    if (!isDeleteItemType(MaterialType.BonusToken)(move) || this.tokens.length === 1) return []
    this.pushGains(bonusTokenGains[this.material(MaterialType.BonusToken).getItem<BonusToken>(move.itemIndex).id], true)
    const leftOver = this.tokens.index((index) => index !== move.itemIndex)
    return [...(leftOver.length === 1 ? leftOver.deleteItems() : []), ...this.endOfAction()]
  }
}
