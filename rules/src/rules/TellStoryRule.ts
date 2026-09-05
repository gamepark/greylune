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
 * worth more than 3, which is why two Encounters worth 2 each may be told together — and why a card
 * worth nothing cannot be told at all, unless Seren or a Charisma potion makes it a 3.
 */
export class TellStoryRule extends GreyluneRule {
  get rewards(): Gain[][] {
    return this.remind<Gain[][]>(Memory.StoryRewards) ?? []
  }

  get value(): number {
    return this.remind<number>(Memory.StoryValue) ?? 0
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

  getPlayerMoves(): GreyluneMove[] {
    const moves: GreyluneMove[] = []
    if (this.value < MAX_STORY_VALUE) {
      for (const card of this.untold.getIndexes()) {
        if (this.storyValue(card) > 0 || this.boosts > 0) {
          moves.push(this.encounterCards.index(card).moveItem({ type: LocationType.ToldStories, player: this.player }))
        }
      }
    }
    moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  /** A card told for nothing is told as a 3: that is what the boost was spent on. */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (move.itemType !== MaterialType.EncounterCard || !('itemIndex' in move)) return []
    const printed = this.storyValue(move.itemIndex)
    const boosted = this.boosts > 0 && printed < MAX_STORY_VALUE
    if (boosted) this.memorize(Memory.StoryBoost, this.boosts - 1)
    this.memorize(Memory.StoryValue, Math.min(MAX_STORY_VALUE, this.value + (boosted ? MAX_STORY_VALUE : printed)))
    return []
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (!isCustomMoveType(CustomMoveType.Pass)(move)) return super.onCustomMove(move)
    this.pushGains(this.rewards.slice(0, this.value).flat(), true)
    return this.endOfAction()
  }
}
