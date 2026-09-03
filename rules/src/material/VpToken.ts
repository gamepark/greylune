import { PlayerColor } from '../PlayerColor'

/**
 * A victory point token is double-sided, and its value is the side it starts on: the 25 turns over
 * to 50, the 75 to 100.
 */
export enum VpTokenValue {
  Vp25 = 25,
  Vp75 = 75
}

/**
 * A player's victory point token: the hundreds digit is the {@link PlayerColor} and the rest the
 * {@link VpTokenValue}, so Blue owns 125 and 175, Purple 425 and 475.
 *
 * The colour is part of the id because the tokens start away from their owner — the four 25s pile
 * up on one shield at the foot of the score track and the four 75s on the other — and a player
 * takes their own out of the pile the first time they cross that many points.
 */
export type VpToken = number

export const getVpToken = (player: PlayerColor, value: VpTokenValue): VpToken => player * 100 + value

export const getVpTokenPlayer = (token: VpToken): PlayerColor => Math.floor(token / 100)

export const getVpTokenValue = (token: VpToken): VpTokenValue => token % 100
