import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { PlayerPanelDescription } from '../panels/PlayerPanelDescription'
import { getBandRow, showsBandOf } from './DisplayedPlayer'
import { panelZ, playerAreaSpot, playerPanelHeight, playerPanelSpot, playerPanelWidth } from './TableLayout'

/** One panel per player, standing over their own row of Objects. */
class PlayerPanelLocator extends Locator {
  locationDescription = new PlayerPanelDescription({ width: playerPanelWidth, height: playerPanelHeight })

  getLocations(context: MaterialContext) {
    return context.rules.players.map((player) => ({ player }))
  }

  getCoordinates(location: Location, context: MaterialContext) {
    const seat = Math.max(0, context.rules.players.indexOf(location.player as PlayerColor))
    const bandRow = getBandRow(context)
    const area = playerAreaSpot(seat, context.rules.players.length, bandRow)
    return { ...playerPanelSpot(area, showsBandOf(context, location.player as PlayerColor)), z: panelZ }
  }
}

export const playerPanelLocator = new PlayerPanelLocator()
