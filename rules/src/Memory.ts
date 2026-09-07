/**
 * What the rules have to remember beyond the position of the material and the current rule.
 *
 * Everything here belongs to the action being played and is dropped when it ends: the queue of what
 * the action still owes, and the few things a card can lend for the length of one adventure. Nothing
 * outlives a turn — which year is being played is read off the Encounter deck (see {@link Year}).
 */
export enum Memory {
  /**
   * The gains the current action still owes the player, in the order they will be handed over.
   * See {@link ResolveEffectsRule}.
   */
  Gains = 1,

  /** The gain being resolved, when the rule that resolves it needs to read it back. */
  CurrentGain,

  /** The Village card a Villager has just designated, while its price is settled and it resolves. */
  ActivatedCard,

  /** The last card of the player to have gone down, which is the one Isandre stands back up. */
  LastTilted,

  /** Which option of the card being used, when it offers more than one. */
  Ability,

  /** The Villager taken out of the Village by the action being played, before it reaches the camp. */
  SpentVillager,

  /** How far the Adventurer may still travel. */
  TravelLeft,

  /**
   * That the action took the Adventurer out of Greylune. Set when the journey starts and read when
   * the action has nothing left to hand over, which is when the cards that answer a journey are
   * offered (see {@link TriggerType.TravelDone}).
   */
  WentAdventuring,

  /** The rewards a Tavern pays, one per story value, and what the story told is worth so far. */
  StoryRewards,
  StoryValue,
  /** Set by Seren or a Charisma potion: the next Encounter told counts as a 3. */
  StoryBoost,

  /** How many Encounters the Heroic Quest of the Bardes still asks to be told. */
  StoriesOwed,

  /**
   * What a Potion lends for the length of one adventure: skill levels that count towards the
   * condition of an Encounter but cannot be spent, and conditions that may be ignored outright.
   */
  TemporaryForce,
  TemporaryMagic,
  IgnoredConditions,

  /** The triggers the reaction window is open on. */
  Trigger,

  /** The rule to go back to once a window, or a side step, is over. */
  Resume,

  /** What a reaction has promised the cost about to be paid: Force, Villagers, coins. */
  CostReduction,

  /** The value the Seal of the activation is spent at. */
  SealValue
}
