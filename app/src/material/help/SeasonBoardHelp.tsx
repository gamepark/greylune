/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { Season } from '@gamepark/greylune/Season'
import { currentYear, YEARS, yearPeriod } from '@gamepark/greylune/Year'
import { useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import { SeasonIcon, SeasonMarkerIcon, WithdrawIcon } from '../../components/Icons'
import { colors } from '../../theme/colors'
import { Zone, ZoneList } from './BoardLegend'
import { HelpFact, HelpFacts, HelpTitle, helpDialogCss, romanNumeral } from './HelpLayout'

/**
 * The lines of each column of the Season board: the actions of Spring and Summer and the steps of
 * Winter and Autumn, as the rulebook lists them (pp.5-9) and in its words, which is also the order
 * the columns print them in.
 *
 * The rules hold no list of either to count them off, so they are counted here, and checked against
 * the translation files (see `SeasonBoardHelp.spec`). Two counts differ from the icons. Summer prints
 * the Event twice, once for a Villager from the Village and once for an active one, and it is one line
 * here: the rulebook lists it once, as the same action taken once a year. Winter has one line more than
 * it prints: the season markers set back on Spring, which the rulebook lists first.
 */
const seasonLines: Record<Season, number> = {
  [Season.Winter]: 6,
  [Season.Spring]: 3,
  [Season.Summer]: 6,
  [Season.Autumn]: 4
}

/**
 * What the Season board holds: the same legend as the personal board (see {@link BoardLegend}), for
 * the calendar everybody shares.
 *
 * The board is 4 scrolls of icons, one per season, and they are the whole of what a player may do on
 * their turn. So the dialog is mostly those scrolls written out, one list each, under the banner the
 * column wears — the snowflake, the flower, the sun and the leaf. They come after the markers, which
 * say which of the 4 lists a player is reading from, and before the camp, which the Summer fills and
 * the Autumn empties.
 *
 * The figures at the top are the ones the board cannot print: which of the 5 years is being played,
 * and the period it belongs to, which is the back of the cards it deals.
 */
export const SeasonBoardHelp = () => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  if (rules === undefined) return null
  const year = Math.max(1, currentYear(rules, rules.players.length))

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={colors.gold} name={t('help.season-board.name')} />

      <HelpFacts>
        <HelpFact label={t('help.season-board.year')}>
          {year}/{YEARS}
        </HelpFact>
        <HelpFact label={t('help.season-board.period')}>{romanNumeral[yearPeriod(year)]}</HelpFact>
      </HelpFacts>

      <Zone i18nKey="help.season-board.markers" mark={<SeasonMarkerIcon />} />
      <ZoneList
        i18nKey="help.season-board.winter"
        count={seasonLines[Season.Winter]}
        note="help.season-board.winter.text"
        mark={<SeasonIcon season={Season.Winter} />}
      />
      <ZoneList i18nKey="help.season-board.spring" count={seasonLines[Season.Spring]} mark={<SeasonIcon season={Season.Spring} />} />
      <ZoneList i18nKey="help.season-board.summer" count={seasonLines[Season.Summer]} mark={<SeasonIcon season={Season.Summer} />} />
      <ZoneList
        i18nKey="help.season-board.autumn"
        count={seasonLines[Season.Autumn]}
        note="help.season-board.autumn.text"
        mark={<SeasonIcon season={Season.Autumn} />}
      />
      <Zone i18nKey="help.season-board.camp" mark={<WithdrawIcon />} />
    </div>
  )
}
