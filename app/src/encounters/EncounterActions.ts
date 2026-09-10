import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { ResolveOutcomeData } from '@gamepark/greylune/rules/EncounterRule'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMove, isCustomMoveType, isMoveItemType, MaterialItem, MaterialMove, MaterialRules } from '@gamepark/rules-api'

/**
 * Resolving the Encounter the Adventurer has stopped in front of, in the 2 halves the rules make of
 * it: the card, then the sides it is paid for (see `ResolveEncounterRule` and `ChooseOutcomeRule`).
 *
 * The card is pressed rather than carried: what leaves the row is not what the player decides — the
 * Income token lying on the card has to be lifted off before the card is slid away, and a card
 * dragged over the table would take it along and then have to bring it back across the personal
 * board. So the decision is a button (see `ResolveEncounter`), and the card is moved by the rule
 * that answers it.
 */

export const isChooseEncounter = isCustomMoveType(CustomMoveType.ChooseEncounter)

export const isResolveOutcome = isCustomMoveType(CustomMoveType.ResolveOutcome)

export const resolveOutcomeData = (move: CustomMove): ResolveOutcomeData => move.data as ResolveOutcomeData

/**
 * What an Encounter of the row wears, whichever half of the decision the player is in: the one
 * button that takes the card while the row is being read, and the ways of paying for it once it is
 * the card being resolved. The two never show at once — the row is offered by one rule and the sides
 * by the next — so a card is never asking two questions.
 */
export const encounterMoves = (legalMoves: MaterialMove[], card: number): CustomMove[] => {
  const chosen = legalMoves.filter((move): move is CustomMove => isChooseEncounter(move) && move.data === card)
  return chosen.length ? chosen : outcomeMoves(legalMoves, card)
}

/**
 * The ways a card may be paid for, one button per set of sides. A side that costs the player nothing
 * is part of every one of them (see `EncounterRule`), so what the buttons really ask is which prices
 * are paid: at most 2 of them, and never one that hands over less for the same price.
 *
 * A Potion that lets a condition be waived can still split a set of sides into several moves, and
 * which conditions the favour is spent on is not a choice a player would want to be asked — the rule
 * only ever offers to waive what the set cannot be paid for without, so the moves left differ in
 * nothing that matters and the cheapest waiver stands for its set.
 */
const outcomeMoves = (legalMoves: MaterialMove[], card: number): CustomMove[] => {
  const bySides = new Map<string, CustomMove>()
  for (const move of legalMoves) {
    if (!isResolveOutcome(move) || resolveOutcomeData(move).card !== card) continue
    const sides = resolveOutcomeData(move).outcomes.join()
    const best = bySides.get(sides)
    if (best === undefined || waived(move) < waived(best)) bySides.set(sides, move)
  }
  return [...bySides.values()].sort(bySidesRead)
}

const waived = (move: CustomMove): number => resolveOutcomeData(move).ignored?.length ?? 0

/** One side before the other, and both after either: the order the card reads in. */
const bySidesRead = (a: CustomMove, b: CustomMove): number => {
  const [left, right] = [resolveOutcomeData(a).outcomes, resolveOutcomeData(b).outcomes]
  return left.length - right.length || left[0] - right[0]
}

/**
 * The move that slides one Encounter over to the told Stories, when there is one: the Tavern only
 * offers the cards it would hear, and the Tournament of the Bards takes any of them (see
 * `TellStoryRule` and `ResolveQuestRule`). Either way the card is pressed rather than dragged, so
 * that a fan of quarters overlapping one another is aimed at once and not carried across the band.
 */
export const tellStoryMove = (legalMoves: MaterialMove[], card: number): MaterialMove | undefined =>
  legalMoves.find(
    (move) => isMoveItemType(MaterialType.EncounterCard)(move) && move.itemIndex === card && move.location.type === LocationType.ToldStories
  )

/**
 * Closing the story, which is what the Tavern is paid on: the player is paid when they stop, and
 * only then (see `TellStoryRule`).
 *
 * Passing is the one move half the rules of the game end on, so the rule has to be read as well as
 * the move: the same custom move answers a reaction window, an Encounter nobody can pay for and a
 * journey cut short, and none of those is worn by a personal board.
 */
export const endStoryMove = (
  legalMoves: MaterialMove[],
  rules: MaterialRules<PlayerColor, MaterialType, LocationType>
): CustomMove | undefined =>
  rules.game.rule?.id === RuleId.TellStory ? legalMoves.find((move): move is CustomMove => isCustomMoveType(CustomMoveType.Pass)(move)) : undefined

/**
 * Whether a told Story is the last one told, which is the head of the fan and the only Story to wear
 * the offer to stop. Every Encounter told in the whole game is in that fan, so the button would
 * otherwise be worn a dozen times over — and by cards buried under the one just slid in.
 */
export const isLastToldStory = (
  item: MaterialItem<PlayerColor, LocationType>,
  rules: MaterialRules<PlayerColor, MaterialType, LocationType>
): boolean =>
  rules
    .material(MaterialType.EncounterCard)
    .location(LocationType.ToldStories)
    .player(item.location.player)
    .getItems()
    .every((other) => (other.location.x ?? 0) <= (item.location.x ?? 0))
