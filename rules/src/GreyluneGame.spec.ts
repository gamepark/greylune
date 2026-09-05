import { applyAutomaticMoves, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'

import { GreyluneRules } from './GreyluneRules'
import { GreyluneSetup } from './GreyluneSetup'
import { Area } from './material/Area'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { adventurerArea, playerSeason, villagersAtDisposal } from './material/PlayerState'
import { VILLAGERS_PER_PLAYER } from './material/Villager'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'
import { Season } from './Season'
import { currentYear, encounterRowSize, YEARS } from './Year'

type Game = MaterialGame<PlayerColor, MaterialType, LocationType, RuleId>

/**
 * Whole games played at random, from the setup to the final score. Nothing here checks a rule in
 * particular: it checks that the rules always have a legal move to offer, that the material never
 * ends up somewhere it should not be, and that a game always reaches its end.
 */
const MOVES_PER_GAME = 20000

const newGame = (players: number): Game => new GreyluneSetup().setup({ players: Array.from({ length: players }, (_, i) => ({ id: i + 1 })) })

const playRandomGame = (players: number, seed = 0): { game: Game; moves: number } => {
  const game = newGame(players)
  let moves = 0
  let random = seed + 1
  while (game.rule && moves < MOVES_PER_GAME) {
    const rules = new GreyluneRules(game)
    const player = rules.getActivePlayer()!
    const legal = rules.getLegalMoves(player)
    expect(legal, `no legal move for player ${player} on rule ${game.rule.id} (move ${moves})`).not.toHaveLength(0)
    random = (random * 1103515245 + 12345) % 2147483648
    applyAutomaticMoves(rules, [legal[random % legal.length] as MaterialMove])
    moves++
    check(game)
  }
  return { game, moves }
}

/** What must hold between any two moves of any game. */
const check = (game: Game) => {
  const rules = new GreyluneRules(game)
  // The 5 rows of the 5 years are all the Encounters there will ever be: none is created along the
  // way, and one nobody took is deleted in Winter, which leaves its slot behind rather than the game
  // state. So the slots are counted, and every card still in play is somewhere it belongs.
  expect(game.items[MaterialType.EncounterCard]!.length).toBe(YEARS * encounterRowSize(game.players.length))
  for (const item of rules.material(MaterialType.EncounterCard).getItems()) {
    expect([LocationType.EncounterDeck, LocationType.EncounterRow, LocationType.UntoldStories, LocationType.ToldStories]).toContain(item.location.type)
  }
  for (const player of game.players) {
    // The 7 figures of a player are somewhere, and only ever in one of the places they belong.
    const villagers = rules.material(MaterialType.Villager).player(player)
    expect(villagers.length).toBe(VILLAGERS_PER_PLAYER)
    for (const item of villagers.getItems()) {
      expect([
        LocationType.ActiveVillagers,
        LocationType.VillagerReserve,
        LocationType.Camp,
        LocationType.VillageGap,
        LocationType.EventSpace,
        LocationType.SpecialAction
      ]).toContain(item.location.type)
    }
    // A player never keeps more Companions than the 3 the rulebook allows.
    expect(rules.material(MaterialType.VillageCard).location(LocationType.Companions).player(player).length).toBeLessThanOrEqual(3)
    // Both tracks stay on their board, and the Adventurer within the areas of the main board.
    expect(rules.material(MaterialType.StrengthMarker).player(player).getItem()!.location.x).toBeLessThanOrEqual(5)
    expect(rules.material(MaterialType.MagicMarker).player(player).getItem()!.location.x).toBeLessThanOrEqual(5)
    expect(adventurerArea(rules, player)).toBeLessThanOrEqual(Area.Edge)
    // A player only ever holds one victory point token: the 25 is handed back for the 75.
    expect(rules.material(MaterialType.VpToken).location(LocationType.PlayerVpTokens).player(player).length).toBeLessThanOrEqual(1)
  }
}

/** Enough of them that the odd combination of Companions, Seals and Potions comes up somewhere. */
const GAMES_PER_TABLE = 40

describe('A game played at random', () => {
  for (const players of [2, 3, 4]) {
    it(`reaches its end with ${players} players`, { timeout: 120_000 }, () => {
      const scores = new Set<string>()
      for (let seed = 0; seed < GAMES_PER_TABLE; seed++) {
        const { game, moves } = playRandomGame(players, seed)
        expect(moves, `the game never ended (seed ${seed})`).toBeLessThan(MOVES_PER_GAME)
        expect(game.rule, `the game ended before the 5th year (seed ${seed})`).toBeUndefined()
        const rules = new GreyluneRules(game)
        expect(currentYear(rules, players), 'the game ended on the wrong year').toBe(YEARS)
        for (const player of game.players) {
          expect(playerSeason(rules, player)).toBe(Season.Autumn)
          expect(rules.getScore(player)).toBeGreaterThanOrEqual(0)
          expect(villagersAtDisposal(rules, player)).toBeLessThanOrEqual(VILLAGERS_PER_PLAYER)
        }
        scores.add(game.players.map((player) => rules.getScore(player)).join('/'))
      }
      // Two games of Greylune are never the same: the draw alone sees to that.
      expect(scores.size).toBeGreaterThan(GAMES_PER_TABLE / 2)
    })
  }
})
