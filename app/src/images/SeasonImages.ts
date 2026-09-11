import { Season } from '@gamepark/greylune/Season'
import Autumn from './seasons/Autumn.png'
import Spring from './seasons/Spring.png'
import Summer from './seasons/Summer.png'
import Winter from './seasons/Winter.png'

/**
 * The 4 season banners of the Season board, cut out of it (see `images/README.md`): the box prints no
 * icon of its own, and the header has to name a season in the width of a button.
 *
 * Winter has a banner like the others, over the narrow column of the upkeep, but no space under it:
 * it is resolved with every marker still standing on Spring. So the header never names it, and only
 * the legend of the board does (see `SeasonBoardHelp`).
 */
export const seasonImages: Record<Season, string> = {
  [Season.Winter]: Winter,
  [Season.Spring]: Spring,
  [Season.Summer]: Summer,
  [Season.Autumn]: Autumn
}
