import { ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
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
  /**
   * Taking part is one move and one decision at a time: the Villager walks onto the tile and stands
   * in the middle of it, and what the Event gives is chosen afterwards (see {@link EventRule}). The
   * tile is only offered while it still has something left to give this player.
   */
  eventMoves(from: LocationType): GreyluneMove[] {
    if (this.hasUsedEvent || !this.eventOptions.length) return []
    return this.villagers.location(from).player(this.player).moveItems(this.eventSpace)
  }

  /** The Villager is standing on the tile: what it takes from the Event is settled next. */
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
