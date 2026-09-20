import { css } from '@emotion/react'
import {
  FailuresDialog,
  FullscreenDialog,
  LiveLogContainer,
  LoadingScreen,
  MaterialGameSounds,
  MaterialHeader,
  MaterialImageLoader,
  Menu,
  useGame
} from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { useEffect, useState } from 'react'
import { GameDisplay } from './GameDisplay'
import { Headers } from './headers/Headers'

export function App() {
  const game = useGame<MaterialGame>()
  const [isJustDisplayed, setJustDisplayed] = useState(true)
  const [isImagesLoading, setImagesLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setJustDisplayed(false), process.env.NODE_ENV === 'development' ? 0 : 2000)
  }, [])
  const loading = !game || isJustDisplayed || isImagesLoading
  return (
    <>
      {!!game && <GameDisplay />}
      <LoadingScreen display={loading} />
      <MaterialHeader rulesStepsHeaders={Headers} loading={loading} />
      <MaterialImageLoader onImagesLoad={() => setImagesLoading(false)} />
      <MaterialGameSounds />
      <Menu />
      <FailuresDialog />
      <FullscreenDialog />
      {!loading && <LiveLogContainer css={liveLogCss} />}
    </>
  )
}

/**
 * The last entries of the journal, shown on the table as they are played: top left, right under the
 * header. It never takes a click, so the Village cards it may cover stay within reach.
 */
const liveLogCss = css`
  position: absolute;
  top: 3em;
  left: 1em;
  width: 30em;
  pointer-events: none;
`
