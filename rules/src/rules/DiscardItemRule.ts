import { ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { itemLimit, playerItems } from '../material/PlayerState'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * An Object goes back in the box — the purchase took the player past their limit, or the Donation
 * asked for it. The one just bought may be the one given up, once its immediate gains have been
 * taken (rulebook p.8).
 */
export class DiscardItemRule extends GreyluneRule {
  getPlayerMoves(): GreyluneMove[] {
    return this.villageCards.location(LocationType.Items).player(this.player).deleteItems()
  }

  /**
   * Giving up the Bag of holding lowers the limit with it: a player still over the limit gives up
   * another Object before going on.
   */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (move.itemType !== MaterialType.VillageCard) return []
    if (playerItems(this, this.player).length > itemLimit(this, this.player)) return []
    return [this.startRule(this.remind<RuleId>(Memory.Resume) ?? RuleId.ResolveEffects)]
  }
}
