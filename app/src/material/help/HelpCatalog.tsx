/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { linkButtonCss, MaterialComponent, pointerCursorCss, usePlay } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { colors } from '../../theme/colors'

/**
 * Every piece of a kind the box holds, drawn small, each one opening its own dialog.
 *
 * The decks and the Event pile are face down, so what can come out of them cannot be read off the
 * table: the dialog of the pile is where a player looks it up. The piece is drawn with no location —
 * it is the printed card, not a copy of it lying somewhere — so its dialog says what every copy says,
 * and nothing of the state of one.
 *
 * `scale` shrinks the pieces to fit the dialog: a row of Encounters takes less than a row of Village
 * cards, and the Event tiles are larger than both.
 */
export const HelpCatalog = <Id,>({ title, aside, type, ids, scale }: { title: ReactNode; aside?: ReactNode; type: MaterialType; ids: Id[]; scale: number }) => {
  const play = usePlay()
  return (
    <section css={sectionCss}>
      <div css={headingCss}>
        <h3 css={titleCss}>{title}</h3>
        {aside !== undefined && <span css={asideCss}>{aside}</span>}
      </div>
      <ul css={gridCss(scale)}>
        {ids.map((id, index) => (
          <li key={index}>
            <MaterialComponent
              type={type}
              itemId={id}
              css={pointerCursorCss}
              onClick={() => play(MaterialMoveBuilder.displayMaterialHelp(type, { id }), { transient: true })}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

const sectionCss = css`
  border-top: 0.06em solid ${colors.rule};
  padding-top: 0.5em;
`

const headingCss = css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6em;
  margin: 0 0 0.3em;
`

const titleCss = css`
  margin: 0;
  font-size: 0.8em;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.6;
`

const asideCss = css`
  font-size: 0.8em;
  font-weight: 600;
  opacity: 0.55;
  white-space: nowrap;
`

/** Lifted on hover, like a card of the table: room is left above and below so the dialog does not clip it. */
const gridCss = (scale: number) => css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  margin: 0;
  padding: 0.3em 0 0.4em;
  list-style: none;
  font-size: ${scale}em;

  li {
    display: flex;
    transition: transform 0.18s cubic-bezier(0.3, 1.4, 0.4, 1);
  }

  li:hover {
    transform: translateY(-0.25em);
    z-index: 1;
  }
`

/**
 * The way back from the dialog of one piece to the dialog of its pile, where every piece of the kind
 * is listed: the last line of the dialog, as discreet as the links of the texts (see {@link HelpLinks}).
 */
export const HelpCatalogLink = ({ pile, children }: { pile: LocationType; children: ReactNode }) => {
  const play = usePlay()
  return (
    <button css={[linkButtonCss, catalogLinkCss]} onClick={() => play(MaterialMoveBuilder.displayLocationHelp({ type: pile }), { transient: true })}>
      {children}
    </button>
  )
}

const catalogLinkCss = css`
  align-self: flex-start;
  background: none;
  font: inherit;
  font-size: 0.9em;
`
