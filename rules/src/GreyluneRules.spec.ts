import { applyAutomaticMoves, isCustomMoveType, MaterialGame, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { BASE_INCOME, MAX_ITEMS } from './Constants'
import { GreyluneRules } from './GreyluneRules'
import { GreyluneSetup } from './GreyluneSetup'
import { Area } from './material/Area'
import { force, gathered, isCheck, RequirementType, travel, vp } from './material/Effect'
import { EncounterCard, EncounterCardId, encounterArea, encounterIncomeToken, getEncounterCardPeriod } from './material/EncounterCard'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { playerCoins, playerForce, playerMagic, playerVp } from './material/PlayerState'
import { QuestTile } from './material/QuestTile'
import { IncomeToken } from './material/Tokens'
import { getVillageCardPeriod, PLAYERS_MINUS_ONE, VillageCard, VillageCardId, villageCardData } from './material/VillageCard'
import { getVpToken, VpTokenValue } from './material/VpToken'
import { Memory } from './Memory'
import { PlayerColor } from './PlayerColor'
import { CustomMoveType } from './rules/CustomMoveType'
import { outcomeEffect, ResolveOutcomeData } from './rules/EncounterRule'
import { RuleId } from './rules/RuleId'
import { Season } from './Season'
import { currentYear } from './Year'

type Game = MaterialGame<PlayerColor, MaterialType, LocationType, RuleId>

const BLUE = 1
const ORANGE = 2

let game: Game

const rules = () => new GreyluneRules(game)

const play = (move: MaterialMove) => applyAutomaticMoves(rules(), [move])

/** Plays the one legal move of the given kind, and fails the test when there is none. */
const playCustom = (type: CustomMoveType, matches: (data: never) => boolean = () => true) => {
  const move = rules()
    .getLegalMoves(game.rule!.player!)
    .find((move) => isCustomMoveType(type)(move) && matches(move.data as never))
  expect(move, `no legal ${CustomMoveType[type]} on rule ${RuleId[game.rule!.id]}`).toBeDefined()
  play(move!)
}

const items = (type: MaterialType): MaterialItem<PlayerColor, LocationType>[] => game.items[type] ?? []

/** How many pieces of a type are really on the table: a deleted item leaves its slot behind. */
const count = (type: MaterialType, location: LocationType, player?: PlayerColor): number => rules().material(type).location(location).player(player).length

const put = (type: MaterialType, index: number, location: MaterialItem<PlayerColor, LocationType>['location']) => {
  items(type)[index].location = location
}

/** Drops the whole Village grid so that a test can lay out only the cards it cares about. */
const emptyVillage = () => {
  for (const item of items(MaterialType.VillageCard)) {
    if (item.location.type === LocationType.VillageGrid) item.location = { type: LocationType.VillageDeck, x: 99 }
  }
  for (const item of items(MaterialType.Seal)) {
    if (item.location.type === LocationType.CardSeal) item.location = { type: LocationType.SealStack, x: 99 }
  }
}

/** Puts a chosen card on a chosen slot of the grid and returns its index. */
const placeCard = (front: VillageCard, x: number, y: number): number => {
  const index = items(MaterialType.VillageCard).findIndex((item) => (item.id as VillageCardId)?.front === front)
  const card =
    index >= 0
      ? index
      : items(MaterialType.VillageCard).push({ id: { front, back: getVillageCardPeriod(front) }, location: { type: LocationType.VillageDeck } }) - 1
  items(MaterialType.VillageCard)[card].location = { type: LocationType.VillageGrid, x, y }
  return card
}

/** Stands one of a player's Villagers in a gap of the grid, and returns its index. */
const standVillager = (player: PlayerColor, x: number, y: number): number => {
  const villager = items(MaterialType.Villager).findIndex((item) => item.location.type === LocationType.ActiveVillagers && item.location.player === player)
  items(MaterialType.Villager)[villager].location = { type: LocationType.VillageGap, player, x, y }
  return villager
}

/** Puts a chosen Encounter alone in the row of an Area, the ones of the year put away as Winter does. */
const placeEncounter = (front: EncounterCard, area: Area): number => {
  for (const item of items(MaterialType.EncounterCard)) {
    if (item.location.type === LocationType.EncounterRow) item.quantity = 0
  }
  const card = encounterCard(front)
  items(MaterialType.EncounterCard)[card].location = { type: LocationType.EncounterRow, id: area }
  delete items(MaterialType.EncounterCard)[card].quantity
  return card
}

/** The index of an Encounter card, put in the deck when the draw of the game left it out. */
const encounterCard = (front: EncounterCard): number => {
  const index = items(MaterialType.EncounterCard).findIndex((item) => (item.id as EncounterCardId)?.front === front)
  if (index >= 0) return index
  return (
    items(MaterialType.EncounterCard).push({
      id: { front, back: getEncounterCardPeriod(front) },
      location: { type: LocationType.EncounterDeck }
    }) - 1
  )
}

const setSkill = (player: PlayerColor, force: number, magic: number) => {
  items(MaterialType.StrengthMarker).find((item) => item.location.player === player)!.location.x = force
  items(MaterialType.MagicMarker).find((item) => item.location.player === player)!.location.x = magic
}

/**
 * Sends every active Villager but a few out into the Village, so a test can set the purse it means to
 * spend. The camp is left alone: it is where a Villager actually paid for something ends up.
 */
const setActiveVillagers = (player: PlayerColor, keep: number) => {
  const active = items(MaterialType.Villager).filter((item) => item.location.type === LocationType.ActiveVillagers && item.location.player === player)
  active.slice(keep).forEach((item, index) => (item.location = { type: LocationType.VillageGap, player, x: index + 0.5, y: 0 }))
}

const setSeason = (player: PlayerColor, season: Season) => {
  items(MaterialType.SeasonMarker).find((item) => item.id === player)!.location.id = season
}

const startRule = (id: RuleId, player: PlayerColor = BLUE) => {
  game.rule = { id, player }
}

/**
 * Every Village card of the grid carries what its symbol calls for, and nothing else — the `-1`
 * symbol is worth 1 Seal at the 2 players these tests seat.
 */
const expectSealsOnGrid = () => {
  for (const [card, item] of rules().material(MaterialType.VillageCard).location(LocationType.VillageGrid).entries) {
    const front = (item.id as VillageCardId).front!
    const seals = villageCardData[front].seals
    const expected = seals === PLAYERS_MINUS_ONE ? 1 : (seals ?? 0)
    expect(rules().material(MaterialType.Seal).location(LocationType.CardSeal).parent(card).length, VillageCard[front]).toBe(expected)
  }
}

beforeEach(() => {
  game = new GreyluneSetup().setup({ players: [{ id: BLUE }, { id: ORANGE }] })
})

/**
 * The setup builds the decks and the piles and hands over to {@link WinterRule} to lay the first
 * year out, so what is asserted here is that the turn of the year works on an empty table too.
 */
describe('The setup', () => {
  it('lays the first year out and opens it on the first player', () => {
    expect(currentYear(rules(), 2)).toBe(1)
    expect(count(MaterialType.VillageCard, LocationType.VillageGrid)).toBe(9)
    expect(count(MaterialType.EncounterCard, LocationType.EncounterRow)).toBe(5)
    for (const card of items(MaterialType.EncounterCard)) {
      if (card.location.type !== LocationType.EncounterRow) continue
      const front = (card.id as EncounterCardId).front!
      expect(card.location.id, `${EncounterCard[front]} is not in the row of its Area`).toBe(encounterArea[front])
    }
    expect(items(MaterialType.EventTile).filter((tile) => tile.location.rotation === true)).toHaveLength(1)
    expect(items(MaterialType.FirstPlayerToken)[0].location.player).toBe(BLUE)
    expect(game.rule).toEqual({ id: RuleId.Spring, player: BLUE })
  })

  it('gives every Village card of the first grid the Seals its symbol calls for', () => {
    expectSealsOnGrid()
  })

  it('gives every Encounter of the first row the Income token it carries', () => {
    for (const [card, item] of rules().material(MaterialType.EncounterCard).location(LocationType.EncounterRow).entries) {
      const income = encounterIncomeToken((item.id as EncounterCardId).front!)
      expect(rules().material(MaterialType.IncomeToken).location(LocationType.CardIncome).parent(card).getItem()?.id).toBe(income)
    }
  })
})

describe('The Village', () => {
  it('pays a coin for every other Villager around the card the Villager designates', () => {
    emptyVillage()
    const card = placeCard(VillageCard.Smithy, 0, 0)
    const mine = standVillager(BLUE, 0.5, 0)
    standVillager(ORANGE, 0, 0.5)
    standVillager(ORANGE, 0, 0.5)
    setSeason(BLUE, Season.Summer)
    startRule(RuleId.Summer)
    const coins = playerCoins(rules(), BLUE)
    playCustom(CustomMoveType.GainCoinsAround, (data: { villager: number; card?: number }) => data.villager === mine && data.card === card)
    expect(playerCoins(rules(), BLUE)).toBe(coins + 2)
    expect(items(MaterialType.Villager)[mine].location.type).toBe(LocationType.Camp)
  })

  it('charges a coin for every other Villager around the card the Villager activates', () => {
    emptyVillage()
    // Jade statue, 3 coins, with one more Villager standing by it.
    const card = placeCard(VillageCard.JadeStatue, 1, 1)
    const mine = standVillager(BLUE, 0.5, 1)
    standVillager(ORANGE, 1.5, 1)
    setSeason(BLUE, Season.Summer)
    startRule(RuleId.Summer)
    const coins = playerCoins(rules(), BLUE)
    playCustom(CustomMoveType.ActivateCard, (data: { villager: number }) => data.villager === mine)
    expect(playerCoins(rules(), BLUE)).toBe(coins - 4)
    expect(items(MaterialType.VillageCard)[card].location.type).toBe(LocationType.Items)
  })

  it('leaves a Building in the Village and lets the next Villager use it too', () => {
    emptyVillage()
    const card = placeCard(VillageCard.Smithy, 0, 0)
    const mine = standVillager(BLUE, 0.5, 0)
    setSeason(BLUE, Season.Summer)
    startRule(RuleId.Summer)
    playCustom(CustomMoveType.ActivateCard, (data: { villager: number }) => data.villager === mine)
    expect(items(MaterialType.VillageCard)[card].location.type).toBe(LocationType.VillageGrid)
    expect(playerForce(rules(), BLUE)).toBe(1)
  })

  it('gains nothing when both cards around the Villager are gone, and takes the Villager back anyway', () => {
    emptyVillage()
    const mine = standVillager(BLUE, 0.5, 0)
    setSeason(BLUE, Season.Summer)
    startRule(RuleId.Summer)
    const coins = playerCoins(rules(), BLUE)
    playCustom(CustomMoveType.GainCoinsAround, (data: { villager: number }) => data.villager === mine)
    expect(playerCoins(rules(), BLUE)).toBe(coins)
    expect(items(MaterialType.Villager)[mine].location.type).toBe(LocationType.Camp)
  })
})

describe('The score track', () => {
  const gain = (amount: number) => {
    startRule(RuleId.ResolveEffects)
    game.memory[Memory.Gains] = [vp(amount)]
    play(rules().startRule(RuleId.ResolveEffects) as MaterialMove)
  }

  /** Same as {@link gain}, but any Bonus token the way up asks for is picked at random and got out of the way. */
  const gainThrough = (amount: number) => {
    gain(amount)
    while (game.rule?.id === RuleId.BonusToken) playCustom(CustomMoveType.ChooseBonus)
  }

  /** Through the rules rather than the raw items: a deleted item keeps its slot in the array, with a quantity of 0. */
  const held = () => rules().material(MaterialType.VpToken).location(LocationType.PlayerVpTokens).getItems()
  const onTable = (value: VpTokenValue) => rules().material(MaterialType.VpToken).id(getVpToken(BLUE, value)).length

  it('takes the 25 token, turns it over at 50 and hands it back for the 75', () => {
    gainThrough(30)
    expect(playerVp(rules(), BLUE)).toBe(30)
    expect(held()).toHaveLength(1)
    expect(held()[0].id).toBe(getVpToken(BLUE, VpTokenValue.Vp25))
    expect(held()[0].location.rotation).toBeFalsy()

    gainThrough(25)
    expect(playerVp(rules(), BLUE)).toBe(55)
    expect(held()).toHaveLength(1)
    expect(held()[0].id).toBe(getVpToken(BLUE, VpTokenValue.Vp25))
    expect(held()[0].location.rotation).toBe(true)

    /** A player never has 2 tokens in front of them: the 25 leaves the table as the 75 comes out. */
    gainThrough(25)
    expect(playerVp(rules(), BLUE)).toBe(80)
    expect(held()).toHaveLength(1)
    expect(held()[0].id).toBe(getVpToken(BLUE, VpTokenValue.Vp75))
    expect(held()[0].location.rotation).toBeFalsy()
    expect(onTable(VpTokenValue.Vp25)).toBe(0)

    gainThrough(25)
    expect(playerVp(rules(), BLUE)).toBe(105)
    expect(held()).toHaveLength(1)
    expect(held()[0].id).toBe(getVpToken(BLUE, VpTokenValue.Vp75))
    expect(held()[0].location.rotation).toBe(true)
  })

  it('spends a Bonus token at 8 and empties the supply at 20', () => {
    gain(8)
    expect(game.rule!.id).toBe(RuleId.BonusToken)
    playCustom(CustomMoveType.ChooseBonus)
    expect(count(MaterialType.BonusToken, LocationType.BonusTokens, BLUE)).toBe(2)
    gain(12)
    expect(game.rule!.id).toBe(RuleId.BonusToken)
    playCustom(CustomMoveType.ChooseBonus)
    expect(count(MaterialType.BonusToken, LocationType.BonusTokens, BLUE)).toBe(0)
  })
})

describe('A Tavern', () => {
  const untold = (front: EncounterCard) => {
    const card = encounterCard(front)
    items(MaterialType.EncounterCard)[card].location = { type: LocationType.UntoldStories, player: BLUE }
    return card
  }

  beforeEach(() => {
    startRule(RuleId.TellStory)
    game.memory[Memory.StoryRewards] = [[vp(2)], [force()], [vp(5)]]
    game.memory[Memory.StoryValue] = 0
  })

  it('pays only the first tier for a story worth 1', () => {
    untold(EncounterCard.Ambush)
    play(rules().getLegalMoves(BLUE)[0])
    playCustom(CustomMoveType.Pass)
    expect(playerVp(rules(), BLUE)).toBe(2)
    expect(playerForce(rules(), BLUE)).toBe(0)
  })

  it('pays every tier for two Encounters worth 2 each, and never more than three', () => {
    untold(EncounterCard.Hermit)
    untold(EncounterCard.Marauders)
    play(rules().getLegalMoves(BLUE)[0])
    play(rules().getLegalMoves(BLUE)[0])
    playCustom(CustomMoveType.Pass)
    expect(playerVp(rules(), BLUE)).toBe(7)
    expect(playerForce(rules(), BLUE)).toBe(1)
    expect(count(MaterialType.EncounterCard, LocationType.ToldStories, BLUE)).toBe(2)
  })

  it('never hears an Encounter worth nothing', () => {
    untold(EncounterCard.WorldTree)
    expect(rules().getLegalMoves(BLUE)).toHaveLength(1)
    playCustom(CustomMoveType.Pass)
    expect(playerVp(rules(), BLUE)).toBe(0)
  })
})

describe('The areas', () => {
  beforeEach(() => {
    startRule(RuleId.ResolveEncounter)
    items(MaterialType.Adventurer).find((item) => item.id === BLUE)!.location = { type: LocationType.Area, id: Area.Wand }
  })

  it('offers the coin of the gold space to a player who resolves nothing', () => {
    const coins = playerCoins(rules(), BLUE)
    playCustom(CustomMoveType.SkipEncounter)
    expect(playerCoins(rules(), BLUE)).toBe(coins + 1)
  })

  it('pays both sides of an Encounter to a player who satisfies both, with nothing to choose', () => {
    // Ours: 2 victory points for 1 Force, and 2 more for 1 Magic. Neither side costs anything, so
    // both are taken and the card is resolved the moment it is named.
    const card = placeEncounter(EncounterCard.Bear, Area.Wand)
    setSkill(BLUE, 1, 1)
    playCustom(CustomMoveType.ChooseEncounter)
    expect(game.rule!.id).not.toBe(RuleId.ChooseOutcome)
    expect(playerVp(rules(), BLUE)).toBe(4)
    expect(items(MaterialType.EncounterCard)[card].location.type).toBe(LocationType.UntoldStories)
  })

  it('still asks a player who satisfies one side of the Ours to press the button that says so', () => {
    placeEncounter(EncounterCard.Bear, Area.Wand)
    setSkill(BLUE, 1, 0)
    playCustom(CustomMoveType.ChooseEncounter)
    // Half the card is out of reach: one button, and it is pressed, so that the player reads what
    // they are not being paid.
    expect(game.rule!.id).toBe(RuleId.ChooseOutcome)
    expect(rules().getLegalMoves(BLUE)).toHaveLength(1)
    playCustom(CustomMoveType.ResolveOutcome)
    expect(playerVp(rules(), BLUE)).toBe(2)
  })

  it('never offers to leave behind a side of the Vallée that costs nothing', () => {
    // Vallée: 2 spaces of road for 1 Force, and 3 victory points for a Villager.
    placeEncounter(EncounterCard.Valley, Area.Wand)
    setSkill(BLUE, 1, 0)
    setActiveVillagers(BLUE, 1)
    playCustom(CustomMoveType.ChooseEncounter)
    expect(game.rule!.id).toBe(RuleId.ChooseOutcome)
    // The road alone, or the road and the points: never the points alone, which would be the same
    // Villager for one reward less. What the 2 buttons say is what each of them takes and gives —
    // the Force is had, not paid, so it is the Villager alone that tells them apart.
    const effects = rules()
      .getLegalMoves(BLUE)
      .map((move) => outcomeEffect(EncounterCard.Valley, (move as { data: ResolveOutcomeData }).data))
    expect(effects).toEqual([
      { requirements: [{ type: RequirementType.Force, count: 1 }], gains: [travel(2)] },
      { requirements: [{ type: RequirementType.Force, count: 1 }, { type: RequirementType.SpendVillagers, count: 1 }], gains: [travel(2), vp(3)] }
    ])
    expect(effects.map((effect) => gathered(effect.requirements!.filter((requirement) => !isCheck(requirement))))).toEqual([
      [],
      [{ type: RequirementType.SpendVillagers, count: 1 }]
    ])
  })

  it('pays the points of the Vallée before sending the Adventurer back on the road', () => {
    placeEncounter(EncounterCard.Valley, Area.Wand)
    setSkill(BLUE, 1, 0)
    setActiveVillagers(BLUE, 1)
    playCustom(CustomMoveType.ChooseEncounter)
    playCustom(CustomMoveType.ResolveOutcome, (data: { outcomes: number[] }) => data.outcomes.length === 2)
    // The road is the last thing the card hands over: the 3 points are counted before the second
    // journey starts, and the Adventurer is still waiting to be moved.
    expect(playerVp(rules(), BLUE)).toBe(3)
    expect(game.rule!.id).toBe(RuleId.Travel)
  })

  it('never lets one Villager pay for both halves of the Labyrinthe', () => {
    // Labyrinthe: 4 victory points for a Villager, and 4 more for a second one.
    placeEncounter(EncounterCard.Labyrinth, Area.Wand)
    setActiveVillagers(BLUE, 1)
    playCustom(CustomMoveType.ChooseEncounter)
    // A single Villager buys a single half, and the two halves are the same offer: one button, and
    // it is pressed to say that the other half is not being paid for.
    expect(game.rule!.id).toBe(RuleId.ChooseOutcome)
    expect(rules().getLegalMoves(BLUE)).toHaveLength(1)
    playCustom(CustomMoveType.ResolveOutcome)
    expect(count(MaterialType.Villager, LocationType.Camp, BLUE)).toBe(1)
    expect(playerVp(rules(), BLUE)).toBe(4)
  })

  it('sends both Villagers to the camp when both halves of the Labyrinthe are taken', () => {
    placeEncounter(EncounterCard.Labyrinth, Area.Wand)
    setActiveVillagers(BLUE, 2)
    playCustom(CustomMoveType.ChooseEncounter)
    expect(game.rule!.id).toBe(RuleId.ChooseOutcome)
    playCustom(CustomMoveType.ResolveOutcome, (data: { outcomes: number[] }) => data.outcomes.length === 2)
    expect(count(MaterialType.Villager, LocationType.Camp, BLUE)).toBe(2)
  })

  it('never lets a player walk away from an Encounter they can resolve', () => {
    // Moutons: nothing to satisfy, so the row of the purple space is never out of reach.
    placeEncounter(EncounterCard.Sheep, Area.Hammer)
    items(MaterialType.Adventurer).find((item) => item.id === BLUE)!.location = { type: LocationType.Area, id: Area.Hammer }
    expect(rules().getLegalMoves(BLUE).some(isCustomMoveType(CustomMoveType.Pass))).toBe(false)
  })

  it('is passed only where the space owes nothing: no Encounter to pay for, and a Quest out of reach', () => {
    placeEncounter(EncounterCard.Sheep, Area.Wand)
    for (const item of items(MaterialType.QuestTile)) {
      if (item.location.id === Area.Hammer) item.id = QuestTile.Giant
    }
    items(MaterialType.Adventurer).find((item) => item.id === BLUE)!.location = { type: LocationType.Area, id: Area.Hammer }
    const moves = rules().getLegalMoves(BLUE)
    expect(moves).toHaveLength(1)
    expect(isCustomMoveType(CustomMoveType.Pass)(moves[0])).toBe(true)
  })
})

describe('An Income token', () => {
  it('is handed over with the Encounter and paid again every Autumn', () => {
    // Moutons: nothing to satisfy, and a token worth 1 coin a year.
    const sheep = placeEncounter(EncounterCard.Sheep, Area.Bow)
    const token = items(MaterialType.IncomeToken).findIndex((item) => item.id === IncomeToken.Income7)
    put(MaterialType.IncomeToken, token, { type: LocationType.CardIncome, parent: sheep })
    items(MaterialType.Adventurer).find((item) => item.id === BLUE)!.location = { type: LocationType.Area, id: Area.Bow }
    startRule(RuleId.ResolveEncounter)
    const coins = playerCoins(rules(), BLUE)
    playCustom(CustomMoveType.ChooseEncounter)
    expect(playerCoins(rules(), BLUE)).toBe(coins + 1)
    expect(items(MaterialType.IncomeToken)[token].location.type).toBe(LocationType.IncomeTokenSpace)
    setSeason(BLUE, Season.Autumn)
    setSeason(ORANGE, Season.Autumn)
    startRule(RuleId.Autumn)
    play(rules().startRule(RuleId.Autumn) as MaterialMove)
    expect(playerCoins(rules(), BLUE)).toBe(coins + 1 + BASE_INCOME + 1)
  })
})

describe('A Heroic Quest', () => {
  it('gives the higher shield to the first player and the lower to the next', () => {
    for (const item of items(MaterialType.QuestTile)) {
      if (item.location.id === Area.Hammer) item.id = QuestTile.Giant
    }
    for (const player of [BLUE, ORANGE]) {
      setSkill(player, 4, 0)
      items(MaterialType.Adventurer).find((item) => item.id === player)!.location = { type: LocationType.Area, id: Area.Hammer }
      startRule(RuleId.ResolveEncounter, player)
      playCustom(CustomMoveType.ResolveQuest)
    }
    const markers = items(MaterialType.QuestMarker).filter((item) => item.location.type === LocationType.QuestRewardSpace)
    expect(markers).toHaveLength(2)
    expect(markers.find((item) => item.id === BLUE)!.location.x).toBe(0)
    expect(markers.find((item) => item.id === ORANGE)!.location.x).toBe(1)
    expect(rules().getScore(BLUE)).toBe(7)
    expect(rules().getScore(ORANGE)).toBe(5)
  })
})

describe('Autumn', () => {
  it('brings everything home, straightens the cards and pays 3 coins less one per Companion', () => {
    const villager = items(MaterialType.Villager).findIndex((item) => item.location.type === LocationType.ActiveVillagers && item.location.player === BLUE)
    put(MaterialType.Villager, villager, { type: LocationType.Camp, player: BLUE })
    items(MaterialType.Adventurer).find((item) => item.id === BLUE)!.location = { type: LocationType.Area, id: Area.Swords }
    const companion = placeCard(VillageCard.Kael, 0, 0)
    put(MaterialType.VillageCard, companion, { type: LocationType.Companions, player: BLUE })
    const item = placeCard(VillageCard.JadeStatue, 0, 0)
    items(MaterialType.VillageCard)[item].location = { type: LocationType.Items, player: BLUE, rotation: true }
    setSeason(BLUE, Season.Autumn)
    setSeason(ORANGE, Season.Autumn)
    const coins = playerCoins(rules(), BLUE)
    startRule(RuleId.Autumn)
    play(rules().startRule(RuleId.Autumn) as MaterialMove)
    expect(playerCoins(rules(), BLUE)).toBe(coins + BASE_INCOME - 1)
    expect(items(MaterialType.Villager)[villager].location.type).toBe(LocationType.ActiveVillagers)
    expect(items(MaterialType.Adventurer).find((entry) => entry.id === BLUE)!.location.id).toBe(Area.Village)
    expect(items(MaterialType.VillageCard)[item].location.rotation).toBe(false)
  })
})

describe('Winter', () => {
  /**
   * The year is laid out off the faces of the two decks, and a player's screen does not know them:
   * it must not try to play the turn of the year on its own, and wait for the server instead.
   */
  it('is not a turn a client can play on its own', () => {
    const view = rules().getView(BLUE)
    expect(view.items[MaterialType.VillageCard]!.some((entry) => entry.location.type === LocationType.VillageDeck && entry.id.front === undefined)).toBe(true)
    const seen = new GreyluneRules(view)
    expect(seen.isUnpredictableMove(seen.startRule(RuleId.Winter) as MaterialMove, BLUE)).toBe(true)
  })

  it('lays out a new Village, turns the next Event up and passes the first player token', () => {
    const firstEvent = items(MaterialType.EventTile).find((entry) => entry.location.rotation === true)!.id
    startRule(RuleId.Winter)
    play(rules().startRule(RuleId.Winter) as MaterialMove)
    expect(currentYear(rules(), 2)).toBe(2)
    expect(count(MaterialType.VillageCard, LocationType.VillageGrid)).toBe(9)
    expect(count(MaterialType.EncounterCard, LocationType.EncounterRow)).toBe(5)
    for (const card of items(MaterialType.EncounterCard)) {
      if (card.location.type !== LocationType.EncounterRow) continue
      const front = (card.id as EncounterCardId).front!
      expect(card.location.id, `${EncounterCard[front]} is not in the row of its Area`).toBe(encounterArea[front])
    }
    const event = items(MaterialType.EventTile).find((entry) => entry.location.rotation === true)!
    expect(event.id).not.toBe(firstEvent)
    expect(items(MaterialType.FirstPlayerToken)[0].location.player).toBe(ORANGE)
    expect(game.rule).toEqual({ id: RuleId.Spring, player: ORANGE })
  })

  it('gives every card of the new grid the Seals its symbol calls for', () => {
    startRule(RuleId.Winter)
    play(rules().startRule(RuleId.Winter) as MaterialMove)
    expectSealsOnGrid()
  })

  /**
   * A Seal spent is gone for good, so the stack does run out. The rulebook then makes a new stack of
   * the discard and shuffles it (p.6) — here the stack is emptied into the discard beforehand, so
   * that the very first card of the new grid has nothing left to be paid with.
   */
  it('makes a new stack of the discard, shuffled, when the Seals run out', () => {
    for (const seal of items(MaterialType.Seal)) {
      if (seal.location.type === LocationType.SealStack) seal.location = { type: LocationType.SealDiscard }
    }
    expect(count(MaterialType.Seal, LocationType.SealStack)).toBe(0)
    startRule(RuleId.Winter)
    play(rules().startRule(RuleId.Winter) as MaterialMove)
    expectSealsOnGrid()
    expect(count(MaterialType.Seal, LocationType.SealDiscard)).toBe(0)
    expect(count(MaterialType.Seal, LocationType.SealStack)).toBeGreaterThan(0)
  })
})

describe('The Objects', () => {
  it('makes a player give one up when a purchase takes them past their limit', () => {
    emptyVillage()
    for (let slot = 0; slot < MAX_ITEMS; slot++) {
      const owned = placeCard([VillageCard.Tommy, VillageCard.WizardsStaff, VillageCard.MysteriousMap][slot], 2, 2)
      put(MaterialType.VillageCard, owned, { type: LocationType.Items, player: BLUE })
    }
    const card = placeCard(VillageCard.JadeStatue, 0, 0)
    const mine = standVillager(BLUE, 0.5, 0)
    setSeason(BLUE, Season.Summer)
    startRule(RuleId.Summer)
    playCustom(CustomMoveType.ActivateCard, (data: { villager: number }) => data.villager === mine)
    expect(game.rule!.id).toBe(RuleId.DiscardItem)
    expect(rules().getLegalMoves(BLUE)).toHaveLength(MAX_ITEMS + 1)
    play(
      rules()
        .getLegalMoves(BLUE)
        .find((move) => 'itemIndex' in move && move.itemIndex === card)!
    )
    expect(count(MaterialType.VillageCard, LocationType.Items, BLUE)).toBe(MAX_ITEMS)
    // The Object bought is worth its points even when it is the one given up (rulebook p.8).
    expect(game.rule!.id).toBe(RuleId.ChooseSkill)
    playCustom(CustomMoveType.ChooseSkill)
    expect(playerMagic(rules(), BLUE) + playerForce(rules(), BLUE)).toBe(1)
  })
})
