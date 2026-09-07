import { css } from '@emotion/react'
import { colors, rgbOf } from './colors'

/**
 * The look every button the table draws for itself is cut from.
 *
 * The Village, the Event scroll and the cards are all parchment, ink and antique gold (see
 * {@link colors}). A button laid on that table is made of the same three rather than dropped on top
 * of it: a slip of parchment, lettered in ink, that the light catches once it is aimed at. The gaps
 * of the Village and the Event tile therefore share one surface, so that two things that do the same
 * job — put a Villager somewhere — look like the same thing.
 */
const ink = rgbOf(colors.ink)
const parchment = rgbOf(colors.parchment)
const gold = rgbOf(colors.gold)
const parchmentDeep = rgbOf(colors.parchmentDeep)
const parchmentLight = rgbOf(colors.parchmentLight)

/** At rest: quiet enough to leave what it is laid on legible. */
export const parchmentSurfaceCss = css`
  border: 0.06em solid rgba(${gold}, 0.7);
  background: linear-gradient(to bottom, rgba(${parchment}, 0.82), rgba(${parchmentDeep}, 0.86));
  box-shadow:
    0 0.05em 0.15em rgba(0, 0, 0, 0.35),
    inset 0 0 0.3em rgba(${gold}, 0.3);
  color: rgba(${ink}, 0.85);
  transition:
    background 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out,
    color 0.15s ease-in-out;
`

/** Aimed at: the parchment turns fresh, the gold frame takes the light and the ink goes black. */
export const parchmentLitCss = css`
  border-color: rgb(${gold});
  background: linear-gradient(to bottom, rgba(${parchmentLight}, 0.97), rgba(${parchment}, 0.97));
  box-shadow:
    0 0 0.5em 0.1em rgba(${gold}, 0.8),
    inset 0 0 0.45em rgba(255, 255, 255, 0.75);
  color: rgb(${ink});
  cursor: pointer;
`

/** What is lettered on parchment: bold, tight, and never smudged by the paper under it. */
export const parchmentLabelCss = css`
  font-weight: bold;
  line-height: 1.15;
  letter-spacing: 0.03em;
  text-shadow: 0 0.03em 0.06em rgba(255, 255, 255, 0.6);
`

/** A rule drawn between what an option costs and what it gives, in the ink of the label it sits in. */
export const parchmentArrowCss = css`
  margin: 0 0.35em;
  color: rgba(${ink}, 0.6);
`
