import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

/**
 * The same seam as the personal board's spec, on the Season board.
 *
 * Most of the dialog is the 4 scrolls of the board written out in the rulebook's words (see
 * {@link SeasonBoardHelp}): the actions of Spring and Summer, and the steps of Winter and Autumn. The rules hold no list of them to count, so the dialog counts them itself, and the
 * count is restated below — a line added to the translations without the dialog drawing it, or the
 * other way round, fails at once.
 *
 * Checked in the developer's own language; the other locales are translated from it in one pass
 * before release (see `CLAUDE.md`).
 */

const texts = JSON.parse(readFileSync(new URL('../../../public/translation/fr.json', import.meta.url), 'utf-8'))
const board = texts['help']['season-board'] as Record<string, Record<string, string>>

/** The lines each scroll prints, and whether the dialog adds a note under it. */
const seasons: Record<string, { lines: number; note: boolean }> = {
  winter: { lines: 6, note: true },
  spring: { lines: 3, note: false },
  summer: { lines: 6, note: false },
  autumn: { lines: 4, note: true }
}

/** The zones written as a sentence rather than a list. */
const zones = ['markers', 'camp']

describe('The Season board is written out zone by zone', () => {
  it.each(['name', 'year', 'period'])('says its %s', (key) => {
    expect(board[key]).toBeTypeOf('string')
  })

  it.each(zones)('zone %s has a heading and a sentence', (zone) => {
    expect(Object.keys(board[zone]).sort()).toEqual(['name', 'text'])
  })

  it.each(Object.entries(seasons))('the %s scroll has a heading and exactly its lines', (season, { lines, note }) => {
    const keys = ['name', ...Array.from({ length: lines }, (_, line) => `${line}`), ...(note ? ['text'] : [])]
    expect(Object.keys(board[season]).sort()).toEqual(keys.sort())
  })

  it('has nothing to say about a zone the dialog does not draw', () => {
    expect(Object.keys(board).sort()).toEqual(['name', 'year', 'period', ...zones, ...Object.keys(seasons)].sort())
  })
})
