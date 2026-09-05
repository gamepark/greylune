import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { MAX_SKILL } from '../Constants'
import { Memory } from '../Memory'
import { Gain, GainType } from '../material/Effect'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/** Force or Magic: what the cards that print the two gems side by side leave to the player. */
export class ChooseSkillRule extends GreyluneRule {
  get count(): number {
    const gain = this.remind<Gain>(Memory.CurrentGain)
    return gain && gain.type === GainType.Skill && typeof gain.count === 'number' ? gain.count : 1
  }

  getPlayerMoves(): GreyluneMove[] {
    const moves: GreyluneMove[] = []
    if (this.force < MAX_SKILL) moves.push(this.customMove(CustomMoveType.ChooseSkill, true))
    if (this.magic < MAX_SKILL) moves.push(this.customMove(CustomMoveType.ChooseSkill, false))
    return moves
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.ChooseSkill)(move)) return this.gainSkill(this.count, move.data === true)
    return super.onCustomMove(move)
  }
}
