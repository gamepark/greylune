/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { EventTile, eventTileData, isFestival } from '@gamepark/greylune/material/EventTile'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { GainsLabel } from '../../components/Gains'
import { cardInk } from '../../theme/colors'
import { HelpFact, HelpFacts, HelpList, HelpListItem, HelpNote, HelpOutcome, HelpOutcomes, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

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
    </div>
  )
}

/**
 * The tiles still face down under the one turned over. One year of the game is never played: a tile
 * goes back in the box unseen at setup, so the pile is always one short of the years left.
 */
const EventPileHelp = () => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const hidden =
    rules
      ?.material(MaterialType.EventTile)
      .location(LocationType.EventPile)
      .filter((item) => !item.location.rotation).length ?? 0
  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={cardInk.event} name={t('help.event-pile.name')} />
      <HelpFacts>
        <HelpFact label={t('help.event-pile.left')}>{hidden}</HelpFact>
      </HelpFacts>
      <p>
        <Trans i18nKey="help.event-pile.note" components={helpTexts} />
      </p>
    </div>
  )
}
