import { GreyluneRules } from '../../GreyluneRules'
import { PlayerColor } from '../../PlayerColor'
import { GreyluneMove } from '../../rules/GreyluneRule'
import { GreyluneGame } from '../Simulation'
import { GameRecord, Recorder } from './Match'

/** The part of a game exported by the platform that the replay reads. */
export type PlatformGame = {
  _id: string
  setup: GreyluneGame
  state?: { rule?: unknown }
  players: { id: PlayerColor; name: string; quit?: boolean; score?: number }[]
  actions: { playerId: PlayerColor; move: GreyluneMove }[]
}

/** The band a human seat is filed under, by the score it reached: what 90-point games do differently. */
const band = (score: number): string => (score >= 85 ? 'human 85+' : score >= 70 ? 'human 70-84' : 'human <70')

/**
 * Plays the games recorded by the platform again with the rules as they are now, and writes down
 * what every player did, exactly as the arena does for its contenders.
 *
 * Only the games played to the end by everybody are kept: a player who quit was replaced by a bot.
 * A game whose replay does not reach the scores the platform recorded was played under rules that
 * have changed since, and is reported as failed rather than read.
 */
export const replayGames = (games: PlatformGame[]): GameRecord[] =>
  games
    .filter((game) => !game.state?.rule && !game.players.some((player) => player.quit))
    .map((platform, index): GameRecord => {
      const start = Date.now()
      const game: GreyluneGame = JSON.parse(JSON.stringify(platform.setup))
      const recorder = new Recorder(game, platform.players.map((player) => player.id))
      const lineup = platform.players.map((player) => player.name)
      const record = { seed: 0, rotation: index, lineup, players: lineup.length, decisions: 0, ms: 0, seats: [], offered: [] }
      try {
        for (const action of platform.actions) recorder.play(action.move, action.playerId)
      } catch (e) {
        return { ...record, error: `${platform._id} does not replay: ${e instanceof Error ? e.message : e}` }
      }
      const rules = new GreyluneRules(game)
      const differ = platform.players.filter((player) => rules.getScore(player.id) !== player.score)
      if (game.rule || differ.length) return { ...record, error: `${platform._id} replays to other scores: the rules have changed since` }
      const seats = recorder.seats((_, seat) => band(platform.players[seat].score!)).map((seat, index) => ({ ...seat, name: lineup[index] }))
      return { ...record, seats, offered: recorder.offered, decisions: recorder.decisions, ms: Date.now() - start }
    })
