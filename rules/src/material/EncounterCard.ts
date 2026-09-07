import { range } from 'es-toolkit'
import { Area } from './Area'
import { coins, Effect, force, Gain, GainType, incomeToken, magic, req, Requirement, RequirementType, straighten, travel, villager, vp } from './Effect'
import { Period } from './Period'
import { IncomeToken } from './Tokens'

/**
 * The 41 Encounter cards, named after the title printed at the foot of each illustration, in the
 * order the card images are numbered — which is also the order of the 3 periods.
 */
export enum EncounterCard {
  Valley = 1,
  Tiger,
  RockyPass,
  Sheep,
  Mine,
  PackOfWolves,
  Marauders,
  Initiation,
  Hermit,
  Ambush,
  CursedSkull,
  CircleOfStones,
  Camp,
  Inn,
  Bear,
  WorldTree,
  Treasure,
  LoneTower,
  Witchcraft,
  Incantation,
  Unicorn,
  Joust,
  Diamond,
  Farm,
  Demon,
  LegendarySword,
  Coopery,
  Training,
  Vagabond,
  ErrantKnight,
  Caravan,
  Brigands,
  Archery,
  SnowyPass,
  Necromancer,
  GoldMine,
  Dragon,
  Labyrinth,
  Relay,
  FairyRing,
  HolyChalice
}

/**
 * An Encounter card in the deck shows nothing but its period: {@link hideFront} keeps the back so the
 * right deck cover is displayed.
 */
export type EncounterCardId = { front?: EncounterCard; back: Period }

export const encounterCardsOfPeriod: Record<Period, EncounterCard[]> = {
  [Period.I]: range(1, 17),
  [Period.II]: range(17, 33),
  [Period.III]: range(33, 42)
}

export const getEncounterCardPeriod = (card: EncounterCard): Period => (card <= 16 ? Period.I : card <= 32 ? Period.II : Period.III)

/**
 * Which {@link Area} an Encounter is met in: read off the banner printed in the top-left corner of
 * every card front.
 */
export const encounterArea: Record<EncounterCard, Area> = {
  [EncounterCard.Valley]: Area.Wand,
  [EncounterCard.Tiger]: Area.Wand,
  [EncounterCard.RockyPass]: Area.Hammer,
  [EncounterCard.Sheep]: Area.Bow,
  [EncounterCard.Mine]: Area.Hammer,
  [EncounterCard.PackOfWolves]: Area.Wand,
  [EncounterCard.Marauders]: Area.Bow,
  [EncounterCard.Initiation]: Area.Wand,
  [EncounterCard.Hermit]: Area.Bow,
  [EncounterCard.Ambush]: Area.Wand,
  [EncounterCard.CursedSkull]: Area.Bow,
  [EncounterCard.CircleOfStones]: Area.Hammer,
  [EncounterCard.Camp]: Area.Swords,
  [EncounterCard.Inn]: Area.Hammer,
  [EncounterCard.Bear]: Area.Swords,
  [EncounterCard.WorldTree]: Area.Bow,
  [EncounterCard.Treasure]: Area.Wand,
  [EncounterCard.LoneTower]: Area.Bow,
  [EncounterCard.Witchcraft]: Area.Hammer,
  [EncounterCard.Incantation]: Area.Swords,
  [EncounterCard.Unicorn]: Area.Hammer,
  [EncounterCard.Joust]: Area.Swords,
  [EncounterCard.Diamond]: Area.Hammer,
  [EncounterCard.Farm]: Area.Bow,
  [EncounterCard.Demon]: Area.Edge,
  [EncounterCard.LegendarySword]: Area.Wand,
  [EncounterCard.Coopery]: Area.Swords,
  [EncounterCard.Training]: Area.Bow,
  [EncounterCard.Vagabond]: Area.Hammer,
  [EncounterCard.ErrantKnight]: Area.Hammer,
  [EncounterCard.Caravan]: Area.Wand,
  [EncounterCard.Brigands]: Area.Edge,
  [EncounterCard.Archery]: Area.Wand,
  [EncounterCard.SnowyPass]: Area.Hammer,
  [EncounterCard.Necromancer]: Area.Edge,
  [EncounterCard.GoldMine]: Area.Bow,
  [EncounterCard.Dragon]: Area.Edge,
  [EncounterCard.Labyrinth]: Area.Swords,
  [EncounterCard.Relay]: Area.Bow,
  [EncounterCard.FairyRing]: Area.Hammer,
  [EncounterCard.HolyChalice]: Area.Swords
}

// ------------------------------------------------------------------ what the cards ask and give

export type EncounterCardData = {
  /** The book printed top right: what the Encounter is worth once it is told in a Tavern. */
  story: number
  /**
   * The halves of the card: what has to be true or given up on the left, what it pays on the right.
   * Most cards have a single one; those with two let the player satisfy either, or both, for both
   * rewards (rulebook p.11).
   */
  outcomes: Effect[]
}

/**
 * Which Income token is laid on the card when it is revealed, read off the reward it pays: the token
 * is a gain like any other, so the card says which one it is by promising it (see
 * {@link GainType.IncomeToken}).
 */
export const encounterIncomeToken = (card: EncounterCard): IncomeToken | undefined =>
  encounterCardData[card].outcomes
    .flatMap((outcome) => outcome.gains ?? [])
    .find((gain): gain is Extract<Gain, { type: GainType.IncomeToken }> => gain.type === GainType.IncomeToken)?.token

const have = (type: RequirementType, count: number): Requirement => req(type, count)
const pay = (type: RequirementType, count: number): Requirement => req(type, count)
const spendVillagers = (count = 1): Requirement => req(RequirementType.SpendVillagers, count)

export const encounterCardData: Record<EncounterCard, EncounterCardData> = {
  // ---------------------------------------------------------------- period I

  /** 2 spaces on the printed card, 3 in the appendix: the card is right and the appendix is an erratum. */
  [EncounterCard.Valley]: {
    story: 0,
    outcomes: [
      { requirements: [have(RequirementType.Force, 1)], gains: [travel(2)] },
      { requirements: [spendVillagers()], gains: [vp(3)] }
    ]
  },
  /** Nothing but the story it makes. */
  [EncounterCard.Tiger]: { story: 3, outcomes: [{ requirements: [spendVillagers()] }] },
  [EncounterCard.RockyPass]: { story: 2, outcomes: [{ gains: [force()] }] },
  [EncounterCard.Sheep]: { story: 0, outcomes: [{ gains: [incomeToken(IncomeToken.Income7)] }] },
  [EncounterCard.Mine]: { story: 1, outcomes: [{ requirements: [spendVillagers()], gains: [incomeToken(IncomeToken.Income5)] }] },
  [EncounterCard.PackOfWolves]: { story: 2, outcomes: [{ requirements: [have(RequirementType.Force, 2)], gains: [vp(3)] }] },
  [EncounterCard.Marauders]: { story: 2, outcomes: [{ requirements: [have(RequirementType.Skills, 2)], gains: [coins(4)] }] },
  [EncounterCard.Initiation]: { story: 1, outcomes: [{ requirements: [pay(RequirementType.SpendCoins, 4)], gains: [force(), magic()] }] },
  [EncounterCard.Hermit]: { story: 2, outcomes: [{ requirements: [have(RequirementType.Force, 2)], gains: [magic()] }] },
  [EncounterCard.Ambush]: { story: 1, outcomes: [{ requirements: [have(RequirementType.Magic, 1)], gains: [incomeToken(IncomeToken.Income4)] }] },
  [EncounterCard.CursedSkull]: { story: 3, outcomes: [{ requirements: [have(RequirementType.Magic, 2)], gains: [straighten] }] },
  [EncounterCard.CircleOfStones]: { story: 1, outcomes: [{ gains: [magic()] }] },
  [EncounterCard.Camp]: { story: 1, outcomes: [{ requirements: [have(RequirementType.Skills, 1)], gains: [villager()] }] },
  [EncounterCard.Inn]: { story: 1, outcomes: [{ requirements: [pay(RequirementType.SpendCoins, 2)], gains: [villager()] }] },
  [EncounterCard.Bear]: {
    story: 3,
    outcomes: [
      { requirements: [have(RequirementType.Force, 1)], gains: [vp(2)] },
      { requirements: [have(RequirementType.Magic, 1)], gains: [vp(2)] }
    ]
  },
  [EncounterCard.WorldTree]: { story: 0, outcomes: [{ gains: [incomeToken(IncomeToken.Income1)] }] },

  // ---------------------------------------------------------------- period II

  [EncounterCard.Treasure]: {
    story: 2,
    outcomes: [
      { requirements: [have(RequirementType.Magic, 3)], gains: [coins(3)] },
      { requirements: [pay(RequirementType.SpendMagic, 1)], gains: [coins(4)] }
    ]
  },
  [EncounterCard.LoneTower]: { story: 3, outcomes: [{ requirements: [pay(RequirementType.SpendMagic, 1)], gains: [travel(3), vp(3)] }] },
  [EncounterCard.Witchcraft]: { story: 1, outcomes: [{ requirements: [pay(RequirementType.SpendCoins, 4)], gains: [magic(2)] }] },
  [EncounterCard.Incantation]: { story: 3, outcomes: [{ requirements: [spendVillagers()], gains: [magic()] }] },
  [EncounterCard.Unicorn]: {
    story: 3,
    outcomes: [{ requirements: [have(RequirementType.Magic, 3)], gains: [straighten, incomeToken(IncomeToken.Income8)] }]
  },
  [EncounterCard.Joust]: {
    story: 1,
    outcomes: [
      { requirements: [spendVillagers()], gains: [vp(3)] },
      { requirements: [have(RequirementType.Force, 4)], gains: [vp(4)] }
    ]
  },
  [EncounterCard.Diamond]: { story: 2, outcomes: [{ requirements: [pay(RequirementType.SpendForce, 1)], gains: [coins(5)] }] },
  [EncounterCard.Farm]: { story: 0, outcomes: [{ gains: [villager()] }] },
  [EncounterCard.Demon]: {
    story: 3,
    outcomes: [
      { requirements: [have(RequirementType.Force, 3)], gains: [vp(3)] },
      { requirements: [have(RequirementType.Magic, 3)], gains: [vp(3)] }
    ]
  },
  [EncounterCard.LegendarySword]: { story: 1, outcomes: [{ requirements: [spendVillagers()], gains: [vp(3)] }] },
  [EncounterCard.Coopery]: {
    story: 0,
    outcomes: [{ requirements: [pay(RequirementType.SpendCoins, 4)], gains: [incomeToken(IncomeToken.Income2)] }]
  },
  [EncounterCard.Training]: {
    story: 0,
    outcomes: [{ requirements: [pay(RequirementType.SpendCoins, 4)], gains: [incomeToken(IncomeToken.Income3)] }]
  },
  [EncounterCard.Vagabond]: { story: 2, outcomes: [{ requirements: [have(RequirementType.Skills, 4)], gains: [villager()] }] },
  [EncounterCard.ErrantKnight]: {
    story: 1,
    outcomes: [{ requirements: [pay(RequirementType.SpendCoins, 2)], gains: [force(), vp(2)] }]
  },
  [EncounterCard.Caravan]: { story: 0, outcomes: [{ requirements: [spendVillagers(2)], gains: [incomeToken(IncomeToken.Income6)] }] },
  [EncounterCard.Brigands]: { story: 1, outcomes: [{ requirements: [have(RequirementType.Force, 3)], gains: [coins(4), vp(2)] }] },

  // ---------------------------------------------------------------- period III

  [EncounterCard.Archery]: {
    story: 1,
    outcomes: [{ requirements: [pay(RequirementType.SpendCoins, 3)], gains: [force(), vp(3)] }]
  },
  [EncounterCard.SnowyPass]: {
    story: 2,
    outcomes: [{ requirements: [have(RequirementType.Force, 5)], gains: [coins(5), vp(3)] }]
  },
  [EncounterCard.Necromancer]: { story: 1, outcomes: [{ requirements: [have(RequirementType.Skills, 8)], gains: [vp(9)] }] },
  [EncounterCard.GoldMine]: { story: 0, outcomes: [{ requirements: [spendVillagers()], gains: [coins(7)] }] },
  [EncounterCard.Dragon]: {
    story: 3,
    outcomes: [
      { requirements: [have(RequirementType.Force, 5)], gains: [vp(4)] },
      { requirements: [have(RequirementType.Magic, 5)], gains: [vp(4)] }
    ]
  },
  /** The same price twice, for the same reward twice. */
  [EncounterCard.Labyrinth]: {
    story: 0,
    outcomes: [
      { requirements: [spendVillagers()], gains: [vp(4)] },
      { requirements: [spendVillagers()], gains: [vp(4)] }
    ]
  },
  [EncounterCard.Relay]: {
    story: 1,
    outcomes: [{ requirements: [pay(RequirementType.SpendCoins, 4)], gains: [travel(3), vp(2)] }]
  },
  [EncounterCard.FairyRing]: { story: 2, outcomes: [{ requirements: [spendVillagers()], gains: [magic(), vp(3)] }] },
  [EncounterCard.HolyChalice]: {
    story: 2,
    outcomes: [{ requirements: [have(RequirementType.Magic, 5)], gains: [straighten, vp(4)] }]
  }
}
