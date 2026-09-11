import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { showsAllBands } from './DisplayedPlayer'
import { getTableInside } from './TableLayout'

/** A card under the pointer is seen up close: twice its size, straight, and over everything around it. */
const hoverScale = 2

/**
 * Enough to pass over the neighbouring cards, the Villagers standing between them and the Seals lying
 * on them, not so much that it passes over the buttons the card itself wears: those are hung 15 over it
 * (see the framework's `ItemMenuWrapper`), and a card seen up close has to leave them in sight and in reach.
 */
export const cardHoverLift = 10

/** How far a span has to move along one axis to lie between `min` and `max`: nothing when it already does. */
const pushInside = (center: number, half: number, min: number, max: number): number => Math.min(Math.max(center, min + half), max - half) - center

/**
 * A card grows around its own middle, so a card near the edge of the table would spill over it: the
 * left column of the Village, the far Object of a row, the Encounter rows running above and below the
 * main board. It is pushed back in by as much as it spills over, and not moved at all when it fits.
 *
 * The push is written in the axes of the table: a card lying on its side is turned straight first, which
 * also has it read the right way up.
 */
export const cardHoverTransform = (item: MaterialItem<PlayerColor, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>): string[] => {
  const locator = context.locators[item.location.type]
  const description = context.material[context.type]
  if (!locator || !description) return []
  const { x = 0, y = 0 } = locator.getItemCoordinates(item, context)
  const { width, height } = description.getSize(item.id)
  const table = getTableInside(context.rules.players.length, showsAllBands(context))
  const dx = pushInside(x, (width * hoverScale) / 2, table.xMin, table.xMax)
  const dy = pushInside(y, (height * hoverScale) / 2, table.yMin, table.yMax)
  const rotation = locator.getItemRotateZ(item, context)
  return [...(rotation ? [`rotateZ(${-rotation}${locator.rotationUnit})`] : []), `translate3d(${dx}em, ${dy}em, ${cardHoverLift}em)`, `scale(${hoverScale})`]
}
