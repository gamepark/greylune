import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { BonusToken, bonusTokenGains } from '@gamepark/greylune/material/Tokens'
import { HeaderText, PlayMoveButton, useLegalMoves, useRules } from '@gamepark/react-game'
import { DeleteItem, isDeleteItemType } from '@gamepark/rules-api'
import { Alternatives } from './Alternatives'
import { GainsLabel } from '../components/Gains'

/**
 * Crossing 8 points, and then 20 (see {@link BonusTokenRule}).
 *
 * Written like the choice of a skill (see `ChooseSkillHeader`): "Gagnez <5 coins/> ou <1 force et
 * 1 magie/>", each gain the button spending the token that pays it. The tokens also wear the same
 * offer, an arrow pointing down at them (see `ChooseBonusButton`).
 */
export const BonusTokenHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const moves = useLegalMoves<DeleteItem>(isDeleteItemType(MaterialType.BonusToken))
  const tokens = rules.material(MaterialType.BonusToken)
  return (
    <>
      <HeaderText code="bonus" />
      {moves.length > 0 && (
        <Alternatives>
          {moves.map((move) => (
            <PlayMoveButton key={move.itemIndex} move={move}>
              <GainsLabel gains={bonusTokenGains[tokens.getItem<BonusToken>(move.itemIndex).id]} />
            </PlayMoveButton>
          ))}
        </Alternatives>
      )}
    </>
  )
}
