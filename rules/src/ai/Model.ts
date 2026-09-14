import { uniq } from 'es-toolkit'
import { MASTER_SCORE, MAX_ITEMS, MAX_SKILL, SKILLED_SCORE } from '../Constants'
import { GreyluneRules } from '../GreyluneRules'
import { Area } from '../material/Area'
import { Countable, Score } from '../material/Effect'
import { EncounterCard, EncounterCardId, encounterArea, encounterCardData } from '../material/EncounterCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import {
  playerCoins,
  playerCompanions,
  playerForce,
  playerItems,
  playerMagic,
  playerVp,
  questScore,
  toldStories,
  untoldStories,
  villagersAtDisposal
} from '../material/PlayerState'
import { HeroicQuestArea } from '../material/QuestTile'
import { IncomeToken } from '../material/Tokens'
import { VILLAGERS_PER_PLAYER } from '../material/Villager'
import { isPotion, PermanentType, VillageCard, VillageCardId, villageCardData } from '../material/VillageCard'
import { PlayerColor } from '../PlayerColor'

/** A Companion or an Object of the player, and whether it has already been used this year. */
export type OwnedCard = { front: VillageCard; tilted: boolean }

/**
 * Everything a player owns that is worth something, lifted off the table into a plain object.
 *
 * The bot weighs an action by what it would change here: a card bought is a copy of the model with the
 * coins taken out and the card put in, and what that is worth is the difference between the two. The
 * same measure then serves the position reached by a move played out and the one an action merely
 * considered would reach, which is what keeps the two in step.
 */
export type PlayerModel = {
  vp: number
  questPoints: number
  questsDone: HeroicQuestArea[]
  markers: number
  coins: number
  force: number
  magic: number
  villagers: number
  items: OwnedCard[]
  companions: OwnedCard[]
  untold: EncounterCard[]
  told: EncounterCard[]
  incomeTokens: IncomeToken[]
}

export const buildModel = (rules: GreyluneRules, player: PlayerColor): PlayerModel => {
  const owned = (cards: ReturnType<typeof playerItems>): OwnedCard[] =>
    cards.getItems<VillageCardId>().map((item) => ({ front: item.id.front!, tilted: item.location.rotation === true }))
  const markers = rules.material(MaterialType.QuestMarker).id(player)
  return {
    vp: playerVp(rules, player),
    questPoints: questScore(rules, player),
    questsDone: markers.location(LocationType.QuestRewardSpace).getItems().map((item) => item.location.id as HeroicQuestArea),
    markers: markers.location(LocationType.QuestMarkerSpace).length,
    coins: playerCoins(rules, player),
    force: playerForce(rules, player),
    magic: playerMagic(rules, player),
    villagers: villagersAtDisposal(rules, player),
    items: owned(playerItems(rules, player)),
    companions: owned(playerCompanions(rules, player)),
    untold: untoldStories(rules, player)
      .getItems<EncounterCardId>()
      .map((item) => item.id.front!),
    told: toldStories(rules, player)
      .getItems<EncounterCardId>()
      .map((item) => item.id.front!),
    incomeTokens: rules
      .material(MaterialType.IncomeToken)
      .location(LocationType.IncomeTokenSpace)
      .player(player)
      .getItems()
      .map((item) => item.id as IncomeToken)
  }
}

export const cloneModel = (model: PlayerModel): PlayerModel => ({
  ...model,
  questsDone: [...model.questsDone],
  items: [...model.items],
  companions: [...model.companions],
  untold: [...model.untold],
  told: [...model.told],
  incomeTokens: [...model.incomeTokens]
})

export const clampSkill = (level: number): number => Math.max(0, Math.min(MAX_SKILL, level))

export const clampVillagers = (count: number): number => Math.max(0, Math.min(VILLAGERS_PER_PLAYER, count))

export const storyPoints = (cards: EncounterCard[]): number => cards.reduce((total, card) => total + encounterCardData[card].story, 0)

const resolved = (model: PlayerModel): EncounterCard[] => [...model.untold, ...model.told]

/** The same counts as `count` in `PlayerState`, read off the model. */
export const modelCount = (model: PlayerModel, countable: Countable): number => {
  switch (countable) {
    case Countable.Force:
      return model.force
    case Countable.Magic:
      return model.magic
    case Countable.LowestSkill:
      return Math.min(model.force, model.magic)
    case Countable.Coins:
      return model.coins
    case Countable.Item:
      return model.items.length
    case Countable.Companion:
      return model.companions.length
    case Countable.Potion:
      return model.items.filter((card) => isPotion(card.front)).length
    case Countable.ToldStory:
      return model.told.length
    case Countable.UntoldStory:
      return model.untold.length
    case Countable.Villagers:
      return model.villagers
    case Countable.FarEncounter:
      return resolved(model).filter((card) => encounterArea[card] >= Area.Hammer).length
    case Countable.DistinctBanner:
      return uniq(resolved(model).map((card) => encounterArea[card])).length
  }
}

export const modelScoreValue = (model: PlayerModel, score: Score): number => {
  if (score.per === undefined) return score.vp
  const counted = Math.max(0, modelCount(model, score.per) - (score.minus ?? 0))
  return score.vp * Math.floor(counted / (score.divide ?? 1))
}

export const modelSkillScore = (model: PlayerModel): number => {
  if (model.force >= MASTER_SCORE.level && model.magic >= MASTER_SCORE.level) return MASTER_SCORE.vp
  if (model.force >= SKILLED_SCORE.level && model.magic >= SKILLED_SCORE.level) return SKILLED_SCORE.vp
  return 0
}

/**
 * The victory points printed on the Companions and the Objects, counted on what the model holds.
 * Neris's coins can be left out: before the end of the game a coin is still money, and it is counted
 * as such (see `Assessment.coinsValue`).
 */
export const modelCardsScore = (model: PlayerModel, withoutCoins = false): number =>
  [...model.items, ...model.companions].reduce((total, card) => {
    const score = villageCardData[card.front].score
    if (!score || (withoutCoins && score.per === Countable.Coins)) return total
    return total + modelScoreValue(model, score)
  }, 0)

export const modelItemLimit = (model: PlayerModel): number =>
  MAX_ITEMS +
  [...model.items, ...model.companions].reduce((total, card) => {
    const permanent = villageCardData[card.front].permanent
    return permanent?.type === PermanentType.ItemLimit ? total + (permanent.count ?? 1) : total
  }, 0)

export const owns = (model: PlayerModel, front: VillageCard): boolean =>
  model.items.some((card) => card.front === front) || model.companions.some((card) => card.front === front)
