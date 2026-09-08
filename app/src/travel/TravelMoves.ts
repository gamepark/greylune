import { Area } from '@gamepark/greylune/material/Area'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { CustomMove, isCustomMoveType, isMoveItemType, MaterialMove, MaterialRules, MoveItem } from '@gamepark/rules-api'

/**
 * Setting out from Greylune, or going further from where the Adventurer stopped last time (see
 * `TravelRule`).
 *
 * The areas lie in a line, so the whole of the decision — which way, and how far — is which area the
 * pawn ends up standing in, staying where it is included. Both are offered on the board itself: the
 * areas within reach wear a button apiece, the one the pawn stands in wears the offer not to move.
 */

export type GreyluneMove = MaterialMove<PlayerColor, MaterialType, LocationType>
export type AdventurerMove = MoveItem<PlayerColor, MaterialType, LocationType>

/**
 * Walking the Adventurer into an area. That is the whole of what the journey is, and it is the only
 * time a player walks the pawn themselves: everywhere else the rules move it, and Autumn brings it
 * home on its own (see `AutumnRule`). So a move that takes it to an area is a journey, and nothing
 * has to be read off the rules to know it.
 */
export const isTravelMove = (move: GreyluneMove): move is AdventurerMove =>
  isMoveItemType(MaterialType.Adventurer)(move) && move.location.type === LocationType.Area

/** Where such a move stops. Greylune has no id printed on it, being the area the board starts from. */
export const travelDestination = (move: AdventurerMove): Area => (move.location.id as Area) ?? Area.Village

/**
 * Staying put, which is an arrival like any other: the Encounter of the area is resolved either way,
 * and the potions kept for the road are drunk there (see `TravelRule`).
 *
 * Every window the rules leave open is closed with the same Pass — a story, a reaction — so what
 * makes this one staying put is the question being asked: the offer is read off the rule in hand,
 * and the pawn only ever wears it while the journey is what is being waited for.
 */
export const stayPutMove = (
  rules: MaterialRules<PlayerColor, MaterialType, LocationType>,
  legalMoves: GreyluneMove[]
): CustomMove | undefined => (rules.game.rule?.id === RuleId.Travel ? legalMoves.find(isCustomMoveType(CustomMoveType.Pass)) : undefined)
