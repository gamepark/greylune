/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialMove, XYCoordinates } from '@gamepark/rules-api'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

/**
 * What every tilted card of the player's own wears while one of them is to be straightened, Objects
 * and Companions alike. An arrow turning back and no word: the header already says a card is to be
 * straightened, and the button is then the whole of the question — this one, or not this one.
 */
export const StraightenCardButton = ({ move, x, y }: XYCoordinates & { move: MaterialMove }) => (
  <GreyluneMenuButton x={x} y={y} move={move}>
    <FontAwesomeIcon icon={faRotateLeft} css={arrowCss} />
  </GreyluneMenuButton>
)

const arrowCss = css`
  font-size: 1.3em;
`
