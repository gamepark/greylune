import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { SeasonIcon } from '../components/Icons'
import { changeSeasonButtonSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

type Props = {
  season: Season.Summer | Season.Autumn
  /** Nothing at all when the season cannot be left yet: the button is then drawn and comes up disabled. */
  move?: MaterialMove<PlayerColor, MaterialType, LocationType>
}

/**
 * Moving on to the next season, worn by the marker that walks there.
 *
 * The season a player is in is read off this pawn and nothing else, so the way out of it is offered
 * on the pawn itself rather than on the space it would land on: the piece that answers is the piece
 * the question is about. It stands just below the marker (see {@link changeSeasonButtonSpot}) —
 * under the track rather than along it, the spaces on either side being where the other players'
 * markers stand — and its label is written towards the season it is heading for, the track running
 * left to right.
 *
 * Autumn only takes a player with nothing left standing in the Village, and the button is shown all
 * the same and comes up disabled, for the same reason `SummerHeader` shows its own: a way out that
 * appears out of nowhere is a way out nobody was planning for.
 */
export const ChangeSeasonMenu = ({ season, move }: Props) => {
  const { t } = useTranslation()
  return (
    <GreyluneMenuButton
      x={changeSeasonButtonSpot.x}
      y={changeSeasonButtonSpot.y}
      move={move}
      label={t(season === Season.Summer ? 'action.summer' : 'action.autumn')}
    >
      <SeasonIcon season={season} />
    </GreyluneMenuButton>
  )
}
