import { EncounterCardId } from '@gamepark/greylune/material/EncounterCard'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CardDescription } from '@gamepark/react-game'
import { encounterCardBacks, encounterCardImagesEn, encounterCardImagesFr } from '../images/EncounterCardImages'
import { villageCardBacks, villageCardImagesEn, villageCardImagesFr } from '../images/VillageCardImages'
import { encounterCardSize, villageCardBorderRadius, villageCardSize } from '../locators/TableLayout'
import { EncounterCardHelp } from './help/EncounterCardHelp'
import { VillageCardHelp } from './help/VillageCardHelp'

/**
 * Card ids carry both faces: `front` is the card itself, `back` its period. A card in a deck loses
 * its front (see the hiding strategies) and keeps its period, which is exactly what the 3 different
 * deck covers show. The framework then flips it on its own, since a card without a front is a card
 * nobody can see.
 */

export class VillageCardDescription extends CardDescription<PlayerColor, MaterialType, LocationType, VillageCardId> {
  width = villageCardSize.width
  height = villageCardSize.height
  borderRadius = villageCardBorderRadius
  images = villageCardImagesEn
  backImages = villageCardBacks
  help = VillageCardHelp
}

export class VillageCardDescriptionFr extends VillageCardDescription {
  images = villageCardImagesFr
}

export class EncounterCardDescription extends CardDescription<PlayerColor, MaterialType, LocationType, EncounterCardId> {
  width = encounterCardSize.width
  height = encounterCardSize.height
  borderRadius = 0.3
  images = encounterCardImagesEn
  backImages = encounterCardBacks
  help = EncounterCardHelp
}

export class EncounterCardDescriptionFr extends EncounterCardDescription {
  images = encounterCardImagesFr
}
