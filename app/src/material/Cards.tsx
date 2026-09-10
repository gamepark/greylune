/** @jsxImportSource @emotion/react */
import { EncounterCardId } from '@gamepark/greylune/material/EncounterCard'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { encounterMoves, endStoryMove, isLastToldStory, tellStoryMove } from '../encounters/EncounterActions'
import { EncounterCardMenu } from '../encounters/ResolveEncounter'
import { EndStoryButton, TellStoryButton } from '../encounters/TellStory'
import { encounterCardBacks, encounterCardImagesEn, encounterCardImagesFr } from '../images/EncounterCardImages'
import { villageCardBacks, villageCardImagesEn, villageCardImagesFr } from '../images/VillageCardImages'
import { itemActionMoves } from '../items/ItemActions'
import { ItemCardMenu } from '../items/UseItem'
import { encounterCardSize, villageCardBorderRadius, villageCardSize } from '../locators/TableLayout'
import { reactionMoves } from '../reactions/ReactionActions'
import { ReactionCardMenu } from '../reactions/UseReaction'
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
   *
   * A card of the player's own carries one thing, and only while a window is open on it: the offer to
   * answer with it (see {@link ReactionCardMenu}). A card in the Village is never in that position —
   * a reaction is answered with what one already owns — so the two never meet.
   *
   * An Object of the player's own carries what tilting it would give (see {@link ItemCardMenu}), for
   * as long as it can be tilted: an Object is used out of the player's own turn order, waiting on
   * nothing, so what it offers is worn the whole time it is on offer. That, too, never meets a
   * reaction: an Object is used in Summer, and Summer opens no window on the player using it.
   */
  getItemMenu(
    item: MaterialItem<PlayerColor, LocationType, VillageCardId>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    const reactions = reactionMoves(legalMoves, context.index)
    if (reactions.length && item.id?.front !== undefined) return <ReactionCardMenu front={item.id.front} moves={reactions} />
    if (item.location.type === LocationType.Items) {
      const uses = itemActionMoves(legalMoves, context.index)
      return uses.length && item.id?.front !== undefined ? <ItemCardMenu front={item.id.front} moves={uses} /> : undefined
    }
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
   * An Encounter of the row the Adventurer has stopped in wears the decision it is waiting for (see
   * {@link EncounterCardMenu}): the offer to take it while the row is being read, then the ways of
   * paying for it once it is the card being resolved. The moves are the reader's own, so a card only
   * ever offers anything to the player it is waiting for, and only while it is being waited for.
   *
   * A Story still to tell wears the one thing that can be done with it, and only for as long as it
   * can (see {@link TellStoryButton}): a fan of quarters is not a row of cards, and the card that
   * would be dragged is a strip 2 high with 3 more of them under it.
   *
   * The other half of the same decision is worn by the last Story told (see {@link EndStoryButton}),
   * the head of the pile the Encounters are being slid onto. A story nobody has begun leaves nothing
   * to hang it on, and the header carries it there — which is the one place a player who has told
   * nothing would look for it.
   */
  getItemMenu(
    item: MaterialItem<PlayerColor, LocationType, EncounterCardId>,
    context: ItemContext<PlayerColor, MaterialType, LocationType>,
    legalMoves: MaterialMove<PlayerColor, MaterialType, LocationType>[]
  ) {
    if (item.location.type === LocationType.UntoldStories) {
      const move = tellStoryMove(legalMoves, context.index)
      return move && <TellStoryButton move={move} />
    }
    if (item.location.type === LocationType.ToldStories) {
      if (context.rules.game.rule?.player !== item.location.player || !isLastToldStory(item, context.rules)) return undefined
      const end = endStoryMove(legalMoves, context.rules)
      return end && <EndStoryButton move={end} />
    }
    if (item.location.type !== LocationType.EncounterRow || item.id?.front === undefined) return undefined
    const moves = encounterMoves(legalMoves, context.index)
    return moves.length ? <EncounterCardMenu front={item.id.front} moves={moves} x={item.location.x ?? 0} /> : undefined
  }
}

export class EncounterCardDescriptionFr extends EncounterCardDescription {
  images = encounterCardImagesFr
}
