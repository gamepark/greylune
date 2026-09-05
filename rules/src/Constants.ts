/** The numbers of the rulebook that more than one file has to agree on. */

/** Side of the square of face-up Village cards. */
export const VILLAGE_GRID_SIDE = 3

/** Village cards of period I and of period II that go back in the box unseen. */
export const VILLAGE_CARDS_REMOVED = 2

/** Event tile that goes back in the box unseen: a year of the game is never played. */
export const EVENT_TILES_REMOVED = 1

/** Quest markers a player may commit to the Heroic Quests, one per Quest space. */
export const QUEST_MARKERS = 3

/** How many Seal tokens of each of the 3 values are punched. */
export const SEALS_PER_VALUE = 8

/** Of the 7 Villagers of a player, how many may already be used in the first year. */
export const ACTIVE_VILLAGERS = 3

export const STARTING_COINS = 8

/** Companions, and Objects without a card that raises the limit. */
export const MAX_COMPANIONS = 3
export const MAX_ITEMS = 3

/** Both tracks of the personal board run from 0 to 5. */
export const MAX_SKILL = 5

/** The score track of the main board. Past 24 the marker goes round again and a token is taken. */
export const SCORE_TRACK_SIZE = 25

/** A story is worth at most 3, however many Encounters it is made of. */
export const MAX_STORY_VALUE = 3

/** Reaching those scores is what a Bonus token is spent on, the second time emptying the supply. */
export const BONUS_TOKEN_SCORES = [8, 20]

/** The income of the Autumn, before the Companions are paid and the Income tokens cashed. */
export const BASE_INCOME = 3

/** 2 victory points for 3 in both skills, 5 for the two tracks maxed out. */
export const SKILLED_SCORE = { level: 3, vp: 2 }
export const MASTER_SCORE = { level: MAX_SKILL, vp: 5 }
