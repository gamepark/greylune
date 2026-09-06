import { css } from '@emotion/react'
import { defaultTheme, GameTheme } from '@gamepark/react-game'
import { colors } from './colors'
import { fontBody, fontDisplay } from './typography'

/**
 * How Greylune dresses everything the box does not print.
 *
 * The table is almost entirely parchment — the main board is a map, the cards are paper — so the
 * interface splits in two rather than pick one look. Furniture is **emerald under gold**: the header
 * bar, the menu, the buttons, the chat, all cut from the deck covers. Documents are **parchment**:
 * the dialogs, where a player reads a card's rules or the end-of-game score, and where dark ink on
 * pale paper is simply easier to read than the reverse.
 *
 * Gold is a border and never a surface. It is the filigree of the card backs, and at any size larger
 * than a rule it starts to look like the orange player (see `colors`).
 */

/** Emerald with a gold edge: the frame of a card, at the size of a button. */
const buttonBase = css`
  background: ${colors.emerald} !important;
  color: ${colors.parchmentLight} !important;
  border: 0.12em solid ${colors.gold} !important;
  border-radius: 0.3em !important;
  padding: 0.35em 0.9em !important;
  font-family: ${fontDisplay};
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow:
    0 0.15em 0.35em rgba(3, 51, 44, 0.35),
    inset 0 0.06em 0 rgba(250, 241, 226, 0.18);
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    transform 120ms ease;
  outline: none !important;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.emeraldLight} !important;
    border-color: ${colors.goldLight} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    border-color: ${colors.goldLight} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.emeraldDeep} !important;
    border-color: ${colors.goldDeep} !important;
    transform: translateY(0.05em);
    box-shadow: inset 0 0.08em 0.2em rgba(0, 0, 0, 0.35);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
`

/**
 * Parchment under a gold rule. The corner glow is the light the deck covers are lit from, and it is
 * what keeps a large sheet of paper from reading as a flat rectangle.
 */
const dialogContainer = css`
  border-radius: 0.5em;
  box-shadow:
    0 0 0 0.1em ${colors.gold},
    0 0 0 0.22em rgba(1, 106, 91, 0.45),
    0 0.7em 2em rgba(0, 0, 0, 0.55);
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.5em;
    background: radial-gradient(120% 90% at 0% 0%, rgba(176, 140, 58, 0.14), transparent 55%);
    pointer-events: none;
  }
`

/** The bar over the table: the deck cover, unrolled. */
const headerBar = css`
  background: linear-gradient(180deg, ${colors.emerald}, ${colors.emeraldDeep});
  color: ${colors.parchmentLight};
  font-family: ${fontDisplay};
  border-bottom: 0.12em solid ${colors.gold};
  box-shadow: 0 0.25em 0.6em rgba(0, 0, 0, 0.45);

  h1 {
    color: ${colors.parchmentLight};
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  b,
  strong {
    color: ${colors.goldLight};
  }
`

/** On the bar, a button is an outline: it must read as a choice, not as a second bar. */
const headerButtons = css`
  background: transparent !important;
  color: ${colors.parchmentLight} !important;
  border: 0.08em solid rgba(250, 241, 226, 0.55) !important;
  border-radius: 0.3em !important;
  font-family: ${fontDisplay};
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0 0.5em !important;
  cursor: pointer;
  box-shadow: none !important;
  outline: none !important;
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.goldLight} !important;
    color: ${colors.emeraldDeep} !important;
    border-color: ${colors.goldLight} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    border-color: ${colors.goldLight} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.gold} !important;
    color: ${colors.emeraldDeep} !important;
    border-color: ${colors.goldDeep} !important;
  }
`

const menuPanel = css`
  background: ${colors.parchment};
  color: ${colors.ink};
  border: 0.05em solid ${colors.goldDeep};
  box-shadow:
    0 0 0 0.1em rgba(1, 106, 91, 0.4),
    0 0.6em 1.5em rgba(0, 0, 0, 0.5);
  font-family: ${fontDisplay};

  h2 {
    color: ${colors.emerald};
    border-bottom: 0.1em solid ${colors.gold};
    padding-bottom: 0.3em;
    letter-spacing: 0.02em;
  }
`

const menuMainButton = css`
  background: ${colors.emerald} !important;
  color: ${colors.parchmentLight} !important;
  border: 0.12em solid ${colors.gold} !important;
  box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
  outline: none !important;

  &:hover:not(:disabled) {
    background: ${colors.emeraldLight} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.emeraldDeep} !important;
  }
`

const menuPopButton = css`
  background: ${colors.parchment};
  color: ${colors.emerald};
  font-family: ${fontDisplay};
  font-weight: 600;

  &:focus,
  &:hover {
    background: ${colors.emerald};
    color: ${colors.parchmentLight};
  }

  &:active {
    background: ${colors.emeraldDeep};
    color: ${colors.parchmentLight};
  }
`

const playerPanelPanel = css`
  background: ${colors.parchment};
  border: 0.08em solid ${colors.goldDeep};
  box-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.45);
`

const playerPanelDataBadge = css`
  background: rgba(3, 51, 44, 0.85) !important;
  color: ${colors.parchmentLight} !important;
  border: 0.08em solid ${colors.gold} !important;
  font-family: ${fontDisplay};
`

/** An entry of the journal is a line of a chronicle: paper, with a gold margin down its side. */
const journalHistoryEntry = css`
  border-radius: 0.35em;
  border-left: 0.2em solid ${colors.gold};
  background: rgba(1, 106, 91, 0.07);
  color: ${colors.ink};
`

export const theme: GameTheme = {
  ...defaultTheme,
  root: {
    fontFamily: fontBody,
    background: {
      image: '/cover-1920.jpg',
      // Greener and lighter than the default black: the cover art is the night Greylune sits in.
      overlay: 'rgba(3, 28, 24, 0.74)'
    }
  },
  palette: {
    primary: colors.emerald,
    primaryHover: colors.emeraldLight,
    primaryActive: colors.emeraldDeep,
    primaryLight: 'rgba(1, 106, 91, 0.08)',
    primaryLighter: 'rgba(1, 106, 91, 0.04)',
    surface: colors.parchment,
    onSurface: colors.ink,
    onSurfaceFocus: 'rgba(1, 106, 91, 0.12)',
    onSurfaceActive: 'rgba(1, 106, 91, 0.22)',
    danger: colors.crimson,
    dangerHover: colors.crimsonLight,
    dangerActive: '#E8BFBB',
    disabled: '#A2937C'
  },
  buttons: buttonBase,
  /** Gold rather than the framework's bright green: a space a piece may be dropped on lights up. */
  dropArea: { backgroundColor: 'rgba(217, 197, 131, 0.45)' },
  dialog: {
    backgroundColor: colors.parchment,
    color: colors.ink,
    container: dialogContainer,
    buttons: buttonBase,
    content: css`
      > h2 {
        font-family: ${fontDisplay};
        color: ${colors.emerald};
      }
    `
  },
  header: {
    bar: headerBar,
    buttons: headerButtons
  },
  menu: {
    panel: menuPanel,
    mainButton: menuMainButton,
    popButton: menuPopButton
  },
  journal: {
    tab: css`
      font-family: ${fontDisplay};
    `,
    tabSelected: css`
      color: ${colors.parchmentLight};
    `,
    chatBar: css`
      background: linear-gradient(180deg, ${colors.emerald}, ${colors.emeraldDeep});
    `,
    historyEntry: journalHistoryEntry
  },
  result: {
    border: colors.gold,
    icon: colors.gold,
    container: css`
      border-radius: 0.5em;
    `
  },
  tutorial: {
    container: css`
      border-radius: 0.5em;
    `
  },
  playerPanel: {
    /** The player being waited for is ringed in the two colours of a deck cover. */
    activeRingColors: [colors.gold, colors.emeraldLight],
    panel: playerPanelPanel,
    dataBadge: playerPanelDataBadge
  },
  timeStats: {
    thinkBackground: 'rgba(1, 106, 91, 0.1)',
    waitBackground: 'rgba(46, 33, 24, 0.08)'
  }
}
