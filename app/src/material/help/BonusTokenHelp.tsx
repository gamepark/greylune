/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { BonusToken, bonusTokenGains } from '@gamepark/greylune/material/Tokens'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { GainsLabel } from '../../components/Gains'
import { playerColors } from '../../PlayerColors'
import { HelpNote, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * One of the 3 Bonus tokens beside a player's board.
 *
 * What it pays is printed on it, and the dialog says it the same way, as a figure and a symbol (see
 * {@link GainsLabel}). When it is spent is the score track's business, and is quoted from the main
 * board's own zone rather than copied.
 */
export const BonusTokenHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const token = item.id as BonusToken | undefined
  const player = item.location?.player as PlayerColor | undefined
  const name = usePlayerName(player)
  if (token === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={player !== undefined ? playerColors[player] : ''} name={t('help.bonus-token.name')} subtitle={player !== undefined ? name : undefined} />

      <HelpSection title={t('help.reward')}>
        <GainsLabel gains={bonusTokenGains[token]} />
      </HelpSection>

      <HelpNote>
        <Trans i18nKey="help.main-board.bonus.text" components={helpTexts} />
      </HelpNote>
    </div>
  )
}
