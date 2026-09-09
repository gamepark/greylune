import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { MAX_SKILL } from '../Constants'
import { EncounterCardId, encounterCardData } from '../material/EncounterCard'
import { coins, force, Gain, magic, tellStory, travel, vp } from '../material/Effect'
import { LocationType } from '../material/LocationType'
import { ReactionType, TriggerType } from '../material/Reaction'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMove, GreyluneRule } from './GreyluneRule'

/** The 3 options, in the order the board prints them under the doorway. */
export enum SpecialAction {
  Story,
  Travel,
  Magic
}

/**
 * The 3 things the special space of the personal board can be spent on (rulebook p.9). The story it
 * hears pays by tiers like a Tavern.
 */
export const specialActions: Gain[][] = [[tellStory([coins(2)], [force()], [vp(2)])], [travel(1)], [magic()]]

/**
 * The special action, once a Villager is standing on it (rulebook p.9). One Villager a year, and the
 * board keeps it until Autumn.
 *
 * The board prints the 3 options as a line of icons under the space the Villager stands on, and
 * gives them no space of their own — so putting the Villager down says only that the action is being
 * taken, and what it is taken for is a custom move made afterwards. It is the same shape as an Event
 * tile that is not the Festival (see `EventRule`), and for the same reason: what is chosen is spent
 * and gained on the spot and leaves nothing behind for anyone to read the choice off.
 */
export class SpecialActionRule extends GreyluneRule {
  /**
   * Only what would actually hand something over. A track already at 5 takes nothing more, and a
   * story needs a story to tell — both would spend the Villager of the year on nothing. The road is
   * always offered: the Adventurer can always be walked, and staying put is a decision of its own.
   */
  getPlayerMoves(): GreyluneMove[] {
    return specialActions.flatMap((_, option) => (this.gives(option) ? [this.customMove(CustomMoveType.TakeSpecialAction, option)] : []))
  }

  private gives(option: SpecialAction): boolean {
    switch (option) {
      case SpecialAction.Magic:
        return this.magic < MAX_SKILL
      case SpecialAction.Story:
        return this.hasStoryToTell
      default:
        return true
    }
  }

  /**
   * An Encounter pushed under the board and worth more than nothing, or one worth nothing with Seren
   * or a Charisma potion ready to make it a 3 — those answer once the Tavern is open, so a player
   * holding one is offered the story their own cards cannot tell on their own (see `TellStoryRule`).
   */
  private get hasStoryToTell(): boolean {
    const untold = this.encounterCards.location(LocationType.UntoldStories).player(this.player)
    if (untold.filter<EncounterCardId>((item) => encounterCardData[item.id.front!].story > 0).length) return true
    return (
      untold.length > 0 &&
      this.reactionChoices([TriggerType.TellStory]).some(({ card, option }) => this.reactionEffect(card, option).type === ReactionType.StoryValue3)
    )
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (!isCustomMoveType(CustomMoveType.TakeSpecialAction)(move)) return super.onCustomMove(move)
    this.pushGains(specialActions[move.data as number])
    return this.endOfAction()
  }
}
