/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { villagersAtDisposal } from '@gamepark/greylune/material/PlayerState'
import { getVillagerPlayer, Villager, VILLAGERS_PER_PLAYER } from '@gamepark/greylune/material/Villager'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, usePlayerName, useRules } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { playerColors } from '../../PlayerColors'
import { VillagerWord } from './HelpLinks'
import { HelpFact, HelpFacts, HelpList, HelpListItem, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/** The dialog does not link to itself: the Villager it is about is named, not pointed at. */
const texts = { ...helpTexts, villager: <VillagerWord /> }

/**
 * The actions of each season a Villager is taken for, in the Season board's lines (see
 * {@link SeasonBoardHelp}): placed in Spring, taken back out of the Village in Summer. Summer's
 * Objects are left out — spending a Villager is one of their effects, not an action of its own — and
 * so is moving on to the next season, which takes no Villager.
 */
const seasonActions = {
  spring: [0, 1],
  summer: [0, 1, 2, 4]
}

/**
 * A Villager: the worker of the game. The rulebook has no page of its own for it, it is the thread
 * running through every season (pp.5-9), so the dialog follows it through the year — active on the
 * personal board, placed in Spring, taken back in Summer, resting in the camp once used, and back on
 * the board in Autumn. Every line but the first is the very line the Season board dialog reads.
 *
 * How many of their 7 its owner has got hold of leads, as in the reserve's dialog: it is the one thing
 * about a Villager that changes during the game.
 */
export const VillagerHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const villager = item.id as Villager | undefined
  const player = villager === undefined ? undefined : getVillagerPlayer(villager)
  const name = usePlayerName(player)
  if (rules === undefined || player === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={playerColors[player]} name={t('help.villager.name')} subtitle={name} />

      <HelpFacts>
        <HelpFact label={t('help.villager-reserve.owned')}>
          {villagersAtDisposal(rules, player)}/{VILLAGERS_PER_PLAYER}
        </HelpFact>
      </HelpFacts>

      <HelpSection title={t('help.player-board.villagers.name')}>
        <Trans i18nKey="help.villager.active" components={texts} />
      </HelpSection>
      {Object.entries(seasonActions).map(([season, lines]) => (
        <HelpList key={season} title={t(`help.season-board.${season}.name`)}>
          {lines.map((line) => (
            <HelpListItem key={line}>
              <Trans i18nKey={`help.season-board.${season}.${line}`} components={texts} />
            </HelpListItem>
          ))}
        </HelpList>
      ))}
      <HelpSection title={t('help.season-board.camp.name')}>
        <Trans i18nKey="help.season-board.camp.text" components={texts} />
      </HelpSection>
      <HelpSection title={t('help.season-board.autumn.name')}>
        <Trans i18nKey="help.season-board.autumn.1" components={texts} />
      </HelpSection>
    </div>
  )
}
