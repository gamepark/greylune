import { pointerWithin } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { DevToolsHub, GameTable, GameTableNavigation } from '@gamepark/react-game'
import { tableBoundaries } from './locators/TableLayout'

export function GameDisplay() {
  return (
    <>
      <GameTable {...tableBoundaries} collisionAlgorithm={pointerWithin} css={process.env.NODE_ENV === 'development' && tableBorder}>
        <GameTableNavigation />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
    </>
  )
}

const tableBorder = css`
  border: 1px solid white;
`
