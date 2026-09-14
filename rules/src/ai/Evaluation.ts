import { MAX_COMPANIONS, MAX_SKILL, MAX_STORY_VALUE } from '../Constants'
import { GreyluneRules } from '../GreyluneRules'
import { Memory } from '../Memory'
import { Area } from '../material/Area'
import { Count, Countable, Gain, GainType, gathered, magic, Requirement, RequirementType, SEAL, usesSeal, vp } from '../material/Effect'
import { EncounterCard, EncounterCardId, encounterArea, encounterCardData } from '../material/EncounterCard'
import { eventTileData, EventTile, isFestival } from '../material/EventTile'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { activeVillagers, adventurerArea, playerSeason, villagersInVillage } from '../material/PlayerState'
import { HeroicQuestArea, heroicQuestAreas, questRequirements, questRewards, QuestTile } from '../material/QuestTile'
import { IncomeToken, incomeTokenGains, Seal } from '../material/Tokens'
import { cardsAroundGap, gapOf, Slot, slotGaps, villageGaps, villagersAroundSlot } from '../material/Village'
import { getVillagerPlayer, Villager } from '../material/Villager'
import { getVillageCardType, VillageCard, VillageCardId, VillageCardType, villageCardData } from '../material/VillageCard'
import { PlayerColor } from '../PlayerColor'
import { RuleId } from '../rules/RuleId'
import { specialActions } from '../rules/SpecialActionRule'
import { Season } from '../Season'
import { currentYear, YEARS } from '../Year'
import {
  buildModel,
  clampSkill,
  clampVillagers,
  cloneModel,
  modelCardsScore,
  modelCount,
  modelItemLimit,
  modelScoreValue,
  modelSkillScore,
  owns,
  PlayerModel,
  storyPoints
} from './Model'
import { GreyluneGame } from './Simulation'

// ------------------------------------------------------------------ what things are worth, in victory points

/**
 * What a coin is worth before the last Autumn. Coins buy the Companions and the Objects, and a purse
 * too full has nothing left to buy: past a few coins, each one is worth less than the one before, which
 * is what keeps the bot from hoarding as much as from running dry. The last year buys the most (the
 * Magic ring, the Rubis statue, the Mandolin and the Bag of holding all come out then), so its steps are
 * wider.
 */
const COIN_RATE = 0.75
const COIN_STEPS: [number, number][] = [
  [8, 1],
  [14, 0.8],
  [20, 0.5],
  [Infinity, 0.25]
]
const LAST_YEAR_COIN_STEPS: [number, number][] = [
  [14, 1],
  [22, 0.7],
  [Infinity, 0.3]
]

/** What reaching each level of a skill track is worth for what it lets the player meet and spend. */
const LEVEL_VALUES = [1.7, 1.6, 1.5, 1.3, 1.1]

/** What one more Villager is worth for every year still to come, the first ones being the most useful. */
const VILLAGER_YEAR_VALUES = [3, 3, 3, 2.6, 2.3, 2, 1.7]

/** What a journey is worth when the Encounters it will find are not known yet, by distance. */
const TRAVEL_VALUES = [0, 1.8, 2.6, 3.2, 3.6, 4, 4.2, 4.4, 4.5]

/** What a point of story waiting under the personal board is worth, as long as there is a Tavern to come. */
const STORY_POINT_VALUE = 1.2

/** How a card of the Village the bot has its eye on may be gone by the time its Villager gets to it. */
const SPRING_PLACEMENT = 0.9

/** What an active Villager is worth at the very least while it can still be placed (see `Assessment.springFloor`). */
export const evaluationSettings = { springFloor: 1.5, lastSpringFloor: 0.6 }

/**
 * How likely a card of the 5th year is to be within the player's reach, by number of players: all 9
 * Village cards of period III come out that year, so what they reward can be prepared for from the start.
 */
const LAST_YEAR_REACH: Record<number, number> = { 2: 0.4, 3: 0.3, 4: 0.25 }

const POTION_VALUES: Partial<Record<VillageCard, number>> = {
  [VillageCard.StrengthPotion]: 1.8,
  [VillageCard.ManaPotion]: 1.8,
  [VillageCard.FlyingPotion]: 1.6,
  [VillageCard.InvisibilityPotion]: 2.2,
  [VillageCard.CharismaPotion]: 1.5,
  [VillageCard.EndurancePotion]: 1.5
}

/** Duplicates: a second way to go on the road is worth less than the first, a fifth hardly anything. */
const TRAVEL_DUPLICATES = [1, 0.7, 0.5, 0.35, 0.25, 0.2]

type Use = { value: number; villager?: number; slots?: number; key?: string; capacity?: number; keys?: string[]; coins?: number; label?: string }

type Crowd = { mine: number; others: number; arrivals: number }

type QuestInfo = { area: HeroicQuestArea; tile: QuestTile; firstTaken: boolean }

type EffectOptions = {
  /** Coins paid on top of the requirements: the price of the card and the crowd around it. */
  price?: number
  /** The value of the Seal the effect spends. */
  seal?: number
  /** The Villagers the effect spends are already counted by whoever calls. */
  villagersFree?: boolean
  /** Inside a journey already weighed: the road and the stories are counted without reading the table. */
  nested?: boolean
  /** The Encounter resolved, which goes under the personal board, and the Income token lying on it. */
  encounter?: EncounterCard
  incomeToken?: IncomeToken
  /** The Heroic Quest achieved. */
  quest?: HeroicQuestArea
  /** The Object the effect gives up. */
  discard?: VillageCard
  /** Where the Encounter lies, which is where the road it opens starts from, and whether that road is already the second. */
  origin?: Area
  deep?: boolean
}

const discardsCard = (requirements: Requirement[] = []): boolean => requirements.some((requirement) => requirement.type === RequirementType.DiscardCard)

/** What an Encounter can ask of a player, which is all a journey weighed twice for the same player can differ by. */
const signature = (model: PlayerModel): string => `${model.force}:${model.magic}:${model.coins}:${model.items.length}:${model.untold.length}:${model.markers}`

/**
 * Everything the bot knows about a position, from the point of view of one player, and what it is worth.
 *
 * The worth of a position is an estimate of the victory points the player will end the game with:
 * the points already scored, and what everything else they hold is likely to turn into — coins,
 * skills, Villagers, Objects and Companions, stories, Income tokens, the Heroic Quests within reach and
 * the cards that come out in the 5th year — plus what the Villagers already standing in the Village
 * and the actions still open this year promise.
 */
export class Assessment {
  readonly rules: GreyluneRules
  readonly model: PlayerModel
  readonly players: number
  readonly year: number
  /** How many whole years are still to be played after this one. */
  readonly yearsAfter: number
  readonly season: Season
  /** Nothing left for this player to do: what they hold is what they score. */
  readonly final: boolean
  readonly active: number
  readonly area: Area
  /** How many Villagers the other players are still likely to place in the Village this Spring. */
  readonly pendingPlacements: number
  readonly quests: QuestInfo[]
  readonly lastYearCards: Set<VillageCard>
  readonly base: number

  private readonly travelCache = new Map<string, number>()
  private readonly areaCache = new Map<string, number>()
  private readonly activationCache = new Map<string, { value: number; coins: number } | undefined>()
  private storyCache = new Map<string, number | undefined>()
  private tellingChancesCache?: number

  constructor(
    readonly game: GreyluneGame,
    readonly player: PlayerColor
  ) {
    this.rules = new GreyluneRules(game)
    this.model = buildModel(this.rules, player)
    this.players = game.players.length
    this.year = currentYear(this.rules, this.players)
    this.yearsAfter = YEARS - this.year
    this.season = playerSeason(this.rules, player)
    this.final = this.season === Season.Autumn && this.yearsAfter === 0
    this.active = activeVillagers(this.rules, player).length
    this.area = adventurerArea(this.rules, player)
    this.pendingPlacements =
      game.players
        .filter((other) => other !== player && playerSeason(this.rules, other) === Season.Spring)
        .reduce((total, other) => total + activeVillagers(this.rules, other).length, 0) * 0.85
    this.quests = heroicQuestAreas.flatMap((area) => {
      const tile = this.rules.material(MaterialType.QuestTile).location(LocationType.QuestTileSpace).locationId(area).getItem()?.id as QuestTile | undefined
      if (tile === undefined) return []
      const firstTaken = this.rules
        .material(MaterialType.QuestMarker)
        .location(LocationType.QuestRewardSpace)
        .locationId(area)
        .filter((item) => item.location.x === 0).length > 0
      return [{ area, tile, firstTaken }]
    })
    this.lastYearCards = new Set(
      this.yearsAfter > 0
        ? [VillageCard.Fortress, VillageCard.Library, VillageCard.ScarletDragon, VillageCard.Mandolin, VillageCard.BagOfHolding]
        : this.season === Season.Autumn
          ? []
          : this.grid.getItems<VillageCardId>().map((item) => item.id.front!)
    )
    this.base = this.staticValue(this.model)
  }

  get grid() {
    return this.rules.material(MaterialType.VillageCard).location(LocationType.VillageGrid)
  }

  get memory(): Record<number, unknown> {
    return this.game.memory as Record<number, unknown>
  }

  /** The worth of the position: what the player holds, what their Villagers promise, and what the action under way still owes. */
  evaluate(): number {
    if (this.final) return this.base
    return this.base + this.thisYearPotential() + this.pendingValue()
  }

  /** The same worth, term by term: what a test or a trace reads to tell why a move was preferred. */
  breakdown(): Record<string, number> {
    const model = this.model
    const round = (value: number) => Math.round(value * 10) / 10
    const terms: Record<string, number> = {
      score: model.vp + model.questPoints + modelCardsScore(model, !this.final) + modelSkillScore(model)
    }
    if (!this.final) {
      Object.assign(terms, {
        coins: this.coinWorth(model, model.coins),
        skills: this.skillValue(model.force) + this.skillValue(model.magic),
        villagers: this.villagersValue(model),
        income: this.incomeValue(model),
        cards: this.cardsValue(model),
        stories: this.storiesValue(model),
        quests: this.questsValue(model),
        lastYear: this.lastYearValue(model),
        thisYear: this.thisYearPotential(),
        pending: this.pendingValue()
      })
    }
    for (const key of Object.keys(terms)) terms[key] = round(terms[key])
    return terms
  }

  // ------------------------------------------------------------------ what the player holds

  staticValue(model: PlayerModel): number {
    if (this.final) return model.vp + model.questPoints + modelCardsScore(model) + modelSkillScore(model) + model.coins * 0.001
    return (
      model.vp +
      model.questPoints +
      modelCardsScore(model, true) +
      modelSkillScore(model) +
      this.coinWorth(model, model.coins) +
      this.skillValue(model.force) +
      this.skillValue(model.magic) +
      this.villagersValue(model) +
      this.incomeValue(model) +
      this.cardsValue(model) +
      this.storiesValue(model) +
      this.questsValue(model) +
      this.lastYearValue(model)
    )
  }

  /**
   * In the 5th year a coin is only worth what it can still buy, and what it can buy is read off the
   * Village by {@link thisYearPotential}: held for its own sake it is worth next to nothing.
   */
  coinsValue(coins: number, floor = 0): number {
    if (this.yearsAfter === 0) return coins * Math.max(0.05, floor)
    const lastYear = this.yearsAfter === 1 && this.season === Season.Autumn
    const steps = lastYear ? LAST_YEAR_COIN_STEPS : COIN_STEPS
    let value = 0
    let counted = 0
    for (const [upTo, weight] of steps) {
      const slice = Math.min(coins, upTo) - counted
      if (slice <= 0) break
      value += slice * Math.max(floor, weight * COIN_RATE)
      counted += slice
    }
    return value
  }

  /** With Neris, a coin is never worth less than the half point she counts it for at the end. */
  coinWorth(model: PlayerModel, coins: number): number {
    return this.coinsValue(coins, owns(model, VillageCard.Neris) ? 0.5 : 0)
  }

  get skillFactor(): number {
    return this.yearsAfter >= 2 ? 1 : this.yearsAfter === 1 ? 0.85 : 0.5
  }

  skillValue(level: number): number {
    let value = 0
    for (let step = 0; step < Math.min(level, MAX_SKILL); step++) value += LEVEL_VALUES[step]
    return value * this.skillFactor
  }

  /** Every Villager the player owns is one more action in each of the years to come. */
  villagersValue(model: PlayerModel): number {
    let value = 0
    for (let villager = 0; villager < model.villagers; villager++) value += VILLAGER_YEAR_VALUES[villager]
    return value * this.yearsAfter
  }

  /** The Autumns still to come: 3 coins less the Companions, and what the Income tokens pay. */
  incomeValue(model: PlayerModel): number {
    const tokens = model.incomeTokens.flatMap((token) => incomeTokenGains[token])
    const total = (type: GainType) => tokens.reduce((sum, gain) => (gain.type === type && 'count' in gain ? sum + (gain.count as number) : sum), 0)
    const coins = Math.max(0, 3 - model.companions.length) + total(GainType.Coins)
    const thisAutumn = this.season !== Season.Autumn ? 1 : 0
    const coinAutumns = (this.yearsAfter > 0 ? thisAutumn : 0) + Math.max(0, this.yearsAfter - 1)
    const vpAutumns = thisAutumn + this.yearsAfter
    return coins * coinAutumns * COIN_RATE * 0.85 + total(GainType.Vp) * vpAutumns + total(GainType.Force) * Math.min(vpAutumns, MAX_SKILL - model.force) * 1.3
  }

  /**
   * What the Objects and the Companions will still do in the years to come. This year's uses are
   * counted with the actions still open (see {@link thisYearPotential}); a Potion is drunk once, unless
   * Selia keeps it; and a second way of going on the road is worth less than the first.
   */
  cardsValue(model: PlayerModel): number {
    const years = this.yearsAfter
    const selia = owns(model, VillageCard.Selia)
    const elwen = owns(model, VillageCard.Elwen)
    let value = 0
    const journeys: number[] = []
    for (const card of model.items) {
      const data = villageCardData[card.front]
      if (data.potion) {
        // A Potion still full when the game ends is worth nothing: in the 5th year, it is half-way to that.
        value += (POTION_VALUES[card.front] ?? 1.5) * (selia ? 1 + 0.6 * years : years ? 1 : 0.5)
        continue
      }
      const abilities = data.abilities ?? []
      if (!abilities.length) continue
      // What gives the card up is only ever used once: the Hundred-league boots, and the long way of the maps.
      const repeatable = abilities.filter((ability) => !discardsCard(ability.requirements))
      if (!repeatable.length) {
        value += 0.7 * Math.max(0, ...abilities.map((ability) => this.genericValue(model, ability.requirements, ability.gains)))
        continue
      }
      if (!years) continue
      const best = Math.max(0, ...repeatable.map((ability) => this.genericValue(model, ability.requirements, ability.gains)))
      if (repeatable.some((ability) => ability.gains?.some((gain) => gain.type === GainType.Travel))) {
        journeys.push(best + (elwen ? 0.5 : 0))
      } else {
        value += best * this.usefulYears(model, repeatable.flatMap((ability) => ability.gains ?? []))
      }
    }
    journeys.sort((a, b) => b - a)
    journeys.forEach((journey, rank) => (value += journey * years * TRAVEL_DUPLICATES[Math.min(rank, TRAVEL_DUPLICATES.length - 1)]))
    for (const card of model.companions) {
      value += this.reactionYearValue(model, card.front) * years + this.growthValue(model, card.front)
    }
    return value
  }

  /** A card that only raises a skill stops being useful once the track is full. */
  private usefulYears(model: PlayerModel, gains: Gain[]): number {
    const skills = gains.filter((gain) => gain.type === GainType.Force || gain.type === GainType.Magic || gain.type === GainType.Skill)
    if (!skills.length || skills.length < gains.length) return this.yearsAfter
    const headroom = MAX_SKILL - Math.min(model.force, model.magic)
    return Math.min(this.yearsAfter, headroom)
  }

  /** What an effect is worth on average, when it will be used some year to come and the table then is not known. */
  genericValue(model: PlayerModel, requirements: Requirement[] = [], gains: Gain[] = []): number {
    let value = 0
    for (const gain of gains) {
      switch (gain.type) {
        case GainType.Coins:
          value += (gain.count as number) * COIN_RATE * 0.9
          break
        case GainType.Vp:
          value += typeof gain.count === 'number' ? gain.count : 2
          break
        case GainType.Force:
          value += this.nextLevels(model.force, gain.count as number)
          break
        case GainType.Magic:
          value += this.nextLevels(model.magic, gain.count as number)
          break
        case GainType.Skill:
          value += Math.max(this.nextLevels(model.force, 1), this.nextLevels(model.magic, 1))
          break
        case GainType.Villager:
          value += 2
          break
        case GainType.Travel:
          value += TRAVEL_VALUES[Math.min(typeof gain.count === 'number' ? gain.count : 2, TRAVEL_VALUES.length - 1)]
          break
        case GainType.Straighten:
        case GainType.PlaceVillager:
          value += 1
          break
        case GainType.TellStory:
          value += 2.5
          break
        case GainType.Score:
          value += modelScoreValue(model, gain.score) + 0.5
          break
        case GainType.IncomeToken:
          value += 2
          break
        case GainType.BonusToken:
          value += 3
          break
      }
    }
    for (const requirement of requirements) {
      const count = requirement.count ?? 1
      switch (requirement.type) {
        case RequirementType.SpendCoins:
          value -= count * COIN_RATE
          break
        case RequirementType.SpendForce:
        case RequirementType.SpendMagic:
          value -= count * 1.4
          break
        case RequirementType.SpendVillagers:
          value -= count * 1.1
          break
        case RequirementType.ReturnVillager:
          value -= 5
          break
        case RequirementType.DiscardItem:
          value -= 3
          break
        case RequirementType.TellStories:
          value -= 2 * count
          break
        case RequirementType.Seal:
        case RequirementType.SealCoins:
          value -= 1.5
          break
      }
    }
    return value
  }

  private nextLevels(level: number, count: number): number {
    let value = 0
    for (let step = level; step < Math.min(MAX_SKILL, level + count); step++) value += LEVEL_VALUES[step]
    return value * this.skillFactor
  }

  /** What a Companion's reaction is worth in a year, given what else the player owns. */
  reactionYearValue(model: PlayerModel, front: VillageCard): number {
    const items = model.items.map((card) => villageCardData[card.front])
    const journeys = items.filter((data) => data.abilities?.some((ability) => ability.gains?.some((gain) => gain.type === GainType.Travel))).length
    switch (front) {
      case VillageCard.Kael:
        return 1
      case VillageCard.Elwen:
        return 0.8 + 0.3 * journeys
      case VillageCard.Dorian:
        return 1.3
      case VillageCard.Ariok:
        return model.magic > 0 ? 1 : 0.4
      case VillageCard.Selia:
        return 0.7
      case VillageCard.Neris:
        return 1.4
      case VillageCard.Bran: {
        const needVillagers = items.filter((data) =>
          data.abilities?.some((ability) => ability.requirements?.some((requirement) => requirement.type === RequirementType.SpendVillagers))
        ).length
        return 0.3 + 0.5 * Math.min(2, needVillagers)
      }
      case VillageCard.Lucan:
        return Math.min(model.force, model.magic) < MAX_SKILL ? 1.4 : 0.2
      case VillageCard.Isandre:
        return 0.4 + 0.4 * Math.min(3, items.filter((data) => data.abilities?.length).length)
      case VillageCard.Seren:
        return 0.4 + 0.3 * Math.min(3, model.untold.filter((card) => encounterCardData[card].story < MAX_STORY_VALUE).length)
      case VillageCard.Mira:
        return 1.1
      default:
        return 0
    }
  }

  /** The points a Companion's own count is still likely to grow by, before the end of the game. */
  growthValue(model: PlayerModel, front: VillageCard): number {
    const score = villageCardData[front].score
    if (!score?.per) return 0
    const years = this.yearsAfter
    const thisYear = this.season === Season.Autumn ? 0 : 1
    const count = modelCount(model, score.per)
    let growth = 0
    switch (score.per) {
      case Countable.Force:
      case Countable.Magic:
      case Countable.LowestSkill:
        growth = Math.min(MAX_SKILL - count, years + thisYear) * 0.5
        break
      case Countable.Item:
        growth = Math.min(Math.max(0, modelItemLimit(model) - count), years + thisYear) * 0.4
        break
      case Countable.Companion:
        growth = Math.min(MAX_COMPANIONS - count, years) * 0.5
        break
      case Countable.Potion:
        growth = years * 0.2
        break
      case Countable.ToldStory:
        growth = (years + thisYear) * 0.8
        break
      case Countable.Villagers:
        growth = Math.min(7 - count, years) * 0.4
        break
      case Countable.FarEncounter:
        growth = (years + thisYear) * 0.7
        break
      case Countable.DistinctBanner:
        growth = Math.min(5 - count, (years + thisYear) * 0.7)
        break
    }
    return (score.vp * Math.max(0, growth)) / (score.divide ?? 1)
  }

  /**
   * The stories waiting to be told, as long as there are Taverns — and Villagers — to tell them to. A
   * story left untold at the end is worth nothing, so in the 5th year only as many are counted as the
   * special action and the Taverns of the Village can still hear.
   */
  storiesValue(model: PlayerModel): number {
    const points = storyPoints(model.untold)
    if (this.yearsAfter > 0) {
      const capacity = MAX_STORY_VALUE * (this.yearsAfter + 1) * 1.3
      return Math.min(points, capacity) * STORY_POINT_VALUE + model.untold.length * 0.15
    }
    return Math.min(points, MAX_STORY_VALUE * this.tellingChances) * 0.6 + model.untold.length * 0.05
  }

  /** In the 5th year: the stories still to be told this year — the special action, and the Taverns of the Village. */
  get tellingChances(): number {
    if (this.tellingChancesCache === undefined) {
      const taverns = this.grid
        .getItems<VillageCardId>()
        .filter((item) => villageCardData[item.id.front!].abilities?.some((ability) => ability.gains?.some((gain) => gain.type === GainType.TellStory))).length
      this.tellingChancesCache = this.season === Season.Autumn ? 0 : (this.specialActionUsed ? 0 : 1) + 0.7 * taverns
    }
    return this.tellingChancesCache
  }

  /**
   * The Heroic Quests still open to the player: a share of what they are worth, the larger the closer
   * the player stands to meeting what they ask.
   */
  questsValue(model: PlayerModel): number {
    if (!model.markers) return 0
    const journeys = model.items.filter((card) => villageCardData[card.front].abilities?.some((a) => a.gains?.some((g) => g.type === GainType.Travel))).length
    const reachBonus = Math.min(0.3, 0.1 * (journeys + (owns(model, VillageCard.Elwen) ? 1 : 0)))
    const timeFactor = this.yearsAfter > 0 ? 1 : 0.6
    let value = 0
    for (const quest of this.quests) {
      if (model.questsDone.includes(quest.area)) continue
      const reward = quest.firstTaken ? questRewards[quest.area].others : questRewards[quest.area].first
      const [readiness, cost] = this.questReadiness(model, quest.tile)
      const reach = ({ [Area.Hammer]: 0.5, [Area.Swords]: 0.4, [Area.Edge]: 0.33 } as Record<number, number>)[quest.area] + reachBonus
      value += Math.max(0, reward - cost) * readiness * readiness * reach * timeFactor * 0.5
    }
    return value
  }

  private questReadiness(model: PlayerModel, tile: QuestTile): [number, number] {
    switch (tile) {
      case QuestTile.Giant:
        return [Math.min(1, model.force / 4), 0]
      case QuestTile.Wraiths:
        return [Math.min(1, model.magic / 4), 0]
      case QuestTile.Dragon:
        return [Math.min(1, (model.force + model.magic) / 6), 0]
      case QuestTile.BardTournament:
        return [Math.min(1, model.untold.length / 2), 3]
      case QuestTile.Donation:
        return [model.items.length ? 1 : 0.4, 3]
      case QuestTile.Undeads:
        return [((model.force > 0 ? 1 : 0) + (model.magic > 0 ? 1 : 0)) / 2, 3]
      case QuestTile.DeadlyTrap:
        return [1, 1 + this.yearsAfter * 2.3]
      case QuestTile.Ransom:
        return [Math.min(1, model.coins / 6), 4.5]
      case QuestTile.Wedding:
        return [1, 2]
    }
  }

  /**
   * The 9 Village cards of period III all come out in the 5th year, whatever the draw: what the
   * Fortress, the Library, the Scarlet dragon, the Mandolin and the Bag of holding count is worth
   * building up beforehand.
   */
  lastYearValue(model: PlayerModel): number {
    const reach = LAST_YEAR_REACH[this.players] ?? 0.3
    const cards = this.lastYearCards
    let value = 0
    if (cards.has(VillageCard.Fortress)) value += 2 * model.companions.length
    if (cards.has(VillageCard.Library)) value += model.told.length
    if (cards.has(VillageCard.ScarletDragon)) value += 0.8 * Math.min(MAX_STORY_VALUE, storyPoints(model.untold))
    if (cards.has(VillageCard.Mandolin)) value += 0.8 * model.untold.length
    if (cards.has(VillageCard.BagOfHolding)) value += 0.8 * model.items.length
    return value * reach
  }

  // ------------------------------------------------------------------ what an effect would change

  /**
   * What an effect is worth here and now: the requirements are taken out of a copy of the model, the
   * gains put in, and the difference measured. Undefined when the player cannot pay for it.
   */
  effectValue(requirements: Requirement[] = [], gains: Gain[] = [], options: EffectOptions = {}, base: PlayerModel = this.model): number | undefined {
    const model = cloneModel(base)
    let extra = 0
    if (options.price) model.coins -= options.price
    for (const requirement of gathered(requirements)) {
      const count = requirement.count ?? 1
      switch (requirement.type) {
        case RequirementType.Force:
          if (base.force < count) return undefined
          break
        case RequirementType.Magic:
          if (base.magic < count) return undefined
          break
        case RequirementType.Skills:
          if (base.force + base.magic < count) return undefined
          break
        case RequirementType.SpendCoins:
          model.coins -= count
          break
        case RequirementType.SpendForce:
          if (model.force < count) return undefined
          model.force -= count
          break
        case RequirementType.SpendMagic:
          if (model.magic < count) return undefined
          model.magic -= count
          break
        case RequirementType.SpendVillagers:
          if (this.active < count) return undefined
          if (!options.villagersFree) extra -= count * this.villagerUseCost
          break
        case RequirementType.ReturnVillager:
          if (this.active < count) return undefined
          model.villagers = clampVillagers(model.villagers - count)
          extra -= count * this.villagerUseCost
          break
        case RequirementType.DiscardItem:
          if (!model.items.length) return undefined
          this.removeLeastItem(model)
          break
        case RequirementType.TellStories: {
          if (model.untold.length < count) return undefined
          const cheapest = [...model.untold].sort((a, b) => encounterCardData[a].story - encounterCardData[b].story).slice(0, count)
          model.untold = model.untold.filter((card) => !cheapest.includes(card))
          model.told.push(...cheapest)
          break
        }
        case RequirementType.SealCoins:
          model.coins -= options.seal ?? 1
          break
      }
    }
    if (model.coins < 0) return undefined
    if (options.discard !== undefined) {
      const index = model.items.findIndex((card) => card.front === options.discard)
      if (index >= 0) model.items.splice(index, 1)
    }
    if (options.encounter !== undefined) model.untold.push(options.encounter)
    if (options.quest !== undefined) {
      const quest = this.quests.find((entry) => entry.area === options.quest)!
      model.questPoints += quest.firstTaken ? questRewards[quest.area].others : questRewards[quest.area].first
      model.questsDone.push(quest.area)
      model.markers--
    }
    const vpBefore = model.vp
    for (const gain of gains) extra += this.applyGain(model, gain, options)
    extra += this.bonusTokenValue(vpBefore, model.vp)
    return this.staticValue(model) - (base === this.model ? this.base : this.staticValue(base)) + extra
  }

  /** Crossing 8, then 20, hands over a Bonus token. */
  private bonusTokenValue(before: number, after: number): number {
    const tokens = this.rules.material(MaterialType.BonusToken).location(LocationType.BonusTokens).player(this.player).length
    let value = 0
    if (before < 8 && after >= 8 && tokens === 3) value += 3.5
    if (before < 20 && after >= 20 && tokens >= 2) value += 3.5
    return value
  }

  /** Puts a gain into the model, and says what it is worth beyond what the model can hold. */
  private applyGain(model: PlayerModel, gain: Gain, options: EffectOptions): number {
    const amount = (count: Count) => (count === SEAL ? (options.seal ?? 0) : count)
    switch (gain.type) {
      case GainType.Coins:
        model.coins += amount(gain.count)
        return 0
      case GainType.Vp:
        model.vp += amount(gain.count)
        return 0
      case GainType.Force:
        model.force = clampSkill(model.force + amount(gain.count))
        return 0
      case GainType.Magic:
        model.magic = clampSkill(model.magic + amount(gain.count))
        return 0
      case GainType.Skill: {
        const withForce = cloneModel(model)
        withForce.force = clampSkill(model.force + amount(gain.count))
        const withMagic = cloneModel(model)
        withMagic.magic = clampSkill(model.magic + amount(gain.count))
        if (this.staticValue(withForce) >= this.staticValue(withMagic)) model.force = withForce.force
        else model.magic = withMagic.magic
        return 0
      }
      case GainType.Villager: {
        const before = model.villagers
        model.villagers = clampVillagers(model.villagers + amount(gain.count))
        return this.season === Season.Autumn ? 0 : (model.villagers - before) * this.newVillagerValue
      }
      case GainType.Travel: {
        // The road an Encounter opens is read off the board as well, from where that Encounter lies —
        // the Lone tower that leads to a Heroic Quest is worth the Quest — but only one road deep.
        const distance = amount(gain.count)
        if (!options.nested) return this.travelValue(distance, model)
        if (options.origin !== undefined && !options.deep) return this.travelValue(distance, model, options.origin, true)
        return TRAVEL_VALUES[Math.min(distance, TRAVEL_VALUES.length - 1)]
      }
      case GainType.Straighten:
        return options.nested ? 1 : this.straightenValue()
      case GainType.PlaceVillager:
        return this.active > 0 && this.season !== Season.Autumn ? 1 : 0
      case GainType.TellStory:
        return options.nested ? 2 : (this.storyValue(gain.rewards) ?? 0)
      case GainType.Score:
        model.vp += modelScoreValue(model, gain.score)
        return 0
      case GainType.IncomeToken:
        if (options.incomeToken === undefined) return 0
        model.incomeTokens.push(options.incomeToken)
        return incomeTokenGains[options.incomeToken].reduce((total, tokenGain) => total + this.applyGain(model, tokenGain, options), 0)
      case GainType.BonusToken:
        return 3
      default:
        return 0
    }
  }

  /** Gives up the Object whose loss costs the least. */
  private removeLeastItem(model: PlayerModel): void {
    let best = -Infinity
    let kept = model.items
    for (let index = 0; index < model.items.length; index++) {
      const copy = cloneModel(model)
      copy.items.splice(index, 1)
      const value = this.staticValue(copy)
      if (value > best) {
        best = value
        kept = copy.items
      }
    }
    model.items = kept
  }

  /** What spending a Villager of this year costs: in Spring it could still have been placed in the Village. */
  get villagerUseCost(): number {
    if (this.season === Season.Spring) return Math.max(1.8, this.springFloor)
    return this.active > 2 ? 0.6 : 1
  }

  /** What a Villager gained now is worth for the rest of this year, beyond the years to come. */
  get newVillagerValue(): number {
    return this.season === Season.Spring ? 1.8 : 1
  }

  // ------------------------------------------------------------------ the road

  /** The best the Adventurer can find within that many spaces of where it stands. */
  /**
   * The best the Adventurer can find within that many spaces of where it stands. `base` is what the
   * player holds when setting off: an effect that spends Magic to go on the road must not meet the
   * Encounters at the end of it with the Magic it has just spent.
   */
  travelValue(distance: number, base: PlayerModel = this.model, origin: Area = this.area, deep = false): number {
    const key = `${distance}:${origin}:${deep}:${signature(base)}`
    const cached = this.travelCache.get(key)
    if (cached !== undefined) return cached
    let value = this.reachValue(distance, base, origin, deep)
    const elwen = base.companions.find((card) => card.front === VillageCard.Elwen && !card.tilted)
    if (elwen) value = Math.max(value, this.reachValue(distance + 2, base, origin, deep) - 0.8)
    this.travelCache.set(key, value)
    return value
  }

  private reachValue(distance: number, base: PlayerModel, origin: Area, deep: boolean): number {
    let value = 0
    for (let area = Math.max(Area.Wand, origin - distance); area <= Math.min(Area.Edge, origin + distance); area++) {
      value = Math.max(value, this.areaValue(area, base, deep))
    }
    return value
  }

  /** What stopping in an area is worth: its best Encounter, the coin or the point it pays instead, or its Heroic Quest. */
  areaValue(area: Area, base: PlayerModel = this.model, deep = false): number {
    const key = `${area}:${deep}:${signature(base)}`
    const cached = this.areaCache.get(key)
    if (cached !== undefined) return cached
    let value = 0
    const skip =
      area === Area.Wand
        ? this.effectValue([], [{ type: GainType.Coins, count: 1 }], {}, base)
        : area === Area.Bow
          ? this.effectValue([], [vp(1)], {}, base)
          : undefined
    if (skip !== undefined) value = Math.max(value, skip)
    for (const card of this.rules.material(MaterialType.EncounterCard).location(LocationType.EncounterRow).locationId(area).getIndexes()) {
      value = Math.max(value, this.encounterValue(card, base, deep) ?? 0)
    }
    const quest = this.quests.find((entry) => entry.area === area)
    if (quest && base.markers && !base.questsDone.includes(quest.area)) {
      value = Math.max(value, this.effectValue(questRequirements[quest.tile], [], { quest: quest.area, nested: true }, base) ?? 0)
    }
    this.areaCache.set(key, value)
    return value
  }

  /** The best way to resolve an Encounter of the row, its story and its Income token included. */
  encounterValue(card: number, base: PlayerModel = this.model, deep = false): number | undefined {
    const front = this.rules.material(MaterialType.EncounterCard).getItem<EncounterCardId>(card).id.front!
    const incomeToken = this.rules.material(MaterialType.IncomeToken).location(LocationType.CardIncome).parent(card).getItem()?.id as IncomeToken | undefined
    const outcomes = encounterCardData[front].outcomes
    const subsets = outcomes.length > 1 ? [[0], [1], [0, 1]] : [[0]]
    let best: number | undefined
    for (const subset of subsets) {
      const requirements = subset.flatMap((outcome) => outcomes[outcome].requirements ?? [])
      const gains = subset.flatMap((outcome) => outcomes[outcome].gains ?? [])
      const value = this.effectValue(requirements, gains, { encounter: front, incomeToken, nested: true, origin: encounterArea[front], deep }, base)
      if (value !== undefined && (best === undefined || value > best)) best = value
    }
    return best
  }

  // ------------------------------------------------------------------ the stories

  /** The best story the player could tell for these rewards, or undefined when they have none to tell. */
  storyValue(rewards: Gain[][]): number | undefined {
    const key = JSON.stringify(rewards)
    if (this.storyCache.has(key)) return this.storyCache.get(key)
    const cards = this.model.untold.filter((card) => encounterCardData[card].story > 0)
    const seen = new Set<string>()
    let best: number | undefined
    const consider = (told: EncounterCard[]) => {
      const values = told.map((card) => encounterCardData[card].story).sort()
      const sum = values.reduce((total, value) => total + value, 0)
      if (!(sum <= MAX_STORY_VALUE || (values.length === 2 && values[0] === 2 && values[1] === 2))) return
      const signature = values.join()
      if (seen.has(signature)) return
      seen.add(signature)
      const model = cloneModel(this.model)
      for (const card of told) {
        model.untold.splice(model.untold.indexOf(card), 1)
        model.told.push(card)
      }
      let extra = 0
      for (const gain of rewards.slice(0, Math.min(MAX_STORY_VALUE, sum)).flat()) extra += this.applyGain(model, gain, { nested: true })
      const value = this.staticValue(model) - this.base + extra
      if (best === undefined || value > best) best = value
    }
    for (let a = 0; a < cards.length; a++) {
      consider([cards[a]])
      for (let b = a + 1; b < cards.length; b++) {
        consider([cards[a], cards[b]])
        for (let c = b + 1; c < cards.length; c++) consider([cards[a], cards[b], cards[c]])
      }
    }
    this.storyCache.set(key, best)
    return best
  }

  // ------------------------------------------------------------------ the cards of the player

  /** Standing back up the tilted card that would be the most useful again this year. */
  private straightenValue(): number {
    if (this.season === Season.Autumn) return 0
    let best = 0
    for (const card of this.model.items) {
      if (!card.tilted) continue
      for (const use of this.itemUses(card.front)) best = Math.max(best, use.value)
    }
    for (const card of this.model.companions) if (card.tilted) best = Math.max(best, this.reactionYearValue(this.model, card.front) * 0.5)
    return best
  }

  /** The abilities of an Object, each with the Villagers it takes. */
  itemUses(front: VillageCard): { value: number; slots: number }[] {
    const data = villageCardData[front]
    if (data.potion) return []
    return (data.abilities ?? []).flatMap((ability) => {
      const requirements = ability.requirements ?? []
      const slots = requirements.filter((requirement) => requirement.type === RequirementType.SpendVillagers).reduce((total, r) => total + (r.count ?? 1), 0)
      const value = this.effectValue(requirements, ability.gains, { villagersFree: true, discard: discardsCard(requirements) ? front : undefined })
      return value === undefined ? [] : [{ value, slots }]
    })
  }

  // ------------------------------------------------------------------ the Village

  slotOf(card: number): Slot {
    const location = this.grid.getItem(card).location
    return { x: location.x ?? 0, y: location.y ?? 0 }
  }

  seals(card: number): Seal[] {
    return this.rules
      .material(MaterialType.Seal)
      .location(LocationType.CardSeal)
      .parent(card)
      .getItems()
      .map((item) => item.id as Seal)
  }

  /**
   * What activating a card of the Village would bring, the price paid, and the coins it takes. The
   * crowd is the number of other Villagers standing around the card.
   */
  activationValue(card: number, crowd: number): { value: number; coins: number } | undefined {
    const key = `${card}:${crowd}`
    if (this.activationCache.has(key)) return this.activationCache.get(key)
    const result = this.computeActivation(card, crowd)
    this.activationCache.set(key, result)
    return result
  }

  private computeActivation(card: number, crowd: number): { value: number; coins: number } | undefined {
    const front = this.grid.getItem<VillageCardId>(card).id.front!
    const data = villageCardData[front]
    const type = getVillageCardType(front)
    const neris = this.model.companions.some((owned) => owned.front === VillageCard.Neris && !owned.tilted)
    const surcharge = neris && crowd > 1 ? 0 : crowd
    const nerisCost = surcharge < crowd ? 0.7 : 0
    if (type === VillageCardType.Building) {
      let best: { value: number; coins: number } | undefined
      for (const ability of data.abilities ?? []) {
        if (ability.gains?.some((gain) => gain.type === GainType.TellStory) && !this.model.untold.some((c) => encounterCardData[c].story > 0)) continue
        const seals = usesSeal(ability.requirements) ? [...new Set(this.seals(card))] : [undefined]
        for (const seal of seals) {
          const value = this.effectValue(ability.requirements, ability.gains, { price: surcharge, seal })
          if (value === undefined) continue
          const coins = surcharge + (ability.requirements ?? []).reduce((total, r) => total + (r.type === RequirementType.SpendCoins ? (r.count ?? 1) : r.type === RequirementType.SealCoins ? (seal ?? 1) : 0), 0)
          if (!best || value - nerisCost > best.value) best = { value: value - nerisCost, coins }
        }
      }
      return best
    }
    const dorian = type === VillageCardType.Item && this.model.companions.some((owned) => owned.front === VillageCard.Dorian && !owned.tilted)
    const price = data.cost + surcharge - (dorian ? 1 : 0)
    if (this.model.coins < price) return undefined
    if (type === VillageCardType.Companion && this.model.companions.length >= MAX_COMPANIONS) return undefined
    const model = cloneModel(this.model)
    model.coins -= price
    let extra = dorian ? 0.5 : -nerisCost
    if (dorian) model.vp += 1
    if (type === VillageCardType.Item) model.items.push({ front, tilted: false })
    else model.companions.push({ front, tilted: false })
    const vpBefore = model.vp
    const seal = usesSeal(data.immediate?.requirements) ? this.seals(card)[0] : undefined
    if (!usesSeal(data.immediate?.requirements) || seal !== undefined) {
      for (const gain of data.immediate?.gains ?? []) extra += this.applyGain(model, gain, { seal })
    }
    extra += this.bonusTokenValue(vpBefore, model.vp)
    if (type === VillageCardType.Item) {
      if (model.items.length > modelItemLimit(model)) this.removeLeastItem(model)
      if (this.season !== Season.Autumn && model.items.some((owned) => owned.front === front)) {
        extra += 0.5 * Math.max(0, ...this.itemUses(front).map((use) => use.value - use.slots * this.villagerUseCost))
      }
    } else if (this.season !== Season.Autumn) {
      extra += 0.5 * this.reactionYearValue(model, front)
    }
    return { value: this.staticValue(model) - this.base + extra, coins: price }
  }

  /** The Villagers of the other players standing around a card, or on their way there, who may take it first. */
  private risk(card: number, crowd: Crowd): number {
    const front = this.grid.getItem<VillageCardId>(card).id.front!
    const others = crowd.others + crowd.arrivals
    if (getVillageCardType(front) === VillageCardType.Building) {
      if (!usesSeal(villageCardData[front].abilities?.[0]?.requirements)) return 0.03
      return this.seals(card).length <= others ? 0.35 : 0.05
    }
    return Math.min(0.7, 0.05 + 0.15 * others)
  }

  private cardKey(card: number): { key?: string; capacity?: number } {
    const front = this.grid.getItem<VillageCardId>(card).id.front!
    if (getVillageCardType(front) !== VillageCardType.Building) return { key: `card${card}`, capacity: 1 }
    if (!usesSeal(villageCardData[front].abilities?.[0]?.requirements)) return {}
    return { key: `card${card}`, capacity: this.seals(card).length }
  }

  /** What taking a Villager back for coins around a card is worth. */
  private coinsAroundValue(coins: number): number {
    const neris = this.model.companions.some((owned) => owned.front === VillageCard.Neris && !owned.tilted)
    const total = coins + (neris ? 2 : 0)
    return this.coinWorth(this.model, this.model.coins + total) - this.coinWorth(this.model, this.model.coins) - (neris ? 0.7 : 0)
  }

  /**
   * The Villagers standing around a card, the player's own apart from the others', and how many more
   * the other players are likely to put there before Summer: a card touches 2 to 4 of the 12 gaps.
   */
  private crowdAround(card: number): Crowd {
    const slot = this.slotOf(card)
    const around = villagersAroundSlot(this.rules, slot).getItems()
    const mine = around.filter((item) => getVillagerPlayer(item.id as Villager) === this.player).length
    const arrivals = (this.pendingPlacements * slotGaps(slot).length) / villageGaps.length
    return { mine, others: around.length - mine, arrivals }
  }

  /**
   * What the rest of the player's year still promises: every Villager standing in the Village for the
   * card beside it, every active Villager for a gap still open in Spring, the Event, the special action
   * and the Objects not used yet. Each Villager is given its best use, a card that leaves the Village
   * only once, and the coins it all takes have to be in the purse.
   */
  thisYearPotential(explain?: string[]): number {
    if (this.season === Season.Autumn) return 0
    const uses: Use[] = []
    const name = (card: number) => VillageCard[this.grid.getItem<VillageCardId>(card).id.front!]
    let expectedCoins = 0
    // The coins around a card and the surcharge to activate it are both counted on the crowd, but not
    // the same way: the other players may leave before, and the player's own Villagers leave one by
    // one — the ones taken back for coins first, so that the activation comes last and pays for less.
    const neighbours = (card: number, crowd: Crowd, entry: Omit<Use, 'value'>, factor = 1) => {
      const coins = (crowd.others + crowd.arrivals) * 0.75 + crowd.mine / 2
      const how = entry.villager === undefined ? 'place:' : ''
      uses.push({ ...entry, label: `${how}coins@${name(card)}`, value: this.coinsAroundValue(coins) * factor })
      const activation = this.activationValue(card, Math.round(crowd.others + (crowd.arrivals + crowd.mine) * 0.5))
      if (activation) {
        const value = activation.value * (1 - this.risk(card, crowd)) * factor
        uses.push({ ...entry, ...this.cardKey(card), label: `${how}${name(card)}`, coins: activation.coins, value })
      }
      return coins
    }
    for (const [villager, item] of villagersInVillage(this.rules, this.player).entries) {
      const cards = cardsAroundGap(this.rules, gapOf(item.location))
      uses.push({ villager, value: 0 })
      let best = 0
      for (const card of cards) {
        const crowd = this.crowdAround(card)
        best = Math.max(best, neighbours(card, { ...crowd, mine: crowd.mine - 1 }, { villager }))
      }
      expectedCoins += best / 2
    }
    if (this.season === Season.Spring && this.active > 0) {
      const seen = new Set<number>()
      for (const gap of villageGaps) {
        for (const card of cardsAroundGap(this.rules, gap)) {
          if (seen.has(card)) continue
          seen.add(card)
          neighbours(card, this.crowdAround(card), { slots: 1 }, SPRING_PLACEMENT)
        }
      }
    }
    if (!this.eventUsed) {
      const event = this.eventValue()
      if (event !== undefined) uses.push({ slots: 1, key: 'event', label: 'event', capacity: 1, value: event * (this.season === Season.Spring ? 0.95 : 1) })
    }
    if (!this.specialActionUsed) {
      const special = this.specialActionValue()
      if (special !== undefined) uses.push({ slots: 1, key: 'special', label: 'special', capacity: 1, value: special * (this.season === Season.Spring ? 0.9 : 1) })
    }
    // The Magic the special action gives may be what the Event asks for: the Magic show sends the
    // Adventurer 5 spaces away for one. Counted as one use of both, or the bot would only see it once
    // it is already in Summer.
    if (!this.eventUsed && !this.specialActionUsed && this.model.magic < MAX_SKILL) {
      const magicModel = cloneModel(this.model)
      magicModel.magic++
      const boosted = this.eventValue(magicModel)
      const gained = this.effectValue([], [magic()])
      if (boosted !== undefined && gained !== undefined && boosted > (this.eventValue() ?? 0)) {
        uses.push({ slots: 2, keys: ['event', 'special'], label: 'special+event', value: (gained + boosted) * (this.season === Season.Spring ? 0.9 : 1) })
      }
    }
    this.model.items.forEach((card, index) => {
      if (card.tilted) return
      for (const use of this.itemUses(card.front)) {
        uses.push({ slots: use.slots, key: `item${index}`, label: `${VillageCard[card.front]}/${use.slots}`, capacity: 1, value: use.value })
      }
    })
    let total = 0
    for (const card of this.model.companions) if (!card.tilted) total += 0.5 * this.reactionYearValue(this.model, card.front)

    uses.sort((a, b) => b.value - a.value)
    const busy = new Set<number>()
    const keys = new Map<string, number>()
    let active = this.active
    let coins = this.model.coins + expectedCoins
    const floor = this.springFloor
    for (const use of uses) {
      if (use.villager !== undefined && busy.has(use.villager)) continue
      if ((use.slots ?? 0) > active) continue
      if (use.slots && use.value < floor * use.slots) continue
      if (use.key && (keys.get(use.key) ?? 0) >= (use.capacity ?? 1)) continue
      if (use.keys?.some((key) => keys.has(key))) continue
      if (use.coins && use.coins > coins) continue
      if (use.value <= 0 && use.villager === undefined) continue
      total += use.value
      explain?.push(`${use.label}=${use.value.toFixed(1)}`)
      if (use.villager !== undefined) busy.add(use.villager)
      active -= use.slots ?? 0
      if (use.key) keys.set(use.key, (keys.get(use.key) ?? 0) + 1)
      for (const key of use.keys ?? []) keys.set(key, 1)
      coins -= use.coins ?? 0
    }
    return total + active * (this.season === Season.Spring ? Math.max(floor, 0.4) : 0.25)
  }

  /**
   * What an active Villager is worth at the very least in Spring, while the Village still has a gap
   * next to a card: wherever it stands, the crowd that gathers around it by Summer pays it back in
   * coins, and it keeps every card beside it within reach. In Summer it has lost that, which is what
   * keeps the bot from moving on with Villagers still in hand. The 5th year pays those coins for
   * nothing, so the floor is lower then.
   */
  get springFloor(): number {
    if (this.season !== Season.Spring) return 0
    if (!villageGaps.some((gap) => cardsAroundGap(this.rules, gap).length > 0)) return 0
    return this.yearsAfter > 0 ? evaluationSettings.springFloor : evaluationSettings.lastSpringFloor
  }

  /**
   * How many active Villagers the rest of the year can still use once the Village is closed to them:
   * one for the Event, one for the special action, what the Objects the player uses every year ask
   * for, and the largest number of Villagers an Encounter of the rows or a Heroic Quest still open asks
   * to be spent — a journey only ever meets one of them.
   */
  get summerVillagerNeeds(): number {
    let needs = (this.eventUsed ? 0 : 1) + (this.specialActionUsed ? 0 : 1)
    const villagersAsked = (requirements: Requirement[] = []) =>
      gathered(requirements)
        .filter((requirement) => requirement.type === RequirementType.SpendVillagers || requirement.type === RequirementType.ReturnVillager)
        .reduce((total, requirement) => total + (requirement.count ?? 1), 0)
    for (const card of this.model.items) {
      const repeatable = (villageCardData[card.front].abilities ?? []).filter((ability) => !discardsCard(ability.requirements))
      needs += Math.max(0, ...repeatable.map((ability) => villagersAsked(ability.requirements)))
    }
    let journey = 0
    for (const item of this.rules.material(MaterialType.EncounterCard).location(LocationType.EncounterRow).getItems<EncounterCardId>()) {
      journey = Math.max(journey, villagersAsked(encounterCardData[item.id.front!].outcomes.flatMap((outcome) => outcome.requirements ?? [])))
    }
    for (const quest of this.quests) {
      if (this.model.markers && !this.model.questsDone.includes(quest.area)) journey = Math.max(journey, villagersAsked(questRequirements[quest.tile]))
    }
    return needs + journey
  }

  get eventUsed(): boolean {
    return (
      this.rules
        .material(MaterialType.Villager)
        .location(LocationType.EventSpace)
        .id<Villager>((villager) => getVillagerPlayer(villager) === this.player).length > 0
    )
  }

  get specialActionUsed(): boolean {
    return this.rules.material(MaterialType.Villager).location(LocationType.SpecialAction).player(this.player).length > 0
  }

  /** The best option of the Event of the year the player can still pay for. */
  eventValue(base: PlayerModel = this.model): number | undefined {
    const tile = this.rules.material(MaterialType.EventTile).location(LocationType.EventPile).rotation(true).getItem()?.id as EventTile | undefined
    if (tile === undefined) return undefined
    const taken = this.rules
      .material(MaterialType.Villager)
      .location(LocationType.EventSpace)
      .getItems()
      .map((item) => item.location.x)
    let best: number | undefined
    eventTileData[tile].abilities.forEach((ability, option) => {
      if (isFestival(tile) && taken.includes(option)) return
      const value = this.effectValue(ability.requirements, ability.gains, {}, base)
      if (value !== undefined && (best === undefined || value > best)) best = value
    })
    return best
  }

  /** The best of the 3 options of the special action of the personal board. */
  specialActionValue(): number | undefined {
    const options = [
      this.storyValue((specialActions[0][0] as Extract<Gain, { type: GainType.TellStory }>).rewards),
      this.travelValue(1),
      this.model.magic < MAX_SKILL ? this.effectValue([], [magic()]) : undefined
    ].filter((value): value is number => value !== undefined)
    return options.length ? Math.max(...options) : undefined
  }

  // ------------------------------------------------------------------ the action under way

  /**
   * In the middle of an action, what it still owes: the gains queued, and the journey or the Encounter
   * about to be chosen. Only read when the search stops before the action is over.
   */
  pendingValue(): number {
    const rule = this.game.rule
    if (!rule || rule.player !== this.player) return 0
    const seal = this.memory[Memory.SealValue] as number | undefined
    const gains = (this.memory[Memory.Gains] as Gain[] | undefined) ?? []
    let value = gains.length ? (this.effectValue([], gains, { seal }) ?? 0) : 0
    const resume = this.memory[Memory.Resume] as RuleId | undefined
    const next = rule.id === RuleId.Reaction ? resume : rule.id
    const distance = this.memory[Memory.TravelDistance] as number | undefined
    switch (next) {
      case RuleId.Travel:
        value += this.travelValue(distance ?? 0)
        break
      case RuleId.ResolveEncounter:
      case RuleId.ChooseOutcome:
        value += this.areaValue(this.area)
        break
      case RuleId.ChooseSkill:
        value += Math.max(this.nextLevels(this.model.force, 1), this.nextLevels(this.model.magic, 1))
        break
      case RuleId.BonusToken:
        value += 3
        break
      case RuleId.TellStory: {
        const rewards = this.memory[Memory.StoryRewards] as Gain[][] | undefined
        if (rewards) value += this.storyValue(rewards) ?? 0
        break
      }
    }
    return value
  }
}

export const evaluate = (game: GreyluneGame, player: PlayerColor): number => new Assessment(game, player).evaluate()
