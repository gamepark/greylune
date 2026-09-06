/**
 * Greylune's own colours, picked off the printed material rather than chosen.
 *
 * The box has one signature, and it is on the back of every Village and Encounter card: a deep
 * emerald ground under an antique-gold filigree, over parchment. Everything the interface draws for
 * itself — the header bar, the menu, the dialogs, the buttons — is made of those three, so that the
 * chrome and the table look like the same game.
 *
 * The one rule the palette obeys is to stay away from what the material already means. The four
 * player identities are cyan, orange, red and purple (see `PlayerColors`), and a marker of one of
 * those colours must never be mistaken for a piece of interface. Emerald is free — no player is
 * green — and that is why it carries the theme. The gold is deliberately the *filigree* gold of the
 * card backs, olive and antique, and not the bright gold of the coins: that one is all but the
 * orange player's colour.
 */
export const colors = {
  /** The ground of the deck covers and the frame of every Encounter card. */
  emerald: '#016A5B',
  /** Panels, the header bar: the same green with the light taken out of it. */
  emeraldDeep: '#03332C',
  emeraldLight: '#3E8C7C',

  /** The filigree drawn over the deck covers. Borders and rules, never a large fill. */
  gold: '#B08C3A',
  goldDeep: '#7A5F22',
  goldLight: '#D9C583',

  /** The paper of the cards, of the main board, and of anything meant to be read. */
  parchment: '#F1E1CA',
  parchmentLight: '#FAF1E2',
  parchmentDeep: '#DFCCA8',

  /** What is written on parchment. */
  ink: '#2E2118',
  /** A line drawn on parchment: the same ink, almost gone. */
  rule: 'rgba(46, 33, 24, 0.14)',
  /** A panel laid on parchment. */
  wash: 'rgba(46, 33, 24, 0.06)',

  /** The red of an Object's title. Warnings, and losing something. */
  crimson: '#922A27',
  crimsonLight: '#F3DCD9',
  crimsonDeep: '#5E1917'
}

/**
 * The ink each kind of Village card has its name printed in, and the emerald every Encounter card is
 * framed in. A help dialog wears the colour of the card it is about, so the two read as one object.
 */
export const cardInk = {
  building: '#774423',
  item: '#9E372F',
  companion: '#116A93',
  encounter: colors.emerald,
  /** The green band of an Event scroll, and the brick frame of a Heroic Quest. */
  event: '#2AA34C',
  quest: '#94332C'
}

/**
 * A colour as the `r, g, b` triple a css rule needs when only the alpha changes from one state to
 * the next — `rgba(${rgbOf(colors.gold)}, 0.3)` — which css variables cannot do inside `rgba()`.
 */
export const rgbOf = (hex: string): string => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')
