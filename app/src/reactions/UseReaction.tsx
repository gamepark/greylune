import { ReactionType } from '@gamepark/greylune/material/Reaction'
import { VillageCard, villageCardData } from '@gamepark/greylune/material/VillageCard'
import { CustomMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { actionButtonSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { reactionData } from './ReactionActions'

/**
 * The button a card wears while it may answer (see {@link reactionMoves}). What it does is printed on
 * the card the button is laid over, so the word is enough — except on the one card offering a choice,
 * where the two options have to be told apart.
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
      />
    ))}
  </>
)

/** A little more than a button is wide, so that two of them stand clear of one another. */
const reactionButtonStep = 2.4

/**
 * Neris alone offers two things at once — 2 more coins out of the Villager, or the crowd around the
 * card not paid for — so hers are the only options that need saying. Every other card offers one
 * thing, and the word over its own printed text says all there is to say.
 */
const ReactionLabel = ({ front, option }: { front: VillageCard; option: number }) => {
  const { t } = useTranslation()
  const effect = villageCardData[front].reaction?.options[option]
  if (effect?.type === ReactionType.ExtraCoins) return <>{t('action.extra-coins', { coins: effect.count })}</>
  if (effect?.type === ReactionType.NoSurcharge) return <>{t('action.no-surcharge')}</>
  return <>{t('action.use')}</>
}
