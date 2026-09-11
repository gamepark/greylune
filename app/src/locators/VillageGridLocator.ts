import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Slot } from '@gamepark/greylune/material/Village'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { DropAreaDescription, ItemContext, Locator } from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { VillageCardActionArea } from '../village/CardAction'
import { isActivateCard, isCardOnSlot, villagerActionData } from '../villagers/VillagerActions'
import { cardHoverTransform } from './CardHover'
import { villageCardBorderRadius, villageCardSize, villageGridSpot } from './TableLayout'

const slotOf = (location: Location<PlayerColor, LocationType>): Slot => ({ x: location.x ?? 0, y: location.y ?? 0 })

/**
 * A slot of the grid offered to a Villager standing beside it: the drop area covers the card exactly,
 * corners rounded like it, because the card is what the player aims at.
 *
 * A slot is only ever offered by an activation, and an activation names a Villager and a card at
 * once, so the pair has to be read back out of the move: the area takes the drop only if the card
 * standing on it is the card the move was written with, and only from the Villager it was written
 * for (see {@link VillagerActions}).
 */
class VillageCardActionDescription extends DropAreaDescription<PlayerColor, MaterialType, LocationType> {
  Component = VillageCardActionArea
  width = villageCardSize.width
  height = villageCardSize.height
  borderRadius = villageCardBorderRadius

  canDrop(
    move: MaterialMove<PlayerColor, MaterialType, LocationType>,
    location: Location<PlayerColor, LocationType>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>
  ): boolean {
    if (!isActivateCard(move) || context.type !== MaterialType.Villager) return false
    const { villager, card } = villagerActionData(move)
    return villager === context.index && isCardOnSlot(context.rules, card!, slotOf(location))
  }
}

/**
 * The 3x3 grid of Village cards. They never move once they are dealt, so it is a plain set of
 * coordinates; what the locator adds is what a slot becomes while a Villager is carried over the
 * table. The areas are never listed here: the framework opens exactly the ones the dragged pawn's
 * own moves name, and a player who points rather than carries is answered by the card itself (see
 * `VillageCardMenu`).
 */
export class VillageGridLocator extends Locator<PlayerColor, MaterialType, LocationType> {
  locationDescription = new VillageCardActionDescription()

  getCoordinates(location: Location<PlayerColor, LocationType>): Partial<Coordinates> {
    return villageGridSpot(location.x ?? 0, location.y ?? 0)
  }

  getHoverTransform(item: MaterialItem<PlayerColor, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>): string[] {
    return cardHoverTransform(item, context)
  }
}
