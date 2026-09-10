/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { GainType, usesSeal } from '@gamepark/greylune/material/Effect'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Period } from '@gamepark/greylune/material/Period'
import { Seal } from '@gamepark/greylune/material/Tokens'
import { villagersAroundSlot } from '@gamepark/greylune/material/Village'
import {
  getVillageCardPeriod,
  getVillageCardType,
  PLAYERS_MINUS_ONE,
  VillageCard,
  VillageCardData,
  VillageCardId,
  villageCardData,
  VillageCardType
} from '@gamepark/greylune/material/VillageCard'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CoinIcon, SealIcon } from '../../components/Icons'
import { cardInk, colors } from '../../theme/colors'
import { HelpFact, HelpFacts, helpDialogCss, helpIcons, HelpNote, HelpSection, HelpTitle, HelpWarning, romanNumeral } from './HelpLayout'

/**
 * What a Village card says, for a card that says nothing.
 *
 * Nothing is printed on these 49 cards but a price, a handful of symbols and a number in a laurel:
 * the rulebook appendix is where a player reads what they mean, and this dialog is that appendix,
 * shown next to the card rather than looked up in a book. So it spells out every line the card
 * carries, and adds the two things a printed appendix cannot: what this copy of the card is worth
 * right now — the Seals still lying on it, the Villagers crowding it — and the rule it is an
 * instance of, for the player meeting their first Tavern or their first Potion.
 *
 * The order is the order of the card, read top to bottom: what buying it gives, what it does once
 * exploited or tilted, what it answers to, what it is worth for the rest of the game, and what it
 * scores at the end. Which of those a card has is read from {@link villageCardData}, so a card whose
 * rules change cannot keep a heading it no longer deserves; the sentences themselves are whole in
 * the translation files (see {@link HelpLayout}).
 */
export const VillageCardHelp = ({ item, itemIndex }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const front = (item.id as VillageCardId | undefined)?.front
  if (front === undefined) return <VillageDeckHelp back={(item.id as VillageCardId | undefined)?.back} />
  return <VillageCardDetails card={front} item={item} itemIndex={itemIndex} />
}

/** The ink the card has its own name printed in, so the dialog reads as the piece it is about. */
const typeAccent: Record<VillageCardType, string> = {
  [VillageCardType.Building]: cardInk.building,
  [VillageCardType.Item]: cardInk.item,
  [VillageCardType.Companion]: cardInk.companion
}

const VillageCardDetails = ({ card, item, itemIndex }: { card: VillageCard; item: Partial<MaterialItem<PlayerColor, LocationType>>; itemIndex?: number }) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const data = villageCardData[card]
  const type = getVillageCardType(card)
  /** Only a card still standing in the Village has Seals on it and neighbours crowding it. */
  const inVillage = item.location?.type === LocationType.VillageGrid && itemIndex !== undefined && rules !== undefined
  const seals = inVillage ? rules.material(MaterialType.Seal).location(LocationType.CardSeal).parent(itemIndex!).getItems() : []
  const surcharge = inVillage ? Math.max(0, villagersAroundSlot(rules, { x: item.location!.x ?? 0, y: item.location!.y ?? 0 }).length - 1) : 0

  return (
    <div css={helpDialogCss}>
      <HelpTitle
        accent={typeAccent[type]}
        name={t(`village-card.${card}.name`)}
        subtitle={subtitle(card, data, type)
          .map((key) => t(key))
          .join(' · ')}
        aside={t('help.period', { period: romanNumeral[getVillageCardPeriod(card)] })}
      />

      {(data.cost > 0 || inVillage) && (
        <HelpFacts>
          {data.cost > 0 && (
            <HelpFact label={t('help.cost')}>
              {data.cost} <CoinIcon />
            </HelpFact>
          )}
          {surcharge > 0 && (
            <HelpFact label={t('help.surcharge')}>
              {surcharge} <CoinIcon />
            </HelpFact>
          )}
          {inVillage && data.seals !== undefined && (
            <HelpFact label={t('help.seals.label')}>
              {seals.length ? seals.map((seal, index) => <SealIcon key={index} value={seal.id as Seal} />) : t('help.seals.none')}
            </HelpFact>
          )}
        </HelpFacts>
      )}

      {data.immediate && <Line title={t('help.immediate')} text={`village-card.${card}.immediate`} />}
      {!!data.abilities?.length && <Line title={t('help.ability')} text={`village-card.${card}.ability`} />}
      {data.reaction && <Line title={t('help.reaction')} text={`village-card.${card}.reaction`} />}
      {data.permanent && <Line title={t('help.permanent')} text={`village-card.${card}.permanent`} />}
      {data.score && <Line title={t('help.score')} text={`village-card.${card}.score`} />}

      {inVillage && data.seals !== undefined && !seals.length && onlySealAbilities(data) && (
        <HelpWarning>
          <Trans i18nKey="help.seals.spent" components={helpIcons} />
        </HelpWarning>
      )}

      {notes(data, type).map((key) => (
        <HelpNote key={key}>
          <Trans i18nKey={key} components={helpIcons} />
        </HelpNote>
      ))}
    </div>
  )
}

const Line = ({ title, text }: { title: ReactNode; text: string }) => (
  <HelpSection title={title}>
    <Trans i18nKey={text} components={helpIcons} />
  </HelpSection>
)

/** A Tavern hears stories; every other Building does something else with the Villager it is given. */
const isTavern = (data: VillageCardData): boolean =>
  (data.abilities ?? []).some((ability) => (ability.gains ?? []).some((gain) => gain.type === GainType.TellStory))

/** Whether the card is dead once its last Seal is gone, or merely poorer for it. */
const onlySealAbilities = (data: VillageCardData): boolean => !!data.abilities?.length && data.abilities.every((ability) => usesSeal(ability.requirements))

/** "Compagnon · Alchimiste", "Bâtiment · Taverne": what the card is, then what kind of one it is. */
const subtitle = (card: VillageCard, data: VillageCardData, type: VillageCardType): string[] => {
  const keys = [`help.type.${type}.name`]
  if (isTavern(data)) keys.push('help.tavern.name')
  if (data.potion) keys.push('help.potion.name')
  if (type === VillageCardType.Companion) keys.push(`village-card.${card}.role`)
  return keys
}

/** The rules the card is an instance of: read once, skipped ever after. */
const notes = (data: VillageCardData, type: VillageCardType): string[] => {
  const keys = [`help.type.${type}.note`]
  if (isTavern(data)) keys.push('help.tell-story.note')
  if (data.potion) keys.push('help.potion.note')
  if (data.seals === PLAYERS_MINUS_ONE) keys.push('help.seals.note-players')
  else if (data.seals !== undefined) keys.push('help.seals.note-one')
  return keys
}

/** A card nobody has seen yet: its back says which period it belongs to, and nothing else. */
const VillageDeckHelp = ({ back }: { back?: Period }) => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()
  const left = rules?.material(MaterialType.VillageCard).location(LocationType.VillageDeck).length ?? 0
  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={colors.gold} name={t('help.village-deck.name')} aside={back ? t('help.period', { period: romanNumeral[back] }) : undefined} />
      <HelpFacts>
        <HelpFact label={t('help.village-deck.left')}>{left}</HelpFact>
      </HelpFacts>
      <p>
        <Trans i18nKey="help.village-deck.note" components={helpIcons} />
      </p>
    </div>
  )
}
