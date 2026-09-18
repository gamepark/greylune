import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/** The action is over, and the one thing left to do is to hand the turn on. */
export class EndTurnRule extends GreyluneRule {
  getPlayerMoves(): GreyluneMove[] {
    return [this.customMove(CustomMoveType.Pass)]
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    return isCustomMoveType(CustomMoveType.Pass)(move) ? this.passTurn() : super.onCustomMove(move)
  }
}
