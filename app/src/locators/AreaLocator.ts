import { Area } from '@gamepark/greylune/material/Area'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ComponentSize, DropAreaDescription } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'
import { CenteredListLocator } from './CenteredListLocator'
import { areaGap, areaSize, areaSpot } from './TableLayout'

const areaOf = (location: Location<PlayerColor, LocationType>): Area => (location.id as Area) ?? Area.Village

/**
 * What a player aims at to send their Adventurer somewhere is the open ground of the Area — the
 * walled town, or the stretch of map its banner hangs over — so the drop area covers that space and
 * not the pawn that will end up standing on it. The road between two Areas, riders and all, belongs
 * to neither of them and takes no drop.
 */
class AreaDescription extends DropAreaDescription<PlayerColor, MaterialType, LocationType> {
  borderRadius = 1

  getLocationSize(location: Location<PlayerColor, LocationType>): ComponentSize {
    return areaSize(areaOf(location))
  }
}

/**
 * The 6 Areas the Adventurers walk between. Several of them share an Area as soon as they are level,
 * so they line up in it, along whichever way its space is the longer (see {@link areaGap}).
 */
export class AreaLocator extends CenteredListLocator<PlayerColor, MaterialType, LocationType> {
  locationDescription = new AreaDescription()

  getCenter(location: Location<PlayerColor, LocationType>): Partial<Coordinates> {
    return areaSpot(areaOf(location))
  }

  getGap(location: Location<PlayerColor, LocationType>): Partial<Coordinates> {
    return areaGap(areaOf(location))
  }

  /**
   * The area is the ground itself, so it stays on the middle of it whoever is standing there,
   * instead of following the line of Adventurers back to where its first pawn is drawn.
   */
  protected getAreaCoordinates(location: Location<PlayerColor, LocationType>): Partial<Coordinates> {
    return areaSpot(areaOf(location))
  }
}
