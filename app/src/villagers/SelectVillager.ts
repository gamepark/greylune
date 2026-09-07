import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext, useRules } from '@gamepark/react-game'
import { isMoveItemType, MaterialMove, MoveItem } from '@gamepark/rules-api'

type GreyluneMove = MaterialMove<PlayerColor, MaterialType, LocationType>
type VillagerMove = MoveItem<PlayerColor, MaterialType, LocationType>

/**
 * Aiming a Villager before saying where it goes.
 *
 * A player has several Villagers standing side by side and several places to walk one to, and the
 * two halves of that decision are made in either order: a player may press the space and let the
 * game take a Villager, or pick the Villager up first and then press the space. This is the second
 * half — it says nothing about where the Villager goes, only which one is meant.
 *
 * The selection is the player's own pointer, so it is never sent to anybody: the framework plays it
 * as a transient move (see `DraggableMaterial`), which lives in the local state, leaves no trace in
 * the history and is dropped the moment the Villager actually moves. All of that comes for free from
 * giving the Villager an item menu — which here is {@link SelectedVillager}, the ring drawn around it,
 * and nothing else.
 */

/**
 * The two ways a Villager is put down: into a gap of the Village, or onto the Event tile. The
 * Villager already standing on the Event and choosing its option is not one of them — it is placed
 * already, and what is left to settle about it is not which Villager it is.
 */
const isPlacement = (move: GreyluneMove, index: number): move is VillagerMove =>
  isMoveItemType(MaterialType.Villager)(move) &&
  move.itemIndex === index &&
  (move.location.type === LocationType.VillageGap || (move.location.type === LocationType.EventSpace && move.location.x === undefined))

/** A Villager is worth aiming at exactly while there is somewhere to walk it to. */
export const canSelectVillager = (context: ItemContext<PlayerColor, MaterialType, LocationType>, legalMoves: GreyluneMove[]): boolean =>
  legalMoves.some((move) => isPlacement(move, context.index))

/**
 * The Villager the player has aimed at, if any. Only one is ever selected: the framework lets go of
 * the one before as it takes a new one.
 */
export const useSelectedVillager = (): number | undefined => {
  const rules = useRules<GreyluneRules>()
  return rules?.material(MaterialType.Villager).selected().getIndexes()[0]
}

/**
 * Among the moves that all lead to the same place, the one that walks the Villager the player aimed
 * at — and, when they aimed at none, simply the first, so that a space pressed on its own still
 * takes a Villager.
 */
export const moveOfSelectedVillager = <M extends { itemIndex: number }>(moves: M[], selected?: number): M =>
  moves.find((move) => move.itemIndex === selected) ?? moves[0]
