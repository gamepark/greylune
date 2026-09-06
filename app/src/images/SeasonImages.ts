import { Season } from '@gamepark/greylune/Season'
import Autumn from './seasons/Autumn.png'
import Spring from './seasons/Spring.png'
import Summer from './seasons/Summer.png'

/**
 * The 3 season banners of the Season board, cut out of it (see `images/README.md`): the box prints no
 * icon of its own, and the header has to name a season in the width of a button.
 *
 * Winter is not among them because the board draws none: it is the upkeep of the year, resolved with
 * every marker still standing on Spring.
 */
export const seasonImages: Record<Season.Spring | Season.Summer | Season.Autumn, string> = {
  [Season.Spring]: Spring,
  [Season.Summer]: Summer,
  [Season.Autumn]: Autumn
}
