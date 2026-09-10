/** @jsxImportSource @emotion/react */
import { CustomMove, MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { StoryIcon } from '../components/Icons'
import { endStoryButtonSpot, storyButtonSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

/**
 * What an Encounter still to tell wears while a Tavern is open, and only while the Tavern would
 * hear it (see `TellStoryRule`): the offer to slide it over to the told Stories.
 *
 * It carries the book the personal board prints beside its Tavern action and no words at all. The
 * cards a story may be made of are read off the fan itself — a player choosing which to tell is
 * weighing the numbers printed on them against one another, not reading a button — and the button
 * that is on a card is by then the whole of the question: this one, or not this one.
 */
export const TellStoryButton = ({ move }: { move: MaterialMove }) => (
  <GreyluneMenuButton x={storyButtonSpot.x} y={storyButtonSpot.y} move={move}>
    <StoryIcon />
  </GreyluneMenuButton>
)

/**
 * What the last Story told wears while the Tavern is open: the offer to stop telling, which is what
 * the Tavern pays on (see `endStoryMove`).
 *
 * The two halves of the decision are then read where they happen — which Encounter to add, on the
 * cards still to tell, and enough, on the pile they are being added to. It rides the head of that
 * pile, so it climbs with it and the Story just slid in is the one carrying it.
 *
 * Same book as the buttons that tell one, this being the same action seen through: the offer on an
 * untold card is that card, and needs no word, where the offer on the pile is the action itself and
 * has to say so.
 */
export const EndStoryButton = ({ move }: { move: CustomMove }) => {
  const { t } = useTranslation()
  return (
    <GreyluneMenuButton x={endStoryButtonSpot.x} y={endStoryButtonSpot.y} move={move} label={t('action.end-story')}>
      <StoryIcon />
    </GreyluneMenuButton>
  )
}
