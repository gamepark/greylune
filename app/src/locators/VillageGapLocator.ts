import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { gapOf, isSameGap } from '@gamepark/greylune/material/Village'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ComponentSize, DropAreaDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem } from '@gamepark/rules-api'
import { gapsToPlaceVillager } from '../village/PlaceVillager'
import { VillageGapArea } from '../village/VillageGapArea'
import { CenteredListLocator } from './CenteredListLocator'
import { villageCardBorderRadius, villageGapGap, villageGapSize, villageGapLevel, villageGridSpot } from './TableLayout'

/**
 * What a player aims at when they place a Villager is the space between two cards, not the spot the
 * Villager will end up standing on: the drop area covers that strip exactly, corners rounded like
 * the cards on either side of it.
 */
class VillageGapDescription extends DropAreaDescription<PlayerColor, MaterialType, LocationType> {
  Component = VillageGapArea
  borderRadius = villageCardBorderRadius

  getLocationSize(location: Location<PlayerColor, LocationType>): ComponentSize {
    return villageGapSize(gapOf(location))
  }
}

/**
 * The gaps between the cards, where any number of Villagers of any players may stand. A gap is named
 * by the half coordinates of the point between its two slots, and the grid being evenly spaced,
 * {@link villageGridSpot} lands on that point on its own.
 *
 * A gap is one space shared by everybody, which is not how the framework counts by default: it tells
 * areas apart by their `player` and pays no attention to `x` and `y`, so the 12 gaps would read as
 * one area per player. Every count and every rank here is therefore taken over the Villagers of one
 * gap, whoever they belong to.
 */
export class VillageGapLocator extends CenteredListLocator<PlayerColor, MaterialType, LocationType> {
  locationDescription = new VillageGapDescription()

  /**
   * The gaps are drawn on the table only while the player may walk a Villager into one — that is the
   * whole of what they are for, and an empty gap the rest of the time is one more thing to read on a
   * board that already carries a lot.
   */
  getLocations(context: MaterialContext<PlayerColor, MaterialType, LocationType>): Location<PlayerColor, LocationType>[] {
    return gapsToPlaceVillager(context)
  }

  /**
   * The gap and the Villagers standing in it are drawn at {@link villageGapLevel}, high enough to
   * clear the main board the right column of the grid bites into.
   */
  getCenter(location: Location<PlayerColor, LocationType>): Partial<Coordinates> {
    return { ...villageGridSpot(location.x ?? 0, location.y ?? 0), z: villageGapLevel }
  }

  /** The step of a `space-around` line: see {@link villageGapGap}. */
  getGap(location: Location<PlayerColor, LocationType>, context: MaterialContext<PlayerColor, MaterialType, LocationType>): Partial<Coordinates> {
    return villageGapGap(gapOf(location), this.countItems(location, context))
  }

  /**
   * The Villagers standing in a gap, in the order of the material: a fixed order, so a Villager
   * leaving the gap does not shuffle the ones that stay, and the same line is drawn for everybody.
   */
  private gapVillagers(location: Location<PlayerColor, LocationType>, { rules }: MaterialContext<PlayerColor, MaterialType, LocationType>): number[] {
    return rules
      .material(MaterialType.Villager)
      .location((itemLocation) => isSameGap(itemLocation, gapOf(location)))
      .getIndexes()
  }

  countItems(location: Location<PlayerColor, LocationType>, context: MaterialContext<PlayerColor, MaterialType, LocationType>): number {
    return this.gapVillagers(location, context).length
  }

  /**
   * The rank of a Villager in the line its gap holds. `location.z` cannot say it: the mutator hands
   * a location strategy the items of one player, so the {@link StackingStrategy} of a gap numbers
   * each player's Villagers from 0 of their own, and two players sharing a gap would both stand on
   * its first spot.
   */
  getItemIndex(item: MaterialItem<PlayerColor, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>): number {
    return Math.max(0, this.gapVillagers(item.location, context).indexOf(context.index))
  }

  /**
   * A location of this type is the gap itself, never one of the Villagers standing in it, so it has
   * no rank in that line: the framework then draws it on the middle of the line, which is the point
   * between the two cards — exactly where the drop area belongs.
   */
  getLocationIndex(): number | undefined {
    return undefined
  }
}
