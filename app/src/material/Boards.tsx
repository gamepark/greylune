/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { BoardDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { CustomMove, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { MainBoard, PlayerBoard, SeasonBoard } from '../images/BoardImages'
import { mainBoardSize, playerBoardSize, seasonBoardSize } from '../locators/TableLayout'
import { TravelMenu } from '../travel/TravelMenu'
import { isTravelMove } from '../travel/TravelMoves'
import { CampMenu } from '../villagers/CampAction'
import { selectedVillager } from '../villagers/SelectVillager'
import { bestCoinsMove, isGainCoinsAround, villagerActionData } from '../villagers/VillagerActions'

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

  /** The map asks to be pressed, not picked up: what it offers is there as soon as it is due. */
  isMenuAlwaysVisible(): boolean {
    return true
  }

  /**
   * The areas the Adventurer may walk to are stretches of ground printed here and hold no piece of
   * their own, so the offers to go there are hung on the board (see {@link TravelMenu}). The moves
   * are the reader's own, so the map only ever offers a journey to the player it is waiting for.
   */
  getItemMenu(
    _item: MaterialItem<PlayerColor, LocationType>,
    _context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    const moves = legalMoves.filter(isTravelMove)
    return moves.length ? <TravelMenu moves={moves} /> : undefined
  }
}

export class SeasonBoardDescription extends BoardDescription<PlayerColor, MaterialType, LocationType> {
  isMobile = false
  width = seasonBoardSize.width
  height = seasonBoardSize.height
  image = SeasonBoard
  transparency = true
  staticItem = { location: { type: LocationType.SeasonBoard } }

  /** The board asks to be pressed, not picked up: the offer it carries is there as soon as it is due. */
  isMenuAlwaysVisible(): boolean {
    return true
  }

  /**
   * The camp is a corner of this board and holds no piece of its own, so the offer to send the aimed-at
   * Villager home is hung here (see {@link CampMenu}). A Villager lies between 2 cards and may come back
   * with either of them: the fuller purse is the one offered.
   */
  getItemMenu(
    _item: MaterialItem<PlayerColor, LocationType>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    const villager = selectedVillager(context.rules)
    if (villager === undefined) return undefined
    const move = bestCoinsMove(
      legalMoves.filter((move): move is CustomMove => isGainCoinsAround(move) && villagerActionData(move).villager === villager),
      context.rules
    )
    return move && <CampMenu move={move} />
  }
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
