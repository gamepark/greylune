/** @jsxImportSource @emotion/react */
import { EncounterCardId } from '@gamepark/greylune/material/EncounterCard'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { resolveMoves } from '../encounters/EncounterActions'
import { EncounterCardMenu } from '../encounters/ResolveEncounter'
import { encounterCardBacks, encounterCardImagesEn, encounterCardImagesFr } from '../images/EncounterCardImages'
import { villageCardBacks, villageCardImagesEn, villageCardImagesFr } from '../images/VillageCardImages'
import { encounterCardSize, villageCardBorderRadius, villageCardSize } from '../locators/TableLayout'
import { VillageCardMenu } from '../village/CardAction'
import { selectedVillager } from '../villagers/SelectVillager'
import { isActivateCard, villagerActionData } from '../villagers/VillagerActions'
import { EncounterCardHelp } from './help/EncounterCardHelp'
import { VillageCardHelp } from './help/VillageCardHelp'

/**
 * Card ids carry both faces: `front` is the card itself, `back` its period. A card in a deck loses
 * its front (see the hiding strategies) and keeps its period, which is exactly what the 3 different
 * deck covers show. The framework then flips it on its own, since a card without a front is a card
 * nobody can see.
 */

export class VillageCardDescription extends CardDescription<PlayerColor, MaterialType, LocationType, VillageCardId> {
  width = villageCardSize.width
  height = villageCardSize.height
  borderRadius = villageCardBorderRadius
  images = villageCardImagesEn
  backImages = villageCardBacks
  help = VillageCardHelp

  /** A card of the Village asks to be pressed, not picked up: its offer is there as soon as it is due. */
  isMenuAlwaysVisible(): boolean {
    return true
  }

  /**
   * A card standing in the Village carries what the Villager the player has aimed at may do with it
   * (see {@link VillageCardMenu}); a card already bought, or still in the deck, carries nothing. The
   * Villager is named inside the move rather than moved by it, so the pair is read out of it.
   */
  getItemMenu(
    item: MaterialItem<PlayerColor, LocationType, VillageCardId>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    if (item.location.type !== LocationType.VillageGrid) return undefined
    const villager = selectedVillager(context.rules)
    if (villager === undefined) return undefined
    const move = legalMoves.find(
      (move) => isActivateCard(move) && villagerActionData(move).villager === villager && villagerActionData(move).card === context.index
    )
    return move && <VillageCardMenu card={context.index} move={move} />
  }
}

export class VillageCardDescriptionFr extends VillageCardDescription {
  images = villageCardImagesFr
}

export class EncounterCardDescription extends CardDescription<PlayerColor, MaterialType, LocationType, EncounterCardId> {
  width = encounterCardSize.width
  height = encounterCardSize.height
  borderRadius = 0.3
  images = encounterCardImagesEn
  backImages = encounterCardBacks
  help = EncounterCardHelp

  /** Like a card of the Village: what it offers is there to be read, not to be uncovered. */
  isMenuAlwaysVisible(): boolean {
    return true
  }

  /**
   * An Encounter of the row the Adventurer has stopped in wears the ways it may be resolved (see
   * {@link EncounterCardMenu}). The moves are the reader's own, so a card only ever offers anything
   * to the player it is waiting for, and only while it is being waited for.
   */
  getItemMenu(
    item: MaterialItem<PlayerColor, LocationType, EncounterCardId>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    if (item.location.type !== LocationType.EncounterRow || item.id?.front === undefined) return undefined
    const moves = resolveMoves(legalMoves, context.index)
    return moves.length ? <EncounterCardMenu front={item.id.front} moves={moves} /> : undefined
  }
}

export class EncounterCardDescriptionFr extends EncounterCardDescription {
  images = encounterCardImagesFr
}
