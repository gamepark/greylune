import { Season } from '@gamepark/greylune/Season'
import Autumn from './icons/Autumn.png'
import Spring from './icons/Spring.png'
import Summer from './icons/Summer.png'
import Winter from './icons/Winter.png'

/**
 * The 4 season pictograms supplied by the publisher: the header has to name a season in the width of a
 * button.
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
