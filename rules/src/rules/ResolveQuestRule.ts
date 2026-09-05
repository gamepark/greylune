import { ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { RequirementType } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { adventurerArea } from '../material/PlayerState'
import { HeroicQuestArea, questRequirements, QuestTile } from '../material/QuestTile'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * A Heroic Quest, achieved instead of resolving an Encounter (rulebook p.11).
 *
 * The marker goes on the shield worth the most for the first player to get there, and on the one
 * beside it for everybody after — several markers share that one. The Quest itself gives nothing:
 * what it is worth is printed on the board and counted at the very end.
 *
 * Two of the nine ask for something that cannot be paid without choosing: an Object to hand over,
 * and 2 Encounters told whatever they are worth. Those are settled here, before the turn moves on.
 */
export class ResolveQuestRule extends GreyluneRule {
  get space(): HeroicQuestArea {
    return adventurerArea(this, this.player) as HeroicQuestArea
  }

  get tile(): QuestTile {
    return this.material(MaterialType.QuestTile).location(LocationType.QuestTileSpace).locationId(this.space).getItem()!.id as QuestTile
  }

  onRuleStart(): GreyluneMove[] {
    const requirements = questRequirements[this.tile]
    const moves = [...this.payRequirements(requirements), ...this.placeMarker()]
    if (requirements.some((requirement) => requirement.type === RequirementType.DiscardItem)) {
      this.memorize(Memory.Resume, RuleId.ResolveEffects)
      return [...moves, this.startRule(RuleId.DiscardItem)]
    }
    const stories = requirements.find((requirement) => requirement.type === RequirementType.TellStories)
    if (stories) {
      this.memorize(Memory.StoriesOwed, stories.count ?? 1)
      return moves
    }
    return [...moves, ...this.endOfAction()]
  }

  /** The higher shield is free only until somebody has stood on it. */
  private placeMarker(): GreyluneMove[] {
    const taken = this.material(MaterialType.QuestMarker).location(LocationType.QuestRewardSpace).locationId(this.space).length
    return this.material(MaterialType.QuestMarker)
      .id(this.player)
      .location(LocationType.QuestMarkerSpace)
      .limit(1)
      .moveItems({ type: LocationType.QuestRewardSpace, id: this.space, x: taken ? 1 : 0 })
  }

  get storiesOwed(): number {
    return this.remind<number>(Memory.StoriesOwed) ?? 0
  }

  getPlayerMoves(): GreyluneMove[] {
    if (this.storiesOwed <= 0) return []
    return this.encounterCards
      .location(LocationType.UntoldStories)
      .player(this.player)
      .moveItems({ type: LocationType.ToldStories, player: this.player })
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (move.itemType !== MaterialType.EncounterCard) return []
    const owed = this.storiesOwed - 1
    this.memorize(Memory.StoriesOwed, owed)
    return owed > 0 ? [] : this.endOfAction()
  }
}
