import { isCustomMove, isCustomMoveType, isMoveItem, isMoveItemType, playAction } from '@gamepark/rules-api'
import { GreyluneRules } from '../../GreyluneRules'
import { GreyluneSetup } from '../../GreyluneSetup'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { activeVillagers, playerCoins, playerCompanions, playerItems, playerSeason, playerVp, resolvedEncounters, villagersAtDisposal, villagersInVillage } from '../../material/PlayerState'
import { PlayerColor } from '../../PlayerColor'
import { CustomMoveType } from '../../rules/CustomMoveType'
import { getVillageCardType, VillageCard, VillageCardId, VillageCardType } from '../../material/VillageCard'
import { GreyluneMove } from '../../rules/GreyluneRule'
import { RuleId } from '../../rules/RuleId'
import { Season } from '../../Season'
import { currentYear, YEARS } from '../../Year'
import { GreyluneGame } from '../Simulation'
import { contenders } from './Contenders'
import { Random, withSeed } from './Random'

/**
 * One game of the arena: the table dealt from `seed`, and the contenders of `lineup` seated in turn
 * from `rotation`, so that the same table played at every rotation puts each of them on every seat.
 */
export type MatchTask = { seed: number; rotation: number; lineup: string[] }

/** What a player did in one year. */
export type YearRecord = {
  /** Spring turns played before moving on to Summer. */
  springTurns: number
  /** Summer turns played before moving on to Autumn. */
  summerTurns: number
  /** The turns of both seasons by what they did, as {@link turnKind} names them. */
  turns: Record<string, number>
  /** 1 for the first of the table to leave Spring this year, 2 for the next… */
  summerOrder?: number
  /** Active Villagers still in hand when the player moved on to Summer. */
  villagersInHand?: number
  /** Villagers standing in the Village when the player moved on to Summer. */
  villagersInVillage?: number
  /** Villagers the player owns when moving on to Summer: all 7 but those still in the reserve. */
  villagersOwned?: number
  /** Active Villagers never used when the player reached Autumn: actions of the year thrown away. */
  idleVillagers?: number
  /** Objects the player could still have used when moving on to Autumn, which straightens them unused. */
  unusedItems?: number
  /** For each Encounter resolved this year, its rank among those the whole table resolved: 1 for the first. */
  encounters: number[]
}

export type SeatRecord = {
  contender: string
  /** The name of the player, in a game recorded by the platform. */
  name?: string
  player: PlayerColor
  score: number
  /** 1 for the winner; tied players share the ranks they cover. */
  rank: number
  /** The points scored during the game, before the final count. */
  gameVp: number
  coins: number
  companions: number
  items: number
  /** Heroic Quests achieved first (higher shield) and second. */
  questsFirst: number
  questsSecond: number
  years: YearRecord[]
  /** Every Object the player came to own, and the year they got it. */
  itemsOwned: { card: string; year: number }[]
  /** How many times the player used each of their Objects. */
  itemUses: Record<string, number>
}

export type GameRecord = MatchTask & {
  players: number
  seats: SeatRecord[]
  /** Every Object laid out in the Village during the game, and the year it was. */
  offered: { card: string; year: number }[]
  /** Decisions taken in the game, every player together. */
  decisions: number
  ms: number
  error?: string
}

const DECISION_LIMIT = 5000

/** What the records compare a player on before and after each decision. */
type Snapshot = {
  season: Season
  active: number
  inVillage: number
  owned: number
  encounters: Set<number>
  /** The Objects the player owns, by name. */
  items: Set<string>
  questsFirst: number
  questsSecond: number
}

const snapshot = (rules: GreyluneRules, player: PlayerColor): Snapshot => {
  const markers = rules.material(MaterialType.QuestMarker).id(player).location(LocationType.QuestRewardSpace).getItems()
  return {
    season: playerSeason(rules, player),
    active: activeVillagers(rules, player).length,
    inVillage: villagersInVillage(rules, player).length,
    owned: villagersAtDisposal(rules, player),
    encounters: new Set(resolvedEncounters(rules, player)),
    items: new Set(
      playerItems(rules, player)
        .getItems<VillageCardId>()
        .map((item) => VillageCard[item.id.front!])
    ),
    questsFirst: markers.filter((item) => item.location.x === 0).length,
    questsSecond: markers.filter((item) => item.location.x === 1).length
  }
}

const newYear = (): YearRecord => ({ springTurns: 0, summerTurns: 0, turns: {}, encounters: [] })

/** What a Spring or Summer turn did: the custom move it is, or the piece it moved and where to. */
/** How many of the player's Objects a Summer turn could use right now. */
const usableItems = (rules: GreyluneRules, player: PlayerColor): number =>
  new Set(
    rules
      .getLegalMoves(player)
      .filter(isCustomMoveType(CustomMoveType.UseItem))
      .map((move) => (move.data as { card: number }).card)
  ).size

export const turnKind = (season: string, move: GreyluneMove): string => {
  if (isCustomMove(move)) return `${season} ${CustomMoveType[move.type]}`
  if (isMoveItem(move)) return `${season} ${MaterialType[move.itemType]} to ${LocationType[move.location.type!]}`
  return `${season} other`
}

/**
 * Follows a game decision by decision and writes down what each player did, whoever chooses the
 * moves: the arena's contenders, or the players of a game recorded by the platform.
 */
export class Recorder {
  private readonly years: YearRecord[][]
  private readonly gameVp: number[]
  private readonly tally = { summerOrder: 0, encounters: 0 }
  private readonly itemsOwned: { card: string; year: number }[][]
  private readonly itemUses: Record<string, number>[]
  readonly offered: { card: string; year: number }[] = []
  decisions = 0

  constructor(
    readonly game: GreyluneGame,
    readonly ids: PlayerColor[] = game.players
  ) {
    this.years = ids.map(() => Array.from({ length: YEARS }, newYear))
    this.gameVp = ids.map(() => 0)
    this.itemsOwned = ids.map(() => [])
    this.itemUses = ids.map(() => ({}))
  }

  /** The Objects of the Village grid not seen there before. */
  private watchVillage(rules: GreyluneRules, year: number): void {
    for (const front of rules
      .material(MaterialType.VillageCard)
      .location(LocationType.VillageGrid)
      .getItems<VillageCardId>()
      .map((item) => item.id.front!)) {
      const card = VillageCard[front]
      if (getVillageCardType(front) === VillageCardType.Item && !this.offered.some((offer) => offer.card === card)) this.offered.push({ card, year })
    }
  }

  /** Plays the move of `player` and writes down what changed. */
  play(move: GreyluneMove, player: PlayerColor): void {
    const { game, ids } = this
    const rules = new GreyluneRules(game)
    const year = currentYear(rules, ids.length)
    const ruleId = game.rule!.id
    const before = ids.map((id) => snapshot(rules, id))
    const unusedItems = ruleId === RuleId.Summer && isMoveItemType(MaterialType.SeasonMarker)(move) ? usableItems(rules, player) : undefined
    this.watchVillage(rules, year)
    if (isCustomMoveType(CustomMoveType.UseItem)(move)) {
      const card = VillageCard[rules.material(MaterialType.VillageCard).getItem<VillageCardId>((move.data as { card: number }).card).id.front!]
      const uses = this.itemUses[ids.indexOf(player)]
      uses[card] = (uses[card] ?? 0) + 1
    }
    playAction(rules, move, player)
    this.decisions++
    const yearOver = !game.rule || currentYear(rules, ids.length) !== year
    ids.forEach((id, seat) => {
      const record = this.years[seat][year - 1]
      const was = before[seat]
      const now = snapshot(rules, id)
      if (id === player && was.season === now.season && !yearOver) {
        if (ruleId === RuleId.Spring) record.springTurns++
        else if (ruleId === RuleId.Summer) record.summerTurns++
        if (ruleId === RuleId.Spring || ruleId === RuleId.Summer) {
          const kind = turnKind(RuleId[ruleId], move)
          record.turns[kind] = (record.turns[kind] ?? 0) + 1
        }
      }
      if (was.season === Season.Spring && now.season !== Season.Spring) {
        record.summerOrder = ++this.tally.summerOrder
        record.villagersInHand = was.active
        record.villagersInVillage = was.inVillage
        record.villagersOwned = was.owned
      }
      if (was.season === Season.Summer && (now.season === Season.Autumn || yearOver)) {
        record.idleVillagers = was.active
        if (id === player && unusedItems !== undefined) record.unusedItems = unusedItems
      }
      for (const card of now.encounters) if (!was.encounters.has(card)) record.encounters.push(++this.tally.encounters)
      for (const card of now.items) {
        if (!was.items.has(card) && !this.itemsOwned[seat].some((owned) => owned.card === card)) this.itemsOwned[seat].push({ card, year })
      }
      if (game.rule) this.gameVp[seat] = playerVp(rules, id)
    })
    if (yearOver) {
      this.tally.summerOrder = 0
      this.tally.encounters = 0
    }
  }

  /** The record of every seat once the game is over, `contender` naming who sat there. */
  seats(contender: (player: PlayerColor, seat: number) => string): SeatRecord[] {
    const rules = new GreyluneRules(this.game)
    const scores = this.ids.map((id) => rules.getScore(id))
    return this.ids.map((id, seat): SeatRecord => {
      const score = scores[seat]
      const above = scores.filter((other) => other > score).length
      const tied = scores.filter((other) => other === score).length
      const quests = snapshot(rules, id)
      return {
        contender: contender(id, seat),
        player: id,
        score,
        rank: above + (tied + 1) / 2,
        gameVp: this.gameVp[seat],
        coins: playerCoins(rules, id),
        companions: playerCompanions(rules, id).length,
        items: playerItems(rules, id).length,
        questsFirst: quests.questsFirst,
        questsSecond: quests.questsSecond,
        years: this.years[seat],
        itemsOwned: this.itemsOwned[seat],
        itemUses: this.itemUses[seat]
      }
    })
  }
}

export const playMatch = (task: MatchTask): GameRecord => {
  const start = Date.now()
  const { seed, rotation, lineup } = task
  const players = lineup.length
  const ids: PlayerColor[] = Array.from({ length: players }, (_, i) => i + 1)
  const contenderOf = (seat: number) => lineup[(seat + rotation) % players]
  const game: GreyluneGame = withSeed(seed, () => new GreyluneSetup().setup({ players: ids.map((id) => ({ id })) }))
  const randoms = ids.map((id) => new Random(seed * 31 + id))
  const recorder = new Recorder(game, ids)
  let error: string | undefined

  // Nothing past the setup should draw lots, but if anything does, it draws from the seed too.
  withSeed(seed + 1, () => {
    while (game.rule && recorder.decisions < DECISION_LIMIT) {
      const player = new GreyluneRules(game).getActivePlayer()
      if (player === undefined) {
        error = `No active player at rule ${RuleId[game.rule.id]}`
        return
      }
      const seat = ids.indexOf(player)
      const ruleId = game.rule.id
      try {
        recorder.play(contenders[contenderOf(seat)](game, player, randoms[seat]), player)
      } catch (e) {
        error = `${contenderOf(seat)} as player ${player} at rule ${RuleId[ruleId]}: ${e instanceof Error ? e.message : e}`
        return
      }
    }
  })
  if (!error && game.rule) error = `No end after ${DECISION_LIMIT} decisions`
  const seats = recorder.seats((_, seat) => contenderOf(seat))
  return { ...task, players, seats, offered: recorder.offered, decisions: recorder.decisions, ms: Date.now() - start, error }
}
