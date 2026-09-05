import { Area } from './Area'
import { req, Requirement, RequirementType } from './Effect'

/** The 9 Heroic Quest tiles, named after the rulebook appendix (p.19): they carry no printed title. */
export enum QuestTile {
  Giant = 1,
  Dragon,
  Wraiths,
  BardTournament,
  Donation,
  Undeads,
  DeadlyTrap,
  Ransom,
  Wedding
}

/**
 * Only the 3 farthest reaches of the map carry a Heroic Quest space, and each of them sits on the
 * road just past the banner of its {@link Area}. Nearest first, which is also worth least: the
 * Hammer space pays 7/5, the Swords one 8/6 and the Edge one 9/7.
 */
export const heroicQuestAreas = [Area.Hammer, Area.Swords, Area.Edge] as const

/** The {@link Area} a Quest space lies in, which is what tells the 3 of them apart. */
export type HeroicQuestArea = (typeof heroicQuestAreas)[number]

/**
 * What each Quest space pays at the end of the game: the first player to achieve it takes the higher
 * shield, and every other one shares the lower (rulebook p.11). Printed on the main board, not on
 * the tiles, so which Quest lands where is what decides its worth.
 */
export const questRewards: Record<HeroicQuestArea, { first: number; others: number }> = {
  [Area.Hammer]: { first: 7, others: 5 },
  [Area.Swords]: { first: 8, others: 6 },
  [Area.Edge]: { first: 9, others: 7 }
}

/**
 * A Quest asks one thing and gives nothing but the marker: the points are on the board, and they are
 * only counted once the 5th year is over.
 */
export const questRequirements: Record<QuestTile, Requirement[]> = {
  [QuestTile.Giant]: [req(RequirementType.Force, 4)],
  [QuestTile.Dragon]: [req(RequirementType.Skills, 6)],
  [QuestTile.Wraiths]: [req(RequirementType.Magic, 4)],
  /** 2 Encounters told, whatever they are worth, even nothing. */
  [QuestTile.BardTournament]: [req(RequirementType.TellStories, 2)],
  [QuestTile.Donation]: [req(RequirementType.DiscardItem)],
  [QuestTile.Undeads]: [req(RequirementType.SpendForce, 1), req(RequirementType.SpendMagic, 1)],
  /** The Villager goes back to the reserve, out of the game for good. */
  [QuestTile.DeadlyTrap]: [req(RequirementType.ReturnVillager)],
  [QuestTile.Ransom]: [req(RequirementType.SpendCoins, 6)],
  [QuestTile.Wedding]: [req(RequirementType.SpendVillagers, 2)]
}
