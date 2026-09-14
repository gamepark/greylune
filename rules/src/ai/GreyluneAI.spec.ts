import { isCustomMoveType, isMoveItemType, playAction } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { GreyluneRules } from '../GreyluneRules'
import { GreyluneSetup } from '../GreyluneSetup'
import { EventTile } from '../material/EventTile'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { activeVillagers, playerSeason } from '../material/PlayerState'
import { Season } from '../Season'
import earlySummer from './fixtures/early-summer.json'
import { VillageCard } from '../material/VillageCard'
import { PlayerColor } from '../PlayerColor'
import { CustomMoveType } from '../rules/CustomMoveType'
import { RuleId } from '../rules/RuleId'
import { Assessment } from './Evaluation'
import { chooseMove } from './GreyluneAI'
import { cloneModel, PlayerModel } from './Model'
import { GreyluneGame } from './Simulation'

const newGame = (players: number): GreyluneGame => new GreyluneSetup().setup({ players: Array.from({ length: players }, (_, i) => ({ id: i + 1 })) })

/** Plays until the game is over, each seat choosing its move with the function it is given. */
const playGame = (game: GreyluneGame, choose: (game: GreyluneGame, player: PlayerColor) => ReturnType<typeof chooseMove>, limit = 5000): number => {
  let moves = 0
  while (game.rule && moves < limit) {
    const rules = new GreyluneRules(game)
    const player = rules.getActivePlayer()!
    const move = choose(game, player)
    expect(move, `no move at rule ${RuleId[game.rule.id]} for player ${player}`).toBeDefined()
    playAction(rules, move!, player)
    moves++
  }
  return moves
}

const withCards = (model: PlayerModel, items: VillageCard[], companions: VillageCard[] = []): PlayerModel => {
  const copy = cloneModel(model)
  copy.items.push(...items.map((front) => ({ front, tilted: false })))
  copy.companions.push(...companions.map((front) => ({ front, tilted: false })))
  return copy
}

describe('The automatic player', () => {
  it('plays whole games against itself to the end, at 2, 3 and 4 players', { timeout: 600_000 }, () => {
    for (const players of [2, 3, 4]) {
      const game = newGame(players)
      const moves = playGame(game, chooseMove)
      expect(moves).toBeLessThan(5000)
      expect(game.rule).toBeUndefined()
    }
  })

  it('beats players who move at random', { timeout: 300_000 }, () => {
    const game = newGame(2)
    let random = 7
    playGame(game, (game, player) => {
      if (player === 1) return chooseMove(game, player)
      const legal = new GreyluneRules(game).getLegalMoves(player)
      random = (random * 1103515245 + 12345) % 2147483648
      return legal[random % legal.length]
    })
    const rules = new GreyluneRules(game)
    expect(rules.getScore(1)).toBeGreaterThan(rules.getScore(2))
  })

  it('opens the year in the Village, never by moving on to Summer with its Villagers in hand', () => {
    for (let table = 0; table < 5; table++) {
      const game = newGame(3)
      const player = game.rule!.player!
      expect(activeVillagers(new GreyluneRules(game), player).length).toBe(3)
      const move = chooseMove(game, player)!
      expect(isMoveItemType(MaterialType.SeasonMarker)(move)).toBe(false)
    }
  })

  /**
   * A position from a real game, year 4 at 2 players: Purple holds 6 active Villagers and 2 coins, and
   * the Treasure map can take the Adventurer to the Lone tower and on to the Wedding. The bot used to
   * move on to Summer at once for it, leaving 2 Villagers with nothing to do all year: that journey
   * is still there once the Village has had its share, as long as 2 Villagers are kept for the Wedding.
   * The rest of the year can use 4 at most: the Event, the special action and the Wedding.
   */
  it('does not leave Spring with more Villagers in hand than the rest of its year can use', { timeout: 300_000 }, () => {
    const game = JSON.parse(JSON.stringify(earlySummer)) as GreyluneGame
    const purple = PlayerColor.Purple
    expect(isMoveItemType(MaterialType.SeasonMarker)(chooseMove(game, purple)!)).toBe(false)
    for (let moves = 0; moves < 40 && playerSeason(new GreyluneRules(game), purple) === Season.Spring; moves++) {
      const rules = new GreyluneRules(game)
      const player = rules.getActivePlayer()!
      const move = chooseMove(game, player)!
      if (player === purple && isMoveItemType(MaterialType.SeasonMarker)(move)) {
        expect(activeVillagers(rules, purple).length).toBeLessThanOrEqual(4)
      }
      playAction(rules, move, player)
    }
  })

  it('takes the coins of the Banquet rather than straightening a card it does not have', () => {
    const game = newGame(2)
    const player = game.rule!.player!
    const tiles = game.items[MaterialType.EventTile]!
    const tile = tiles.findIndex((item) => item.location.rotation === true)
    tiles[tile].id = EventTile.Banquet
    const villager = new GreyluneRules(game).material(MaterialType.Villager).location(LocationType.ActiveVillagers).player(player).getIndex()
    game.items[MaterialType.Villager]![villager].location = { type: LocationType.EventSpace, parent: tile }
    game.rule = { id: RuleId.Event, player }
    const move = chooseMove(game, player)!
    expect(isCustomMoveType(CustomMoveType.TakeEventOption)(move)).toBe(true)
    expect(move.data).toBe(0)
  })

  it('values a Potion more once it has Selia, and Selia more once it has Potions', () => {
    const assessment = new Assessment(newGame(2), 1)
    const model = assessment.model
    const value = (items: VillageCard[], companions: VillageCard[] = []) => assessment.staticValue(withCards(model, items, companions))
    const potion = value([VillageCard.StrengthPotion]) - value([])
    const potionWithSelia = value([VillageCard.StrengthPotion], [VillageCard.Selia]) - value([], [VillageCard.Selia])
    expect(potionWithSelia).toBeGreaterThan(potion)
  })

  it('values a second way of going on the road less than the first', () => {
    const assessment = new Assessment(newGame(2), 1)
    const model = assessment.model
    const value = (items: VillageCard[]) => assessment.staticValue(withCards(model, items))
    const first = value([VillageCard.TreasureMap]) - value([])
    const second = value([VillageCard.Tommy, VillageCard.TreasureMap]) - value([VillageCard.Tommy])
    expect(second).toBeLessThan(first)
    // A statue is worth its points whatever else is owned: owning two is no mistake. (Both are counted
    // on top of an Object already owned, since the first Object of all also opens the Donation.)
    const statue = value([VillageCard.Horn, VillageCard.JadeStatue]) - value([VillageCard.Horn])
    const secondStatue = value([VillageCard.Horn, VillageCard.GoldStatue, VillageCard.JadeStatue]) - value([VillageCard.Horn, VillageCard.GoldStatue])
    expect(secondStatue).toBeCloseTo(statue)
  })

  it('keeps its gold in balance: each coin is worth less than the one before, and a hoard is worth little', () => {
    const assessment = new Assessment(newGame(2), 1)
    const marginal = (coins: number) => assessment.coinsValue(coins + 1) - assessment.coinsValue(coins)
    expect(marginal(3)).toBeGreaterThan(marginal(12))
    expect(marginal(12)).toBeGreaterThan(marginal(25))
  })

  it('prepares the 5th year: Companions, Objects and stories all count towards the cards that come out then', () => {
    const assessment = new Assessment(newGame(3), 1)
    const model = assessment.model
    const lastYear = (change: (model: PlayerModel) => void) => {
      const copy = cloneModel(model)
      change(copy)
      return assessment.lastYearValue(copy) - assessment.lastYearValue(model)
    }
    expect(lastYear((copy) => copy.companions.push({ front: VillageCard.Kael, tilted: false }))).toBeGreaterThan(0)
    expect(lastYear((copy) => copy.items.push({ front: VillageCard.Horn, tilted: false }))).toBeGreaterThan(0)
    expect(lastYear((copy) => copy.told.push(1))).toBeGreaterThan(0)
    expect(lastYear((copy) => copy.untold.push(2))).toBeGreaterThan(0)
  })
})
