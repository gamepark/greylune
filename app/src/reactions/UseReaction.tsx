import { RequirementType } from '@gamepark/greylune/material/Effect'
import { VillageCard, villageCardData } from '@gamepark/greylune/material/VillageCard'
import { CustomMove } from '@gamepark/rules-api'
import { DiscardedPotionIcon, TiltIcon } from '../components/Icons'
import { reactionActionSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { reactionData } from './ReactionActions'

/**
 * The button a card wears while it may answer (see {@link reactionMoves}), which is the button an
 * Object wears while it may be tilted (see `ItemCardMenu`), in the same place on the same card: a
 * Companion and an Object are the two columns beside the player's board, and offering to answer is
 * offering to spend the card, so the two read as one thing.
 *
 * So it stands over the effect it offers (see `reactionActionSpot`) and needs no label: the card
 * prints right under it what it gives, and Neris, the one card offering a choice, prints hers on
 * either side of a slash and wears a button over each half.
 *
 * It carries the gesture the card prints in front of its own answer, and that is where a Potion parts
 * company with a Companion: a Companion is laid on its side and stands up again in Autumn, a Potion
 * is emptied and never comes back. The symbol is the one printed on the card, so the button says
 * which of the two is about to happen before it happens.
 */
export const ReactionCardMenu = ({ front, moves }: { front: VillageCard; moves: CustomMove[] }) => (
  <>
    {moves.map((move) => {
      const { option } = reactionData(move)
      return (
        <GreyluneMenuButton key={option} {...reactionActionSpot(option, villageCardData[front].reaction!.options.length)} move={move}>
          <ReactionIcon front={front} />
        </GreyluneMenuButton>
      )
    })}
  </>
)

/** Laid on its side, or emptied: what the card asks for, which is what the card prints. */
const ReactionIcon = ({ front }: { front: VillageCard }) =>
  villageCardData[front].reaction!.requirements.some((requirement) => requirement.type === RequirementType.DiscardCard) ? <DiscardedPotionIcon /> : <TiltIcon />
