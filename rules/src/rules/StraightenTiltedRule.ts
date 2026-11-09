import { isMoveItemType, ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * Isandre stands back up one of the cards gone down in the window she answered, and the player
 * names which (see `ReactionRule`): Tommy, tilted for his journey, or Bran, tilted for the Villager
 * Tommy asks. The window opens again once the card stands.
 */
export class StraightenTiltedRule extends GreyluneRule {
  getPlayerMoves(): GreyluneMove[] {
    // Isandre is the last card to have gone down: she has just been tilted to answer.
    const isandre = this.tilted[this.tilted.length - 1]
    return this.straightenableBy(isandre).map((card) => this.villageCards.index(card).rotateItem(false))
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (!isMoveItemType(MaterialType.VillageCard)(move)) return []
    this.memorize(
      Memory.Tilted,
      this.tilted.filter((card) => card !== move.itemIndex)
    )
    return [this.startRule(RuleId.Reaction)]
  }
}
