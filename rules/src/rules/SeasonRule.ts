import { isMoveItemType, ItemMove } from '@gamepark/rules-api'
import { eventTriggers } from '../material/EventTile'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
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

  /**
   * Moving on costs nothing and cannot be taken back: the player walks their marker one step down
   * the season track, and the new season is played at once (see {@link afterItemMove}).
   */
  changeSeasonMoves(to: Season): GreyluneMove[] {
    return this.material(MaterialType.SeasonMarker).id(this.player).moveItems({ type: LocationType.SeasonTrack, id: to })
  }

  /**
   * The Villager is standing on the tile: what it takes from the Event is settled next, once the
   * player has been given the chance to answer whatever that tile asks to be paid. And the season
   * marker has moved: the season it landed on is the one that is now played, read back off the board
   * rather than named beside the move.
   */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (isMoveItemType(MaterialType.SeasonMarker)(move)) {
      return [this.startRule(move.location.id === Season.Summer ? RuleId.Summer : RuleId.Autumn)]
    }
    if (!isMoveItemType(MaterialType.Villager)(move)) return []
    if (move.location.type === LocationType.EventSpace) {
      const tile = this.eventTile
      return this.openReactions(tile === undefined ? [] : eventTriggers(tile), RuleId.Event)
    }
    if (move.location.type === LocationType.VillageGap) return this.endOfAction()
    return []
  }
}
