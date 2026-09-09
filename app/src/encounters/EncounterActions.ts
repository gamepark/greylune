import { ResolveOutcomeData } from '@gamepark/greylune/rules/EncounterRule'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { CustomMove, isCustomMoveType, MaterialMove } from '@gamepark/rules-api'

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
 * The ways a card may be paid for, one per set of sides: its left, its right, or both. A Potion that
 * lets a condition be waived multiplies each of them into as many moves as there are ways to spend
 * that favour, and they are not a choice a player would want to be asked — the favour is lent for
 * this one adventure and is worth nothing kept — so the widest waiver stands for its set. A waived
 * condition is either a check the player would have passed anyway or a price they no longer pay: it
 * is never the worse move.
 */
const outcomeMoves = (legalMoves: MaterialMove[], card: number): CustomMove[] => {
  const bySides = new Map<string, CustomMove>()
  for (const move of legalMoves) {
    if (!isResolveOutcome(move) || resolveOutcomeData(move).card !== card) continue
    const sides = resolveOutcomeData(move).outcomes.join()
    const best = bySides.get(sides)
    if (best === undefined || waived(move) > waived(best)) bySides.set(sides, move)
  }
  return [...bySides.values()].sort(bySidesRead)
}

const waived = (move: CustomMove): number => resolveOutcomeData(move).ignored?.length ?? 0

/** One side before the other, and both after either: the order the card reads in. */
const bySidesRead = (a: CustomMove, b: CustomMove): number => {
  const [left, right] = [resolveOutcomeData(a).outcomes, resolveOutcomeData(b).outcomes]
  return left.length - right.length || left[0] - right[0]
}
