import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Requirement, RequirementType } from '../material/Effect'
import { EncounterCardId, encounterCardData } from '../material/EncounterCard'
import { eventTileData } from '../material/EventTile'
import { questRequirements } from '../material/QuestTile'
import { ReactionType, TriggerType } from '../material/Reaction'
import { villageCardData } from '../material/VillageCard'
import { ActivateCardRule } from './ActivateCardRule'
import { ChooseOutcomeRule } from './ChooseOutcomeRule'
import { CustomMoveType } from './CustomMoveType'
import { EventRule } from './EventRule'
import { ResolveQuestRule } from './ResolveQuestRule'
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
 * Five windows cannot be passed: the one opened on a card offered to a player who can only pay for it
 * with a Companion (see {@link ActivateCardRule}), the ones opened on an Event, a Quest or the Diamant
 * that only Kael can pay for (see {@link EventRule}, {@link ResolveQuestRule} and {@link ChooseOutcomeRule}), and the one opened on a story that only Seren or a
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

  /** The card being activated, the Event being joined, the Quest being achieved or the story about to be told, when nothing can go on without an answer. */
  get blocked(): ActivateCardRule | EventRule | ResolveQuestRule | ChooseOutcomeRule | TellStoryRule | undefined {
    const next = this.pendingRule
    return next?.outOfReach ? next : undefined
  }

  private get pendingRule(): ActivateCardRule | EventRule | ResolveQuestRule | ChooseOutcomeRule | TellStoryRule | undefined {
    switch (this.resumeRule) {
      case RuleId.TellStory:
        return new TellStoryRule(this.game)
      case RuleId.Event:
        return new EventRule(this.game)
      case RuleId.ResolveQuest:
        return new ResolveQuestRule(this.game)
      case RuleId.ChooseOutcome:
        return new ChooseOutcomeRule(this.game)
      default:
        return this.activation
    }
  }

  get choices(): ReactionChoice[] {
    const blocked = this.blocked
    return this.reactionChoices(this.triggers).filter(
      (choice) => this.lowersPrice(choice) && (!blocked || blocked.helps(choice.card, choice.option))
    )
  }

  /**
   * Kael and Bran are only offered while the price still asks for more than they have already taken
   * off it. Stood back up by Isandre, they may take off a second Force or a second Villager, which is
   * only ever worth it on a price of 2: Snowmane and the Horn, for Bran.
   */
  private lowersPrice({ card, option }: ReactionChoice): boolean {
    switch (this.reactionEffect(card, option).type) {
      case ReactionType.ReduceForceCost:
        return (this.costReduction.force ?? 0) < this.mostAsked(RequirementType.SpendForce)
      case ReactionType.ReduceVillagerCost:
        return (this.costReduction.villagers ?? 0) < this.mostAsked(RequirementType.SpendVillagers)
      default:
        return true
    }
  }

  /** The most of a kind any of the prices the window was opened on asks for, or no limit when it was opened on none. */
  private mostAsked(type: RequirementType): number {
    const prices = this.prices
    if (!prices) return Infinity
    return Math.max(0, ...prices.map((price) => price.filter((requirement) => requirement.type === type).reduce((total, requirement) => total + (requirement.count ?? 1), 0)))
  }

  /**
   * What the action waiting on the window may be paid with, one entry per option still open: every
   * option of a Building or of the Event, since none is chosen yet, the option of the Object already
   * named, the Quest, and both sides of the Encounter together, which is the most it can ask.
   */
  private get prices(): Requirement[][] | undefined {
    switch (this.resumeRule) {
      case RuleId.ActivateCard:
        return (this.activation!.data.abilities ?? []).map((ability) => ability.requirements ?? [])
      case RuleId.UseItem: {
        const card = this.remind<number>(Memory.ActivatedCard)
        return [villageCardData[this.playerCard(card)].abilities![this.remind<number>(Memory.Ability)].requirements ?? []]
      }
      case RuleId.Event:
        return this.eventTile === undefined ? [] : eventTileData[this.eventTile].abilities.map((ability) => ability.requirements ?? [])
      case RuleId.ResolveQuest:
        return [questRequirements[new ResolveQuestRule(this.game).tile]]
      case RuleId.ChooseOutcome: {
        const card = this.encounterCards.getItem<EncounterCardId>(new ChooseOutcomeRule(this.game).card)
        return [encounterCardData[card.id.front!].outcomes.flatMap((outcome) => outcome.requirements ?? [])]
      }
      default:
        return undefined
    }
  }

  getPlayerMoves(): GreyluneMove[] {
    return [
      ...this.choices.map((choice) => this.customMove(CustomMoveType.UseReaction, choice)),
      ...(this.blocked ? [] : [this.customMove(CustomMoveType.Pass)])
    ]
  }

  /**
   * What is left to answer with is read once the answer has been played out, and not before: the
   * card just spent only goes down with the moves it returns, and the card Isandre stands back up
   * only comes back with them — it may then answer the same moment again.
   */
  onRuleStart(): GreyluneMove[] {
    return this.choices.length ? [] : this.close()
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.Pass)(move)) return this.close()
    if (!isCustomMoveType(CustomMoveType.UseReaction)(move)) return super.onCustomMove(move)
    const { card, option } = move.data as { card: number; option: number }
    return [...this.useReaction(card, option), this.startRule(RuleId.Reaction)]
  }

  private close(): GreyluneMove[] {
    return [this.startRule(this.resumeRule)]
  }
}
