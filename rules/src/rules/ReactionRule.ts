import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { TriggerType } from '../material/Reaction'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * The window a Companion or a Potion steps into.
 *
 * It stays open while there is anything left to answer with — a player may tilt two Companions on
 * the same journey — and it closes on its own the moment there is nothing, so nobody is ever asked
 * to pass on an empty hand.
 */
export class ReactionRule extends GreyluneRule {
  get triggers(): TriggerType[] {
    return this.remind<TriggerType[]>(Memory.Trigger) ?? []
  }

  getPlayerMoves(): GreyluneMove[] {
    return [
      ...this.reactionChoices(this.triggers).map((choice) => this.customMove(CustomMoveType.UseReaction, choice)),
      this.customMove(CustomMoveType.Pass)
    ]
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.Pass)(move)) return this.close()
    if (!isCustomMoveType(CustomMoveType.UseReaction)(move)) return super.onCustomMove(move)
    const { card, option } = move.data as { card: number; option: number }
    const moves = this.useReaction(card, option)
    // The card just spent is gone from the window, though the move that puts it down is not played yet.
    const left = this.reactionChoices(this.triggers).filter((choice) => choice.card !== card)
    return left.length ? moves : [...moves, ...this.close()]
  }

  private close(): GreyluneMove[] {
    return [this.startRule(this.remind<RuleId>(Memory.Resume) ?? RuleId.ResolveEffects)]
  }
}
