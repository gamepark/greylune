import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { DropAreaDescription, ItemContext } from '@gamepark/react-game'
import { Coordinates, Location, MaterialMove } from '@gamepark/rules-api'
import { CampArea } from '../villagers/CampAction'
import { isGainCoinsAround, villagerActionData } from '../villagers/VillagerActions'
import { CenteredListLocator } from './CenteredListLocator'
import { campAreaSize, campSpot } from './TableLayout'

/**
 * The tents, offered to a Villager coming back from the Village. Every way back is the same move,
 * so the area takes the drop from the Villager the move names and pays whatever that Villager's card
 * owes (see {@link CampArea}).
 */
class CampAreaDescription extends DropAreaDescription<PlayerColor, MaterialType, LocationType> {
  Component = CampArea
  width = campAreaSize.width
  height = campAreaSize.height
  borderRadius = 1

  canDrop(
    move: MaterialMove<PlayerColor, MaterialType, LocationType>,
    _location: Location<PlayerColor, LocationType>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>
  ): boolean {
    return isGainCoinsAround(move) && context.type === MaterialType.Villager && villagerActionData(move).villager === context.index
  }
}

/**
 * Where spent Villagers rest until Autumn, and what the tents become while a Villager is carried
 * over the table. The area is never listed here: the framework opens it only for a pawn whose own
 * move names it, so the camps of the other players are never anybody's to drop on.
 */
export class CampLocator extends CenteredListLocator<PlayerColor, MaterialType, LocationType> {
  locationDescription = new CampAreaDescription()

  /**
   * The area is the camp itself and not one player's row of it, so it stays on the tents rather than
   * following the row the Villagers of a player line up on — which is what the coordinates of the
   * location say, and what the Villagers themselves go on using.
   */
  protected getAreaCoordinates(): Partial<Coordinates> {
    return campSpot
  }
}
