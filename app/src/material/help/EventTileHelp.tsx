/** @jsxImportSource @emotion/react */
import { EventTile, eventTileData, isFestival } from '@gamepark/greylune/material/EventTile'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { GainsLabel } from '../../components/Gains'
import { cardInk } from '../../theme/colors'
import { EventPileHelp } from './DeckHelp'
import { HelpCatalogLink } from './HelpCatalog'
import { HelpList, HelpListItem, HelpNote, HelpOutcome, HelpOutcomes, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * What the Event of the year offers, for a tile that carries no title.
 *
 * The tiles are named after the rulebook appendix and nowhere else, so the dialog is where a player
 * learns what the scroll in the middle of the board is called. It then lists what it gives — and
 * that list takes one of two shapes, because the tiles do.
 *
 * Four of the six ask for something: Force, Magic or coins, laid out cost facing reward like an
 * Encounter. The Banquet and the Festival ask for nothing, and their options are simply a list: what
 * the player chooses there is where the Villager stands, not what they pay.
 *
 * The Festival is the one tile whose options are written by nobody: each of its 5 is a pair of
 * amounts, and a figure and a symbol say a pair of amounts in every language at once (see
 * {@link GainsLabel}).
 *
 * A tile face down is a tile of the pile, which only the pile can speak for; and the dialog of any
 * tile ends on the way back to the pile's, where the 6 tiles of the box are listed.
 */
export const EventTileHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const tile = item.id as EventTile | undefined
  if (tile === undefined) return <EventPileHelp />
  return <EventTileDetails tile={tile} />
}

const EventTileDetails = ({ tile }: { tile: EventTile }) => {
  const { t } = useTranslation()
  const abilities = eventTileData[tile].abilities
  /** A tile whose options all come free is a choice of place, not a choice of price. */
  const priced = abilities.some((ability) => ability.requirements?.length)

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={cardInk.event} name={t(`event-tile.${tile}.name`)} subtitle={t('help.event.name')} />

      {priced ? (
        <HelpOutcomes requirement={t('help.requirement')} reward={t('help.reward')}>
          {abilities.map((ability, index) => (
            <HelpOutcome
              key={index}
              requirement={ability.requirements?.length ? <Trans i18nKey={`event-tile.${tile}.${index}.requirement`} components={helpTexts} /> : '—'}
              reward={<Trans i18nKey={`event-tile.${tile}.${index}.reward`} components={helpTexts} />}
            />
          ))}
        </HelpOutcomes>
      ) : (
        <HelpList title={t('help.options')}>
          {abilities.map((ability, index) => (
            <HelpListItem key={index}>
              {isFestival(tile) ? (
                <GainsLabel gains={ability.gains ?? []} />
              ) : (
                <Trans i18nKey={`event-tile.${tile}.${index}.reward`} components={helpTexts} />
              )}
            </HelpListItem>
          ))}
        </HelpList>
      )}

      <HelpNote>
        <Trans i18nKey="help.event.note" components={helpTexts} />
      </HelpNote>
      {isFestival(tile) && (
        <HelpNote>
          <Trans i18nKey="help.event.festival" components={helpTexts} />
        </HelpNote>
      )}
      <HelpCatalogLink pile={LocationType.EventPile}>{t('help.event-pile.see-all')}</HelpCatalogLink>
    </div>
  )
}

