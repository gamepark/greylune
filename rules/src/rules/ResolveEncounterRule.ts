import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Area } from '../material/Area'
import { coins, Gain, RequirementType, vp } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { adventurerArea } from '../material/PlayerState'
import { HeroicQuestArea, heroicQuestAreas, questRequirements, QuestTile, questTriggers } from '../material/QuestTile'
import { TriggerType } from '../material/Reaction'
import { CustomMoveType } from './CustomMoveType'
import { EncounterRule, outcomeRequirements } from './EncounterRule'
import { GreyluneMove } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * The Adventurer has stopped in one of the areas out of Greylune (rulebook p.11).
 *
 * The player resolves one Encounter of the row they stand in, satisfying either of its two sides or
 * both, and slides it over their board as a story not told yet. They may also refuse it: for the
 * coin the Wand area pays or the point the Bow one pays, and in the three farthest ones for their
 * Heroic Quest, or for nothing at all.
 *
 * What is chosen here is the card alone. Which of its two sides is paid for is a decision of its
 * own, taken on the card once it has been named (see {@link ChooseOutcomeRule}): a two-sided card
 * offers up to 3 ways to resolve it, and hanging all of them off every card of the row at once asks
 * the player to read the whole row before touching any of it.
 */
export class ResolveEncounterRule extends EncounterRule {
  /** Where the Adventurer stands, {@link Area.Village} while it is still in Greylune. */
  get area(): Area {
    return adventurerArea(this, this.player)
  }

  get row() {
    return this.encounterCards.location(LocationType.EncounterRow).locationId(this.area)
  }

  onRuleStart(): GreyluneMove[] {
    return this.area === 0 ? this.endOfAction() : []
  }

  /**
   * Passing is offered wherever the space pays nothing for refusing its Encounters: the three
   * farthest ones, whose Heroic Quest may be out of reach or not wanted, and whose Encounters the
   * player is never forced to resolve. Where the space pays a coin or a point, taking it is the way
   * to refuse, and turning that down too would only be taking less.
   */
  getPlayerMoves(): GreyluneMove[] {
    const reduction = this.potentialReduction([TriggerType.SpendForce])
    const moves: GreyluneMove[] = this.row
      .getIndexes()
      .filter((card) => this.encounterMoves(card, reduction).length > 0)
      .map((card) => this.customMove(CustomMoveType.ChooseEncounter, card))
    if (this.spaceGain) moves.push(this.customMove(CustomMoveType.SkipEncounter))
    if (this.canTakeQuest) moves.push(this.customMove(CustomMoveType.ResolveQuest))
    if (!this.spaceGain) moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  /** The coin the Wand area pays and the point the Bow one pays, to whoever resolves nothing. */
  get spaceGain(): Gain | undefined {
    if (this.area === Area.Wand) return coins(1)
    if (this.area === Area.Bow) return vp(1)
    return undefined
  }

  get questSpace(): HeroicQuestArea | undefined {
    return heroicQuestAreas.find((area) => area === this.area)
  }

  get questTile(): QuestTile | undefined {
    const space = this.questSpace
    if (space === undefined) return undefined
    return this.material(MaterialType.QuestTile).location(LocationType.QuestTileSpace).locationId(space).getItem()?.id as QuestTile | undefined
  }

  /**
   * A Quest is taken once by each player, and only by one who still has a marker to commit and can
   * meet what it asks — counting the Force Kael could still take off it, since he is offered before
   * the Quest is paid for.
   */
  get canTakeQuest(): boolean {
    const space = this.questSpace
    const tile = this.questTile
    if (space === undefined || tile === undefined) return false
    if (!this.material(MaterialType.QuestMarker).id(this.player).location(LocationType.QuestMarkerSpace).length) return false
    if (this.material(MaterialType.QuestMarker).id(this.player).location(LocationType.QuestRewardSpace).locationId(space).length) return false
    return this.canPay(questRequirements[tile], this.potentialReduction(questTriggers(tile)))
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.Pass)(move)) return this.endOfAction()
    if (isCustomMoveType(CustomMoveType.SkipEncounter)(move)) {
      this.pushGains([this.spaceGain!])
      return this.endOfAction()
    }
    if (isCustomMoveType(CustomMoveType.ResolveQuest)(move)) {
      return this.openReactions(questTriggers(this.questTile!), RuleId.ResolveQuest)
    }
    if (isCustomMoveType(CustomMoveType.ChooseEncounter)(move)) return this.designate(move.data as number)
    return super.onCustomMove(move)
  }

  /**
   * The card is named, and the sides it is paid for are chosen next (see {@link ChooseOutcomeRule}).
   *
   * The Diamant is the one Encounter that spends Force, and Kael answers Force about to be spent: he
   * is offered as the card is named, before anything is paid — which is also what lets a player with
   * no Force left take it at all (see {@link ChooseOutcomeRule.outOfReach}).
   */
  private designate(card: number): GreyluneMove[] {
    this.memorize(Memory.ResolvedEncounter, card)
    const front = this.front(card)
    const spendsForce = this.encounterMoves(card, this.potentialReduction([TriggerType.SpendForce])).some((way) =>
      outcomeRequirements(front, way.outcomes, way.ignored).some((requirement) => requirement.type === RequirementType.SpendForce)
    )
    return spendsForce ? this.openReactions([TriggerType.SpendForce], RuleId.ChooseOutcome) : [this.startRule(RuleId.ChooseOutcome)]
  }
}
