/** @jsxImportSource @emotion/react */
import { EventTile } from '@gamepark/greylune/material/EventTile'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { QuestTile } from '@gamepark/greylune/material/QuestTile'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { ResolveEncounterRule } from '@gamepark/greylune/rules/ResolveEncounterRule'
import { ItemContext, TokenDescription } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { AchieveQuestButton } from '../encounters/AchieveQuest'
import { eventOptions, joinEventMoves } from '../event/EventMoves'
import { EventTileMenu } from '../event/EventTileMenu'
import { eventTileImages, EventTileBack, questTileImages, QuestTileBack } from '../images/TileImages'
import { eventTileSize, questTileSize } from '../locators/TableLayout'
import { EventTileHelp } from './help/EventTileHelp'
import { QuestTileHelp } from './help/QuestTileHelp'

export class EventTileDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, EventTile> {
  width = eventTileSize.width
  height = eventTileSize.height
  borderRadius = 0.4
  transparency = true
  images = eventTileImages
  backImage = EventTileBack
  help = EventTileHelp

  /** The Event asks to be pressed, not picked up: its buttons are there as soon as they are due. */
  isMenuAlwaysVisible(): boolean {
    return true
  }

  /**
   * The tile of the year carries what the player may do with it (see {@link EventTileMenu}); the
   * ones still face down under it carry nothing.
   */
  getItemMenu(
    item: MaterialItem<PlayerColor, LocationType, EventTile>,
    _context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    if (item.location.rotation !== true || item.id === undefined) return undefined
    if (!joinEventMoves(legalMoves).length && !eventOptions(legalMoves).length) return undefined
    return <EventTileMenu tile={item.id} legalMoves={legalMoves} />
  }
}

export class QuestTileDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, QuestTile> {
  width = questTileSize.width
  height = questTileSize.height
  borderRadius = 0.3
  transparency = true
  images = questTileImages
  backImage = QuestTileBack
  help = QuestTileHelp

  /** Like the Event: the Quest asks to be pressed, and its button is there as soon as it is due. */
  isMenuAlwaysVisible(): boolean {
    return true
  }

  /**
   * The Quest lying where the Adventurer has stopped wears the offer to achieve it, for as long as it
   * is one of the ways out of the space (see {@link AchieveQuestButton}). The move names no tile — a
   * space carries one Quest at most — so the tile is told apart by where the player stands.
   */
  getItemMenu(
    item: MaterialItem<PlayerColor, LocationType, QuestTile>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    const move = legalMoves.find((move): move is CustomMove => isCustomMoveType(CustomMoveType.ResolveQuest)(move))
    if (!move || item.location.type !== LocationType.QuestTileSpace) return undefined
    if (item.location.id !== new ResolveEncounterRule(context.rules.game).questSpace) return undefined
    return <AchieveQuestButton move={move} player={context.rules.game.rule?.player} />
  }
}
