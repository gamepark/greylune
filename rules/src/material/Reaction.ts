import { Requirement } from './Effect'

/**
 * The moments a Companion or a Potion may step into an action already under way.
 *
 * Every reaction of the box hangs on one of these. Two of them are read a little more generously
 * than the cards word them, and for the same reason: what a Potion lends "when you go adventuring"
 * — 2 Magic, an ignored condition — is only ever worth anything when the Encounter is being
 * resolved, and nothing is learnt between leaving Greylune and arriving. So those are offered on
 * arrival, where the player can see what they are paying for, rather than before the first step.
 */
export enum TriggerType {
  /** The Adventurer is about to leave: Elwen lengthens the road, the Potion d'endurance fills the Village. */
  Travel = 1,
  /** An Encounter is being resolved: temporary skills and ignored conditions. */
  ResolveEncounter,
  /** The Encounter has been resolved: Mira. */
  AfterEncounter,
  /** An Object is being bought: Dorian. */
  BuyItem,
  /** A story is being told: Seren and the Charisma potion. */
  TellStory,
  /** Force is about to be spent: Kael. */
  SpendForce,
  /** Villagers are about to be spent on one of the player's own cards: Bran. */
  SpendVillagers,
  /** A Villager is being taken out of the Village: Neris. */
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
