import { ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { EventTile, eventTileData, isFestival } from '../material/EventTile'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { TriggerType } from '../material/Reaction'
import { Season } from '../Season'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * What Spring and Summer share: the Event of the year, which either of them may be spent on, and
 * the move to the next season, which is free and is followed at once by an action of the new one.
 */
export abstract class SeasonRule extends GreyluneRule {
  /** The tile of the year: the one on top of the pile, and the only one turned face up. */
  get eventTile(): EventTile | undefined {
    return this.material(MaterialType.EventTile).location(LocationType.EventPile).rotation(true).getItem()?.id as EventTile | undefined
  }

  /** Once a year for each player, whichever season they spend it in (rulebook p.6). */
  get hasUsedEvent(): boolean {
    return this.villagers.location(LocationType.EventSpace).player(this.player).length > 0
  }

  /**
   * Placing a Villager on the tile is the choice of what it does: it stands on the option it pays
   * for. On the Festival, and only there, a space taken is taken for the year.
   */
  eventMoves(from: LocationType): GreyluneMove[] {
    const tile = this.eventTile
    if (tile === undefined || this.hasUsedEvent) return []
    const villagers = this.villagers.location(from).player(this.player)
    if (!villagers.length) return []
    return eventTileData[tile].abilities.flatMap((ability, option) => {
      if (!this.canPay(ability.requirements)) return []
      if (isFestival(tile) && this.villagers.location(LocationType.EventSpace).getItems().some((item) => item.location.x === option)) return []
      return villagers.moveItems({ type: LocationType.EventSpace, player: this.player, x: option })
    })
  }

  /** The Villager is standing on the tile: what the option asks for is settled next. */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (move.itemType !== MaterialType.Villager || !('location' in move)) return []
    if (move.location.type === LocationType.EventSpace) return this.openReactions([TriggerType.SpendForce], RuleId.Event)
    if (move.location.type === LocationType.VillageGap) return this.endOfAction()
    return []
  }

  /** Moving on costs nothing and cannot be taken back, and the new season is played at once. */
  changeSeason(to: Season): GreyluneMove[] {
    return [
      this.material(MaterialType.SeasonMarker).id(this.player).moveItem({ type: LocationType.SeasonTrack, x: to }),
      this.startRule(to === Season.Summer ? RuleId.Summer : RuleId.Autumn)
    ]
  }

  /** The memory of an action never survives a season change: nothing is owed on the way in. */
  onRuleStart(): GreyluneMove[] {
    this.forget(Memory.CostReduction)
    return []
  }
}
