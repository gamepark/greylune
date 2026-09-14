import { isCustomMove, isCustomMoveType, isMoveItemType } from '@gamepark/rules-api'
import { GreyluneRules } from '../GreyluneRules'
import { MaterialType } from '../material/MaterialType'
import { PlayerColor } from '../PlayerColor'
import { CustomMoveType } from '../rules/CustomMoveType'
import { GreyluneMove } from '../rules/GreyluneRule'
import { LocationType } from '../material/LocationType'
import { RuleId } from '../rules/RuleId'
import { Assessment, evaluate } from './Evaluation'
import { GreyluneGame, simulate } from './Simulation'

/**
 * `budget`: how many moves the bot plays out on copies of the game before choosing one. A move costs
 * about half a millisecond, so a decision stays within a few tenths of a second. Over 48 games at 3
 * players, 800 moves scored about a point more than 300: the budget is not what the bot is short of.
 *
 * `branches`: how many of the most promising moves of a decision are followed further, when the budget
 * allows.
 */
export const searchSettings = { budget: 600, branches: 4, holdSpring: true }

/**
 * An automatic player for Greylune.
 *
 * A turn of Greylune is a chain of decisions — a Villager takes a card, the card sends the Adventurer
 * on the road, the road ends on an Encounter, the Encounter asks which of its sides is paid — and the
 * first link is only worth what the last one brings. So the bot plays every move out on a copy of the
 * game, consequences and all, and follows the most promising ones until the turn is over, within a
 * budget. The position each line ends on is priced by {@link evaluate}, which reads what the player
 * holds and what it is likely to turn into, and the move leading to the best of them is played.
 *
 * It never reads what a player could not: the turn of the year is never played out (see
 * {@link simulate}), and the evaluation only reads the table.
 */
export const GreyluneAI = async (game: GreyluneGame, player: PlayerColor): Promise<GreyluneMove[]> => {
  const move = chooseMove(game, player)
  return move ? [move] : []
}

/** The move the bot would play, exposed on its own so that it can be tested without a promise. */
export const chooseMove = (game: GreyluneGame, player: PlayerColor): GreyluneMove | undefined => rankMoves(game, player)[0]?.move

/**
 * Every distinct legal move with what the search found it worth, the best first, and the line of play
 * that worth was read at the end of.
 */
export const rankMoves = (game: GreyluneGame, player: PlayerColor): RankedMove[] => {
  const rules = new GreyluneRules(game)
  const moves = keepVillagersForSpring(game, player, distinctMoves(rules, rules.getLegalMoves(player)))
  if (moves.length <= 1) return moves.map((move) => ({ move, value: 0, line: [move] }))
  const search = new TurnSearch(player)
  const nodes = search.children(game, moves)
  search.deepen(nodes, searchSettings.budget - nodes.length)
  // On a tie, closing a window or a journey comes first: a card spent for nothing is a card lost.
  const passing = (move: GreyluneMove) => (isCustomMoveType(CustomMoveType.Pass)(move) ? 1 : 0)
  return nodes.map(({ move, value, leaf, line }) => ({ move, value, leaf, line })).sort((a, b) => b.value - a.value || passing(b.move) - passing(a.move))
}

export type RankedMove = { move: GreyluneMove; value: number; leaf?: GreyluneGame; line: GreyluneMove[] }

type SearchNode = { move: GreyluneMove; game?: GreyluneGame; turnOver: boolean; value: number; leaf?: GreyluneGame; line: GreyluneMove[] }

class TurnSearch {
  constructor(readonly player: PlayerColor) {}

  /** Every move played out, and the position it reaches priced as it stands. */
  children(game: GreyluneGame, moves: GreyluneMove[]): SearchNode[] {
    return moves.map((move) => {
      try {
        const { game: next, turnOver } = simulate(game, move)
        return { move, game: next, turnOver, value: evaluate(next, this.player), leaf: next, line: [move] }
      } catch {
        // A move the rules cannot play out is a move the bot has no business playing.
        return { move, turnOver: true, value: -Infinity, line: [move] }
      }
    })
  }

  /** The most promising lines that do not end the turn yet are followed further, sharing the budget. */
  deepen(nodes: SearchNode[], budget: number): void {
    const open = nodes.filter((node) => !node.turnOver && node.game).sort((a, b) => b.value - a.value)
    const followed = open.slice(0, searchSettings.branches)
    let left = budget
    followed.forEach((node, rank) => {
      const share = Math.floor(left / (followed.length - rank))
      const spent = this.follow(node, share)
      left -= spent
    })
  }

  /** Goes on with the decisions the move leaves to the same player, and returns how much of the budget it spent. */
  private follow(node: SearchNode, budget: number): number {
    const game = node.game!
    if (game.rule?.player !== this.player) return 0
    const rules = new GreyluneRules(game)
    const moves = distinctMoves(rules, rules.getLegalMoves(this.player))
    if (!moves.length || moves.length > budget) return 0
    const children = this.children(game, moves)
    this.deepen(children, budget - moves.length)
    const best = bestOf(children)
    if (best) {
      node.value = best.value
      node.leaf = best.leaf
      node.line = [node.move, ...best.line]
    }
    return budget
  }
}

/**
 * Moving on to Summer is never offered while the player still holds more Villagers than the rest of
 * their year can use and the Village still has a gap for them: a Villager that is never placed is an
 * action of the year thrown away, and no journey is worth that — the journey will still be there once
 * the Village has had its share.
 *
 * This is a rule rather than a measure on purpose. What a Villager placed will bring is only known in
 * Summer, and whatever the Summer offers right now is known exactly: weighed against each other, the
 * sure thing wins too often, and the bot sets off with half its Villagers in hand.
 */
const keepVillagersForSpring = (game: GreyluneGame, player: PlayerColor, moves: GreyluneMove[]): GreyluneMove[] => {
  if (!searchSettings.holdSpring || game.rule?.id !== RuleId.Spring) return moves
  const placements = moves.filter((move) => isMoveItemType(MaterialType.Villager)(move) && move.location.type === LocationType.VillageGap)
  if (!placements.length) return moves
  const assessment = new Assessment(game, player)
  if (assessment.active <= assessment.summerVillagerNeeds) return moves
  return moves.filter((move) => !isMoveItemType(MaterialType.SeasonMarker)(move))
}

const bestOf = (nodes: SearchNode[]): SearchNode | undefined => {
  let best: SearchNode | undefined
  for (const node of nodes) if (!best || node.value > best.value) best = node
  return best
}

/**
 * The legal moves, without the ones that only differ by which of two identical Villagers they name: a
 * Villager is as good as another standing in the same place, and playing both out would only spend the
 * budget twice on the same position.
 */
export const distinctMoves = (rules: GreyluneRules, moves: GreyluneMove[]): GreyluneMove[] => {
  const seen = new Set<string>()
  return moves.filter((move) => {
    const key = moveKey(rules, move)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const villagerPlace = (rules: GreyluneRules, index: number): string => {
  const { type, x, y, parent } = rules.material(MaterialType.Villager).getItem(index).location
  return JSON.stringify([type, x, y, parent])
}

const moveKey = (rules: GreyluneRules, move: GreyluneMove): string => {
  if (isMoveItemType(MaterialType.Villager)(move)) {
    return JSON.stringify(['villager', villagerPlace(rules, move.itemIndex), move.location])
  }
  if (isCustomMove(move) && typeof move.data === 'object' && move.data !== null && 'villager' in move.data) {
    const { villager, ...rest } = move.data as { villager: number }
    return JSON.stringify([move.type, villagerPlace(rules, villager), rest])
  }
  return JSON.stringify(move)
}
