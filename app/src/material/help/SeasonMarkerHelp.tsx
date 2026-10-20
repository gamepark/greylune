/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { MaterialHelpProps, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { HelpFact, HelpFacts, HelpList, HelpListItem, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/** The Season board dialog's own key for each season. */
const seasonKeys: Record<Season, string> = {
  [Season.Winter]: 'winter',
  [Season.Spring]: 'spring',
  [Season.Summer]: 'summer',
  [Season.Autumn]: 'autumn'
}

/**
 * A player's Season marker. The season its owner is in leads, since it is the whole of what the
 * marker says; then what the Season board says of the markers, and the two actions that walk one on,
 * in the very lines of that board's dialog (see {@link SeasonBoardHelp}).
 */
export const SeasonMarkerHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const player = item.id as PlayerColor | undefined
  const name = usePlayerName(player)
  if (player === undefined) return null
  const season = item.location?.id as Season | undefined

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={playerColors[player]} name={t('help.season-marker.name')} subtitle={name} />

      {season !== undefined && (
        <HelpFacts>
          <HelpFact label={t('help.season-marker.season')}>{t(`help.season-board.${seasonKeys[season]}.name`)}</HelpFact>
        </HelpFacts>
      )}

      <HelpSection title={t('help.season-board.markers.name')}>
        <Trans i18nKey="help.season-board.markers.text" components={helpTexts} />
      </HelpSection>
      <HelpList title={t('help.season-marker.change')}>
        <HelpListItem>
          <Trans i18nKey="help.season-board.spring.2" components={helpTexts} />
        </HelpListItem>
        <HelpListItem>
          <Trans i18nKey="help.season-board.summer.5" components={helpTexts} />
        </HelpListItem>
      </HelpList>
    </div>
  )
}
