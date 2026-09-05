import { ListLocator, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'
import { spread } from './spread'

/**
 * A {@link ListLocator} positions its first item on the coordinates it is given, so a list grows to
 * one side as items are added. Most areas of Greylune are the other way round: a slot on a board, a
 * row of tokens next to a personal board, a handful of Adventurers standing in the Village. They
 * have a centre, and the items spread evenly around it.
 *
 * Override {@link getCenter} instead of {@link getCoordinates} in subclasses, or pass `getCenter` to
 * the constructor.
 */
export class CenteredListLocator<
  P extends number = number,
  M extends number = number,
  L extends number = number,
  R extends number = number,
  V extends number = number
> extends ListLocator<P, M, L, R, V> {
  constructor(clone?: Partial<CenteredListLocator>) {
    super()
    Object.assign(this, clone)
  }

  center: Partial<Coordinates> = {}

  getCenter(_location: Location<P, L>, _context: MaterialContext<P, M, L, R, V>): Partial<Coordinates> {
    return this.center
  }

  getCoordinates(location: Location<P, L>, context: MaterialContext<P, M, L, R, V>): Partial<Coordinates> {
    const { x = 0, y = 0, z } = this.getCenter(location, context)
    const { x: gapX = 0, y: gapY = 0 } = this.getGap(location, context)
    const { x: maxGapX, y: maxGapY } = this.getMaxGap(location, context)
    const gaps = Math.max(0, this.countListItems(location, context) - 1)
    return { x: x - spread(gapX, gaps, maxGapX) / 2, y: y - spread(gapY, gaps, maxGapY) / 2, z }
  }
}
