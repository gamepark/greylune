import { getEnumValues, MaterialGameSetup } from '@gamepark/rules-api'
import { range, shuffle } from 'es-toolkit'
import { GreyluneOptions } from './GreyluneOptions'
import { GreyluneRules } from './GreyluneRules'
import { EncounterCard, EncounterCardId, encounterCardsOfPeriod, encounterDistance, getEncounterCardPeriod } from './material/EncounterCard'
import { EventTile } from './material/EventTile'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { Period } from './material/Period'
import { heroicQuestDistances, QuestTile } from './material/QuestTile'
import { BonusToken, coins, IncomeToken, Seal } from './material/Tokens'
import { getVillageCardPeriod, VillageCard, villageCardsOfPeriod } from './material/VillageCard'
import { playerVillagers } from './material/Villager'
import { getVpToken, VpTokenValue } from './material/VpToken'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'
import { Season } from './Season'

/** Village cards of period I and of period II that go back in the box unseen. */
const VILLAGE_CARDS_REMOVED = 2
/** Side of the square of face-up Village cards. */
const VILLAGE_GRID_SIDE = 3
/** Event tile that goes back in the box unseen: a year of the game is never played. */
const EVENT_TILES_REMOVED = 1
/** Quest markers a player may commit to the Heroic Quests, one per Quest space. */
const QUEST_MARKERS = 3
/** How many Seal tokens of each value are punched. */
const SEALS_PER_VALUE = 8
/** Of the 7 Villagers of a player, how many may already be used in the first year. */
const ACTIVE_VILLAGERS = 3
const STARTING_COINS = 8

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
    this.setupVillageCards()
    this.setupEncounterCards()
    this.setupEventTiles()
    this.setupQuestTiles()
    this.setupBank()
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
   * once to form the 3x3 grid of the first year.
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
    this.material(MaterialType.VillageCard).createItems(
      cards.map((card) => ({ id: villageCardId(card), location: { type: LocationType.VillageDeck } }))
    )
    const deck = this.material(MaterialType.VillageCard).deck()
    for (const slot of range(VILLAGE_GRID_SIDE * VILLAGE_GRID_SIDE)) {
      deck.dealOne({ type: LocationType.VillageGrid, x: slot % VILLAGE_GRID_SIDE, y: Math.floor(slot / VILLAGE_GRID_SIDE) })
    }
    // TODO the cards showing the Seal symbol must receive Seal tokens here (players - 1, or exactly
    // 1 depending on the symbol). That needs the per-card data, which is not extracted yet.
  }

  /**
   * Encounter deck: 5/6/7 cards of period III at the bottom, then 10/12/14 of period II, then as
   * many of period I, at 2/3/4 players. The top 5/6/7 are revealed and sorted along the right edge
   * of the main board, each into the row of the Distance it is worth.
   */
  private setupEncounterCards() {
    const players = this.players.length
    const cards = [
      ...shuffle(encounterCardsOfPeriod[Period.III]).slice(0, players + 3),
      ...shuffle(encounterCardsOfPeriod[Period.II]).slice(0, 2 * players + 6),
      ...shuffle(encounterCardsOfPeriod[Period.I]).slice(0, 2 * players + 6)
    ]
    this.material(MaterialType.EncounterCard).createItems(
      cards.map((card) => ({ id: encounterCardId(card), location: { type: LocationType.EncounterDeck } }))
    )
    this.material(MaterialType.EncounterCard)
      .deck()
      .deal((item) => ({ type: LocationType.EncounterRow, id: encounterDistance[(item.id as EncounterCardId).front!] }), players + 3)
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
      heroicQuestDistances.map((distance, index) => ({
        id: quests[index],
        location: { type: LocationType.QuestTileSpace, id: distance }
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
    this.material(MaterialType.IncomeToken).createItems(
      getEnumValues(IncomeToken).map((id) => ({ id, location: { type: LocationType.IncomeTokenStock } }))
    )
  }

  private setupPlayer(player: PlayerColor) {
    // The Village and the two tracks are spaces everybody shares, so their locations carry no
    // `player`: with one, each player would be alone in their own area and the Adventurers would
    // never line up nor the markers ever pile up. Whose piece it is, is its `id`.
    this.material(MaterialType.Adventurer).createItem({ id: player, location: { type: LocationType.Village } })
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
    this.material(MaterialType.BonusToken).createItems(
      getEnumValues(BonusToken).map((id) => ({ id, location: { type: LocationType.BonusTokens, player } }))
    )
    // The 2 victory point tokens are the player's, but they do not start with them: they wait on the
    // 2 shields at the foot of the score track, claimed the first time their owner crosses 25, then 75.
    this.material(MaterialType.VpToken).createItems(
      getEnumValues(VpTokenValue).map((value) => ({ id: getVpToken(player, value), location: { type: LocationType.VpTokenStack, id: value } }))
    )
    this.material(MaterialType.Coin).money(coins).addMoney(STARTING_COINS, { type: LocationType.PlayerCoins, player })
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}

const villageCardId = (front: VillageCard) => ({ front, back: getVillageCardPeriod(front) })

const encounterCardId = (front: EncounterCard) => ({ front, back: getEncounterCardPeriod(front) })
