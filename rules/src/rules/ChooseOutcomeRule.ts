import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { CustomMoveType } from './CustomMoveType'
import { EncounterRule, ResolveOutcomeData } from './EncounterRule'
import { GreyluneMove } from './GreyluneRule'

/**
 * The Encounter is named and the player says what they pay for it (rulebook p.11): its left side,
 * its right one, or both to be paid both rewards.
 *
 * Only the 7 two-sided cards ever come here, and only when the player can afford more than one of
 * those 3 ways — {@link ResolveEncounterRule} resolves the card on the spot when it can be resolved
 * in a single way. The buttons are worn by the card itself, which is where the two sides are printed
 * and the only place the choice reads.
 */
export class ChooseOutcomeRule extends EncounterRule {
  /** The Encounter named in the first half of the decision. */
  get card(): number {
    return this.remind<number>(Memory.ResolvedEncounter)
  }

  getPlayerMoves(): GreyluneMove[] {
    return this.encounterMoves(this.card).map((data) => this.customMove(CustomMoveType.ResolveOutcome, data))
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.ResolveOutcome)(move)) return this.resolve(move.data as ResolveOutcomeData)
    return super.onCustomMove(move)
  }
}
