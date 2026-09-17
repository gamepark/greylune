import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { playerCoins, playerForce, playerMagic, playerVp } from '@gamepark/greylune/material/PlayerState'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { StyledPlayerPanel, usePlay, usePlayer, usePlayerId, useRules } from '@gamepark/react-game'
import { Location, MaterialMoveBuilder } from '@gamepark/rules-api'
import { ForceGem, GoldCoin, Laurel, MagicGem } from '../images/IconImages'
import { playerPanelEms, playerPanelScale, playerPanelWidth } from '../locators/TableLayout'
import { playerColors } from '../PlayerColors'

/**
 * A player's panel, laid on the table with the panels of all the others, in the bottom right corner of
 * the player area. It is also how a player is read: the table has room for one area, and clicking a
 * panel lays out that player's material in it. It is a view change, nothing the others ever see, so
 * the move is played transiently and never leaves the browser.
 *
 * It carries the numbers a player would otherwise have to read off an area that may not be the one on
 * the table: their gold, which is a heap of coins of 2 values, their score, which is a marker on a
 * track plus the token it may have earned, and their Force and Magic, the 2 tracks of their board.
 *
 * All of them are badged with the symbol the game prints them with rather than with a piece: gold is
 * a heap of 2 coins and no single one of them is the amount, and a marker at badge size reads as a
 * marker and not as what it counts. The coin, the laurel and the 2 gems are the same marks the cards
 * are read with.
 */
export const PlayerPanelContent = ({ location }: { location: Location<PlayerColor, LocationType> }) => {
  const rules = useRules<GreyluneRules>()!
  const player = usePlayer<PlayerColor>(location.player)
  const me = usePlayerId<PlayerColor>()
  const play = usePlay()
  if (!player) return null

  const displayedPlayer = (rules.game.view as PlayerColor) ?? me ?? rules.players[0]

  return (
    <StyledPlayerPanel
      player={player}
      activeRing
      counters={[
        { image: GoldCoin, value: playerCoins(rules, player.id) },
        { image: Laurel, value: playerVp(rules, player.id) },
        { image: ForceGem, value: playerForce(rules, player.id) },
        { image: MagicGem, value: playerMagic(rules, player.id) }
      ]}
      countersPerLine={4}
      onClick={() => play(MaterialMoveBuilder.changeView(player.id), { transient: true })}
      css={[panelStyle, colouredPanel(playerColors[player.id]), selectablePanel, player.id === displayedPlayer && displayedPanel]}
    />
  )
}

/**
 * The 2 sizes StyledPlayerPanel would rather derive from one another: `font-size` scales the content —
 * 1 em buys `playerPanelScale` table units — and `width` overrides the 28 em box it is authored in, so
 * the box measures `playerPanelWidth` whatever the content is scaled at. The height is held to the one
 * the table reserved for the panel rather than left to the type inside it.
 */
const panelStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  font-size: ${playerPanelScale}em;
  width: ${playerPanelWidth / playerPanelScale}em;
  height: ${playerPanelEms}em;
`

/**
 * The panel is the player's colour, flat, lit from the top and darkened at the foot so that it reads as
 * a plate rather than a swatch. Nothing written on it is written on that colour — the name, the timer
 * and the counters are all set in their own dark badges — so the colour can be worn at full strength,
 * which is the point: 4 panels side by side are told apart at a glance, before a name is read.
 */
const colouredPanel = (colour: string) => css`
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.35), rgba(0, 0, 0, 0.4)), ${colour};
  /* The 2 outer shadows are StyledPlayerPanel's own, kept because setting box-shadow drops them. */
  box-shadow:
    0 0 0.5em black,
    0 0 0.5em black,
    inset 0 0 0 0.15em rgba(0, 0, 0, 0.55);
`

const selectablePanel = css`
  cursor: pointer;
  /* PlayerPanelDescription is a LocationDescription, and LocationComponent sets pointer-events: none on
   * the whole location unless it has an onShortClick/onLongClick, which this one does not. That would
   * swallow the onClick above by inheritance — restore it here. */
  pointer-events: auto;
`

/**
 * The player being read: the one whose material is laid out in the player area. The ring is white, and set
 * off the panel so that the dark of the table shows between the two — it has to be read against 4
 * colours at once, and any colour of its own would be lost on one of them.
 */
const displayedPanel = css`
  outline: 0.25em solid white;
  outline-offset: 0.25em;
`
