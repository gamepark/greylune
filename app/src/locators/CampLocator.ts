import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { DropAreaDescription, ItemContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialMove } from '@gamepark/rules-api'
import { CampArea } from '../villagers/CampAction'
import { isGainCoinsAround, villagerActionData } from '../villagers/VillagerActions'
import { campAreaSize, campRadius, campSpot } from './TableLayout'

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
 * Where spent Villagers rest until Autumn, all the players' mixed up, and what the tents become while
 * a Villager is carried over the table. The area is never listed here: the framework opens it only
 * for a pawn whose own move names it.
 *
 * The figures stand upright, so they are scattered without being turned, and the one lower down is
 * the one nearer to the eye: it is drawn in front of the ones behind it, whatever order they came in.
 */
export class CampLocator extends PileLocator<PlayerColor, MaterialType, LocationType> {
  locationDescription = new CampAreaDescription()
  coordinates = campSpot
  radius = campRadius
  maxAngle = 0
  zFromY = true
  minimumDistance = 0.3
}
