import { SpecialAction } from '@gamepark/greylune/rules/SpecialActionRule'
import { CustomMove } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MagicUpIcon, StoryIcon, TravelIcon, VillagerIcon } from '../components/Icons'
import { specialActionBoardOffset } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { moveOfSelectedVillager, useSelectedVillager } from './SelectVillager'
import { VillagerMove } from './SpecialActionMoves'

/**
 * The special action of a player's own board: one Villager a year, spent on one of the 3 things
 * printed under the doorway it stands in (rulebook p.9).
 *
 * Two decisions, and the table only ever shows the one that is due — the same two the Event scroll
 * asks for. First "Action spéciale", a single button whatever the player means to take it for: it
 * walks a Villager into the doorway, the one aimed at or else any of theirs. Then the option, which
 * is not asked here (see {@link SpecialActionOption}).
 */

/** The offer to take the action, before anything is said about what for. */
export const SpecialActionMenu = ({ moves }: { moves: VillagerMove[] }) => {
  const { t } = useTranslation()
  const selected = useSelectedVillager()
  return (
    <GreyluneMenuButton
      x={specialActionBoardOffset.x}
      y={specialActionBoardOffset.y}
      move={moveOfSelectedVillager(moves, selected)}
      label={t('action.special-action')}
      labelPosition="right"
    >
      <VillagerIcon />
    </GreyluneMenuButton>
  )
}

/**
 * What each option comes to, drawn as the board draws it, and what it is called. The word is a verb
 * and no more where the symbol says the rest — the book is a story, the rider is the road — and the
 * gem alone would not say how far up the track it goes.
 */
const optionIcons: Record<SpecialAction, ReactNode> = {
  [SpecialAction.Story]: <StoryIcon />,
  [SpecialAction.Travel]: <TravelIcon count={1} />,
  [SpecialAction.Magic]: <MagicUpIcon />
}

const optionLabels: Record<SpecialAction, string> = {
  [SpecialAction.Story]: 'action.tell',
  [SpecialAction.Travel]: 'action.travel',
  [SpecialAction.Magic]: 'action.gain-magic'
}

/**
 * One of the 3 options, offered where taking it would show.
 *
 * The board prints them in a line under the doorway, closer together than 3 buttons could stand, and
 * printing them is all it can do — it cannot show what any of them would come to. The table can: a
 * story is told out of the Encounters pushed under the personal board, the road is walked by the
 * Adventurer, the gem climbs the Magic track. So each button is hung on the piece its own answer
 * moves, which sets the 3 of them well apart and puts each offer on the very thing a player looks at
 * to weigh it — how many stories they are sitting on, where their Adventurer stopped, how far up the
 * track they already are.
 *
 * An option that would hand over nothing is not offered at all, so its button is simply not there
 * (see `SpecialActionRule`).
 */
export const SpecialActionOption = ({
  moves,
  option,
  x,
  y,
  labelPosition
}: {
  moves: CustomMove[]
  option: SpecialAction
  x: number
  y: number
  labelPosition?: 'left' | 'right'
}) => {
  const { t } = useTranslation()
  const move = moves.find((move) => move.data === option)
  if (!move) return null
  return (
    <GreyluneMenuButton x={x} y={y} move={move} label={t(optionLabels[option])} labelPosition={labelPosition}>
      {optionIcons[option]}
    </GreyluneMenuButton>
  )
}
