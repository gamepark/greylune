import { GainType, RequirementType } from '@gamepark/greylune/material/Effect'
import { ReactionEffect, ReactionType } from '@gamepark/greylune/material/Reaction'
import { VillageCard, villageCardData } from '@gamepark/greylune/material/VillageCard'
import { CustomMove } from '@gamepark/rules-api'
import { DiscardedPotionIcon, ForceUpIcon, MagicUpIcon, TiltIcon } from '../components/Icons'
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
 * prints right under it what it gives. Neris prints her two options on either side of a slash and
 * wears a button over each half; Lucan prints one gem for both of his (see `isSkillChoice`).
 *
 * It carries the gesture the card prints in front of its own answer, and that is where a Potion parts
 * company with a Companion: a Companion is laid on its side and stands up again in Autumn, a Potion
 * is emptied and never comes back. The symbol is the one printed on the card, so the button says
 * which of the two is about to happen before it happens.
 */
export const ReactionCardMenu = ({ front, moves }: { front: VillageCard; moves: CustomMove[] }) => {
  const { options } = villageCardData[front].reaction!
  const choice = isSkillChoice(front, moves)
  return (
    <>
      {moves.map((move, index) => {
        const { option } = reactionData(move)
        const spot = choice ? reactionActionSpot(index, moves.length) : reactionActionSpot(option, options.length)
        return (
          <GreyluneMenuButton key={option} {...spot} move={move}>
            {choice ? <SkillIcon effect={options[option]} /> : <ReactionIcon front={front} />}
          </GreyluneMenuButton>
        )
      })}
    </>
  )
}

/**
 * Lucan prints a single gem, half Force and half Magic, for the skill he gives in return for the
 * other. With one skill gained, there is one button over it, like any card's. With both gained at
 * once, the player picks which to answer, so each button shows the gem it gives.
 */
const isSkillChoice = (front: VillageCard, moves: CustomMove[]) => front === VillageCard.Lucan && moves.length > 1

const SkillIcon = ({ effect }: { effect: ReactionEffect }) =>
  effect.type === ReactionType.OtherSkill && effect.skill === GainType.Force ? <ForceUpIcon /> : <MagicUpIcon />

/** Laid on its side, or emptied: what the card asks for, which is what the card prints. */
const ReactionIcon = ({ front }: { front: VillageCard }) =>
  villageCardData[front].reaction!.requirements.some((requirement) => requirement.type === RequirementType.DiscardCard) ? <DiscardedPotionIcon /> : <TiltIcon />
