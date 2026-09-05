import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { BonusToken, bonusTokenGains } from '../material/Tokens'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * Crossing 8 points, and then 20 (rulebook p.12): the player picks one of their Bonus tokens,
 * resolves it and puts it back in the box. The second time, the ones left over go back too — which
 * is what makes the number of tokens still there the record of how far the player has come.
 */
export class BonusTokenRule extends GreyluneRule {
  get tokens() {
    return this.material(MaterialType.BonusToken).location(LocationType.BonusTokens).player(this.player)
  }

  getPlayerMoves(): GreyluneMove[] {
    return this.tokens.getIndexes().map((token) => this.customMove(CustomMoveType.ChooseBonus, token))
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (!isCustomMoveType(CustomMoveType.ChooseBonus)(move)) return super.onCustomMove(move)
    const token = move.data as number
    const isLastThreshold = this.tokens.length <= 2
    this.pushGains(bonusTokenGains[this.material(MaterialType.BonusToken).getItem(token).id as BonusToken], true)
    const spent = this.material(MaterialType.BonusToken).index(token).deleteItem()
    const rest = isLastThreshold
      ? this.tokens.index((index) => index !== token).deleteItems()
      : []
    return [spent, ...rest, ...this.endOfAction()]
  }
}
