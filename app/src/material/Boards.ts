import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { BoardDescription, MaterialContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { MainBoard, PlayerBoard, SeasonBoard } from '../images/BoardImages'
import { mainBoardSize, playerBoardSize, seasonBoardSize } from '../locators/TableLayout'

/**
 * Boards never move and never change, so they stay out of the game state: they are static items,
 * created from the context alone.
 */

export class MainBoardDescription extends BoardDescription<PlayerColor, MaterialType, LocationType> {
  isMobile = false
  width = mainBoardSize.width
  height = mainBoardSize.height
  image = MainBoard
  staticItem = { location: { type: LocationType.MainBoard } }
}

export class SeasonBoardDescription extends BoardDescription<PlayerColor, MaterialType, LocationType> {
  isMobile = false
  width = seasonBoardSize.width
  height = seasonBoardSize.height
  image = SeasonBoard
  transparency = true
  staticItem = { location: { type: LocationType.SeasonBoard } }
}

export class PlayerBoardDescription extends BoardDescription<PlayerColor, MaterialType, LocationType> {
  isMobile = false
  width = playerBoardSize.width
  height = playerBoardSize.height
  image = PlayerBoard
  transparency = true

  /** One board per player, in seat order. At 2 or 3 players the remaining seats stay empty. */
  getStaticItems({ rules }: MaterialContext<PlayerColor, MaterialType, LocationType>): MaterialItem<PlayerColor, LocationType>[] {
    return rules.players.map((player) => ({ location: { type: LocationType.PlayerBoard, player } }))
  }
}
