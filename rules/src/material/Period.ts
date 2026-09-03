/**
 * The game lasts 5 years split in 3 periods: 2 years for I, 2 for II, 1 for III.
 * Village and Encounter decks are built period by period, III at the bottom, I on top,
 * so a card's period is what its back shows.
 */
export enum Period {
  I = 1,
  II,
  III
}
