import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { MaterialGameAnimations } from '@gamepark/react-game'
import { isMoveItemType } from '@gamepark/rules-api'

export const gameAnimations = new MaterialGameAnimations()

/**
 * The Villager stepping from the middle of the Festival onto the space it settles on.
 *
 * The move is the player's own second click, and it is a short one — one space of the same tile,
 * never more than an em — so the default travel time reads as a hesitation rather than as a walk.
 * A fifth of a second is long enough to see which space was taken and short enough not to be waited
 * for. Walking onto the tile in the first place keeps the usual duration: that one crosses the table.
 */
gameAnimations
  .configure((move) => isMoveItemType(MaterialType.Villager)(move) && move.location.type === LocationType.EventSpace && move.location.x !== undefined)
  .duration(200)
