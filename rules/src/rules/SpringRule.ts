import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { cardsAroundGap, villageGaps } from '../material/Village'
import { Season } from '../Season'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove } from './GreyluneRule'
import { SeasonRule } from './SeasonRule'

/**
 * The turn of a player still in Spring (rulebook p.6): they place one of their active Villagers in
 * the Village, take part in the Event, or move on to Summer — which is followed at once by a Summer
 * action, and which they can never come back from.
 */
export class SpringRule extends SeasonRule {
  getPlayerMoves(): GreyluneMove[] {
    return [...this.placeVillagerMoves(), ...this.eventMoves(LocationType.ActiveVillagers), this.customMove(CustomMoveType.ChangeSeason)]
  }

  /**
   * A Villager is placed between two neighbouring cards, or between a card and an empty slot: a gap
   * whose two cards have both been taken is worth nothing to anyone and is not offered.
   */
  private placeVillagerMoves(): GreyluneMove[] {
    const villagers = this.activeVillagers
    return villageGaps
      .filter((gap) => cardsAroundGap(this, gap).length > 0)
      .flatMap((gap) => villagers.moveItems({ type: LocationType.VillageGap, player: this.player, ...gap }))
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    return isCustomMoveType(CustomMoveType.ChangeSeason)(move) ? this.changeSeason(Season.Summer) : super.onCustomMove(move)
  }
}
