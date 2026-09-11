import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { RequirementType } from '@gamepark/greylune/material/Effect'
import { ReactionType } from '@gamepark/greylune/material/Reaction'
import { VillageCard, villageCardData } from '@gamepark/greylune/material/VillageCard'
import { Memory } from '@gamepark/greylune/Memory'
import { useRules } from '@gamepark/react-game'
import { CustomMove } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { DiscardedPotionIcon, TiltIcon } from '../components/Icons'
import { actionButtonSpot } from '../locators/TableLayout'
import { helpIcons } from '../material/help/HelpLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { coinsAround } from '../villagers/VillagerActions'
import { reactionData } from './ReactionActions'

/**
 * The button a card wears while it may answer (see {@link reactionMoves}). What it does is printed on
 * the card the button is laid over, so the word is enough — except on the one card offering a choice,
 * where the two options have to be told apart.
 *
 * It carries the gesture the card prints in front of its own answer, and that is where a Potion parts
 * company with a Companion: a Companion is laid on its side and stands up again in Autumn, a Potion
 * is emptied and never comes back. The symbol is the one printed on the card, so the button says
 * which of the two is about to happen before it happens.
 */
export const ReactionCardMenu = ({ front, moves }: { front: VillageCard; moves: CustomMove[] }) => (
  <>
    {moves.map((move, index) => (
      <GreyluneMenuButton
        key={index}
        x={actionButtonSpot.x}
        y={actionButtonSpot.y + (index - (moves.length - 1) / 2) * reactionButtonStep}
        move={move}
        label={<ReactionLabel front={front} option={reactionData(move).option} />}
      >
        <ReactionIcon front={front} />
      </GreyluneMenuButton>
    ))}
  </>
)

/** A little more than a button is wide, so that two of them stand clear of one another. */
const reactionButtonStep = 2.4

/**
 * Neris prints two things — 2 more coins out of a Villager taken back, or the crowd around a card
 * activated left unpaid — and only one of them is ever on offer, so hers say which. Every other card
 * offers one thing, and the word over its own printed text says all there is to say.
 */
const ReactionLabel = ({ front, option }: { front: VillageCard; option: number }) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()!
  const effect = villageCardData[front].reaction?.options[option]
  if (effect?.type === ReactionType.ExtraCoins) return <Trans i18nKey="action.extra-coins" values={{ coins: effect.count }} components={helpIcons} />
  if (effect?.type === ReactionType.NoSurcharge) {
    const coins = coinsAround(rules, rules.remind<number>(Memory.ActivatedCard))
    return <Trans i18nKey="action.no-surcharge" values={{ coins }} components={helpIcons} />
  }
  return <>{t('action.use')}</>
}

/** Laid on its side, or emptied: what the card asks for, which is what the card prints. */
const ReactionIcon = ({ front }: { front: VillageCard }) =>
  villageCardData[front].reaction!.requirements.some((requirement) => requirement.type === RequirementType.DiscardCard) ? <DiscardedPotionIcon /> : <TiltIcon />
