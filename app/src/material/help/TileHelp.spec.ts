import { EventTile, eventTileData } from '@gamepark/greylune/material/EventTile'
import { QuestTile, questRequirements } from '@gamepark/greylune/material/QuestTile'
import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

/**
 * The same seam as the two card specs, on the tiles. An Event tile draws one line per option it
 * offers and a Heroic Quest one line for what it asks, and both take those sentences from the
 * translation files: an option added or a condition dropped must not leave an empty line behind.
 *
 * Checked in the developer's own language; the other locales are translated from it in one pass
 * before release (see `CLAUDE.md`).
 */

const texts = JSON.parse(readFileSync(new URL('../../../public/translation/fr.json', import.meta.url), 'utf-8'))

const events: Record<string, Record<string, unknown>> = texts['event-tile']
const quests: Record<string, Record<string, unknown>> = texts['quest-tile']

const allEvents = Object.keys(eventTileData).map(Number) as EventTile[]
const allQuests = Object.keys(questRequirements).map(Number) as QuestTile[]

describe('Every Event tile is written out in full', () => {
  it.each(allEvents)('tile %i lists exactly the options it offers', (tile) => {
    const entry = events[tile] ?? {}
    const abilities = eventTileData[tile].abilities
    expect(Object.keys(entry).sort()).toEqual(['name', ...abilities.map((_, index) => String(index))].sort())
    abilities.forEach((ability, index) => {
      const option = entry[String(index)] as object | undefined
      /** Every option pays something; only some of them ask for anything first. */
      expect(Object.keys(option ?? {}).sort()).toEqual([...(ability.requirements?.length ? ['requirement'] : []), 'reward'].sort())
    })
  })

  it('has nothing to say about a tile that does not exist', () => {
    expect(Object.keys(events).map(Number).sort()).toEqual([...allEvents].sort())
  })
})

describe('Every Heroic Quest is written out in full', () => {
  it.each(allQuests)('quest %i has a name and a condition', (quest) => {
    expect(Object.keys(quests[quest] ?? {}).sort()).toEqual(['name', 'requirement'].sort())
  })

  it('has nothing to say about a quest that does not exist', () => {
    expect(Object.keys(quests).map(Number).sort()).toEqual([...allQuests].sort())
  })
})
