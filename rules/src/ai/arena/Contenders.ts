import { GreyluneRules } from '../../GreyluneRules'
import { PlayerColor } from '../../PlayerColor'
import { GreyluneMove } from '../../rules/GreyluneRule'
import { evaluate, evaluationSettings } from '../Evaluation'
import { chooseMove, distinctMoves, searchSettings } from '../GreyluneAI'
import { GreyluneGame, simulate } from '../Simulation'
import { Random } from './Random'

/**
 * A seat at the arena: how it chooses its move. `random` is the stream of its own table and seat, so
 * that a contender which draws lots plays the same game again from the same seed.
 */
export type Contender = (game: GreyluneGame, player: PlayerColor, random: Random) => GreyluneMove

type Settings = Partial<typeof searchSettings> & Partial<typeof evaluationSettings>

/**
 * The bot with some of its {@link searchSettings} and {@link evaluationSettings} changed, and only for
 * its own decisions: the settings are shared by the whole module, so they are put back as soon as it
 * has chosen.
 */
const bot =
  (settings: Settings = {}): Contender =>
  (game, player) => {
    const saved = [{ ...searchSettings }, { ...evaluationSettings }]
    for (const [key, value] of Object.entries(settings)) {
      Object.assign(key in searchSettings ? searchSettings : evaluationSettings, { [key]: value })
    }
    try {
      return chooseMove(game, player)!
    } finally {
      Object.assign(searchSettings, saved[0])
      Object.assign(evaluationSettings, saved[1])
    }
  }

/** Any legal move, drawn evenly. */
const random: Contender = (game, player, random) => {
  const moves = new GreyluneRules(game).getLegalMoves(player)
  return moves[random.below(moves.length)]
}

/**
 * The bot without its search: every move is played out up to the next decision and the position it
 * reaches is priced, nothing further. Whatever the search adds to the evaluation shows in its gap to
 * this one.
 */
const greedy: Contender = (game, player) => {
  const rules = new GreyluneRules(game)
  let best: { move: GreyluneMove; value: number } | undefined
  for (const move of distinctMoves(rules, rules.getLegalMoves(player))) {
    let value: number
    try {
      value = evaluate(simulate(game, move).game, player)
    } catch {
      value = -Infinity
    }
    if (!best || value > best.value) best = { move, value }
  }
  return best!.move
}

/** What a journey of a year to come was worth before it was measured on the recorded games. */
const OLD_TRAVEL_VALUES = [0, 1.8, 2.6, 3.2, 3.6, 4, 4.2, 4.4, 4.5]

/**
 * Every opponent the arena knows, by the name the command line gives it.
 *
 * - `bot`: the automatic player as it is shipped.
 * - `bot-300`, `bot-1200`: the same with a smaller or a larger search budget.
 * - `rusher`: the same without the rule that keeps it in Spring while it has Villagers to spare. It
 *   sets off as soon as the journey looks worth it, which is the style that punishes a slow table.
 * - `unshared`: the same, its journeys of a year each counting the best Encounter as if alone (see
 *   `evaluationSettings.shareJourneys`), as the bot did before they shared the row.
 * - `old-travel`: the same, a journey of a year to come worth what it was before it was measured on
 *   the recorded games (see `evaluationSettings.travelValues`).
 * - `original`: both of the above, the bot as it was before the arena.
 * - `greedy`: one step deep.
 * - `random`: the floor.
 */
export const contenders: Record<string, Contender> = {
  bot: bot(),
  'bot-300': bot({ budget: 300 }),
  'bot-1200': bot({ budget: 1200 }),
  rusher: bot({ holdSpring: false }),
  unshared: bot({ shareJourneys: false }),
  'old-travel': bot({ travelValues: OLD_TRAVEL_VALUES }),
  original: bot({ shareJourneys: false, travelValues: OLD_TRAVEL_VALUES }),
  greedy,
  random
}
