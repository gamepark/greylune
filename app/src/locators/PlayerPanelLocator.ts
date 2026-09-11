import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { PlayerPanelDescription } from '../panels/PlayerPanelDescription'
import { cardHoverLift } from './CardHover'
import { getBandRow, showsBandOf } from './DisplayedPlayer'
import { playerAreaSpot, playerPanelHeight, playerPanelSpot, playerPanelWidth } from './TableLayout'

/**
 * Lifted over every card that reaches it, so a card lying on the table never covers it — but under a
 * card seen up close, which the player has asked to read whole, and which leans over the panel as soon
 * as it is the Object next to it (see {@link cardHoverLift}).
 */
const panelZ = cardHoverLift / 2

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
