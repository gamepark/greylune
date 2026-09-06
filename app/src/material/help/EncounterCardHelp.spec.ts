import { EncounterCard, encounterCardData } from '@gamepark/greylune/material/EncounterCard'
import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

/**
 * The same seam as {@link VillageCardHelp.spec}, on the Encounter cards: the dialog draws one row per
 * half of the card and asks the translation files for the two sentences that fill it, so a half that
 * gains a condition — or loses its reward — must not be left with an empty cell.
 *
 * Checked in the developer's own language; the other locales are translated from it in one pass
 * before release (see `CLAUDE.md`).
 */

const texts: Record<string, Record<string, unknown>> = JSON.parse(readFileSync(new URL('../../../public/translation/fr.json', import.meta.url), 'utf-8'))[
  'encounter-card'
]

/** The keys the card's own data says it should have: the name, then each half that says something. */
const expectedKeys = (card: EncounterCard): string[] => {
  const keys = ['name']
  encounterCardData[card].outcomes.forEach((outcome, index) => {
    if (outcome.requirements?.length || outcome.gains?.length) keys.push(String(index))
  })
  return keys
}

const expectedHalf = (card: EncounterCard, index: number): string[] => {
  const outcome = encounterCardData[card].outcomes[index]
  return [...(outcome.requirements?.length ? ['requirement'] : []), ...(outcome.gains?.length ? ['reward'] : [])]
}

/** The 41 cards, taken from the data rather than from the enum, so a new one cannot be forgotten. */
const allCards = Object.keys(encounterCardData).map(Number) as EncounterCard[]

describe('Every Encounter card is written out in full', () => {
  it.each(allCards)('card %i says exactly what its data holds', (card) => {
    const entry = texts[card] ?? {}
    expect(Object.keys(entry).sort()).toEqual(expectedKeys(card).sort())
    encounterCardData[card].outcomes.forEach((_, index) => {
      const half = entry[String(index)]
      if (half !== undefined) expect(Object.keys(half as object).sort()).toEqual(expectedHalf(card, index).sort())
    })
  })

  it('has nothing to say about a card that does not exist', () => {
    expect(Object.keys(texts).map(Number).sort()).toEqual([...allCards].sort())
  })
})
