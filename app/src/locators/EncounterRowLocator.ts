import { Area } from '@gamepark/greylune/material/Area'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem } from '@gamepark/rules-api'
import { cardHoverTransform } from './CardHover'
import { encounterRowNeighbours, encounterRowSlot, EncounterRowArea } from './TableLayout'

type Context = MaterialContext<PlayerColor, MaterialType, LocationType>

/** An Encounter turned over is in no Area for an instant, and lies at the head of the Gold row. */
const encounterRowArea = (location: Location<PlayerColor, LocationType>): EncounterRowArea => (location.id as EncounterRowArea) ?? Area.Wand

const countRow = (area: EncounterRowArea, { rules }: Context): number =>
  rules.material(MaterialType.EncounterCard).location((location) => location.type === LocationType.EncounterRow && encounterRowArea(location) === area).length

/**
 * Which neighbouring row a row lays its 4th and 5th Encounters over: the emptier of the 2 it has, and
 * the only one for the rows against the top and the bottom edge of the board. A year deals 7 cards over
 * the 5 Areas, so a row that holds 4 or 5 of them has neighbours with next to nothing in them, and the
 * borrowed line is bare table.
 */
const borrowedRow = (area: EncounterRowArea, context: Context): EncounterRowArea =>
  encounterRowNeighbours(area).reduce((emptiest, row) => (countRow(row, context) < countRow(emptiest, context) ? row : emptiest))

/**
 * The Encounters revealed for the year, one row per Area, each hanging off the notch its cards are
 * slotted into: a line of 3 and, on the rare year that deals a fourth to the same Area, 2 cards laid
 * on the line of a neighbouring row (see {@link encounterRowSlot}).
 *
 * The rank of a card in its row is its `x`, which the sequence strategy hands out, so a card keeps its
 * place whatever happens to the others.
 */
export class EncounterRowLocator extends Locator<PlayerColor, MaterialType, LocationType> {
  getCoordinates(location: Location<PlayerColor, LocationType>, context: Context): Coordinates {
    const area = encounterRowArea(location)
    return encounterRowSlot(area, location.x ?? 0, borrowedRow(area, context))
  }

  getItemCoordinates(item: MaterialItem<PlayerColor, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>): Coordinates {
    const area = encounterRowArea(item.location)
    return encounterRowSlot(area, this.getItemIndex(item, context), borrowedRow(area, context))
  }

  /** Where the cards past the third land depends on what the rows around them hold, and on nothing else. */
  getPositionDependencies(location: Location<PlayerColor, LocationType>, context: Context): unknown {
    return encounterRowNeighbours(encounterRowArea(location)).map((row) => countRow(row, context))
  }

  getHoverTransform(item: MaterialItem<PlayerColor, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>): string[] {
    return cardHoverTransform(item, context)
  }
}
