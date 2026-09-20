import { MoveComponentContext } from '@gamepark/react-game'

/**
 * Some things the game does are several moves in a row that say one thing: a price paid in coins of 5
 * and of 1, 2 Villagers coming out of the reserve, the score markers of the final count. The journal
 * writes them down once, on the first move of the row, and counts the whole row there.
 *
 * The consequences of a move are played depth first (see `applyAutomaticMoves`), so the moves a single
 * gesture of the rules is made of are always next to each other in the action.
 */

/** The move played right before this one in the same action, if there is one. */
export const previousMove = <Move>(context: MoveComponentContext<Move>): Move | undefined => {
  const index = context.consequenceIndex
  if (index === undefined) return undefined
  return index === 0 ? context.action.move : context.action.consequences[index - 1]
}

/** This move, and the ones that follow it in the same action for as long as they belong with it. */
export const movesInRow = <Move>(context: MoveComponentContext<Move>, belongs: (move: Move) => boolean): Move[] => {
  const index = context.consequenceIndex
  const moves = index === undefined ? [context.action.move, ...context.action.consequences] : context.action.consequences.slice(index)
  const row: Move[] = []
  for (const move of moves) {
    if (!belongs(move)) break
    row.push(move)
  }
  return row
}
