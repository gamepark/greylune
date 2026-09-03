import { EventTile } from '@gamepark/greylune/material/EventTile'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { QuestTile } from '@gamepark/greylune/material/QuestTile'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { TokenDescription } from '@gamepark/react-game'
import { eventTileImages, EventTileBack, questTileImages, QuestTileBack } from '../images/TileImages'
import { eventTileSize, questTileSize } from '../locators/TableLayout'

export class EventTileDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, EventTile> {
  width = eventTileSize.width
  height = eventTileSize.height
  borderRadius = 0.4
  transparency = true
  images = eventTileImages
  backImage = EventTileBack
}

export class QuestTileDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, QuestTile> {
  width = questTileSize.width
  height = questTileSize.height
  borderRadius = 0.3
  transparency = true
  images = questTileImages
  backImage = QuestTileBack
}
