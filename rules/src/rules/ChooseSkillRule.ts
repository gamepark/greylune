import { isMoveItemType, ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Gain, GainType } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule, SkillMarker } from './GreyluneRule'

const skillMarkers: SkillMarker[] = [MaterialType.StrengthMarker, MaterialType.MagicMarker]

/**
 * Force or Magic: what the cards that print the two gems side by side leave to the player. The choice
 * is the marker moved up its track, the Force one or the Magic one. A track already at 5 is still a
 * choice: what it has no room for is paid in victory points (see `GreyluneRule.gainSkill`), so it is
 * offered as those points. Both tracks full is no choice at all, and never reaches this rule.
 */
export class ChooseSkillRule extends GreyluneRule {
  get count(): number {
    const gain = this.remind<Gain>(Memory.CurrentGain)
    return gain && gain.type === GainType.Skill && typeof gain.count === 'number' ? gain.count : 1
  }

  getPlayerMoves(): GreyluneMove[] {
    return skillMarkers.flatMap((marker) => {
      const moves = this.moveSkillMarker(marker, this.count)
      return moves.length ? moves : [this.customMove(CustomMoveType.GainVp, this.count)]
    })
  }

  beforeItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    const marker = skillMarkers.find((marker) => isMoveItemType(marker)(move))
    if (marker) this.pushSkillOverflow(marker, this.count)
    return []
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    const marker = skillMarkers.find((marker) => isMoveItemType(marker)(move))
    return marker ? this.skillGained(marker, this.count) : []
  }
}
