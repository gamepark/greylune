/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { IncomeToken, incomeTokenGains } from '@gamepark/greylune/material/Tokens'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { GainsLabel } from '../../components/Gains'
import { playerColors } from '../../PlayerColors'
import { cardInk } from '../../theme/colors'
import { HelpNote, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * An Income token, on the Encounter that carries it or on the board of the player who resolved it.
 * What it pays is printed on it and said the same way (see {@link GainsLabel}); when it pays is the
 * note the Encounter dialog already gives.
 */
export const IncomeTokenHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const token = item.id as IncomeToken | undefined
  const player = item.location?.type === LocationType.IncomeTokenSpace ? (item.location.player as PlayerColor | undefined) : undefined
  const name = usePlayerName(player)
  if (token === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle
        accent={player !== undefined ? playerColors[player] : cardInk.encounter}
        name={t('help.income-token.name')}
        subtitle={player !== undefined ? name : undefined}
      />

      <HelpSection title={t('help.income')}>
        <GainsLabel gains={incomeTokenGains[token]} />
      </HelpSection>

      <HelpNote>
        <Trans i18nKey="help.income-token.note" components={helpTexts} />
      </HelpNote>
    </div>
  )
}
