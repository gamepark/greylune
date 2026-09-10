import { Memory } from '../Memory'
import { Gain, GainType } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { MAX_SKILL } from '../Constants'
import { TriggerType } from '../material/Reaction'
import { villageGaps } from '../material/Village'
import { cardsAroundGap } from '../material/Village'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * The queue of everything the action still owes the player.
 *
 * It takes one gain at a time and either hands it over — as a custom move, so that the next one is
 * counted against the state this one leaves — or starts the rule that asks the player what to do
 * with it. A gain that can give nothing at all is dropped where it stands: a Villager with an empty
 * reserve, a card to straighten with none tilted, a Bonus token with none left.
 *
 * When there is nothing left, the action is over and the turn passes.
 */
export class ResolveEffectsRule extends GreyluneRule {
  onRuleStart(): GreyluneMove[] {
    let gains = this.gains
    while (gains.length) {
      const [gain, ...rest] = gains
      this.memorize(Memory.Gains, rest)
      const moves = this.startGain(gain)
      if (moves.length) return moves
      gains = rest
    }
    const journey = this.travelDone()
    return journey.length ? journey : this.endOfTurn()
  }

  /**
   * The cards that answer a journey, offered once the road is behind and everything it paid has been
   * handed over: what Mira and the Potion d'endurance put back in the Village may be a Villager the
   * Encounter has just given (see {@link TriggerType.TravelDone}). The journey is forgotten first, so
   * that the Villager they queue is resolved by a pass that no longer opens the window.
   */
  private travelDone(): GreyluneMove[] {
    if (!this.remind<boolean>(Memory.WentAdventuring)) return []
    this.forget(Memory.WentAdventuring)
    if (!this.reactionChoices([TriggerType.TravelDone]).length) return []
    return this.openReactions([TriggerType.TravelDone], RuleId.ResolveEffects)
  }

  private startGain(gain: Gain): GreyluneMove[] {
    const move = this.gainMove(gain)
    if (move) return [move]
    switch (gain.type) {
      case GainType.Skill:
        if (this.force >= MAX_SKILL && this.magic >= MAX_SKILL) return []
        this.memorize(Memory.CurrentGain, gain)
        return [this.startRule(RuleId.ChooseSkill)]
      case GainType.Travel:
        this.memorize(Memory.TravelLeft, this.amount(gain.count))
        this.memorize(Memory.WentAdventuring, true)
        return this.openReactions([TriggerType.Travel], RuleId.Travel)
      case GainType.Straighten:
        return this.tiltedCards.length ? [this.startRule(RuleId.StraightenCard)] : []
      case GainType.PlaceVillager:
        return this.canPlaceVillager ? [this.startRule(RuleId.PlaceVillager)] : []
      case GainType.TellStory:
        this.memorize(Memory.StoryRewards, gain.rewards)
        this.memorize(Memory.StoryTold, [])
        return this.openReactions([TriggerType.TellStory], RuleId.TellStory)
      case GainType.BonusToken:
        return this.bonusTokens.length ? [this.startRule(RuleId.BonusToken)] : []
      case GainType.Reaction:
        return this.openReactions([gain.trigger], RuleId.ResolveEffects)
      default:
        // {@link GainType.IncomeToken} never reaches the queue: the token is a piece lying on the
        // Encounter card, and the rule that resolves the card lifts it off before the card is slid
        // away, queueing what it pays in its stead (see `ResolveEncounterRule`).
        return []
    }
  }

  get tiltedCards() {
    return this.playerCards.rotation(true)
  }

  get bonusTokens() {
    return this.material(MaterialType.BonusToken).location(LocationType.BonusTokens).player(this.player)
  }

  /** A Villager can only be put back in the Village if there is one to place and a card to stand by. */
  get canPlaceVillager(): boolean {
    return this.activeVillagers.length > 0 && villageGaps.some((gap) => cardsAroundGap(this, gap).length > 0)
  }

  getPlayerMoves(): GreyluneMove[] {
    return []
  }
}
