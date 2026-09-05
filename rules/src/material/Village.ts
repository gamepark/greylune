import { Location } from '@gamepark/rules-api'
import { range } from 'es-toolkit'
import { VILLAGE_GRID_SIDE } from '../Constants'
import { PlayerColor } from '../PlayerColor'
import { LocationType } from './LocationType'
import { MaterialSource } from './MaterialSource'
import { MaterialType } from './MaterialType'

/** A slot of the 3x3 grid, whether a card still stands on it or not. */
export type Slot = { x: number; y: number }

/**
 * A gap between two neighbouring slots, named by the point halfway between them: exactly one of its
 * two coordinates is a half, and it says at once where the gap is and which way it runs.
 */
export type Gap = { x: number; y: number }

/** The 12 gaps of the grid: 6 between columns, 6 between rows. */
export const villageGaps: Gap[] = [
  ...range(VILLAGE_GRID_SIDE - 1).flatMap((x) => range(VILLAGE_GRID_SIDE).map((y) => ({ x: x + 0.5, y }))),
  ...range(VILLAGE_GRID_SIDE).flatMap((x) => range(VILLAGE_GRID_SIDE - 1).map((y) => ({ x, y: y + 0.5 })))
]

/** The 2 slots a gap lies between: its halved coordinate rounded down, then up. */
export const gapSlots = (gap: Gap): [Slot, Slot] => [
  { x: Math.floor(gap.x), y: Math.floor(gap.y) },
  { x: Math.ceil(gap.x), y: Math.ceil(gap.y) }
]

/** The 4 gaps that touch a slot: the ones on either side of it, above it and below it. */
export const slotGaps = (slot: Slot): Gap[] => villageGaps.filter((gap) => gapSlots(gap).some((other) => other.x === slot.x && other.y === slot.y))

export const isSameGap = (location: Partial<Location<PlayerColor, LocationType>>, gap: Gap): boolean =>
  location.type === LocationType.VillageGap && location.x === gap.x && location.y === gap.y

/** The card standing on a slot, if the year has not taken it away yet. */
export const cardOnSlot = (source: MaterialSource, slot: Slot) =>
  source
    .material(MaterialType.VillageCard)
    .location(LocationType.VillageGrid)
    .filter((item) => item.location.x === slot.x && item.location.y === slot.y)

/**
 * The Villagers standing in a gap, whoever they belong to. A gap keeps its Villagers even once both
 * its cards have been taken: they are simply worth nothing there any more (rulebook p.7).
 */
export const villagersInGap = (source: MaterialSource, gap: Gap) =>
  source
    .material(MaterialType.Villager)
    .location(LocationType.VillageGap)
    .filter((item) => isSameGap(item.location, gap))

/** Every Villager standing next to a card: the ones in the 4 gaps that touch its slot. */
export const villagersAroundSlot = (source: MaterialSource, slot: Slot) =>
  source
    .material(MaterialType.Villager)
    .location(LocationType.VillageGap)
    .filter((item) => slotGaps(slot).some((gap) => isSameGap(item.location, gap)))

/**
 * The cards a Villager standing in a gap can reach: the ones still on the 2 slots it lies between.
 * Both may be gone, and then the Villager designates nothing (rulebook p.7).
 */
export const cardsAroundGap = (source: MaterialSource, gap: Gap): number[] => gapSlots(gap).flatMap((slot) => cardOnSlot(source, slot).getIndexes())

/** Where a Villager stands, read back as a gap. */
export const gapOf = (location: Partial<Location<PlayerColor, LocationType>>): Gap => ({ x: location.x ?? 0, y: location.y ?? 0 })
