import { Requirement } from './Effect'

/**
 * The moments a Companion or a Potion may step into an action already under way.
 *
 * Every reaction of the box hangs on one of these. Four cards are worded "when you go adventuring"
 * and none of them is offered at the first step, because none of them can be answered there. What a
 * Potion lends — 2 Magic, an ignored condition — is only ever worth anything while the Encounter is
 * resolved, and nothing is learnt between leaving Greylune and arriving, so those are offered on
 * arrival, where the player sees what they are paying for. What Mira and the Potion d'endurance put
 * back in the Village may be a Villager the Encounter has just handed over, which the appendix says
 * in as many words, so those are offered once the road is behind. Elwen alone is answered at the
 * departure, because the length of the road is what she changes.
 */
export enum TriggerType {
  /** The Adventurer is about to leave: Elwen lengthens the road. */
  Travel = 1,
  /**
   * The journey is over and everything it paid has been handed over: Mira and the Potion
   * d'endurance. Both are worded "when you go adventuring" and both put an active Villager in the
   * Village, and the appendix says which Villager that may be — one the Encounter has just handed
   * over. So the window belongs to the departure and is only opened at the end of the road, where
   * the player has everything the journey gave to choose from.
   */
  TravelDone,
  /** An Encounter is being resolved: temporary skills and ignored conditions. */
  ResolveEncounter,
  /** An Object is being bought: Dorian. */
  BuyItem,
  /** A story is being told: Seren and the Charisma potion. */
  TellStory,
  /** Force is about to be spent: Kael. */
  SpendForce,
  /** Villagers are about to be spent on one of the player's own cards: Bran. */
  SpendVillagers,
  /** A Villager is being taken out of the Village and onto the camp: Neris. Never the Event tile. */
  RemoveVillager,
  /** A Seal is being spent: Selia. */
  ActivateSeal,
  /** Force or Magic is being gained: Lucan. */
  GainSkill,
  /** One of the player's own cards has just been tilted: Isandre. */
  TiltCard
}

export enum ReactionType {
  /** Elwen: the Adventurer goes that many spaces further. */
  ExtraTravel = 1,
  /** Mira, Potion d'endurance: an active Villager is placed in the Village. */
  PlaceVillager,
  /** The Potions: skill levels that count for a condition but can never be spent. */
  TemporarySkills,
  /** Ariok, Potion d'invisibilité: one condition of the Encounter is taken as met. */
  IgnoreCondition,
  /** Seren, Charisma potion: one Encounter of the story is told as if it were worth 3. */
  StoryValue3,
  /** Kael: one Force less to pay. */
  ReduceForceCost,
  /** Bran: one Villager less to spend on one's own card. */
  ReduceVillagerCost,
  /** Dorian: the Object costs 1 coin less and is worth 1 victory point. */
  CheaperItem,
  /** Neris: 2 more coins out of the Villager leaving the Village. */
  ExtraCoins,
  /** Neris: the Villagers standing around the card are not paid for. */
  NoSurcharge,
  /** Lucan: gaining one skill gains the other. */
  OtherSkill,
  /** Selia: the Seal is spent at whichever value the player names. */
  ChooseSealValue,
  /** Isandre: the card just tilted stands straight again, ready to be used once more. */
  StraightenTilted
}

export type ReactionEffect =
  | { type: ReactionType.ExtraTravel | ReactionType.ExtraCoins; count: number }
  | { type: ReactionType.TemporarySkills; force?: number; magic?: number }
  | {
      type:
        | ReactionType.PlaceVillager
        | ReactionType.IgnoreCondition
        | ReactionType.StoryValue3
        | ReactionType.ReduceForceCost
        | ReactionType.ReduceVillagerCost
        | ReactionType.CheaperItem
        | ReactionType.NoSurcharge
        | ReactionType.OtherSkill
        | ReactionType.ChooseSealValue
        | ReactionType.StraightenTilted
    }

/**
 * A reaction printed at the bottom of a Companion, or the one thing a Potion is drunk for. `options`
 * holds more than one entry only when the card offers a choice, which only Neris does.
 */
export type Reaction = { triggers: TriggerType[]; requirements: Requirement[]; options: ReactionEffect[] }

export const reaction = (triggers: TriggerType[], requirements: Requirement[], ...options: ReactionEffect[]): Reaction => ({
  triggers,
  requirements,
  options
})
