import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { playerCoins, playerVp } from '@gamepark/greylune/material/PlayerState'
import { Coin } from '@gamepark/greylune/material/Tokens'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { StyledPlayerPanel, usePlay, usePlayer, usePlayerId, useRules } from '@gamepark/react-game'
import { Location, MaterialMoveBuilder } from '@gamepark/rules-api'
import { scoreMarkerImages } from '../images/PawnImages'
import { coinImages } from '../images/TokenImages'
import { showsAllBandsFor } from '../locators/DisplayedPlayer'
import { playerPanelEms, playerPanelScale, playerPanelWidth } from '../locators/TableLayout'
import { playerColors } from '../PlayerColors'

/**
 * A player's panel, laid on the table over their own area rather than floating over it in a corner of
 * the screen. Past 2 players it is also how the material above a board is chosen: clicking a panel
 * reads that player. It is a view change, nothing the others ever see, so the move is played
 * transiently and never leaves the browser. At 2 players every band is out at once and a panel is
 * nothing but a read-out.
 *
 * It carries the 2 numbers a player is never asked to count off the table: their gold, which is a heap
 * of coins of 2 values, and their score, which is a marker on a track plus the token it may have
 * earned. Everything else a panel could show is already legible on the board it sits on.
 *
 * The gold is counted in units and shown under the 5 coin: the 1 is struck in silver, and at the size
 * of a badge icon a silver disc says nothing, where the gold one says money at a glance. The score is
 * shown under the player's own marker, the piece standing on the track the number is read off.
 */
export const PlayerPanelContent = ({ location }: { location: Location<PlayerColor, LocationType> }) => {
  const rules = useRules<GreyluneRules>()!
  const player = usePlayer<PlayerColor>(location.player)
  const me = usePlayerId<PlayerColor>()
  const play = usePlay()
  if (!player) return null

  const selectable = !showsAllBandsFor(rules.players.length)
  const displayedPlayer = (rules.game.view as PlayerColor) ?? me ?? rules.players[0]

  return (
    <StyledPlayerPanel
      player={player}
      activeRing
      counters={[
        { image: coinImages[Coin.Five], value: playerCoins(rules, player.id) },
        { image: scoreMarkerImages[player.id], value: playerVp(rules, player.id) }
      ]}
      countersPerLine={2}
      onClick={selectable ? () => play(MaterialMoveBuilder.changeView(player.id), { transient: true }) : undefined}
      css={[panelStyle, colouredPanel(playerColors[player.id]), selectable && selectablePanel, selectable && player.id === displayedPlayer && displayedPanel]}
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
 * which is the point: 4 panels down a column are told apart at a glance, before a name is read.
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
 * The player being read: the one whose material is out above their board. The ring is white, and set
 * off the panel so that the dark of the table shows between the two — it has to be read against 4
 * colours at once, and any colour of its own would be lost on one of them.
 */
const displayedPanel = css`
  outline: 0.25em solid white;
  outline-offset: 0.25em;
`
