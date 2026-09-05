import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { PlayerPanelDescription } from '../panels/PlayerPanelDescription'
import { getBandRow } from './DisplayedPlayer'
import { playerAreaSpot, playerPanelHeight, playerPanelSpot, playerPanelWidth } from './TableLayout'

/** Lifted above everything else on the table: a panel is never covered by a card that reaches it. */
const panelZ = 20

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
    return { ...playerPanelSpot(area, bandRow === undefined || seat === bandRow), z: panelZ }
  }
}

export const playerPanelLocator = new PlayerPanelLocator()
