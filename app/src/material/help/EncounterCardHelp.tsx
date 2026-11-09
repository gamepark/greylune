/** @jsxImportSource @emotion/react */
import {
  EncounterCard,
  EncounterCardData,
  EncounterCardId,
  encounterArea,
  encounterCardData,
  encounterIncomeToken,
  getEncounterCardPeriod
} from '@gamepark/greylune/material/EncounterCard'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { IncomeTokenIcon } from '../../components/Icons'
import { cardInk } from '../../theme/colors'
import { EncounterDeckHelp } from './DeckHelp'
import { HelpCatalogLink } from './HelpCatalog'
import { HelpFact, HelpFacts, HelpNote, HelpOutcome, HelpOutcomes, HelpTitle, helpDialogCss, helpTexts, romanNumeral } from './HelpLayout'

/**
 * What an Encounter card says, for a card that says nothing.
 *
 * Same job as {@link VillageCardHelp}, on the other half of the box: the printed card is a banner, a
 * book, and two scrolls of symbols, and this dialog is the rulebook appendix put next to it. It is
 * laid out the way the card is — the distance and the story value above, then what the Encounter
 * asks for facing what it pays — so that a player who has read the dialog once can read the card
 * afterwards.
 *
 * A card with two halves is the only place the layout earns its keep: the two rows are the choice,
 * and the note under them says that both may be taken.
 */
export const EncounterCardHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const id = item.id as EncounterCardId | undefined
  /** A card nobody has seen yet is a card of the deck, which only its deck can speak for. */
  if (id?.front === undefined) return <EncounterDeckHelp />
  return <EncounterCardDetails card={id.front} />
}

const EncounterCardDetails = ({ card }: { card: EncounterCard }) => {
  const { t } = useTranslation()
  const data = encounterCardData[card]
  const token = encounterIncomeToken(card)

  return (
    <div css={helpDialogCss}>
      <HelpTitle
        accent={cardInk.encounter}
        name={t(`encounter-card.${card}.name`)}
        subtitle={t('help.encounter.name')}
        aside={t('help.period', { period: romanNumeral[getEncounterCardPeriod(card)] })}
      />

      <HelpFacts>
        {/* The banner in the corner is how far out of Greylune the Encounter is met. */}
        <HelpFact label={t('help.distance')}>{encounterArea[card]}</HelpFact>
        <HelpFact label={t('help.story')}>{data.story}</HelpFact>
        {token !== undefined && (
          <HelpFact label={t('help.income')}>
            <IncomeTokenIcon token={token} />
          </HelpFact>
        )}
      </HelpFacts>

      <HelpOutcomes requirement={t('help.requirement')} reward={t('help.reward')}>
        {data.outcomes.map((outcome, index) => (
          <HelpOutcome
            key={index}
            requirement={outcome.requirements?.length ? <Trans i18nKey={`encounter-card.${card}.${index}.requirement`} components={helpTexts} /> : '—'}
            reward={outcome.gains?.length ? <Trans i18nKey={`encounter-card.${card}.${index}.reward`} components={helpTexts} /> : '—'}
          />
        ))}
      </HelpOutcomes>

      {notes(data, token !== undefined).map((key) => (
        <HelpNote key={key}>
          <Trans i18nKey={key} components={helpTexts} />
        </HelpNote>
      ))}

      <HelpCatalogLink pile={LocationType.EncounterDeck}>{t('help.all-cards')}</HelpCatalogLink>
    </div>
  )
}

/** The rules the card is an instance of: read once, skipped ever after. */
const notes = (data: EncounterCardData, hasIncome: boolean): string[] => {
  const keys = ['help.encounter.note']
  if (data.outcomes.length > 1) keys.push('help.encounter.both')
  if (data.outcomes.every((outcome) => !outcome.gains?.length)) keys.push('help.encounter.story-only')
  if (!data.story) keys.push('help.encounter.untellable')
  if (hasIncome) keys.push('help.income-token.note')
  return keys
}
