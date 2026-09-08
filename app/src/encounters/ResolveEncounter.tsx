import { EncounterCard, encounterCardData } from '@gamepark/greylune/material/EncounterCard'
import { CustomMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { GainsLabel } from '../components/Gains'
import { TravelIcon } from '../components/Icons'
import { RequirementsLabel } from '../components/Requirements'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { resolveOutcomeData } from './EncounterActions'

/**
 * What an Encounter of the row the Adventurer stopped in wears: one button per way it may be
 * resolved (see {@link resolveMoves}), stacked down the card so that the ones a two-sided card
 * offers stand apart. The rider is on them because an Encounter is what the road hands out: it is
 * answered where the Adventurer stopped, and it is the end of the journey.
 */
export const EncounterCardMenu = ({ front, moves }: { front: EncounterCard; moves: CustomMove[] }) => (
  <>
    {moves.map((move, index) => (
      <GreyluneMenuButton
        key={index}
        x={0}
        y={(index - (moves.length - 1) / 2) * resolveButtonStep}
        move={move}
        label={<ResolveLabel front={front} outcomes={resolveOutcomeData(move).outcomes} alone={moves.length === 1} />}
      >
        <TravelIcon />
      </GreyluneMenuButton>
    ))}
  </>
)

/** A little more than a button is wide, so that 3 of them stand clear of one another on the card. */
const resolveButtonStep = 2.4

/**
 * What a button says. A card with one way to be resolved needs no more than the word — it is the
 * card the player is looking at. A card with two sides has to say which one is being taken, and says
 * it the way the card prints it: the condition satisfied, or the reward when the side asks for
 * nothing at all.
 */
const ResolveLabel = ({ front, outcomes, alone }: { front: EncounterCard; outcomes: number[]; alone: boolean }) => {
  const { t } = useTranslation()
  if (alone) return <>{t('action.resolve')}</>
  if (outcomes.length > 1) return <>{t('action.resolve-both')}</>
  const outcome = encounterCardData[front].outcomes[outcomes[0]]
  return (
    <>
      {t('action.resolve')} (
      <RequirementsLabel requirements={outcome.requirements} fallback={outcome.gains?.length ? <GainsLabel gains={outcome.gains} /> : outcomes[0] + 1} />)
    </>
  )
}
