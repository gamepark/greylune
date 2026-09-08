import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { TravelRule } from '@gamepark/greylune/rules/TravelRule'
import { HeaderText, useRules } from '@gamepark/react-game'
import { AdventurerIcon } from '../components/Icons'

/**
 * The Adventurer goes, or goes further (see {@link TravelRule}). Every area within reach carries the
 * offer to walk there, and the pawn itself the offer to go no further (see `TravelMenu`), so the bar
 * only says how far — the one number the table does not show.
 */
export const TravelHeader = () => {
  const rules = useRules<GreyluneRules>()!
  return <HeaderText code="travel" values={{ count: new TravelRule(rules.game).travelLeft }} components={{ adventurer: <AdventurerIcon /> }} />
}
