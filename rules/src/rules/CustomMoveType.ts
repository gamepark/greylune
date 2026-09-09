/**
 * The decisions that move nothing on the table, or that need more than one piece named at once.
 *
 * Everything a player does to a piece is an item move — a Villager into a gap of the Village, the
 * Adventurer down the road, an Encounter slid over to the told stories. What is left is here: the
 * amounts, which are counted out as a consequence rather than written into the history coin by
 * coin, and the choices whose subject is a pair (this Villager, that card).
 */
export enum CustomMoveType {
  /**
   * Gaining coins. Data: the amount. The coins follow as its consequence, and the denominations
   * they are made of say nothing anyone wants to read: what a player gains is one amount, once.
   */
  GainCoins = 1,
  /** Gaining victory points. Data: the amount. The marker, the token and the Bonus tokens follow. */
  GainVp,
  /** Gaining Force, or Magic. Data: the amount. The track stops at 5. */
  GainForce,
  GainMagic,
  /** Gaining Villagers out of the reserve. Data: the amount. */
  GainVillagers,

  /**
   * Summer, "Gagner des pièces". Data: `{ villager, card }` — the Villager leaving the Village and
   * the card it designates, which pays 1 coin for every other Villager standing around it.
   */
  GainCoinsAround,

  /**
   * Summer, "Activer une carte". Data: `{ villager, card }` — the Villager leaving the Village and
   * the card it designates, which is then exploited, bought or recruited.
   */
  ActivateCard,

  /**
   * Which option of the card being activated, and the Seal it spends. Data:
   * `{ ability, seal?, value? }`, `value` being named only when Selia lets the player choose it.
   */
  ChooseAbility,

  /** Summer, "Utiliser un Objet". Data: `{ card, ability }`. */
  UseItem,

  /** Force or Magic, wherever a card leaves it open. Data: true for Force. */
  ChooseSkill,

  /**
   * Which Encounter of the row the Adventurer resolves. Data: the index of the card.
   *
   * The card first, its sides after (see {@link ResolveOutcome}): what a player picks out of the row
   * is a card, and a two-sided card offers up to 3 ways of paying for it that only read on the card
   * once it has been picked.
   */
  ChooseEncounter,

  /** Which side of an Encounter card is paid for. Data: `{ card, outcomes, ignored? }`. */
  ResolveOutcome,

  /** Taking the coin, the point or the Heroic Quest the space offers rather than an Encounter. */
  SkipEncounter,
  ResolveQuest,

  /** Closing what is open: a story, a reaction window, a journey with steps to spare. */
  Pass,

  /** Answering with a Companion or a Potion. Data: `{ card, option }`. */
  UseReaction,

  /** Which of the Bonus tokens left is spent. Data: the index of the token. */
  ChooseBonus,

  /**
   * What a Villager standing on the Event tile takes from it. Data: the index of the option.
   *
   * Only the Festival draws its options as spaces of its own, and there the choice is where the
   * Villager stands, so it is an item move. Every other tile prints its options as a line of icons
   * that no piece is ever put on: what is chosen is spent and gained at once and leaves nothing on
   * the table, so there is nothing to move and nothing to write down.
   */
  TakeEventOption,

  /**
   * What a Villager standing on the special action of the personal board takes from it. Data: the
   * index of the option.
   *
   * Same shape as {@link TakeEventOption}, and for the same reason: the board draws its 3 options as
   * a line of icons and gives them no space of their own, so the Villager is put down once and for
   * all and the choice leaves nothing on the table to read it off.
   */
  TakeSpecialAction
}
