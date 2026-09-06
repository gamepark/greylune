import { getVillageCardType, VillageCard, villageCardData, VillageCardType } from '@gamepark/greylune/material/VillageCard'
import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

/**
 * The help dialog is the only place a Village card can be read: the printed card carries symbols and
 * nothing else (see {@link VillageCardHelp}). Which headings it shows is decided by the card's data,
 * and the sentences under them live in the translation files — so a card that gains an ability, or
 * loses one, silently ends up with a heading over an empty line, or with a line nobody displays.
 *
 * This is the seam between the two, checked in the developer's own language. The other locales are
 * translated from it in one pass before release (see `CLAUDE.md`), and are not the concern here.
 */

const texts: Record<string, Record<string, string>> = JSON.parse(readFileSync(new URL('../../../public/translation/fr.json', import.meta.url), 'utf-8'))[
  'village-card'
]

/** The keys the card's own data says it should have, in the order the dialog reads them. */
const expectedKeys = (card: VillageCard): string[] => {
  const data = villageCardData[card]
  const keys = ['name']
  if (getVillageCardType(card) === VillageCardType.Companion) keys.push('role')
  if (data.immediate) keys.push('immediate')
  if (data.abilities?.length) keys.push('ability')
  if (data.reaction) keys.push('reaction')
  if (data.permanent) keys.push('permanent')
  if (data.score) keys.push('score')
  return keys
}

/** The 49 cards, taken from the data rather than from the enum, so a new one cannot be forgotten. */
const allCards = Object.keys(villageCardData).map(Number) as VillageCard[]

describe('Every Village card is written out in full', () => {
  it.each(allCards)('card %i says exactly what its data holds', (card) => {
    expect(Object.keys(texts[card] ?? {}).sort()).toEqual(expectedKeys(card).sort())
  })

  it('has nothing to say about a card that does not exist', () => {
    expect(Object.keys(texts).map(Number).sort()).toEqual([...allCards].sort())
  })
})
