import { isEndGame, isStartPlayerTurn, isStartRule, MaterialGame } from '@gamepark/rules-api'
import { GreyluneRules } from '../GreyluneRules'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { PlayerColor } from '../PlayerColor'
import { GreyluneMove } from '../rules/GreyluneRule'
import { RuleId } from '../rules/RuleId'

export type GreyluneGame = MaterialGame<PlayerColor, MaterialType, LocationType, RuleId>

/** A move played out on a copy of the game, and whether the turn of the player it was played for is over. */
export type Simulation = { game: GreyluneGame; turnOver: boolean }

/**
 * Plays a move on a copy of the game, with everything that follows from it, up to the next decision.
 *
 * It stops short of four moves, and plays none of them: the turn ending, the turn passing to somebody,
 * the turn of the year and the final count. Past those, the position no longer belongs to the action being weighed —
 * and the count would add to the score track what the evaluation already reckons with on its own.
 * Winter above all: it deals the next year off the two decks, whose faces no player can read, and a bot
 * that played it out would be choosing on cards it is not allowed to see.
 */
export const simulate = (game: GreyluneGame, move: GreyluneMove): Simulation => {
  const next: GreyluneGame = JSON.parse(JSON.stringify(game))
  const rules = new GreyluneRules(next)
  const queue: GreyluneMove[] = [move]
  let played = 0
  while (queue.length) {
    const current = queue.shift()!
    if (isStartPlayerTurn(current) || isEndGame(current) || (isStartRule(current) && (current.id === RuleId.EndTurn || current.id === RuleId.Winter || current.id === RuleId.QuestsScoring))) {
      return { game: next, turnOver: true }
    }
    if (++played > 2000) throw new Error('Infinite loop detected while simulating a move')
    queue.unshift(...(rules.play(JSON.parse(JSON.stringify(current))) ?? []))
  }
  return { game: next, turnOver: false }
}
