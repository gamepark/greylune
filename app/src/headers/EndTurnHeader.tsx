import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { HeaderText, PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'

/** The action is over: the button hands the turn on, and does it by itself after 10 seconds. */
export const EndTurnHeader = () => {
  const pass = useLegalMove(isCustomMoveType(CustomMoveType.Pass))
  return <HeaderText code="end-turn" components={{ end: <PlayMoveButton move={pass} auto={10} /> }} />
}
