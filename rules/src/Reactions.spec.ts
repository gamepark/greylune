import { applyAutomaticMoves, isCustomMoveType, MaterialGame, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { GreyluneRules } from './GreyluneRules'
import { GreyluneSetup } from './GreyluneSetup'
import { Area } from './material/Area'
import { force, magic, travel, vp } from './material/Effect'
import { EncounterCard, EncounterCardId, getEncounterCardPeriod } from './material/EncounterCard'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { playerCoins, playerForce, playerMagic, playerVp } from './material/PlayerState'
import { TriggerType } from './material/Reaction'
import { getVillageCardPeriod, VillageCard, VillageCardId } from './material/VillageCard'
import { Memory } from './Memory'
import { PlayerColor } from './PlayerColor'
import { CustomMoveType } from './rules/CustomMoveType'
import { RuleId } from './rules/RuleId'
import { Season } from './Season'

type Game = MaterialGame<PlayerColor, MaterialType, LocationType, RuleId>

const BLUE = 1
const ORANGE = 2

let game: Game

const rules = () => new GreyluneRules(game)
const play = (move: MaterialMove) => applyAutomaticMoves(rules(), [move])
const items = (type: MaterialType): MaterialItem<PlayerColor, LocationType>[] => game.items[type] ?? []

const playCustom = (type: CustomMoveType, matches: (data: never) => boolean = () => true) => {
  const move = rules()
    .getLegalMoves(game.rule!.player!)
    .find((move) => isCustomMoveType(type)(move) && matches(move.data as never))
  expect(move, `no legal ${CustomMoveType[type]} on rule ${RuleId[game.rule!.id]}`).toBeDefined()
  play(move!)
}

/** Finds a card of the box, wherever the draw of the game left it, and returns its index. */
const card = (front: VillageCard): number => {
  const index = items(MaterialType.VillageCard).findIndex((item) => (item.id as VillageCardId)?.front === front)
  if (index >= 0) return index
  return items(MaterialType.VillageCard).push({ id: { front, back: getVillageCardPeriod(front) }, location: { type: LocationType.VillageDeck } }) - 1
}

const encounter = (front: EncounterCard): number => {
  const index = items(MaterialType.EncounterCard).findIndex((item) => (item.id as EncounterCardId)?.front === front)
  if (index >= 0) return index
  return items(MaterialType.EncounterCard).push({ id: { front, back: getEncounterCardPeriod(front) }, location: { type: LocationType.EncounterDeck } }) - 1
}

/** Hands a card to a player, straight and ready to answer. */
const give = (front: VillageCard, location = LocationType.Companions): number => {
  const index = card(front)
  items(MaterialType.VillageCard)[index].location = { type: location, player: BLUE }
  return index
}

/** Puts a chosen Encounter alone in the row of an Area, the ones of the year put away as Winter does. */
const placeEncounter = (front: EncounterCard, area: Area): number => {
  for (const item of items(MaterialType.EncounterCard)) {
    if (item.location.type === LocationType.EncounterRow) item.quantity = 0
  }
  const index = encounter(front)
  items(MaterialType.EncounterCard)[index].location = { type: LocationType.EncounterRow, id: area }
  delete items(MaterialType.EncounterCard)[index].quantity
  return index
}

const emptyVillage = () => {
  for (const item of items(MaterialType.VillageCard)) {
    if (item.location.type === LocationType.VillageGrid) item.location = { type: LocationType.VillageDeck, x: 99 }
  }
  for (const item of items(MaterialType.Seal)) {
    if (item.location.type === LocationType.CardSeal) item.location = { type: LocationType.SealStack, x: 99 }
  }
}

const placeCard = (front: VillageCard, x: number, y: number): number => {
  const index = card(front)
  items(MaterialType.VillageCard)[index].location = { type: LocationType.VillageGrid, x, y }
  return index
}

const standVillager = (player: PlayerColor, x: number, y: number): number => {
  const villager = items(MaterialType.Villager).findIndex((item) => item.location.type === LocationType.ActiveVillagers && item.location.player === player)
  items(MaterialType.Villager)[villager].location = { type: LocationType.VillageGap, player, x, y }
  return villager
}

const setSkill = (player: PlayerColor, strength: number, spell: number) => {
  items(MaterialType.StrengthMarker).find((item) => item.location.player === player)!.location.x = strength
  items(MaterialType.MagicMarker).find((item) => item.location.player === player)!.location.x = spell
}

const setCoins = (player: PlayerColor, amount: number) => {
  for (const item of items(MaterialType.Coin)) if (item.location.player === player) item.quantity = 0
  items(MaterialType.Coin).push({ id: 1, quantity: amount, location: { type: LocationType.PlayerCoins, player } })
}

/** Queues a gain and hands it over, the way an action would. */
const owe = (...gains: ReturnType<typeof vp>[]) => {
  game.rule = { id: RuleId.ResolveEffects, player: BLUE }
  game.memory[Memory.Gains] = gains
  play(rules().startRule(RuleId.ResolveEffects) as MaterialMove)
}

/** The move that walks the Adventurer to an Area, among the ones the road is offering. */
const travelTo = (area: Area): MaterialMove =>
  rules()
    .getLegalMoves(BLUE)
    .find((move) => 'location' in move && move.location?.type === LocationType.Area && move.location.id === area)!

const useReaction = (index: number, option = 0) =>
  playCustom(CustomMoveType.UseReaction, (data: { card: number; option: number }) => data.card === index && data.option === option)

beforeEach(() => {
  game = new GreyluneSetup().setup({ players: [{ id: BLUE }, { id: ORANGE }] })
  emptyVillage()
})

describe('Elwen', () => {
  it('lengthens the journey by 2 areas', () => {
    const elwen = give(VillageCard.Elwen)
    owe(travel(1))
    expect(game.rule!.id).toBe(RuleId.Reaction)
    useReaction(elwen)
    expect(game.rule!.id).toBe(RuleId.Travel)
    expect(rules().remind(Memory.TravelLeft)).toBe(3)
    expect(items(MaterialType.VillageCard)[elwen].location.rotation).toBe(true)
  })

  it('stays out of the way when she is already tilted', () => {
    const elwen = give(VillageCard.Elwen)
    items(MaterialType.VillageCard)[elwen].location.rotation = true
    owe(travel(1))
    expect(game.rule!.id).toBe(RuleId.Travel)
  })
})

describe('Lucan', () => {
  it('turns Magic gained into Force as well', () => {
    const lucan = give(VillageCard.Lucan)
    owe(magic(1))
    expect(playerMagic(rules(), BLUE)).toBe(1)
    expect(game.rule!.id).toBe(RuleId.Reaction)
    useReaction(lucan)
    expect(playerForce(rules(), BLUE)).toBe(1)
  })
})

describe('Kael', () => {
  it('takes one Force off what a Building asks for', () => {
    const kael = give(VillageCard.Kael)
    // Hall of the heroes: 3 victory points for 1 Force.
    const building = placeCard(VillageCard.HallOfTheHeroes, 0, 0)
    const villager = standVillager(BLUE, 0.5, 0)
    setSkill(BLUE, 0, 0)
    items(MaterialType.SeasonMarker).find((item) => item.id === BLUE)!.location.x = Season.Summer
    game.rule = { id: RuleId.Summer, player: BLUE }
    playCustom(CustomMoveType.ActivateCard, (data: { villager: number }) => data.villager === villager)
    // Nothing is affordable without him, so Kael is the only thing the rule has to offer.
    expect(game.rule!.id).toBe(RuleId.ActivateCard)
    expect(
      rules()
        .getLegalMoves(BLUE)
        .every((move) => isCustomMoveType(CustomMoveType.UseReaction)(move))
    ).toBe(true)
    useReaction(kael)
    playCustom(CustomMoveType.ChooseAbility, (data: { ability: number }) => data.ability === 0)
    expect(playerVp(rules(), BLUE)).toBe(3)
    expect(playerForce(rules(), BLUE)).toBe(0)
    expect(items(MaterialType.VillageCard)[building].location.type).toBe(LocationType.VillageGrid)
  })
})

describe('Neris', () => {
  it('waves away the coins the crowd around a card would cost', () => {
    const neris = give(VillageCard.Neris)
    // Magic ring, 7 coins, with 3 more Villagers standing around it.
    const item = placeCard(VillageCard.MagicRing, 1, 1)
    const villager = standVillager(BLUE, 0.5, 1)
    standVillager(ORANGE, 1.5, 1)
    standVillager(ORANGE, 1, 0.5)
    standVillager(ORANGE, 1, 1.5)
    setCoins(BLUE, 7)
    items(MaterialType.SeasonMarker).find((entry) => entry.id === BLUE)!.location.x = Season.Summer
    game.rule = { id: RuleId.Summer, player: BLUE }
    playCustom(CustomMoveType.ActivateCard, (data: { villager: number }) => data.villager === villager)
    expect(game.rule!.id).toBe(RuleId.ActivateCard)
    // 10 coins are due and only 7 are there: the only thing offered is the answer that helps most.
    expect(
      rules()
        .getLegalMoves(BLUE)
        .every((move) => isCustomMoveType(CustomMoveType.UseReaction)(move))
    ).toBe(true)
    useReaction(neris, 1)
    playCustom(CustomMoveType.ChooseAbility)
    expect(playerCoins(rules(), BLUE)).toBe(0)
    expect(items(MaterialType.VillageCard)[item].location.type).toBe(LocationType.Items)
  })
})

describe('Dorian', () => {
  it('knocks a coin off an Object and turns it into a point', () => {
    const dorian = give(VillageCard.Dorian)
    const item = placeCard(VillageCard.MagicRing, 0, 0)
    const villager = standVillager(BLUE, 0.5, 0)
    setCoins(BLUE, 7)
    items(MaterialType.SeasonMarker).find((entry) => entry.id === BLUE)!.location.x = Season.Summer
    game.rule = { id: RuleId.Summer, player: BLUE }
    playCustom(CustomMoveType.ActivateCard, (data: { villager: number }) => data.villager === villager)
    useReaction(dorian)
    playCustom(CustomMoveType.ChooseAbility)
    expect(playerCoins(rules(), BLUE)).toBe(1)
    expect(playerVp(rules(), BLUE)).toBe(1)
    expect(items(MaterialType.VillageCard)[item].location.type).toBe(LocationType.Items)
  })
})

describe('The Potions', () => {
  it('lends 2 Force for the length of an adventure, and is emptied for good', () => {
    const potion = give(VillageCard.StrengthPotion, LocationType.Items)
    // Meute de loups: 3 victory points for 2 Force.
    placeEncounter(EncounterCard.PackOfWolves, Area.Wand)
    setSkill(BLUE, 0, 0)
    game.rule = { id: RuleId.Travel, player: BLUE }
    game.memory[Memory.TravelLeft] = 1
    play(rules().getLegalMoves(BLUE)[0])
    expect(game.rule!.id).toBe(RuleId.Reaction)
    useReaction(potion)
    expect(game.rule!.id).toBe(RuleId.ResolveEncounter)
    playCustom(CustomMoveType.ChooseEncounter)
    expect(playerVp(rules(), BLUE)).toBe(3)
    // The Force was only lent: the track never moved.
    expect(playerForce(rules(), BLUE)).toBe(0)
    expect(rules().material(MaterialType.VillageCard).location(LocationType.Items).player(BLUE).length).toBe(0)
  })

  it('takes a condition off one Encounter and does not follow the road to the next', () => {
    const potion = give(VillageCard.InvisibilityPotion, LocationType.Items)
    // Vallée: 2 spaces of road for 1 Force, and the road leads to a Meute de loups asking 2 Force.
    placeEncounter(EncounterCard.Valley, Area.Wand)
    const wolves = encounter(EncounterCard.PackOfWolves)
    items(MaterialType.EncounterCard)[wolves].location = { type: LocationType.EncounterRow, id: Area.Bow }
    delete items(MaterialType.EncounterCard)[wolves].quantity
    setSkill(BLUE, 0, 0)
    game.rule = { id: RuleId.Travel, player: BLUE }
    game.memory[Memory.TravelLeft] = 1
    play(rules().getLegalMoves(BLUE)[0])
    useReaction(potion)
    expect(rules().remind(Memory.IgnoredConditions)).toBe(1)
    // The Force the Vallée asks for is waved away, and the road it pays with is taken.
    playCustom(CustomMoveType.ChooseEncounter)
    playCustom(CustomMoveType.ResolveOutcome, (data: { outcomes: number[] }) => data.outcomes.length === 1 && data.outcomes[0] === 0)
    expect(rules().remind(Memory.IgnoredConditions)).toBe(0)
    expect(game.rule!.id).toBe(RuleId.Travel)
    play(travelTo(Area.Bow))
    // The favour was spent on the Vallée: the wolves are out of reach, and the green space pays instead.
    expect(game.rule!.id).toBe(RuleId.ResolveEncounter)
    expect(rules().getLegalMoves(BLUE).some(isCustomMoveType(CustomMoveType.ChooseEncounter))).toBe(false)
  })

  it('is only tilted when Selia keeps it', () => {
    give(VillageCard.Selia)
    const potion = give(VillageCard.StrengthPotion, LocationType.Items)
    game.rule = { id: RuleId.Reaction, player: BLUE }
    game.memory[Memory.Trigger] = [TriggerType.ResolveEncounter]
    game.memory[Memory.Resume] = RuleId.ResolveEffects
    useReaction(potion)
    expect(items(MaterialType.VillageCard)[potion].location.type).toBe(LocationType.Items)
    expect(items(MaterialType.VillageCard)[potion].location.rotation).toBe(true)
  })
})

describe('Isandre', () => {
  it('stands back up the card that has just gone down', () => {
    const isandre = give(VillageCard.Isandre)
    // Cor: 3 victory points for a tilt and a Villager.
    const horn = give(VillageCard.Horn, LocationType.Items)
    items(MaterialType.SeasonMarker).find((entry) => entry.id === BLUE)!.location.x = Season.Summer
    game.rule = { id: RuleId.Summer, player: BLUE }
    playCustom(CustomMoveType.UseItem, (data: { card: number; ability: number }) => data.card === horn && data.ability === 0)
    expect(items(MaterialType.VillageCard)[horn].location.rotation).toBe(true)
    expect(game.rule!.id).toBe(RuleId.Reaction)
    useReaction(isandre)
    expect(items(MaterialType.VillageCard)[horn].location.rotation).toBe(false)
    expect(items(MaterialType.VillageCard)[isandre].location.rotation).toBe(true)
    expect(playerVp(rules(), BLUE)).toBe(3)
  })

  it('answers a Companion tilted for its own reaction, and not only an Object', () => {
    const isandre = give(VillageCard.Isandre)
    const elwen = give(VillageCard.Elwen)
    game.rule = { id: RuleId.Reaction, player: BLUE }
    game.memory[Memory.Trigger] = [TriggerType.Travel]
    game.memory[Memory.Resume] = RuleId.ResolveEffects
    game.memory[Memory.TravelLeft] = 1
    useReaction(elwen)
    // The window was opened on the journey and now holds the tilt Elwen paid with.
    expect(game.rule!.id).toBe(RuleId.Reaction)
    useReaction(isandre)
    expect(items(MaterialType.VillageCard)[elwen].location.rotation).toBe(false)
    expect(items(MaterialType.VillageCard)[isandre].location.rotation).toBe(true)
  })
})

describe('Seren', () => {
  it('tells an Encounter worth nothing as if it were worth three', () => {
    const seren = give(VillageCard.Seren)
    const tree = encounter(EncounterCard.WorldTree)
    items(MaterialType.EncounterCard)[tree].location = { type: LocationType.UntoldStories, player: BLUE }
    game.rule = { id: RuleId.ResolveEffects, player: BLUE }
    game.memory[Memory.Gains] = [{ type: 10, rewards: [[vp(2)], [force()], [vp(5)]] }]
    play(rules().startRule(RuleId.ResolveEffects) as MaterialMove)
    expect(game.rule!.id).toBe(RuleId.Reaction)
    useReaction(seren)
    expect(game.rule!.id).toBe(RuleId.TellStory)
    play(rules().getLegalMoves(BLUE)[0])
    playCustom(CustomMoveType.Pass)
    expect(playerVp(rules(), BLUE)).toBe(7)
    expect(playerForce(rules(), BLUE)).toBe(1)
  })
})

describe('Mira', () => {
  it('is offered once the road is behind, so a Villager the Encounter has just given can be placed', () => {
    const mira = give(VillageCard.Mira)
    // Ferme: a Villager, and nothing to pay for it. A card in the Village gives it somewhere to stand.
    placeEncounter(EncounterCard.Farm, Area.Wand)
    placeCard(VillageCard.Smithy, 0, 0)
    owe(travel(1))
    play(rules().getLegalMoves(BLUE)[0])
    playCustom(CustomMoveType.ChooseEncounter)
    expect(game.rule!.id).toBe(RuleId.Reaction)
    useReaction(mira)
    expect(game.rule!.id).toBe(RuleId.PlaceVillager)
    expect(items(MaterialType.VillageCard)[mira].location.rotation).toBe(true)
  })

  it('answers the journey itself, and not the Encounter: no card resolved, and she still speaks', () => {
    const mira = give(VillageCard.Mira)
    placeEncounter(EncounterCard.Farm, Area.Wand)
    placeCard(VillageCard.Smithy, 0, 0)
    owe(travel(1))
    play(rules().getLegalMoves(BLUE)[0])
    // The coin of the gold space rather than the Farm: turning an Encounter down is the only way to
    // resolve nothing where the space offers something (see {@link ResolveEncounterRule}).
    playCustom(CustomMoveType.SkipEncounter)
    expect(game.rule!.id).toBe(RuleId.Reaction)
    useReaction(mira)
    expect(game.rule!.id).toBe(RuleId.PlaceVillager)
  })
})

describe('Every Companion', () => {
  it('answers something the game can actually put to it', () => {
    const companions = [
      VillageCard.Kael,
      VillageCard.Elwen,
      VillageCard.Dorian,
      VillageCard.Ariok,
      VillageCard.Selia,
      VillageCard.Neris,
      VillageCard.Bran,
      VillageCard.Lucan,
      VillageCard.Isandre,
      VillageCard.Seren,
      VillageCard.Mira
    ]
    for (const front of companions) {
      game = new GreyluneSetup().setup({ players: [{ id: BLUE }, { id: ORANGE }] })
      const index = give(front)
      setSkill(BLUE, 3, 3)
      game.rule = { id: RuleId.Reaction, player: BLUE }
      game.memory[Memory.Resume] = RuleId.ResolveEffects
      // Opened on every trigger at once: what matters is that the card knows how to answer.
      game.memory[Memory.Trigger] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      game.memory[Memory.LastTilted] = give(VillageCard.Horn, LocationType.Items)
      const choices = rules()
        .getLegalMoves(BLUE)
        .filter((move) => isCustomMoveType(CustomMoveType.UseReaction)(move))
      expect(choices.length, `${VillageCard[front]} answers nothing`).toBeGreaterThan(0)
      play(choices[0])
      expect(items(MaterialType.VillageCard)[index].location.rotation).toBe(true)
    }
  })
})
