import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Villager } from '@gamepark/greylune/material/Villager'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { TokenDescription } from '@gamepark/react-game'
import {
  adventurerImages,
  MagicMarker,
  questMarkerImages,
  scoreMarkerImages,
  seasonMarkerImages,
  StrengthMarker,
  villagerImages
} from '../images/PawnImages'

/**
 * Meeples and markers. Their artwork already carries its drop shadow, so they are declared with the
 * full size of the image, halo included.
 */

export class AdventurerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, PlayerColor> {
  width = 3.25
  height = 3.52
  transparency = true
  images = adventurerImages
}

/**
 * A Villager's id carries its colour and its figure, so which of the 7 it is, is settled by the
 * rules and not by the display: the same face follows it from the reserve to the camp and back.
 */
export class VillagerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, Villager> {
  width = 1.87
  height = 3.04
  transparency = true
  images = villagerImages
}

export class SeasonMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, PlayerColor> {
  width = 1.88
  height = 2
  transparency = true
  images = seasonMarkerImages
}

export class ScoreMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, PlayerColor> {
  width = 1.6
  height = 1.95
  transparency = true
  images = scoreMarkerImages
}

export class QuestMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, PlayerColor> {
  width = 1.42
  height = 1.65
  transparency = true
  images = questMarkerImages
}

export class StrengthMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType> {
  width = 1.62
  height = 1.98
  transparency = true
  image = StrengthMarker
}

export class MagicMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType> {
  width = 1.6
  height = 1.96
  transparency = true
  image = MagicMarker
}
