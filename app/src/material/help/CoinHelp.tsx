/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { playerCoins } from '@gamepark/greylune/material/PlayerState'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName, useRules } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { colors } from '../../theme/colors'
import { HelpFact, HelpFacts, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * The coins: the heap of the bank, or a player's purse. A coin is only one denomination of a sum, so
 * the purse's dialog leads with the sum rather than with the piece that was clicked.
 */
export const CoinHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const player = item.location?.type === LocationType.PlayerCoins ? (item.location.player as PlayerColor | undefined) : undefined
  const name = usePlayerName(player)
  if (rules === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={player !== undefined ? playerColors[player] : colors.gold} name={t('help.coin.name')} subtitle={player !== undefined ? name : undefined} />

      {player !== undefined && (
        <HelpFacts>
          <HelpFact label={t('help.coin.owned')}>{playerCoins(rules, player)}</HelpFact>
        </HelpFacts>
      )}

      <p>
        <Trans i18nKey="help.coin.text" components={helpTexts} />
      </p>
      <HelpSection title={t('help.player-board.income.name')}>
        <Trans i18nKey="help.player-board.income.text" components={helpTexts} />
      </HelpSection>
    </div>
  )
}
