import { LocationType } from './material/LocationType'
import { MaterialSource } from './material/MaterialSource'
import { MaterialType } from './material/MaterialType'

/** The game lasts 5 years, split in 3 periods: 2 for {@link Period.I}, 2 for II, 1 for III. */
export const YEARS = 5

/** How many Encounters are laid out each year: 5, 6 or 7 at 2, 3 or 4 players (rulebook p.2). */
export const encounterRowSize = (players: number): number => players + 3

/**
 * The Encounter deck is the calendar of the game.
 *
 * It is built to hold exactly one row per year and nothing more, and every Winter deals one — the
 * first year included, which the setup hands over to Winter to lay out. So a deck with cards left is
 * a year still to come, and an empty one is the 5th year being played — which is why nothing here
 * has to count the years.
 */
const encounterDeck = (source: MaterialSource) => source.material(MaterialType.EncounterCard).location(LocationType.EncounterDeck)

/** Whether the year being played is the last one, after which the points are counted. */
export const isLastYear = (source: MaterialSource): boolean => encounterDeck(source).length === 0

/** Which of the 5 years is being played, read off what the deck has left to deal. */
export const currentYear = (source: MaterialSource, players: number): number =>
  YEARS - Math.floor(encounterDeck(source).length / encounterRowSize(players))
