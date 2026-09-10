/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { villagersAtDisposal } from '@gamepark/greylune/material/PlayerState'
import { VILLAGERS_PER_PLAYER } from '@gamepark/greylune/material/Villager'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { LocationHelpProps, useRules, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { HelpFact, HelpFacts, HelpTitle, helpDialogCss, helpIcons } from './HelpLayout'

/**
 * The Villagers a player does not own yet.
 *
 * The reserve is a place with no piece of its own and no mark printed anywhere: 4 figures set aside
 * at setup, standing on the table above the personal board. A player looking at them has one
 * question — why are those 4 out of reach — and the only thing they can click to ask it is a figure.
 * So the pawns of the reserve send the reader here rather than to the Villager dialog (see
 * `VillagerDescription.displayHelp`): what a Villager is, is the same everywhere, and being in the
 * reserve is the whole of what these ones have to say.
 *
 * The count is the point of the dialog and cannot be read off the table without counting pawns in
 * two places at once, so it leads: how many of the 7 this player has actually got hold of.
 */
export const VillagerReserveHelp = ({ location }: LocationHelpProps<PlayerColor, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const player = location.player as PlayerColor | undefined
  const name = usePlayerName(player)
  if (rules === undefined || player === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={playerColors[player]} name={t('help.villager-reserve.name')} subtitle={name} />

      <HelpFacts>
        <HelpFact label={t('help.villager-reserve.owned')}>
          {villagersAtDisposal(rules, player)}/{VILLAGERS_PER_PLAYER}
        </HelpFact>
      </HelpFacts>

      <p>
        <Trans i18nKey="help.villager-reserve.text" components={helpIcons} />
      </p>
    </div>
  )
}
