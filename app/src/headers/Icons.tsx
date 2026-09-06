/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { BonusToken, Coin } from '@gamepark/greylune/material/Tokens'
import { getVillager } from '@gamepark/greylune/material/Villager'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { adventurerImages, MagicMarker, scoreMarkerImages, StrengthMarker, villagerImages } from '../images/PawnImages'
import { seasonImages } from '../images/SeasonImages'
import { QuestTileBack } from '../images/TileImages'
import { bonusTokenImages, coinImages } from '../images/TokenImages'

/**
 * The words the header would otherwise have to spell out, drawn from the material instead.
 *
 * The bar is one line that never wraps and is cut off with an ellipsis (see `Header`), and a sentence
 * that fits in French can still overrun in German: "Dorfbewohner" is 13 letters where "villageois" is
 * 10 and the pawn is 1 em. So everything the box has a piece for is shown as that piece, and only what
 * the material cannot say is left as text.
 *
 * The box prints no icon on its own — Force, Magic, the seasons and the rest are only ever inlaid in
 * the boards and the cards (see `images/README.md`) — so each of these is the smallest real piece that
 * says the thing: the marker that stands on a track, the pawn that walks, the token that is spent.
 */

/**
 * The player the coloured pieces are borrowed from: whoever is being waited for, and the reader
 * themselves when nobody is. A Villager and a score marker exist in 4 colours and in none, so the
 * icon is the one the sentence is about.
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

/** A coin of the denomination the sentence is about: the silver 1, or the gold 5. */
export const CoinIcon = ({ value = Coin.One, ...props }: { value?: Coin } & IconProps) => <Icon src={coinImages[value]} {...props} />

/** The marker that stands on the score track, which is the only piece the game gives a point. */
export const VpIcon = (props: IconProps) => {
  const player = useIconPlayer()
  return <Icon src={scoreMarkerImages[player]} {...props} />
}

export const ForceIcon = (props: IconProps) => <Icon src={StrengthMarker} {...props} />

export const MagicIcon = (props: IconProps) => <Icon src={MagicMarker} {...props} />

/** The first of the player's 7 figures: they are all Villagers, and no two are sculpted alike. */
export const VillagerIcon = (props: IconProps) => {
  const player = useIconPlayer()
  return <Icon src={villagerImages[getVillager(player, 1)]} {...props} />
}

export const AdventurerIcon = (props: IconProps) => {
  const player = useIconPlayer()
  return <Icon src={adventurerImages[player]} {...props} />
}

/** The back of the Heroic Quest tiles: the crown is what they all have in common. */
export const QuestIcon = (props: IconProps) => <Icon src={QuestTileBack} {...props} />

export const SeasonIcon = ({ season, ...props }: { season: Season.Spring | Season.Summer | Season.Autumn } & IconProps) => (
  <Icon src={seasonImages[season]} {...props} />
)

/** The Bonus token itself: what it pays is printed on it, and it is what the player is choosing. */
export const BonusTokenIcon = ({ token, ...props }: { token: BonusToken } & IconProps) => <Icon src={bonusTokenImages[token]} {...props} />
