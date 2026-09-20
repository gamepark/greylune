/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { EventTile } from '@gamepark/greylune/material/EventTile'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { finalScoring } from '@gamepark/greylune/rules/FinalScoringRule'
import { GreyluneMove } from '@gamepark/greylune/rules/GreyluneRule'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { currentYear } from '@gamepark/greylune/Year'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem, StartRule } from '@gamepark/rules-api'
import { FirstPlayerMoon } from '../../images/IconImages'
import { scoreOwner } from '../logRows'
import { LogText } from '../LogText'
import { EventTileName, PiecePicture } from '../MaterialLinks'

/** What the table does on its own: the years it lays out, and the count at the end of the last one. */

/**
 * Winter opens a new year. Which one is read off the Encounter deck, which is the calendar of the game
 * (see {@link currentYear}): this is played before the row of the new year is dealt off it.
 */
export const NewYearLog = ({ context }: MaterialLogProps<StartRule>) => (
  <LogText code="log.new-year" values={{ year: currentYear(new GreyluneRules(context.game), context.game.players.length) + 1 }} />
)

/** The Event of the new year, turned face up on top of the pile: whoever turns it up, the move says what it is. */
export const EventRevealLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const tile = (move.reveal?.id ?? new GreyluneRules(context.game).material(MaterialType.EventTile).getItem(move.itemIndex).id) as EventTile | undefined
  return <LogText code="log.event-reveal" components={{ tile: <EventTileName tile={tile} /> }} />
}

/** The first player token passes to the left, and the new year opens on whoever it reaches. */
export const FirstPlayerLog = ({ move }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(move.location.player)
  return <LogText code="log.first-player" values={{ player }} components={{ token: <PiecePicture src={FirstPlayerMoon} /> }} />
}

const scoringCodes: Partial<Record<RuleId, string>> = {
  [RuleId.QuestsScoring]: 'log.scoring.quests',
  [RuleId.CompanionsScoring]: 'log.scoring.companions',
  [RuleId.ItemsScoring]: 'log.scoring.items',
  [RuleId.SkillsScoring]: 'log.scoring.skills'
}

/** One line of the final count, in the order of the rulebook (p.13). */
export const ScoringLog = ({ move }: MaterialLogProps<StartRule>) => <LogText code={scoringCodes[move.id as RuleId] ?? ''} />

/**
 * What that line is worth to one player. The score moves up the track in up to 3 moves — the token of the
 * laps given back, the next one taken, the marker — and is written down once, with what the line counts,
 * which is read off the cards and the markers that nothing in the count moves.
 */
export const ScorePointsLog = ({ move, context }: MaterialLogProps<GreyluneMove>) => {
  const rules = new GreyluneRules(context.game)
  const owner = scoreOwner(move, rules)
  const player = usePlayerName(owner)
  const count = finalScoring.find(({ rule }) => rule === context.game.rule?.id)
  const points = owner === undefined || count === undefined ? 0 : count.score(rules, owner)
  return <LogText code="log.score" values={{ player, count: points }} />
}
