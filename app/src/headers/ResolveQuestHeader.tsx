import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { ResolveQuestRule } from '@gamepark/greylune/rules/ResolveQuestRule'
import { HeaderText, useRules } from '@gamepark/react-game'

/**
 * A Heroic Quest is being achieved (see {@link ResolveQuestRule}). It only ever waits for one thing:
 * the Encounters the Bards ask to be told, which are slid over on the personal board — so the bar
 * says how many are still owed and nothing else.
 */
export const ResolveQuestHeader = () => {
  const rules = useRules<GreyluneRules>()!
  return <HeaderText code="quest" values={{ count: new ResolveQuestRule(rules.game).storiesOwed }} />
}
