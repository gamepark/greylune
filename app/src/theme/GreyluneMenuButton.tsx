/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { ItemButtonProps, ItemMenuButton } from '@gamepark/react-game'
import { HTMLAttributes, ReactNode } from 'react'
import { parchmentLabelCss, parchmentLitCss, parchmentSurfaceCss } from './parchment'

type Props = ItemButtonProps &
  HTMLAttributes<HTMLButtonElement> & {
    children?: ReactNode
  }

/**
 * The buttons laid over the material itself, cut from the same parchment as everything else the
 * interface draws (see {@link parchmentSurfaceCss}).
 *
 * A slip of parchment in a gold frame, lettered in ink, that the light catches once it is aimed at:
 * the Village gaps, the Event scroll and the menu discs are all the same three colours, so that
 * things doing the same job — put a Villager somewhere — look like the same thing.
 */
export const GreyluneMenuButton = (props: Props) => <ItemMenuButton css={menuButtonCss} {...props} />

const menuButtonCss = css`
  ${parchmentSurfaceCss};
  box-sizing: border-box;
  width: 2.2em;
  height: 2.2em;
  padding: 0;
  border-radius: 50%;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    ${parchmentLitCss};
  }

  &:disabled {
    filter: grayscale(0.8);
    opacity: 0.6;
    cursor: default;
  }

  > img {
    height: 1.3em;
  }

  > span {
    ${parchmentSurfaceCss};
    ${parchmentLabelCss};
    font-size: 0.8em;
    padding: 0.25em 0.5em;
    border-radius: 0.35em;
    width: max-content;
    /* Wide enough that the longest of them takes 2 lines and no more: on the ring of the Festival,
       where a label sits between the 2 above and below it, a third line would run into them. */
    max-width: 14em;
    white-space: normal;
    text-wrap: balance;
    text-align: center;
  }

  /**
   * A label with nothing to draw takes no room: the 2 Objects paying in points counted on what the
   * player owns are the only effects a figure and a symbol cannot say, and there the button is on
   * its own on a card offering nothing else, so the card is left to say it.
   */
  > span:empty {
    display: none;
  }
`
