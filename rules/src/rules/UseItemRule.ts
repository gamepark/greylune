import { Memory } from '../Memory'
import { RequirementType } from '../material/Effect'
import { TriggerType } from '../material/Reaction'
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

  onRuleStart(): GreyluneMove[] {
    const ability = villageCardData[this.playerCard(this.card)].abilities![this.remind<number>(Memory.Ability)]
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
