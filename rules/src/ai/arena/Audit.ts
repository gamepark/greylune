import { isCustomMove, playAction } from '@gamepark/rules-api'
import { GreyluneRules } from '../../GreyluneRules'
import { MaterialType } from '../../material/MaterialType'
import { VillageCard, VillageCardId } from '../../material/VillageCard'
import { GreyluneMove } from '../../rules/GreyluneRule'
import { RuleId } from '../../rules/RuleId'
import { currentYear } from '../../Year'
import { moveKey, rankMoves } from '../GreyluneAI'
import { GreyluneGame } from '../Simulation'
import { turnKind } from './Match'
import { PlatformGame } from './Replay'

/** A game recorded by the platform, and the players whose turns are to be weighed by the bot. */
export type AuditTask = { game: PlatformGame; players: number[] }

/** One turn of a human player, set against what the bot would have played in the same position. */
export type Decision = {
  game: string
  /** The index of the action in the recorded game: replaying the actions before it gives the position. */
  action: number
  player: string
  score: number
  year: number
  human: string
  bot: string
  /** The rank the bot gives the human's move, 1 being its own choice, or undefined when it does not weigh it at all. */
  rank?: number
  moves: number
  /** How much more the bot reckons its move is worth than the human's. */
  gap?: number
}

/** The card a move names, for the reader: the Object used, the card activated or the coins taken around. */
const detail = (game: GreyluneGame, move: GreyluneMove): string => {
  if (!isCustomMove(move) || typeof move.data !== 'object' || move.data === null || !('card' in move.data)) return ''
  const card = (move.data as { card?: number }).card
  if (card === undefined) return ''
  const front = new GreyluneRules(game).material(MaterialType.VillageCard).getItem<VillageCardId>(card)?.id.front
  return front === undefined ? '' : ` (${VillageCard[front]})`
}

/**
 * Replays a recorded game and, at every Spring and Summer turn of the players named, asks the bot
 * what it would have played: where good players and the bot part ways is where the evaluation is
 * worth reading.
 */
export const auditGame = ({ game: platform, players }: AuditTask): Decision[] => {
  const game: GreyluneGame = JSON.parse(JSON.stringify(platform.setup))
  const rules = new GreyluneRules(game)
  const decisions: Decision[] = []
  platform.actions.forEach((action, index) => {
    const ruleId = game.rule?.id
    const seat = platform.players.findIndex((player) => player.id === action.playerId)
    if ((ruleId === RuleId.Spring || ruleId === RuleId.Summer) && players.includes(seat)) {
      const ranked = rankMoves(game, action.playerId)
      const key = moveKey(rules, action.move)
      const position = ranked.findIndex((entry) => moveKey(rules, entry.move) === key)
      const season = RuleId[ruleId]
      decisions.push({
        game: platform._id,
        action: index,
        player: platform.players[seat].name,
        score: platform.players[seat].score ?? 0,
        year: currentYear(rules, platform.players.length),
        human: turnKind(season, action.move) + detail(game, action.move),
        bot: turnKind(season, ranked[0].move) + detail(game, ranked[0].move),
        rank: position < 0 ? undefined : position + 1,
        moves: ranked.length,
        gap: position < 0 ? undefined : ranked[0].value - ranked[position].value
      })
    }
    playAction(rules, action.move, action.playerId)
  })
  return decisions
}
