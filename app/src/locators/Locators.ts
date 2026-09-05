import { Area } from '@gamepark/greylune/material/Area'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { HeroicQuestArea } from '@gamepark/greylune/material/QuestTile'
import { gapOf } from '@gamepark/greylune/material/Village'
import { VpTokenValue } from '@gamepark/greylune/material/VpToken'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { DeckLocator, ListLocator, Locator, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'
import { CenteredFlexLocator } from './CenteredFlexLocator'
import { CenteredListLocator } from './CenteredListLocator'
import { playerPanelLocator } from './PlayerPanelLocator'
import { getBandRow, hideBandOfOtherPlayers } from './DisplayedPlayer'
import {
  activeVillagersSpot,
  bonusTokensGap,
  bonusTokensSpot,
  campSpot,
  coinReserveSpot,
  companionsGap,
  companionsSpot,
  encounterDeckSpot,
  encounterDiscardSpot,
  encounterRowGap,
  encounterRowMaxGap,
  encounterRowSpot,
  eventSpot,
  firstPlayerTokenSpot,
  incomeTokenSpot,
  incomeTokenStockSpot,
  itemsGap,
  itemsSpot,
  magicTrackSpot,
  mainBoardSpot,
  playerAreaSpot,
  playerBoardSpot,
  playerCardsMaxCount,
  playerCoinsRadius,
  playerCoinsSpot,
  playerVpTokensSpot,
  questMarkerSpot,
  questRewardSpot,
  questTileSpots,
  scoreTrackSpot,
  sealDiscardRadius,
  sealDiscardSpot,
  sealStackSpot,
  seasonBoardSpot,
  seasonSpots,
  specialActionSpot,
  stacked,
  storiesGap,
  storiesMaxGap,
  strengthTrackSpot,
  toldStoriesSpot,
  untoldStoriesSpot,
  villageDeckSpot,
  villageDiscardSpot,
  villageGap,
  villageGapGap,
  villageGridSpot,
  villagerReserveSpot,
  areaSpots,
  vpTokenStackSpots
} from './TableLayout'

/**
 * The 5 free spaces of the Festival, in percentage of the tile they are drawn on: one at the top
 * between the Magic and the 2 points, two down each side, and the last two either side of the Force
 * at the bottom. Standing on one is choosing the 2 bonuses it lies between.
 */
const festivalSpaces: Record<number, XYCoordinates> = {
  0: { x: 50, y: 34 },
  1: { x: 31.5, y: 49 },
  2: { x: 69, y: 49 },
  3: { x: 31.5, y: 72 },
  4: { x: 69, y: 72 }
}

/** Which of the 4 seats a player sits in. Fixed for the whole game, so positions never move. */
const seatOf = (context: MaterialContext, player?: number) => Math.max(0, context.rules.players.indexOf(player as PlayerColor))

/**
 * Several players share one space: the Village, a season circle, a score shield. Spread them around
 * the middle of that space rather than stacking them out of sight.
 */
const fanBySeat = (context: MaterialContext, player: number | undefined, step: number) =>
  (seatOf(context, player) - (context.rules.players.length - 1) / 2) * step

/** The middle of a player's personal board, once the column has settled which row carries the band. */
const areaOf = (context: MaterialContext, player?: PlayerColor) => playerAreaSpot(seatOf(context, player), context.rules.players.length, getBandRow(context))

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {
  // ---------------------------------------------------------------- boards

  [LocationType.MainBoard]: new Locator({ coordinates: mainBoardSpot }),

  [LocationType.SeasonBoard]: new Locator({ coordinates: seasonBoardSpot }),

  /** Not material: a player's panel, laid on the table over their own area. */
  [LocationType.PlayerPanel]: playerPanelLocator,

  [LocationType.PlayerBoard]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => playerBoardSpot(areaOf(context, location.player))
  }),

  // ---------------------------------------------------------------- Village cards

  [LocationType.VillageDeck]: new DeckLocator({ coordinates: villageDeckSpot }),

  [LocationType.VillageGrid]: new Locator({
    getCoordinates: (location: Location) => villageGridSpot(location.x ?? 0, location.y ?? 0)
  }),

  [LocationType.VillageDiscard]: new DeckLocator({ coordinates: villageDiscardSpot }),

  /**
   * The gaps between the cards, where any number of Villagers of any players may stand. A gap is
   * named by the half coordinates of the point between its two slots, and the grid being evenly
   * spaced, {@link villageGridSpot} lands on that point on its own.
   */
  [LocationType.VillageGap]: new CenteredListLocator({
    getCenter: (location: Location) => villageGridSpot(location.x ?? 0, location.y ?? 0),
    getGap: (location: Location) => villageGapGap(gapOf(location))
  }),

  /** The Seals a card was dealt, laid in a row along its bottom edge. */
  [LocationType.CardSeal]: new ListLocator({
    parentItemType: MaterialType.VillageCard,
    gap: { x: 1.4 },
    positionOnParent: { x: 30, y: 86 }
  }),

  // ---------------------------------------------------------------- Encounter cards

  [LocationType.EncounterDeck]: new DeckLocator({ coordinates: encounterDeckSpot }),

  [LocationType.EncounterRow]: new ListLocator({
    gap: encounterRowGap,
    maxGap: encounterRowMaxGap,
    getCoordinates: (location: Location) => encounterRowSpot((location.id as Area) ?? Area.Wand)
  }),

  [LocationType.EncounterDiscard]: new DeckLocator({ coordinates: encounterDiscardSpot }),

  /** The Income token an Encounter carries, laid over the reward half of its scroll. */
  [LocationType.CardIncome]: new Locator({
    parentItemType: MaterialType.EncounterCard,
    positionOnParent: { x: 72, y: 88 }
  }),

  // ---------------------------------------------------------------- Events and Quests

  /** The tile of the year is the one on top of the pile, face up; the years to come show their back. */
  [LocationType.EventPile]: new DeckLocator({ coordinates: eventSpot }),

  [LocationType.QuestTileSpace]: new Locator({
    getCoordinates: (location: Location) => questTileSpots[location.id as HeroicQuestArea]
  }),

  /** The markers of the players who achieved a Quest: the first alone, the others sharing a shield. */
  [LocationType.QuestRewardSpace]: new Locator({
    getCoordinates: (location: Location) => stacked(questRewardSpot(location.id as HeroicQuestArea, location.x === 0), location.z)
  }),

  /**
   * The Villagers taking part in the Event stand on the tile itself. The Festival is the only one
   * with spaces of its own: 5 of them, drawn in a ring, each between 2 of its bonuses. Every other
   * tile has a single space, so everybody stands in the middle of it.
   */
  [LocationType.EventSpace]: new Locator({
    parentItemType: MaterialType.EventTile,
    getPositionOnParent: (location: Location) => festivalSpaces[location.x ?? 0] ?? { x: 50, y: 50 }
  }),

  // ---------------------------------------------------------------- main board spaces

  /** Several Adventurers share an area as soon as they are level: they line up in it. */
  [LocationType.Area]: new CenteredListLocator({
    gap: villageGap,
    getCenter: (location: Location) => areaSpots[(location.id as Area) ?? Area.Village]
  }),

  /** Players level on the score track share a shield, and their markers pile up on it. */
  [LocationType.ScoreTrack]: new Locator({
    getCoordinates: (location: Location) => stacked(scoreTrackSpot(location.x ?? 0), location.z)
  }),

  // ---------------------------------------------------------------- general supply

  /** One small pile per value, on its printed shield. */
  [LocationType.VpTokenStack]: new DeckLocator({
    getCoordinates: (location: Location) => vpTokenStackSpots[location.id as VpTokenValue]
  }),

  /** The bank is money, like a player's own gold: a heap, not a row of stacks. */
  [LocationType.CoinReserve]: new PileLocator({ coordinates: coinReserveSpot, radius: 3 }),

  [LocationType.SealStack]: new PileLocator({ coordinates: sealStackSpot, radius: 3 }),

  /**
   * The strip between the Season board and the Encounter deck is narrower than it is tall, so the
   * heap is flattened to match: it spreads down the gap instead of over its two neighbours.
   */
  [LocationType.SealDiscard]: new PileLocator({ coordinates: sealDiscardSpot, radius: sealDiscardRadius }),

  /** The 8 tokens of the stock, symbol side up, in 2 rows of 4. */
  [LocationType.IncomeTokenStock]: new CenteredFlexLocator({
    center: incomeTokenStockSpot,
    lineSize: 4,
    gap: { x: 2.6 },
    lineGap: { y: 2.3 }
  }),

  // ---------------------------------------------------------------- season board

  [LocationType.SeasonTrack]: new Locator({
    getCoordinates: (location: Location) => stacked(seasonSpots[(location.x as Season) ?? Season.Spring], location.z)
  }),

  [LocationType.Camp]: new CenteredListLocator({
    gap: { x: 1.7 },
    getCenter: (location: Location, context: MaterialContext) => ({
      ...campSpot,
      y: campSpot.y + fanBySeat(context, location.player, 2.6)
    })
  }),

  // ---------------------------------------------------------------- personal board

  /**
   * The 2 rows of cards hang off the board rather than floating beside it: the first card is laid
   * against its edge and the row runs outwards, so a player with a single Companion has it where the
   * board says it belongs, and it does not move when the second one arrives. Past the 3 cards the row
   * is given, an extra Object tightens it up instead of running out over the table.
   */
  [LocationType.Companions]: new ListLocator({
    maxCount: playerCardsMaxCount,
    gap: companionsGap,
    getCoordinates: (location: Location, context: MaterialContext) => companionsSpot(areaOf(context, location.player))
  }),

  [LocationType.Items]: new ListLocator({
    maxCount: playerCardsMaxCount,
    gap: itemsGap,
    getCoordinates: (location: Location, context: MaterialContext) => itemsSpot(areaOf(context, location.player))
  }),

  [LocationType.ActiveVillagers]: new CenteredListLocator({
    gap: { x: 1.8 },
    getCenter: (location: Location, context: MaterialContext) => activeVillagersSpot(areaOf(context, location.player))
  }),

  [LocationType.StrengthTrack]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => strengthTrackSpot(areaOf(context, location.player), location.x ?? 0)
  }),

  [LocationType.MagicTrack]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => magicTrackSpot(areaOf(context, location.player), location.x ?? 0)
  }),

  [LocationType.QuestMarkerSpace]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => questMarkerSpot(areaOf(context, location.player), location.x ?? 0)
  }),

  [LocationType.IncomeTokenSpace]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => incomeTokenSpot(areaOf(context, location.player), location.x ?? 0)
  }),

  [LocationType.SpecialAction]: new CenteredListLocator({
    gap: { x: 1.2 },
    getCenter: (location: Location, context: MaterialContext) => specialActionSpot(areaOf(context, location.player))
  }),

  // ------------------------------------------------- the band above the personal board, drawn for one player

  [LocationType.UntoldStories]: new CenteredListLocator({
    gap: storiesGap,
    maxGap: storiesMaxGap,
    hide: hideBandOfOtherPlayers,
    getCenter: (location: Location, context: MaterialContext) => untoldStoriesSpot(areaOf(context, location.player))
  }),

  [LocationType.ToldStories]: new CenteredListLocator({
    gap: storiesGap,
    maxGap: storiesMaxGap,
    hide: hideBandOfOtherPlayers,
    getCenter: (location: Location, context: MaterialContext) => toldStoriesSpot(areaOf(context, location.player))
  }),

  /** Always drawn, whoever is read: there is a single token, and it tells who the round starts on. */
  [LocationType.FirstPlayerTokenSpace]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => firstPlayerTokenSpot(areaOf(context, location.player))
  }),

  [LocationType.BonusTokens]: new CenteredListLocator({
    gap: bonusTokensGap,
    hide: hideBandOfOtherPlayers,
    getCenter: (location: Location, context: MaterialContext) => bonusTokensSpot(areaOf(context, location.player))
  }),

  [LocationType.VillagerReserve]: new CenteredListLocator({
    gap: { x: 1.6 },
    hide: hideBandOfOtherPlayers,
    getCenter: (location: Location, context: MaterialContext) => villagerReserveSpot(areaOf(context, location.player))
  }),

  /** Coins carry no rank: they are a quantity, and they are shown as a heap rather than a row. */
  [LocationType.PlayerCoins]: new PileLocator({
    radius: playerCoinsRadius,
    maxAngle: 90,
    minimumDistance: 0.5,
    hide: hideBandOfOtherPlayers,
    getCoordinates: (location: Location, context: MaterialContext) => playerCoinsSpot(areaOf(context, location.player))
  }),

  [LocationType.PlayerVpTokens]: new CenteredListLocator({
    gap: { x: 2 },
    hide: hideBandOfOtherPlayers,
    getCenter: (location: Location, context: MaterialContext) => playerVpTokensSpot(areaOf(context, location.player))
  })
}
