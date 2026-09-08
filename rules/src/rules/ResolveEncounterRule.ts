import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { Area } from '../material/Area'
import { coins, Gain, GainType, isCheck, Requirement, vp } from '../material/Effect'
import { EncounterCard, EncounterCardId, encounterCardData } from '../material/EncounterCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { adventurerArea } from '../material/PlayerState'
import { HeroicQuestArea, heroicQuestAreas, questRequirements, QuestTile } from '../material/QuestTile'
import { TriggerType } from '../material/Reaction'
import { incomeTokenGains } from '../material/Tokens'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMaterial, GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/** Which requirement of which side of the card, when a Potion lets one of them be waved away. */
type Ignored = { outcome: number; requirement: number }

/** What a move to resolve an Encounter says: the card, the sides paid for, the conditions waved away. */
export type ResolveOutcomeData = { card: number; outcomes: number[]; ignored?: Ignored[] }

/**
 * The Adventurer has stopped in one of the areas out of Greylune (rulebook p.11).
 *
 * The player resolves one Encounter of the row they stand in, satisfying either of its two sides or
 * both, and slides it over their board as a story not told yet. They may also refuse it — for the
 * coin the Wand area pays, the point the Bow one pays, or the Heroic Quest lying in the three
 * farthest ones — but refusing is only ever taking what the space offers instead, never doing
 * nothing: the Adventurer "résout une Rencontre sur sa case d'arrivée, si possible" (p.11).
 */
export class ResolveEncounterRule extends GreyluneRule {
  /** Where the Adventurer stands, {@link Area.Village} while it is still in Greylune. */
  get area(): Area {
    return adventurerArea(this, this.player)
  }

  get row() {
    return this.encounterCards.location(LocationType.EncounterRow).locationId(this.area)
  }

  get ignores(): number {
    return this.remind<number>(Memory.IgnoredConditions) ?? 0
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
      .flatMap((card) => this.encounterMoves(card))
      .map((data) => this.customMove(CustomMoveType.ResolveOutcome, data))
    if (this.spaceGain) moves.push(this.customMove(CustomMoveType.SkipEncounter))
    if (this.canTakeQuest) moves.push(this.customMove(CustomMoveType.ResolveQuest))
    if (!moves.length) moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  /** Every way this Encounter can be resolved: one side, the other, both, and what may be waved away. */
  private encounterMoves(card: number): ResolveOutcomeData[] {
    const front = this.encounterCards.getItem<EncounterCardId>(card).id.front!
    const outcomes = encounterCardData[front].outcomes
    const subsets = outcomes.length > 1 ? [[0], [1], [0, 1]] : [[0]]
    return subsets.flatMap((subset) => this.ignoreVariants(front, subset).map((ignored) => ({ card, outcomes: subset, ignored })))
  }

  /**
   * The lists of conditions the player may wave away for a subset of sides, and still pay the rest.
   * Without a Potion or Ariok there is exactly one: the empty list.
   */
  private ignoreVariants(front: EncounterCard, subset: number[]): (Ignored[] | undefined)[] {
    const all = subset.flatMap((outcome) =>
      (encounterCardData[front].outcomes[outcome].requirements ?? []).map((_, requirement) => ({ outcome, requirement }))
    )
    const variants: (Ignored[] | undefined)[] = []
    for (const ignored of subsetsUpTo(all, this.ignores)) {
      if (!this.canPay(this.requirementsOf(front, subset, ignored))) continue
      variants.push(ignored.length ? ignored : undefined)
    }
    return variants
  }

  private requirementsOf(front: EncounterCard, subset: number[], ignored: Ignored[] = []): Requirement[] {
    return subset.flatMap((outcome) =>
      (encounterCardData[front].outcomes[outcome].requirements ?? []).filter(
        (_, requirement) => !ignored.some((entry) => entry.outcome === outcome && entry.requirement === requirement)
      )
    )
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
    if (isCustomMoveType(CustomMoveType.ResolveOutcome)(move)) return this.resolve(move.data as ResolveOutcomeData)
    return super.onCustomMove(move)
  }

  /**
   * The conditions are paid, the rewards queued and the card slid over the personal board.
   *
   * The Income token the card may carry is lifted off it first, and taken straight to the row it
   * will be paid from every Autumn. It is a piece lying on the card, so anything else would carry it
   * along: it would follow the card under the personal board and then have to cross it back, which
   * is not what taking a token off a card looks like. What it pays on the spot is queued where the
   * token itself stood among the rewards, so the order the card reads in is the order it pays in.
   */
  private resolve(data: ResolveOutcomeData): GreyluneMove[] {
    const front = this.encounterCards.getItem<EncounterCardId>(data.card).id.front!
    const requirements = this.requirementsOf(front, data.outcomes, data.ignored)
    const gains = data.outcomes.flatMap((outcome) => encounterCardData[front].outcomes[outcome].gains ?? [])
    const income = this.incomeOn(data.card)
    // The token is printed in the reward of one side: the other side leaves it where it lies.
    const taken = income.length > 0 && gains.some((gain) => gain.type === GainType.IncomeToken)
    this.pushGains(gains.flatMap((gain) => (gain.type === GainType.IncomeToken ? (taken ? incomeTokenGains[gain.token] : []) : [gain])))
    return [
      ...this.payRequirements(requirements.filter((requirement) => !isCheck(requirement))),
      ...(taken ? income.moveItems({ type: LocationType.IncomeTokenSpace, player: this.player }) : []),
      this.encounterCards.index(data.card).moveItem({ type: LocationType.UntoldStories, player: this.player }),
      this.startRule(RuleId.ResolveEffects)
    ]
  }

  /**
   * The Income token laid on a card, if it was ever laid: the stock holds one token per card that
   * asks for one, and a card revealed in a year the stock had already run dry carries none.
   */
  private incomeOn(card: number): GreyluneMaterial {
    return this.material(MaterialType.IncomeToken).location(LocationType.CardIncome).parent(card)
  }
}

/** Every subset of `items` of at most `size` entries, the empty one included. */
const subsetsUpTo = <T>(items: T[], size: number): T[][] => {
  if (size <= 0 || !items.length) return [[]]
  const [head, ...tail] = items
  return [...subsetsUpTo(tail, size), ...subsetsUpTo(tail, size - 1).map((subset) => [head, ...subset])]
}
