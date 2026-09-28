import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { encounterCardData } from '../material/EncounterCard'
import { ReactionType } from '../material/Reaction'
import { CustomMoveType } from './CustomMoveType'
import { EncounterRule, ResolveOutcomeData } from './EncounterRule'
import { GreyluneMove } from './GreyluneRule'

/**
 * The Encounter is named and the player says what they pay for it (rulebook p.11): a side it asks a
 * price for, or both sides to be paid both rewards.
 *
 Every card named comes here, but only the 7 two-sided cards ever stop here, and only when there
 * is something left to say. A side the player's boards already satisfy costs nothing, so no button
 * ever leaves it behind: a card met on both counts — the Ours, the Démon and the Dragon — is the
 * whole of itself and is resolved as soon as the rule starts, with nothing to ask. What stops here
 * is the Vallée, la Joute, le Trésor and le Labyrinthe: the side that costs nothing on its own, or
 * that side and the one that has to be paid for.
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

  /**
   * There is nothing left to choose *and* nothing left to miss, and the card is resolved on the spot.
   *
   * A single way that takes every side of the card is everything the card has to give, and asks
   * nothing: every one-sided Encounter is resolved on the spot, and so are the Ours, the Démon and
   * the Dragon of a player who meets both of their conditions. A single way that leaves a side behind
   * is still a button, and it is worth the click it costs — it is where the player reads that they
   * only satisfy half of the card and are only paid half of it.
   */
  onRuleStart(): GreyluneMove[] {
    const ways = this.encounterMoves(this.card)
    if (ways.length === 1 && ways[0].outcomes.length === encounterCardData[this.front(this.card)].outcomes.length) return this.resolve(ways[0])
    return []
  }

  /**
   * The Diamant, named by a player who can only pay its Force with Kael: the window opened as it was
   * named reads this, and while it holds it cannot be passed and only Kael is offered in it.
   */
  get outOfReach(): boolean {
    return this.encounterMoves(this.card).length === 0
  }

  helps(card: number, option: number): boolean {
    return this.reactionEffect(card, option).type === ReactionType.ReduceForceCost
  }

  getPlayerMoves(): GreyluneMove[] {
    return this.encounterMoves(this.card).map((data) => this.customMove(CustomMoveType.ResolveOutcome, data))
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.ResolveOutcome)(move)) return this.resolve(move.data as ResolveOutcomeData)
    return super.onCustomMove(move)
  }
}
