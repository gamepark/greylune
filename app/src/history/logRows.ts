import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { getVillagerPlayer, Villager } from '@gamepark/greylune/material/Villager'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { GreyluneMove } from '@gamepark/greylune/rules/GreyluneRule'
import { MoveComponentContext } from '@gamepark/react-game'
import { isCreateItemType, isDeleteItemType, isMoveItemType } from '@gamepark/rules-api'
import { movesInRow, previousMove } from './moveRuns'

/** The rows of moves the journal writes down as one entry, and how much each of them adds up to (see {@link movesInRow}). */

type Context = MoveComponentContext<GreyluneMove>

/**
 * An item as the state holds it, spent or not. A deleted item keeps its place with a quantity of 0,
 * which the material helpers skip: the move before this one may have spent the very item it names.
 */
const spentItem = (rules: GreyluneRules, type: MaterialType, index: number) => rules.game.items[type]?.[index]

// ------------------------------------------------------------------ coins

/**
 * Whose coins a move takes or gives. A coin taken is read off the state, where it keeps its place once
 * spent (see {@link spentItem}), so the move before this one can be read too.
 */
const coinOwner = (move: GreyluneMove, rules: GreyluneRules): PlayerColor | undefined => {
  if (isCreateItemType(MaterialType.Coin)(move)) return move.item.location.type === LocationType.PlayerCoins ? move.item.location.player : undefined
  if (isDeleteItemType(MaterialType.Coin)(move)) {
    const location = spentItem(rules, MaterialType.Coin, move.itemIndex)?.location
    return location?.type === LocationType.PlayerCoins ? location.player : undefined
  }
  return undefined
}

/**
 * The coins a player gains or pays in one go: a coin of 5 and some of 1, a coin of 5 given for less
 * and the change handed back. Written down on the first move of the row, as the amount they add up to.
 *
 * What a coin taken was worth is read off the state this row starts from. The coins it takes are
 * all taken before any change is handed back (see `MaterialMoney.removeMoney`), and a taken coin keeps
 * its place, so every index the row names still holds the coin it named there.
 */
export const coinRow = (move: GreyluneMove, context: Context, rules: GreyluneRules): { first: boolean; player?: PlayerColor; total: number } => {
  const player = coinOwner(move, rules)
  const previous = previousMove(context)
  const first = previous === undefined || player === undefined || coinOwner(previous, rules) !== player
  const total = movesInRow(context, (next) => player !== undefined && coinOwner(next, rules) === player).reduce((sum, next) => {
    if (isCreateItemType(MaterialType.Coin)(next)) return sum + (next.item.id as number) * (next.item.quantity ?? 1)
    if (isDeleteItemType(MaterialType.Coin)(next)) {
      const coin = spentItem(rules, MaterialType.Coin, next.itemIndex)
      return sum - ((coin?.id as number) ?? 0) * (next.quantity ?? coin?.quantity ?? 1)
    }
    return sum
  }, 0)
  return { first, player, total }
}

// ------------------------------------------------------------------ Villagers

/** The 3 ways Villagers join or leave the active zone, one move each, as many at a time as an effect asks. */
export enum VillagerRow {
  /** Out of the reserve, gained. */
  Gain = 1,
  /** To the camp, spent. */
  Spend,
  /** Back to the reserve: the Piège mortel. */
  Return
}

export const villagerRow = (from: LocationType, to?: LocationType): VillagerRow | undefined => {
  if (from === LocationType.VillagerReserve && to === LocationType.ActiveVillagers) return VillagerRow.Gain
  if (from === LocationType.ActiveVillagers && to === LocationType.Camp) return VillagerRow.Spend
  if (from === LocationType.ActiveVillagers && to === LocationType.VillagerReserve) return VillagerRow.Return
  return undefined
}

/**
 * How many Villagers the row moves: this one and those that follow it, the same player's going the same
 * way. The state is the one before this move, and each move of the row takes a different Villager, so
 * where every one of them stands is still read right.
 */
export const villagerRowCount = (move: GreyluneMove, context: Context, rules: GreyluneRules): { player?: PlayerColor; count: number } => {
  const villagers = rules.material(MaterialType.Villager)
  const kindOf = (move: GreyluneMove) => {
    if (!isMoveItemType(MaterialType.Villager)(move)) return undefined
    const villager = villagers.getItem<Villager>(move.itemIndex)
    return { player: getVillagerPlayer(villager.id), row: villagerRow(villager.location.type, move.location.type) }
  }
  const first = kindOf(move)
  if (first?.row === undefined) return { count: 0 }
  const count = movesInRow(context, (next) => {
    const kind = kindOf(next)
    return kind?.player === first.player && kind.row === first.row
  }).length
  return { player: first.player, count }
}

// ------------------------------------------------------------------ the final count

/** A move of the score: the marker on the track, or the victory point token of the laps. */
export const isScoreMove = (move: GreyluneMove): boolean =>
  isMoveItemType(MaterialType.ScoreMarker)(move) || isMoveItemType(MaterialType.VpToken)(move) || isDeleteItemType(MaterialType.VpToken)(move)

/** Whose score it is: the marker is the player's colour, the token is laid by their board. */
export const scoreOwner = (move: GreyluneMove, rules: GreyluneRules): PlayerColor | undefined => {
  if (isMoveItemType(MaterialType.ScoreMarker)(move)) return rules.material(MaterialType.ScoreMarker).getItem<PlayerColor>(move.itemIndex).id
  if (isMoveItemType(MaterialType.VpToken)(move)) return move.location.player
  if (isDeleteItemType(MaterialType.VpToken)(move)) return spentItem(rules, MaterialType.VpToken, move.itemIndex)?.location.player
  return undefined
}
