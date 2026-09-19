import { css } from '@emotion/react'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { playerCoins, playerForce, playerMagic, playerSeason, playerVp } from '@gamepark/greylune/material/PlayerState'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { Season } from '@gamepark/greylune/Season'
import { StyledPlayerPanel, usePlay, usePlayer, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { Location, MaterialMoveBuilder } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { FirstPlayerMoon, ForceGem, GoldCoin, Laurel, MagicGem } from '../images/IconImages'
import { seasonImages } from '../images/SeasonImages'
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
 * are read with. They run in the order the game spends them — gold, Force, Magic — and end on the score.
 *
 * Over the second badge, 2 marks say where the player stands in the year: the banner of the season
 * their marker is in, and the moon of the first player token when they hold it — the moon alone, cut
 * out of its banner. While the year turns, the banner is Winter for everybody: the markers have no
 * space for it and stand on Spring all through it.
 *
 * A panel that is not the one read wears an eye on its inner edge, the one facing the area, so that it
 * reads as something to click and not as a plate of numbers only.
 */
export const PlayerPanelContent = ({ location }: { location: Location<PlayerColor, LocationType> }) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()!
  const player = usePlayer<PlayerColor>(location.player)
  const me = usePlayerId<PlayerColor>()
  const name = usePlayerName(location.player)
  const play = usePlay()
  if (!player) return null

  const displayedPlayer = (rules.game.view as PlayerColor) ?? me ?? rules.players[0]
  const season = rules.game.rule?.id === RuleId.Winter ? Season.Winter : playerSeason(rules, player.id)
  const isFirstPlayer = rules.material(MaterialType.FirstPlayerToken).getItem()?.location.player === player.id
  const bottomRow = rules.players.indexOf(player.id) < 2
  const read = () => play(MaterialMoveBuilder.changeView(player.id), { transient: true })

  return (
    <>
      <StyledPlayerPanel
        player={player}
        activeRing
        counters={[
          { image: GoldCoin, value: playerCoins(rules, player.id) },
          { image: ForceGem, value: playerForce(rules, player.id) },
          { image: MagicGem, value: playerMagic(rules, player.id) },
          { image: Laurel, value: playerVp(rules, player.id) }
        ]}
        countersPerLine={4}
        onClick={read}
        css={[panelStyle, colouredPanel(playerColors[player.id]), selectablePanel, player.id === displayedPlayer && displayedPanel]}
      />
      <div css={[panelStyle, marksBox]}>
        <div css={marksStyle} onClick={read}>
          <span title={t(`help.season-board.${Season[season].toLowerCase()}.name`)} css={markStyle}>
            <img src={seasonImages[season]} alt="" />
          </span>
          {isFirstPlayer && (
            <span title={t('panel.first-player')} css={markStyle}>
              <img src={FirstPlayerMoon} alt="" />
            </span>
          )}
        </div>
        {player.id !== displayedPlayer && (
          <div css={eyeTab(bottomRow, playerColors[player.id])} onClick={read} title={t('panel.show-player', { player: name })}>
            <FontAwesomeIcon icon={faEye} />
          </div>
        )}
      </div>
    </>
  )
}

/**
 * The marks are laid over the panel rather than in it — StyledPlayerPanel draws its own children — in a
 * box of the panel's own size, which lets every click through but the marks' own. The location lays
 * its children out in 3D, where 2 siblings on the same plane are hit in no reliable order whatever
 * the order they are painted in: the box is lifted off the panel by a hair so that the marks, and
 * their tooltips, are the ones the mouse finds.
 *
 * They are centred over the second of the 4 counters: the grid splits the 27 em inside the padding
 * into 4 columns 0.4 em apart, so that column runs from 7.35 to 13.8 em, and the counters row, 2.5 em
 * type in a padded badge, rises 4.3 em from the foot of the panel. The marks are as tall as those badges.
 */
const marksBox = css`
  pointer-events: none;
  transform: translateZ(0.01em);
`

const marksStyle = css`
  position: absolute;
  left: 10.575em;
  bottom: 4.8em;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 0.4em;
  pointer-events: auto;
  cursor: pointer;
`

/**
 * The eye: a half disc growing out of the edge of the panel that faces the player area — over the 2
 * panels at the foot of the area, under the 2 at its head — where the air between the panels and the
 * board leaves it room. It has to read as the panel itself bulging out, not as a piece stuck to it, so
 * nothing marks the joint:
 * - it is the colour the panel's gradient has on that edge, lit on top, darkened at the foot;
 * - it runs into the panel as deep as the panel's dark rim is wide and paints over it there, while its
 *   own rim follows the curve only, so the panel's rim goes round the bulge without a break;
 * - its shadow is clipped at the joint, where it would otherwise fall back on the panel.
 */
const panelRim = 0.15

const eyeTab = (bottomRow: boolean, colour: string) => css`
  position: absolute;
  left: 50%;
  ${bottomRow ? 'bottom' : 'top'}: calc(100% - ${panelRim}em);
  transform: translateX(-50%);
  width: 4.7em;
  height: 2.35em;
  border-radius: ${bottomRow ? '2.35em 2.35em 0 0' : '0 0 2.35em 2.35em'};
  border: ${panelRim}em solid rgba(0, 0, 0, 0.55);
  border-${bottomRow ? 'bottom' : 'top'}: none;
  box-sizing: border-box;
  background: linear-gradient(${bottomRow ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.4)'}, ${bottomRow ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.4)'}), ${colour};
  box-shadow: 0 0 0.5em black;
  clip-path: inset(${bottomRow ? '-1em -1em 0 -1em' : '0 -1em -1em -1em'});
  display: flex;
  justify-content: center;
  align-items: center;
  padding-${bottomRow ? 'top' : 'bottom'}: 0.3em;
  pointer-events: auto;
  cursor: pointer;

  > svg {
    font-size: 1.5em;
    color: rgba(0, 0, 0, 0.7);
  }

  &:hover > svg {
    color: black;
  }
`

/**
 * Set in the dark badge the counters are set in, so that neither is read against the player's colour.
 * The badge carries the tooltip, not the image: the zoom of the table sets `pointer-events: none` on
 * every image it holds, so an image is never hovered.
 */
const markStyle = css`
  display: flex;
  padding: 0.3em;
  border-radius: 0.4em;
  background-color: rgba(0, 0, 0, 0.7);

  > img {
    height: 3em;
    width: auto;
  }
`

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
