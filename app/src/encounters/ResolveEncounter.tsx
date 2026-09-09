import { EncounterCard, encounterCardData } from '@gamepark/greylune/material/EncounterCard'
import { CustomMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { GainsLabel } from '../components/Gains'
import { TravelIcon } from '../components/Icons'
import { RequirementsLabel } from '../components/Requirements'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { isChooseEncounter, resolveOutcomeData } from './EncounterActions'

/**
 * What an Encounter of the row the Adventurer stopped in wears (see {@link encounterMoves}): one
 * button to take the card while the row is being read, and — once it is the card being resolved —
 * one per way of paying for it, stacked down the card so that the sides stand apart. The rider is on
 * them because an Encounter is what the road hands out: it is answered where the Adventurer stopped,
 * and it is the end of the journey.
 */
export const EncounterCardMenu = ({ front, moves }: { front: EncounterCard; moves: CustomMove[] }) => (
  <>
    {moves.map((move, index) => (
      <GreyluneMenuButton
        key={index}
        x={0}
        y={(index - (moves.length - 1) / 2) * resolveButtonStep}
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
 * What a button says. Taking the card needs no more than the word — it is the card the player is
 * looking at. Paying for it has to say which side is being taken, and says it the way the card
 * prints it: the condition satisfied, or the reward when the side asks for nothing at all.
 */
const ResolveLabel = ({ front, move }: { front: EncounterCard; move: CustomMove }) => {
  const { t } = useTranslation()
  if (isChooseEncounter(move)) return <>{t('action.resolve')}</>
  const outcomes = resolveOutcomeData(move).outcomes
  if (outcomes.length > 1) return <>{t('action.resolve-both')}</>
  const outcome = encounterCardData[front].outcomes[outcomes[0]]
  return (
    <>
      {t('action.resolve')} (
      <RequirementsLabel requirements={outcome.requirements} fallback={outcome.gains?.length ? <GainsLabel gains={outcome.gains} /> : outcomes[0] + 1} />)
    </>
  )
}
