import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { Season } from '@gamepark/greylune/Season'
import { HeaderText, PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { SeasonIcon, VillagerIcon } from './Icons'

/**
 * The turn of a player in Summer (see {@link SummerRule}).
 *
 * Five of the six actions spend a Villager and the sixth tilts an Object, so the bar names the two
 * things a player reaches for and leaves the choice on the table.
 *
 * Autumn only takes a player with nothing left standing in the Village: the button is shown all the
 * same and comes up disabled, because a way out that appears out of nowhere is a way out nobody was
 * planning for.
 */
export const SummerHeader = () => {
  const autumn = useLegalMove(isCustomMoveType(CustomMoveType.ChangeSeason))
  return (
    <HeaderText
      code="summer"
      components={{
        villager: <VillagerIcon />,
        autumn: <PlayMoveButton move={autumn} />,
        leaf: <SeasonIcon season={Season.Autumn} />
      }}
    />
  )
}
