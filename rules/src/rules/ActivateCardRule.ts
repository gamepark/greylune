import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Effect, Requirement, RequirementType, usesSeal, vp } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { itemLimit, playerItems } from '../material/PlayerState'
import { ReactionType, TriggerType } from '../material/Reaction'
import { Seal } from '../material/Tokens'
import { villagersAroundSlot } from '../material/Village'
import {
  activationTriggers,
  getVillageCardType,
  PermanentType,
  VillageCard,
  VillageCardId,
  VillageCardType,
  villageCardData
} from '../material/VillageCard'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/** Which option of the card, which Seal it spends, and at what value when Selia names it. */
export type ChooseAbilityData = { ability: number; seal?: number; value?: number }

/** The option index a purchase or a recruitment is filed under: a card bought offers no choice. */
const BUY = -1

/**
 * A Villager standing in the Village has designated a card, and the price is settled here: the card
 * itself, plus a coin for every other Villager around it (rulebook p.8).
 *
 * The Companions that can lower that price answer inside this rule rather than before it. A card is
 * offered to a player who could only pay for it with Neris or Dorian, so the answer has to still be
 * available when the price is actually due — and while nothing is affordable, only the answers that
 * help are offered, so the choice can never leave the player stranded.
 */
export class ActivateCardRule extends GreyluneRule {
  get card(): number {
    return this.remind<number>(Memory.ActivatedCard)
  }

  get front(): VillageCard {
    return this.villageCards.getItem<VillageCardId>(this.card).id.front!
  }

  get data() {
    return villageCardData[this.front]
  }

  get villager(): number {
    return this.remind<number>(Memory.SpentVillager)
  }

  get seals() {
    return this.material(MaterialType.Seal).location(LocationType.CardSeal).parent(this.card)
  }

  /** A coin for every other Villager standing around the card, whoever they belong to. */
  get crowd(): number {
    const location = this.villageCards.getItem(this.card).location
    return Math.max(0, villagersAroundSlot(this, { x: location.x ?? 0, y: location.y ?? 0 }).length - 1)
  }

  /** What the card costs to take, once the crowd is paid for and the answers already given count. */
  get price(): number {
    const reduction = this.costReduction
    return Math.max(0, this.data.cost - (reduction.coins ?? 0) + (reduction.noSurcharge ? 0 : this.crowd))
  }

  get triggers(): TriggerType[] {
    return activationTriggers(this.front)
  }

  /** Nothing to choose and nobody to answer with: the card is taken without a click. */
  onRuleStart(): GreyluneMove[] {
    const moves = this.abilityMoves()
    return moves.length === 1 && !this.reactionChoices(this.triggers).length ? moves : []
  }

  getPlayerMoves(): GreyluneMove[] {
    const moves = this.abilityMoves()
    return [...moves, ...this.reactionMoves(moves.length === 0)]
  }

  /** Every way this card can be taken: the purchase, or one of the options a Building offers. */
  private abilityMoves(): GreyluneMove[] {
    if (this.coins < this.price) return []
    if (getVillageCardType(this.front) !== VillageCardType.Building) {
      return this.sealVariants(this.data.immediate).map((variant) => this.customMove(CustomMoveType.ChooseAbility, { ability: BUY, ...variant }))
    }
    return (this.data.abilities ?? []).flatMap((ability, index) =>
      this.canPay(ability.requirements)
        ? this.sealVariants(ability).map((variant) => this.customMove(CustomMoveType.ChooseAbility, { ability: index, ...variant }))
        : []
    )
  }

  /**
   * The Seals the option could be paid with. A Seal is spent at the value printed on it, unless
   * Selia has been tilted, and then the player names it.
   */
  private sealVariants(ability?: Effect): { seal?: number; value?: number }[] {
    if (!ability || !usesSeal(ability.requirements)) return [{}]
    const needsCoins = (ability.requirements ?? []).some((requirement) => requirement.type === RequirementType.SealCoins)
    const free = this.costReduction.freeSealValue === true
    const variants: { seal?: number; value?: number }[] = []
    const seen = new Set<number>()
    for (const seal of this.seals.getIndexes()) {
      const printed = this.material(MaterialType.Seal).getItem(seal).id as Seal
      for (const value of free ? [Seal.One, Seal.Two, Seal.Three] : [printed]) {
        if (needsCoins && this.coins - this.price < value) continue
        // One Seal of each value is as good as another: the player picks a value, not a token.
        const key = free ? value : printed * 10 + value
        if (seen.has(key)) continue
        seen.add(key)
        variants.push({ seal, value })
      }
    }
    return variants
  }

  /** While nothing can be paid for, only the answers that find coins are worth offering. */
  private reactionMoves(onlyHelpful: boolean): GreyluneMove[] {
    return this.reactionChoices(this.triggers)
      .filter((choice) => !onlyHelpful || this.helps(choice.card, choice.option))
      .map((choice) => this.customMove(CustomMoveType.UseReaction, choice))
  }

  /**
   * Whether an answer would take the player any closer to paying. Only those are offered while
   * nothing is affordable, so that a window opened on a price out of reach always closes on one
   * within it: each of them lowers a cost that is actually standing in the way, and each of them
   * puts a card down, so the choice can never go round in circles.
   */
  private helps(card: number, option: number): boolean {
    const effect = this.reactionEffect(card, option)
    switch (effect.type) {
      case ReactionType.ExtraCoins:
      case ReactionType.NoSurcharge:
      case ReactionType.CheaperItem:
        return this.coins < this.price && option === this.bestCoinOption(card)
      case ReactionType.ReduceForceCost:
        return this.blockedBy(RequirementType.SpendForce)
      case ReactionType.ReduceVillagerCost:
        return this.blockedBy(RequirementType.SpendVillagers)
      case ReactionType.ChooseSealValue:
        // Selia is what makes a Seal worth what the player can afford rather than what it says.
        return (this.data.abilities ?? []).some((ability) => usesSeal(ability.requirements) && !this.sealVariants(ability).length)
      default:
        return false
    }
  }

  /**
   * The coins an answer would find, and which of a card's answers finds the most. Only that one is
   * offered while the price is out of reach: the rule that offered the card in the first place
   * counted on the best each Companion could do, so anything less could leave the player short.
   */
  private coinRelief(card: number, option: number): number {
    const effect = this.reactionEffect(card, option)
    switch (effect.type) {
      case ReactionType.ExtraCoins:
        return effect.count
      case ReactionType.NoSurcharge:
        return this.costReduction.noSurcharge ? 0 : this.crowd
      case ReactionType.CheaperItem:
        return getVillageCardType(this.front) === VillageCardType.Item ? 1 : 0
      default:
        return 0
    }
  }

  private bestCoinOption(card: number): number {
    const options = villageCardData[this.playerCard(card)].reaction!.options
    return options.reduce((best, _, option) => (this.coinRelief(card, option) > this.coinRelief(card, best) ? option : best), 0)
  }

  /** An option the player cannot pay for, and that asks for exactly that. */
  private blockedBy(type: RequirementType): boolean {
    return (this.data.abilities ?? []).some(
      (ability) => !this.canPay(ability.requirements) && (ability.requirements ?? []).some((requirement) => requirement.type === type)
    )
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.UseReaction)(move)) {
      const { card, option } = move.data as { card: number; option: number }
      return this.useReaction(card, option)
    }
    if (isCustomMoveType(CustomMoveType.ChooseAbility)(move)) return this.activate(move.data as ChooseAbilityData)
    return super.onCustomMove(move)
  }

  /**
   * The price of the card and what its own ability asks for are added up and paid in one go: two
   * payments settled in the same breath would each be counted against the same purse.
   */
  private activate(data: ChooseAbilityData): GreyluneMove[] {
    if (data.value !== undefined) this.memorize(Memory.SealValue, data.value)
    const requirements = data.ability === BUY ? [] : (this.data.abilities![data.ability].requirements ?? [])
    const moves: GreyluneMove[] = [
      ...this.payCoins(this.price + this.coinCost(requirements)),
      this.villagers.index(this.villager).moveItem({ type: LocationType.Camp }),
      ...(data.seal !== undefined ? [this.material(MaterialType.Seal).index(data.seal).deleteItem()] : [])
    ]
    return data.ability === BUY ? [...moves, ...this.take()] : [...moves, ...this.exploit(data.ability, requirements)]
  }

  /** A Building stays where it is: it is only ever borrowed, and the next Villager may use it too. */
  private exploit(ability: number, requirements: Requirement[]): GreyluneMove[] {
    this.pushGains(this.data.abilities![ability].gains ?? [])
    return [...this.payRequirements(requirements.filter((requirement) => !isCoinCost(requirement))), ...this.endOfAction()]
  }

  /**
   * An Object is bought and a Companion recruited: the card leaves the Village for the player's own
   * area, and what it gives on arrival is queued. An Object over the limit is given up right after,
   * the one just bought included, once its points have been counted (rulebook p.8).
   */
  private take(): GreyluneMove[] {
    const isItem = getVillageCardType(this.front) === VillageCardType.Item
    const gains = [...(this.data.immediate?.gains ?? [])]
    if (isItem && this.costReduction.itemVp) gains.push(vp(this.costReduction.itemVp))
    this.pushGains(gains)
    const moves: GreyluneMove[] = [
      ...this.payRequirements(this.data.immediate?.requirements),
      this.villageCards.index(this.card).moveItem({
        type: isItem ? LocationType.Items : LocationType.Companions,
        player: this.player,
        rotation: false
      })
    ]
    if (isItem && playerItems(this, this.player).length + 1 > this.limitWithNewCard()) {
      this.memorize(Memory.Resume, RuleId.ResolveEffects)
      return [...moves, this.startRule(RuleId.DiscardItem)]
    }
    return [...moves, ...this.endOfAction()]
  }

  /** The Bag of holding raises the limit even for the purchase that brings it in (rulebook p.17). */
  private limitWithNewCard(): number {
    const permanent = this.data.permanent
    return itemLimit(this, this.player) + (permanent?.type === PermanentType.ItemLimit ? (permanent.count ?? 1) : 0)
  }
}

/** What is settled in coins, and is therefore added to the price rather than paid on its own. */
const isCoinCost = (requirement: Requirement): boolean =>
  requirement.type === RequirementType.SpendCoins || requirement.type === RequirementType.SealCoins
