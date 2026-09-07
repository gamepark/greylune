import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { EventRule } from '@gamepark/greylune/rules/EventRule'
import { HeaderText, useRules } from '@gamepark/react-game'

/**
 * The Event of the year, once a Villager is standing on the tile (see {@link EventRule}).
 *
 * The step is reached whatever the tile has left to give, because a Companion or a Potion may be
 * played on the way in and change what the player can afford, so what the tile asks is only known
 * once they are there. A tile with a single option left asks nothing and settles it on its own, and
 * the bar says so rather than putting a question that was never put.
 */
export const EventHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const choice = new EventRule(rules.game).getPlayerMoves().length > 1
  return <HeaderText code={choice ? 'event' : 'resolve-event'} />
}
