import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialContext } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'
import { CenteredListLocator } from './CenteredListLocator'
import { eventSpaceGap, festivalSpaces } from './TableLayout'

type GreyluneContext = MaterialContext<PlayerColor, MaterialType, LocationType>

/**
 * The Villagers taking part in the Event of the year, standing on the tile itself.
 *
 * The Festival is the only tile with spaces of its own: 5 of them, drawn in a ring, each between 2
 * of its bonuses, and `x` says which one a Villager stands on. Every other tile draws its options as
 * a line of icons at the foot of the scroll and gives them no space at all, so a Villager that takes
 * one never leaves the middle of the tile and never gets an `x`.
 *
 * So the middle of such a tile holds a little crowd — one Villager per player, all of them taking
 * part the same year — and they line up across it, centred, rather than hiding one another. Which of
 * them stands where is `z`, the rank the StackingStrategy hands out among the ones sharing a space;
 * the Festival gives each of its 5 a rank of its own, since no two Villagers ever share one.
 */
export class EventSpaceLocator extends CenteredListLocator<PlayerColor, MaterialType, LocationType> {
  parentItemType = MaterialType.EventTile
  gap = eventSpaceGap

  getPositionOnParent(location: Location<PlayerColor, LocationType>): XYCoordinates {
    return (location.x !== undefined && festivalSpaces[location.x]) || { x: 50, y: 53 }
  }

  /** The rank in the crowd standing on one space, and never the space itself. */
  getLocationIndex(location: Location<PlayerColor, LocationType>): number {
    return location.z ?? 0
  }

  /** The row is the Villagers on this very space, not every Villager the tile carries. */
  countListItems(location: Location<PlayerColor, LocationType>, { rules }: GreyluneContext): number {
    return rules
      .material(MaterialType.Villager)
      .location((l) => l.type === LocationType.EventSpace && l.parent === location.parent && l.x === location.x).length
  }

  getPositionDependencies(location: Location<PlayerColor, LocationType>, context: GreyluneContext): unknown {
    return this.countListItems(location, context)
  }
}
