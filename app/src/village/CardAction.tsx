/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { cardOnSlot } from '@gamepark/greylune/material/Village'
import { VillageCard, villageCardData } from '@gamepark/greylune/material/VillageCard'
import { Memory } from '@gamepark/greylune/Memory'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ChooseAbilityData } from '@gamepark/greylune/rules/ActivateCardRule'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { LocationDescription, useLegalMoves, useRules } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType, Location, MaterialMove } from '@gamepark/rules-api'
import { HTMLAttributes, Ref } from 'react'
import { Trans } from 'react-i18next'
import { ActionArea } from '../components/ActionArea'
import { EffectLabel } from '../components/Effect'
import { VillagerIcon } from '../components/Icons'
import { actionButtonSpot } from '../locators/TableLayout'
import { helpIcons } from '../material/help/HelpLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { cardActionName, cardPrice, isActivateCard, villagerActionData } from '../villagers/VillagerActions'

/**
 * Spending a Villager on the card it stands beside — exploiting a Building, buying an Object,
 * recruiting a Companion — offered the two ways the decision is made.
 *
 * Aimed at, the card carries a button of its own, the same one the Event scroll carries: the two
 * halves of the decision are made in either order, and this is the half where the Villager is named
 * first (see `SelectVillager`). Dragged at, the card is the drop area the pawn is let go over.
 *
 * Both say the same thing, because both read it here: what the card is for, and what it asks for,
 * which is what is printed on it plus a coin for every other Villager crowding round it (rulebook
 * p.8). Neither depends on which of the Villagers beside the card is spent.
 */

/** "Acheter (4 <coin/>)", or simply "Exploiter" when the card is free and stands alone. */
const CardActionLabel = ({ card }: { card: number }) => {
  const rules = useRules<GreyluneRules>()!
  const price = cardPrice(rules, card)
  const action = cardActionName(rules, card)
  return <Trans i18nKey={price ? `action.${action}-price` : `action.${action}`} values={{ price }} components={helpIcons} />
}

/** The button the card wears while the Villager that can pay for it is aimed at. */
export const VillageCardMenu = ({ card, move }: { card: number; move: MaterialMove<PlayerColor, MaterialType, LocationType> }) => (
  <GreyluneMenuButton x={actionButtonSpot.x} y={actionButtonSpot.y} move={move} label={<CardActionLabel card={card} />}>
    <VillagerIcon />
  </GreyluneMenuButton>
)

type AreaProps = {
  location: Location<PlayerColor, LocationType>
  description: LocationDescription<PlayerColor, MaterialType, LocationType>
  ref?: Ref<HTMLDivElement>
} & HTMLAttributes<HTMLDivElement>

/**
 * The card as a place to let a Villager go: the area covers the slot of the grid it stands on, and
 * the move it takes is the one written for the Villager being dragged.
 */
export const VillageCardActionArea = ({ location, description, ref, ...props }: AreaProps) => {
  const rules = useRules<GreyluneRules>()!
  const card: number | undefined = cardOnSlot(rules, { x: location.x ?? 0, y: location.y ?? 0 }).getIndexes()[0]
  const moves = useLegalMoves<CustomMove>((move) => isActivateCard(move) && villagerActionData(move).card === card)
  // The slot is only ever opened by a move naming the card standing on it, so there always is one.
  if (card === undefined) return null
  return <ActionArea location={location} description={description} move={moves[0]} label={<CardActionLabel card={card} />} ref={ref} {...props} />
}

/**
 * The options of the Building a Villager has just been spent on, once there is more than one to
 * choose from (see `ActivateCardRule`): the Salle des héros takes 1 Force, 1 Magic, or both. Each is
 * a button of its own, stacked down the card the way the sides of an Encounter are, and says what it
 * takes and what it gives the way every button offering an effect does (see {@link EffectLabel}).
 *
 * A Building paid with a Seal is chosen by picking the Seal, and the Seals wear that button; a card
 * that is bought or recruited offers no option at all. Neither ever gets here.
 */
export const CardAbilityMenu = ({ front, moves }: { front: VillageCard; moves: CustomMove[] }) => (
  <>
    {moves.map((move, index) => (
      <GreyluneMenuButton
        key={index}
        x={0}
        y={(index - (moves.length - 1) / 2) * abilityButtonStep}
        move={move}
        label={<EffectLabel {...villageCardData[front].abilities![(move.data as ChooseAbilityData).ability!]} />}
      >
        <VillagerIcon />
      </GreyluneMenuButton>
    ))}
  </>
)

/** A little more than a button is tall, so that the options of one card stand clear of one another. */
const abilityButtonStep = 2.4

/** The options this card is offering, if it is the one being activated: one move per option the player can pay for. */
export const cardAbilityMoves = (rules: GreyluneRules, legalMoves: MaterialMove[], card: number): CustomMove[] => {
  if (rules.game.rule?.id !== RuleId.ActivateCard || rules.remind<number>(Memory.ActivatedCard) !== card) return []
  return legalMoves.filter(
    (move): move is CustomMove =>
      isChooseAbility(move) && (move.data as ChooseAbilityData).ability !== undefined && (move.data as ChooseAbilityData).value === undefined
  )
}

const isChooseAbility = isCustomMoveType(CustomMoveType.ChooseAbility)
