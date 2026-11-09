/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { encounterCardsOfPeriod, getEncounterCardPeriod } from '@gamepark/greylune/material/EncounterCard'
import { EventTile } from '@gamepark/greylune/material/EventTile'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Period } from '@gamepark/greylune/material/Period'
import { getVillageCardPeriod, villageCardsOfPeriod } from '@gamepark/greylune/material/VillageCard'
import { useRules } from '@gamepark/react-game'
import { getEnumValues } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { cardInk, colors } from '../../theme/colors'
import { HelpCatalog } from './HelpCatalog'
import { HelpFact, HelpFacts, HelpTitle, helpDialogCss, helpTexts, romanNumeral } from './HelpLayout'

/**
 * The dialogs of the 3 face-down piles of the main board: the Village deck, the Encounter deck and
 * the Event pile. A card of a deck shows nothing but its period, so clicking one opens the dialog of
 * its deck (see `VillageCardDescription.displayHelp`), and that dialog answers the two questions a
 * face-down pile raises: how it was made, and what can come out of it.
 *
 * How it was made is the setup paragraph of the rulebook (p.2), then what every Winter deals off it.
 * What can come out of it is every card of the box, period by period — the order the deck is stacked
 * in, period I on top — each one opening its own dialog. The cards removed at setup are listed too:
 * nobody knows which ones they are.
 */
export const VillageDeckHelp = () => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const left = rules?.material(MaterialType.VillageCard).location(LocationType.VillageDeck).length
  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={colors.gold} name={t('help.village-deck.name')} />
      {left !== undefined && (
        <HelpFacts>
          <HelpFact label={t('help.village-deck.left')}>{left}</HelpFact>
        </HelpFacts>
      )}
      <p css={textCss}>
        <Trans i18nKey="help.village-deck.setup" components={helpTexts} />
      </p>
      <p css={textCss}>
        <Trans i18nKey="help.village-deck.note" components={helpTexts} />
      </p>
      {getEnumValues(Period).map((period) => {
        /** 5 cards a line: 5 × 7 + 4 × 0.4 gaps, times 0.9, is 32.9em of the dialog's 34, where a 6th would need 39.6. */
        /** The Buildings, then the Objects, then the Companions: the order the enum numbers them in. */
        const cards = [...villageCardsOfPeriod[period]].sort((a, b) => a - b)
        return (
          <HelpCatalog
            key={period}
            title={t('help.period', { period: romanNumeral[period] })}
            aside={t('help.cards', { count: cards.length })}
            type={MaterialType.VillageCard}
            ids={cards.map((front) => ({ front, back: getVillageCardPeriod(front) }))}
            scale={0.9}
          />
        )
      })}
    </div>
  )
}

export const EncounterDeckHelp = () => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const left = rules?.material(MaterialType.EncounterCard).location(LocationType.EncounterDeck).length
  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={cardInk.encounter} name={t('help.encounter-deck.name')} />
      {left !== undefined && (
        <HelpFacts>
          <HelpFact label={t('help.encounter-deck.left')}>{left}</HelpFact>
        </HelpFacts>
      )}
      <p css={textCss}>
        <Trans i18nKey="help.encounter-deck.setup" components={helpTexts} />
      </p>
      <p css={textCss}>
        <Trans i18nKey="help.encounter-deck.note" components={helpTexts} />
      </p>
      {/* 6 cards a line: 6 × 5.2 + 5 × 0.4 gaps is 33.2em of the dialog's 34, where a 7th would need 38.8. */}
      {getEnumValues(Period).map((period) => (
        <HelpCatalog
          key={period}
          title={t('help.period', { period: romanNumeral[period] })}
          aside={t('help.cards', { count: encounterCardsOfPeriod[period].length })}
          type={MaterialType.EncounterCard}
          ids={encounterCardsOfPeriod[period].map((front) => ({ front, back: getEncounterCardPeriod(front) }))}
          scale={1}
        />
      ))}
    </div>
  )
}

/**
 * The tiles still face down under the one turned over, and the 6 the box holds. One year of the game
 * is never played: a tile goes back in the box unseen at setup, so the pile is always one short of
 * the years left, and any of the 6 may be the one missing.
 */
export const EventPileHelp = () => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const hidden = rules
    ?.material(MaterialType.EventTile)
    .location(LocationType.EventPile)
    .filter((item) => !item.location.rotation).length
  return (
    <div css={[helpDialogCss, eventPileCss]}>
      <HelpTitle accent={cardInk.event} name={t('help.event-pile.name')} />
      {hidden !== undefined && (
        <HelpFacts>
          <HelpFact label={t('help.event-pile.left')}>{hidden}</HelpFact>
        </HelpFacts>
      )}
      <p css={textCss}>
        <Trans i18nKey="help.event-pile.note" components={helpTexts} />
      </p>
      <HelpCatalog title={t('help.event-pile.all')} type={MaterialType.EventTile} ids={getEnumValues(EventTile)} scale={0.8} />
    </div>
  )
}

/** The dialog already spaces its blocks: a paragraph's own margins would double the gap. */
const textCss = css`
  margin: 0;
`

/**
 * The 6 tiles are read rather than glanced at, so they are drawn as large as one line of them allows,
 * and the dialog is widened for it: 6 × 7.71 + 5 × 0.4 gaps, times 0.8, is 38.6em of these 40.
 */
const eventPileCss = css`
  max-width: 40em;
`
