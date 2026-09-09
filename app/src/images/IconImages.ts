import GoldCoin from './icons/Gold.png'
import MagicGem from './icons/Magic.png'
import Rider from './icons/Move.png'
import DiscardedPotion from './icons/PotionDiscarded.png'
import ForceGem from './icons/Strength.png'
import TiltArrow from './icons/Tilt.png'
import Laurel from './icons/VictoryPoint.png'
import VillagerFigure from './icons/Villager.png'

/**
 * The symbols the game means, drawn on their own.
 *
 * Everything else the interface shows is a photograph of a piece (see `PawnImages` and the rest),
 * because a piece is what the player has in front of them. These are the exception: Force, Magic and
 * victory points are printed all over the boards and the cards but exist as no piece at all — only
 * as a marker standing on a track, which says "where you are" and not "what you gain". A gem, a
 * laurel and a rider say it in one mark.
 *
 * The last 2 are the other half of that: not what an effect gives but what it costs, in the 2 cases
 * where the cost is a gesture made to the card itself — laid on its side, or given up. The cards
 * print both of those as a symbol too, and it is the symbol a player has learnt to read on them.
 */
export { DiscardedPotion, ForceGem, GoldCoin, Laurel, MagicGem, Rider, TiltArrow, VillagerFigure }
