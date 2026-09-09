export enum LocationType {
  /** The main board, the Season board and the personal boards themselves. */
  MainBoard = 1,
  SeasonBoard,
  PlayerBoard,

  // ---------------------------------------------------------------- main board and its surroundings

  /** Face-down Village deck, period I on top. */
  VillageDeck,
  /** The 3x3 grid of face-up Village cards, `x` and `y` in 0..2. */
  VillageGrid,
  /**
   * The gaps of the Village grid, where the Villagers are placed. A gap lies between two neighbouring
   * slots of the grid, and is named by the point halfway between them: one of `x` and `y` is a whole
   * number, the other a half. Any number of Villagers, of any players, may stand in one gap.
   */
  VillageGap,
  /** Face-down Encounter deck, period I on top. */
  EncounterDeck,
  /** Revealed Encounters, one row per {@link Area} carried by `id`. */
  EncounterRow,
  /**
   * The Event tiles, stacked. The tile of the current year is the one on top, and it is the only one
   * turned face up: `rotation` is what says so, and it is what the rest of the pile is hidden by.
   */
  EventPile,
  /**
   * The Event tile of the year, where a Villager is placed to take part in it: `parent` is the tile.
   *
   * `x` is one of the Festival's 5 printed spaces, and nothing at all on any other tile: an option
   * that leaves no piece on the table is spent and gained on the spot and never written down. So the
   * Festival holds one Villager per space, and every other tile a little crowd in its middle — one
   * per player, `z` being the rank among them.
   *
   * The tile belongs to nobody, and neither does the space: whose a Villager is, is sculpted into
   * the figure (see {@link Villager}).
   */
  EventSpace,
  /** The 3 Heroic Quest spaces of the main board, `id` being the {@link Area} each one lies at. */
  QuestTileSpace,
  /**
   * The 2 shields under a Quest space, where the markers of the players who achieved it stand: `id`
   * is the {@link Area} of the space, and `x` is 0 for the shield of the first player to get
   * there, which pays more, or 1 for the one everybody after them shares.
   */
  QuestRewardSpace,
  /**
   * The areas of the main board, where the Adventurers stand: `id` is the {@link Area}, Greylune
   * itself included. One board for everybody, so several Adventurers share an area as soon as they
   * are level: `z` is the rank in the pile, and whose Adventurer it is, is the item's own `id`.
   */
  Area,
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
  /**
   * The Seals already spent. The supply is drawn from the stack first and from here when it runs
   * short, which is what the rulebook does by reshuffling the discard into a new pile (p.6).
   */
  SealDiscard,
  IncomeTokenStock,
  /** The Seal tokens laid on a Village card, `parent` being the card. */
  CardSeal,
  /** The Income token laid on an Encounter card, `parent` being the card. */
  CardIncome,
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
  /** Resolved Encounters not told yet, pushed under the top-left of the personal board. */
  UntoldStories,
  /** Encounters already told in a Tavern, pushed under the top-right of the personal board. */
  ToldStories,
  /** The Villagers a player may still use this year. */
  ActiveVillagers,
  /** Strength track of the personal board, `x` in 0..5. */
  StrengthTrack,
  /** Magic track of the personal board, `x` in 0..5. */
  MagicTrack,
  /** The 3 Heroic Quest marker spaces of the personal board, `x` in 0..2. */
  QuestMarkerSpace,
  /** The Income tokens won, laid along the bottom of the personal board. */
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
