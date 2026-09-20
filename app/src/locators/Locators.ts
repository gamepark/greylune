import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { HeroicQuestArea } from '@gamepark/greylune/material/QuestTile'
import { BonusToken } from '@gamepark/greylune/material/Tokens'
import { VpTokenValue } from '@gamepark/greylune/material/VpToken'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { DeckLocator, ItemContext, ListLocator, Locator, MaterialContext, PileLocator } from '@gamepark/react-game'
import { getEnumValues, Location, MaterialItem } from '@gamepark/rules-api'
import { ActiveVillagersLocator } from './ActiveVillagersLocator'
import { AreaLocator } from './AreaLocator'
import { CampLocator } from './CampLocator'
import { cardHoverTransform } from './CardHover'
import { CenteredListLocator } from './CenteredListLocator'
import { EncounterRowLocator } from './EncounterRowLocator'
import { EventSpaceLocator } from './EventSpaceLocator'
import { playerPanelLocator } from './PlayerPanelLocator'
import { VillageGapLocator } from './VillageGapLocator'
import { VillageGridLocator } from './VillageGridLocator'
import { VillagerReserveLocator } from './VillagerReserveLocator'
import { hideOtherPlayers, isOutOfSight } from './DisplayedPlayer'
import {
  bonusTokensGap,
  bonusTokensSpot,
  coinReserveSpot,
  companionsSpot,
  encounterDeckSpot,
  eventSpot,
  firstPlayerTokenSpot,
  incomeTokenSpot,
  itemsSpot,
  magicTrackSpot,
  mainBoardSpot,
  playerBoardSpot,
  playerCardsGapUp,
  playerCardsMaxCount,
  playerColumnMaxGap,
  playerCoinsRadius,
  playerCoinsSpot,
  playerVpTokensSpot,
  questMarkerSpot,
  questRewardFanStep,
  questRewardSpot,
  questTileSpots,
  scoreTrackSpot,
  sealColumnGap,
  sealDiscardRadius,
  sealDiscardSpot,
  sealStackRadius,
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
 * Both columns of cards a player keeps are tilted the same way: an Object is laid down to be used, a
 * Companion to answer with, and it is the same gesture and the same card standing back up in Autumn.
 */
const tilt = (item: MaterialItem): number => (item.location.rotation === true ? tiltedCardAngle : 0)

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {
  // ---------------------------------------------------------------- boards

  [LocationType.MainBoard]: new Locator({ coordinates: mainBoardSpot }),

  [LocationType.SeasonBoard]: new Locator({ coordinates: seasonBoardSpot }),

  /** Not material: the panels of all the players, in the bottom right corner of the player area. */
  [LocationType.PlayerPanel]: playerPanelLocator,

  /** Every board lies on the one spot of the player area, and only the one of the player being read is drawn. */
  [LocationType.PlayerBoard]: new Locator({ coordinates: playerBoardSpot, hide: hideOtherPlayers }),

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
    gap: { y: sealColumnGap },
    positionOnParent: { x: 86, y: 30 }
  }),

  // ---------------------------------------------------------------- Encounter cards

  [LocationType.EncounterDeck]: new DeckLocator({ coordinates: encounterDeckSpot }),

  /** A line of 3 hanging off the notch the Area is dealt into, and the cards past the third under it. */
  [LocationType.EncounterRow]: new EncounterRowLocator(),

  /**
   * The Income token an Encounter carries, laid on the picture just above the reward half of its scroll,
   * flush with the right edge of the card: on the scroll itself it would hide what the card pays besides
   * the token — the Licorne's Villager among them. It goes out of sight with its card, when the card lies
   * among the Stories of a player who is not read.
   */
  [LocationType.CardIncome]: new Locator({
    parentItemType: MaterialType.EncounterCard,
    positionOnParent: { x: 79, y: 69 },
    hide: (item: MaterialItem<PlayerColor, LocationType>, context: ItemContext<PlayerColor, MaterialType, LocationType>) => isOutOfSight(item.location, context)
  }),

  // ---------------------------------------------------------------- Events and Quests

  /**
   * The tile of the year is the one on top of the pile, face up; the years to come show their back.
   *
   * It is read up close like a Village card, and for the same reason: it is printed with what it
   * asks and what it pays, in a size the table cannot spare. Only the tile of the year grows — the
   * ones under it are hidden, so the framework leaves a face-down item where it lies.
   */
  [LocationType.EventPile]: new DeckLocator({ coordinates: eventSpot, getHoverTransform: cardHoverTransform }),

  [LocationType.QuestTileSpace]: new Locator({
    getCoordinates: (location: Location) => questTileSpots[location.id as HeroicQuestArea]
  }),

  /** The markers of the players who achieved a Quest: the first alone, the others fanned out on a medal they share. */
  [LocationType.QuestRewardSpace]: new Locator({
    getCoordinates: (location: Location) => {
      const spot = questRewardSpot(location.id as HeroicQuestArea, location.x === 0)
      const rank = location.z ?? 0
      return { x: spot.x + questRewardFanStep.x * rank, y: spot.y + questRewardFanStep.y * rank, z: (spot.z ?? 0) + questRewardFanStep.z * rank }
    }
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

  [LocationType.SealStack]: new PileLocator({ coordinates: sealStackSpot, radius: sealStackRadius }),

  /**
   * The strip between the Season board and the Encounter deck is narrower than it is tall, so the
   * heap is flattened to match: it spreads down the gap instead of over its two neighbours.
   */
  [LocationType.SealDiscard]: new PileLocator({ coordinates: sealDiscardSpot, radius: sealDiscardRadius }),

  // ---------------------------------------------------------------- season board

  [LocationType.SeasonTrack]: new Locator({
    getCoordinates: (location: Location) => stacked(seasonSpots[(location.id as Season) ?? Season.Spring], location.x)
  }),

  [LocationType.Camp]: new CampLocator(),

  // ---------------------------------------------------------------- the player area, drawn for the player being read

  /**
   * The 2 columns of cards hang off the board rather than floating beside it: the first card is laid
   * against its edge, level with its middle, and the column climbs from there, so a player with a single
   * Companion has it where the board says it belongs, and it does not move when the second one arrives.
   * Past the 3 cards a column is given, an extra card tightens it up instead of climbing off the table.
   */
  [LocationType.Companions]: new ListLocator({
    getItemRotateZ: tilt,
    maxCount: playerCardsMaxCount,
    gap: playerCardsGapUp,
    coordinates: companionsSpot,
    hide: hideOtherPlayers,
    getHoverTransform: cardHoverTransform
  }),

  /**
   * A card raising the limit can bring a 4th Object, and another a 5th: a player may end up with as
   * many as 7, so the column takes the whole height its half of the area has and tightens up from there.
   */
  [LocationType.Items]: new ListLocator({
    getItemRotateZ: tilt,
    gap: playerCardsGapUp,
    getMaxGap: (_location: Location, context: MaterialContext) => playerColumnMaxGap(context.rules.players.length, false),
    coordinates: itemsSpot,
    hide: hideOtherPlayers,
    getHoverTransform: cardHoverTransform
  }),

  [LocationType.ActiveVillagers]: new ActiveVillagersLocator(),

  [LocationType.StrengthTrack]: new Locator({
    hide: hideOtherPlayers,
    getCoordinates: (location: Location) => strengthTrackSpot(location.x ?? 0)
  }),

  [LocationType.MagicTrack]: new Locator({
    hide: hideOtherPlayers,
    getCoordinates: (location: Location) => magicTrackSpot(location.x ?? 0)
  }),

  [LocationType.QuestMarkerSpace]: new Locator({
    hide: hideOtherPlayers,
    getCoordinates: (location: Location) => questMarkerSpot(location.x ?? 0)
  }),

  [LocationType.IncomeTokenSpace]: new Locator({
    hide: hideOtherPlayers,
    getCoordinates: (location: Location) => incomeTokenSpot(location.x ?? 0)
  }),

  [LocationType.SpecialAction]: new CenteredListLocator({
    gap: { x: 1.2 },
    center: specialActionSpot,
    hide: hideOtherPlayers
  }),

  /**
   * The 2 fans of Stories, pushed under the top edge of the board. Like the Companions and the Objects
   * they are anchored rather than centred: the first card is pushed against the printed edge and the
   * fan climbs away from it, so a Story stays where it was laid when the next one arrives.
   */
  [LocationType.UntoldStories]: new ListLocator({
    gap: storiesGap,
    getMaxGap: (_location: Location, context: MaterialContext) => storiesMaxGap(context.rules.players.length, false),
    coordinates: untoldStoriesSpot,
    hide: hideOtherPlayers,
    getHoverTransform: cardHoverTransform
  }),

  [LocationType.ToldStories]: new ListLocator({
    gap: storiesGap,
    getMaxGap: (_location: Location, context: MaterialContext) => storiesMaxGap(context.rules.players.length, true),
    coordinates: toldStoriesSpot,
    hide: hideOtherPlayers,
    getHoverTransform: cardHoverTransform
  }),

  /** Over the board of the player being read, when they are the one the round starts on. */
  [LocationType.FirstPlayerTokenSpace]: new Locator({ coordinates: firstPlayerTokenSpot, hide: hideOtherPlayers }),

  /**
   * Each token keeps the slot its `x` gives it (a `FillGapStrategy`): the row is centred on the 3 slots,
   * not on the tokens left, so spending one leaves a hole and the others do not move.
   */
  [LocationType.BonusTokens]: new ListLocator({
    gap: bonusTokensGap,
    hide: hideOtherPlayers,
    coordinates: { x: bonusTokensSpot.x - (bonusTokensGap.x! * (getEnumValues(BonusToken).length - 1)) / 2, y: bonusTokensSpot.y }
  }),

  /** The one place of the table with an explanation of its own: see {@link VillagerReserveLocator}. */
  [LocationType.VillagerReserve]: new VillagerReserveLocator(),

  /** Coins carry no rank: they are a quantity, and they are shown as a heap rather than a row. */
  [LocationType.PlayerCoins]: new PileLocator({
    radius: playerCoinsRadius,
    maxAngle: 90,
    minimumDistance: 0.5,
    hide: hideOtherPlayers,
    coordinates: playerCoinsSpot
  }),

  /** A player holds one point token at a time: the 25 is handed back when the 75 is taken. */
  [LocationType.PlayerVpTokens]: new Locator({ coordinates: playerVpTokensSpot, hide: hideOtherPlayers })
}
