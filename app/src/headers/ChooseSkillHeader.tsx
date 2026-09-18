import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { force as forceGain, magic as magicGain, vp } from '@gamepark/greylune/material/Effect'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { ChooseSkillRule } from '@gamepark/greylune/rules/ChooseSkillRule'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { HeaderText, PlayMoveButton, useLegalMove, useRules } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType } from '@gamepark/rules-api'
import { Alternatives } from './Alternatives'
import { GainLabel } from '../components/Gains'

/**
 * The two gems printed side by side on a card (see {@link ChooseSkillRule}).
 *
 * The choice is the marker moved up its track, but the tracks give no space to drop it on, so both
 * gains close the sentence: "Gagnez <force-up/> ou <magic-up/>". They are written as the gain they are
 * and carry no word at all (see {@link GainLabel}). A track already at 5 pays in victory points
 * instead, so its gain is written as those points, in its place in the sentence.
 */
export const ChooseSkillHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const force = useLegalMove(isMoveItemType(MaterialType.StrengthMarker))
  const magic = useLegalMove(isMoveItemType(MaterialType.MagicMarker))
  const points = useLegalMove(isCustomMoveType(CustomMoveType.GainVp))
  const count = new ChooseSkillRule(rules.game).count
  return (
    <>
      <HeaderText code="skill" />
      <Alternatives>
        <PlayMoveButton move={force ?? points}>
          <GainLabel gain={force ? forceGain(count) : vp(count)} />
        </PlayMoveButton>
        <PlayMoveButton move={magic ?? points}>
          <GainLabel gain={magic ? magicGain(count) : vp(count)} />
        </PlayMoveButton>
      </Alternatives>
    </>
  )
}
