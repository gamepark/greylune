import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { isCustomMoveType, isMoveItemType, MaterialMove, MoveItem } from '@gamepark/rules-api'

export type GreyluneMove = MaterialMove<PlayerColor, MaterialType, LocationType>
export type VillagerMove = MoveItem<PlayerColor, MaterialType, LocationType>

/** One thing the Event still offers this player, and the move that takes it. */
export type EventOption = { option: number; move: GreyluneMove }

const isVillagerToEvent = (move: GreyluneMove): move is VillagerMove =>
  isMoveItemType(MaterialType.Villager)(move) && move.location.type === LocationType.EventSpace

/** Walking a Villager onto the tile: the middle of it, which is no option yet. */
export const joinEventMoves = (legalMoves: GreyluneMove[]): VillagerMove[] =>
  legalMoves.filter(isVillagerToEvent).filter((move) => move.location.x === undefined)

/**
 * What the tile still offers. On the Festival an option is a space of its own, so taking it walks the
 * Villager onto it and `x` says which; everywhere else it leaves nothing on the table, so it is named
 * rather than placed and the Villager stays where it stands (see `EventRule`).
 */
export const eventOptions = (legalMoves: GreyluneMove[]): EventOption[] => [
  ...legalMoves.filter(isVillagerToEvent).flatMap((move) => (move.location.x === undefined ? [] : [{ option: move.location.x, move }])),
  ...legalMoves.filter(isCustomMoveType(CustomMoveType.TakeEventOption)).map((move) => ({ option: move.data as number, move }))
]
