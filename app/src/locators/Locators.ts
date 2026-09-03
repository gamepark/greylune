import { Distance } from '@gamepark/greylune/material/Distance'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { HeroicQuestDistance } from '@gamepark/greylune/material/QuestTile'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { VpTokenValue } from '@gamepark/greylune/material/VpToken'
import { Season } from '@gamepark/greylune/Season'
import { DeckLocator, ListLocator, Locator, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { CenteredListLocator } from './CenteredListLocator'
import {
  activeVillagersSpot,
  bonusTokensSpot,
  campSpot,
  coinReserveSpot,
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
  itemsSpot,
  magicTrackSpot,
  mainBoardSpot,
  playerBoardSpot,
  playerCardsGap,
  playerCoinsRadius,
  playerCoinsSpot,
  playerVpTokensSpot,
  questMarkerSpot,
  questTileSpots,
  scoreTrackSpot,
  sealStackSpot,
  seasonBoardSpot,
  seasonSpots,
  specialActionSpot,
  stacked,
  storiesGap,
  strengthTrackSpot,
  toldStoriesSpot,
  untoldStoriesSpot,
  villageDeckSpot,
  villageDiscardSpot,
  villageGap,
  villageGridSpot,
  villagerReserveSpot,
  villageSpot,
  vpTokenStackSpots
} from './TableLayout'

/** Which of the 4 seats a player sits in. Fixed for the whole game, so positions never move. */
const seatOf = (context: MaterialContext, player?: number) => Math.max(0, context.rules.players.indexOf(player as PlayerColor))

/**
 * Several players share one space: the Village, a season circle, a score shield. Spread them around
 * the middle of that space rather than stacking them out of sight.
 */
const fanBySeat = (context: MaterialContext, player: number | undefined, step: number) =>
  (seatOf(context, player) - (context.rules.players.length - 1) / 2) * step

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {
  // ---------------------------------------------------------------- boards

  [LocationType.MainBoard]: new Locator({ coordinates: mainBoardSpot }),

  [LocationType.SeasonBoard]: new Locator({ coordinates: seasonBoardSpot }),

  [LocationType.PlayerBoard]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => playerBoardSpot(seatOf(context, location.player))
  }),

  // ---------------------------------------------------------------- Village cards

  [LocationType.VillageDeck]: new DeckLocator({ coordinates: villageDeckSpot }),

  [LocationType.VillageGrid]: new Locator({
    getCoordinates: (location: Location) => villageGridSpot(location.x ?? 0, location.y ?? 0)
  }),

  [LocationType.VillageDiscard]: new DeckLocator({ coordinates: villageDiscardSpot }),

  // ---------------------------------------------------------------- Encounter cards

  [LocationType.EncounterDeck]: new DeckLocator({ coordinates: encounterDeckSpot }),

  [LocationType.EncounterRow]: new ListLocator({
    gap: encounterRowGap,
    maxGap: encounterRowMaxGap,
    getCoordinates: (location: Location) => encounterRowSpot((location.id as Distance) ?? Distance.Gold)
  }),

  [LocationType.EncounterDiscard]: new DeckLocator({ coordinates: encounterDiscardSpot }),

  // ---------------------------------------------------------------- Events and Quests

  /** The tile of the year is the one on top of the pile, face up; the years to come show their back. */
  [LocationType.EventPile]: new DeckLocator({ coordinates: eventSpot }),

  [LocationType.QuestTileSpace]: new Locator({
    getCoordinates: (location: Location) => questTileSpots[location.id as HeroicQuestDistance]
  }),

  // ---------------------------------------------------------------- main board spaces

  [LocationType.Village]: new CenteredListLocator({ center: villageSpot, gap: villageGap }),

  /** Players level on the score track share a shield, and their markers pile up on it. */
  [LocationType.ScoreTrack]: new Locator({
    getCoordinates: (location: Location) => stacked(scoreTrackSpot(location.x ?? 0), location.z)
  }),

  // ---------------------------------------------------------------- general supply

  /** One small pile per value, on its printed shield. */
  [LocationType.VpTokenStack]: new DeckLocator({
    getCoordinates: (location: Location) => vpTokenStackSpots[location.id as VpTokenValue]
  }),

  [LocationType.CoinReserve]: new ListLocator({ coordinates: coinReserveSpot, gap: { x: 3 } }),

  [LocationType.SealStack]: new DeckLocator({ coordinates: sealStackSpot }),

  [LocationType.IncomeTokenStock]: new CenteredListLocator({ center: incomeTokenStockSpot, gap: { x: 0.9 } }),

  [LocationType.VillagerReserve]: new CenteredListLocator({
    gap: { x: 1.6 },
    getCenter: (location: Location, context: MaterialContext) => villagerReserveSpot(seatOf(context, location.player))
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

  [LocationType.Companions]: new CenteredListLocator({
    limit: 3,
    gap: playerCardsGap,
    getCenter: (location: Location, context: MaterialContext) => companionsSpot(seatOf(context, location.player))
  }),

  [LocationType.Items]: new CenteredListLocator({
    limit: 3,
    gap: playerCardsGap,
    getCenter: (location: Location, context: MaterialContext) => itemsSpot(seatOf(context, location.player))
  }),

  [LocationType.UntoldStories]: new ListLocator({
    gap: storiesGap,
    getCoordinates: (location: Location, context: MaterialContext) => untoldStoriesSpot(seatOf(context, location.player))
  }),

  [LocationType.ToldStories]: new ListLocator({
    gap: storiesGap,
    getCoordinates: (location: Location, context: MaterialContext) => toldStoriesSpot(seatOf(context, location.player))
  }),

  [LocationType.ActiveVillagers]: new CenteredListLocator({
    gap: { x: 1.8 },
    getCenter: (location: Location, context: MaterialContext) => activeVillagersSpot(seatOf(context, location.player))
  }),

  [LocationType.StrengthTrack]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => strengthTrackSpot(seatOf(context, location.player), location.x ?? 0)
  }),

  [LocationType.MagicTrack]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => magicTrackSpot(seatOf(context, location.player), location.x ?? 0)
  }),

  [LocationType.QuestMarkerSpace]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => questMarkerSpot(seatOf(context, location.player), location.x ?? 0)
  }),

  [LocationType.IncomeTokenSpace]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => incomeTokenSpot(seatOf(context, location.player), location.x ?? 0)
  }),

  [LocationType.SpecialAction]: new CenteredListLocator({
    gap: { x: 1.2 },
    getCenter: (location: Location, context: MaterialContext) => specialActionSpot(seatOf(context, location.player))
  }),

  // ---------------------------------------------------------------- beside the personal board

  [LocationType.BonusTokens]: new CenteredListLocator({
    gap: { x: 2.1 },
    getCenter: (location: Location, context: MaterialContext) => bonusTokensSpot(seatOf(context, location.player))
  }),

  /** Coins carry no rank: they are a quantity, and they are shown as a heap rather than a row. */
  [LocationType.PlayerCoins]: new PileLocator({
    radius: playerCoinsRadius,
    maxAngle: 90,
    minimumDistance: 0.5,
    getCoordinates: (location: Location, context: MaterialContext) => playerCoinsSpot(seatOf(context, location.player))
  }),

  [LocationType.PlayerVpTokens]: new CenteredListLocator({
    gap: { x: 2 },
    getCenter: (location: Location, context: MaterialContext) => playerVpTokensSpot(seatOf(context, location.player))
  }),

  [LocationType.FirstPlayerTokenSpace]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) => firstPlayerTokenSpot(seatOf(context, location.player))
  })
}
