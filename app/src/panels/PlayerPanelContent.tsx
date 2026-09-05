import { css } from '@emotion/react'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { StyledPlayerPanel, usePlay, usePlayer, usePlayerId, useRules } from '@gamepark/react-game'
import { Location, MaterialMoveBuilder } from '@gamepark/rules-api'
import { showsAllBandsFor } from '../locators/DisplayedPlayer'
import { playerPanelScale, playerPanelWidth } from '../locators/TableLayout'

/**
 * A player's panel, laid on the table over their own area rather than floating over it in a corner of
 * the screen. Past 2 players it is also how the material above a board is chosen: clicking a panel
 * reads that player. It is a view change, nothing the others ever see, so the move is played
 * transiently and never leaves the browser. At 2 players every band is out at once and a panel is
 * nothing but a read-out.
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
      onClick={selectable ? () => play(MaterialMoveBuilder.changeView(player.id), { transient: true }) : undefined}
      css={[panelStyle, selectable && selectablePanel, selectable && player.id === displayedPlayer && displayedPanel]}
    />
  )
}

/**
 * The 2 sizes StyledPlayerPanel would rather derive from one another: `font-size` scales the content —
 * 1 em buys `playerPanelScale` table units — and `width` overrides the 28 em box it is authored in, so
 * the box measures `playerPanelWidth` whatever the content is scaled at.
 */
const panelStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  font-size: ${playerPanelScale}em;
  width: ${playerPanelWidth / playerPanelScale}em;
`

const selectablePanel = css`
  cursor: pointer;
  /* PlayerPanelDescription is a LocationDescription, and LocationComponent sets pointer-events: none on
   * the whole location unless it has an onShortClick/onLongClick, which this one does not. That would
   * swallow the onClick above by inheritance — restore it here. */
  pointer-events: auto;
`

/** The player being read: the one whose material is out above their board. */
const displayedPanel = css`
  outline: 0.3em solid #f0c04a;
  outline-offset: 0.2em;
`
