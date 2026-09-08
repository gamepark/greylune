import {
  FillGapStrategy,
  hideFront,
  HiddenMaterialRules,
  HidingStrategy,
  hideItemId,
  isStartRule,
  MaterialGame,
  MaterialMove,
  PositiveSequenceStrategy,
  StackingStrategy,
  TimeLimit
} from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { finalScore } from './material/PlayerState'
import { PlayerColor } from './PlayerColor'
import { ActivateCardRule } from './rules/ActivateCardRule'
import { AutumnRule } from './rules/AutumnRule'
import { BonusTokenRule } from './rules/BonusTokenRule'
import { ChooseSkillRule } from './rules/ChooseSkillRule'
import { DiscardItemRule } from './rules/DiscardItemRule'
import { EventRule } from './rules/EventRule'
import { PlaceVillagerRule } from './rules/PlaceVillagerRule'
import { ReactionRule } from './rules/ReactionRule'
import { ResolveEffectsRule } from './rules/ResolveEffectsRule'
import { ResolveEncounterRule } from './rules/ResolveEncounterRule'
import { ResolveQuestRule } from './rules/ResolveQuestRule'
import { RuleId } from './rules/RuleId'
import { SpringRule } from './rules/SpringRule'
import { StraightenCardRule } from './rules/StraightenCardRule'
import { SummerRule } from './rules/SummerRule'
import { TellStoryRule } from './rules/TellStoryRule'
import { TravelRule } from './rules/TravelRule'
import { UseItemRule } from './rules/UseItemRule'
import { WinterRule } from './rules/WinterRule'

/**
 * The Event tile of the current year is the one on top of the pile, turned face up: nothing is moved
 * to reveal an Event, the tile is simply rotated where it lies, and the years to come stay face down
 * underneath it.
 */
const hideEventTile: HidingStrategy<PlayerColor, LocationType> = (item) => (item.location.rotation ? [] : hideItemId(item))

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class GreyluneRules
  extends HiddenMaterialRules<PlayerColor, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<PlayerColor, MaterialType, LocationType>, MaterialMove<PlayerColor, MaterialType, LocationType>, PlayerColor>
{
  rules = {
    [RuleId.Winter]: WinterRule,
    [RuleId.Spring]: SpringRule,
    [RuleId.Summer]: SummerRule,
    [RuleId.Autumn]: AutumnRule,
    [RuleId.ActivateCard]: ActivateCardRule,
    [RuleId.UseItem]: UseItemRule,
    [RuleId.DiscardItem]: DiscardItemRule,
    [RuleId.Event]: EventRule,
    [RuleId.Travel]: TravelRule,
    [RuleId.ResolveEncounter]: ResolveEncounterRule,
    [RuleId.ResolveQuest]: ResolveQuestRule,
    [RuleId.TellStory]: TellStoryRule,
    [RuleId.StraightenCard]: StraightenCardRule,
    [RuleId.PlaceVillager]: PlaceVillagerRule,
    [RuleId.ChooseSkill]: ChooseSkillRule,
    [RuleId.BonusToken]: BonusTokenRule,
    [RuleId.Reaction]: ReactionRule,
    [RuleId.ResolveEffects]: ResolveEffectsRule
  }

  /**
   * Every pile and every row where items simply follow one another keeps a `x` sequence: it is what
   * orders a deck (the top card is the highest `x`), and what the display needs to tell two items of
   * the same location apart instead of stacking them all on its first spot. Nothing else ever has to
   * hand out a `x`, in the setup or in a rule.
   *
   * {@link FillGapStrategy} is for the places where the slots are printed and stay: the 3 Quest
   * marker spaces of a personal board. What leaves one of those leaves a hole, and what comes back
   * fills it.
   *
   * A strategy is only ever handed the items of one area — same `id`, same `player`, same `parent`.
   * {@link StackingStrategy} is what is left when `x` or `y` still names a space inside that area and
   * several items may share it: it leaves them alone and keeps a sequence on `z`, the rank in the
   * pile. That is the score track and the season track (`x` is the value, and everybody's markers
   * lie on one board), the shields of a Quest (`x` tells the first player's from the shared one), the
   * {@link LocationType.VillageGap}, where `x` and `y` name the gap and any number of Villagers stand
   * in it, and the {@link LocationType.EventSpace}, where `x` names one of the Festival's printed
   * spaces and, on every other tile, nothing at all: the Villagers of all the players share its
   * middle. {@link LocationType.Area} is the same pile without the `x`,
   * so the sequence on `z` is enough on its own.
   *
   * A place that never holds two items at once needs no strategy at all, and has none: the special
   * action space takes one Villager per player per year, and an Encounter card carries a single
   * Income token.
   *
   * The remaining location types are deliberately absent, because what tells their spaces apart is a
   * value and not a rank: {@link LocationType.QuestTileSpace} (`id` is the {@link Area} the
   * space lies at), {@link LocationType.VillageGrid} (a 3x3 grid, `x` and `y` are the column and the
   * row), {@link LocationType.StrengthTrack} and {@link LocationType.MagicTrack} (`x` is the level,
   * and a track is one player's own). So is {@link LocationType.PlayerCoins}, where coins are money:
   * identical pieces merge into one item with a quantity, which a sequence would prevent.
   */
  locationsStrategies = {
    [MaterialType.VillageCard]: {
      [LocationType.VillageDeck]: new PositiveSequenceStrategy(),
      [LocationType.Companions]: new PositiveSequenceStrategy(),
      [LocationType.Items]: new PositiveSequenceStrategy()
    },
    [MaterialType.EncounterCard]: {
      [LocationType.EncounterDeck]: new PositiveSequenceStrategy(),
      [LocationType.EncounterRow]: new PositiveSequenceStrategy(),
      [LocationType.UntoldStories]: new PositiveSequenceStrategy(),
      [LocationType.ToldStories]: new PositiveSequenceStrategy()
    },
    [MaterialType.EventTile]: {
      [LocationType.EventPile]: new PositiveSequenceStrategy()
    },
    [MaterialType.Villager]: {
      [LocationType.ActiveVillagers]: new PositiveSequenceStrategy(),
      [LocationType.VillagerReserve]: new PositiveSequenceStrategy(),
      [LocationType.Camp]: new PositiveSequenceStrategy(),
      [LocationType.VillageGap]: new StackingStrategy(),
      [LocationType.EventSpace]: new StackingStrategy()
    },
    [MaterialType.Adventurer]: {
      [LocationType.Area]: new PositiveSequenceStrategy()
    },
    [MaterialType.ScoreMarker]: {
      [LocationType.ScoreTrack]: new StackingStrategy()
    },
    [MaterialType.SeasonMarker]: {
      [LocationType.SeasonTrack]: new StackingStrategy()
    },
    [MaterialType.QuestMarker]: {
      [LocationType.QuestMarkerSpace]: new FillGapStrategy(),
      [LocationType.QuestRewardSpace]: new StackingStrategy()
    },
    [MaterialType.Seal]: {
      [LocationType.SealStack]: new PositiveSequenceStrategy(),
      [LocationType.SealDiscard]: new PositiveSequenceStrategy(),
      [LocationType.CardSeal]: new FillGapStrategy()
    },
    [MaterialType.IncomeToken]: {
      [LocationType.IncomeTokenStock]: new PositiveSequenceStrategy(),
      [LocationType.IncomeTokenSpace]: new PositiveSequenceStrategy()
    },
    [MaterialType.BonusToken]: {
      [LocationType.BonusTokens]: new FillGapStrategy()
    },
    [MaterialType.VpToken]: {
      [LocationType.VpTokenStack]: new PositiveSequenceStrategy(),
      [LocationType.PlayerVpTokens]: new PositiveSequenceStrategy()
    }
  }

  /**
   * Cards in a deck keep `id.back`, their period: the 3 deck covers differ, and which period is
   * coming next is public information.
   */
  hidingStrategies = {
    [MaterialType.VillageCard]: { [LocationType.VillageDeck]: hideFront },
    [MaterialType.EncounterCard]: { [LocationType.EncounterDeck]: hideFront },
    [MaterialType.EventTile]: { [LocationType.EventPile]: hideEventTile },
    [MaterialType.Seal]: { [LocationType.SealStack]: hideItemId }
  }

  /**
   * Winter reads the faces of the two decks to lay the new year out — which row an Encounter belongs
   * in, and how many Seals a Village card was drawn with. No client can see those faces, so none of
   * them can play the turn of the year on its own: it waits for the server's answer.
   */
  isUnpredictableMove(move: MaterialMove<PlayerColor, MaterialType, LocationType, RuleId>, player: PlayerColor): boolean {
    return (isStartRule(move) && move.id === RuleId.Winter) || super.isUnpredictableMove(move, player)
  }

  /**
   * Everything a player is worth at the end of the 5th year: the points scored along the way, then
   * the Heroic Quests, the Companions, the Objects and the two skill tracks (rulebook p.13).
   */
  getScore(player: PlayerColor): number {
    return finalScore(this, player)
  }

  giveTime(): number {
    return 60
  }
}
