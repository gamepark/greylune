import { getEnumValues, MaterialGameSetup } from '@gamepark/rules-api'
import { range, shuffle } from 'es-toolkit'
import { ACTIVE_VILLAGERS, EVENT_TILES_REMOVED, QUEST_MARKERS, SEALS_PER_VALUE, STARTING_COINS, VILLAGE_CARDS_REMOVED } from './Constants'
import { GreyluneOptions } from './GreyluneOptions'
import { GreyluneRules } from './GreyluneRules'
import { Area } from './material/Area'
import { EncounterCard, encounterCardsOfPeriod, getEncounterCardPeriod } from './material/EncounterCard'
import { EventTile } from './material/EventTile'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { Period } from './material/Period'
import { heroicQuestAreas, QuestTile } from './material/QuestTile'
import { BonusToken, coinUnits, IncomeToken, Seal } from './material/Tokens'
import { getVillageCardPeriod, VillageCard, villageCardsOfPeriod } from './material/VillageCard'
import { playerVillagers } from './material/Villager'
import { getVpToken, VpTokenValue } from './material/VpToken'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'
import { Season } from './Season'
import { encounterRowSize } from './Year'

/**
 * Builds the initial state described in "Mise en place générale" and "Mise en place des joueurs"
 * (rules booklet, pages 2 and 3) — or rather everything of it that the turn of the year does not
 * already do: the decks, the piles, the bank and the 4 personal boards. Laying the first year out on
 * the table is left to {@link WinterRule}, which is the same operation (see {@link start}).
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
    // in a random order, so any seat is as good a draw as any other. It is put down on the last one
    // because the first year is laid out by Winter like every other, and Winter starts by passing
    // the token to the left — so it reaches the first seat, and the game opens on it.
    this.material(MaterialType.FirstPlayerToken).createItem({
      location: { type: LocationType.FirstPlayerTokenSpace, player: this.players[this.players.length - 1] }
    })
  }

  /**
   * Village deck: 9 cards of period III at the bottom, then 18 of period II, then 18 of period I on
   * top — 2 cards of each of the first two periods are removed unseen. That is exactly 45 cards, one
   * 3x3 grid for each of the 5 years, and the first grid is dealt off it by {@link WinterRule} like
   * the four that follow.
   */
  private setupVillageCards() {
    const cards = [
      ...shuffle(villageCardsOfPeriod[Period.III]),
      ...shuffle(villageCardsOfPeriod[Period.II]).slice(VILLAGE_CARDS_REMOVED),
      ...shuffle(villageCardsOfPeriod[Period.I]).slice(VILLAGE_CARDS_REMOVED)
    ]
    this.material(MaterialType.VillageCard).createItems(cards.map((card) => ({ id: villageCardId(card), location: { type: LocationType.VillageDeck } })))
  }

  /**
   * Encounter deck: 5/6/7 cards of period III at the bottom, then 10/12/14 of period II, then as
   * many of period I, at 2/3/4 players — one row per year here as well.
   */
  private setupEncounterCards() {
    const row = encounterRowSize(this.players.length)
    const cards = [
      ...shuffle(encounterCardsOfPeriod[Period.III]).slice(0, row),
      ...shuffle(encounterCardsOfPeriod[Period.II]).slice(0, 2 * row),
      ...shuffle(encounterCardsOfPeriod[Period.I]).slice(0, 2 * row)
    ]
    this.material(MaterialType.EncounterCard).createItems(cards.map((card) => ({ id: encounterCardId(card), location: { type: LocationType.EncounterDeck } })))
  }

  /** One Event tile leaves the game; the 5 others form a face-down pile, one per year. */
  private setupEventTiles() {
    const tiles = shuffle(getEnumValues(EventTile)).slice(EVENT_TILES_REMOVED)
    this.material(MaterialType.EventTile).createItems(tiles.map((id) => ({ id, location: { type: LocationType.EventPile } })))
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

  /**
   * The table is not laid out here: "Mise en place générale" and the turn of the year are the same
   * operation — the 3x3 grid and the Seals its cards call for, the Encounter row and the Income
   * tokens it carries, the first Event turned face up, everyone in Spring, and the first player
   * token. So the setup builds the decks and the piles and lets {@link WinterRule} open the first
   * year, which ends by starting the turn of the first player.
   */
  start() {
    this.startRule(RuleId.Winter)
  }
}

const villageCardId = (front: VillageCard) => ({ front, back: getVillageCardPeriod(front) })

const encounterCardId = (front: EncounterCard) => ({ front, back: getEncounterCardPeriod(front) })
