import { CustomMove, isCustomMoveType, isMoveItemType, ItemMove } from '@gamepark/rules-api'
import { RequirementType } from '../material/Effect'
import { eventTileData, isFestival } from '../material/EventTile'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { ReactionType } from '../material/Reaction'
import { CustomMoveType } from './CustomMoveType'
import { GreyluneMaterial, GreyluneMove, GreyluneRule } from './GreyluneRule'

/**
 * The Event of the year, once a Villager is standing in the middle of the tile (rulebook p.6, p.7).
 *
 * How the choice is made depends on what the tile drew. The Festival has 5 spaces printed on it,
 * each one between 2 of its bonuses, so choosing what to gain there is walking the Villager from the
 * middle of the tile to the space it wants, and where it ends up standing *is* the option it took —
 * which is what makes that option nobody else's for the year. Every other tile prints its options as
 * a line of icons and gives them no space at all: what is chosen is paid and gained on the spot and
 * leaves nothing behind, so the Villager does not budge and the choice is a custom move.
 *
 * A tile that has only one option left settles it on its own, so a player is never shown a choice
 * they do not have.
 *
 * The tile is offered to a player who could only pay for it with Kael, so the window opened as the
 * Villager walks on reads {@link outOfReach} and {@link helps} off this rule, as it does for a card
 * being activated: while nothing here is affordable it cannot be passed, and only Kael is offered in it.
 */
export class EventRule extends GreyluneRule {
  /** The Villager that has walked onto the tile and has taken nothing from it yet. */
  get newcomer(): GreyluneMaterial {
    return this.myVillagers.location((location) => location.type === LocationType.EventSpace && location.x === undefined)
  }

  onRuleStart(): GreyluneMove[] {
    const moves = this.getPlayerMoves()
    if (moves.length > 1) return []
    // One option is no choice at all, and none is nothing to ask: either way the player is not stopped.
    return moves.length ? moves : this.endOfAction()
  }

  getPlayerMoves(): GreyluneMove[] {
    const tile = this.eventTile
    // The display asks this of a state it is still animating its way into, in which the Villager is
    // on its way to the tile and not standing on it yet: until it has landed, there is nothing to
    // choose for it, and asking the empty selection to move would throw.
    if (tile === undefined || !this.newcomer.length) return []
    return this.eventOptions.map((option) =>
      isFestival(tile) ? this.newcomer.moveItem({ ...this.eventSpace, x: option }) : this.customMove(CustomMoveType.TakeEventOption, option)
    )
  }

  /** Nothing on the tile can be paid for yet: only an answer given before choosing can bring it in reach. */
  get outOfReach(): boolean {
    return this.eventOptions.length === 0
  }

  helps(card: number, option: number): boolean {
    const effect = this.reactionEffect(card, option)
    switch (effect.type) {
      case ReactionType.ReduceForceCost:
        return this.blockedBy(RequirementType.SpendForce)
      case ReactionType.ReduceVillagerCost:
        return this.blockedBy(RequirementType.SpendVillagers)
      default:
        return false
    }
  }

  /** An option the player cannot pay for, and that asks for exactly that. */
  private blockedBy(type: RequirementType): boolean {
    return eventTileData[this.eventTile!].abilities.some(
      (ability) => !this.canPay(ability.requirements) && (ability.requirements ?? []).some((requirement) => requirement.type === type)
    )
  }

  /** The Festival: the space the Villager has taken its place on is the option it pays for. */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): GreyluneMove[] {
    if (!isMoveItemType(MaterialType.Villager)(move) || move.location.type !== LocationType.EventSpace) return []
    return move.location.x === undefined ? [] : this.takeOption(move.location.x)
  }

  /** Every other tile: the option is named, and nothing on the table says which one it was. */
  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.TakeEventOption)(move)) return this.takeOption(move.data as number)
    return super.onCustomMove(move)
  }

  private takeOption(option: number): GreyluneMove[] {
    const ability = eventTileData[this.eventTile!].abilities[option]
    this.pushGains(ability.gains ?? [])
    return [...this.payRequirements(ability.requirements), ...this.endOfAction()]
  }
}
