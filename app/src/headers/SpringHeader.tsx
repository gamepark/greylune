import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Season } from '@gamepark/greylune/Season'
import { HeaderText, PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isMoveItemType } from '@gamepark/rules-api'
import { SeasonIcon, VillagerIcon } from '../components/Icons'

/**
 * The turn of a player still in Spring (see {@link SpringRule}).
 *
 * Both actions of the season put a Villager down — in a gap of the Village, or on the Event tile —
 * so the bar asks for one thing and the table offers the two places to put it. Moving on to Summer
 * walks the season marker one step down its track, and the bar offers the same move as a button.
 */
export const SpringHeader = () => {
  const summer = useLegalMove(isMoveItemType(MaterialType.SeasonMarker))
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
