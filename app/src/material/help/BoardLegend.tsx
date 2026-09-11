/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { HelpList, HelpListItem, HelpNote, HelpSection, helpTexts } from './HelpLayout'

/**
 * What the dialogs of the three boards are written with: a legend.
 *
 * A board is printed in symbols like everything else in the box, and unlike a card it is a place
 * rather than an effect. So its dialog is one heading per printed zone, and under each the sentence
 * that says what the zone is for (see {@link PlayerBoardHelp}, {@link MainBoardHelp},
 * {@link SeasonBoardHelp}). Beside every heading is the mark the zone is printed with, which is what
 * turns a list of paragraphs into a legend: the player reads the word, sees the mark, and finds it on
 * the board without being told where to look.
 *
 * Every zone is named by the prefix of its keys — `help.player-board.companions` — and spelt out in
 * full at the call, so that a key found in the translation files can be searched for in the code.
 */

/**
 * One zone of a board: what it is, and under it the rule it is an instance of, when there is one that
 * the rest of the game states too. The note is a key of its own, quoted rather than copied, and set
 * apart the way it is on a card dialog, so that a player who has already read it can skip it here.
 */
export const Zone = ({ i18nKey, note, mark }: { i18nKey: string; note?: string; mark: ReactNode }) => {
  const { t } = useTranslation()
  return (
    <>
      <HelpSection title={t(`${i18nKey}.name`)} mark={<Mark>{mark}</Mark>}>
        <Trans i18nKey={`${i18nKey}.text`} components={helpTexts} />
      </HelpSection>
      {note !== undefined && <ZoneNote i18nKey={note} />}
    </>
  )
}

/**
 * A zone whose body is a choice or a sequence rather than a sentence — the options of the special
 * action, the actions of a season — so a list, one line per `${i18nKey}.0`, `.1`… The count is the
 * caller's, and is best read off the rules, so that an option taken away from them cannot leave a
 * line behind.
 */
export const ZoneList = ({ i18nKey, count, note, mark }: { i18nKey: string; count: number; note?: string; mark: ReactNode }) => {
  const { t } = useTranslation()
  return (
    <>
      <HelpList title={t(`${i18nKey}.name`)} mark={<Mark>{mark}</Mark>}>
        {Array.from({ length: count }, (_, line) => (
          <HelpListItem key={line}>
            <Trans i18nKey={`${i18nKey}.${line}`} components={helpTexts} />
          </HelpListItem>
        ))}
      </HelpList>
      {note !== undefined && <ZoneNote i18nKey={note} />}
    </>
  )
}

const ZoneNote = ({ i18nKey }: { i18nKey: string }) => (
  <HelpNote>
    <Trans i18nKey={i18nKey} components={helpTexts} />
  </HelpNote>
)

/**
 * The box a heading's mark sits in. The size is set with `font-size` rather than with a height,
 * because every icon of the game draws itself 1 em tall (see {@link Icons}) — so one figure here
 * governs the lot, and a mark made of two symbols keeps them the same size as a mark made of one.
 */
const Mark = ({ children }: { children: ReactNode }) => <span css={markCss}>{children}</span>

const markCss = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.15em;
  font-size: 1.9em;
  line-height: 1;
`
