/**
 * The areas the board is divided in: Greylune itself, then the five stretches of road out of it,
 * each named after the symbol printed on its banner and on the Encounter cards met there.
 * Ordered from home to the far reaches, which is also the order the Adventurer walks them in.
 */
export enum Area {
  /** Greylune, where every Adventurer starts and comes home to. */
  Village = 0,
  /** Gold banner, wand. */
  Wand,
  /** Green banner, bow. */
  Bow,
  /** Purple banner, winged hammer. */
  Hammer,
  /** Red banner, crossed swords. */
  Swords,
  /** Black banner, eye and sword. */
  Edge
}
