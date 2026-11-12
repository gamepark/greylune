import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Season } from '@gamepark/greylune/Season'
import { HeaderText, PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isMoveItemType } from '@gamepark/rules-api'
import { SeasonIcon, VillagerIcon } from '../components/Icons'

/**
 * The turn of a player in Summer (see {@link SummerRule}).
 *
 * Five of the six actions spend a Villager and the sixth tilts an Object, so the bar names the two
 * things a player reaches for and leaves the choice on the table.
 *
 * Autumn only takes a player with nothing left standing in the Village. While they still have one
 * there, the bar does not offer a way out it would have to disable: it says the action is not
 * optional, and the (?) at its end says why (see {@link SummerRulesHelp}). The header only reads
 * "you" for the active player, whose legal moves are the ones being looked at, so a missing Autumn
 * move is that condition and nothing else.
 */
export const SummerHeader = () => {
  const autumn = useLegalMove(isMoveItemType(MaterialType.SeasonMarker))
  return (
    <HeaderText
      code={autumn ? 'summer' : 'summer-locked'}
      components={{
        villager: <VillagerIcon />,
        autumn: <PlayMoveButton move={autumn} />,
        leaf: <SeasonIcon season={Season.Autumn} />
      }}
    />
  )
}
