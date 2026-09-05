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

  /** Spring, or Summer: the player moves on to the next season and acts there at once. */
  ChangeSeason,

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

  /** Which side of an Encounter card is paid for. Data: the index of the outcome. */
  ResolveOutcome,

  /** Taking the coin, the point or the Heroic Quest the space offers rather than an Encounter. */
  SkipEncounter,
  ResolveQuest,

  /** Closing what is open: a story, a reaction window, a journey with steps to spare. */
  Pass,

  /** Answering with a Companion or a Potion. Data: `{ card, option }`. */
  UseReaction,

  /** Which of the Bonus tokens left is spent. Data: the index of the token. */
  ChooseBonus
}
