/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { playerVp, vpTokenTotal } from '@gamepark/greylune/material/PlayerState'
import { getVpTokenPlayer, VpToken } from '@gamepark/greylune/material/VpToken'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName, useRules } from '@gamepark/react-game'
import { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { HelpFact, HelpFacts, HelpNote, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * A player's score is read off two pieces at once, the marker on the track and the token that counts
 * its laps: both dialogs lead with the sum, which neither piece shows on its own. What the track is
 * for is the main board's own zone, quoted whole.
 */
const ScoreHelp = ({ player, name, children }: { player: PlayerColor; name: string; children?: ReactNode }) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const playerName = usePlayerName(player)
  if (rules === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={playerColors[player]} name={name} subtitle={playerName} />

      <HelpFacts>
        <HelpFact label={t('help.score-marker.vp')}>{playerVp(rules, player)}</HelpFact>
        {children}
      </HelpFacts>

      <HelpSection title={t('help.main-board.score.name')}>
        <Trans i18nKey="help.main-board.score.text" components={helpTexts} />
      </HelpSection>
      <HelpNote>
        <Trans i18nKey="help.main-board.score.note" components={helpTexts} />
      </HelpNote>
    </div>
  )
}

export const ScoreMarkerHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const player = item.id as PlayerColor | undefined
  if (player === undefined) return null
  return <ScoreHelp player={player} name={t('help.score-marker.name')} />
}

/** A token still waiting on its shield at the foot of the track is no less its owner's: the colour is in its id. */
export const VpTokenHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const token = item.id as VpToken | undefined
  if (token === undefined) return null
  return (
    <ScoreHelp player={getVpTokenPlayer(token)} name={t('help.vp-token.name')}>
      <HelpFact label={t('help.vp-token.side')}>{t('help.vp', { count: vpTokenTotal(token, item.location?.rotation === true) })}</HelpFact>
    </ScoreHelp>
  )
}
