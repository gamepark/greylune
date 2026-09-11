import { EncounterCard } from '@gamepark/greylune/material/EncounterCard'
import { outcomeEffect } from '@gamepark/greylune/rules/EncounterRule'
import { CustomMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { EffectLabel } from '../components/Effect'
import { TravelIcon } from '../components/Icons'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { isChooseEncounter, resolveOutcomeData } from './EncounterActions'

/**
 * What an Encounter of the row the Adventurer stopped in wears (see {@link encounterMoves}): one
 * button to take the card while the row is being read, and — once it is the card being resolved —
 * one per way of paying for it, stacked down the card so that the sides stand apart. The rider is on
 * them because an Encounter is what the road hands out: it is answered where the Adventurer stopped,
 * and it is the end of the journey.
 */
export const EncounterCardMenu = ({ front, moves, x }: { front: EncounterCard; moves: CustomMove[]; x: number }) => (
  <>
    {moves.map((move, index) => (
      <GreyluneMenuButton
        key={index}
        x={0}
        y={rowStagger(moves, x) + (index - (moves.length - 1) / 2) * resolveButtonStep}
        move={move}
        label={<ResolveLabel front={front} move={move} />}
      >
        <TravelIcon />
      </GreyluneMenuButton>
    ))}
  </>
)

/** A little more than a button is wide, so that 3 of them stand clear of one another on the card. */
const resolveButtonStep = 2.4

/**
 * While the row is being read every card of it wears its own button, and a label is far wider than
 * the 0.6 between 2 cards: left on the middle line they would lie over one another, and the row would
 * read as one heap of parchment rather than as one offer per card. So they take turns, one card up
 * and the next down — half a step either way, which leaves 2 neighbours as clear of each other as 2
 * buttons on the same card.
 *
 * Once a card is being paid for it is the only one wearing anything, and it wears it on its middle
 * line: there is no neighbour left to avoid, and the sides of the card are read against its own
 * middle.
 */
const rowStagger = (moves: CustomMove[], x: number): number => (isChooseEncounter(moves[0]) ? ((x % 2 ? 1 : -1) * resolveButtonStep) / 2 : 0)

/**
 * What a button says. Taking the card needs no more than the word — it is the card the player is
 * looking at, and there is one button on it.
 *
 * Paying for it has to say what the player is about to take and be given, and says it the way every
 * other button of the game does (see {@link EffectLabel}): what it costs them, an arrow, and what it
 * hands over. That is the whole of the choice, and it is the only reading that tells the 2 buttons of
 * a Vallée apart — the sides are not left and right, they are "2 <travel/>" and "<spend-villager/> →
 * 2 <travel/> 3 <vp/>", the second being the first with a Villager paid for 3 more points.
 *
 * A side that hands over nothing that can be drawn is the one case with nothing to say, and the word
 * stands in for it there.
 */
const ResolveLabel = ({ front, move }: { front: EncounterCard; move: CustomMove }) => {
  const { t } = useTranslation()
  if (isChooseEncounter(move)) return <>{t('action.resolve')}</>
  return <EffectLabel {...outcomeEffect(front, resolveOutcomeData(move))} fallback={t('action.resolve')} />
}
