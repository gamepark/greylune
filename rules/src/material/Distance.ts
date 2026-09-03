/**
 * How far from Greylune an Encounter takes place: the banner printed in the top-left corner of the
 * card, which tells where to lay it along the right edge of the main board.
 * Ordered from the road just outside the Village (Gold) to the far reaches (Black).
 */
export enum Distance {
  /** Gold banner, wand */
  Gold = 1,
  /** Green banner, bow */
  Green,
  /** Purple banner, winged hammer */
  Purple,
  /** Red banner, crossed swords */
  Red,
  /** Black banner, eye and sword */
  Black
}
