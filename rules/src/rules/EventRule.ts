import { EventTile, eventTileData } from '../material/EventTile'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * The Event of the year, once the Villager is standing on it (rulebook p.6 and p.7).
 *
 * The space it stands on is the option it pays for, so there is nothing left to choose: what the
 * option asks for is paid, what it gives is queued, and the Villager stays on the tile until Autumn
 * comes and takes it home.
 */
export class EventRule extends GreyluneRule {
  onRuleStart(): GreyluneMove[] {
    const tile = this.material(MaterialType.EventTile).location(LocationType.EventPile).rotation(true).getItem()?.id as EventTile
    const option = this.villagers.location(LocationType.EventSpace).player(this.player).getItem()?.location.x ?? 0
    const ability = eventTileData[tile].abilities[option]
    this.pushGains(ability.gains ?? [])
    return [...this.payRequirements(ability.requirements), ...this.endOfAction()]
  }

  getPlayerMoves(): GreyluneMove[] {
    return []
  }
}
