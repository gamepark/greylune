/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { EncounterCardId } from '@gamepark/greylune/material/EncounterCard'
import { EventTile } from '@gamepark/greylune/material/EventTile'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { QuestTile } from '@gamepark/greylune/material/QuestTile'
import { VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { linkButtonCss, usePlay } from '@gamepark/react-game'
import { MaterialItem, MaterialMoveBuilder } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { colors } from '../theme/colors'

type Item = Partial<MaterialItem<PlayerColor, LocationType>>

/**
 * A piece named inside an entry, clicked to open the help of that piece.
 *
 * The item is handed over as it was when the move was played rather than by its index: a journal is
 * read long after the fact, and the card it names may by then have left the Village, or the game.
 * Only the id is kept of a card, for the same reason — its help reads the Seals and the crowd around
 * a card still in the Village, and a card named by the journal is not that card any more.
 */
const HelpLink = ({ type, item, children }: { type: MaterialType; item: Item; children: ReactNode }) => {
  const play = usePlay()
  return (
    <button css={[linkButtonCss, nameCss]} onClick={() => play(MaterialMoveBuilder.displayMaterialHelp(type, item), { transient: true })}>
      {children}
    </button>
  )
}

/**
 * The cards and the tiles carry a name, which the help dialogs are titled with: it is what the
 * journal calls them by. A plain button rather than a `PlayMoveButton`, which would dress it as one
 * of the theme's emerald buttons (see `HelpLinks`).
 */
const nameCss = css`
  background: none;
  font: inherit;
  font-weight: bold;
  color: ${colors.goldLight};
`

export const VillageCardName = ({ id }: { id?: VillageCardId }) => {
  const { t } = useTranslation()
  if (id?.front === undefined) return null
  return (
    <HelpLink type={MaterialType.VillageCard} item={{ id }}>
      {t(`village-card.${id.front}.name`)}
    </HelpLink>
  )
}

export const EncounterCardName = ({ id }: { id?: EncounterCardId }) => {
  const { t } = useTranslation()
  if (id?.front === undefined) return null
  return (
    <HelpLink type={MaterialType.EncounterCard} item={{ id }}>
      {t(`encounter-card.${id.front}.name`)}
    </HelpLink>
  )
}

export const EventTileName = ({ tile }: { tile?: EventTile }) => {
  const { t } = useTranslation()
  if (tile === undefined) return null
  return (
    <HelpLink type={MaterialType.EventTile} item={{ id: tile }}>
      {t(`event-tile.${tile}.name`)}
    </HelpLink>
  )
}

/** A Quest keeps its space: what it is worth is printed under the space it was dealt, and its help reads it there. */
export const QuestTileName = ({ item }: { item?: Item }) => {
  const { t } = useTranslation()
  if (item?.id === undefined) return null
  return (
    <HelpLink type={MaterialType.QuestTile} item={item}>
      {t(`quest-tile.${item.id as QuestTile}.name`)}
    </HelpLink>
  )
}

/**
 * The tokens have no name, only what is printed on them: they are drawn, and the drawing is the link.
 * Nothing at all for a token the reader may not see.
 */
export const TokenPicture = ({ type, item, src }: { type: MaterialType; item?: Item; src?: string }) => {
  if (item === undefined || src === undefined) return null
  return (
    <HelpLink type={type} item={item}>
      <img src={src} alt="" css={tokenCss} />
    </HelpLink>
  )
}

/** A token is a round piece full of detail: a little higher than the symbols, so that what it pays reads. */
const tokenCss = css`
  height: 1.8em;
  width: auto;
  vertical-align: -0.6em;
`

/** A piece of a player drawn in their sentence: the Adventurer walking, the Villager placed. Not a link, its help being the same for all. */
export const PiecePicture = ({ src }: { src?: string }) => (src === undefined ? null : <img src={src} alt="" css={pieceCss} />)

const pieceCss = css`
  height: 1.6em;
  width: auto;
  vertical-align: -0.5em;
`
