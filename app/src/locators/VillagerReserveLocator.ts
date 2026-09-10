import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { LocationDescription, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'
import { CenteredListLocator } from './CenteredListLocator'
import { hideBandOfOtherPlayers } from './DisplayedPlayer'
import { areaOf } from './Seats'
import { villagerReserveSize, villagerReserveSpot } from './TableLayout'
import { VillagerReserveHelp } from '../material/help/VillagerReserveHelp'

/**
 * The reserve draws nothing and takes no drop: it is a stretch of table where the 4 Villagers a
 * player does not own yet are stood. It exists here for the one thing a place can have that a piece
 * cannot — an explanation of its own (see {@link VillagerReserveHelp}), which the figures standing
 * in it send the reader to.
 */
class VillagerReserveDescription extends LocationDescription<PlayerColor, MaterialType, LocationType> {
  help = VillagerReserveHelp
  /** Nothing is drawn here, but a description without a size is one the dialog cannot even measure. */
  width = villagerReserveSize.width
  height = villagerReserveSize.height
}

/** The 4 Villagers set aside at setup, in a row above the personal board (rulebook p.3). */
export class VillagerReserveLocator extends CenteredListLocator<PlayerColor, MaterialType, LocationType> {
  locationDescription = new VillagerReserveDescription()
  gap = { x: 1.6 }
  hide = hideBandOfOtherPlayers

  getCenter(location: Location<PlayerColor, LocationType>, context: MaterialContext<PlayerColor, MaterialType, LocationType>): Partial<Coordinates> {
    return villagerReserveSpot(areaOf(context, location.player))
  }
}
