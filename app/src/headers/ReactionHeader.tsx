import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { HeaderText, PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'

/**
 * The window a Companion or a Potion may step into (see {@link ReactionRule}). The cards are the
 * player's own and are answered with on the table; the bar only says that the window is open, and
 * gives the one thing the table cannot: closing it.
 */
export const ReactionHeader = () => {
  const pass = useLegalMove(isCustomMoveType(CustomMoveType.Pass))
  return <HeaderText code="reaction" components={{ pass: <PlayMoveButton move={pass} /> }} />
}
