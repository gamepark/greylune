import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { BonusToken } from '@gamepark/greylune/material/Tokens'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { HeaderText, PlayMoveButton, useLegalMoves, useRules } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Alternatives } from './Alternatives'
import { BonusTokenIcon } from './Icons'

/**
 * Crossing 8 points, and then 20 (see {@link BonusTokenRule}).
 *
 * The tokens a player has left are what the sentence offers, one after the other, each of them shown
 * as its own face: what a token pays is printed on it, so there is nothing to translate — the token
 * says it in every language.
 */
export const BonusTokenHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const moves = useLegalMoves<CustomMove>(isCustomMoveType(CustomMoveType.ChooseBonus))
  return (
    <>
      <HeaderText code="bonus" />
      <Alternatives>
        {moves.map((move) => (
          <PlayMoveButton key={move.data as number} move={move}>
            <BonusTokenIcon token={rules.material(MaterialType.BonusToken).getItem(move.data as number).id as BonusToken} />
          </PlayMoveButton>
        ))}
      </Alternatives>
    </>
  )
}
