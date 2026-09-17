import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { PlayerPanelDescription } from '../panels/PlayerPanelDescription'
import { cardHoverLift } from './CardHover'
import { seatOf } from './DisplayedPlayer'
import { playerPanelHeight, playerPanelSpot, playerPanelWidth } from './TableLayout'

/**
 * Lifted over every card that reaches it, so a card lying on the table never covers it — but under a
 * card seen up close, which the player has asked to read whole (see {@link cardHoverLift}).
 */
const panelZ = cardHoverLift / 2

/** One panel per player, all of them in the bottom right corner of the player area. */
class PlayerPanelLocator extends Locator {
  locationDescription = new PlayerPanelDescription({ width: playerPanelWidth, height: playerPanelHeight })

  getLocations(context: MaterialContext) {
    return context.rules.players.map((player) => ({ player }))
  }

  getCoordinates(location: Location, context: MaterialContext) {
    return { ...playerPanelSpot(seatOf(context, location.player), context.rules.players.length), z: panelZ }
  }
}

export const playerPanelLocator = new PlayerPanelLocator()
