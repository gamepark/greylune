import { isMoveItem, ItemMove, MaterialRulesPart } from '@gamepark/rules-api'
import { VILLAGE_GRID_SIDE } from '../Constants'
import { PlayerColor } from '../PlayerColor'
import { Area } from '../material/Area'
import { EncounterCardId, encounterArea, encounterIncomeToken } from '../material/EncounterCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { PLAYERS_MINUS_ONE, VillageCardId, villageCardData } from '../material/VillageCard'
import { Season } from '../Season'
import { encounterRowSize } from '../Year'
import { GreyluneMove } from './GreyluneRule'
import { RuleId } from './RuleId'

/**
 * The turn of the year (rulebook p.6), and the only rule where nobody chooses anything.
 *
 * What the past year left on the table is put away — the Village cards and the Encounters that were
 * never taken, the Event tile, and the tokens that were lying on them — and the new year is laid
 * out in their place. Then everyone is set back to Spring and the first player token passes to the
 * left.
 *
 * The Seals are the one supply that comes back: a Seal spent is not gone for good, and the rulebook
 * shuffles the discard into a new pile when the stack runs short (p.6). Here the discard is simply
 * drawn from once the stack is empty, which is the same thing without a shuffle the client would
 * have to be told about.
 */
export class WinterRule extends MaterialRulesPart<PlayerColor, MaterialType, LocationType, RuleId> {
  onRuleStart(): GreyluneMove[] {
    return [
      ...this.putAway(),
      ...this.revealEvent(),
      ...this.revealVillage(),
      ...this.revealEncounters(),
      ...this.newRound(),
      this.startPlayerTurn(RuleId.Spring, this.nextFirstPlayer)
    ]
  }

  // ------------------------------------------------------------------ what the past year leaves

  private putAway(): GreyluneMove[] {
    const grid = this.material(MaterialType.VillageCard).location(LocationType.VillageGrid)
    const row = this.material(MaterialType.EncounterCard).location(LocationType.EncounterRow)
    return [
      ...this.material(MaterialType.Seal).location(LocationType.CardSeal).moveItems({ type: LocationType.SealDiscard }),
      ...this.material(MaterialType.IncomeToken).location(LocationType.CardIncome).moveItems({ type: LocationType.IncomeTokenStock }),
      ...grid.moveItems({ type: LocationType.VillageDiscard }),
      ...row.moveItems({ type: LocationType.EncounterDiscard }),
      // The Event of the year is over and goes back in the box: the pile only holds the years to come.
      ...this.eventPile.limit(1).deleteItems()
    ]
  }

  /** The pile, top first: the tile of the year is the one on top, and the only one face up. */
  get eventPile() {
    return this.material(MaterialType.EventTile)
      .location(LocationType.EventPile)
      .sort((item) => -(item.location.x ?? 0))
  }

  private revealEvent(): GreyluneMove[] {
    const next = this.eventPile.getIndexes()[1]
    return next === undefined ? [] : [this.material(MaterialType.EventTile).index(next).rotateItem(true)]
  }

  // ------------------------------------------------------------------ what the new year brings

  /**
   * A card still in its deck shows nobody its face, this rule included: what a card turns out to be
   * is only known once the move that reveals it has been played. So the year is laid out in two
   * beats — the cards are turned over first, and what their faces call for follows in
   * {@link afterItemMove}: the Seals a Village card was drawn with, and the row an Encounter belongs
   * in, which is the Area printed on its banner.
   */
  private revealVillage(): GreyluneMove[] {
    return this.deckTop(MaterialType.VillageCard, LocationType.VillageDeck, VILLAGE_GRID_SIDE * VILLAGE_GRID_SIDE).map((card, slot) =>
      this.material(MaterialType.VillageCard)
        .index(card)
        .moveItem({ type: LocationType.VillageGrid, x: slot % VILLAGE_GRID_SIDE, y: Math.floor(slot / VILLAGE_GRID_SIDE) })
    )
  }

  private revealEncounters(): GreyluneMove[] {
    return this.deckTop(MaterialType.EncounterCard, LocationType.EncounterDeck, encounterRowSize(this.game.players.length)).map((card) =>
      this.material(MaterialType.EncounterCard).index(card).moveItem({ type: LocationType.EncounterRow })
    )
  }

  /** The cards on top of a deck, the top being the highest `x`. */
  private deckTop(type: MaterialType, deck: LocationType, count: number): number[] {
    return this.material(type)
      .location(deck)
      .sort((item) => -(item.location.x ?? 0))
      .limit(count)
      .getIndexes()
  }

  /**
   * What a card turning over asks for. A Village card is laid on the grid once and for all, so its
   * Seals are dealt on arrival; an Encounter is turned over into the row of no Area and slides
   * from there into its own, taking its Income token with it.
   */
  afterItemMove(move: ItemMove<PlayerColor, MaterialType, LocationType>): GreyluneMove[] {
    if (!isMoveItem(move)) return []
    if (move.itemType === MaterialType.VillageCard && move.location.type === LocationType.VillageGrid) {
      return this.placeSeals(move.itemIndex)
    }
    if (move.itemType === MaterialType.EncounterCard && move.location.type === LocationType.EncounterRow && move.location.id === undefined) {
      return this.sortEncounter(move.itemIndex)
    }
    return []
  }

  /**
   * The `-1` symbol asks for one Seal less than there are players, the `?` for exactly one, whatever the table
   * seats (rulebook p.6). They are drawn from the stack, and from what was already spent once the
   * stack has run out — the rulebook makes a new pile of the discard at that point (p.6).
   */
  private placeSeals(card: number): GreyluneMove[] {
    const front = this.material(MaterialType.VillageCard).getItem<VillageCardId>(card).id?.front
    if (front === undefined) return []
    const seals = villageCardData[front].seals
    const count = seals === PLAYERS_MINUS_ONE ? this.game.players.length - 1 : (seals ?? 0)
    return this.sealSupply()
      .slice(0, count)
      .map((seal) => this.material(MaterialType.Seal).index(seal).moveItem({ type: LocationType.CardSeal, parent: card }))
  }

  private sealSupply(): number[] {
    const stack = this.material(MaterialType.Seal)
      .location(LocationType.SealStack)
      .sort((item) => -(item.location.x ?? 0))
      .getIndexes()
    const discard = this.material(MaterialType.Seal)
      .location(LocationType.SealDiscard)
      .sort((item) => item.location.x ?? 0)
      .getIndexes()
    return [...stack, ...discard]
  }

  private sortEncounter(card: number): GreyluneMove[] {
    const front = this.material(MaterialType.EncounterCard).getItem<EncounterCardId>(card).id?.front
    if (front === undefined) return []
    const income = encounterIncomeToken(front)
    return [
      this.material(MaterialType.EncounterCard)
        .index(card)
        .moveItem({ type: LocationType.EncounterRow, id: encounterArea[front] as Area }),
      ...(income === undefined
        ? []
        : this.material(MaterialType.IncomeToken).location(LocationType.IncomeTokenStock).id(income).moveItems({ type: LocationType.CardIncome, parent: card }))
    ]
  }

  // ------------------------------------------------------------------ everybody back to Spring

  private newRound(): GreyluneMove[] {
    return [
      ...this.material(MaterialType.SeasonMarker).moveItems({ type: LocationType.SeasonTrack, x: Season.Spring }),
      ...this.material(MaterialType.FirstPlayerToken).moveItems({
        type: LocationType.FirstPlayerTokenSpace,
        player: this.nextFirstPlayer
      })
    ]
  }

  /** The token passes to the left, and the new year starts on whoever it lands on. */
  get nextFirstPlayer(): PlayerColor {
    const holder = this.material(MaterialType.FirstPlayerToken).getItem()?.location.player
    const players = this.game.players
    return players[(players.indexOf(holder as PlayerColor) + 1) % players.length]
  }
}
