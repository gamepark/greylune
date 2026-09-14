/** @jsxImportSource @emotion/react */
import { bonusTokenGains, BonusToken } from '@gamepark/greylune/material/Tokens'
import { MaterialMove } from '@gamepark/rules-api'
import { GainsLabel } from '../components/Gains'
import { VpIcon } from '../components/Icons'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

/**
 * What a Bonus token of the player's own wears while one of them is to be spent: the offer to spend
 * this one. It says what the token pays the way every other button of the game says what it hands
 * over — a figure and a symbol, no word (see {@link GainsLabel}) — and carries the laurel, because
 * reaching the points is what spends it.
 */
export const ChooseBonusButton = ({ token, move }: { token: BonusToken; move: MaterialMove }) => (
  <GreyluneMenuButton x={2} y={0} move={move} label={<GainsLabel gains={bonusTokenGains[token]} />} labelPosition="right">
    <VpIcon />
  </GreyluneMenuButton>
)
