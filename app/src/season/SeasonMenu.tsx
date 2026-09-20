/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { NextSeasonIcon } from '../components/Icons'
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
 * the question is about. It stands on the arrow the board prints towards the next season (see
 * {@link changeSeasonButtonSpot}) and carries that same arrow, so the button is the printed mark
 * made pressable rather than a second thing to read beside it — and the track running left to right,
 * it points the way the marker is about to go.
 *
 * Which is why the label only comes up under the cursor: the marker wears its offer at all times
 * (see `SeasonMarkerDescription`), and a sentence stood permanently on the track would cover the
 * circles on either side, which is where the other players' markers are. The arrow says it, and the
 * words are there for whoever asks. A disabled button never gets asked — no pointer events reach it
 * — but Spring and Summer both spell the same offer out in the header bar, so nothing is lost.
 */
export const ChangeSeasonMenu = ({ season, move }: Props) => {
  const { t } = useTranslation()
  const { x, y } = changeSeasonButtonSpot(season)
  return (
    <GreyluneMenuButton
      css={hoverLabelCss}
      x={x}
      y={y}
      move={move}
      labelPosition="right"
      label={t(season === Season.Summer ? 'action.summer' : 'action.autumn')}
    >
      <NextSeasonIcon />
    </GreyluneMenuButton>
  )
}

/** The label of {@link GreyluneMenuButton}, kept until the button is aimed at. */
const hoverLabelCss = css`
  > span {
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }

  &:hover > span,
  &:focus-visible > span {
    opacity: 1;
  }
`
