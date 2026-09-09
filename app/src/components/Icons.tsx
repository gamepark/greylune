/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { BonusToken, IncomeToken, Seal } from '@gamepark/greylune/material/Tokens'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { usePlayerId, useRules } from '@gamepark/react-game'
import {
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
} from '../images/IconImages'
import { adventurerImages } from '../images/PawnImages'
import { seasonImages } from '../images/SeasonImages'
import { QuestTileBack } from '../images/TileImages'
import { bonusTokenImages, incomeTokenImages, sealImages, SealBack } from '../images/TokenImages'

/**
 * The words a sentence would otherwise have to spell out, drawn from the material instead.
 *
 * Written for the header bar, and used by the help dialogs for the same reason. The bar is one line
 * that never wraps and is cut off with an ellipsis (see `Header`), and a sentence that fits in French
 * can still overrun in German: "Dorfbewohner" is 13 letters where "villageois" is 10 and the pawn is
 * 1 em. So whatever the material can say is drawn rather than written, and only what it cannot say is
 * left as text. The help dialogs spell out cards that carry no text at all, and the
 * same pieces are what tie a sentence back to what the player is looking at.
 *
 * Some are the piece itself, when one piece is what the sentence means: the Adventurer that walks,
 * the token that is spent, the tile that is chosen. The rest are drawn as the symbol the boards and
 * the cards print them with (see {@link IconImages}) — Force, Magic, victory points and the road,
 * which the box gives no piece for, and gold and the Villagers, which come in several pieces where a
 * sentence means only an amount.
 */

/**
 * The player the coloured pieces are borrowed from: whoever is being waited for, and the reader
 * themselves when nobody is. The Adventurer exists in 4 colours and in none, so the icon is the one
 * the sentence is about.
 */
const useIconPlayer = (): PlayerColor => {
  const rules = useRules<GreyluneRules>()!
  const me = usePlayerId<PlayerColor>()
  return rules.game.rule?.player ?? me ?? rules.players[0]
}

type IconProps = { className?: string }

/**
 * `Header` already sizes every image it holds to 1 em; this restates it so that an icon keeps its
 * size inside a button, and sits it on the baseline of the capitals rather than under them.
 */
const iconCss = css`
  height: 1em;
  width: auto;
  vertical-align: -0.15em;
`

const Icon = ({ src, className }: { src: string } & IconProps) => <img src={src} alt="" css={iconCss} className={className} />

/** Money, as the cards print it: a sentence says how much, never in which coins it is paid. */
export const CoinIcon = (props: IconProps) => <Icon src={GoldCoin} {...props} />

/** The laurel a victory point is printed as, wherever the game hands one out. */
export const VpIcon = (props: IconProps) => <Icon src={Laurel} {...props} />

export const ForceIcon = (props: IconProps) => <Icon src={ForceGem} {...props} />

export const MagicIcon = (props: IconProps) => <Icon src={MagicGem} {...props} />

/**
 * The same gems with the arrow the cards draw them under when the level moves: green and above for a
 * step up, red and below for a step down. They are the symbol for *one* step, arrow included, so
 * nothing is written in front of them — which is how the cards print them, and there is no card that
 * hands over or asks for more than one step at a time bar a single one.
 */
export const ForceUpIcon = (props: IconProps) => <Icon src={ForceGemUp} {...props} />
export const ForceDownIcon = (props: IconProps) => <Icon src={ForceGemDown} {...props} />
export const MagicUpIcon = (props: IconProps) => <Icon src={MagicGemUp} {...props} />
export const MagicDownIcon = (props: IconProps) => <Icon src={MagicGemDown} {...props} />

/** A story to be told: the book the personal board prints, ticked, for the Tavern it opens. */
export const StoryIcon = (props: IconProps) => <Icon src={StoryBook} {...props} />

/**
 * The road, as the box draws it: the rider with the distance cut into it. There is one drawing per
 * distance and no figure is ever written beside it (see {@link riderImages}); the bare rider is for
 * a journey whose length is not a number anybody can read yet.
 */
export const TravelIcon = ({ count, ...props }: { count?: number } & IconProps) => (
  <Icon src={(count !== undefined && riderImages[count]) || Rider} {...props} />
)

/**
 * A Villager, as the cards print one. The figures are sculpted 7 different ways and come in the 4
 * colours, and none of those is what a sentence means: it means a Villager, any Villager.
 */
export const VillagerIcon = (props: IconProps) => <Icon src={VillagerFigure} {...props} />

/**
 * The hooked arrow the cards print in front of everything an Object, or a Companion, is laid on its
 * side for. It is the gesture rather than the effect — every use of a card costs the same one — so it
 * goes on the button doing it rather than in what the button says.
 */
export const TiltIcon = (props: IconProps) => <Icon src={TiltArrow} {...props} />

/** The same place in the sentence, for a Potion: it is emptied rather than tilted, and never comes back. */
export const DiscardedPotionIcon = (props: IconProps) => <Icon src={DiscardedPotion} {...props} />

export const AdventurerIcon = (props: IconProps) => {
  const player = useIconPlayer()
  return <Icon src={adventurerImages[player]} {...props} />
}

/**
 * A Seal token. The blank back is the token as a card names it, before it is known what it is worth;
 * a value turns it into the very token lying on the card.
 */
export const SealIcon = ({ value, ...props }: { value?: Seal } & IconProps) => <Icon src={value ? sealImages[value] : SealBack} {...props} />

/** The Income token an Encounter carries, on its income face: what it pays is drawn on it. */
export const IncomeTokenIcon = ({ token, ...props }: { token: IncomeToken } & IconProps) => <Icon src={incomeTokenImages[token]} {...props} />

/** The back of the Heroic Quest tiles: the crown is what they all have in common. */
export const QuestIcon = (props: IconProps) => <Icon src={QuestTileBack} {...props} />

export const SeasonIcon = ({ season, ...props }: { season: Season.Spring | Season.Summer | Season.Autumn } & IconProps) => (
  <Icon src={seasonImages[season]} {...props} />
)

/** The Bonus token itself: what it pays is printed on it, and it is what the player is choosing. */
export const BonusTokenIcon = ({ token, ...props }: { token: BonusToken } & IconProps) => <Icon src={bonusTokenImages[token]} {...props} />
