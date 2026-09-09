import { isDeleteItem, isMoveItem, isMoveItemsAtOnce, isShuffle, ItemMove, MaterialRulesPart } from '@gamepark/rules-api'
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
 * The first year is no exception: {@link GreyluneSetup} builds the two decks and the two piles and
 * hands over to this rule, which finds nothing to put away and lays the year out the same way. The
 * table is described here, once, and never a second time in the setup.
 *
 * The Seals of the cards nobody took are the one thing put away that comes back: they go to the
 * discard, and the rulebook makes a new stack of it, shuffled, when the stack runs short (p.6). That
 * is the one loop of this rule, and it is spread over {@link dealSeals} and two reactions.
 */
export class WinterRule extends MaterialRulesPart<PlayerColor, MaterialType, LocationType, RuleId> {
  onRuleStart(): GreyluneMove[] {
    return [...this.putAway(), ...this.newEvent(), ...this.revealVillage(), ...this.revealEncounters(), ...this.newRound()]
  }

  // ------------------------------------------------------------------ what the past year leaves

  private putAway(): GreyluneMove[] {
    return [
      ...this.material(MaterialType.Seal).location(LocationType.CardSeal).moveItems({ type: LocationType.SealDiscard }),
      ...this.material(MaterialType.IncomeToken).location(LocationType.CardIncome).deleteItems(),
      // Both decks are the calendar of the game and are never shuffled back — they hold exactly the
      // 5 years and nothing more. So a card nobody took is out of the game for good and goes back in
      // the box, rather than onto a discard nobody would ever draw from. Same for the Event of the
      // year: the pile only holds the years to come.
      ...this.grid.deleteItems(),
      ...this.material(MaterialType.EncounterCard).location(LocationType.EncounterRow).deleteItems()
    ]
  }

  /**
   * The Event of the year is the tile on top of the pile, and the only one face up. The tile of the
   * past year is taken off the pile, and turning up the one it uncovers is left to
   * {@link afterItemMove}: a list of moves is built against the state it starts from, so the new top
   * of the pile cannot be named while the old one is still on it. On the first year there is nothing
   * to take off, and the pile is simply opened on its first tile.
   */
  private newEvent(): GreyluneMove[] {
    const pastYear = this.material(MaterialType.EventTile).location(LocationType.EventPile).rotation(true)
    return pastYear.exists ? pastYear.deleteItems() : [this.event.rotateItem(true)]
  }

  /** The tile the pile opens on: the last one of the sequence that orders it. */
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
   *
   * The grid is the one place that names its own coordinates, and it takes two: `x` is the column
   * and `y` the row, which is what the Villagers placed in the gaps between cards are read against.
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
   * past year leaves the Event pile, a Village card is dealt the Seals printed on it, an Encounter
   * takes the Income token it carries, and the year opens on whoever the first player token has just
   * reached. The two moves that rebuild the Seal stack answer each other here as well.
   */
  afterItemMove(move: ItemMove<PlayerColor, MaterialType, LocationType>): GreyluneMove[] {
    if (isDeleteItem(move) && move.itemType === MaterialType.EventTile) return [this.event.rotateItem(true)]
    if (isMoveItemsAtOnce(move) && move.itemType === MaterialType.Seal) return [this.sealStack.shuffle()]
    if (isShuffle(move) && move.itemType === MaterialType.Seal) return this.dealSeals()
    if (!isMoveItem(move)) return []
    if (move.itemType === MaterialType.VillageCard && move.location.type === LocationType.VillageGrid) {
      return this.dealSeals(move.itemIndex)
    }
    if (move.itemType === MaterialType.EncounterCard && move.location.type === LocationType.EncounterRow) {
      return this.placeIncomeToken(move.itemIndex)
    }
    if (move.itemType === MaterialType.FirstPlayerToken) {
      return [this.startPlayerTurn(RuleId.Spring, move.location.player!)]
    }
    return []
  }

  /**
   * The Seals a card of the grid is owed, drawn from the top of the stack.
   *
   * The stack does run out: a Seal spent on a card is gone for good, and only the ones nobody took
   * come back, when the year is put away. The rulebook then makes a new stack of the discard and
   * shuffles it (p.6), which is what the three lines below and the two reactions above do together —
   * the card is given whatever the stack still holds, the discard is turned over in one move, the
   * new stack is shuffled, and the shuffle comes back here to finish paying. Neither of those two
   * can be written on the next line rather than as a reaction: a move is built against the state it
   * starts from, and both need the one the move before them leaves.
   *
   * @param card The card to pay, the one that has just landed. Only the last card dealt can be owed
   * anything — every card before it was paid as it landed — so the shuffle needs no argument.
   * @throws when nothing is left in the stack nor in the discard to pay the card with.
   */
  private dealSeals(card: number = this.lastCardDealt): GreyluneMove[] {
    const owed = this.missingSeals(card)
    if (!owed) return []
    const moves = this.sealStack.deck().deal({ type: LocationType.CardSeal, parent: card }, owed)
    if (moves.length === owed) return moves
    // A grid asks for 9 Seals at most and the game holds 24, so an empty discard here means the
    // stock has been leaking somewhere. Better to stop than to lay out a year that is short of
    // Seals, which nothing downstream expects.
    const discard = this.material(MaterialType.Seal).location(LocationType.SealDiscard)
    if (!discard.exists) throw new Error(`${owed - moves.length} Seals are owed to a Village card, and there is none left in the stack or the discard`)
    return [...moves, discard.moveItemsAtOnce({ type: LocationType.SealStack })]
  }

  /** The card the grid was last dealt: {@link revealVillage} fills the slots row by row. */
  private get lastCardDealt(): number {
    return this.grid.maxBy((item) => (item.location.y ?? 0) * VILLAGE_GRID_SIDE + (item.location.x ?? 0)).getIndex()
  }

  /**
   * What a card of the grid is still owed: the `-1` symbol asks for one Seal less than there are
   * players, the `?` for exactly one, whatever the table seats (rulebook p.6).
   */
  private missingSeals(card: number): number {
    const seals = villageCardData[this.material(MaterialType.VillageCard).getItem<VillageCardId>(card).id.front!].seals
    const asked = seals === PLAYERS_MINUS_ONE ? this.game.players.length - 1 : (seals ?? 0)
    return asked - this.material(MaterialType.Seal).location(LocationType.CardSeal).parent(card).length
  }

  private get sealStack() {
    return this.material(MaterialType.Seal).location(LocationType.SealStack)
  }

  private get grid() {
    return this.material(MaterialType.VillageCard).location(LocationType.VillageGrid)
  }

  /** The token drawn on the card's reward scroll: the stock holds exactly one, and no other card asks for it. */
  private placeIncomeToken(card: number): GreyluneMove[] {
    const income = encounterIncomeToken(this.material(MaterialType.EncounterCard).getItem<EncounterCardId>(card).id.front!)
    return income === undefined
      ? []
      : this.material(MaterialType.IncomeToken).location(LocationType.IncomeTokenStock).id(income).moveItems({ type: LocationType.CardIncome, parent: card })
  }

  // ------------------------------------------------------------------ everybody back to Spring

  /**
   * There is exactly one first player token, and where it goes is the last thing the year of one
   * player leaves and the first thing the next one needs. So the turn is started in reaction to its
   * move (see {@link afterItemMove}) rather than beside it: the player who opens the year is named
   * once, and read back off the board.
   */
  private newRound(): GreyluneMove[] {
    return [
      ...this.material(MaterialType.SeasonMarker).moveItems({ type: LocationType.SeasonTrack, id: Season.Spring }),
      this.material(MaterialType.FirstPlayerToken).moveItem({ type: LocationType.FirstPlayerTokenSpace, player: this.nextFirstPlayer })
    ]
  }

  /** The token passes to the left, and the new year starts on whoever it lands on. */
  get nextFirstPlayer(): PlayerColor {
    const holder = this.material(MaterialType.FirstPlayerToken).getItem()?.location.player
    const players = this.game.players
    return players[(players.indexOf(holder as PlayerColor) + 1) % players.length]
  }
}
