import { MAX_STORY_VALUE } from '@gamepark/greylune/Constants'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { TellStoryRule } from '@gamepark/greylune/rules/TellStoryRule'
import { HeaderText, PlayMoveButton, useLegalMove, useRules } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'

/**
 * A Tavern is open (see {@link TellStoryRule}). The Encounters are told by sliding them over on the
 * personal board, and the Tavern pays by tiers — so the one thing the table does not show is how
 * much the story is worth so far, which is what decides the tier. Closing it is the button: the
 * player is paid when they stop, and only then — and not before a first Encounter has been told.
 */
export const TellStoryHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const end = useLegalMove(isCustomMoveType(CustomMoveType.Pass))
  const rule = new TellStoryRule(rules.game)
  if (!rule.told.length) return <HeaderText code="start-story" />
  return (
    <HeaderText
      code="tell-story"
      values={{ value: rule.value, max: MAX_STORY_VALUE }}
      components={{ end: <PlayMoveButton move={end} /> }}
    />
  )
}
