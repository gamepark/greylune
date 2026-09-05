import { getEnumValues, MaterialGameSetup } from '@gamepark/rules-api'
import { range, shuffle } from 'es-toolkit'
import { ACTIVE_VILLAGERS, EVENT_TILES_REMOVED, QUEST_MARKERS, SEALS_PER_VALUE, STARTING_COINS, VILLAGE_CARDS_REMOVED, VILLAGE_GRID_SIDE } from './Constants'
import { GreyluneOptions } from './GreyluneOptions'
import { GreyluneRules } from './GreyluneRules'
import { Area } from './material/Area'
import { EncounterCard, EncounterCardId, encounterCardsOfPeriod, encounterArea, encounterIncomeToken, getEncounterCardPeriod } from './material/EncounterCard'
import { EventTile } from './material/EventTile'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { Period } from './material/Period'
import { heroicQuestAreas, QuestTile } from './material/QuestTile'
import { BonusToken, coinUnits, IncomeToken, Seal } from './material/Tokens'
import { getVillageCardPeriod, PLAYERS_MINUS_ONE, VillageCard, VillageCardId, villageCardData, villageCardsOfPeriod } from './material/VillageCard'
import { playerVillagers } from './material/Villager'
import { getVpToken, VpTokenValue } from './material/VpToken'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'
import { Season } from './Season'
import { encounterRowSize } from './Year'

/**
 * Builds the initial state described in "Mise en place générale" and "Mise en place des joueurs"
 * (rules booklet, pages 2 and 3).
 *
 * No `x` is ever handed out here: the location strategies of {@link GreyluneRules} order every deck
 * and every row, and the decks are dealt from rather than sliced, so the cards that get revealed are
 * the ones on top and are seen to come from there.
 */
export class GreyluneSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, GreyluneOptions> {
  Rules = GreyluneRules

  setupMaterial() {
    this.setupBank()
    this.setupVillageCards()
    this.setupEncounterCards()
    this.setupEventTiles()
    this.setupQuestTiles()
    for (const player of this.players) this.setupPlayer(player)
    // The last player to have gone adventuring takes the token: the platform already seats players
    // in a random order, so the first seat is as good a draw as any.
    this.material(MaterialType.FirstPlayerToken).createItem({
      location: { type: LocationType.FirstPlayerTokenSpace, player: this.players[0] }
    })
  }

  /**
   * Village deck: 9 cards of period III at the bottom, then 18 of period II, then 18 of period I on
   * top — 2 cards of each of the first two periods are removed unseen. The top 9 are revealed at
   * once to form the 3x3 grid of the first year, and the Seals their symbols call for are laid on
   * them.
   *
   * The grid is the one place that names its own coordinates, and it takes two: `x` is the column
   * and `y` the row, which is what the Villagers placed in the gaps between cards will be read
   * against.
   */
  private setupVillageCards() {
    const cards = [
      ...shuffle(villageCardsOfPeriod[Period.III]),
      ...shuffle(villageCardsOfPeriod[Period.II]).slice(VILLAGE_CARDS_REMOVED),
      ...shuffle(villageCardsOfPeriod[Period.I]).slice(VILLAGE_CARDS_REMOVED)
    ]
    this.material(MaterialType.VillageCard).createItems(cards.map((card) => ({ id: villageCardId(card), location: { type: LocationType.VillageDeck } })))
    const deck = this.material(MaterialType.VillageCard).deck()
    for (const slot of range(VILLAGE_GRID_SIDE * VILLAGE_GRID_SIDE)) {
      deck.dealOne({ type: LocationType.VillageGrid, x: slot % VILLAGE_GRID_SIDE, y: Math.floor(slot / VILLAGE_GRID_SIDE) })
    }
    for (const card of this.material(MaterialType.VillageCard).location(LocationType.VillageGrid).getIndexes()) {
      this.placeSeals(card)
    }
  }

  /**
   * The `-1` symbol asks for one Seal less than there are players, the `?` for exactly one, whatever the table
   * seats (rulebook p.6).
   */
  private placeSeals(card: number) {
    const front = this.material(MaterialType.VillageCard).getItem<VillageCardId>(card).id.front as VillageCard
    const seals = villageCardData[front].seals
    const count = seals === PLAYERS_MINUS_ONE ? this.players.length - 1 : (seals ?? 0)
    this.material(MaterialType.Seal).deck().deal({ type: LocationType.CardSeal, parent: card }, count)
  }

  /**
   * Encounter deck: 5/6/7 cards of period III at the bottom, then 10/12/14 of period II, then as
   * many of period I, at 2/3/4 players. The top 5/6/7 are revealed and sorted along the right edge
   * of the main board, each into the row of the Area it is worth, and the ones that carry an
   * Income token receive it face up.
   */
  private setupEncounterCards() {
    const row = encounterRowSize(this.players.length)
    const cards = [
      ...shuffle(encounterCardsOfPeriod[Period.III]).slice(0, row),
      ...shuffle(encounterCardsOfPeriod[Period.II]).slice(0, 2 * row),
      ...shuffle(encounterCardsOfPeriod[Period.I]).slice(0, 2 * row)
    ]
    this.material(MaterialType.EncounterCard).createItems(cards.map((card) => ({ id: encounterCardId(card), location: { type: LocationType.EncounterDeck } })))
    this.material(MaterialType.EncounterCard)
      .deck()
      .deal((item) => ({ type: LocationType.EncounterRow, id: encounterArea[(item.id as EncounterCardId).front!] }), row)
    for (const card of this.material(MaterialType.EncounterCard).location(LocationType.EncounterRow).getIndexes()) {
      const income = encounterIncomeToken(this.material(MaterialType.EncounterCard).getItem<EncounterCardId>(card).id.front!)
      if (income !== undefined) {
        this.material(MaterialType.IncomeToken).id(income).moveItem({ type: LocationType.CardIncome, parent: card })
      }
    }
  }

  /**
   * One Event tile leaves the game; the 5 others form a face-down pile. The tile of the first year is
   * the one on top, turned face up where it lies rather than moved anywhere.
   */
  private setupEventTiles() {
    const tiles = shuffle(getEnumValues(EventTile)).slice(EVENT_TILES_REMOVED)
    this.material(MaterialType.EventTile).createItems(tiles.map((id) => ({ id, location: { type: LocationType.EventPile } })))
    this.material(MaterialType.EventTile).deck().rotateItem(true)
  }

  /** 3 of the 9 Heroic Quests are played, one face up on each of the 3 Quest spaces of the map. */
  private setupQuestTiles() {
    const quests = shuffle(getEnumValues(QuestTile))
    this.material(MaterialType.QuestTile).createItems(
      heroicQuestAreas.map((area, index) => ({
        id: quests[index],
        location: { type: LocationType.QuestTileSpace, id: area }
      }))
    )
  }

  /**
   * Coins are unlimited, so the bank never enters the state: it only holds the face-down Seal stack
   * and the 8 Income tokens.
   */
  private setupBank() {
    const seals = shuffle(getEnumValues(Seal).flatMap((seal) => range(SEALS_PER_VALUE).map(() => seal)))
    this.material(MaterialType.Seal).createItems(seals.map((id) => ({ id, location: { type: LocationType.SealStack } })))
    this.material(MaterialType.IncomeToken).createItems(getEnumValues(IncomeToken).map((id) => ({ id, location: { type: LocationType.IncomeTokenStock } })))
  }

  private setupPlayer(player: PlayerColor) {
    // The areas and the two shared tracks carry no `player`: with one, each player would be alone
    // in a location of their own and the Adventurers would never line up nor the markers ever pile
    // up. Whose piece it is, is its `id`.
    this.material(MaterialType.Adventurer).createItem({ id: player, location: { type: LocationType.Area, id: Area.Village } })
    this.material(MaterialType.ScoreMarker).createItem({ id: player, location: { type: LocationType.ScoreTrack, x: 0 } })
    this.material(MaterialType.SeasonMarker).createItem({ id: player, location: { type: LocationType.SeasonTrack, x: Season.Spring } })
    this.material(MaterialType.StrengthMarker).createItem({ location: { type: LocationType.StrengthTrack, player, x: 0 } })
    this.material(MaterialType.MagicMarker).createItem({ location: { type: LocationType.MagicTrack, player, x: 0 } })
    this.material(MaterialType.QuestMarker).createItems(
      range(QUEST_MARKERS).map(() => ({ id: player, location: { type: LocationType.QuestMarkerSpace, player } }))
    )
    // 3 of the 7 Villagers start active; the other 4 are set aside and cannot be used yet. Which
    // figures they are is drawn: a player does not begin the game with the same faces every time.
    const villagers = shuffle(playerVillagers(player))
    this.material(MaterialType.Villager).createItems([
      ...villagers.slice(0, ACTIVE_VILLAGERS).map((id) => ({ id, location: { type: LocationType.ActiveVillagers, player } })),
      ...villagers.slice(ACTIVE_VILLAGERS).map((id) => ({ id, location: { type: LocationType.VillagerReserve, player } }))
    ])
    this.material(MaterialType.BonusToken).createItems(getEnumValues(BonusToken).map((id) => ({ id, location: { type: LocationType.BonusTokens, player } })))
    // The 2 victory point tokens are the player's, but they do not start with them: they wait on the
    // 2 shields at the foot of the score track, claimed the first time their owner crosses 25, then 75.
    this.material(MaterialType.VpToken).createItems(
      getEnumValues(VpTokenValue).map((value) => ({ id: getVpToken(player, value), location: { type: LocationType.VpTokenStack, id: value } }))
    )
    this.material(MaterialType.Coin).money(coinUnits).addMoney(STARTING_COINS, { type: LocationType.PlayerCoins, player })
  }

  start() {
    this.startPlayerTurn(RuleId.Spring, this.players[0])
  }
}

const villageCardId = (front: VillageCard) => ({ front, back: getVillageCardPeriod(front) })

const encounterCardId = (front: EncounterCard) => ({ front, back: getEncounterCardPeriod(front) })
