import { coins, Effect, force, magic, req, Requirement, RequirementType, straighten, travel, villager, vp } from './Effect'
import { TriggerType } from './Reaction'

/** The 6 Event tiles, named after the rulebook appendix (p.14): the tiles carry no printed title. */
export enum EventTile {
  Banquet = 1,
  Festival,
  GreatFair,
  MagicShow,
  Gathering,
  Tournament
}

/**
 * The Event of the year, and the one action every player may take exactly once between Spring and
 * Summer (rulebook p.6 and p.7).
 *
 * `abilities` holds the options the tile offers. Placing a Villager on the tile *is* the choice: the
 * Villager stands on the option it pays for, which is why the Festival needs nothing special —
 * its 5 free spaces are simply its 5 options, and a space taken is an option no one else can use
 * again that year.
 */
export type EventTileData = { abilities: Effect[] }

/** Only the Festival makes its spaces exclusive: everywhere else, several players may do the same. */
export const isFestival = (tile: EventTile): boolean => tile === EventTile.Festival

/** What a price a player is about to pay can be answered with, kind by kind. */
const priceTriggers: Partial<Record<RequirementType, TriggerType>> = {
  [RequirementType.SpendForce]: TriggerType.SpendForce,
  [RequirementType.SpendVillagers]: TriggerType.SpendVillagers,
  [RequirementType.Seal]: TriggerType.ActivateSeal,
  [RequirementType.SealCoins]: TriggerType.ActivateSeal
}

/**
 * What answering the Event of the year can be about, read off the tile rather than named beside it:
 * whatever any of its options asks to be paid, since which one is taken is only settled once the
 * window has closed (see {@link EventRule}).
 *
 * As the box stands that is Force and nothing else — no card of it answers coins or Magic, and the
 * window on a tile that only asks for those simply never opens. Reading the tile rather than saying
 * so is what keeps a Companion added later from needing a word changed here.
 *
 * A Villager walking onto the tile is never a {@link TriggerType.RemoveVillager}: Neris pays for a
 * Villager taken back out of the Village, and this one is being put down.
 */
export const eventTriggers = (tile: EventTile): TriggerType[] => [
  ...new Set(eventTileData[tile].abilities.flatMap((ability) => triggersOf(ability.requirements)))
]

const triggersOf = (requirements: Requirement[] = []): TriggerType[] =>
  requirements.flatMap((requirement) => {
    const trigger = priceTriggers[requirement.type]
    return trigger === undefined ? [] : [trigger]
  })

export const eventTileData: Record<EventTile, EventTileData> = {
  /** 3 coins, or a card straightened. */
  [EventTile.Banquet]: { abilities: [{ gains: [coins(3)] }, { gains: [straighten] }] },

  /**
   * Festival: 5 free spaces drawn in a ring, each one between 2 of the 5 bonuses printed around
   * them, so choosing where to stand is choosing which 2 to take.
   *
   * The tile draws the 2 bonuses of a space side by side and names no order between them, but the
   * queue that hands them over has one, and the road is never just a gain: the whole journey — the
   * Encounter at the end of it included — is resolved inside it, and whatever follows it in the list
   * is only paid once the Adventurer is home. So the road goes last on the 2 spaces that carry one,
   * or the Force of the fifth space would reach the player too late to satisfy the Encounter it was
   * taken to go and meet.
   */
  [EventTile.Festival]: {
    abilities: [
      { gains: [magic(), vp(2)] },
      { gains: [magic(), coins(2)] },
      { gains: [vp(2), travel(1)] },
      { gains: [coins(2), force()] },
      { gains: [force(), travel(1)] }
    ]
  },

  [EventTile.GreatFair]: { abilities: [{ requirements: [req(RequirementType.SpendCoins, 3)], gains: [force(), magic()] }] },

  [EventTile.MagicShow]: { abilities: [{ requirements: [req(RequirementType.SpendMagic, 1)], gains: [travel(5)] }] },

  /** Paid in Force or in coins, for the same Villager. */
  [EventTile.Gathering]: {
    abilities: [
      { requirements: [req(RequirementType.SpendForce, 1)], gains: [villager()] },
      { requirements: [req(RequirementType.SpendCoins, 3)], gains: [villager()] }
    ]
  },

  [EventTile.Tournament]: {
    abilities: [
      { requirements: [req(RequirementType.SpendForce, 1)], gains: [coins(6)] },
      { requirements: [req(RequirementType.SpendForce, 1)], gains: [vp(4)] }
    ]
  }
}
