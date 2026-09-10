import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { CustomMoveType } from './CustomMoveType'
import { EncounterRule, ResolveOutcomeData } from './EncounterRule'
import { GreyluneMove } from './GreyluneRule'

/**
 * The Encounter is named and the player says what they pay for it (rulebook p.11): a side it asks a
 * price for, or both sides to be paid both rewards.
 *
 * Only the 7 two-sided cards ever come here, and only when there is something left to say. A side
 * the player's boards already satisfy costs nothing, so no button ever leaves it behind: a card met
 * on both counts — the Ours, the Démon and the Dragon — is the whole of itself and is resolved on
 * the spot by {@link ResolveEncounterRule}, with nothing to ask. What reaches here is the Vallée,
 * la Joute, le Trésor and le Labyrinthe: the side that costs nothing on its own, or that side and
 * the one that has to be paid for.
 *
 * One button is not one too many. A player who satisfies half of the Vallée and cannot pay for the
 * other half still presses it, and that press is where they read that the second reward is out of
 * their reach — the card is not quietly resolved for less than it is worth.
 *
 * The buttons are worn by the card itself, which is where the two sides are printed and the only
 * place the choice reads.
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
