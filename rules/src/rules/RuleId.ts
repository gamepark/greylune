/**
 * A year runs through the 4 seasons of {@link Season}, but the players do not run through them
 * together: each one moves on when they decide to. So the first four rules are not phases everybody
 * shares — each is the season of the player whose turn it is. On their turn a player takes exactly
 * one of the actions their own season allows, then the turn passes to the left, skipping whoever has
 * already reached Autumn. The year ends when the last player gets there.
 *
 * The rules that follow are the decisions an action leaves open once it is taken. They belong to the
 * player who is acting and hand the turn back through {@link RuleId.ResolveEffects}, which is where
 * every action ends.
 *
 * The final scoring is deliberately not a rule: the victory points of the Quests, the Companions,
 * the Objects and the skills are read off the state at the end of the 5th year. They are computed,
 * not played (see `finalScore`).
 */
export enum RuleId {
  // ------------------------------------------------------------------------------- the four seasons

  /**
   * The turn of the year, and the only rule where nobody chooses anything: the Village cards, the
   * Encounters and the Event tile of the past year are discarded, the 9 new Village cards are laid
   * out and receive their Seal tokens, the next Event is turned face up, the Encounter row is dealt
   * again, every Season marker goes back to Spring and the first player token passes to the left.
   * The first year is no exception: the setup builds the decks and the piles, and this rule lays the
   * year on the table — it simply finds nothing to put away.
   */
  Winter = 1,

  /**
   * A player still in Spring: place one of their active Villagers in a gap of the Village grid, take
   * part in the Event, or move on to Summer — which is free and immediately followed by a Summer
   * action, and cannot be taken back.
   */
  Spring,

  /**
   * A player in Summer: gain coins around one of their Villagers, activate a Village card next to
   * one of them, take part in the Event, use one of their Objects, use the special action of their
   * personal board, or move on to Autumn.
   */
  Summer,

  /**
   * The end of a player's year, entered from Summer and resolved at once: the Adventurer comes home
   * to Greylune, the Villagers come back from the camp, the Event and the special action, every card
   * is straightened, and the income is paid — 3 coins, less 1 per Companion, plus what the Income
   * tokens give. The player acts no more until the year ends. Only a player with no Villager left in
   * the Village may come here.
   */
  Autumn,

  // ------------------------------------------------------ the actions that leave a decision to make

  /**
   * A Village card has been designated by one of the player's Villagers standing next to it: the
   * option and the Seal to spend are chosen here, the price is paid — the card's own, plus 1 coin
   * for every other Villager next to it — and the card is then exploited if it is a Building, bought
   * if it is an Object, or recruited if it is a Companion.
   */
  ActivateCard,

  /** One of the player's Objects is tilted, and what it asks for is paid before it gives. */
  UseItem,

  /**
   * An Object has to go back in the box: the purchase took the player over their limit, or a Heroic
   * Quest asked for it.
   */
  DiscardItem,

  /**
   * The Event tile of the year, once a Villager has been placed on it — in Spring or in Summer, and
   * once a year for each player. The Villager stands on the option it pays for.
   */
  Event,

  // ---------------------------------------------------------- what many cards and effects lead into

  /**
   * The Adventurer goes, or goes further: up to as many spaces as the effect allows, in the
   * direction of the player's choice, staying put being a choice too. Where it stops is where an
   * Encounter may be resolved.
   */
  Travel,

  /**
   * The Adventurer has stopped at a {@link Area}: the player may resolve one Encounter of that
   * row by satisfying one of its two sides, or both to gain both rewards, and pushes it under their
   * personal board as a story not told yet. They may also refuse it, for what the space itself
   * offers instead: 1 coin, 1 victory point, or the Heroic Quest lying there.
   */
  ResolveEncounter,

  /**
   * Which side of the Encounter just named is paid for, when the player can afford more than one
   * way. Only the 7 two-sided cards ever get here; every other Encounter is resolved the moment it
   * is named.
   */
  ChooseOutcome,

  /**
   * A Heroic Quest, taken instead of an Encounter on the space it lies on, and only once per player:
   * the player meets its condition, then puts one of their 3 Quest markers on the shield worth the
   * most points if they are the first to achieve it, on the one beside it otherwise.
   */
  ResolveQuest,

  /**
   * A Tavern is open, or the special action taken: the player picks, among the Encounters slid over
   * their personal board, those whose story values add up to 3 at most, and is paid by tiers. The
   * cards told slide to the right and are spent for the rest of the game.
   */
  TellStory,

  /** An effect straightens a tilted card back: the player chooses which one. */
  StraightenCard,

  /** An effect puts an active Villager back in the Village: the player chooses the gap. */
  PlaceVillager,

  /** Force or Magic, wherever a card leaves it open. */
  ChooseSkill,

  /**
   * Reaching 8, then 20 victory points: the player chooses one of their Bonus tokens, resolves it
   * and puts it back in the box — at 20, the ones left over go back too.
   */
  BonusToken,

  /**
   * A window where the player may answer what is happening with a Companion or a Potion, as many
   * times as they have cards to spend on it, and then let it close.
   */
  Reaction,

  /**
   * Not a step of the rulebook: the queue of everything the action still owes the player. It hands
   * over whatever needs no decision and starts the rule that does, one gain at a time, until the
   * action is over and the turn passes.
   */
  ResolveEffects
}
