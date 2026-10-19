import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { ResolveQuestRule } from '@gamepark/greylune/rules/ResolveQuestRule'
import { HeaderText, useRules } from '@gamepark/react-game'

/**
 * A Heroic Quest is being achieved (see {@link ResolveQuestRule}). It only ever waits for one thing:
 * the Encounters the Bards ask to be told, which are slid over on the personal board — so the bar
 * says how many are still owed and nothing else.
 *
 * Most Quests ask for no story, and the rule still holds the bar while what it plays is animated —
 * as it does once the last story owed is told: the bar then says the Quest is being achieved.
 */
export const ResolveQuestHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const owed = new ResolveQuestRule(rules.game).storiesOwed
  if (owed <= 0) return <HeaderText code="quest-achieved" />
  return <HeaderText code="quest" values={{ count: owed }} />
}
