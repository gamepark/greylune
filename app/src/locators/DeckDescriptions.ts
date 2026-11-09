import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ComponentSize, LocationDescription, LocationHelpProps } from '@gamepark/react-game'
import { ComponentType } from 'react'
import { EncounterDeckHelp, EventPileHelp, VillageDeckHelp } from '../material/help/DeckHelp'
import { encounterCardSize, eventTileSize, villageCardSize } from './TableLayout'

/**
 * The 3 face-down piles of the main board draw nothing of their own and take no drop: they are there
 * for their dialog (see {@link DeckHelp}), which the pieces lying face down in them send the reader to.
 */
class PileDescription extends LocationDescription<PlayerColor, MaterialType, LocationType> {
  constructor(
    readonly help: ComponentType<LocationHelpProps<PlayerColor, LocationType>>,
    size: ComponentSize
  ) {
    super()
    /** Nothing is drawn here, but a description without a size is one the dialog cannot even measure. */
    this.width = size.width
    this.height = size.height
  }
}

export const villageDeckDescription = new PileDescription(VillageDeckHelp, villageCardSize)
export const encounterDeckDescription = new PileDescription(EncounterDeckHelp, encounterCardSize)
export const eventPileDescription = new PileDescription(EventPileHelp, eventTileSize)
