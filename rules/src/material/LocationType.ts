export enum LocationType {
  /** The main board, the Season board and the personal boards themselves. */
  MainBoard = 1,
  SeasonBoard,
  PlayerBoard,

  // ---------------------------------------------------------------- main board and its surroundings

  /** Face-down Village deck, period I on top. */
  VillageDeck,
  /** The 3x3 grid of face-up Village cards, `x` and `y` in 0..2. Villagers are placed in the gaps. */
  VillageGrid,
  VillageDiscard,
  /** Face-down Encounter deck, period I on top. */
  EncounterDeck,
  /** Revealed Encounters, one row per {@link Distance} carried by `id`. */
  EncounterRow,
  EncounterDiscard,
  /**
   * The Event tiles, stacked. The tile of the current year is the one on top, and it is the only one
   * turned face up: `rotation` is what says so, and it is what the rest of the pile is hidden by.
   */
  EventPile,
  /** The 3 Heroic Quest spaces of the main board, `id` being the {@link Distance} each one lies at. */
  QuestTileSpace,
  /**
   * Greylune itself, where the Adventurers start and return. One space for everybody, so they line
   * up on it: `x` is the rank in the row, and whose Adventurer it is, is its `id`.
   */
  Village,
  /**
   * The score track, `x` in 0..24. The markers of several players share a space when their scores
   * are equal, so they pile up on it: `z` is the rank in the pile. Whose marker it is, is its `id`.
   */
  ScoreTrack,
  /**
   * The 2 shields at the foot of the score track, where the victory point tokens wait: `id` is the
   * {@link VpTokenValue} of the pile, 25 or 75.
   */
  VpTokenStack,
  /** The unlimited bank. */
  CoinReserve,
  SealStack,
  IncomeTokenStock,
  /** The 4 Villagers per player that are set aside and not available yet. */
  VillagerReserve,

  // ---------------------------------------------------------------- season board

  /** The 3 season spaces of the Season board: `x` is a {@link Season}, `z` the rank in the pile. */
  SeasonTrack,
  /** Where spent Villagers rest until Autumn. */
  Camp,

  // ---------------------------------------------------------------- personal board and its surroundings

  /** Recruited Companions, to the left of the personal board. */
  Companions,
  /** Bought Objects, to the right of the personal board. */
  Items,
  /** Resolved Encounters not told yet, slid over the top-left of the personal board. */
  UntoldStories,
  /** Encounters already told in a Tavern, slid over the top-right of the personal board. */
  ToldStories,
  /** The Villagers a player may still use this year. */
  ActiveVillagers,
  /** Strength track of the personal board, `x` in 0..5. */
  StrengthTrack,
  /** Magic track of the personal board, `x` in 0..5. */
  MagicTrack,
  /** The 3 Heroic Quest marker spaces of the personal board, `x` in 0..2. */
  QuestMarkerSpace,
  /** The 3 Income token spaces of the personal board, `x` in 0..2. */
  IncomeTokenSpace,
  /** The special action space of the personal board. */
  SpecialAction,
  /** The 3 Bonus tokens, next to the personal board. */
  BonusTokens,
  PlayerCoins,
  PlayerVpTokens,
  FirstPlayerTokenSpace,

  /** Not material: where the display puts a player's panel, over their own area. */
  PlayerPanel
}
