import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { EncounterCard } from '@gamepark/greylune/material/EncounterCard'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { VillageCard } from '@gamepark/greylune/material/VillageCard'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { wrapRulesWithTutorial } from '../../../node_modules/@gamepark/react-game/dist/components/tutorial/TutorialRulesWrapper.js'
import { applyAutomaticMoves, LocalMoveType, Material, MaterialGame, MaterialMove, MoveKind } from '@gamepark/rules-api'
import { describe, expect, it, vi } from 'vitest'
import { Tutorial } from './Tutorial'
import { me, william } from './TutorialSetup'

/**
 * The display is not loaded: it needs a browser. The tutorial only takes its base class from it, which
 * is rebuilt here from what it does — everything else it exports is a stand-in nobody calls.
 */
vi.mock('@gamepark/react-game', () => {
  class MaterialTutorial {
    declare setup: { setup(options: unknown, tutorial: unknown): MaterialGame }
    declare options: unknown
    declare players: unknown[]
    material(game: MaterialGame, type: number) {
      return new Material(type, game.items[type])
    }
    setupTutorial() {
      return [this.setup.setup(this.options, { step: 0, stepComplete: false, popupClosed: false }), this.players]
    }
  }
  const exports: Record<string | symbol, unknown> = { MaterialTutorial }
  const isExport = (key: string | symbol) => typeof key === 'string' && /^[A-Za-z]/.test(key) && key !== 'then'
  return new Proxy(exports, { get: (target, key) => (isExport(key) ? (target[key] ??= function () {}) : target[key]) })
})

/**
 * The tutorial is a script played on the real rules: a step that lets nothing through, or a move the
 * rules no longer offer, leaves the player stuck with a popup and no way forward. So the whole script
 * is played here, every step taking the first move it lets through, as the opponent does.
 */
describe('Tutorial', () => {
  it('can be played to its last step', () => {
    const tutorial = new Tutorial()
    wrapRulesWithTutorial(tutorial, GreyluneRules)
    const [game] = tutorial.setupTutorial()
    const rules = new GreyluneRules(game as MaterialGame)
    const play = (move: MaterialMove) => applyAutomaticMoves(rules, [move])
    const local = (type: LocalMoveType, step?: number) => ({ kind: MoveKind.LocalMove, type, step }) as MaterialMove

    // Applying the setup's own automatic moves, as the client does when the tutorial opens.
    applyAutomaticMoves(rules)
    let guard = 0
    while (game.tutorial!.step < tutorial.steps.length) {
      expect(guard++).toBeLessThan(500)
      const step = tutorial.steps[game.tutorial!.step]
      if (!step.move) {
        play(local(LocalMoveType.SetTutorialStep, game.tutorial!.step + 1))
        continue
      }
      const player = step.move.player ?? me
      const moves = rules.getLegalMoves(player).filter((move) => move.kind !== MoveKind.LocalMove)
      if (moves.length) {
        play(moves[0])
      } else {
        expect(game.tutorial!.interrupt?.length, `step ${game.tutorial!.step} lets nothing through`).toBeTruthy()
        play(local(LocalMoveType.CloseTutorialPopup))
      }
    }

    // The year went the way the texts tell it.
    const front = (type: MaterialType, location: LocationType, player: PlayerColor) =>
      game.items[type]!.filter((item) => item.location.type === location && item.location.player === player).map((item) => item.id.front)
    const coins = (player: PlayerColor) =>
      game.items[MaterialType.Coin]!.filter((item) => item.location.type === LocationType.PlayerCoins && item.location.player === player).reduce(
        (sum, item) => sum + item.id * (item.quantity ?? 1),
        0
      )
    expect(front(MaterialType.VillageCard, LocationType.Companions, me)).toEqual([VillageCard.Dorian])
    expect(front(MaterialType.VillageCard, LocationType.Items, me)).toEqual([VillageCard.Tommy])
    expect(front(MaterialType.EncounterCard, LocationType.UntoldStories, me)).toEqual([EncounterCard.Sheep])
    expect(front(MaterialType.EncounterCard, LocationType.ToldStories, william)).toEqual([EncounterCard.Tiger])
    // 8 - 7 (Dorian) + 3 (Banquet) - 3 (Tommy) + 1 (Sheep) + 3 (income) = 5; 8 - 1 (Riven Oak) + 3 (Banquet) + 3 (income) = 13
    expect(coins(me)).toBe(5)
    expect(coins(william)).toBe(13)
    expect(game.rule).toMatchObject({ id: RuleId.Spring, player: william })
  })
})
