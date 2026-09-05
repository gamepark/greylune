import { PlayerColor } from '@gamepark/greylune/PlayerColor'

/**
 * The 4 identities of the game, sampled off the score markers — the one piece of a player printed in
 * their colour and nothing else. Anything the interface draws for a player rather than photographs
 * from the material is tinted with these, so that a panel and a marker on the track read as the same
 * player.
 */
export const playerColors: Record<PlayerColor, string> = {
  [PlayerColor.Blue]: '#00b2e2',
  [PlayerColor.Orange]: '#f8b130',
  [PlayerColor.Red]: '#cf2a2e',
  [PlayerColor.Purple]: '#81328a'
}
