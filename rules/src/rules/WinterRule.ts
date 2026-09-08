import { isDeleteItem, isMoveItem, ItemMove, Location, MaterialRulesPart } from '@gamepark/rules-api'
import { range } from 'es-toolkit'
import { VILLAGE_GRID_SIDE } from '../Constants'
import { PlayerColor } from '../PlayerColor'
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
      ...this.material(MaterialType.IncomeToken).location(LocationType.CardIncome).deleteItems(),
      // Both decks are the calendar of the game and are never shuffled back — they hold exactly the
      // 5 years and nothing more. So a card nobody took is out of the game for good and goes back in
      // the box, rather than onto a discard nobody would ever draw from. Same for the Event of the
      // year: the pile only holds the years to come.
      ...grid.deleteItems(),
      ...row.deleteItems(),
      this.event.deleteItem()
    ]
  }

  /** The tile of the year: the one on top of the pile, and the only one face up. */
  get event() {
    return this.material(MaterialType.EventTile)
      .location(LocationType.EventPile)
      .maxBy((item) => item.location.x ?? 0)
  }

  // ------------------------------------------------------------------ what the new year brings

  /**
   * Winter is the one rule a client cannot play ahead of the server: it reads the faces of the two
   * decks, and nobody else can see them (see {@link GreyluneRules.isUnpredictableMove}). So an
   * Encounter is dealt straight into the row of the Area printed on its banner, and what a card
   * calls for once it is down follows in {@link afterItemMove}.
   */
  private revealVillage(): GreyluneMove[] {
    const deck = this.material(MaterialType.VillageCard).location(LocationType.VillageDeck).deck()
    return range(VILLAGE_GRID_SIDE * VILLAGE_GRID_SIDE).map((slot) =>
      deck.dealOne({ type: LocationType.VillageGrid, x: slot % VILLAGE_GRID_SIDE, y: Math.floor(slot / VILLAGE_GRID_SIDE) })
    )
  }

  private revealEncounters(): GreyluneMove[] {
    return this.material(MaterialType.EncounterCard)
      .location(LocationType.EncounterDeck)
      .deck()
      .deal((item) => ({ type: LocationType.EncounterRow, id: encounterArea[(item.id as EncounterCardId).front!] }), encounterRowSize(this.game.players.length))
  }

  /**
   * What each piece asks for as it lands: the tile of the new year is turned up when the tile of the
   * past year leaves the Event pile, a Village card is dealt the Seals printed on it, and an
   * Encounter takes the Income token it carries.
   */
  afterItemMove(move: ItemMove<PlayerColor, MaterialType, LocationType>): GreyluneMove[] {
    if (isDeleteItem(move) && move.itemType === MaterialType.EventTile) return [this.event.rotateItem(true)]
    if (!isMoveItem(move)) return []
    if (move.itemType === MaterialType.VillageCard && move.location.type === LocationType.VillageGrid) {
      return this.placeSeals(move.itemIndex)
    }
    if (move.itemType === MaterialType.EncounterCard && move.location.type === LocationType.EncounterRow) {
      return this.placeIncomeToken(move.itemIndex)
    }
    return []
  }

  /**
   * The `-1` symbol asks for one Seal less than there are players, the `?` for exactly one, whatever the table
   * seats (rulebook p.6). They are drawn from the stack, and from what was already spent once the
   * stack has run out — the rulebook makes a new pile of the discard at that point (p.6).
   */
  private placeSeals(card: number): GreyluneMove[] {
    const front = this.material(MaterialType.VillageCard).getItem<VillageCardId>(card).id.front!
    const seals = villageCardData[front].seals
    const count = seals === PLAYERS_MINUS_ONE ? this.game.players.length - 1 : (seals ?? 0)
    return this.sealSupply.limit(count).moveItems({ type: LocationType.CardSeal, parent: card })
  }

  /** The stack, from the top, and then the discard, from the bottom: one supply drawn in one order. */
  private get sealSupply() {
    const inStack = (location: Location<PlayerColor, LocationType>) => location.type === LocationType.SealStack
    return this.material(MaterialType.Seal)
      .location((location) => inStack(location) || location.type === LocationType.SealDiscard)
      .sort(
        (item) => (inStack(item.location) ? 0 : 1),
        (item) => (inStack(item.location) ? -(item.location.x ?? 0) : (item.location.x ?? 0))
      )
  }

  /** The token drawn on the card's reward scroll: the stock holds exactly one, and no other card asks for it. */
  private placeIncomeToken(card: number): GreyluneMove[] {
    const income = encounterIncomeToken(this.material(MaterialType.EncounterCard).getItem<EncounterCardId>(card).id.front!)
    return income === undefined
      ? []
      : this.material(MaterialType.IncomeToken).location(LocationType.IncomeTokenStock).id(income).moveItems({ type: LocationType.CardIncome, parent: card })
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
