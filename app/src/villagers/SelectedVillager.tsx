/** @jsxImportSource @emotion/react */
import { useDndMonitor } from '@dnd-kit/core'
import { css, keyframes } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { usePlay, useRules } from '@gamepark/react-game'
import { colors, rgbOf } from '../theme/colors'

/**
 * What being aimed at looks like: a ring of gold light around the pawn, breathing slowly so that it
 * reads as a state and not as a piece of the board. It is drawn over the Villager and lets every
 * pointer through, so the pawn underneath can still be clicked to let go of it, or dragged.
 */
export const SelectedVillager = () => {
  useUnselectOnDrag()
  return <div css={ringCss} />
}

/**
 * Aiming at a Villager and carrying one are the same decision made two ways, so the game never holds
 * both at once: the aim is let go of the moment a pawn is picked up, and the spaces then answer to
 * the hand alone (see `SelectVillager`). The ring is where this is watched for, being the one thing
 * on the table that exists exactly while a Villager is aimed at — and therefore the one thing certain
 * to be listening when a drag begins.
 */
const useUnselectOnDrag = () => {
  const rules = useRules<GreyluneRules>()
  const play = usePlay()
  useDndMonitor({
    onDragStart: () => {
      for (const move of rules?.material(MaterialType.Villager).selected().unselectItems() ?? []) play(move, { transient: true })
    }
  })
}

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

/**
 * The framework lifts every item menu 15 em clear of its item, so that a button is always within
 * reach of the pointer whatever it is laid over (see {@link ItemMenuWrapper}). This is no button: it
 * is a mark drawn on the pawn, and it gives that lift back. Kept, a Villager standing in the Village
 * — which is drawn high already, to clear the board the grid bites into — would wear its ring over
 * the buttons the cards beside it are wearing. A hair of it is left, enough to stay over the pawn the
 * ring is drawn around and nothing else.
 */
const menuLift = 15
const overPawn = 0.5

const ringCss = css`
  width: 2.15em;
  height: 3.25em;
  transform: translate(-50%, -50%) translateZ(${overPawn - menuLift}em);
  box-sizing: border-box;
  border: 0.1em solid rgba(${goldLight}, 0.95);
  border-radius: 0.9em;
  pointer-events: none;
  animation: ${breathe} 1.1s ease-in-out infinite alternate;
`
