/* eslint-disable react-refresh/only-export-components */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Period } from '@gamepark/greylune/material/Period'
import { ReactNode } from 'react'
import { AdventurerIcon, CoinIcon, ForceIcon, MagicIcon, SealIcon, VillagerIcon, VpIcon } from '../../components/Icons'
import { colors } from '../../theme/colors'
import { fontDisplay } from '../../theme/typography'
import { AdventurerLink, ForceLink, MagicLink, VillagerLink } from './HelpLinks'

/**
 * What every help dialog of the game is built out of.
 *
 * The cards of Greylune carry no printed word: a cost, a few symbols, a number in a laurel, and
 * nothing else. So the dialog is not a reminder of what the card says — it *is* what the card says,
 * and it is the only place a player can read it. Which makes two things matter more than they
 * usually would.
 *
 * The first is that a sentence must be a sentence. The texts are the ones of the rulebook appendix,
 * written whole in the translation files rather than assembled here out of fragments: a language
 * that puts its verb last, or declines the thing being spent, has to be free to rewrite the line
 * instead of filling in blanks. Everything this file provides is therefore layout and icons, never
 * grammar.
 *
 * The second is that the pieces named in those sentences are the pieces on the table. `<coin/>`,
 * `<force/>`, `<seal/>` and the rest are the very images the player is looking at (see
 * {@link Icons}), which is what lets a line stay short and still be unambiguous. The Adventurer and
 * the Villagers are written out instead, as the rulebook writes them, and Force and Magic are given
 * their word after their symbol: each word leads to the dialog of the piece itself (see
 * {@link helpTexts}).
 */

/** The period a card belongs to, as the back of the card and the rulebook write it. */
export const romanNumeral: Record<Period, string> = { [Period.I]: 'I', [Period.II]: 'II', [Period.III]: 'III' }

/**
 * The pieces a text may name, as `<coin/>`, `<vp/>`, `<force/>`… in the translation files, all drawn:
 * what a button or a menu reads the texts of the material with, where every word counts.
 */
export const helpIcons = {
  coin: <CoinIcon />,
  vp: <VpIcon />,
  force: <ForceIcon />,
  magic: <MagicIcon />,
  villager: <VillagerIcon />,
  adventurer: <AdventurerIcon />,
  seal: <SealIcon />
}

/**
 * The same pieces as a help dialog names them: the Adventurer and the Villagers in the rulebook's
 * words, Force and Magic in their symbol followed by their word, each word a link to the dialog of the
 * reader's own piece (see {@link HelpLinks}); the rest drawn.
 */
export const helpTexts = {
  ...helpIcons,
  force: <ForceLink />,
  magic: <MagicLink />,
  villager: <VillagerLink />,
  adventurer: <AdventurerLink />
}

export const helpDialogCss = css`
  min-width: 20em;
  max-width: 34em;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  color: ${colors.ink};
`

/**
 * The name of the card, and under it what kind of card it is. The accent is the colour the card
 * itself is framed in, so that the dialog and the piece next to it read as the same object.
 */
export const HelpTitle = ({ accent, name, subtitle, aside }: { accent: string; name: ReactNode; subtitle?: ReactNode; aside?: ReactNode }) => (
  <div css={titleCss(accent)}>
    <div css={titleRowCss}>
      <h2 css={nameCss}>{name}</h2>
      {aside !== undefined && <span css={asideCss}>{aside}</span>}
    </div>
    {subtitle !== undefined && <div css={subtitleCss}>{subtitle}</div>}
  </div>
)

const titleCss = (accent: string) => css`
  border-left: 0.25em solid ${accent};
  padding: 0 0 0 0.6em;
`

const titleRowCss = css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6em;
`

const nameCss = css`
  margin: 0;
  font-family: ${fontDisplay};
  font-size: 1.5em;
  font-weight: 600;
  line-height: 1.2;
`

const asideCss = css`
  flex-shrink: 0;
  font-size: 0.85em;
  font-weight: 600;
  letter-spacing: 0.05em;
  opacity: 0.55;
  white-space: nowrap;
`

const subtitleCss = css`
  font-size: 0.9em;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  opacity: 0.6;
`

/**
 * One line of figures: what the card costs, what it still carries. Kept apart from the sections
 * below because it is the state of this very card rather than what is printed on every copy of it.
 */
export const HelpFacts = ({ children }: { children: ReactNode }) => <div css={factsCss}>{children}</div>

export const HelpFact = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div css={factCss}>
    <span css={factLabelCss}>{label}</span>
    <span css={factValueCss}>{children}</span>
  </div>
)

const factsCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
`

const factCss = css`
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.25em 0.6em;
  border-radius: 0.3em;
  background: ${colors.wash};
`

const factLabelCss = css`
  font-size: 0.8em;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  opacity: 0.6;
`

const factValueCss = css`
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.2em;
`

/**
 * What the card does, one heading per kind of effect: immediate, ability, reaction, permanent, score.
 *
 * `mark` is a picture of what the heading is about, set beside it: the personal board shows the very
 * mark each of its sections names (see {@link PlayerBoardHelp}). It is drawn outside the heading
 * rather than inside it, so that the ink of a picture does not fade with the type.
 */
export const HelpSection = ({ title, mark, children }: { title: ReactNode; mark?: ReactNode; children: ReactNode }) => (
  <section css={sectionCss}>
    <HelpHeading mark={mark}>{title}</HelpHeading>
    <p css={sectionTextCss}>{children}</p>
  </section>
)

const HelpHeading = ({ mark, children }: { mark?: ReactNode; children: ReactNode }) =>
  mark === undefined ? (
    <h3 css={[sectionTitleCss, headingSpacingCss]}>{children}</h3>
  ) : (
    <div css={[headingRowCss, headingSpacingCss]}>
      {mark}
      <h3 css={sectionTitleCss}>{children}</h3>
    </div>
  )

const headingRowCss = css`
  display: flex;
  align-items: center;
  gap: 0.5em;
`

const headingSpacingCss = css`
  margin: 0 0 0.15em;
`

const sectionCss = css`
  &:not(:first-of-type) {
    border-top: 0.06em solid ${colors.rule};
    padding-top: 0.5em;
  }
`

const sectionTitleCss = css`
  margin: 0;
  font-size: 0.8em;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.6;
`

const sectionTextCss = css`
  margin: 0;
  line-height: 1.5;
`

/**
 * The two scrolls at the foot of an Encounter card, laid out the way they are printed: what the
 * Encounter asks for on the left, what it pays on the right, and one row per half of the card.
 *
 * A card with two halves is one table of two rows rather than two blocks, because the choice a
 * player makes there is between the rows — either, or both — and a table is what shows a choice.
 */
export const HelpOutcomes = ({ requirement, reward, children }: { requirement: ReactNode; reward: ReactNode; children: ReactNode }) => (
  <div css={outcomesCss}>
    <span css={[outcomeHeaderCss, outcomeLeftCss]}>{requirement}</span>
    <span />
    <span css={outcomeHeaderCss}>{reward}</span>
    {children}
  </div>
)

export const HelpOutcome = ({ requirement, reward }: { requirement: ReactNode; reward: ReactNode }) => (
  <>
    <span css={[outcomeCellCss, outcomeLeftCss]}>{requirement}</span>
    <span css={outcomeArrowCss}>→</span>
    <span css={outcomeCellCss}>{reward}</span>
  </>
)

const outcomesCss = css`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: baseline;
  gap: 0.3em 0.5em;
`

const outcomeHeaderCss = css`
  font-size: 0.8em;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.6;
`

const outcomeCellCss = css`
  line-height: 1.4;
  padding-top: 0.35em;
  border-top: 0.06em solid ${colors.rule};
`

/** The left column is what is given up, and reads as such: quieter than what it buys. */
const outcomeLeftCss = css`
  opacity: 0.8;
`

const outcomeArrowCss = css`
  padding-top: 0.35em;
  opacity: 0.45;
`

/**
 * The options a piece offers when none of them asks for anything: the two halves of the Banquet, the
 * five free spaces of the Festival. A table of costs facing rewards would be a column of dashes, so
 * these are simply listed, and choosing between them is what placing the Villager does.
 */
export const HelpList = ({ title, mark, children }: { title: ReactNode; mark?: ReactNode; children: ReactNode }) => (
  <section css={sectionCss}>
    <HelpHeading mark={mark}>{title}</HelpHeading>
    <ul css={listCss}>{children}</ul>
  </section>
)

export const HelpListItem = ({ children }: { children: ReactNode }) => <li css={listItemCss}>{children}</li>

const listCss = css`
  margin: 0;
  padding: 0;
  list-style: none;
`

const listItemCss = css`
  line-height: 1.5;
  padding: 0.25em 0 0.25em 1em;
  position: relative;

  &:not(:last-of-type) {
    border-bottom: 0.06em solid ${colors.rule};
  }

  &::before {
    content: '';
    position: absolute;
    left: 0.15em;
    top: 0.75em;
    width: 0.35em;
    height: 0.35em;
    border-radius: 50%;
    background: ${colors.gold};
  }
`

/**
 * The rule the card is an instance of, rather than the card itself: what a Tavern pays by tiers,
 * how many Objects a player may keep. Set apart so that a player who already knows can skip it.
 */
export const HelpNote = ({ children }: { children: ReactNode }) => <p css={noteCss}>{children}</p>

const noteCss = css`
  margin: 0;
  font-size: 0.9em;
  line-height: 1.45;
  font-style: italic;
  opacity: 0.75;
`

/** Said when a card can no longer be used at all, and so worth more than the shade of a note. */
export const HelpWarning = ({ children }: { children: ReactNode }) => <p css={warningCss}>{children}</p>

const warningCss = css`
  margin: 0;
  padding: 0.35em 0.6em;
  border-radius: 0.3em;
  background: ${colors.crimsonLight};
  color: ${colors.crimsonDeep};
  font-size: 0.9em;
  line-height: 1.45;
`
