/** @jsxImportSource @emotion/react */
import { ReactElement } from 'react'
import { Trans } from 'react-i18next'
import { CoinIcon, EventIcon, ForceIcon, MagicIcon, QuestIcon, SpecialActionIcon, StoryIcon, VillagerIcon, VpIcon, WithdrawIcon } from '../components/Icons'
import { logIconCss } from './logCss'

/**
 * One sentence of the journal, written with the symbols the game prints rather than with the words
 * they stand for, as the header bar and the buttons are (see {@link Icons}).
 *
 * The pieces a sentence names are not part of the fixed set below: they are handed in as
 * `components`, since each of them is one piece of the table, and opens the help of that very piece
 * (see {@link MaterialLinks}).
 */
export const LogText = ({ code, values, components }: { code: string; values?: Record<string, unknown>; components?: Record<string, ReactElement> }) => (
  <Trans i18nKey={code} values={values} components={{ ...logIcons, ...components }} />
)

const logIcons = {
  coin: <CoinIcon css={logIconCss} />,
  vp: <VpIcon css={logIconCss} />,
  force: <ForceIcon css={logIconCss} />,
  magic: <MagicIcon css={logIconCss} />,
  villager: <VillagerIcon css={logIconCss} />,
  story: <StoryIcon css={logIconCss} />,
  quest: <QuestIcon css={logIconCss} />,
  event: <EventIcon css={logIconCss} />,
  camp: <WithdrawIcon css={logIconCss} />
}
