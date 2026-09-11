import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialSource } from '@gamepark/greylune/material/MaterialSource'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Slot, villagersAroundSlot } from '@gamepark/greylune/material/Village'
import { getVillageCardType, VillageCard, VillageCardId, VillageCardType, villageCardData } from '@gamepark/greylune/material/VillageCard'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { VillagerActionData } from '@gamepark/greylune/rules/SummerRule'
import { CustomMove, isCustomMoveType, Location } from '@gamepark/rules-api'

/**
 * The two things a Villager standing in the Village is spent on in Summer (see `SummerRule`): the
 * card beside it is activated, or the Villager simply goes back to the camp and sells the company it
 * was keeping. Both name a Villager and a card at once, which is why the rules take them as custom
 * moves, and it is also why the display cannot let the Villager be dragged the way a pawn usually is:
 * where it lands has to be read back into the pair the move was written with.
 *
 * Everything the buttons and the drop areas need to say — which card, what it costs, what the camp
 * pays — is read here, off the same material the rules read it off (see `MaterialSource`), so that a
 * price shown on a card is the price the rules will ask for.
 */

/** Activating the card a Villager designates: exploiting a Building, buying an Object, recruiting a Companion. */
export const isActivateCard = isCustomMoveType(CustomMoveType.ActivateCard)

/** Taking the Villager back to the camp, with 1 coin for every other Villager around the card it designates. */
export const isGainCoinsAround = isCustomMoveType(CustomMoveType.GainCoinsAround)

export const villagerActionData = (move: CustomMove): VillagerActionData => move.data as VillagerActionData

/** The slot of the 3x3 grid a card stands on. */
export const slotOfCard = (rules: MaterialSource, card: number): Slot => {
  const { x = 0, y = 0 } = rules.material(MaterialType.VillageCard).getItem(card).location
  return { x, y }
}

export const isCardOnSlot = (rules: MaterialSource, card: number, slot: Slot): boolean => {
  const { x, y } = slotOfCard(rules, card)
  return x === slot.x && y === slot.y
}

export const cardFront = (rules: MaterialSource, card: number): VillageCard =>
  rules.material(MaterialType.VillageCard).getItem<VillageCardId>(card).id.front!

/**
 * 1 coin for every *other* Villager standing around the card, whoever they belong to (rulebook p.7):
 * what the card pays when a Villager is taken back, and what it charges on top when it is activated.
 */
export const coinsAround = (rules: MaterialSource, card?: number): number =>
  card === undefined ? 0 : Math.max(0, villagersAroundSlot(rules, slotOfCard(rules, card)).length - 1)

/**
 * What the card asks for before any Companion is called on: what is printed on it, plus the crowd.
 * The answers that lower it are given inside `ActivateCardRule`, once the card has been chosen, so
 * the button shows the price of the card rather than the best price the player might talk it down to.
 */
export const cardPrice = (rules: MaterialSource, card: number): number => villageCardData[cardFront(rules, card)].cost + coinsAround(rules, card)

/** What activating the card is called: a Building is exploited, an Object bought, a Companion recruited. */
const actionNames: Record<VillageCardType, string> = {
  [VillageCardType.Building]: 'exploit',
  [VillageCardType.Item]: 'buy',
  [VillageCardType.Companion]: 'recruit'
}

export const cardActionName = (rules: MaterialSource, card: number): string => actionNames[getVillageCardType(cardFront(rules, card))]

/**
 * The card a Villager is worth the most coins beside. A Villager lies between 2 cards and may be
 * taken back with either of them, and one button is offered for both: nobody takes the smaller of
 * two piles of gold, so the display picks the larger one rather than asking which.
 */
export const bestCoinsMove = (moves: CustomMove[], rules: MaterialSource): CustomMove | undefined =>
  moves.reduce<CustomMove | undefined>(
    (best, move) =>
      best === undefined || coinsAround(rules, villagerActionData(move).card) > coinsAround(rules, villagerActionData(best).card) ? move : best,
    undefined
  )

/** The camp, everybody's: where a Villager taken back is going, and what it is dropped on. */
export const camp: Location<PlayerColor, LocationType> = { type: LocationType.Camp }
