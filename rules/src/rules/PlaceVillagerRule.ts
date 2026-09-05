import { ItemMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { cardsAroundGap, villageGaps } from '../material/Village'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * An active Villager goes and stands in the Village, between two neighbouring cards or between a
 * card and an empty slot (rulebook p.6). A gap whose two cards have both been taken is worth
 * nothing to anybody, so nothing is ever placed there.
 */
export class PlaceVillagerRule extends GreyluneRule {
  get gaps() {
    return villageGaps.filter((gap) => cardsAroundGap(this, gap).length > 0)
  }

  getPlayerMoves(): GreyluneMove[] {
    return this.activeVillagers
      .getIndexes()
      .flatMap((villager) =>
        this.gaps.map((gap) => this.villagers.index(villager).moveItem({ type: LocationType.VillageGap, player: this.player, ...gap }))
      )
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    return move.itemType === MaterialType.Villager ? this.endOfAction() : []
  }
}
