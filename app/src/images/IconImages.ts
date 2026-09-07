import GoldCoin from './icons/Gold.png'
import MagicGem from './icons/Magic.png'
import Rider from './icons/Move.png'
import ForceGem from './icons/Strength.png'
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
 */
export { ForceGem, GoldCoin, Laurel, MagicGem, Rider, VillagerFigure }
