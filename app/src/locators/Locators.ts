import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { HeroicQuestArea } from '@gamepark/greylune/material/QuestTile'
import { VpTokenValue } from '@gamepark/greylune/material/VpToken'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { DeckLocator, ListLocator, Locator, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { AreaLocator } from './AreaLocator'
import { CampLocator } from './CampLocator'
import { CenteredFlexLocator } from './CenteredFlexLocator'
import { CenteredListLocator } from './CenteredListLocator'
import { EventSpaceLocator } from './EventSpaceLocator'
import { playerPanelLocator } from './PlayerPanelLocator'
import { areaOf, fanBySeat } from './Seats'
import { VillageGapLocator } from './VillageGapLocator'
import { VillageGridLocator } from './VillageGridLocator'
import { VillagerReserveLocator } from './VillagerReserveLocator'
import { hideBandOfOtherPlayers, showsBandOf } from './DisplayedPlayer'
import { companionsDependencies, companionsMaxSpread, encounterRowArea, encounterRowDependencies, encounterRowSpread } from './CrowdedRows'
import {
  activeVillagersSpot,
  bonusTokensGap,
  bonusTokensSpot,
  campRowGap,
  campSpot,
  coinReserveSpot,
  companionsGap,
  companionsSpot,
  encounterDeckSpot,
  encounterRowGap,
  encounterRowSpot,
  eventSpot,
  firstPlayerTokenSpot,
  incomeTokenSpot,
  incomeTokenStockSpot,
  itemsGap,
  itemsSpot,
  magicTrackSpot,
  mainBoardSpot,
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
  tiltedCardAngle,
  toldStoriesSpot,
  untoldStoriesSpot,
  villageDeckSpot,
  vpTokenStackSpots
} from './TableLayout'

/**
 * A card a player has used lies on its side until it is straightened (see {@link tiltedCardAngle}).
 * Both rows of cards a player keeps are tilted the same way: an Object is laid down to be used, a
 * Companion to answer with, and it is the same gesture and the same card standing back up in Autumn.
 */
const tilt = (item: MaterialItem): number => (item.location.rotation === true ? tiltedCardAngle : 0)

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

  /** The cards themselves, and the buttons laid over the ones a Villager may be spent on. */
  [LocationType.VillageGrid]: new VillageGridLocator(),

  [LocationType.VillageGap]: new VillageGapLocator(),

  /**
   * The Seals a card was dealt, stacked in a column along its right edge: the bottom of the card is
   * where its effect is printed, and 3 Seals lying there would cover it.
   */
  [LocationType.CardSeal]: new ListLocator({
    parentItemType: MaterialType.VillageCard,
    gap: { y: 1.4 },
    positionOnParent: { x: 86, y: 30 }
  }),

  // ---------------------------------------------------------------- Encounter cards

  [LocationType.EncounterDeck]: new DeckLocator({ coordinates: encounterDeckSpot }),

  /**
   * The row grows to the right until it runs into the Companions of a player, and only then tightens
   * up, the cards sliding over one another. See {@link CrowdedRows} for who gives way to whom.
   */
  [LocationType.EncounterRow]: new ListLocator({
    gap: encounterRowGap,
    getMaxGap: (location: Location, context: MaterialContext) => ({ x: encounterRowSpread(encounterRowArea(location), context) }),
    getPositionDependencies: (location: Location, context: MaterialContext) => encounterRowDependencies(location, context),
    getCoordinates: (location: Location) => encounterRowSpot(encounterRowArea(location))
  }),

  /** The Income token an Encounter carries, laid over the reward half of its scroll, flush with the right edge of the card. */
  [LocationType.CardIncome]: new Locator({
    parentItemType: MaterialType.EncounterCard,
    positionOnParent: { x: 79, y: 88 }
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
   *
   * A Villager that has just walked onto the tile has no `x` yet: it stands in the middle of it,
   * whatever the tile, until its player says what they take from the Event (see `EventRule`).
   */
  [LocationType.EventSpace]: new EventSpaceLocator(),

  // ---------------------------------------------------------------- main board spaces

  /** Several Adventurers share an area as soon as they are level: they line up in it. */
  [LocationType.Area]: new AreaLocator(),

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
    getCoordinates: (location: Location) => stacked(seasonSpots[(location.id as Season) ?? Season.Spring], location.x)
  }),

  [LocationType.Camp]: new CampLocator({
    gap: { x: 1.7 },
    getCenter: (location: Location, context: MaterialContext) => ({
      ...campSpot,
      y: campSpot.y + fanBySeat(context, location.player, campRowGap)
    })
  }),

  // ---------------------------------------------------------------- personal board

  /**
   * The 2 rows of cards hang off the board rather than floating beside it: the first card is laid
   * against its edge and the row runs outwards, so a player with a single Companion has it where the
   * board says it belongs, and it does not move when the second one arrives. Past the 3 cards the row
   * is given, an extra card tightens it up instead of running out over the table.
   *
   * The Companions run out towards the main board, into the strip the Encounter rows grow down, and
   * tighten up as well when an Encounter row lays claim to it: see {@link CrowdedRows}.
   */
  [LocationType.Companions]: new ListLocator({
    getItemRotateZ: tilt,
    gap: companionsGap,
    getMaxGap: (location: Location, context: MaterialContext) => ({ x: -companionsMaxSpread(location.player as PlayerColor, context) }),
    getPositionDependencies: (location: Location, context: MaterialContext) => companionsDependencies(location.player as PlayerColor, context),
    getCoordinates: (location: Location, context: MaterialContext) => companionsSpot(areaOf(context, location.player))
  }),

  [LocationType.Items]: new ListLocator({
    getItemRotateZ: tilt,
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

  /**
   * The 2 fans of Stories, pushed under the top edge of the board. Like the Companions and the Objects
   * they are anchored rather than centred: the first card is pushed against the printed edge and the
   * fan climbs away from it, so a Story stays where it was laid when the next one arrives.
   */
  [LocationType.UntoldStories]: new ListLocator({
    gap: storiesGap,
    maxGap: storiesMaxGap,
    hide: hideBandOfOtherPlayers,
    getCoordinates: (location: Location, context: MaterialContext) => untoldStoriesSpot(areaOf(context, location.player))
  }),

  [LocationType.ToldStories]: new ListLocator({
    gap: storiesGap,
    maxGap: storiesMaxGap,
    hide: hideBandOfOtherPlayers,
    getCoordinates: (location: Location, context: MaterialContext) => toldStoriesSpot(areaOf(context, location.player))
  }),

  /**
   * Always drawn, whoever is read: there is a single token, and it tells who the round starts on. It
   * follows the panel of its owner down when that player is not read, so it is always found beside it.
   */
  [LocationType.FirstPlayerTokenSpace]: new Locator({
    getCoordinates: (location: Location, context: MaterialContext) =>
      firstPlayerTokenSpot(areaOf(context, location.player), showsBandOf(context, location.player as PlayerColor))
  }),

  [LocationType.BonusTokens]: new CenteredListLocator({
    gap: bonusTokensGap,
    hide: hideBandOfOtherPlayers,
    getCenter: (location: Location, context: MaterialContext) => bonusTokensSpot(areaOf(context, location.player))
  }),

  /** The one place of the table with an explanation of its own: see {@link VillagerReserveLocator}. */
  [LocationType.VillagerReserve]: new VillagerReserveLocator(),

  /** Coins carry no rank: they are a quantity, and they are shown as a heap rather than a row. */
  [LocationType.PlayerCoins]: new PileLocator({
    radius: playerCoinsRadius,
    maxAngle: 90,
    minimumDistance: 0.5,
    hide: hideBandOfOtherPlayers,
    getCoordinates: (location: Location, context: MaterialContext) => playerCoinsSpot(areaOf(context, location.player))
  }),

  /** A player holds one point token at a time: the 25 is handed back when the 75 is taken. */
  [LocationType.PlayerVpTokens]: new Locator({
    hide: hideBandOfOtherPlayers,
    getCoordinates: (location: Location, context: MaterialContext) => playerVpTokensSpot(areaOf(context, location.player))
  })
}
