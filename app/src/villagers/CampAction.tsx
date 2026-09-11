/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { LocationDescription, useLegalMoves, useRules } from '@gamepark/react-game'
import { CustomMove, Location } from '@gamepark/rules-api'
import { HTMLAttributes, Ref } from 'react'
import { Trans } from 'react-i18next'
import { ActionArea } from '../components/ActionArea'
import { VillagerIcon } from '../components/Icons'
import { campBoardOffset } from '../locators/TableLayout'
import { helpIcons } from '../material/help/HelpLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { useActingVillager } from './SelectVillager'
import { bestCoinsMove, coinsAround, isGainCoinsAround, villagerActionData } from './VillagerActions'

/**
 * Taking a Villager back from the Village to the tents, where the card it was standing beside pays a
 * coin for every other Villager still crowding round it (rulebook p.7).
 *
 * A Villager lies between 2 cards and may be taken back with either of them. Both are the same
 * action and both end in the same place, so one offer is made for the two and it is the fuller purse
 * that is offered: nobody chooses the smaller of two heaps of gold, and asking which would be asking
 * a question with a known answer. A Villager whose 2 neighbours have both been taken comes back for
 * nothing, and the offer then says only where it is going.
 */

/** "Gagner 2 <coin/>", or where the Villager is going when there is nothing to pick up on the way. */
const CampActionLabel = ({ coins }: { coins: number }) =>
  coins ? <Trans i18nKey="action.camp-coins" values={{ coins }} components={helpIcons} /> : <Trans i18nKey="action.camp" />

/**
 * The button that sends the aimed-at Villager home, drawn on the Season board.
 *
 * The camp is a corner of that board and carries no piece of its own, so the button is hung on the
 * board and walks back out to the tents (see {@link campBoardOffset}). It stands in the middle of
 * them rather than off to the side the way it does on a card: the tents are the whole of the corner,
 * and there is nowhere to step aside to. Its label is written towards the board, the table having
 * nothing to spare on the other side.
 */
export const CampMenu = ({ move }: { move: CustomMove }) => {
  const rules = useRules<GreyluneRules>()!
  return (
    <GreyluneMenuButton
      x={campBoardOffset.x}
      y={campBoardOffset.y}
      move={move}
      label={<CampActionLabel coins={coinsAround(rules, villagerActionData(move).card)} />}
      labelPosition="right"
    >
      <VillagerIcon />
    </GreyluneMenuButton>
  )
}

type AreaProps = {
  location: Location<PlayerColor, LocationType>
  description: LocationDescription<PlayerColor, MaterialType, LocationType>
  ref?: Ref<HTMLDivElement>
} & HTMLAttributes<HTMLDivElement>

/** The tents as a place to let a Villager go. */
export const CampArea = ({ location, description, ref, ...props }: AreaProps) => {
  const rules = useRules<GreyluneRules>()!
  const villager = useActingVillager()
  const moves = useLegalMoves<CustomMove>((move) => isGainCoinsAround(move) && villagerActionData(move).villager === villager)
  const move = bestCoinsMove(moves, rules)
  return (
    <ActionArea
      location={location}
      description={description}
      move={move}
      label={<CampActionLabel coins={move ? coinsAround(rules, villagerActionData(move).card) : 0} />}
      ref={ref}
      {...props}
    />
  )
}
