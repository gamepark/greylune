import { Memory } from '../Memory'
import { Effect, RequirementType } from '../material/Effect'
import { ReactionType } from '../material/Reaction'
import { villageCardData } from '../material/VillageCard'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * Whether using an Object leaves it tilted, which is when Isandre may stand it back up. An Object the
 * effect asks to be given up goes back in the box instead, even one printing a tilt beside it.
 */
export const tiltsItself = (ability: Effect): boolean => {
  const requirements = ability.requirements ?? []
  return requirements.some((requirement) => requirement.type === RequirementType.Tilt) && !requirements.some((requirement) => requirement.type === RequirementType.DiscardCard)
}

/**
 * One of the player's Objects is used (rulebook p.7). The card goes down, and only comes back up
 * next Autumn — unless Isandre stands it up again. It goes down the moment it is used, before the rest
 * of its price is settled (see `SummerRule`), so that the window opened on that price is also the one
 * Isandre answers the tilt in: a player tilting Tommy and Bran for Tommy's Villager picks which of
 * the two she stands back up. A card the effect asks to be given up goes back in the box here.
 */
export class UseItemRule extends GreyluneRule {
  get card(): number {
    return this.remind<number>(Memory.ActivatedCard)
  }

  get ability(): Effect {
    return villageCardData[this.playerCard(this.card)].abilities![this.remind<number>(Memory.Ability)]
  }

  /**
   * The Object is offered to a player who could only pay its Villagers with Bran, or its Force with
   * Kael: the window opened before this rule cannot be passed then, and only they are offered in it.
   */
  get outOfReach(): boolean {
    return !this.canPay(this.ability.requirements)
  }

  helps(card: number, option: number): boolean {
    const type = this.reactionEffect(card, option).type
    const asked =
      type === ReactionType.ReduceVillagerCost ? RequirementType.SpendVillagers : type === ReactionType.ReduceForceCost ? RequirementType.SpendForce : undefined
    return (this.ability.requirements ?? []).some((requirement) => requirement.type === asked && !this.canPay([requirement]))
  }

  onRuleStart(): GreyluneMove[] {
    const ability = this.ability
    const moves: GreyluneMove[] = []
    for (const requirement of ability.requirements ?? []) {
      // The tilt was paid the moment the Object was used.
      if (requirement.type === RequirementType.Tilt) continue
      if (requirement.type === RequirementType.DiscardCard) moves.push(this.villageCards.index(this.card).deleteItem())
      else moves.push(...this.payRequirements([requirement]))
    }
    this.pushGains(ability.gains ?? [])
    return [...moves, ...this.endOfAction()]
  }
}
