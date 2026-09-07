/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react'
import { colors, rgbOf } from '../theme/colors'

/**
 * What being aimed at looks like: a ring of gold light around the pawn, breathing slowly so that it
 * reads as a state and not as a piece of the board. It is drawn over the Villager and lets every
 * pointer through, so the pawn underneath can still be clicked to let go of it, or dragged.
 */
export const SelectedVillager = () => <div css={ringCss} />

const gold = rgbOf(colors.gold)
const goldLight = rgbOf(colors.goldLight)

const breathe = keyframes`
  from {
    box-shadow:
      0 0 0.35em 0.05em rgba(${gold}, 0.75),
      inset 0 0 0.35em rgba(${goldLight}, 0.5);
  }
  to {
    box-shadow:
      0 0 0.7em 0.15em rgba(${goldLight}, 0.95),
      inset 0 0 0.6em rgba(${goldLight}, 0.8);
  }
`

const ringCss = css`
  width: 2.15em;
  height: 3.25em;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
  border: 0.1em solid rgba(${goldLight}, 0.95);
  border-radius: 0.9em;
  pointer-events: none;
  animation: ${breathe} 1.1s ease-in-out infinite alternate;
`
