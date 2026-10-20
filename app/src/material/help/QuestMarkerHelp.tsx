/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { HelpNote, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * One of a player's 3 Heroic Quest markers: waiting on the personal board, or under a Quest its owner
 * achieved. Both are said by the dialogs of what holds them, quoted whole (see {@link PlayerBoardHelp}
 * and {@link QuestTileHelp}).
 */
export const QuestMarkerHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const player = item.id as PlayerColor | undefined
  const name = usePlayerName(player)
  if (player === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={playerColors[player]} name={t('help.quest-marker.name')} subtitle={name} />

      <HelpSection title={t('help.player-board.quests.name')}>
        <Trans i18nKey="help.player-board.quests.text" components={helpTexts} />
      </HelpSection>
      <HelpSection title={t('help.main-board.quests.name')}>
        <Trans i18nKey="help.quest.note" components={helpTexts} />
      </HelpSection>
      <HelpNote>
        <Trans i18nKey="help.quest.score" components={helpTexts} />
      </HelpNote>
    </div>
  )
}
