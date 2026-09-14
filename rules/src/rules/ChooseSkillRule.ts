import { isMoveItemType, ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Gain, GainType } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { GreyluneMove, GreyluneRule, SkillMarker } from './GreyluneRule'

const skillMarkers: SkillMarker[] = [MaterialType.StrengthMarker, MaterialType.MagicMarker]

/**
 * Force or Magic: what the cards that print the two gems side by side leave to the player. The choice
 * is the marker moved up its track, the Force one or the Magic one; a track already at 5 is not offered.
 */
export class ChooseSkillRule extends GreyluneRule {
  get count(): number {
    const gain = this.remind<Gain>(Memory.CurrentGain)
    return gain && gain.type === GainType.Skill && typeof gain.count === 'number' ? gain.count : 1
  }

  getPlayerMoves(): GreyluneMove[] {
    return skillMarkers.flatMap((marker) => this.moveSkillMarker(marker, this.count))
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    const marker = skillMarkers.find((marker) => isMoveItemType(marker)(move))
    return marker ? this.skillGained(marker, this.count) : []
  }
}
