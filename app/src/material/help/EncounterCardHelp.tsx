/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
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
import { Period } from '@gamepark/greylune/material/Period'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { IncomeTokenIcon } from '../../components/Icons'
import { HelpFact, HelpFacts, HelpNote, HelpOutcome, HelpOutcomes, HelpTitle, helpDialogCss, helpIcons, romanNumeral } from './HelpLayout'

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
  if (id?.front === undefined) return <EncounterDeckHelp back={id?.back} />
  return <EncounterCardDetails card={id.front} />
}

const EncounterCardDetails = ({ card }: { card: EncounterCard }) => {
  const { t } = useTranslation()
  const data = encounterCardData[card]
  const token = encounterIncomeToken(card)

  return (
    <div css={helpDialogCss}>
      <HelpTitle
        accent="#2f6b5a"
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
            requirement={outcome.requirements?.length ? <Trans i18nKey={`encounter-card.${card}.${index}.requirement`} components={helpIcons} /> : '—'}
            reward={outcome.gains?.length ? <Trans i18nKey={`encounter-card.${card}.${index}.reward`} components={helpIcons} /> : '—'}
          />
        ))}
      </HelpOutcomes>

      {notes(data, token !== undefined).map((key) => (
        <HelpNote key={key}>
          <Trans i18nKey={key} components={helpIcons} />
        </HelpNote>
      ))}
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

/** A card nobody has seen yet: its back says which period it belongs to, and nothing else. */
const EncounterDeckHelp = ({ back }: { back?: Period }) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const left = rules?.material(MaterialType.EncounterCard).location(LocationType.EncounterDeck).length ?? 0
  return (
    <div css={helpDialogCss}>
      <HelpTitle accent="#2f6b5a" name={t('help.encounter-deck.name')} aside={back ? t('help.period', { period: romanNumeral[back] }) : undefined} />
      <HelpFacts>
        <HelpFact label={t('help.encounter-deck.left')}>{left}</HelpFact>
      </HelpFacts>
      <p>
        <Trans i18nKey="help.encounter-deck.note" components={helpIcons} />
      </p>
    </div>
  )
}
