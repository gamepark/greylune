import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { force as forceGain, magic as magicGain } from '@gamepark/greylune/material/Effect'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { ChooseSkillRule } from '@gamepark/greylune/rules/ChooseSkillRule'
import { HeaderText, PlayMoveButton, useLegalMove, useRules } from '@gamepark/react-game'
import { isMoveItemType } from '@gamepark/rules-api'
import { Alternatives } from './Alternatives'
import { GainLabel } from '../components/Gains'

/**
 * The two gems printed side by side on a card (see {@link ChooseSkillRule}).
 *
 * The choice is the marker moved up its track, but the tracks give no space to drop it on, so both
 * gains close the sentence: "Gagnez <force-up/> ou <magic-up/>". They are written as the gain they are
 * and carry no word at all (see {@link GainLabel}), and a track already at 5 simply drops out of the
 * sentence, which says more than an explanation of why it cannot be picked.
 */
export const ChooseSkillHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const force = useLegalMove(isMoveItemType(MaterialType.StrengthMarker))
  const magic = useLegalMove(isMoveItemType(MaterialType.MagicMarker))
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
