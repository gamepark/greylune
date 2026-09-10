import { CustomMove, isCustomMoveType, ItemMove } from '@gamepark/rules-api'
import { MAX_STORY_VALUE } from '../Constants'
import { Memory } from '../Memory'
import { Gain } from '../material/Effect'
import { EncounterCardId, encounterCardData } from '../material/EncounterCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * A Tavern is open, or the special action of the personal board has been taken (rulebook p.12).
 *
 * The player slides Encounters over to the told stories one at a time, and the Tavern pays by tiers:
 * the first bonus for a story worth 1, the first two for 2, all of them for 3. A story is never
 * worth more than 3, which is why a card worth nothing cannot be told at all, unless Seren or a
 * Charisma potion makes it a 3.
 */
export class TellStoryRule extends GreyluneRule {
  get rewards(): Gain[][] {
    return this.remind<Gain[][]>(Memory.StoryRewards) ?? []
  }

  /** What each Encounter of the story is worth, in the order they were told, a boosted one as a 3. */
  get told(): number[] {
    return this.remind<number[]>(Memory.StoryTold) ?? []
  }

  /** What the Tavern pays on: the sum of the Encounters told, and never more than 3. */
  get value(): number {
    return Math.min(
      MAX_STORY_VALUE,
      this.told.reduce((total, value) => total + value, 0)
    )
  }

  get boosts(): number {
    return this.remind<number>(Memory.StoryBoost) ?? 0
  }

  get untold() {
    return this.encounterCards.location(LocationType.UntoldStories).player(this.player)
  }

  storyValue(card: number): number {
    return encounterCardData[this.encounterCards.getItem<EncounterCardId>(card).id.front!].story
  }

  /**
   * What telling a card would add to the story. A boost is only ever spent on the Encounter that
   * opens one: it makes the card a 3, and a 3 added to anything overruns the maximum — the 2 + 2
   * of the exception below being the one overrun the rules allow, and it is not made of a 3.
   */
  addedValue(card: number): number {
    const printed = this.storyValue(card)
    return this.boosts > 0 && printed < MAX_STORY_VALUE && !this.told.length ? MAX_STORY_VALUE : printed
  }

  /**
   * A story is worth 3 at most, so an Encounter is only heard if it fits under that — with the one
   * exception the rulebook prints (p.12): 2 Encounters worth 2 each are told together, and the 4
   * they add up to counts as a 3. Hence 1 + 1 + 1 and 2 + 2, but never 1 + 1 + 2.
   *
   * A card worth nothing is never heard, unless a boost is there to make it a 3.
   */
  fits(card: number): boolean {
    const added = this.addedValue(card)
    if (added === 0) return false
    if (added === 2 && this.told.length === 1 && this.told[0] === 2) return true
    return this.value + added <= MAX_STORY_VALUE
  }

  get tellable() {
    return this.untold.index((index) => this.fits(index))
  }

  getPlayerMoves(): GreyluneMove[] {
    const moves: GreyluneMove[] = this.tellable.moveItems({ type: LocationType.ToldStories, player: this.player })
    moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  /** A card told for nothing is told as a 3: that is what the boost was spent on. */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (move.itemType !== MaterialType.EncounterCard || !('itemIndex' in move)) return []
    const added = this.addedValue(move.itemIndex)
    if (added > this.storyValue(move.itemIndex)) this.memorize(Memory.StoryBoost, this.boosts - 1)
    this.memorize(Memory.StoryTold, [...this.told, added])
    return []
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (!isCustomMoveType(CustomMoveType.Pass)(move)) return super.onCustomMove(move)
    this.pushGains(this.rewards.slice(0, this.value).flat(), true)
    return this.endOfAction()
  }
}
