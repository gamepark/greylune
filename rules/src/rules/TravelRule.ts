import { CustomMove, isCustomMoveType, ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Area } from '../material/Area'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { adventurerArea } from '../material/PlayerState'
import { TriggerType } from '../material/Reaction'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * The Adventurer leaves Greylune, or goes further from where it stopped last time (rulebook p.11).
 *
 * The areas are laid out in a line, so choosing a direction and how far along it comes down to
 * choosing where to stand: every area within reach is offered, and staying put is offered too,
 * because the Encounter of the area is resolved either way.
 */
export class TravelRule extends GreyluneRule {
  get area(): number {
    return adventurerArea(this, this.player)
  }

  get travelLeft(): number {
    return this.remind<number>(Memory.TravelLeft) ?? 0
  }

  getPlayerMoves(): GreyluneMove[] {
    const from = this.area
    const moves: GreyluneMove[] = []
    for (let area = Math.max(Area.Village, from - this.travelLeft); area <= Math.min(Area.Edge, from + this.travelLeft); area++) {
      if (area !== from) moves.push(this.adventurer.moveItem({ type: LocationType.Area, id: area }))
    }
    moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    return move.itemType === MaterialType.Adventurer ? this.arrive() : []
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    return isCustomMoveType(CustomMoveType.Pass)(move) ? this.arrive() : super.onCustomMove(move)
  }

  /**
   * Where the Adventurer stops is where an Encounter may be resolved — and where the Potions kept
   * for the journey are drunk, since what they lend is only ever worth anything against a condition.
   */
  private arrive(): GreyluneMove[] {
    this.forget(Memory.TravelLeft)
    if (this.area === Area.Village) return this.endOfAction()
    return this.openReactions([TriggerType.ResolveEncounter], RuleId.ResolveEncounter)
  }
}
