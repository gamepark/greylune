import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext, MaterialContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

type Context = MaterialContext<PlayerColor, MaterialType, LocationType>

/**
 * The table has room for one player area, so one player is read at a time: the player whose panel was
 * clicked last, which the framework keeps in `game.view`, or else the player at the screen, or else
 * the first seat. Keeping the choice there rather than in a store of our own is what makes react-game
 * redraw the items — it hands `game.view` to every locator for free.
 */
export const getDisplayedPlayer = (context: Context): PlayerColor | undefined =>
  (context.rules.game.view as PlayerColor) ?? context.player ?? context.rules.players[0]

/**
 * Every player's material is laid out on the same spots of the one area, so whatever belongs to a
 * player who is not read is not drawn at all.
 */
export const hideOtherPlayers = (item: MaterialItem<PlayerColor, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>): boolean =>
  item.location.player !== getDisplayedPlayer(context)

/** Which of the 4 seats a player sits in. Fixed for the whole game, so positions never move. */
export const seatOf = (context: Context, player?: number): number => Math.max(0, context.rules.players.indexOf(player as PlayerColor))
