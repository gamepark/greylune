import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { getVillagerPlayer, Villager } from '@gamepark/greylune/material/Villager'
import { Memory } from '@gamepark/greylune/Memory'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { ChooseAbilityData } from '@gamepark/greylune/rules/ActivateCardRule'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { finalScoring } from '@gamepark/greylune/rules/FinalScoringRule'
import { GreyluneMove } from '@gamepark/greylune/rules/GreyluneRule'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { LogDescription, MoveComponentContext, MovePlayedLogDescription } from '@gamepark/react-game'
import { CustomMove, isCreateItemType, isCustomMove, isDeleteItemType, isMoveItemType, isStartRule, MaterialGame, MoveItem } from '@gamepark/rules-api'
import { playerLogCss, tableLogCss } from './logCss'
import { coinRow, isScoreMove, scoreOwner, VillagerRow, villagerRow } from './logRows'
import { previousMove } from './moveRuns'
import { EncounterLog, IncomeTokenLog, NoEncounterLog, QuestLog, SkipEncounterLog, StayLog, TellStoryLog, TravelLog } from './log/AdventureLogs'
import {
  BonusTokenLog,
  CoinRowLog,
  DiscardItemLog,
  GainCoinsLog,
  GainVillagersLog,
  GainVpLog,
  ReactionLog,
  ReturnVillagersLog,
  SealLog,
  SealValueLog,
  SkillLog,
  SpendVillagersLog,
  StraightenLog
} from './log/GainLogs'
import { ActivateCardLog, CoinsAroundLog, EventLog, PlaceVillagerLog, SeasonLog, SpecialActionLog, UseItemLog } from './log/TurnLogs'
import { EventRevealLog, FirstPlayerLog, NewYearLog, ScoringLog, ScorePointsLog } from './log/YearLogs'

type Game = MaterialGame<PlayerColor, MaterialType, LocationType, RuleId>
type Context = MoveComponentContext<GreyluneMove, PlayerColor, Game>
type Entry = MovePlayedLogDescription

/**
 * What the journal writes down, move by move.
 *
 * Every entry is read off the move and off the state it was played on, and never off anything kept for
 * the journal: the rules write nothing for it, so a rule that changes cannot leave a journal saying
 * what the game no longer does.
 *
 * Two levels, and only two. What a player does with their turn stands on the left with their avatar —
 * a Villager placed, a card activated, a season changed — and everything it came to is indented under
 * it: the coins and the points, the Force spent, the road walked and the Encounter met at the end of it.
 * So a year reads as the handful of decisions it is made of.
 *
 * A decision that only says which of the options was taken is left out when what follows says it
 * better: the option of an Event, of a Building or of the special action is the coins, the points or
 * the road written down right under it. So is whatever only puts back what the season rules put back
 * on their own — the Villagers going home in Autumn, the cards standing up, the tokens of a year put
 * away. A season marker moving, or a year opening, is written down instead.
 */
export class GreyluneHistory implements LogDescription<GreyluneMove, PlayerColor, Game> {
  getMovePlayedLogDescription(move: GreyluneMove, context: Context): Entry | undefined {
    const game = context.game
    const rules = new GreyluneRules(game)
    const ruleId = game.rule?.id
    const player = game.rule?.player

    if (isStartRule(move)) {
      if (move.id === RuleId.Winter) return this.table(NewYearLog)
      if (finalScoring.some((count) => count.rule === move.id)) return this.table(ScoringLog)
      return undefined
    }

    if (isCustomMove(move)) return this.customMove(move, ruleId, player)

    if (isMoveItemType(MaterialType.Villager)(move)) return this.villagerMove(move, context, rules)

    if (isMoveItemType(MaterialType.SeasonMarker)(move)) {
      const season = move.location.id as Season
      if (season !== Season.Summer && season !== Season.Autumn) return undefined
      return this.entry(SeasonLog, rules.material(MaterialType.SeasonMarker).getItem<PlayerColor>(move.itemIndex).id)
    }

    if (isMoveItemType(MaterialType.StrengthMarker)(move) || isMoveItemType(MaterialType.MagicMarker)(move)) {
      const marker = rules.material(move.itemType).getItem(move.itemIndex)
      if (marker.location.x === move.location.x) return undefined
      return this.entry(SkillLog, marker.location.player, 1)
    }

    // The Adventurer coming home in Autumn is one of the things Autumn does: the season says it.
    if (isMoveItemType(MaterialType.Adventurer)(move)) return ruleId === RuleId.Travel ? this.entry(TravelLog, player, 1) : undefined

    if (isMoveItemType(MaterialType.EncounterCard)(move)) {
      // A card leaving the row is written down as it is named (see ChooseEncounter): here it only slides under the board.
      return move.location.type === LocationType.ToldStories ? this.entry(TellStoryLog, move.location.player, 1) : undefined
    }

    if (isMoveItemType(MaterialType.IncomeToken)(move) && move.location.type === LocationType.IncomeTokenSpace) {
      return this.entry(IncomeTokenLog, move.location.player, 1)
    }

    // A Seal spent on a card being activated; the Seals of a year put away go in one move, and say nothing.
    if (isMoveItemType(MaterialType.Seal)(move) && move.location.type === LocationType.SealDiscard && ruleId === RuleId.ActivateCard) {
      return this.entry(SealLog, player, 1)
    }

    if (isMoveItemType(MaterialType.VillageCard)(move)) return this.villageCardMove(move, rules, ruleId)

    if (isMoveItemType(MaterialType.EventTile)(move)) {
      return ruleId === RuleId.Winter && move.location.rotation === true ? this.table(EventRevealLog, 1) : undefined
    }

    if (isMoveItemType(MaterialType.FirstPlayerToken)(move)) return this.entry(FirstPlayerLog, move.location.player, 1)

    // The only Village cards that are deleted by a choice: an Object given up. A Potion emptied, or a
    // card nobody took at the end of a year, is the other half of a move already written down.
    if (isDeleteItemType(MaterialType.VillageCard)(move)) {
      if (ruleId !== RuleId.DiscardItem) return undefined
      return this.entry(DiscardItemLog, rules.material(MaterialType.VillageCard).getItem(move.itemIndex).location.player, 1)
    }

    // The Bonus token picked. When 2 were left, the other goes back in the box with it, unresolved: that
    // is a consequence, and says nothing.
    if (isDeleteItemType(MaterialType.BonusToken)(move)) {
      if (context.consequenceIndex !== undefined) return undefined
      return this.entry(BonusTokenLog, rules.material(MaterialType.BonusToken).getItem(move.itemIndex).location.player, 1)
    }

    if (isCreateItemType(MaterialType.Coin)(move) || isDeleteItemType(MaterialType.Coin)(move)) return this.coinMove(move, context, rules)

    if (finalScoring.some((count) => count.rule === ruleId) && isScoreMove(move)) {
      const owner = scoreOwner(move, rules)
      const previous = previousMove(context)
      if (previous !== undefined && isScoreMove(previous) && scoreOwner(previous, rules) === owner) return undefined
      return this.entry(ScorePointsLog, owner, 1)
    }

    return undefined
  }

  /**
   * The decisions that move nothing, or more than one thing. Those that only name the option taken
   * are left to what follows them (see above); an amount of 0 is no gain.
   */
  private customMove(move: CustomMove, ruleId?: RuleId, player?: PlayerColor): Entry | undefined {
    switch (move.type) {
      case CustomMoveType.GainCoins:
        return move.data ? this.entry(GainCoinsLog, player, 1) : undefined
      case CustomMoveType.GainVp:
        return move.data ? this.entry(GainVpLog, player, 1) : undefined
      case CustomMoveType.GainCoinsAround:
        return this.entry(CoinsAroundLog, player)
      case CustomMoveType.ActivateCard:
        return this.entry(ActivateCardLog, player)
      case CustomMoveType.UseItem:
        return this.entry(UseItemLog, player)
      // Selia names the value of the Seal: nothing on the table says it, the token being in the discard.
      case CustomMoveType.ChooseAbility:
        return (move.data as ChooseAbilityData).value !== undefined ? this.entry(SealValueLog, player, 1) : undefined
      case CustomMoveType.ChooseEncounter:
        return this.entry(EncounterLog, player, 1)
      case CustomMoveType.SkipEncounter:
        return this.entry(SkipEncounterLog, player, 1)
      case CustomMoveType.ResolveQuest:
        return this.entry(QuestLog, player, 1)
      case CustomMoveType.UseReaction:
        return this.entry(ReactionLog, player, 1)
      case CustomMoveType.Pass:
        // Closing a story, a reaction window or a turn says nothing the entries around it do not.
        if (ruleId === RuleId.Travel) return this.entry(StayLog, player, 1)
        if (ruleId === RuleId.ResolveEncounter) return this.entry(NoEncounterLog, player, 1)
        return undefined
      default:
        return undefined
    }
  }

  /**
   * Whose a Villager is, is sculpted into it (see {@link Villager}). A Villager placed in Spring, walked
   * onto the Event or put on the special action is what a player spends their turn on; one placed by an
   * effect, or gained, spent or given back, is what an action came to. Those that come and go in rows
   * are written down once, on the first of the row (see {@link previousMove}).
   */
  private villagerMove(move: MoveItem<PlayerColor, MaterialType, LocationType>, context: Context, rules: GreyluneRules): Entry | undefined {
    const villager = rules.material(MaterialType.Villager).getItem<Villager>(move.itemIndex)
    const owner = getVillagerPlayer(villager.id)
    switch (move.location.type) {
      case LocationType.VillageGap:
        return this.entry(PlaceVillagerLog, owner, rules.game.rule?.id === RuleId.Spring ? 0 : 1)
      case LocationType.EventSpace:
        // The Festival's space is the option taken: what it gives is written down under the Villager walking on.
        return move.location.x === undefined ? this.entry(EventLog, owner) : undefined
      case LocationType.SpecialAction:
        return this.entry(SpecialActionLog, owner)
    }
    const row = villagerRow(villager.location.type, move.location.type)
    if (row === undefined) return undefined
    return isInRow(move, previousMove(context), rules) ? undefined : this.entry(villagerRowLogs[row], owner, 1)
  }

  /**
   * A card standing back up. Autumn stands them all up, and says so itself; anything else is an effect
   * the player chose — Isandre, or a card that straightens another one.
   */
  private villageCardMove(move: MoveItem<PlayerColor, MaterialType, LocationType>, rules: GreyluneRules, ruleId?: RuleId): Entry | undefined {
    const card = rules.material(MaterialType.VillageCard).getItem(move.itemIndex)
    if (ruleId === RuleId.Autumn || card.location.rotation !== true || move.location.rotation === true) return undefined
    return this.entry(StraightenLog, card.location.player, 1)
  }

  /**
   * Coins come in 2 denominations, so a payment is up to 2 moves and change: it is written down once,
   * as the amount it adds up to. Coins handed over by a gain have their entry already, on the move that
   * gains them.
   */
  private coinMove(move: GreyluneMove, context: Context, rules: GreyluneRules): Entry | undefined {
    const previous = previousMove(context)
    if (previous !== undefined && isCustomMove(previous) && previous.type === CustomMoveType.GainCoins) return undefined
    const row = coinRow(move, context, rules)
    if (row.first === false || !row.total || row.player === undefined) return undefined
    return this.entry(CoinRowLog, row.player, 1)
  }

  /**
   * One entry, in the colour of the player it belongs to. The avatar is drawn on the entries of the
   * first level alone: an indented one is the outcome of the entry above it, and names its player in
   * words anyway.
   */
  private entry(Component: Entry['Component'], player?: PlayerColor, depth = 0): Entry {
    return { Component, player: depth === 0 ? player : undefined, depth, css: playerLogCss(player), liveCss: true }
  }

  /** What belongs to nobody: a new year laid out, the final count. */
  private table(Component: Entry['Component'], depth = 0): Entry {
    return { Component, depth, css: tableLogCss, liveCss: true }
  }
}

/**
 * Whether the Villager moved right before this one was part of the same row. It has already landed, so
 * where it came from cannot be read any more: what tells is where it went, and whose it is. The one
 * Villager that goes to the camp next to a row without being part of it is the one that has just
 * activated a card, which leaves the Village for the camp before the card is paid for — and the rules
 * remember which one it was until the turn is over.
 */
const isInRow = (move: MoveItem<PlayerColor, MaterialType, LocationType>, previous: GreyluneMove | undefined, rules: GreyluneRules): boolean => {
  if (previous === undefined || !isMoveItemType(MaterialType.Villager)(previous) || previous.location.type !== move.location.type) return false
  if (previous.itemIndex === rules.remind<number>(Memory.SpentVillager)) return false
  const villagers = rules.material(MaterialType.Villager)
  return getVillagerPlayer(villagers.getItem<Villager>(previous.itemIndex).id) === getVillagerPlayer(villagers.getItem<Villager>(move.itemIndex).id)
}

/** Each row of Villagers, and the entry it is written down as. */
const villagerRowLogs: Record<VillagerRow, Entry['Component']> = {
  [VillagerRow.Gain]: GainVillagersLog,
  [VillagerRow.Spend]: SpendVillagersLog,
  [VillagerRow.Return]: ReturnVillagersLog
}
