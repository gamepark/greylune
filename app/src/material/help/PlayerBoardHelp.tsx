/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { BASE_INCOME, MAX_COMPANIONS } from '@gamepark/greylune/Constants'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { itemLimit, playerCompanions, playerItems } from '@gamepark/greylune/material/PlayerState'
import { IncomeToken } from '@gamepark/greylune/material/Tokens'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { specialActions } from '@gamepark/greylune/rules/SpecialActionRule'
import { MaterialHelpProps, useRules, usePlayerName } from '@gamepark/react-game'
import { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  CoinIcon,
  CompanionIcon,
  ForceIcon,
  IncomeIcon,
  IncomeTokenIcon,
  MagicIcon,
  ObjectIcon,
  QuestMarkerIcon,
  SpecialActionIcon,
  StoryIcon,
  VillagerIcon
} from '../../components/Icons'
import { playerColors } from '../../PlayerColors'
import { HelpFact, HelpFacts, HelpList, HelpListItem, HelpNote, HelpSection, HelpTitle, helpDialogCss, helpIcons } from './HelpLayout'

/**
 * What the personal board holds, zone by zone.
 *
 * The board is printed as symbols like everything else in the box — a hand, a doorway, two columns of
 * numbered gems, three empty shields — and it is the one piece a player looks at every single turn.
 * So this dialog is a legend for it: one heading per printed zone, in the order the rulebook walks
 * through them, and under each the sentence that says what the zone is for. Beside every heading is
 * the mark the zone is printed with, which is what turns a list of paragraphs into a legend: the
 * player reads the word, sees the mark, and finds it on their board without being told where to
 * look. Four of those marks exist nowhere else in the box and are cut out of the board itself (see
 * {@link IconImages}); the rest are the symbols the cards are already read with, and the Quest
 * marker is the piece itself, in the colour of whoever's board is being read.
 *
 * Two things set it apart from the card dialogs. The first is that a zone is a place rather than an
 * effect: what a Companion does is on the Companion, and what the *left of the board* means is that
 * Companions live there. The second is that several of those sentences are not about the board at
 * all — what a Companion costs, how a story is paid by tiers, what an Income token does every Autumn
 * — and those are the shared keys the other dialogs already read (`help.type.3.note`,
 * `help.tell-story.note`, `help.income-token.note`). They are quoted here, never copied: a rule that
 * changes is rewritten once and every dialog that states it follows.
 *
 * The three figures at the top are the ones the board cannot print, because they are not the same
 * from one game or one player to the next: how many Companions and Objects are left to take — the
 * Object limit is raised by Kael, Dorian and the Bag of holding — and what the next Autumn will
 * actually pay out.
 */
export const PlayerBoardHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const player = item.location?.player as PlayerColor | undefined
  const name = usePlayerName(player)
  if (rules === undefined || player === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={playerColors[player]} name={t('help.player-board.name')} subtitle={name} />

      <HelpFacts>
        <HelpFact label={t('help.player-board.companions.name')}>
          {playerCompanions(rules, player).length}/{MAX_COMPANIONS}
        </HelpFact>
        <HelpFact label={t('help.player-board.items.name')}>
          {playerItems(rules, player).length}/{itemLimit(rules, player)}
        </HelpFact>
        <HelpFact label={t('help.player-board.income.name')}>
          <Income player={player} rules={rules} />
        </HelpFact>
      </HelpFacts>

      {/* Beside the board first, since that is where a player's own cards are: Companions left, Objects right. */}
      <Zone zone="companions" note="help.type.3.note" mark={<CompanionIcon />} />
      <Zone zone="items" note="help.type.2.note" mark={<ObjectIcon />} />
      <Zone zone="stories" note="help.tell-story.note" mark={<StoryIcon />} />

      {/* Then the board itself, left to right: the income column, the two tracks, the right-hand panel. */}
      <Zone zone="income" note="help.income-token.note" mark={<IncomeIcon />} />
      <Zone
        zone="skills"
        note="help.player-board.skills.score"
        mark={
          <>
            <ForceIcon />
            <MagicIcon />
          </>
        }
      />
      <SpecialAction />
      <Zone zone="quests" note="help.quest.score" mark={<QuestMarkerIcon player={player} />} />
      <Zone zone="villagers" mark={<VillagerIcon />} />
    </div>
  )
}

/**
 * One zone of the board: what it is, and under it the rule it is an instance of, when there is one
 * that the rest of the game states too. The note is set apart the way it is on a card dialog, so
 * that a player who has already read it on their first Companion can skip it here.
 */
const Zone = ({ zone, note, mark }: { zone: string; note?: string; mark: ReactNode }) => {
  const { t } = useTranslation()
  return (
    <>
      <HelpSection title={t(`help.player-board.${zone}.name`)} mark={<Mark>{mark}</Mark>}>
        <Trans i18nKey={`help.player-board.${zone}.text`} components={helpIcons} />
      </HelpSection>
      {note !== undefined && (
        <HelpNote>
          <Trans i18nKey={note} components={helpIcons} />
        </HelpNote>
      )}
    </>
  )
}

/**
 * The doorway, and the line of icons the board prints under it. A choice between options, so a list
 * like the Banquet and the Festival rather than a paragraph — and the options are counted off
 * {@link specialActions} rather than written out here, so that one taken away from the rules cannot
 * leave a line behind (see `PlayerBoardHelp.spec`).
 */
const SpecialAction = () => {
  const { t } = useTranslation()
  return (
    <>
      <HelpList
        title={t('help.player-board.special-action.name')}
        mark={
          <Mark>
            <SpecialActionIcon />
          </Mark>
        }
      >
        {specialActions.map((_, option) => (
          <HelpListItem key={option}>
            <Trans i18nKey={`help.player-board.special-action.${option}`} components={helpIcons} />
          </HelpListItem>
        ))}
      </HelpList>
      <HelpNote>
        <Trans i18nKey="help.player-board.special-action.text" components={helpIcons} />
      </HelpNote>
    </>
  )
}

/**
 * What the next Autumn hands this player: 3 coins less one per Companion (rulebook p.9), then every
 * Income token they have won. The tokens are drawn rather than added up — one of them pays points and
 * another Force, so there is no one number to show — and they are the same faces as the ones lying on
 * the board being read.
 */
const Income = ({ player, rules }: { player: PlayerColor; rules: GreyluneRules }): ReactNode => {
  const wages = Math.max(0, BASE_INCOME - playerCompanions(rules, player).length)
  const tokens = rules.material(MaterialType.IncomeToken).location(LocationType.IncomeTokenSpace).player(player).getItems()
  return (
    <>
      {wages} <CoinIcon />
      {tokens.map((token, index) => (
        <IncomeTokenIcon key={index} token={token.id as IncomeToken} />
      ))}
    </>
  )
}

// ------------------------------------------------------------------ the marks beside the headings

/**
 * The box a heading's mark sits in. The size is set with `font-size` rather than with a height,
 * because every icon of the game draws itself 1 em tall (see {@link Icons}) — so one figure here
 * governs the lot, and a mark made of two symbols keeps them the same size as a mark made of one.
 */
const Mark = ({ children }: { children: ReactNode }) => <span css={markCss}>{children}</span>

const markCss = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.15em;
  font-size: 1.9em;
  line-height: 1;
`
