import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem } from '@gamepark/rules-api'
import { areaOf } from './Seats'
import { activeVillagersSpot, activeVillagersStep } from './TableLayout'

type GreyluneContext = MaterialContext<PlayerColor, MaterialType, LocationType>

/** The row of 3 is the middle of the hexagon: the Villagers a player starts with fill it, and nothing else does until it is full. */
const middleRowSize = 3
/** The 2 other rows, in the order they are filled: the one in front of the row of 3, then the one behind it. */
const outerRows = [1, -1]
const outerRowSize = 2

/**
 * A player owns 7 Villagers at most, and the ones not yet sent out stand in the frame at the foot of
 * their board, packed in a hexagon: a row of 3 with a row of 2 on either side of it, each Villager of
 * those standing between 2 of the middle row.
 *
 * The row of 3 is filled first, and stays centred as long as it is not full, so the 3 Villagers of
 * the start of the game stand in the middle of the frame. The rows of 2 only take the ones it cannot
 * hold, the row in front before the one behind, and they keep to the gaps of the full row of 3.
 */
export class ActiveVillagersLocator extends Locator<PlayerColor, MaterialType, LocationType> {
  getCoordinates(location: Location<PlayerColor, LocationType>, context: GreyluneContext): Coordinates {
    return activeVillagersSpot(areaOf(context, location.player))
  }

  getPositionDependencies(location: Location<PlayerColor, LocationType>, context: GreyluneContext): unknown {
    return this.countItems(location, context)
  }

  getItemCoordinates(item: MaterialItem<PlayerColor, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>): Partial<Coordinates> {
    const { x, y, z } = this.getCoordinates(item.location, context)
    const { row, column } = hexagonPlace(this.getItemIndex(item, context), this.countItems(item.location, context))
    return {
      x: x + column * activeVillagersStep.x,
      y: y + row * activeVillagersStep.y,
      z: z + (row + 1) * activeVillagersStep.z
    }
  }
}

/** Where the Villager of rank `index` stands among `count`: its row, from -1 behind to 1 in front, and its column, 0 being the middle. */
const hexagonPlace = (index: number, count: number): { row: number; column: number } => {
  if (index < middleRowSize) return { row: 0, column: index - (Math.min(count, middleRowSize) - 1) / 2 }
  const outer = index - middleRowSize
  const row = outerRows[Math.min(Math.floor(outer / outerRowSize), outerRows.length - 1)]
  return { row, column: (outer % outerRowSize) - (outerRowSize - 1) / 2 }
}
