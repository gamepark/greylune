/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { playerVp } from '@gamepark/greylune/material/PlayerState'
import { BonusToken } from '@gamepark/greylune/material/Tokens'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { usePlayerName, useRules } from '@gamepark/react-game'
import { getEnumValues } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { BonusTokenIcon, CoinIcon, EventIcon, GreyluneIcon, QuestIcon, TravelIcon, VpIcon } from '../../components/Icons'
import { colors } from '../../theme/colors'
import { Zone } from './BoardLegend'
import { HelpFact, HelpFacts, HelpTitle, helpDialogCss } from './HelpLayout'

/**
 * What the main board holds, zone by zone: the same legend as the personal board (see
 * {@link BoardLegend}), for the board everybody shares.
 *
 * It reads the way the board is laid out: the score track down the left edge first, with the two
 * thresholds that hand out a Bonus token, then the map, walked from Greylune outwards like the
 * Adventurer walks it — the road, the two areas that pay for stopping there, the three that carry a
 * Heroic Quest — and last the Event, the one thing on the map that is not on the road.
 *
 * The marks are the symbols the board prints, and where it prints a piece, the piece: the rider
 * between two areas, the banner over Greylune, the coin and the laurel beside the two nearest banners
 * of the road, the back of the tiles that lie on it. The Bonus tokens are the three faces a player
 * has beside their own board, since the board only prints a question mark where they are spent.
 *
 * What the pieces lying on the board do has a dialog of its own — the Quest tiles, the Event tile —
 * so the sentences here are about the places, and the rules they share with those dialogs are quoted
 * from them (`help.quest.note`, `help.event.note`, `help.encounter.note`), never copied.
 *
 * The figures at the top are the scores, which are the one thing the track cannot say: past 24 the
 * marker goes round again, and the laps are counted by a token lying beside the player's own board.
 */
export const MainBoardHelp = () => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  if (rules === undefined) return null

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={colors.gold} name={t('help.main-board.name')} />

      <HelpFacts>
        {rules.players.map((player) => (
          <Score key={player} player={player} rules={rules} />
        ))}
      </HelpFacts>

      <Zone i18nKey="help.main-board.score" note="help.main-board.score.note" mark={<VpIcon />} />
      <Zone
        i18nKey="help.main-board.bonus"
        mark={getEnumValues(BonusToken).map((token) => (
          <BonusTokenIcon key={token} token={token} />
        ))}
      />

      <Zone i18nKey="help.main-board.village" mark={<GreyluneIcon />} />
      <Zone i18nKey="help.main-board.road" note="help.encounter.note" mark={<TravelIcon />} />
      <Zone
        i18nKey="help.main-board.stops"
        mark={
          <>
            <CoinIcon />
            <VpIcon />
          </>
        }
      />
      <Zone i18nKey="help.main-board.quests" note="help.quest.note" mark={<QuestIcon />} />
      <Zone i18nKey="help.main-board.event" note="help.event.note" mark={<EventIcon />} />
    </div>
  )
}

/** A player's score, marker and token together (see {@link playerVp}). */
const Score = ({ player, rules }: { player: PlayerColor; rules: GreyluneRules }) => {
  const name = usePlayerName(player)
  return (
    <HelpFact label={name}>
      {playerVp(rules, player)} <VpIcon />
    </HelpFact>
  )
}
