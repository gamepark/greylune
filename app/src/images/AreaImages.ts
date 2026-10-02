import { Area } from '@gamepark/greylune/material/Area'
import Bow from './icons/areas/Bow.png'
import Edge from './icons/areas/Edge.png'
import Hammer from './icons/areas/Hammer.png'
import Swords from './icons/areas/Swords.png'
import Wand from './icons/areas/Wand.png'

/**
 * The banner each Area of the road flies on the main board, which is also the one its Encounters
 * print on theirs: the one name an Area has.
 * Greylune itself flies none, and is named in words.
 */
export const areaImages: Record<Exclude<Area, Area.Village>, string> = {
  [Area.Wand]: Wand,
  [Area.Bow]: Bow,
  [Area.Hammer]: Hammer,
  [Area.Swords]: Swords,
  [Area.Edge]: Edge
}
