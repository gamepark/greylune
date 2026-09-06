import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { Season } from '@gamepark/greylune/Season'
import { HeaderText, PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { SeasonIcon, VillagerIcon } from './Icons'

/**
 * The turn of a player still in Spring (see {@link SpringRule}).
 *
 * Both actions of the season put a Villager down — in a gap of the Village, or on the Event tile —
 * so the bar asks for one thing and the table offers the two places to put it. Moving on to Summer
 * is the only choice with nothing on the table to click, so it is the only button.
 */
export const SpringHeader = () => {
  const summer = useLegalMove(isCustomMoveType(CustomMoveType.ChangeSeason))
  return (
    <HeaderText
      code="spring"
      components={{
        villager: <VillagerIcon />,
        summer: <PlayMoveButton move={summer} />,
        sun: <SeasonIcon season={Season.Summer} />
      }}
    />
  )
}
