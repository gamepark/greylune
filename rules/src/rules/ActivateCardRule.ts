import { CustomMove, isCustomMoveType, isMoveItemType, ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Requirement, RequirementType, usesSeal, vp } from '../material/Effect'
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

/**
 * Which option of the card, and what is left to say about its Seal: the one an Object is bought with,
 * or the value Selia lets the player name for the one a Building has just spent.
 */
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
 *
 * A Building that works off a Seal is exploited by taking one of its Seals and discarding it (rulebook
 * p.8), so that is the move: the token goes from the card to the discard, and the rest follows. Selia
 * answers that move and not the choice before it — her card reads "when you activate a Seal token" —
 * so her window opens once the token is gone, and the activation comes back here to finish.
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

  /** What may be answered before an option is chosen. A Seal is only answered once it is spent. */
  get triggers(): TriggerType[] {
    return activationTriggers(this.front).filter((trigger) => trigger !== TriggerType.ActivateSeal)
  }

  get isBuilding(): boolean {
    return getVillageCardType(this.front) === VillageCardType.Building
  }

  /**
   * The option of a Building that is paid with a Seal, or -1. A Building that carries Seals offers
   * that one option and no other, which is why taking a Seal is enough to say which option is taken.
   */
  get sealAbility(): number {
    return this.isBuilding ? (this.data.abilities ?? []).findIndex((ability) => usesSeal(ability.requirements)) : -1
  }

  /** The Seal of the Building has left the card: the activation is past choosing, and is finishing. */
  get sealSpent(): boolean {
    return this.remind<number>(Memory.SealValue) !== undefined
  }

  /**
   * Back from Selia's window, or with nothing to choose and nobody to answer with: the activation goes
   * on without a click.
   */
  onRuleStart(): GreyluneMove[] {
    if (this.sealSpent) return this.costReduction.freeSealValue ? this.onlyValue() : this.activate({ ability: this.sealAbility })
    const moves = this.abilityMoves()
    return moves.length === 1 && !this.reactionChoices(this.triggers).length ? moves : []
  }

  getPlayerMoves(): GreyluneMove[] {
    if (this.sealSpent) return this.costReduction.freeSealValue ? this.sealValueMoves() : []
    const moves = this.abilityMoves()
    return [...moves, ...this.reactionMoves(moves.length === 0)]
  }

  /** Every way this card can be taken: the purchase, or one of the options a Building offers. */
  private abilityMoves(): GreyluneMove[] {
    if (this.coins < this.price) return []
    if (!this.isBuilding) {
      return this.purchaseVariants().map((variant) => this.customMove(CustomMoveType.ChooseAbility, { ability: BUY, ...variant }))
    }
    return (this.data.abilities ?? []).flatMap((ability, index) => {
      if (!this.canPay(ability.requirements)) return []
      if (index === this.sealAbility) return this.sealMoves()
      return [this.customMove(CustomMoveType.ChooseAbility, { ability: index })]
    })
  }

  /**
   * The Seals the Building can be exploited with: the ones the player can pay for at the value printed
   * on them, and every one of them when Selia is there to name a value they can pay.
   */
  private sealMoves(): GreyluneMove[] {
    const selia = this.reactionChoices([TriggerType.ActivateSeal]).length > 0 && this.canPaySealAt(Seal.One)
    return this.seals
      .filter((item) => selia || this.canPaySealAt(item.id as Seal))
      .moveItems({ type: LocationType.SealDiscard })
  }

  /** Whether the option of the Building is still within reach with its Seal spent at that value. */
  private canPaySealAt(value: Seal): boolean {
    const requirements = this.data.abilities?.[this.sealAbility]?.requirements ?? []
    const needsCoins = requirements.some((requirement) => requirement.type === RequirementType.SealCoins)
    return !needsCoins || this.coins - this.price >= value
  }

  /** Selia has been tilted: the player names the value the Seal is spent at, among those they can pay. */
  private sealValueMoves(): GreyluneMove[] {
    return [Seal.One, Seal.Two, Seal.Three]
      .filter((value) => this.canPaySealAt(value))
      .map((value) => this.customMove(CustomMoveType.ChooseAbility, { ability: this.sealAbility, value }))
  }

  /** A value is only named for the player when it is the only one they can pay. */
  private onlyValue(): GreyluneMove[] {
    const moves = this.sealValueMoves()
    return moves.length === 1 ? moves : []
  }

  /** An Object is dealt a single Seal and it goes with the Object, spent at the value printed on it. */
  private purchaseVariants(): { seal?: number; value?: number }[] {
    if (!usesSeal(this.data.immediate?.requirements)) return [{}]
    return this.seals
      .limit(1)
      .getIndexes()
      .map((seal) => ({ seal, value: this.material(MaterialType.Seal).getItem<Seal>(seal).id }))
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
   * The Seal of a Building has just been taken off it: it is spent at the value printed on it, unless
   * Selia steps in. When that value is more than the player can pay, the Seal could only have been
   * offered because of her (see {@link sealMoves}), so she is tilted without asking.
   */
  afterItemMove(move: ItemMove): GreyluneMove[] {
    if (!isMoveItemType(MaterialType.Seal)(move) || move.location.type !== LocationType.SealDiscard || !this.isBuilding) return []
    const value = this.material(MaterialType.Seal).getItem<Seal>(move.itemIndex).id
    this.memorize(Memory.SealValue, value)
    const selia = this.reactionChoices([TriggerType.ActivateSeal])
    if (!this.canPaySealAt(value)) return [...this.useReaction(selia[0].card, selia[0].option), ...this.onlyValue()]
    if (!selia.length) return this.activate({ ability: this.sealAbility })
    return this.openReactions([TriggerType.ActivateSeal], RuleId.ActivateCard)
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
      ...(data.seal !== undefined ? [this.material(MaterialType.Seal).index(data.seal).moveItem({ type: LocationType.SealDiscard })] : [])
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
