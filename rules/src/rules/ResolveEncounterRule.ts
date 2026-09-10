import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Area } from '../material/Area'
import { coins, Gain, vp } from '../material/Effect'
import { encounterCardData } from '../material/EncounterCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { adventurerArea } from '../material/PlayerState'
import { HeroicQuestArea, heroicQuestAreas, questRequirements, QuestTile } from '../material/QuestTile'
import { TriggerType } from '../material/Reaction'
import { CustomMoveType } from './CustomMoveType'
import { EncounterRule } from './EncounterRule'
import { GreyluneMove } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * The Adventurer has stopped in one of the areas out of Greylune (rulebook p.11).
 *
 * The player resolves one Encounter of the row they stand in, satisfying either of its two sides or
 * both, and slides it over their board as a story not told yet. They may also refuse it — for the
 * coin the Wand area pays, the point the Bow one pays, or the Heroic Quest lying in the three
 * farthest ones — but refusing is only ever taking what the space offers instead, never doing
 * nothing: the Adventurer "résout une Rencontre sur sa case d'arrivée, si possible" (p.11).
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
   * Passing is not one of the alternatives, it is what is left to a player who has none: a space
   * whose Encounters they cannot pay for, which offers neither the coin nor the point, and whose
   * Heroic Quest — if it carries one — is not theirs to take. Anywhere else the Adventurer has
   * stopped somewhere that owes them something, and they take it.
   */
  getPlayerMoves(): GreyluneMove[] {
    const moves: GreyluneMove[] = this.row
      .getIndexes()
      .filter((card) => this.encounterMoves(card).length > 0)
      .map((card) => this.customMove(CustomMoveType.ChooseEncounter, card))
    if (this.spaceGain) moves.push(this.customMove(CustomMoveType.SkipEncounter))
    if (this.canTakeQuest) moves.push(this.customMove(CustomMoveType.ResolveQuest))
    if (!moves.length) moves.push(this.customMove(CustomMoveType.Pass))
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
   * meet what it asks.
   */
  get canTakeQuest(): boolean {
    const space = this.questSpace
    const tile = this.questTile
    if (space === undefined || tile === undefined) return false
    if (!this.material(MaterialType.QuestMarker).id(this.player).location(LocationType.QuestMarkerSpace).length) return false
    if (this.material(MaterialType.QuestMarker).id(this.player).location(LocationType.QuestRewardSpace).locationId(space).length) return false
    return this.canPay(questRequirements[tile])
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.Pass)(move)) return this.endOfAction()
    if (isCustomMoveType(CustomMoveType.SkipEncounter)(move)) {
      this.pushGains([this.spaceGain!])
      return this.endOfAction()
    }
    if (isCustomMoveType(CustomMoveType.ResolveQuest)(move)) {
      return this.openReactions([TriggerType.SpendForce], RuleId.ResolveQuest)
    }
    if (isCustomMoveType(CustomMoveType.ChooseEncounter)(move)) return this.designate(move.data as number)
    return super.onCustomMove(move)
  }

  /**
   * The card is named, and the sides it is paid for are chosen next — unless there is nothing left to
   * choose *and* nothing left to miss.
   *
   * A single way that takes every side of the card is everything the card has to give, and asks
   * nothing: every one-sided Encounter is resolved on the spot, and so are the Ours, the Démon and
   * the Dragon of a player who meets both of their conditions. A single way that leaves a side behind
   * is still a button, and it is worth the click it costs — it is where the player reads that they
   * only satisfy half of the card and are only paid half of it.
   */
  private designate(card: number): GreyluneMove[] {
    const ways = this.encounterMoves(card)
    if (ways.length === 1 && ways[0].outcomes.length === encounterCardData[this.front(card)].outcomes.length) return this.resolve(ways[0])
    this.memorize(Memory.ResolvedEncounter, card)
    return [this.startRule(RuleId.ChooseOutcome)]
  }
}
