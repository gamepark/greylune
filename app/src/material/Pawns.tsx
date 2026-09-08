/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Villager } from '@gamepark/greylune/material/Villager'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext, TokenDescription } from '@gamepark/react-game'
import { Location, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { isSameGap } from '@gamepark/greylune/material/Village'
import { StayPutMenu } from '../travel/TravelMenu'
import { stayPutMove } from '../travel/TravelMoves'
import { gapsToPlaceVillager } from '../village/PlaceVillager'
import { canSelectVillager } from '../villagers/SelectVillager'
import { campOf, isActivateCard, isGainCoinsAround, slotOfCard, villagerActionData } from '../villagers/VillagerActions'
import { SelectedVillager } from '../villagers/SelectedVillager'
import {
  adventurerImages,
  MagicMarker,
  questMarkerImages,
  scoreMarkerImages,
  seasonMarkerImages,
  StrengthMarker,
  villagerImages
} from '../images/PawnImages'

/**
 * Meeples and markers. Their artwork already carries its drop shadow, so they are declared with the
 * full size of the image, halo included.
 */

export class AdventurerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, PlayerColor> {
  width = 3.25
  height = 3.52
  borderRadius = 0.5
  transparency = true
  images = adventurerImages

  /** The pawn is aimed at to be walked, so the offer it wears has to be read without taking it. */
  isMenuAlwaysVisible(): boolean {
    return true
  }

  /**
   * While a journey is being waited for, the Adventurer of the player travelling wears the offer to
   * go no further (see {@link StayPutMenu}); every other area within reach wears the offer to walk
   * there, on the board itself. The moves are the reader's own, so only the pawn of the player being
   * waited for ever carries anything.
   */
  getItemMenu(
    item: MaterialItem<PlayerColor, LocationType, PlayerColor>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    if (item.id !== context.rules.game.rule?.player) return undefined
    const move = stayPutMove(context.rules, legalMoves)
    return move && <StayPutMenu move={move} />
  }
}

/**
 * A Villager's id carries its colour and its figure, so which of the 7 it is, is settled by the
 * rules and not by the display: the same face follows it from the reserve to the camp and back.
 */
export class VillagerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, Villager> {
  width = 1.87
  height = 3.04
  borderRadius = 0.5
  transparency = true
  images = villagerImages

  /**
   * While a gap is open to a Villager, the Villagers already standing in it let the pointer through:
   * the strip under them is a button of its own (see {@link VillageGapArea}), and it is drawn over
   * them, so a pawn that answered the pointer would only ever be in the way of it.
   */
  getItemExtraCss(item: MaterialItem<PlayerColor, LocationType, Villager>, context: ItemContext<PlayerColor, MaterialType, LocationType>) {
    if (item.location.type !== LocationType.VillageGap) return undefined
    return gapsToPlaceVillager(context).some((gap) => isSameGap(item.location, { x: gap.x ?? 0, y: gap.y ?? 0 })) ? transparentToPointer : undefined
  }

  /**
   * A Villager the player could put down somewhere is aimed at by clicking it, and the ring is what
   * says so. The framework hangs the whole of that behaviour off an item having a menu — one click
   * takes it, another lets it go, taking one lets go of the one before, and it is dropped as soon as
   * the Villager is no longer waiting to be placed — so the ring is declared as the menu it is.
   * See {@link SelectVillager}.
   */
  getItemMenu(
    _item: MaterialItem<PlayerColor, LocationType, Villager>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    return canSelectVillager(context, legalMoves) ? <SelectedVillager /> : undefined
  }

  /**
   * A Villager spent in Summer is not moved but named: what it is spent on is a pair — this Villager,
   * that card — so the rules take it as a custom move rather than as the pawn walking off (see
   * `SummerRule`). Dragging is the same decision made with the hand instead of with two clicks, so
   * the pawn is picked up for those moves too, and the pair is read back out of where it is dropped.
   */
  canDrag(move: MaterialMove<PlayerColor, MaterialType, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>) {
    if (isActivateCard(move) || isGainCoinsAround(move)) return villagerActionData(move).villager === context.index
    return super.canDrag(move, context)
  }

  /** Where each of those moves is dropped: the card it names, or the tents the Villager goes back to. */
  getMoveDropLocations(
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    move: MaterialMove<PlayerColor, MaterialType, LocationType>
  ): Location<PlayerColor, LocationType>[] {
    if (isActivateCard(move)) return [{ type: LocationType.VillageGrid, ...slotOfCard(context.rules, villagerActionData(move).card!) }]
    if (isGainCoinsAround(move)) return [campOf(context.rules, context.index)]
    return super.getMoveDropLocations(context, move)
  }
}

const transparentToPointer = css`
  pointer-events: none;
`

export class SeasonMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, PlayerColor> {
  width = 1.88
  height = 2
  transparency = true
  images = seasonMarkerImages
}

export class ScoreMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, PlayerColor> {
  width = 1.6
  height = 1.95
  transparency = true
  images = scoreMarkerImages
}

export class QuestMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, PlayerColor> {
  width = 1.42
  height = 1.65
  transparency = true
  images = questMarkerImages
}

export class StrengthMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType> {
  width = 1.62
  height = 1.98
  transparency = true
  image = StrengthMarker
}

export class MagicMarkerDescription extends TokenDescription<PlayerColor, MaterialType, LocationType> {
  width = 1.6
  height = 1.96
  transparency = true
  image = MagicMarker
}
