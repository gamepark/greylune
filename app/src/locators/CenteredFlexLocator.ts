import { FlexLocator, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'

/**
 * A {@link FlexLocator} lays its items out in lines, growing away from the coordinates it is given.
 * This one is anchored on the middle of the block instead, exactly as {@link CenteredListLocator} is
 * for a single row: a stock of tokens has a place on the table, not a corner.
 *
 * Override {@link getCenter} instead of {@link getCoordinates} in subclasses, or pass `getCenter` to
 * the constructor.
 */
export class CenteredFlexLocator<
  P extends number = number,
  M extends number = number,
  L extends number = number,
  R extends number = number,
  V extends number = number
> extends FlexLocator<P, M, L, R, V> {
  constructor(clone?: Partial<CenteredFlexLocator>) {
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
    const { x: lineGapX = 0, y: lineGapY = 0 } = this.getLineGap(location, context)
    /** {@link FlexLocator} caps its item count at one line, so these are the gaps within a line... */
    const gaps = Math.max(0, this.countListItems(location, context) - 1)
    /** ...and these the gaps between the lines the whole stock takes. */
    const lineGaps = Math.max(0, Math.ceil(this.countItems(location, context) / this.getLineSize(location, context)) - 1)
    return {
      x: x - (gapX * gaps + lineGapX * lineGaps) / 2,
      y: y - (gapY * gaps + lineGapY * lineGaps) / 2,
      z
    }
  }
}
