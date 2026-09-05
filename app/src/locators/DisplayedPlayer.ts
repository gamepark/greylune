import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext, MaterialContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

type Context = MaterialContext<PlayerColor, MaterialType, LocationType>

/**
 * Past 2 players the column of areas no longer affords a band of material above every personal board,
 * so only one is drawn at a time: the player whose panel was clicked last, which the framework keeps in
 * `game.view`. Keeping the choice there rather than in a store of our own is what makes react-game move
 * the items — it hands `game.view` to every locator's position dependencies for free.
 */
export const getDisplayedPlayer = (context: Context): PlayerColor | undefined =>
  (context.rules.game.view as PlayerColor) ?? context.player ?? context.rules.players[0]

/** At 2 players the height is there for both bands: nothing to choose, and nothing to hide. */
export const showsAllBandsFor = (players: number): boolean => players <= 2

export const showsAllBands = (context: Context): boolean => showsAllBandsFor(context.rules.players.length)

/** The row whose band is drawn, or `undefined` while every row draws its own. */
export const getBandRow = (context: Context): number | undefined =>
  showsAllBands(context) ? undefined : Math.max(0, context.rules.players.indexOf(getDisplayedPlayer(context) as PlayerColor))

/** Whatever a player keeps above their board belongs to the band, and is drawn for the read player alone. */
export const hideBandOfOtherPlayers = (
  item: MaterialItem<PlayerColor, LocationType>,
  context: ItemContext<PlayerColor, MaterialType, LocationType>
): boolean => !showsAllBands(context) && item.location.player !== getDisplayedPlayer(context)
