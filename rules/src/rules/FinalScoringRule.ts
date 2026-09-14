import { MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialSource } from '../material/MaterialSource'
import { MaterialType } from '../material/MaterialType'
import { companionsScore, itemsScore, playerVp, questScore, skillScore } from '../material/PlayerState'
import { PlayerColor } from '../PlayerColor'
import { GreyluneMove, scoreMoves } from './GreyluneRule'
import { RuleId } from './RuleId'

type Count = { rule: RuleId; score: (source: MaterialSource, player: PlayerColor) => number }

/** What is added to the points scored along the way, in the order of the rulebook (p.13). */
export const finalScoring: Count[] = [
  { rule: RuleId.QuestsScoring, score: questScore },
  { rule: RuleId.CompanionsScoring, score: companionsScore },
  { rule: RuleId.ItemsScoring, score: itemsScore },
  { rule: RuleId.SkillsScoring, score: skillScore }
]

/**
 * The end of the game, once the 5th year is over: every player walks their marker up the score track
 * with what the game has not paid them yet (rulebook p.13).
 *
 * One rule per count, every player counted in it before the next one starts, so the step being played
 * is what the table is adding up. Nothing has to be remembered along the way: what a count is worth is
 * read off the Quest markers, the cards and the skill tracks, and counting only ever moves the score.
 */
export class FinalScoringRule extends MaterialRulesPart<PlayerColor, MaterialType, LocationType, RuleId> {
  onRuleStart(): GreyluneMove[] {
    const step = finalScoring.findIndex(({ rule }) => rule === this.game.rule?.id)
    const next = finalScoring[step + 1]
    return [
      ...this.game.players.flatMap((player) => {
        const points = finalScoring[step].score(this, player)
        return points ? scoreMoves(this, player, playerVp(this, player) + points) : []
      }),
      next ? this.startRule(next.rule) : this.endGame()
    ]
  }
}

/**
 * What the score track does not show yet: every count while the game is being played, the counts not
 * reached yet while it is being counted, and nothing once it is over.
 *
 * @param rule The rule being played, `undefined` once the game is over.
 */
export const scoreStillToCount = (source: MaterialSource, player: PlayerColor, rule?: RuleId): number => {
  if (rule === undefined) return 0
  const step = Math.max(0, finalScoring.findIndex((count) => count.rule === rule))
  return finalScoring.slice(step).reduce((total, { score }) => total + score(source, player), 0)
}
