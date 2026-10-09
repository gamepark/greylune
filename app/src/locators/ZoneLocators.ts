import { Area } from '@gamepark/greylune/material/Area'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { HeroicQuestArea } from '@gamepark/greylune/material/QuestTile'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ComponentSize, LocationDescription, Locator } from '@gamepark/react-game'
import { Location, MaterialItem, XYCoordinates } from '@gamepark/rules-api'
import { mainBoardSize, playerBoardSize, questRewardSpots, questRewardSpotsGap, villageCardSize } from './TableLayout'

/**
 * The parts of a Village card a sentence can point at. They are printed in the same place on every
 * card of a type, except the points a card scores: a Companion prints them in the banner down its left
 * edge, an Object in its bottom left corner.
 */
export enum CardZone {
  /** The coin in the top left corner: what the card costs to take. */
  Cost = 1,
  /** The top right corner, where what the card gives the moment it is taken is printed. */
  Bonus,
  /** The banner of a Companion, under its cost: its permanent ability. */
  Permanent,
  /** The bottom of a Companion: what triggers its reaction, then the tilt arrow and what the reaction does. */
  Reaction,
  CompanionScore,
  ItemScore
}

/** The parts of the personal board a sentence can point at. */
export enum BoardZone {
  /** The open hand: 3 coins less one per Companion, and the 3 slots of the Income tokens under it. */
  Income = 1,
  /** The Force and Magic tracks, with the points they score at 3 and 5 printed between them. */
  Skills,
  /** The house the special action is taken in, with its 3 options printed under it. */
  SpecialAction,
  /** The top of the Encounters pushed under the top left edge of the board, which are the stories not told yet, down to the book printed under them. */
  UntoldStories,
  /** The same under the top right edge: the stories told. */
  ToldStories
}

/** The parts of the main board a sentence can point at. */
export enum MainBoardZone {
  /** The coin on the banner of the Wand: what an Adventurer standing there may take instead of an Encounter. */
  WandCoin = 1,
  /** The score track, both columns: 0 to 12 up the left one, 13 to 24 down the right one. */
  ScoreTrack,
  /** The 2 medals under each Heroic Quest space, where the markers of the players who achieved it go. */
  HammerQuestRewards,
  SwordsQuestRewards,
  EdgeQuestRewards
}

/** `borderRadius` in em, where the default 0.5 rounds the corners too much. */
type Zone = XYCoordinates & ComponentSize & { borderRadius?: number }

/** In em on the card, which is {@link villageCardSize} on a side: the middle of the zone, and its size. */
const cardZones: Record<CardZone, Zone> = {
  [CardZone.Cost]: { x: 0.72, y: 2.18, width: 1.25, height: 1.25 },
  [CardZone.Bonus]: { x: 6.3, y: 0.72, width: 1.05, height: 1.3 },
  [CardZone.Permanent]: { x: 2.03, y: 3.64, width: 0.92, height: 2.12, borderRadius: 0.15 },
  [CardZone.Reaction]: { x: 3.8, y: 6.34, width: 4.4, height: 1, borderRadius: 0.2 },
  [CardZone.CompanionScore]: { x: 0.985, y: 5.815, width: 1.1, height: 2, borderRadius: 0.15 },
  [CardZone.ItemScore]: { x: 0.935, y: 6.37, width: 0.97, height: 0.74, borderRadius: 0.15 }
}

/** In em on the personal board, which is {@link playerBoardSize}, shadow included. */
const boardZones: Record<BoardZone, Zone> = {
  [BoardZone.Income]: { x: 4.95, y: 7.2, width: 3.4, height: 8.9 },
  [BoardZone.Skills]: { x: 9.37, y: 7, width: 5, height: 10.9 },
  [BoardZone.SpecialAction]: { x: 13.9, y: 4.725, width: 4.7, height: 4.05 },
  [BoardZone.UntoldStories]: { x: 5.34, y: 0.9, width: 5.6, height: 3.6 },
  [BoardZone.ToldStories]: { x: 13.44, y: 0.9, width: 5.6, height: 3.6 }
}

/** In em on the main board, which is {@link mainBoardSize}. */
/**
 * Both medals of a Quest, side by side, and the plaque above them printing the points they give: a
 * medal is a little narrower than the gap between them, and the plaque runs from the Quest space down
 * to the medals. The infinity symbol under the right medal tells it takes every player after the first.
 */
const questRewardMedal = 1.6
const questRewardPlaque = 1.4
const questRewardInfinity = 0.8
const questRewardsZone = (area: HeroicQuestArea): Zone => ({
  x: questRewardSpots[area].x + questRewardSpotsGap / 2,
  y: questRewardSpots[area].y + (questRewardInfinity - questRewardPlaque) / 2,
  width: questRewardSpotsGap + questRewardMedal,
  height: questRewardPlaque + questRewardMedal + questRewardInfinity,
  borderRadius: 0.3
})

const mainBoardZones: Record<MainBoardZone, Zone> = {
  [MainBoardZone.WandCoin]: { x: 14.58, y: 23.87, width: 1, height: 1 },
  [MainBoardZone.ScoreTrack]: { x: 2.5, y: 12.25, width: 3.8, height: 23.6, borderRadius: 0.3 },
  [MainBoardZone.HammerQuestRewards]: questRewardsZone(Area.Hammer),
  [MainBoardZone.SwordsQuestRewards]: questRewardsZone(Area.Swords),
  [MainBoardZone.EdgeQuestRewards]: questRewardsZone(Area.Edge)
}

class ZoneDescription extends LocationDescription<PlayerColor, MaterialType, LocationType> {
  borderRadius = 0.5

  constructor(private zones: Record<number, Zone>) {
    super()
  }

  getLocationSize(location: Location<PlayerColor, LocationType>): ComponentSize {
    const { width, height } = this.zones[location.id as number]
    return { width, height }
  }

  getBorderRadius(id: number): number {
    return this.zones[id].borderRadius ?? this.borderRadius
  }
}

/** In percent of a parent item of the given size, as {@link Locator.getPositionOnParent} expects it. */
const onParent = ({ x, y }: XYCoordinates, size: ComponentSize): XYCoordinates => ({ x: (x / size.width) * 100, y: (y / size.height) * 100 })

/** A part of a card, drawn over the card wherever it lies: in the Village, or beside a personal board. */
export class CardZoneLocator extends Locator<PlayerColor, MaterialType, LocationType> {
  parentItemType = MaterialType.VillageCard
  locationDescription = new ZoneDescription(cardZones)

  getPositionOnParent(location: Location<PlayerColor, LocationType>): XYCoordinates {
    return onParent(cardZones[location.id as CardZone], villageCardSize)
  }
}

/** A part of the personal board of `player`, drawn on that board. */
export class BoardZoneLocator extends Locator<PlayerColor, MaterialType, LocationType> {
  parentItemType = MaterialType.PlayerBoard
  locationDescription = new ZoneDescription(boardZones)

  /** The boards are static items, one per player: the zone lies on its player's. */
  getParentItem(location: Location<PlayerColor, LocationType>): MaterialItem<PlayerColor, LocationType> {
    return { location: { type: LocationType.PlayerBoard, player: location.player } }
  }

  getPositionOnParent(location: Location<PlayerColor, LocationType>): XYCoordinates {
    return onParent(boardZones[location.id as BoardZone], playerBoardSize)
  }
}

/** A part of the main board, the static item of its type. */
export class MainBoardZoneLocator extends Locator<PlayerColor, MaterialType, LocationType> {
  parentItemType = MaterialType.MainBoard
  locationDescription = new ZoneDescription(mainBoardZones)

  getPositionOnParent(location: Location<PlayerColor, LocationType>): XYCoordinates {
    return onParent(mainBoardZones[location.id as MainBoardZone], mainBoardSize)
  }
}
