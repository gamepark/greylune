import {
  coins,
  Countable,
  Effect,
  force,
  magic,
  req,
  Requirement,
  RequirementType,
  SEAL,
  score,
  Score,
  skill,
  straighten,
  tellStory,
  travel,
  usesSeal,
  villager,
  vp
} from './Effect'
import { Period } from './Period'
import { reaction, Reaction, ReactionType, TriggerType } from './Reaction'

/**
 * The 49 Village cards, named after the title printed at the top of each one. The hundreds digit
 * carries the card type, so a card knows what it is without a lookup table (see
 * {@link getVillageCardType}), and the units are the order the card images are numbered in.
 *
 * Five cards share a name with another: the Travelers guild and the Scouts guild come back in a
 * later period, a little stronger each time. The roman numeral is the period, and it is the only
 * thing added to a printed name anywhere in this enum.
 */
export enum VillageCard {
  TravelersGuildI = 101,
  ScoutsGuildI,
  RivenOak,
  GoldenLion,
  MagicalSchool,
  Smithy,
  TravelersGuildII,
  ScoutsGuildII,
  HallOfTheHeroes,
  TownHall,
  SilverWolf,
  JollyBoar,
  Fortress,
  TravelersGuildIII,
  Library,
  ScarletDragon,
  JadeStatue = 201,
  Tommy,
  HundredLeagueBoots,
  WizardsStaff,
  MysteriousMap,
  ManaPotion,
  StrengthPotion,
  ShortSword,
  GoldStatue,
  Snowmane,
  Horn,
  TreasureMap,
  CharismaPotion,
  EndurancePotion,
  FlyingPotion,
  Bladechant,
  InvisibilityPotion,
  RubisStatue,
  Mandolin,
  BagOfHolding,
  PhilosopherStone,
  MagicRing,
  Kael = 301,
  Elwen,
  Dorian,
  Ariok,
  Selia,
  Neris,
  Bran,
  Lucan,
  Isandre,
  Seren,
  Mira
}

export enum VillageCardType {
  Building = 1,
  Item,
  Companion
}

/**
 * A Village card in the deck shows nothing but its period: {@link hideFront} keeps the back so the
 * right deck cover is displayed.
 */
export type VillageCardId = { front?: VillageCard; back: Period }

export const getVillageCardType = (card: VillageCard): VillageCardType => Math.floor(card / 100)

export const getVillageCardNumber = (card: VillageCard): number => card % 100

export const villageCardsOfPeriod: Record<Period, VillageCard[]> = {
  [Period.I]: [
    VillageCard.TravelersGuildI,
    VillageCard.ScoutsGuildI,
    VillageCard.RivenOak,
    VillageCard.GoldenLion,
    VillageCard.MagicalSchool,
    VillageCard.Smithy,
    VillageCard.JadeStatue,
    VillageCard.Tommy,
    VillageCard.HundredLeagueBoots,
    VillageCard.WizardsStaff,
    VillageCard.MysteriousMap,
    VillageCard.ManaPotion,
    VillageCard.StrengthPotion,
    VillageCard.ShortSword,
    VillageCard.Kael,
    VillageCard.Elwen,
    VillageCard.Dorian,
    VillageCard.Ariok,
    VillageCard.Selia,
    VillageCard.Neris
  ],
  [Period.II]: [
    VillageCard.TravelersGuildII,
    VillageCard.ScoutsGuildII,
    VillageCard.HallOfTheHeroes,
    VillageCard.TownHall,
    VillageCard.SilverWolf,
    VillageCard.JollyBoar,
    VillageCard.GoldStatue,
    VillageCard.Snowmane,
    VillageCard.Horn,
    VillageCard.TreasureMap,
    VillageCard.CharismaPotion,
    VillageCard.EndurancePotion,
    VillageCard.FlyingPotion,
    VillageCard.Bladechant,
    VillageCard.InvisibilityPotion,
    VillageCard.Bran,
    VillageCard.Lucan,
    VillageCard.Isandre,
    VillageCard.Seren,
    VillageCard.Mira
  ],
  [Period.III]: [
    VillageCard.Fortress,
    VillageCard.TravelersGuildIII,
    VillageCard.Library,
    VillageCard.ScarletDragon,
    VillageCard.RubisStatue,
    VillageCard.Mandolin,
    VillageCard.BagOfHolding,
    VillageCard.PhilosopherStone,
    VillageCard.MagicRing
  ]
}

export const getVillageCardPeriod = (card: VillageCard): Period =>
  villageCardsOfPeriod[Period.I].includes(card) ? Period.I : villageCardsOfPeriod[Period.II].includes(card) ? Period.II : Period.III

// ------------------------------------------------------------------ what the cards do

/** The `-1` printed in the corner: as many Seals as there are players, less one. */
export const PLAYERS_MINUS_ONE = 'players-1'

export enum PermanentType {
  /** Kael, Dorian, the Bag of holding: more than the 3 Objects a player may otherwise keep. */
  ItemLimit = 1,
  /** Selia: a Potion is tilted where it would have been emptied. */
  TiltPotions
}

export type Permanent = { type: PermanentType; count?: number }

/**
 * What a Village card is worth and what it does. The 3 types read differently, and one shape covers
 * all three:
 *
 * - a **Building** costs nothing to activate and stays in the Village. `abilities` holds one entry
 *   per option it offers, each with what it asks for — coins, a Seal, Force — and what it gives.
 * - an **Object** costs `cost` coins to buy, may give something on the spot (`immediate`), and is
 *   then used by tilting it: `abilities` again, each entry costing a {@link RequirementType.Tilt}.
 *   A Potion has no ability of its own: it is drunk in reaction to something else.
 * - a **Companion** costs 7, always brings a Villager, and is kept for its `reaction`, its
 *   `permanent` effect and the victory points it is worth at the end.
 */
export type VillageCardData = {
  cost: number
  /** Seal tokens laid on the card the year it is revealed: a fixed number, or one less than there are players. */
  seals?: number | typeof PLAYERS_MINUS_ONE
  /** What buying the Object or recruiting the Companion gives at once. */
  immediate?: Effect
  /** The options the card offers when it is exploited, or tilted. */
  abilities?: Effect[]
  reaction?: Reaction
  permanent?: Permanent
  /** Drunk rather than used: discarded after its reaction, unless Selia lets it be tilted instead. */
  potion?: boolean
  /** What the card is worth once the 5th year is over. */
  score?: Score
}

const tilt = req(RequirementType.Tilt)
const discardCard = req(RequirementType.DiscardCard)
const seal = req(RequirementType.Seal)
const sealCoins = req(RequirementType.SealCoins)
const spend = (type: RequirementType, count: number): Requirement => req(type, count)
const villagers = (count: number) => spend(RequirementType.SpendVillagers, count)

/** Every Companion brings a Villager the moment it is recruited (rulebook p.8), and costs 7 coins. */
const companion = (data: Omit<VillageCardData, 'cost'>): VillageCardData => ({ cost: 7, immediate: { gains: [villager()] }, ...data })

export const villageCardData: Record<VillageCard, VillageCardData> = {
  // ---------------------------------------------------------------- Buildings, period I

  [VillageCard.TravelersGuildI]: { cost: 0, abilities: [{ gains: [travel(2)] }] },
  /** As far as the Seal spent is worth. */
  [VillageCard.ScoutsGuildI]: { cost: 0, seals: PLAYERS_MINUS_ONE, abilities: [{ requirements: [seal], gains: [travel(SEAL)] }] },
  /** A Tavern. */
  [VillageCard.RivenOak]: { cost: 0, abilities: [{ gains: [tellStory([vp(2)], [force()], [villager()])] }] },
  /** A Tavern whose last tier pays what its Seal is worth. */
  [VillageCard.GoldenLion]: {
    cost: 0,
    seals: PLAYERS_MINUS_ONE,
    abilities: [{ requirements: [seal], gains: [tellStory([coins(4)], [vp(1)], [coins(SEAL)])] }]
  },
  [VillageCard.MagicalSchool]: { cost: 0, seals: PLAYERS_MINUS_ONE, abilities: [{ requirements: [sealCoins], gains: [magic()] }] },
  [VillageCard.Smithy]: { cost: 0, abilities: [{ gains: [force()] }] },

  // ---------------------------------------------------------------- Buildings, period II

  [VillageCard.TravelersGuildII]: { cost: 0, abilities: [{ requirements: [spend(RequirementType.SpendCoins, 2)], gains: [travel(4)] }] },
  [VillageCard.ScoutsGuildII]: { cost: 0, seals: PLAYERS_MINUS_ONE, abilities: [{ requirements: [seal], gains: [travel(SEAL)] }] },
  /** One skill, the other, or both — the rulebook reads "and/or". */
  [VillageCard.HallOfTheHeroes]: {
    cost: 0,
    abilities: [
      { requirements: [spend(RequirementType.SpendForce, 1)], gains: [vp(3)] },
      { requirements: [spend(RequirementType.SpendMagic, 1)], gains: [vp(4)] },
      { requirements: [spend(RequirementType.SpendForce, 1), spend(RequirementType.SpendMagic, 1)], gains: [vp(3), vp(4)] }
    ]
  },
  [VillageCard.TownHall]: { cost: 0, seals: PLAYERS_MINUS_ONE, abilities: [{ requirements: [sealCoins], gains: [force(), magic()] }] },
  /** A Tavern. */
  [VillageCard.SilverWolf]: {
    cost: 0,
    seals: PLAYERS_MINUS_ONE,
    abilities: [{ requirements: [seal], gains: [tellStory([coins(4)], [vp(SEAL)], [straighten])] }]
  },
  /** A Tavern. */
  [VillageCard.JollyBoar]: { cost: 0, abilities: [{ gains: [tellStory([vp(3)], [coins(2)], [skill()])] }] },

  // ---------------------------------------------------------------- Buildings, period III

  [VillageCard.Fortress]: { cost: 0, seals: PLAYERS_MINUS_ONE, abilities: [{ requirements: [sealCoins], gains: [score(2, Countable.Companion)] }] },
  [VillageCard.TravelersGuildIII]: { cost: 0, abilities: [{ requirements: [spend(RequirementType.SpendCoins, 2)], gains: [travel(5)] }] },
  [VillageCard.Library]: { cost: 0, seals: PLAYERS_MINUS_ONE, abilities: [{ requirements: [sealCoins], gains: [score(1, Countable.ToldStory)] }] },
  /** A Tavern. */
  [VillageCard.ScarletDragon]: { cost: 0, abilities: [{ gains: [tellStory([vp(3)], [vp(2)], [vp(1)])] }] },

  // ---------------------------------------------------------------- Objects, period I

  [VillageCard.JadeStatue]: { cost: 3, immediate: { gains: [skill()] }, score: { vp: 5 } },
  [VillageCard.Tommy]: {
    cost: 4,
    abilities: [
      { requirements: [tilt], gains: [travel(1)] },
      { requirements: [tilt, villagers(1)], gains: [travel(2)] }
    ],
    score: { vp: 1 }
  },
  [VillageCard.HundredLeagueBoots]: {
    cost: 2,
    seals: 1,
    immediate: { requirements: [seal], gains: [vp(SEAL)] },
    abilities: [{ requirements: [tilt, discardCard], gains: [travel(5)] }]
  },
  [VillageCard.WizardsStaff]: {
    cost: 3,
    immediate: { gains: [magic()] },
    abilities: [{ requirements: [tilt, villagers(1)], gains: [magic()] }],
    score: { vp: 1 }
  },
  [VillageCard.MysteriousMap]: {
    cost: 3,
    abilities: [
      { requirements: [tilt], gains: [travel(1)] },
      { requirements: [tilt, villagers(1), discardCard], gains: [travel(3)] }
    ],
    score: { vp: 1 }
  },
  [VillageCard.ManaPotion]: {
    cost: 3,
    seals: 1,
    potion: true,
    immediate: { requirements: [seal], gains: [vp(SEAL)] },
    reaction: reaction([TriggerType.ResolveEncounter], [discardCard], { type: ReactionType.TemporarySkills, magic: 2 })
  },
  [VillageCard.StrengthPotion]: {
    cost: 2,
    seals: 1,
    potion: true,
    immediate: { requirements: [seal], gains: [vp(SEAL)] },
    reaction: reaction([TriggerType.ResolveEncounter], [discardCard], { type: ReactionType.TemporarySkills, force: 2 })
  },
  [VillageCard.ShortSword]: {
    cost: 2,
    immediate: { gains: [force()] },
    abilities: [{ requirements: [tilt, villagers(1)], gains: [force()] }],
    score: { vp: 1 }
  },

  // ---------------------------------------------------------------- Objects, period II

  [VillageCard.GoldStatue]: { cost: 4, immediate: { gains: [skill()] }, score: { vp: 5 } },
  [VillageCard.Snowmane]: {
    cost: 4,
    abilities: [
      { requirements: [tilt, villagers(1)], gains: [travel(3)] },
      { requirements: [tilt, villagers(2)], gains: [travel(5)] }
    ],
    score: { vp: 2 }
  },
  [VillageCard.Horn]: {
    cost: 2,
    abilities: [
      { requirements: [tilt, villagers(1)], gains: [vp(3)] },
      { requirements: [tilt, villagers(2)], gains: [vp(5)] }
    ],
    score: { vp: 1 }
  },
  [VillageCard.TreasureMap]: {
    cost: 3,
    abilities: [
      { requirements: [tilt], gains: [travel(2)] },
      { requirements: [tilt, villagers(1), discardCard], gains: [travel(4)] }
    ],
    score: { vp: 1 }
  },
  [VillageCard.CharismaPotion]: {
    cost: 3,
    seals: 1,
    potion: true,
    immediate: { requirements: [seal], gains: [vp(SEAL)] },
    reaction: reaction([TriggerType.TellStory], [discardCard], { type: ReactionType.StoryValue3 })
  },
  [VillageCard.EndurancePotion]: {
    cost: 3,
    seals: 1,
    potion: true,
    immediate: { requirements: [seal], gains: [vp(SEAL)] },
    reaction: reaction([TriggerType.Travel], [discardCard], { type: ReactionType.PlaceVillager })
  },
  [VillageCard.FlyingPotion]: {
    cost: 2,
    seals: 1,
    potion: true,
    immediate: { requirements: [seal], gains: [vp(SEAL)] },
    reaction: reaction([TriggerType.ResolveEncounter], [discardCard], { type: ReactionType.TemporarySkills, force: 1, magic: 1 })
  },
  [VillageCard.Bladechant]: {
    cost: 5,
    abilities: [
      { requirements: [tilt], gains: [skill()] },
      { requirements: [tilt, villagers(1)], gains: [force(), magic()] }
    ],
    score: { vp: 1 }
  },
  [VillageCard.InvisibilityPotion]: {
    cost: 3,
    seals: 1,
    potion: true,
    immediate: { requirements: [seal], gains: [vp(SEAL)] },
    reaction: reaction([TriggerType.ResolveEncounter], [discardCard], { type: ReactionType.IgnoreCondition })
  },

  // ---------------------------------------------------------------- Objects, period III

  [VillageCard.RubisStatue]: { cost: 6, immediate: { gains: [skill()] }, score: { vp: 6 } },
  [VillageCard.Mandolin]: {
    cost: 5,
    abilities: [{ requirements: [tilt, villagers(1)], gains: [score(1, Countable.UntoldStory)] }],
    score: { vp: 5 }
  },
  /** Raises the limit even while tilted, and even past a limit already reached. */
  [VillageCard.BagOfHolding]: {
    cost: 4,
    permanent: { type: PermanentType.ItemLimit, count: 1 },
    abilities: [{ requirements: [tilt, villagers(1)], gains: [score(1, Countable.Item)] }],
    score: { vp: 4 }
  },
  [VillageCard.PhilosopherStone]: {
    cost: 3,
    seals: 1,
    immediate: { requirements: [seal], gains: [vp(SEAL)] },
    abilities: [{ requirements: [tilt, villagers(1)], gains: [vp(5)] }]
  },
  [VillageCard.MagicRing]: { cost: 7, score: { vp: 9 } },

  // ---------------------------------------------------------------- Companions, period I

  /** The warrior. */
  [VillageCard.Kael]: companion({
    permanent: { type: PermanentType.ItemLimit, count: 1 },
    reaction: reaction([TriggerType.SpendForce], [tilt], { type: ReactionType.ReduceForceCost }),
    score: { vp: 1, per: Countable.Force }
  }),
  /** The archer. */
  [VillageCard.Elwen]: companion({
    reaction: reaction([TriggerType.Travel], [tilt], { type: ReactionType.ExtraTravel, count: 2 }),
    score: { vp: 1, per: Countable.FarEncounter }
  }),
  /** The merchant. */
  [VillageCard.Dorian]: companion({
    permanent: { type: PermanentType.ItemLimit, count: 2 },
    reaction: reaction([TriggerType.BuyItem], [tilt], { type: ReactionType.CheaperItem }),
    score: { vp: 1, per: Countable.Item }
  }),
  /** The wizard. */
  [VillageCard.Ariok]: companion({
    immediate: { gains: [villager(), magic()] },
    reaction: reaction([TriggerType.ResolveEncounter], [tilt, spend(RequirementType.SpendMagic, 1)], { type: ReactionType.IgnoreCondition }),
    score: { vp: 1, per: Countable.Magic }
  }),
  /** The alchemist. */
  [VillageCard.Selia]: companion({
    permanent: { type: PermanentType.TiltPotions },
    reaction: reaction([TriggerType.ActivateSeal], [tilt], { type: ReactionType.ChooseSealValue }),
    score: { vp: 2, per: Countable.Potion }
  }),
  /** The rogue: 2 coins more, or the Villagers standing around the card left unpaid. */
  [VillageCard.Neris]: companion({
    reaction: reaction([TriggerType.RemoveVillager], [tilt], { type: ReactionType.ExtraCoins, count: 2 }, { type: ReactionType.NoSurcharge }),
    score: { vp: 1, per: Countable.Coins, divide: 2 }
  }),

  // ---------------------------------------------------------------- Companions, period II

  /** The guardian. */
  [VillageCard.Bran]: companion({
    reaction: reaction([TriggerType.SpendVillagers], [tilt], { type: ReactionType.ReduceVillagerCost }),
    score: { vp: 1, per: Countable.Villagers, minus: 2 }
  }),
  /** The paladin. */
  [VillageCard.Lucan]: companion({
    reaction: reaction([TriggerType.GainSkill], [tilt], { type: ReactionType.OtherSkill }),
    score: { vp: 1, per: Countable.LowestSkill }
  }),
  /** The cleric. */
  [VillageCard.Isandre]: companion({
    reaction: reaction([TriggerType.TiltCard], [tilt], { type: ReactionType.StraightenTilted }),
    score: { vp: 2, per: Countable.Companion }
  }),
  /** The bard. */
  [VillageCard.Seren]: companion({
    reaction: reaction([TriggerType.TellStory], [tilt], { type: ReactionType.StoryValue3 }),
    score: { vp: 1, per: Countable.ToldStory }
  }),
  /** The scout. */
  [VillageCard.Mira]: companion({
    reaction: reaction([TriggerType.AfterEncounter], [tilt], { type: ReactionType.PlaceVillager }),
    score: { vp: 1, per: Countable.DistinctBanner }
  })
}

/** The Objects that are drunk rather than used. */
export const isPotion = (card: VillageCard): boolean => villageCardData[card].potion === true

/**
 * What answering a card being activated can be about: a Villager always leaves the Village, an
 * Object is always a purchase, and the rest depends on what the options of a Building ask for.
 */
export const activationTriggers = (front: VillageCard): TriggerType[] => {
  const data = villageCardData[front]
  const triggers = [TriggerType.RemoveVillager]
  if (getVillageCardType(front) === VillageCardType.Item) triggers.push(TriggerType.BuyItem)
  const abilities = data.abilities ?? []
  if (abilities.some((ability) => (ability.requirements ?? []).some((requirement) => requirement.type === RequirementType.SpendForce))) {
    triggers.push(TriggerType.SpendForce)
  }
  if (abilities.some((ability) => usesSeal(ability.requirements))) triggers.push(TriggerType.ActivateSeal)
  return triggers
}
