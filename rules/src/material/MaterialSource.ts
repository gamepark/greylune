import { Material } from '@gamepark/rules-api'
import { PlayerColor } from '../PlayerColor'
import { LocationType } from './LocationType'
import { MaterialType } from './MaterialType'

/**
 * Anything that can read the game's material: a step of the rules as much as the {@link GreyluneRules}
 * instance the display holds.
 *
 * What both of them need to know is asked here rather than in either of them. A panel showing how
 * much Force a player has must show what an Encounter would be checked against, and a button that
 * spends a Villager must spend the one the rules would have taken — the only way to be sure of that
 * is for both to ask the same question.
 */
export type MaterialSource = { material(type: MaterialType): Material<PlayerColor, MaterialType, LocationType> }
