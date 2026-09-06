import { pointerWithin } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { DevToolsHub, GameTable, GameTableNavigation, useRules } from '@gamepark/react-game'
import { showsAllBandsFor } from './locators/DisplayedPlayer'
import { getTableBoundaries } from './locators/TableLayout'

export function GameDisplay() {
  const rules = useRules<GreyluneRules>()
  /** The column of player areas is what the table is tall enough for, and it depends on the count. */
  const players = rules?.players.length ?? 4
  const boundaries = getTableBoundaries(players, showsAllBandsFor(players))
  return (
    <>
      <GameTable {...boundaries} collisionAlgorithm={pointerWithin} css={process.env.NODE_ENV === 'development' && tableBorder}>
        <GameTableNavigation />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
    </>
  )
}

const tableBorder = css`
  border: 1px solid white;
`
