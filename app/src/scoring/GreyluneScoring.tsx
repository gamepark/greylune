import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { companionsScore, itemsScore, questScore, skillScore } from '@gamepark/greylune/material/PlayerState'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ScoringDescription } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

enum ScoringKey {
  Game = 1,
  Quests,
  Companions,
  Items,
  Skills,
  Total
}

const counts: Partial<Record<ScoringKey, (rules: GreyluneRules, player: PlayerColor) => number>> = {
  [ScoringKey.Quests]: questScore,
  [ScoringKey.Companions]: companionsScore,
  [ScoringKey.Items]: itemsScore,
  [ScoringKey.Skills]: skillScore
}

const labels: Record<ScoringKey, string> = {
  [ScoringKey.Game]: 'scoring.game',
  [ScoringKey.Quests]: 'scoring.quests',
  [ScoringKey.Companions]: 'scoring.companions',
  [ScoringKey.Items]: 'scoring.items',
  [ScoringKey.Skills]: 'scoring.skills',
  [ScoringKey.Total]: 'scoring.total'
}

/**
 * The score of the game over screen, line by line as the rulebook adds it up (p.13).
 *
 * Nothing is remembered to write it: once the count is over the score track shows everything, and the
 * points scored along the way are what is left of it when the counts — read off the state, which the
 * counting never touches — are taken back out.
 */
export class GreyluneScoring implements ScoringDescription<PlayerColor, GreyluneRules, ScoringKey> {
  getScoringKeys(): ScoringKey[] {
    return [ScoringKey.Game, ScoringKey.Quests, ScoringKey.Companions, ScoringKey.Items, ScoringKey.Skills, ScoringKey.Total]
  }

  getScoringHeader(key: ScoringKey) {
    const label = <Trans i18nKey={labels[key]} />
    return key === ScoringKey.Total ? <strong>{label}</strong> : label
  }

  getScoringPlayerData(key: ScoringKey, player: PlayerColor, rules: GreyluneRules) {
    const total = rules.getScore(player)
    switch (key) {
      case ScoringKey.Game:
        return Object.values(counts).reduce((left, count) => left - count(rules, player), total)
      case ScoringKey.Total:
        return <strong>{total}</strong>
      default:
        return counts[key]!(rules, player)
    }
  }
}
