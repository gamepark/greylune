import { range } from 'es-toolkit'
import { Distance } from './Distance'
import { Period } from './Period'

/** The 41 Encounter cards. */
export enum EncounterCard {
  Encounter1 = 1,
  Encounter2,
  Encounter3,
  Encounter4,
  Encounter5,
  Encounter6,
  Encounter7,
  Encounter8,
  Encounter9,
  Encounter10,
  Encounter11,
  Encounter12,
  Encounter13,
  Encounter14,
  Encounter15,
  Encounter16,
  Encounter17,
  Encounter18,
  Encounter19,
  Encounter20,
  Encounter21,
  Encounter22,
  Encounter23,
  Encounter24,
  Encounter25,
  Encounter26,
  Encounter27,
  Encounter28,
  Encounter29,
  Encounter30,
  Encounter31,
  Encounter32,
  Encounter33,
  Encounter34,
  Encounter35,
  Encounter36,
  Encounter37,
  Encounter38,
  Encounter39,
  Encounter40,
  Encounter41
}

/**
 * An Encounter card in the deck shows nothing but its period: {@link hideFront} keeps the back so the
 * right deck cover is displayed.
 */
export type EncounterCardId = { front?: EncounterCard; back: Period }

export const encounterCardsOfPeriod: Record<Period, EncounterCard[]> = {
  [Period.I]: range(1, 17),
  [Period.II]: range(17, 33),
  [Period.III]: range(33, 42)
}

export const getEncounterCardPeriod = (card: EncounterCard): Period => (card <= 16 ? Period.I : card <= 32 ? Period.II : Period.III)

/**
 * Where along the road an Encounter is met: read off the banner printed in the top-left corner of
 * every card front.
 */
export const encounterDistance: Record<EncounterCard, Distance> = {
  [EncounterCard.Encounter1]: Distance.Gold,
  [EncounterCard.Encounter2]: Distance.Gold,
  [EncounterCard.Encounter3]: Distance.Purple,
  [EncounterCard.Encounter4]: Distance.Green,
  [EncounterCard.Encounter5]: Distance.Purple,
  [EncounterCard.Encounter6]: Distance.Gold,
  [EncounterCard.Encounter7]: Distance.Green,
  [EncounterCard.Encounter8]: Distance.Gold,
  [EncounterCard.Encounter9]: Distance.Green,
  [EncounterCard.Encounter10]: Distance.Gold,
  [EncounterCard.Encounter11]: Distance.Green,
  [EncounterCard.Encounter12]: Distance.Purple,
  [EncounterCard.Encounter13]: Distance.Red,
  [EncounterCard.Encounter14]: Distance.Purple,
  [EncounterCard.Encounter15]: Distance.Red,
  [EncounterCard.Encounter16]: Distance.Green,
  [EncounterCard.Encounter17]: Distance.Gold,
  [EncounterCard.Encounter18]: Distance.Green,
  [EncounterCard.Encounter19]: Distance.Purple,
  [EncounterCard.Encounter20]: Distance.Red,
  [EncounterCard.Encounter21]: Distance.Purple,
  [EncounterCard.Encounter22]: Distance.Red,
  [EncounterCard.Encounter23]: Distance.Purple,
  [EncounterCard.Encounter24]: Distance.Green,
  [EncounterCard.Encounter25]: Distance.Black,
  [EncounterCard.Encounter26]: Distance.Gold,
  [EncounterCard.Encounter27]: Distance.Red,
  [EncounterCard.Encounter28]: Distance.Green,
  [EncounterCard.Encounter29]: Distance.Purple,
  [EncounterCard.Encounter30]: Distance.Purple,
  [EncounterCard.Encounter31]: Distance.Gold,
  [EncounterCard.Encounter32]: Distance.Black,
  [EncounterCard.Encounter33]: Distance.Gold,
  [EncounterCard.Encounter34]: Distance.Purple,
  [EncounterCard.Encounter35]: Distance.Black,
  [EncounterCard.Encounter36]: Distance.Green,
  [EncounterCard.Encounter37]: Distance.Black,
  [EncounterCard.Encounter38]: Distance.Red,
  [EncounterCard.Encounter39]: Distance.Green,
  [EncounterCard.Encounter40]: Distance.Purple,
  [EncounterCard.Encounter41]: Distance.Red
}
