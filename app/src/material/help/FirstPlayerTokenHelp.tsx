/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { colors } from '../../theme/colors'
import { HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/** The first player token: who opens each year (rulebook p.5), and how it is handed on in Winter (p.6). */
export const FirstPlayerTokenHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const player = item.location?.player as PlayerColor | undefined
  const name = usePlayerName(player)

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={player !== undefined ? playerColors[player] : colors.gold} name={t('help.first-player.name')} subtitle={player !== undefined ? name : undefined} />

      <p>
        <Trans i18nKey="help.first-player.text" components={helpTexts} />
      </p>
      <HelpSection title={t('help.season-board.winter.name')}>
        <Trans i18nKey="help.season-board.winter.1" components={helpTexts} />
      </HelpSection>
    </div>
  )
}
