import { uniq } from 'es-toolkit'
import { MASTER_SCORE, MAX_ITEMS, SKILLED_SCORE } from '../Constants'
import { PlayerColor } from '../PlayerColor'
import { Season } from '../Season'
import { Area } from './Area'
import { Countable, Score } from './Effect'
import { EncounterCard, EncounterCardId, encounterArea } from './EncounterCard'
import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'
import { HeroicQuestArea, questRewards } from './QuestTile'
import { coinUnits } from './Tokens'
import { VILLAGERS_PER_PLAYER } from './Villager'
import { getVpTokenValue, VpToken, VpTokenValue } from './VpToken'
import { isPotion, PermanentType, VillageCard, VillageCardId, villageCardData } from './VillageCard'

// ------------------------------------------------------------------ where a player stands

/** The season a player is in. Everyone starts a year in Spring and moves on at their own pace. */
export const playerSeason = (source: MaterialSource, player: PlayerColor): Season =>
  (source.material(MaterialType.SeasonMarker).id(player).getItem()?.location.id as Season) ?? Season.Spring

/** Which {@link Area} the Adventurer stands in, {@link Area.Village} while it is at home. */
export const adventurerArea = (source: MaterialSource, player: PlayerColor): Area =>
  (source.material(MaterialType.Adventurer).id(player).getItem()?.location.id as Area) ?? Area.Village

// ------------------------------------------------------------------ what a player owns

export const playerCoins = (source: MaterialSource, player: PlayerColor): number =>
  source.material(MaterialType.Coin).location(LocationType.PlayerCoins).player(player).money(coinUnits).count

export const playerForce = (source: MaterialSource, player: PlayerColor): number =>
  source.material(MaterialType.StrengthMarker).player(player).getItem()?.location.x ?? 0

export const playerMagic = (source: MaterialSource, player: PlayerColor): number =>
  source.material(MaterialType.MagicMarker).player(player).getItem()?.location.x ?? 0

export const playerItems = (source: MaterialSource, player: PlayerColor) =>
  source.material(MaterialType.VillageCard).location(LocationType.Items).player(player)

export const playerCompanions = (source: MaterialSource, player: PlayerColor) =>
  source.material(MaterialType.VillageCard).location(LocationType.Companions).player(player)

/** Companions and Objects alike: the cards that can be tilted, and that Autumn straightens. */
export const playerCards = (source: MaterialSource, player: PlayerColor) =>
  source
    .material(MaterialType.VillageCard)
    .player(player)
    .location((location) => location.type === LocationType.Items || location.type === LocationType.Companions)

export const untoldStories = (source: MaterialSource, player: PlayerColor) =>
  source.material(MaterialType.EncounterCard).location(LocationType.UntoldStories).player(player)

export const toldStories = (source: MaterialSource, player: PlayerColor) =>
  source.material(MaterialType.EncounterCard).location(LocationType.ToldStories).player(player)

/** Every Encounter the player has resolved, told or not. */
export const resolvedEncounters = (source: MaterialSource, player: PlayerColor): EncounterCard[] =>
  source
    .material(MaterialType.EncounterCard)
    .player(player)
    .location((location) => location.type === LocationType.UntoldStories || location.type === LocationType.ToldStories)
    .getItems<EncounterCardId>()
    .map((item) => item.id.front!)

export const activeVillagers = (source: MaterialSource, player: PlayerColor) =>
  source.material(MaterialType.Villager).location(LocationType.ActiveVillagers).player(player)

/** The Villagers a player still owns: all 7 but the ones sent back to the reserve. */
export const villagersAtDisposal = (source: MaterialSource, player: PlayerColor): number =>
  VILLAGERS_PER_PLAYER - source.material(MaterialType.Villager).location(LocationType.VillagerReserve).player(player).length

/** The Villagers of a player standing in the Village, whom Autumn will not wait for. */
export const villagersInVillage = (source: MaterialSource, player: PlayerColor) =>
  source.material(MaterialType.Villager).location(LocationType.VillageGap).player(player)

// ------------------------------------------------------------------ what the cards owned change

/** The permanent effect of a card counts even while the card is tilted (rulebook p.17). */
const permanents = (source: MaterialSource, player: PlayerColor, type: PermanentType) =>
  playerCards(source, player)
    .getItems<VillageCardId>()
    .map((item) => villageCardData[item.id.front!].permanent)
    .filter((permanent) => permanent?.type === type)

/** 3 Objects, plus what Kael, Dorian and the Bag of holding add (rulebook p.8). */
export const itemLimit = (source: MaterialSource, player: PlayerColor): number =>
  MAX_ITEMS + permanents(source, player, PermanentType.ItemLimit).reduce((total, permanent) => total + (permanent!.count ?? 1), 0)

/** Selia tilts a Potion where anyone else would empty it. */
export const keepsPotions = (source: MaterialSource, player: PlayerColor): boolean =>
  permanents(source, player, PermanentType.TiltPotions).length > 0

// ------------------------------------------------------------------ victory points

/** The value a victory point token stands for, once its owner has turned it over. */
export const vpTokenTotal = (token: VpToken, flipped: boolean): number =>
  getVpTokenValue(token) === VpTokenValue.Vp25 ? (flipped ? 50 : 25) : flipped ? 100 : 75

/**
 * The score of a player: the space their marker stands on, plus the token they have taken. A player
 * holds at most one — the 25 is handed back for the 75 — so the two never add up.
 */
export const playerVp = (source: MaterialSource, player: PlayerColor): number => {
  const marker = source.material(MaterialType.ScoreMarker).id(player).getItem()?.location.x ?? 0
  const token = source.material(MaterialType.VpToken).location(LocationType.PlayerVpTokens).player(player).getItem()
  return marker + (token ? vpTokenTotal(token.id as VpToken, token.location.rotation === true) : 0)
}

/** What a {@link Score} counts on. */
export const count = (source: MaterialSource, player: PlayerColor, countable: Countable): number => {
  switch (countable) {
    case Countable.Force:
      return playerForce(source, player)
    case Countable.Magic:
      return playerMagic(source, player)
    case Countable.LowestSkill:
      return Math.min(playerForce(source, player), playerMagic(source, player))
    case Countable.Coins:
      return playerCoins(source, player)
    case Countable.Item:
      return playerItems(source, player).length
    case Countable.Companion:
      return playerCompanions(source, player).length
    case Countable.Potion:
      return playerItems(source, player).getItems<VillageCardId>().filter((item) => isPotion(item.id.front!)).length
    case Countable.ToldStory:
      return toldStories(source, player).length
    case Countable.UntoldStory:
      return untoldStories(source, player).length
    case Countable.Villagers:
      return villagersAtDisposal(source, player)
    case Countable.FarEncounter:
      return resolvedEncounters(source, player).filter((card) => encounterArea[card] >= Area.Hammer).length
    case Countable.DistinctBanner:
      return uniq(resolvedEncounters(source, player).map((card) => encounterArea[card])).length
  }
}

export const scoreValue = (source: MaterialSource, player: PlayerColor, score: Score): number => {
  if (score.per === undefined) return score.vp
  const counted = Math.max(0, count(source, player, score.per) - (score.minus ?? 0))
  return score.vp * Math.floor(counted / (score.divide ?? 1))
}

/** 2 points for 3 in both skills, 5 for the two tracks maxed out — never both (rulebook p.13). */
export const skillScore = (source: MaterialSource, player: PlayerColor): number => {
  const force = playerForce(source, player)
  const magic = playerMagic(source, player)
  if (force >= MASTER_SCORE.level && magic >= MASTER_SCORE.level) return MASTER_SCORE.vp
  if (force >= SKILLED_SCORE.level && magic >= SKILLED_SCORE.level) return SKILLED_SCORE.vp
  return 0
}

/** The victory points printed on the Companions and the Objects a player ends the game with. */
export const cardsScore = (source: MaterialSource, player: PlayerColor): number =>
  playerCards(source, player)
    .getItems<VillageCardId>()
    .reduce((total, item) => {
      const score = villageCardData[item.id.front! as VillageCard].score
      return score ? total + scoreValue(source, player, score) : total
    }, 0)

/**
 * What the Heroic Quests a player achieved are worth: the shield their marker stands on, which is
 * the higher one only for the player who got there first.
 */
export const questScore = (source: MaterialSource, player: PlayerColor): number =>
  source
    .material(MaterialType.QuestMarker)
    .id(player)
    .location(LocationType.QuestRewardSpace)
    .getItems()
    .reduce((total, item) => {
      const reward = questRewards[item.location.id as HeroicQuestArea]
      return total + (item.location.x === 0 ? reward.first : reward.others)
    }, 0)

/** Everything a player is worth once the 5th year is over (rulebook p.13). */
export const finalScore = (source: MaterialSource, player: PlayerColor): number =>
  playerVp(source, player) + questScore(source, player) + cardsScore(source, player) + skillScore(source, player)
