import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

/**
 * The same seam as the personal board's spec, on the main board.
 *
 * The dialog is a legend (see {@link MainBoardHelp}): one heading per zone of the board, and under it
 * a sentence that lives in the translation files. A zone renamed here or a sentence dropped there
 * leaves a heading over nothing, so the two lists are checked against one another — along with the
 * rules the dialog quotes from the tile and card dialogs rather than restating them.
 *
 * Checked in the developer's own language; the other locales are translated from it in one pass
 * before release (see `CLAUDE.md`).
 */

const texts = JSON.parse(readFileSync(new URL('../../../public/translation/fr.json', import.meta.url), 'utf-8'))
const help: Record<string, Record<string, unknown>> = texts['help']
const board = help['main-board'] as Record<string, Record<string, string>>

/** The zones the dialog draws, in the order it draws them. */
const zones = ['score', 'bonus', 'village', 'road', 'stops', 'quests', 'event']

/** The rules the dialog quotes from elsewhere rather than restating: they belong to no one dialog. */
const shared = ['help.encounter.note', 'help.quest.note', 'help.event.note']

describe('The main board is written out zone by zone', () => {
  it('names the board itself', () => {
    expect(board.name).toBeTypeOf('string')
  })

  it.each(zones)('zone %s has a heading and a sentence', (zone) => {
    expect(board[zone]?.name).toBeTypeOf('string')
    expect(board[zone]?.text).toBeTypeOf('string')
  })

  it('has nothing to say about a zone the dialog does not draw', () => {
    expect(Object.keys(board).sort()).toEqual(['name', ...zones].sort())
  })

  it('says how the laps of the track are counted apart', () => {
    expect(board.score.note).toBeTypeOf('string')
  })
})

describe('The rules quoted from elsewhere are still there', () => {
  it.each(shared)('%s is a sentence of its own', (key) => {
    const value = key.split('.').reduce<unknown>((node, step) => (node as Record<string, unknown>)?.[step], { help })
    expect(value).toBeTypeOf('string')
  })
})
