import { Distance } from './Distance'

export enum QuestTile {
  Quest1 = 1,
  Quest2,
  Quest3,
  Quest4,
  Quest5,
  Quest6,
  Quest7,
  Quest8,
  Quest9
}

/**
 * Only the 3 farthest reaches of the map carry a Heroic Quest space, and each of them is on the road
 * just past the banner of its {@link Distance}. Nearest first, which is also worth least: the space
 * past the purple banner pays 7/5, the red one 8/6 and the black one 9/7.
 */
export const heroicQuestDistances = [Distance.Purple, Distance.Red, Distance.Black] as const

/** The Distance of a Quest space, which is what tells the 3 of them apart. */
export type HeroicQuestDistance = (typeof heroicQuestDistances)[number]
