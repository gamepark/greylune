import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { TravelRule } from '@gamepark/greylune/rules/TravelRule'
import { HeaderText, PlayMoveButton, useLegalMove, useRules } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { AdventurerIcon } from './Icons'

/**
 * The Adventurer goes, or goes further (see {@link TravelRule}). Every area within reach is a place
 * to click on the board, so the bar only says how far — the one number the table does not show —
 * and offers the choice the board cannot: not moving at all.
 */
export const TravelHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const stay = useLegalMove(isCustomMoveType(CustomMoveType.Pass))
  return (
    <HeaderText
      code="travel"
      values={{ count: new TravelRule(rules.game).travelLeft }}
      components={{ adventurer: <AdventurerIcon />, stay: <PlayMoveButton move={stay} /> }}
    />
  )
}
