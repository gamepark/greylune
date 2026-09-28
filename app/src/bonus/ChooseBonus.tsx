/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialMove } from '@gamepark/rules-api'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

/**
 * What a Bonus token of the player's own wears while one of them is to be spent: the offer to spend
 * this one. An arrow pointing down at it and no word: the token says what it pays, and the header
 * lists the same choices written out (see `BonusTokenHeader`).
 */
export const ChooseBonusButton = ({ move }: { move: MaterialMove }) => (
  <GreyluneMenuButton x={0} y={-2.3} move={move}>
    <FontAwesomeIcon icon={faArrowDown} css={arrowCss} />
  </GreyluneMenuButton>
)

const arrowCss = css`
  font-size: 1.3em;
`
