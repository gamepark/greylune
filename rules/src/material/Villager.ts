import { range } from 'es-toolkit'
import { PlayerColor } from '../PlayerColor'

/** Every player owns 7 Villagers, and no two of them are sculpted alike. */
export const VILLAGERS_PER_PLAYER = 7

/**
 * A Villager is a player's, and one of their 7 figures: the tens digit is the {@link PlayerColor},
 * the unit the figure, so Blue owns 11 to 17 and Purple 41 to 47.
 *
 * Both halves are needed. The colour says whose the Villager is, and the figure is what the player
 * recognises it by: the same Villager keeps its face for the whole game, whether it is standing in
 * the Village, resting in the camp or still waiting in the reserve.
 */
export type Villager = number

export const getVillager = (player: PlayerColor, figure: number): Villager => player * 10 + figure

export const getVillagerPlayer = (villager: Villager): PlayerColor => Math.floor(villager / 10)

export const getVillagerFigure = (villager: Villager): number => villager % 10

/** The 7 Villagers of a player, in the order they are punched. */
export const playerVillagers = (player: PlayerColor): Villager[] =>
  range(1, VILLAGERS_PER_PLAYER + 1).map((figure) => getVillager(player, figure))
