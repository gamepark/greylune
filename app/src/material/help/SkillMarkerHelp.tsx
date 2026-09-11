/** @jsxImportSource @emotion/react */
import { MAX_SKILL } from '@gamepark/greylune/Constants'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { HelpFact, HelpFacts, HelpNote, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * The marker a player's Force, or Magic, is read off: the piece the help texts point at when they
 * name either (see {@link HelpLinks}).
 *
 * The level is what the marker is there to say and what nothing else on the table spells out, so it
 * leads. What the tracks are for is the personal board's own zone, quoted whole rather than cut in
 * two: the rulebook presents Force and Magic together, and they score together at the end.
 */
const SkillMarkerHelp = ({ item, skill }: MaterialHelpProps<PlayerColor, MaterialType, LocationType> & { skill: 'force' | 'magic' }) => {
  const { t } = useTranslation()
  const player = item.location?.player as PlayerColor | undefined
  const name = usePlayerName(player)
  if (player === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={playerColors[player]} name={t(`help.skill.${skill}`)} subtitle={name} />

      <HelpFacts>
        <HelpFact label={t('help.skill.level')}>
          {item.location?.x ?? 0}/{MAX_SKILL}
        </HelpFact>
      </HelpFacts>

      <HelpSection title={t('help.player-board.skills.name')}>
        <Trans i18nKey="help.player-board.skills.text" components={helpTexts} />
      </HelpSection>
      <HelpNote>
        <Trans i18nKey="help.player-board.skills.score" components={helpTexts} />
      </HelpNote>
    </div>
  )
}

export const StrengthMarkerHelp = (props: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => <SkillMarkerHelp {...props} skill="force" />

export const MagicMarkerHelp = (props: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => <SkillMarkerHelp {...props} skill="magic" />
