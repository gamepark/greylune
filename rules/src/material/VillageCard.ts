import { Period } from './Period'

/**
 * The 49 Village cards. The hundreds digit carries the card type, so a card knows what it is
 * without a lookup table (see {@link getVillageCardType}).
 */
export enum VillageCard {
  Building1 = 101,
  Building2,
  Building3,
  Building4,
  Building5,
  Building6,
  Building7,
  Building8,
  Building9,
  Building10,
  Building11,
  Building12,
  Building13,
  Building14,
  Building15,
  Building16,
  Item1 = 201,
  Item2,
  Item3,
  Item4,
  Item5,
  Item6,
  Item7,
  Item8,
  Item9,
  Item10,
  Item11,
  Item12,
  Item13,
  Item14,
  Item15,
  Item16,
  Item17,
  Item18,
  Item19,
  Item20,
  Item21,
  Item22,
  Companion1 = 301,
  Companion2,
  Companion3,
  Companion4,
  Companion5,
  Companion6,
  Companion7,
  Companion8,
  Companion9,
  Companion10,
  Companion11
}

export enum VillageCardType {
  Building = 1,
  Item,
  Companion
}

/**
 * A Village card in the deck shows nothing but its period: {@link hideFront} keeps the back so the
 * right deck cover is displayed.
 */
export type VillageCardId = { front?: VillageCard; back: Period }

export const getVillageCardType = (card: VillageCard): VillageCardType => Math.floor(card / 100)

export const getVillageCardNumber = (card: VillageCard): number => card % 100

export const villageCardsOfPeriod: Record<Period, VillageCard[]> = {
  [Period.I]: [
    VillageCard.Building1,
    VillageCard.Building2,
    VillageCard.Building3,
    VillageCard.Building4,
    VillageCard.Building5,
    VillageCard.Building6,
    VillageCard.Item1,
    VillageCard.Item2,
    VillageCard.Item3,
    VillageCard.Item4,
    VillageCard.Item5,
    VillageCard.Item6,
    VillageCard.Item7,
    VillageCard.Item8,
    VillageCard.Companion1,
    VillageCard.Companion2,
    VillageCard.Companion3,
    VillageCard.Companion4,
    VillageCard.Companion5,
    VillageCard.Companion6
  ],
  [Period.II]: [
    VillageCard.Building7,
    VillageCard.Building8,
    VillageCard.Building9,
    VillageCard.Building10,
    VillageCard.Building11,
    VillageCard.Building12,
    VillageCard.Item9,
    VillageCard.Item10,
    VillageCard.Item11,
    VillageCard.Item12,
    VillageCard.Item13,
    VillageCard.Item14,
    VillageCard.Item15,
    VillageCard.Item16,
    VillageCard.Item17,
    VillageCard.Companion7,
    VillageCard.Companion8,
    VillageCard.Companion9,
    VillageCard.Companion10,
    VillageCard.Companion11
  ],
  [Period.III]: [
    VillageCard.Building13,
    VillageCard.Building14,
    VillageCard.Building15,
    VillageCard.Building16,
    VillageCard.Item18,
    VillageCard.Item19,
    VillageCard.Item20,
    VillageCard.Item21,
    VillageCard.Item22
  ]
}

export const getVillageCardPeriod = (card: VillageCard): Period =>
  villageCardsOfPeriod[Period.I].includes(card) ? Period.I : villageCardsOfPeriod[Period.II].includes(card) ? Period.II : Period.III
