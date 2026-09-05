import { BASE_INCOME } from '../Constants'
import { Area } from '../material/Area'
import { coins, Gain } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { playerCompanions } from '../material/PlayerState'
import { IncomeToken, incomeTokenGains } from '../material/Tokens'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * The end of a player's year (rulebook p.9), and no turn at all: nothing is asked, everything is
 * put back, and the player acts no more until the last of their opponents gets here too.
 *
 * The Villagers come home from everywhere they were spent, so a player starts the next year with
 * every figure they own — which is what makes the Companions, who each bring one for good, worth
 * their 7 coins and the pound of income they cost.
 */
export class AutumnRule extends GreyluneRule {
  onRuleStart(): GreyluneMove[] {
    this.pushGains(this.income)
    return [...this.comeHome(), ...this.straightenCards(), ...this.endOfAction()]
  }

  /** The Adventurer walks back to Greylune and every Villager comes back to the active zone. */
  private comeHome(): GreyluneMove[] {
    const away = this.villagers
      .player(this.player)
      .location(
        (location) =>
          location.type === LocationType.Camp || location.type === LocationType.EventSpace || location.type === LocationType.SpecialAction
      )
    return [
      ...this.adventurer.moveItems({ type: LocationType.Area, id: Area.Village }),
      ...away.moveItems({ type: LocationType.ActiveVillagers, player: this.player })
    ]
  }

  private straightenCards(): GreyluneMove[] {
    return this.playerCards.rotation(true).rotateItems(false)
  }

  /** 3 coins, one less for every Companion, and whatever the Income tokens pay every year. */
  get income(): Gain[] {
    const wages = Math.max(0, BASE_INCOME - playerCompanions(this, this.player).length)
    const tokens = this.material(MaterialType.IncomeToken)
      .location(LocationType.IncomeTokenSpace)
      .player(this.player)
      .getItems()
      .flatMap((item) => incomeTokenGains[item.id as IncomeToken])
    return [coins(wages), ...tokens]
  }

  getPlayerMoves(): GreyluneMove[] {
    return []
  }
}
