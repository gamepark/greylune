import {
  FillGapStrategy,
  hideFront,
  HiddenMaterialRules,
  HidingStrategy,
  hideItemId,
  MaterialGame,
  MaterialMove,
  PositiveSequenceStrategy,
  StackingStrategy,
  TimeLimit
} from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'
import { TheFirstStepRule } from './rules/TheFirstStepRule'

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
    [RuleId.TheFirstStep]: TheFirstStepRule
  }

  /**
   * Every pile and every row where items simply follow one another keeps a `x` sequence: it is what
   * orders a deck (the top card is the highest `x`), and what the display needs to tell two items of
   * the same location apart instead of stacking them all on its first spot. Nothing else ever has to
   * hand out a `x`, in the setup or in a rule.
   *
   * {@link FillGapStrategy} is for the places where the slots are printed and stay: the 3 Quest
   * marker spaces and the 3 Income token spaces of a personal board, and the 3 Bonus tokens. What
   * leaves one of those leaves a hole, and what comes back fills it.
   *
   * {@link StackingStrategy} is for the two shared tracks, where `x` is a value — the score, the
   * season — and several players sit on the same space as soon as they are level: it leaves `x`
   * alone and keeps a sequence on `z`, which is the rank in the pile.
   *
   * The remaining location types are deliberately absent, because what tells their spaces apart is a
   * value and not a rank: {@link LocationType.QuestTileSpace} (`id` is the {@link Distance} the
   * space lies at), {@link LocationType.VillageGrid} (a 3x3 grid, `x` and `y` are the column and the
   * row), {@link LocationType.StrengthTrack} and {@link LocationType.MagicTrack} (`x` is the level,
   * and a track is one player's own). So is {@link LocationType.PlayerCoins}, where coins are money:
   * identical pieces merge into one item with a quantity, which a sequence would prevent.
   */
  locationsStrategies = {
    [MaterialType.VillageCard]: {
      [LocationType.VillageDeck]: new PositiveSequenceStrategy(),
      [LocationType.VillageDiscard]: new PositiveSequenceStrategy(),
      [LocationType.Companions]: new PositiveSequenceStrategy(),
      [LocationType.Items]: new PositiveSequenceStrategy()
    },
    [MaterialType.EncounterCard]: {
      [LocationType.EncounterDeck]: new PositiveSequenceStrategy(),
      [LocationType.EncounterRow]: new PositiveSequenceStrategy(),
      [LocationType.EncounterDiscard]: new PositiveSequenceStrategy(),
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
      [LocationType.SpecialAction]: new PositiveSequenceStrategy()
    },
    [MaterialType.Adventurer]: {
      [LocationType.Village]: new PositiveSequenceStrategy()
    },
    [MaterialType.ScoreMarker]: {
      [LocationType.ScoreTrack]: new StackingStrategy()
    },
    [MaterialType.SeasonMarker]: {
      [LocationType.SeasonTrack]: new StackingStrategy()
    },
    [MaterialType.QuestMarker]: {
      [LocationType.QuestMarkerSpace]: new FillGapStrategy()
    },
    [MaterialType.Seal]: {
      [LocationType.SealStack]: new PositiveSequenceStrategy()
    },
    [MaterialType.IncomeToken]: {
      [LocationType.IncomeTokenStock]: new PositiveSequenceStrategy(),
      [LocationType.IncomeTokenSpace]: new FillGapStrategy()
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

  giveTime(): number {
    return 60
  }
}
