import { CustomMove, isCustomMoveType, ItemMove } from '@gamepark/rules-api'
import { MAX_COMPANIONS } from '../Constants'
import { Memory } from '../Memory'
import { coins, force, Gain, magic, Requirement, RequirementType, tellStory, travel, usesSeal, vp } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { playerCompanions, villagersInVillage } from '../material/PlayerState'
import { ReactionType, TriggerType } from '../material/Reaction'
import { Seal } from '../material/Tokens'
import { cardsAroundGap, gapOf, Slot, villagersAroundSlot } from '../material/Village'
import { activationTriggers, getVillageCardType, VillageCardId, VillageCardType, villageCardData } from '../material/VillageCard'
import { Season } from '../Season'
import { CustomMoveType } from './CustomMoveType'
import { CostReduction, GreyluneMove } from './GreyluneRule'
import { RuleId } from './RuleId'
import { SeasonRule } from './SeasonRule'

/** What a move that takes a Villager out of the Village says: which Villager, and which card. */
export type VillagerActionData = { villager: number; card?: number }

/**
 * The 3 things the special space of the personal board can be spent on (rulebook p.9). The story it
 * hears pays by tiers like a Tavern.
 */
export const specialActions: Gain[][] = [[tellStory([coins(2)], [force()], [vp(2)])], [travel(1)], [magic()]]

/**
 * The turn of a player in Summer (rulebook p.7).
 *
 * Two of the six actions take a Villager out of the Village and name a card beside it: one sells the
 * company it was keeping for a coin apiece, the other activates the card itself. Both name two
 * things at once, which is why they are custom moves rather than the Villager simply walking to the
 * camp.
 */
export class SummerRule extends SeasonRule {
  getPlayerMoves(): GreyluneMove[] {
    return [
      ...this.villagerMoves(),
      ...this.eventMoves(LocationType.ActiveVillagers),
      ...this.eventMoves(LocationType.VillageGap),
      ...this.useItemMoves(),
      ...this.specialActionMoves(),
      ...(this.canReachAutumn ? this.changeSeasonMoves(Season.Autumn) : [])
    ]
  }

  // ------------------------------------------------------------------ the Villagers in the Village

  /** Every pair of one of the player's Villagers and a card standing next to it, plus the empty gaps. */
  private villagerMoves(): GreyluneMove[] {
    const moves: GreyluneMove[] = []
    for (const [villager, item] of villagersInVillage(this, this.player).entries) {
      const cards = cardsAroundGap(this, gapOf(item.location))
      // Both neighbours gone: the Villager is still taken back, and gains nothing (rulebook p.7).
      if (!cards.length) moves.push(this.customMove(CustomMoveType.GainCoinsAround, { villager }))
      for (const card of cards) {
        moves.push(this.customMove(CustomMoveType.GainCoinsAround, { villager, card }))
        if (this.canActivate(card)) moves.push(this.customMove(CustomMoveType.ActivateCard, { villager, card }))
      }
    }
    return moves
  }

  slotOf(card: number): Slot {
    const location = this.villageCards.getItem(card).location
    return { x: location.x ?? 0, y: location.y ?? 0 }
  }

  /** 1 coin for every other Villager standing around the card, whoever they belong to. */
  surcharge(card: number): number {
    return Math.max(0, villagersAroundSlot(this, this.slotOf(card)).length - 1)
  }

  /** The Seals still on a card, which is what limits how often a Building can be exploited. */
  seals(card: number) {
    return this.material(MaterialType.Seal).location(LocationType.CardSeal).parent(card)
  }

  private canActivate(card: number): boolean {
    const front = this.villageCards.getItem<VillageCardId>(card).id.front!
    const data = villageCardData[front]
    if (getVillageCardType(front) === VillageCardType.Companion && playerCompanions(this, this.player).length >= MAX_COMPANIONS) return false
    const price = data.cost + this.surcharge(card)
    if (this.coins + this.reliefFor(card) < price) return false
    // A Building is only worth activating if one of the options it offers can be paid for.
    if (getVillageCardType(front) !== VillageCardType.Building) return true
    const reduction = this.potentialReduction(activationTriggers(front))
    return (data.abilities ?? []).some((ability) => this.canUseAbility(card, ability.requirements, price, reduction))
  }

  /** An option of a Building, with the Seal it may need and the coins left once the card is paid. */
  canUseAbility(card: number, requirements: Requirement[] = [], price = 0, reduction: CostReduction = this.costReduction): boolean {
    if (!usesSeal(requirements)) return this.canPay(requirements, reduction)
    const values = this.seals(card).getItems().map((item) => item.id as Seal)
    if (!values.length) return false
    const needsCoins = requirements.some((requirement) => requirement.type === RequirementType.SealCoins)
    const cheapest = reduction.freeSealValue ? Seal.One : Math.min(...values)
    return (
      this.canPay(requirements.filter((requirement) => !usesSeal([requirement])), reduction) && (!needsCoins || this.coins - price >= cheapest)
    )
  }

  /**
   * The coins a reaction could still find for this purchase: Dorian knocks one off an Object, Neris
   * either hands over 2 or waves the crowd away. Counted before the choice is made, so that a card a
   * player can only afford with a Companion is still offered to them.
   */
  reliefFor(card: number): number {
    const front = this.villageCards.getItem<VillageCardId>(card).id.front!
    const isItem = getVillageCardType(front) === VillageCardType.Item
    const surcharge = this.surcharge(card)
    const helpers = new Set(this.reactionChoices([TriggerType.BuyItem, TriggerType.RemoveVillager]).map((choice) => choice.card))
    let relief = 0
    for (const helper of helpers) {
      let best = 0
      for (const option of villageCardData[this.playerCard(helper)].reaction!.options) {
        if (option.type === ReactionType.CheaperItem && isItem) best = Math.max(best, 1)
        if (option.type === ReactionType.ExtraCoins) best = Math.max(best, option.count)
        if (option.type === ReactionType.NoSurcharge) best = Math.max(best, surcharge)
      }
      relief += best
    }
    return relief
  }

  // ------------------------------------------------------------------ the cards of the player

  private useItemMoves(): GreyluneMove[] {
    return this.villageCards
      .location(LocationType.Items)
      .player(this.player)
      .rotation((rotation) => rotation !== true)
      .getIndexes()
      .flatMap((card) =>
        (villageCardData[this.playerCard(card)].abilities ?? []).flatMap((ability, index) =>
          this.canPay(ability.requirements) ? [this.customMove(CustomMoveType.UseItem, { card, ability: index })] : []
        )
      )
  }

  /** One Villager on the special space, once a year: the space is the player's, and it takes one. */
  private specialActionMoves(): GreyluneMove[] {
    if (this.villagers.location(LocationType.SpecialAction).player(this.player).length) return []
    const villagers = this.activeVillagers
    return specialActions.flatMap((_, option) => villagers.moveItems({ type: LocationType.SpecialAction, player: this.player, x: option }))
  }

  /** Autumn only takes a player who has nothing left standing in the Village (rulebook p.9). */
  get canReachAutumn(): boolean {
    return villagersInVillage(this, this.player).length === 0
  }

  // ------------------------------------------------------------------ playing

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (move.itemType === MaterialType.Villager && 'location' in move && move.location.type === LocationType.SpecialAction) {
      this.pushGains(specialActions[move.location.x ?? 0])
      return this.endOfAction()
    }
    return super.afterItemMove(move)
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.GainCoinsAround)(move)) return this.gainCoinsAround(move.data as VillagerActionData)
    if (isCustomMoveType(CustomMoveType.ActivateCard)(move)) return this.startActivation(move.data as VillagerActionData)
    if (isCustomMoveType(CustomMoveType.UseItem)(move)) return this.startUseItem(move.data as { card: number; ability: number })
    return super.onCustomMove(move)
  }

  /**
   * The Villager leaves the Village for the camp and the card it designates pays a coin for every
   * other Villager still standing around it. Neris may make that two more.
   */
  private gainCoinsAround(data: VillagerActionData): GreyluneMove[] {
    if (data.card !== undefined) this.pushGains([coins(this.surcharge(data.card))])
    return [
      this.villagers.index(data.villager).moveItem({ type: LocationType.Camp, player: this.player }),
      ...this.openReactions([TriggerType.RemoveVillager], RuleId.ResolveEffects)
    ]
  }

  /** The Companions answer inside {@link ActivateCardRule}, where the price is actually due. */
  private startActivation(data: VillagerActionData): GreyluneMove[] {
    this.memorize(Memory.SpentVillager, data.villager)
    this.memorize(Memory.ActivatedCard, data.card)
    return [this.startRule(RuleId.ActivateCard)]
  }

  private startUseItem(data: { card: number; ability: number }): GreyluneMove[] {
    this.memorize(Memory.ActivatedCard, data.card)
    this.memorize(Memory.Ability, data.ability)
    return this.openReactions([TriggerType.SpendVillagers, TriggerType.SpendForce], RuleId.UseItem)
  }
}
