import { ItemMove } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { RequirementType } from '../material/Effect'
import { EncounterCardId, encounterCardData } from '../material/EncounterCard'
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
    if (this.storiesAsked) {
      // A Tavern earlier in the same action may have left its story behind.
      this.memorize(Memory.StoryTold, [])
      return moves
    }
    return [...moves, ...this.endOfAction()]
  }

  get storiesAsked(): number {
    const stories = questRequirements[this.tile].find((requirement) => requirement.type === RequirementType.TellStories)
    return stories ? (stories.count ?? 1) : 0
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

  get told(): number[] {
    return this.remind<number[]>(Memory.StoryTold) ?? []
  }

  get storiesOwed(): number {
    return this.storiesAsked - this.told.length
  }

  getPlayerMoves(): GreyluneMove[] {
    if (this.storiesOwed <= 0) return []
    return this.encounterCards
      .location(LocationType.UntoldStories)
      .player(this.player)
      .moveItems({ type: LocationType.ToldStories, player: this.player })
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (move.itemType !== MaterialType.EncounterCard || !('itemIndex' in move)) return []
    const story = encounterCardData[this.encounterCards.getItem<EncounterCardId>(move.itemIndex).id.front!].story
    this.memorize(Memory.StoryTold, [...this.told, story])
    return this.storiesOwed > 0 ? [] : this.endOfAction()
  }
}
