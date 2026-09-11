/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { HeroicQuestArea, QuestTile, questRewards } from '@gamepark/greylune/material/QuestTile'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { cardInk } from '../../theme/colors'
import { HelpFact, HelpFacts, HelpNote, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * What a Heroic Quest asks, and what it is worth.
 *
 * The tile itself only asks: it shows one condition and pays nothing. What it is worth is printed on
 * the board, under the space it happens to have been dealt to — 7/5 nearest, then 8/6, then 9/7 — so
 * the same Quest is a different prize from one game to the next. That is the one thing a player
 * cannot read off the tile, and it is why the dialog leads with it.
 */
export const QuestTileHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const quest = item.id as QuestTile | undefined
  const area = item.location?.type === LocationType.QuestTileSpace ? (item.location.id as HeroicQuestArea | undefined) : undefined
  const reward = area !== undefined ? questRewards[area] : undefined

  if (quest === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={cardInk.quest} name={t(`quest-tile.${quest}.name`)} subtitle={t('help.quest.name')} />

      {reward !== undefined && (
        <HelpFacts>
          <HelpFact label={t('help.distance')}>{area}</HelpFact>
          <HelpFact label={t('help.quest.first')}>{t('help.vp', { count: reward.first })}</HelpFact>
          <HelpFact label={t('help.quest.others')}>{t('help.vp', { count: reward.others })}</HelpFact>
        </HelpFacts>
      )}

      <HelpSection title={t('help.requirement')}>
        <Trans i18nKey={`quest-tile.${quest}.requirement`} components={helpTexts} />
      </HelpSection>

      <HelpNote>
        <Trans i18nKey="help.quest.note" components={helpTexts} />
      </HelpNote>
      <HelpNote>
        <Trans i18nKey="help.quest.score" components={helpTexts} />
      </HelpNote>
    </div>
  )
}
