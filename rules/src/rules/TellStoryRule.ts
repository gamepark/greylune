import { CustomMove, isCustomMoveType, isMoveItemType, ItemMove } from '@gamepark/rules-api'
import { MAX_STORY_VALUE } from '../Constants'
import { Memory } from '../Memory'
import { Gain, readsSeal } from '../material/Effect'
import { EncounterCardId, encounterCardData } from '../material/EncounterCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { ReactionType, TriggerType } from '../material/Reaction'
import { Seal } from '../material/Tokens'
import { ChooseAbilityData } from './ActivateCardRule'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * A Tavern is open, or the special action of the personal board has been taken (rulebook p.12).
 *
 * The player slides Encounters over to the told stories one at a time, and the Tavern pays by tiers:
 * the first bonus for a story worth 1, the first two for 2, all of them for 3. A story is never
 * worth more than 3, which is why a card worth nothing cannot be told at all, unless Seren or a
 * Charisma potion makes it a 3.
 *
 * The Lion d'or and the Loup gris pay one of their tiers with what a Seal is worth. That Seal is no
 * price for opening them: it is only picked, and discarded, once the story has ended on that tier or
 * past it. A Tavern with no Seal left still hears stories, and that tier then pays nothing for it.
 * Selia answers the Seal as she does on any other card, once it has left the Tavern.
 */
export class TellStoryRule extends GreyluneRule {
  get rewards(): Gain[][] {
    return this.remind<Gain[][]>(Memory.StoryRewards) ?? []
  }

  /** What each Encounter of the story is worth, in the order they were told, a boosted one as a 3. */
  get told(): number[] {
    return this.remind<number[]>(Memory.StoryTold) ?? []
  }

  /** What the Tavern pays on: the sum of the Encounters told, and never more than 3. */
  get value(): number {
    return Math.min(
      MAX_STORY_VALUE,
      this.told.reduce((total, value) => total + value, 0)
    )
  }

  get boosts(): number {
    return this.remind<number>(Memory.StoryBoost) ?? 0
  }

  /** The tier paid with what the Seal is worth, or -1: the special action and most Taverns have none. */
  get sealTier(): number {
    return this.rewards.findIndex((tier) => tier.some(readsSeal))
  }

  /** The Seals still lying on the Tavern being listened to. */
  get seals() {
    return this.material(MaterialType.Seal).location(LocationType.CardSeal).parent(this.remind<number>(Memory.ActivatedCard))
  }

  get over(): boolean {
    return !!this.remind<boolean>(Memory.StoryOver)
  }

  /** The Seal has left the Tavern: all that is left is to name its value, if Selia is there for it. */
  get sealSpent(): boolean {
    return this.remind<number>(Memory.SealValue) !== undefined
  }

  get untold() {
    return this.encounterCards.location(LocationType.UntoldStories).player(this.player)
  }

  storyValue(card: number): number {
    return encounterCardData[this.encounterCards.getItem<EncounterCardId>(card).id.front!].story
  }

  /**
   * What telling a card would add to the story. A boost is only ever spent on the Encounter that
   * opens one: it makes the card a 3, and a 3 added to anything overruns the maximum — the 2 + 2
   * of the exception below being the one overrun the rules allow, and it is not made of a 3.
   */
  addedValue(card: number): number {
    const printed = this.storyValue(card)
    return this.boosts > 0 && printed < MAX_STORY_VALUE && !this.told.length ? MAX_STORY_VALUE : printed
  }

  /**
   * A story is worth 3 at most, so an Encounter is only heard if it fits under that — with the one
   * exception the rulebook prints (p.12): 2 Encounters worth 2 each are told together, and the 4
   * they add up to counts as a 3. Hence 1 + 1 + 1 and 2 + 2, but never 1 + 1 + 2.
   *
   * A card worth nothing is never heard, unless a boost is there to make it a 3.
   */
  fits(card: number): boolean {
    const added = this.addedValue(card)
    if (added === 0) return false
    if (added === 2 && this.told.length === 1 && this.told[0] === 2) return true
    return this.value + added <= MAX_STORY_VALUE
  }

  get tellable() {
    return this.untold.index((index) => this.fits(index))
  }

  /**
   * A story is only ended once something has been told: the Tavern and the special action are only
   * offered to a player with a story to tell (see `GreyluneRule.hasStoryToTell`), and ending it at 0
   * would spend the Villager on nothing.
   */
  getPlayerMoves(): GreyluneMove[] {
    if (this.sealSpent) return this.costReduction.freeSealValue ? this.sealValueMoves() : []
    if (this.over) return this.seals.moveItems({ type: LocationType.SealDiscard })
    const moves: GreyluneMove[] = this.tellable.moveItems({ type: LocationType.ToldStories, player: this.player })
    if (this.told.length) moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  /**
   * Nothing the player holds can be heard yet: their stories are all worth nothing, and only Seren or
   * a Charisma potion can open one. The window opened before the story then cannot be passed, and
   * offers those answers only (see `ReactionRule`).
   */
  get outOfReach(): boolean {
    return !this.told.length && !this.tellable.length
  }

  helps(card: number, option: number): boolean {
    return this.reactionEffect(card, option).type === ReactionType.StoryValue3
  }

  /** Back from Selia's window: the story is paid, unless she was tilted and a value is to be named. */
  onRuleStart(): GreyluneMove[] {
    if (this.sealSpent && !this.costReduction.freeSealValue) return this.pay()
    return []
  }

  /** Selia has been tilted: any value can be named, the Seal costing nothing here. */
  private sealValueMoves(): GreyluneMove[] {
    return [Seal.One, Seal.Two, Seal.Three].map((value) => this.customMove(CustomMoveType.ChooseAbility, { value }))
  }

  /**
   * A card told for nothing is told as a 3: that is what the boost was spent on. A Seal taken off the
   * Tavern is spent at its printed value, and Selia may be tilted to name another.
   */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (isMoveItemType(MaterialType.Seal)(move) && move.location.type === LocationType.SealDiscard) {
      this.memorize(Memory.SealValue, this.material(MaterialType.Seal).getItem<Seal>(move.itemIndex).id)
      return this.openReactions([TriggerType.ActivateSeal], RuleId.TellStory)
    }
    if (move.itemType !== MaterialType.EncounterCard || !('itemIndex' in move)) return []
    const added = this.addedValue(move.itemIndex)
    if (added > this.storyValue(move.itemIndex)) this.memorize(Memory.StoryBoost, this.boosts - 1)
    this.memorize(Memory.StoryTold, [...this.told, added])
    return []
  }

  /**
   * Ending the story. When it reaches the tier paid off a Seal and the Tavern still has one, that Seal
   * is picked first — for the player when all of those left are worth the same.
   */
  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.ChooseAbility)(move)) {
      this.memorize(Memory.SealValue, (move.data as ChooseAbilityData).value)
      return this.pay()
    }
    if (!isCustomMoveType(CustomMoveType.Pass)(move)) return super.onCustomMove(move)
    if (this.sealTier < 0 || this.value <= this.sealTier || !this.seals.length) return this.pay()
    this.memorize(Memory.StoryOver, true)
    const values = new Set(this.seals.getItems().map((item) => item.id))
    return values.size === 1 ? [this.seals.limit(1).moveItem({ type: LocationType.SealDiscard })] : []
  }

  /** The tiers reached are paid. Without a Seal spent, the one paid off a Seal gives nothing for it. */
  private pay(): GreyluneMove[] {
    const gains = this.rewards.slice(0, this.value).flat()
    this.pushGains(this.sealSpent ? gains : gains.filter((gain) => !readsSeal(gain)), true)
    return this.endOfAction()
  }
}
