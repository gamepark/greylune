/** @jsxImportSource @emotion/react */
import { AccessoriesType, ClotheType, EyebrowType, EyeType, FacialHairType, MouthType, TopType } from '@gamepark/avataaars'
import { Area } from '@gamepark/greylune/material/Area'
import { EncounterCard, EncounterCardId } from '@gamepark/greylune/material/EncounterCard'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { VillageCard, VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { Gap } from '@gamepark/greylune/material/Village'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { VillagerActionData } from '@gamepark/greylune/rules/SummerRule'
import { Season } from '@gamepark/greylune/Season'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import {
  isCustomMoveType,
  isMoveItemType,
  isMoveItemTypeAtOnce,
  isStartRule,
  Location,
  MaterialGame,
  MaterialMove,
  MoveKind,
  XYCoordinates
} from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { IncomeIcon, QuestIcon, SeasonIcon, SpecialActionIcon, TravelIcon } from '../components/Icons'
import { eventTileSize, villageCardSize, villagerHeight } from '../locators/TableLayout'
import { BoardZone, CardZone, MainBoardZone } from '../locators/ZoneLocators'
import { helpIcons } from '../material/help/HelpLayout'
import { me, TutorialSetup, william } from './TutorialSetup'

type Step = TutorialStep<PlayerColor, MaterialType, LocationType, PlayerColor>
type Game = MaterialGame<PlayerColor, MaterialType, LocationType>
type Move = MaterialMove<PlayerColor, MaterialType, LocationType>

/** What the texts may draw: the pieces of the game (see {@link helpIcons}), bold and italics. */
const components = {
  ...helpIcons,
  bold: <strong/>,
  italic: <em/>,
  winter: <SeasonIcon season={Season.Winter}/>,
  spring: <SeasonIcon season={Season.Spring}/>,
  summer: <SeasonIcon season={Season.Summer}/>,
  autumn: <SeasonIcon season={Season.Autumn}/>,
  travel1: <TravelIcon count={1}/>,
  travel2: <TravelIcon count={2}/>,
  income: <IncomeIcon/>,
  special: <SpecialActionIcon/>,
  quest: <QuestIcon/>
}

const popup = (key: string, position?: Partial<XYCoordinates>) => ({
  text: () => <Trans i18nKey={`tuto.${key}`} components={components}/>,
  position
})

/** The 4 gaps the scenario places Villagers in: see `tutorialVillage` for the cards around them. */
const besideDorian: Gap = { x: 0.5, y: 0 }
const betweenTommyAndOak: Gap = { x: 1.5, y: 1 }
const besideGuild: Gap = { x: 0.5, y: 2 }
const besideOak: Gap = { x: 2, y: 1.5 }

/** Where the popup goes when something is focused: the top of the screen, the focus leaving room for it (see {@link below}). */
const top = { y: -28 }

/** Height of the view at the highest zoom, and of the band a popup at the {@link top} takes in it, in em of the table. */
const viewHeight = 18.6
const popupBand = 6

/**
 * The margin that zooms as much as possible on a focus `height` em tall, and lays it right under the popup at the
 * {@link top} of the screen. A small focus is held at the highest zoom: its margins only slide it up under the popup.
 * A tall one fills the height of the view, its top margin leaving just the room of the popup.
 */
const below = (height: number = villageCardSize.height, band = popupBand) => {
  const side = 0.3
  const shift = 2 * band - viewHeight + height
  const top = side + Math.max(0, shift)
  const bottom = side + Math.max(0, -shift)
  if (top + bottom + height <= viewHeight) return { top, bottom, left: side, right: side }
  return { top: (band * (height + side)) / (viewHeight - band), bottom: side, left: side, right: side }
}

/** The margin of a focus too tall to leave room above it: its popup stands beside it. */
const beside = { top: 0.3, bottom: 0.3, left: 0.3, right: 0.3 }

/**
 * The Season board fills the screen at the highest zoom, against the bottom left corner of the table: the popup
 * sits right above its 4 seasons rather than at the top of the screen.
 */
const onSeasonBoard = { margin: { top: 5, bottom: 0.5, left: 0.5, right: 0.5 }, popup: { x: -19.5, y: -11 } }

/**
 * The score track runs the whole height of the main board, against its left edge: the margin on its right leaves
 * room for the popup beside it.
 */
const scoreTrack = { margin: { top: 0.3, bottom: 0.3, left: 0.3, right: 16 }, popup: { x: 22, y: 0 } }

/** A focus with its popup on its left: the margin on its left leaves room for the popup beside it. */
const leftOfFocus = { margin: { top: 0.3, bottom: 0.3, left: 16, right: 0.3 }, popup: { x: -22, y: 0 } }

/** Every focus leaves room for its popup at the top of the screen, unless it says otherwise. */
const roomForPopup = (steps: Step[]): Step[] =>
  steps.map((step) => {
    const focus = step.focus
    return focus ? { ...step, focus: (game, context) => ({ margin: below(), ...focus(game, context) }) } : step
  })

const gapLocation = (gap: Gap): Location<PlayerColor, LocationType> => ({ type: LocationType.VillageGap, ...gap })

/** The turn is handed on as soon as the action is over: nobody has to click for it in the tutorial. */
const isEndTurn = (move: Move, game: Game) => isCustomMoveType(CustomMoveType.Pass)(move) && game.rule?.id === RuleId.EndTurn

const isItemOf =
  (...types: MaterialType[]) =>
  (move: Move) =>
    move.kind === MoveKind.ItemMove && types.includes(move.itemType)
const isCoinMove = isItemOf(MaterialType.Coin)

export class Tutorial extends MaterialTutorial<PlayerColor, MaterialType, LocationType, PlayerColor> {
  version = 1
  options = { players: [{ id: me }, { id: william }] }
  setup = new TutorialSetup()

  players = [
    { id: me },
    {
      id: william,
      name: 'William',
      avatar: {
        topType: TopType.ShortHairShortFlat,
        accessoriesType: AccessoriesType.Prescription02,
        hairColor: 'Brown',
        facialHairType: FacialHairType.Blank,
        clotheType: ClotheType.CollarSweater,
        clotheColor: 'PastelOrange',
        eyeType: EyeType.Happy,
        eyebrowType: EyebrowType.DefaultNatural,
        mouthType: MouthType.Smile,
        skinColor: 'Light'
      }
    }
  ]

  // ------------------------------------------------------------------ what the steps point at

  villageCard(game: Game, card: VillageCard) {
    return this.material(game, MaterialType.VillageCard).id<VillageCardId>((id) => id.front === card)
  }

  encounterCard(game: Game, card: EncounterCard) {
    return this.material(game, MaterialType.EncounterCard).id<EncounterCardId>((id) => id.front === card)
  }

  slotCard(game: Game, x: number, y: number) {
    return this.material(game, MaterialType.VillageCard)
      .location(LocationType.VillageGrid)
      .filter((item) => item.location.x === x && item.location.y === y)
  }

  cardZone(game: Game, card: VillageCard, zone: CardZone): Location<PlayerColor, LocationType> {
    return { type: LocationType.CardZone, parent: this.villageCard(game, card).getIndex(), id: zone }
  }

  boardZone(player: PlayerColor, zone: BoardZone): Location<PlayerColor, LocationType> {
    return { type: LocationType.BoardZone, player, id: zone }
  }

  /** The Seal lying on the Scouts guild, until William's Villager breaks it. */
  guildSeal(game: Game) {
    return this.material(game, MaterialType.Seal).location(LocationType.CardSeal).parent(this.villageCard(game, VillageCard.ScoutsGuildI).getIndex())
  }

  villagersInGap(game: Game, gap: Gap) {
    return this.material(game, MaterialType.Villager)
      .location(LocationType.VillageGap)
      .filter((item) => item.location.x === gap.x && item.location.y === gap.y)
  }

  activeVillagers(game: Game, player: PlayerColor) {
    return this.material(game, MaterialType.Villager).location(LocationType.ActiveVillagers).player(player)
  }

  seasonMarkers(game: Game) {
    return this.material(game, MaterialType.SeasonMarker)
  }

  /** The tile on top of the Event pile: the Event of the year once turned up, and the one about to be revealed in Winter. */
  eventTile(game: Game) {
    return this.material(game, MaterialType.EventTile)
      .location(LocationType.EventPile)
      .maxBy((item) => item.location.x ?? 0)
  }

  adventurer(game: Game, player: PlayerColor) {
    return this.material(game, MaterialType.Adventurer).id(player)
  }

  seasonBoard = { [MaterialType.SeasonBoard]: [{ location: { type: LocationType.SeasonBoard } }] }

  // ------------------------------------------------------------------ what the steps let through

  isPlacement(gap: Gap) {
    return (move: Move) =>
      isMoveItemType(MaterialType.Villager)(move) && move.location.type === LocationType.VillageGap && move.location.x === gap.x && move.location.y === gap.y
  }

  isSeasonChange(season: Season) {
    return (move: Move) => isMoveItemType(MaterialType.SeasonMarker)(move) && move.location.id === season
  }

  isActivation(card: VillageCard) {
    return (move: Move, game: Game) =>
      isCustomMoveType(CustomMoveType.ActivateCard)(move) &&
      this.material(game, MaterialType.VillageCard).getItem<VillageCardId>((move.data as VillagerActionData).card!).id.front === card
  }

  isEncounter(card: EncounterCard) {
    return (move: Move, game: Game) =>
      isCustomMoveType(CustomMoveType.ChooseEncounter)(move) &&
      this.material(game, MaterialType.EncounterCard).getItem<EncounterCardId>(move.data as number).id.front === card
  }

  isTravel(area: Area) {
    return (move: Move) => isMoveItemType(MaterialType.Adventurer)(move) && move.location.id === area
  }

  /** An active Villager walks onto the Event, rather than one standing in the Village. */
  isEventParticipation(move: Move, game: Game) {
    return (
      isMoveItemType(MaterialType.Villager)(move) &&
      move.location.type === LocationType.EventSpace &&
      this.material(game, MaterialType.Villager).getItem(move.itemIndex).location.type === LocationType.ActiveVillagers
    )
  }

  endTurn(player?: PlayerColor): Step {
    return { move: { player, filter: isEndTurn, auto: true } }
  }

  // ------------------------------------------------------------------ the scenario

  steps: Step[] = roomForPopup([
    { popup: popup('welcome') },
    {
      popup: popup('goal', top),
      focus: (game) => ({ materials: [this.adventurer(game, me)], margin: below(5) })
    },
    {
      popup: popup('seasons', onSeasonBoard.popup),
      focus: () => ({ staticItems: this.seasonBoard, margin: onSeasonBoard.margin })
    },
    {
      popup: popup('spring', onSeasonBoard.popup),
      focus: (game) => ({ staticItems: this.seasonBoard, materials: [this.seasonMarkers(game)], margin: onSeasonBoard.margin })
    },
    {
      popup: popup('villagers', top),
      focus: (game) => ({ materials: [this.activeVillagers(game, me)], margin: below(villagerHeight) })
    },
    {
      popup: popup('village', { x: 36, y: -28 }),
      focus: (game) => ({ materials: [this.material(game, MaterialType.VillageCard).location(LocationType.VillageGrid)], margin: beside })
    },

    // ---------------------------------------------------------------- Spring
    {
      popup: popup('place-first', top),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.Dorian), this.slotCard(game, 0, 0)],
        locations: [gapLocation(besideDorian)]
      }),
      move: { filter: this.isPlacement(besideDorian) }
    },
    this.endTurn(),
    { popup: popup('opponent-turn') },
    { move: { player: william, filter: this.isPlacement(besideGuild) } },
    this.endTurn(william),
    {
      popup: popup('place-second', top),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.Tommy), this.villageCard(game, VillageCard.RivenOak)],
        locations: [gapLocation(betweenTommyAndOak)]
      }),
      move: { filter: this.isPlacement(betweenTommyAndOak) }
    },
    this.endTurn(),
    { move: { player: william, filter: this.isPlacement(besideOak) } },
    this.endTurn(william),
    {
      popup: popup('go-summer', onSeasonBoard.popup),
      focus: (game) => ({ staticItems: this.seasonBoard, materials: [this.seasonMarkers(game).id(me)], margin: onSeasonBoard.margin }),
      move: { filter: this.isSeasonChange(Season.Summer) }
    },

    // ---------------------------------------------------------------- Summer: recruiting Dorian
    {
      popup: popup('summer', onSeasonBoard.popup),
      focus: (game) => ({ staticItems: this.seasonBoard, materials: [this.seasonMarkers(game)], margin: onSeasonBoard.margin })
    },
    {
      popup: popup('recruit', top),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.Dorian), this.villagersInGap(game, besideDorian)],
        margin: below(villageCardSize.height, 6.6)
      }),
      move: { filter: this.isActivation(VillageCard.Dorian), interrupt: isCoinMove }
    },
    {
      // The coins are interrupted before they are paid: the 8 of the start are still there.
      popup: popup('starting-coins', top),
      focus: (game) => ({ materials: [this.material(game, MaterialType.Coin).location(LocationType.PlayerCoins).player(me)], margin: below(2.3) }),
      move: { interrupt: (move) => isMoveItemType(MaterialType.Villager)(move) && move.location.type === LocationType.ActiveVillagers }
    },
    {
      popup: popup('companions', { y: -29 }),
      focus: (game) => ({ materials: [this.villageCard(game, VillageCard.Dorian)] })
    },
    {
      popup: popup('new-villager', { y: -29 }),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.Dorian)],
        locations: [this.cardZone(game, VillageCard.Dorian, CardZone.Bonus)]
      }),
      move: {}
    },
    this.endTurn(),

    // ---------------------------------------------------------------- William: the Scouts guild and the Tiger
    { move: { player: william, filter: this.isSeasonChange(Season.Summer) } },
    {
      // The guild is activated before it is pointed at: the 2 next steps zoom on it without a move in between. The
      // Seal is held on the card, and the Villager in its gap, until the step of the Seal goes on.
      move: {
        player: william,
        filter: this.isActivation(VillageCard.ScoutsGuildI),
        interrupt: (move) => isMoveItemType(MaterialType.Seal)(move) && move.location.type === LocationType.SealDiscard
      }
    },
    {
      popup: popup('opponent-guild', top),
      focus: (game) => ({ materials: [this.villageCard(game, VillageCard.ScoutsGuildI), this.guildSeal(game), this.villagersInGap(game, besideGuild)] })
    },
    {
      popup: popup('seal', top),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.ScoutsGuildI), this.guildSeal(game)]
      }),
      move: { interrupt: (move) => isStartRule(move) && move.id === RuleId.Travel }
    },
    {
      // The Camp lies against the bottom left corner of the table, where the view stops: the popup comes down to it, just above.
      popup: popup('camp', { x: -60, y: -10 }),
      focus: (game) => ({ materials: [this.material(game, MaterialType.Villager).location(LocationType.Camp)], margin: below(4) })
    },
    {
      popup: popup('opponent-travel', top),
      focus: (game) => ({ materials: [this.adventurer(game, william)], locations: [{ type: LocationType.Area, id: Area.Wand }] }),
      move: {}
    },
    { move: { player: william, filter: this.isTravel(Area.Wand) } },
    {
      // The Encounters lie against the bottom of the table, where the view stops: the popup comes down to them.
      popup: popup('opponent-encounter', { y: -30 }),
      focus: (game) => ({
        materials: [this.encounterCard(game, EncounterCard.Tiger)],
        locations: [
          { type: LocationType.Area, id: Area.Wand },
          { type: LocationType.MainBoardZone, id: MainBoardZone.WandCoin }
        ]
      })
    },
    {
      popup: popup('untold-stories', top),
      view: william,
      focus: (game) => ({
        materials: [this.encounterCard(game, EncounterCard.Tiger), this.activeVillagers(game, william)],
        locations: [this.boardZone(william, BoardZone.UntoldStories)],
        margin: { top: 3, left: 2, right: 2 }
      })
    },
    { view: william, move: { player: william, filter: this.isEncounter(EncounterCard.Tiger) } },
    { ...this.endTurn(william), view: william },

    // ---------------------------------------------------------------- the Banquet
    {
      popup: popup('banquet', top),
      focus: (game) => ({ materials: [this.eventTile(game)], margin: below(eventTileSize.height) }),
      move: { filter: (move, game) => this.isEventParticipation(move, game) },
      view: william
    },
    { move: { filter: (move) => isCustomMoveType(CustomMoveType.TakeEventOption)(move) && move.data === 0 } },
    this.endTurn(),

    // ---------------------------------------------------------------- William tells the story of the Tiger
    {
      popup: popup('opponent-tavern', top),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.RivenOak), this.villagersInGap(game, besideOak), this.villagersInGap(game, betweenTommyAndOak)],
        margin: below(8.3, 7.5)
      })
    },
    { move: { player: william, filter: this.isActivation(VillageCard.RivenOak) } },
    {
      popup: popup('tell-story', top),
      view: william,
      focus: (game) => ({
        materials: [this.encounterCard(game, EncounterCard.Tiger)],
        locations: [
          this.boardZone(william, BoardZone.UntoldStories),
          this.boardZone(william, BoardZone.ToldStories)
        ],
        margin: below(8.5)
      })
    },
    { view: william, move: { player: william, filter: (move) => isMoveItemType(MaterialType.EncounterCard)(move) && move.location.type === LocationType.ToldStories } },
    {
      view: william,
      move: {
        player: william,
        filter: (move, game) => isCustomMoveType(CustomMoveType.Pass)(move) && game.rule?.id === RuleId.TellStory,
        interrupt: (move) => isStartRule(move) && move.id === RuleId.ResolveEffects
      }
    },
    {
      // The rewards are interrupted before they are paid: the popup announces them.
      popup: popup('tavern-rewards', top),
      view: william,
      focus: (game) => ({ materials: [this.villageCard(game, VillageCard.RivenOak)] }),
      move: { interrupt: isMoveItemType(MaterialType.StrengthMarker) }
    },
    {
      // The Force is interrupted before it is gained: the popup announces the marker going up.
      popup: popup('force', top),
      view: william,
      focus: (game) => ({
        materials: [this.material(game, MaterialType.StrengthMarker).player(william), this.material(game, MaterialType.MagicMarker).player(william)],
        locations: [this.boardZone(william, BoardZone.Skills)],
        margin: below(10.9)
      }),
      move: {}
    },
    {
      popup: popup('skills-score', top),
      view: william,
      focus: () => ({ locations: [this.boardZone(william, BoardZone.Skills)], margin: below(10.9, 7) })
    },
    this.endTurn(william),

    // ---------------------------------------------------------------- buying Tommy
    {
      popup: popup('villager-actions', top),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.Tommy), this.villageCard(game, VillageCard.RivenOak), this.villagersInGap(game, betweenTommyAndOak)],
        margin: below(villageCardSize.height, 7.8)
      })
    },
    {
      popup: popup('buy-tommy', top),
      focus: (game) => ({ materials: [this.villageCard(game, VillageCard.Tommy), this.villagersInGap(game, betweenTommyAndOak)] }),
      move: { filter: this.isActivation(VillageCard.Tommy) }
    },
    {
      popup: popup('reaction', top),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.Dorian)],
        locations: [this.cardZone(game, VillageCard.Dorian, CardZone.Reaction)]
      }),
      move: { filter: isCustomMoveType(CustomMoveType.UseReaction), interrupt: isMoveItemType(MaterialType.ScoreMarker) }
    },
    {
      // The points of the release are interrupted before they are scored: the popup announces the marker going up.
      // The whole track is too tall for the popup above it: the track fills the height of the view, the popup at its right.
      popup: popup('score-track', scoreTrack.popup),
      focus: (game) => ({
        materials: [this.material(game, MaterialType.ScoreMarker).id(me)],
        locations: [{ type: LocationType.MainBoardZone, id: MainBoardZone.ScoreTrack }],
        margin: scoreTrack.margin
      }),
      move: {}
    },
    {
      // The Bonus tokens lie in the bottom right corner of the table, where the view stops: the popup comes to them.
      popup: popup('bonus-tokens', { x: 58, y: -15 }),
      focus: (game) => ({ materials: [this.material(game, MaterialType.BonusToken).player(me)], margin: below(2) })
    },
    {
      popup: popup('items', top),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.Tommy), this.villageCard(game, VillageCard.Dorian)],
        locations: [this.cardZone(game, VillageCard.Dorian, CardZone.Permanent), this.cardZone(game, VillageCard.Dorian, CardZone.CompanionScore)]
      })
    },
    {
      // Tommy lies against the right edge of the table, where the view stops: the popup comes above it.
      popup: popup('tommy-score', { x: 50, y: -10 }),
      focus: (game) => ({
        materials: [this.villageCard(game, VillageCard.Tommy)],
        locations: [this.cardZone(game, VillageCard.Tommy, CardZone.ItemScore)]
      })
    },
    this.endTurn(),

    // ---------------------------------------------------------------- William at the Banquet
    { move: { player: william, filter: (move, game) => this.isEventParticipation(move, game) } },
    { move: { player: william, filter: (move) => isCustomMoveType(CustomMoveType.TakeEventOption)(move) && move.data === 0 } },
    this.endTurn(william),
    {
      popup: popup('opponent-banquet', top),
      focus: (game) => ({
        materials: [this.eventTile(game), this.material(game, MaterialType.Villager).location(LocationType.EventSpace)],
        margin: below(eventTileSize.height)
      })
    },

    // ---------------------------------------------------------------- the special action, and Tommy
    {
      popup: popup('special-action', leftOfFocus.popup),
      focus: () => ({ locations: [this.boardZone(me, BoardZone.SpecialAction)], margin: leftOfFocus.margin })
    },
    {
      popup: popup('use-tommy', top),
      focus: (game) => ({ materials: [this.villageCard(game, VillageCard.Tommy), this.activeVillagers(game, me)], margin: below(8.2) }),
      move: { filter: (move) => isCustomMoveType(CustomMoveType.UseItem)(move) && (move.data as { ability: number }).ability === 1 }
    },
    {
      popup: popup('travel', top),
      focus: (game) => ({ materials: [this.adventurer(game, me)], locations: [{ type: LocationType.Area, id: Area.Bow }] }),
      move: { filter: this.isTravel(Area.Bow) }
    },
    {
      popup: popup('sheep', top),
      focus: (game) => ({
        materials: [
          this.encounterCard(game, EncounterCard.Sheep),
          this.material(game, MaterialType.IncomeToken).location(LocationType.CardIncome).parent(this.encounterCard(game, EncounterCard.Sheep).getIndex())
        ],
        locations: [{ type: LocationType.Area, id: Area.Bow }],
        margin: below(undefined, popupBand + 1)
      }),
      move: { filter: this.isEncounter(EncounterCard.Sheep) }
    },
    {
      popup: popup('income-token', top),
      focus: (game) => ({ materials: [this.material(game, MaterialType.IncomeToken).player(me)], margin: below(2.2) })
    },
    this.endTurn(),

    // ---------------------------------------------------------------- Autumn
    {
      popup: popup('opponent-autumn', onSeasonBoard.popup),
      focus: (game) => ({ staticItems: this.seasonBoard, materials: [this.seasonMarkers(game).id(william)], margin: onSeasonBoard.margin })
    },
    { move: { player: william, filter: this.isSeasonChange(Season.Autumn) } },
    this.endTurn(william),
    {
      popup: popup('autumn', onSeasonBoard.popup),
      focus: (game) => ({ staticItems: this.seasonBoard, materials: [this.seasonMarkers(game).id(me)], margin: onSeasonBoard.margin }),
      move: { filter: this.isSeasonChange(Season.Autumn), interrupt: () => true }
    },
    // Every consequence of Autumn is held back, and nothing is focused: the whole table is seen coming home when the popup is closed.
    // The income is held back again, for the next popup to announce.
    { popup: popup('come-home'), move: { interrupt: isCoinMove } },
    {
      popup: popup('income', top),
      focus: (game) => ({
        materials: [this.material(game, MaterialType.IncomeToken).player(me)],
        locations: [this.boardZone(me, BoardZone.Income)],
        margin: below(8.9)
      }),
      move: {}
    },
    {
      // A text of 2 paragraphs: the popup stands higher than the others of the Season board, not to overlap it.
      popup: popup('end-of-year', { ...onSeasonBoard.popup, y: onSeasonBoard.popup.y - 2 }),
      focus: (game) => ({ staticItems: this.seasonBoard, materials: [this.seasonMarkers(game)], margin: onSeasonBoard.margin })
    },
    {
      move: {
        filter: isEndTurn,
        auto: true,
        // Winter is interrupted before the past year is put away: each of its popups announces what is about to
        // happen, and lets it out when it is closed.
        interrupt: (move) => isStartRule(move) && move.id === RuleId.Winter
      }
    },

    // ---------------------------------------------------------------- Winter
    {
      popup: popup('new-village', { x: 36, y: -28 }),
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.VillageCard).location(LocationType.VillageGrid),
          this.material(game, MaterialType.VillageCard).location(LocationType.VillageDeck)
        ],
        margin: beside
      }),
      // Interrupted before the tile of the past year is taken off the pile.
      move: { interrupt: isItemOf(MaterialType.EventTile) }
    },
    {
      popup: popup('new-event', top),
      focus: (game) => ({ materials: [this.eventTile(game)], margin: below(eventTileSize.height) }),
      // Interrupted before the Encounters of the past year, and their Income tokens, are put away.
      move: { interrupt: isItemOf(MaterialType.IncomeToken, MaterialType.EncounterCard) }
    },
    {
      popup: popup('new-encounters', leftOfFocus.popup),
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.EncounterCard).location(LocationType.EncounterRow),
          this.material(game, MaterialType.EncounterCard).location(LocationType.EncounterDeck)
        ],
        margin: leftOfFocus.margin
      }),
      move: { interrupt: isMoveItemTypeAtOnce(MaterialType.SeasonMarker) }
    },
    {
      popup: popup('new-year', onSeasonBoard.popup),
      focus: (game) => ({ staticItems: this.seasonBoard, materials: [this.seasonMarkers(game)], margin: onSeasonBoard.margin }),
      move: {}
    },
    {
      popup: popup('periods', { x: 20, y: -28 }),
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.VillageCard).location(LocationType.VillageDeck),
          this.material(game, MaterialType.EncounterCard).location(LocationType.EncounterDeck)
        ],
        margin: below(43.3)
      })
    },
    {
      popup: popup('quests', { x: leftOfFocus.popup.x, y: 18 }),
      focus: (game) => ({ materials: [this.material(game, MaterialType.QuestTile)], margin: leftOfFocus.margin })
    },
    {
      popup: popup('first-quest', { x: leftOfFocus.popup.x, y: 18 }),
      focus: () => ({
        locations: [MainBoardZone.HammerQuestRewards, MainBoardZone.SwordsQuestRewards, MainBoardZone.EdgeQuestRewards].map((id) => ({
          type: LocationType.MainBoardZone,
          id
        })),
        margin: leftOfFocus.margin
      })
    },
    { popup: popup('final-score') },
    { popup: popup('good-luck') }
  ])
}
