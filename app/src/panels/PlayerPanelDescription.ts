import { LocationDescription } from '@gamepark/react-game'
import { PlayerPanelContent } from './PlayerPanelContent'

/** The panel is drawn by React, not from an image: it has none. */
export class PlayerPanelDescription extends LocationDescription {
  content = PlayerPanelContent

  getImages(): string[] {
    return []
  }
}
