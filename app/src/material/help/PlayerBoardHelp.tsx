/** @jsxImportSource @emotion/react */
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
import { useTranslation } from 'react-i18next'
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
import { Zone, ZoneList } from './BoardLegend'
import { HelpFact, HelpFacts, HelpTitle, helpDialogCss } from './HelpLayout'

/**
 * What the personal board holds, zone by zone.
 *
 * The board is printed as symbols like everything else in the box — a hand, a doorway, two columns of
 * numbered gems, three empty shields — and it is the one piece a player looks at every single turn.
 * So this dialog is a legend for it (see {@link BoardLegend}): one heading per printed zone, in the
 * order the rulebook walks through them, each beside the mark the zone is printed with. Four of those
 * marks exist nowhere else in the box and are cut out of the board itself (see {@link IconImages});
 * the rest are the symbols the cards are already read with, and the Quest marker is the piece
 * itself, in the colour of whoever's board is being read.
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
      <Zone i18nKey="help.player-board.companions" note="help.type.3.note" mark={<CompanionIcon />} />
      <Zone i18nKey="help.player-board.items" note="help.type.2.note" mark={<ObjectIcon />} />
      <Zone i18nKey="help.player-board.stories" note="help.tell-story.note" mark={<StoryIcon />} />

      {/* Then the board itself, left to right: the income column, the two tracks, the right-hand panel. */}
      <Zone i18nKey="help.player-board.income" note="help.income-token.note" mark={<IncomeIcon />} />
      <Zone
        i18nKey="help.player-board.skills"
        note="help.player-board.skills.score"
        mark={
          <>
            <ForceIcon />
            <MagicIcon />
          </>
        }
      />
      {/* A choice between options, so a list like the Banquet and the Festival rather than a paragraph —
          and the options are counted off the rules, so that one taken away from them cannot leave a
          line behind (see `PlayerBoardHelp.spec`). */}
      <ZoneList
        i18nKey="help.player-board.special-action"
        count={specialActions.length}
        note="help.player-board.special-action.text"
        mark={<SpecialActionIcon />}
      />
      <Zone i18nKey="help.player-board.quests" note="help.quest.score" mark={<QuestMarkerIcon player={player} />} />
      <Zone i18nKey="help.player-board.villagers" mark={<VillagerIcon />} />
    </div>
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
