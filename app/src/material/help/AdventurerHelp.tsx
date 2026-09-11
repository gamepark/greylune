/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { AdventurerWord } from './HelpLinks'
import { HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/** The dialog does not link to itself: the Adventurer it is about is named, not pointed at. */
const texts = { ...helpTexts, adventurer: <AdventurerWord /> }

/**
 * A player's Adventurer: the pawn that travels, and the one piece of the main board that belongs to
 * someone. What it does is the rulebook's "Partir à l'aventure" (pp.4 and 11): how far it walks, and
 * where each journey of the year starts from — the Village, then wherever it stopped, until Autumn
 * sends it home.
 */
export const AdventurerHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const player = item.id as PlayerColor | undefined
  const name = usePlayerName(player)
  if (player === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={playerColors[player]} name={t('help.adventurer.name')} subtitle={name} />

      <HelpSection title={t('help.main-board.road.name')}>
        <Trans i18nKey="help.adventurer.travel" components={texts} />
      </HelpSection>
      <HelpSection title={t('help.main-board.village.name')}>
        <Trans i18nKey="help.main-board.village.text" components={texts} />
      </HelpSection>
    </div>
  )
}
