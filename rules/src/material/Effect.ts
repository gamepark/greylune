import { TriggerType } from './Reaction'
import type { IncomeToken } from './Tokens'

/**
 * What the cards, the tiles and the spaces of the board hand out, and what they ask for in return.
 *
 * Both are data rather than code: every Building, Object, Companion, Encounter, Event and Heroic
 * Quest of the box is described with the few shapes below, and one resolver applies them. A gain
 * that needs no decision is handed over on the spot; the handful that leave a choice each have a
 * rule of their own (see {@link RuleId}).
 *
 * {@link Effect} is where the two meet, and the same one serves every card of the box: only the
 * field that holds it changes name from one kind of card to the next, because a half of an Encounter
 * and an option of a Building are not called the same thing at the table.
 */

export enum GainType {
  Coins = 1,
  Vp,
  Force,
  Magic,
  /** Force or Magic, the player choosing which. */
  Skill,
  /** Villagers taken out of the reserve and into the active zone. */
  Villager,
  /** The Adventurer travels up to that many spaces. */
  Travel,
  /** One tilted card of the player is straightened. */
  Straighten,
  /** One active Villager is placed in a gap of the Village. */
  PlaceVillager,
  /** A Tavern is open: the player tells a story worth 3 at most and is paid by tiers. */
  TellStory,
  /** Victory points counted on what the player owns. */
  Score,
  /**
   * Printed on nothing: the score has crossed 8, or 20, and a Bonus token is spent (rulebook p.12).
   * It queues up like a gain because that is what it is, and because crossing can happen in the
   * middle of anything.
   */
  BonusToken,
  /**
   * Printed on nothing either: a window where the player may answer what just happened with a
   * Companion or a Potion.
   */
  Reaction,
  /**
   * The Income token lying on the Encounter card, drawn in its reward scroll like everything else it
   * pays. Taking it hands over {@link incomeTokenGains} on the spot, and the token then pays that
   * much again every Autumn from the player's board. A token already taken by someone else — or
   * never laid, the card not having been revealed the year it was drawn — gives nothing.
   */
  IncomeToken
}

/**
 * Everything a victory point total can be counted on, in game and at the end of it.
 *
 * {@link Countable.Villagers} counts the Villagers at the player's disposal — every figure but the
 * ones sent back to the reserve.
 */
export enum Countable {
  Force = 1,
  Magic,
  /** The lower of the two tracks. */
  LowestSkill,
  Coins,
  Item,
  Companion,
  Potion,
  ToldStory,
  UntoldStory,
  Villagers,
  /** Encounter cards resolved in the Hammer area or beyond. */
  FarEncounter,
  /** Encounter cards resolved, counting each banner once. */
  DistinctBanner
}

/**
 * A victory point total: `vp` points for every `per` the player owns, the count lowered by `minus`
 * and divided by `divide` first. Without `per` it is a flat total.
 */
export type Score = { vp: number; per?: Countable; divide?: number; minus?: number }

/**
 * How much a gain is worth. A number, unless it is read off the Seal token the activation spends:
 * the Scouts guilds travel as far as their Seal is worth, and the Taverns that carry one
 * pay as many coins or points as its value.
 */
export const SEAL = 'seal'
export type Count = number | typeof SEAL

export type Gain =
  | { type: GainType.Coins | GainType.Vp | GainType.Force | GainType.Magic | GainType.Skill | GainType.Villager | GainType.Travel; count: Count }
  | { type: GainType.Straighten | GainType.PlaceVillager | GainType.BonusToken }
  | { type: GainType.TellStory; rewards: Gain[][] }
  | { type: GainType.Score; score: Score }
  | { type: GainType.Reaction; trigger: TriggerType }
  | { type: GainType.IncomeToken; token: IncomeToken }

export const coins = (count: Count): Gain => ({ type: GainType.Coins, count })
export const vp = (count: Count): Gain => ({ type: GainType.Vp, count })
export const force = (count = 1): Gain => ({ type: GainType.Force, count })
export const magic = (count = 1): Gain => ({ type: GainType.Magic, count })
export const skill = (count = 1): Gain => ({ type: GainType.Skill, count })
export const villager = (count = 1): Gain => ({ type: GainType.Villager, count })
export const travel = (count: Count): Gain => ({ type: GainType.Travel, count })
export const straighten: Gain = { type: GainType.Straighten }
export const placeVillager: Gain = { type: GainType.PlaceVillager }
export const bonusToken: Gain = { type: GainType.BonusToken }
export const tellStory = (...rewards: Gain[][]): Gain => ({ type: GainType.TellStory, rewards })
export const score = (vp: number, per?: Countable, extra: { divide?: number; minus?: number } = {}): Gain => ({
  type: GainType.Score,
  score: { vp, per, ...extra }
})
export const incomeToken = (token: IncomeToken): Gain => ({ type: GainType.IncomeToken, token })

/**
 * What has to be true, or given up, for a gain to be obtained.
 *
 * The first three are read off the player's boards and never cost anything: an Encounter that asks
 * for 2 Force is met by a marker standing on 2, and by a Potion that lends 2 for the length of the
 * adventure. Everything below is paid.
 */
export enum RequirementType {
  /** Have at least. */
  Force = 1,
  Magic,
  /** Force and Magic added together. */
  Skills,
  /** Pay. */
  SpendCoins,
  SpendForce,
  SpendMagic,
  /** Active Villagers sent to the camp. */
  SpendVillagers,
  /** One Villager goes back to the reserve, out of the game for good. */
  ReturnVillager,
  /** One Object of the player's choice goes back in the box. */
  DiscardItem,
  /** Encounter cards moved to the told stories, whatever they are worth. */
  TellStories,
  /** The card being used is tilted. */
  Tilt,
  /** The card being used goes back in the box. */
  DiscardCard,
  /** A Seal token is taken off the card and spent. */
  Seal,
  /** A Seal token is taken off the card and as many coins as it is worth are paid. */
  SealCoins
}

export type Requirement = { type: RequirementType; count?: number }

export const req = (type: RequirementType, count?: number): Requirement => (count === undefined ? { type } : { type, count })

/**
 * What something asks for, and what it gives in return: the one shape every printed effect of the
 * game takes. A half of an Encounter card, an option of an Event tile, a Building activated, an
 * Object tilted, the bonus a card hands out the moment it is bought — all of them are this.
 *
 * Neither side is compulsory: the Tiger is met by sending a Villager and pays nothing but the story
 * it makes, and the World-tree asks for nothing and hands over the Income token lying on it.
 */
export type Effect = { requirements?: Requirement[]; gains?: Gain[] }

/** Whether a requirement is only read off the boards, or actually taken from the player. */
export const isCheck = (requirement: Requirement): boolean =>
  requirement.type === RequirementType.Force || requirement.type === RequirementType.Magic || requirement.type === RequirementType.Skills

/** Whether an effect spends a Seal, at its printed value or in coins. */
export const usesSeal = (requirements: Requirement[] = []): boolean =>
  requirements.some((requirement) => requirement.type === RequirementType.Seal || requirement.type === RequirementType.SealCoins)
