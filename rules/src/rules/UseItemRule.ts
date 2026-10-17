import { Memory } from '../Memory'
import { Effect, RequirementType } from '../material/Effect'
import { ReactionType, TriggerType } from '../material/Reaction'
import { villageCardData } from '../material/VillageCard'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * One of the player's Objects is used (rulebook p.7). The card goes down, and only comes back up
 * next Autumn — unless Isandre stands it up again, which is why the tilt opens a window of its own.
 * A card the effect asks to be given up goes back in the box instead.
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
    const requirements = ability.requirements ?? []
    const moves: GreyluneMove[] = []
    let tilted = false
    for (const requirement of requirements) {
      if (requirement.type === RequirementType.Tilt) {
        moves.push(this.villageCards.index(this.card).rotateItem(true))
        tilted = true
      } else if (requirement.type === RequirementType.DiscardCard) {
        moves.push(this.villageCards.index(this.card).deleteItem())
        tilted = false
      } else {
        moves.push(...this.payRequirements([requirement]))
      }
    }
    this.pushGains(ability.gains ?? [])
    if (tilted) this.memorize(Memory.LastTilted, this.card)
    return [...moves, ...(tilted ? this.openReactions([TriggerType.TiltCard], RuleId.ResolveEffects) : this.endOfAction())]
  }
}
