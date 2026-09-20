import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'

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

/** The places a player's area is made of: all of them lie on the same spots, whoever they belong to. */
const playerAreaLocations = new Set<LocationType>([
  LocationType.PlayerBoard,
  LocationType.Companions,
  LocationType.Items,
  LocationType.UntoldStories,
  LocationType.ToldStories,
  LocationType.ActiveVillagers,
  LocationType.StrengthTrack,
  LocationType.MagicTrack,
  LocationType.QuestMarkerSpace,
  LocationType.IncomeTokenSpace,
  LocationType.SpecialAction,
  LocationType.BonusTokens,
  LocationType.PlayerCoins,
  LocationType.PlayerVpTokens,
  LocationType.FirstPlayerTokenSpace
])

/**
 * Whether a place lies in the area of a player who is not read, so that nothing there is drawn. The
 * Income token an Encounter carries goes out of sight with its card, when the card lies among the
 * Stories of such a player.
 */
export const isOutOfSight = (location: Location<PlayerColor, LocationType>, context: Context): boolean => {
  if (location.type === LocationType.CardIncome && location.parent !== undefined) {
    return isOutOfSight(context.rules.material(MaterialType.EncounterCard).getItem(location.parent).location, context)
  }
  return playerAreaLocations.has(location.type) && location.player !== getDisplayedPlayer(context)
}

/**
 * Whose area a place belongs to: the player it names, or — for the Income token an Encounter carries —
 * the player whose Stories the card lies among.
 */
export const areaOwner = (location: Location<PlayerColor, LocationType>, context: Context): PlayerColor | undefined => {
  if (location.type === LocationType.CardIncome && location.parent !== undefined) {
    return areaOwner(context.rules.material(MaterialType.EncounterCard).getItem(location.parent).location, context)
  }
  return location.player
}

/** Which of the 4 seats a player sits in. Fixed for the whole game, so positions never move. */
export const seatOf = (context: Context, player?: number): number => Math.max(0, context.rules.players.indexOf(player as PlayerColor))
