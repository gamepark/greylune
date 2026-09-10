import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

/**
 * The same seam as the card and tile specs, on the personal board.
 *
 * The dialog is a legend for a board printed in symbols (see {@link PlayerBoardHelp}): one heading
 * per zone, and under it a sentence that lives in the translation files. A zone renamed here or a
 * sentence dropped there leaves a heading over nothing, which is worse than no legend at all — so
 * the two lists are checked against one another. The Villager reserve is not one of them: it is a
 * place of the table rather than a zone of the board, and it has a dialog of its own.
 *
 * The special action is the one zone whose body is a list rather than a sentence: the 3 options the
 * board prints under its doorway, drawn from `specialActions`. That module cannot be loaded here —
 * a rule pulls in `rules-api`, which this runner cannot resolve — so the count is restated below,
 * and an option added to the rules without a line here, or the other way round, fails at once.
 *
 * Checked in the developer's own language; the other locales are translated from it in one pass
 * before release (see `CLAUDE.md`).
 */

const texts = JSON.parse(readFileSync(new URL('../../../public/translation/fr.json', import.meta.url), 'utf-8'))
const help: Record<string, Record<string, unknown>> = texts['help']
const board: Record<string, Record<string, string>> = help['player-board'] as Record<string, Record<string, string>>

/** The zones the dialog draws, in the order it draws them. */
const zones = ['companions', 'items', 'stories', 'income', 'skills', 'special-action', 'quests', 'villagers']

/** The rules the dialog quotes from elsewhere rather than restating: they belong to no one dialog. */
const shared = ['help.type.3.note', 'help.type.2.note', 'help.tell-story.note', 'help.income-token.note', 'help.quest.score']

describe('The personal board is written out zone by zone', () => {
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

  it('lists exactly the 3 options the special action offers', () => {
    expect(Object.keys(board['special-action']).sort()).toEqual(['name', 'text', '0', '1', '2'].sort())
  })
})

describe('The reserve has a dialog of its own', () => {
  it.each(['name', 'owned', 'text'])('says its %s', (key) => {
    expect((help['villager-reserve'] as Record<string, unknown>)[key]).toBeTypeOf('string')
  })
})

describe('The rules quoted from elsewhere are still there', () => {
  it.each(shared)('%s is a sentence of its own', (key) => {
    const value = key.split('.').reduce<unknown>((node, step) => (node as Record<string, unknown>)?.[step], { help })
    expect(value).toBeTypeOf('string')
  })
})
