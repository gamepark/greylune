import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { TriggerType } from '../material/Reaction'
import { ActivateCardRule } from './ActivateCardRule'
import { CustomMoveType } from './CustomMoveType'
import { EventRule } from './EventRule'
import { GreyluneMove, GreyluneRule, ReactionChoice } from './GreyluneRule'
import { RuleId } from './RuleId'
import { TellStoryRule } from './TellStoryRule'

/**
 * The window a Companion or a Potion steps into.
 *
 * It stays open while there is anything left to answer with — a player may tilt two Companions on
 * the same journey — and it closes on its own the moment there is nothing, so nobody is ever asked
 * to pass on an empty hand.
 *
 * Three windows cannot be passed: the one opened on a card offered to a player who can only pay for it
 * with a Companion (see {@link ActivateCardRule}), the one opened on an Event that only Kael can pay
 * for (see {@link EventRule}), and the one opened on a story that only Seren or a
 * Charisma potion can make heard (see {@link TellStoryRule}). There, answering is the only way on,
 * and only the answers that bring the card or the story within reach are offered.
 */
export class ReactionRule extends GreyluneRule {
  /**
   * What the window was opened on, and what has been tilted since. The crowd around a card being
   * activated is only answered while it still costs something: once Neris has waved it away, a Neris
   * stood back up by Isandre would have nothing left to answer.
   */
  get triggers(): TriggerType[] {
    const triggers = this.remind<TriggerType[]>(Memory.Trigger) ?? []
    return this.activation?.surcharge === 0 ? triggers.filter((trigger) => trigger !== TriggerType.PaySurcharge) : triggers
  }

  get resumeRule(): RuleId {
    return this.remind<RuleId>(Memory.Resume) ?? RuleId.ResolveEffects
  }

  /** The card being activated, when the window was opened on one. */
  get activation(): ActivateCardRule | undefined {
    return this.resumeRule === RuleId.ActivateCard ? new ActivateCardRule(this.game) : undefined
  }

  /** The card being activated, the Event being joined or the story about to be told, when nothing can go on without an answer. */
  get blocked(): ActivateCardRule | EventRule | TellStoryRule | undefined {
    const next = this.resumeRule === RuleId.TellStory ? new TellStoryRule(this.game) : this.resumeRule === RuleId.Event ? new EventRule(this.game) : this.activation
    return next?.outOfReach ? next : undefined
  }

  get choices(): ReactionChoice[] {
    const blocked = this.blocked
    return this.reactionChoices(this.triggers).filter((choice) => !blocked || blocked.helps(choice.card, choice.option))
  }

  getPlayerMoves(): GreyluneMove[] {
    return [
      ...this.choices.map((choice) => this.customMove(CustomMoveType.UseReaction, choice)),
      ...(this.blocked ? [] : [this.customMove(CustomMoveType.Pass)])
    ]
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.Pass)(move)) return this.close()
    if (!isCustomMoveType(CustomMoveType.UseReaction)(move)) return super.onCustomMove(move)
    const { card, option } = move.data as { card: number; option: number }
    const moves = this.useReaction(card, option)
    // The card just spent is gone from the window, though the move that puts it down is not played yet.
    const left = this.choices.filter((choice) => choice.card !== card)
    return left.length ? moves : [...moves, ...this.close()]
  }

  private close(): GreyluneMove[] {
    return [this.startRule(this.resumeRule)]
  }
}
