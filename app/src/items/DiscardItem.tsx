/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialMove } from '@gamepark/rules-api'
import { itemActionSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

/**
 * What an Object of the player's own wears while one of them has to go (see `DiscardItemRule`): the
 * offer to give up this one. Every Object the player holds wears it, the one just bought included.
 * A red cross and no word: the header already says an Object is to be discarded, and the button is
 * then the whole of the question — this one, or not this one.
 */
export const DiscardItemButton = ({ move }: { move: MaterialMove }) => (
  <GreyluneMenuButton x={itemActionSpot.x} y={itemActionSpot.y} move={move}>
    <FontAwesomeIcon icon={faXmark} css={crossCss} />
  </GreyluneMenuButton>
)

const crossCss = css`
  color: #b3261e;
  font-size: 1.3em;
`
