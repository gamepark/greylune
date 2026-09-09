import GoldCoin from './icons/Gold.png'
import MagicGem from './icons/Magic.png'
import MagicGemDown from './icons/MagicDown.png'
import MagicGemUp from './icons/MagicUp.png'
import Rider from './icons/Move.png'
import Rider1 from './icons/Move1.png'
import Rider2 from './icons/Move2.png'
import Rider3 from './icons/Move3.png'
import Rider4 from './icons/Move4.png'
import Rider5 from './icons/Move5.png'
import DiscardedPotion from './icons/PotionDiscarded.png'
import StoryBook from './icons/Story.png'
import ForceGem from './icons/Strength.png'
import ForceGemDown from './icons/StrengthDown.png'
import ForceGemUp from './icons/StrengthUp.png'
import TiltArrow from './icons/Tilt.png'
import Laurel from './icons/VictoryPoint.png'
import VillagerFigure from './icons/Villager.png'

/**
 * The rider for each distance. The box never draws a bare rider with a figure beside it: the number
 * of spaces is cut into the pawn itself, one drawing per distance, so an amount of road is a single
 * symbol and reads as one thing. Nothing prints more than 5, and a distance read off a Seal token is
 * a number nobody knows yet — both fall back on the bare rider.
 */
const riderImages: Partial<Record<number, string>> = { 1: Rider1, 2: Rider2, 3: Rider3, 4: Rider4, 5: Rider5 }

/**
 * The symbols the game means, drawn on their own.
 *
 * Everything else the interface shows is a photograph of a piece (see `PawnImages` and the rest),
 * because a piece is what the player has in front of them. These are the exception: Force, Magic and
 * victory points are printed all over the boards and the cards but exist as no piece at all — only
 * as a marker standing on a track, which says "where you are" and not "what you gain". A gem, a
 * laurel and a rider say it in one mark.
 *
 * The gems come in three states, because the cards draw them in three: the bare gem is a level a
 * player has to have reached, and the same gem under a green arrow or over a red one is that level
 * going up or coming down. A condition is a threshold, a gain and a cost are a step, and the box
 * never writes a 1 beside any of them — the arrow is the 1.
 *
 * The rest are the other half of the same idea: not what an effect gives but what it costs, in the 2
 * cases where the cost is a gesture made to the card itself — laid on its side, or given up. The
 * cards print both of those as a symbol too, and it is the symbol a player has learnt to read.
 */
export {
  DiscardedPotion,
  ForceGem,
  ForceGemDown,
  ForceGemUp,
  GoldCoin,
  Laurel,
  MagicGem,
  MagicGemDown,
  MagicGemUp,
  Rider,
  riderImages,
  StoryBook,
  TiltArrow,
  VillagerFigure
}
