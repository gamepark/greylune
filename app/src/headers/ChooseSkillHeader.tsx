import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { force as forceGain, magic as magicGain } from '@gamepark/greylune/material/Effect'
import { ChooseSkillRule } from '@gamepark/greylune/rules/ChooseSkillRule'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { HeaderText, PlayMoveButton, useLegalMove, useRules } from '@gamepark/react-game'
import { isCustomMoveType, MaterialMove } from '@gamepark/rules-api'
import { Alternatives } from './Alternatives'
import { GainLabel } from '../components/Gains'

/** Force, or Magic: the move carries `true` for the one and `false` for the other. */
const chooses = (isForce: boolean) => (move: MaterialMove) => isCustomMoveType(CustomMoveType.ChooseSkill)(move) && move.data === isForce

/**
 * The two gems printed side by side on a card (see {@link ChooseSkillRule}).
 *
 * Nothing on the table stands for the choice — the tracks are where the marker ends up, not where it
 * is picked — so both gains close the sentence: "Gagnez <force-up/> ou <magic-up/>". They are written
 * as the gain they are and carry no word at all (see {@link GainLabel}), and a track already at 5
 * simply drops out of the sentence, which says more than an explanation of why it cannot be picked.
 */
export const ChooseSkillHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const force = useLegalMove(chooses(true))
  const magic = useLegalMove(chooses(false))
  const count = new ChooseSkillRule(rules.game).count
  return (
    <>
      <HeaderText code="skill" />
      <Alternatives>
        {force && (
          <PlayMoveButton move={force}>
            <GainLabel gain={forceGain(count)} />
          </PlayMoveButton>
        )}
        {magic && (
          <PlayMoveButton move={magic}>
            <GainLabel gain={magicGain(count)} />
          </PlayMoveButton>
        )}
      </Alternatives>
    </>
  )
}
