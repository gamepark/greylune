import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { playerColors } from '../PlayerColors'
import { colors } from '../theme/colors'

/**
 * What tells whose entry it is, beyond the name written in it: the colour of the player, sampled off
 * their score marker (see {@link playerColors}), framed with the filigree gold of the card backs.
 *
 * The 4 colours are bright enough that the white text of the journal would not read over them, so
 * they are mixed towards black rather than picked a second time: a colour corrected in one place
 * keeps an entry that matches the panel.
 */
export const playerLogCss = (player?: PlayerColor) => {
  if (player === undefined) return undefined
  return css`
    background-color: ${darken(playerColors[player], logColorRatio)};
    box-shadow: inset 0 0 0 0.1em ${colors.gold};
    color: white;
  `
}

/**
 * What belongs to nobody — a new year laid out, the final count — in the emerald the whole interface
 * is drawn in, so that it reads as the table speaking rather than as one of the players.
 */
export const tableLogCss = css`
  background-color: ${colors.emeraldDeep};
  box-shadow: inset 0 0 0 0.1em ${colors.gold};
  color: ${colors.goldLight};
`

/** How much of the colour of the player is left once it is mixed with black, low enough for white text to read over. */
const logColorRatio = 0.45

const darken = (color: string, ratio: number): string => {
  const value = parseInt(color.slice(1), 16)
  const channel = (shift: number) => Math.round(((value >> shift) & 0xff) * ratio)
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`
}

/**
 * A symbol drawn inline in a sentence. The icons are sized for the header bar, where they stand as
 * high as the capitals; the journal is read at a smaller size, and the gems and the laurel would be
 * lost in it at 1 em.
 */
export const logIconCss = css`
  && {
    height: 1.4em;
    vertical-align: -0.35em;
  }
`
