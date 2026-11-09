import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { Memory } from '@gamepark/greylune/Memory'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { ReactionType } from '@gamepark/greylune/material/Reaction'
import { villageCardData, VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { HeaderText, PlayMoveButton, useLegalMove, useLegalMoves, useRules } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { isUseReaction, reactionData } from '../reactions/ReactionActions'

/**
 * The window a Companion or a Potion may step into (see {@link ReactionRule}). The cards are the
 * player's own and are answered with on the table; the bar only says that the window is open, and
 * gives the one thing the table cannot: closing it.
 *
 * When a single card can answer, the bar names it — "Activez Selia ou passez" — so the player knows
 * which card to look for rather than being asked to look through all of theirs. A window that cannot
 * be passed — a card the player can only pay for with a Companion — says so instead.
 *
 * Isandre stands back up a card gone down in the window, and nothing on the table says which ones
 * those are, so the bar names them: "Activez Isandre pour redresser Tommy ou Bran, ou passez".
 */
export const ReactionHeader = () => {
  const { t, i18n } = useTranslation()
  const rules = useRules<GreyluneRules>()!
  const pass = useLegalMove(isCustomMoveType(CustomMoveType.Pass))
  const reactions = useLegalMoves<CustomMove>(isUseReaction)
  const cards = new Set(reactions.map((move) => reactionData(move).card))
  const single = cards.size === 1 ? [...cards][0] : undefined
  const values = { card: single === undefined ? undefined : cardName(t, rules, single) }
  if (reactions.length && !pass) return single === undefined ? <HeaderText code="must-react" /> : <HeaderText code="must-react-card" values={values} />
  const components = { pass: <PlayMoveButton move={pass} /> }
  if (single === undefined) return <HeaderText code="reaction" components={components} />
  if (straightens(rules, reactions[0])) {
    const straightenValues = { reactor: values.card, cards: cardList(t, i18n.language, rules, straightenable(rules, single)) }
    return <HeaderText code="reaction-straighten" values={straightenValues} components={components} />
  }
  return <HeaderText code="reaction-card" values={values} components={components} />
}

/** Isandre has gone down and the player names the card she stands back up (see `StraightenTiltedRule`). */
export const StraightenTiltedHeader = () => {
  const { t, i18n } = useTranslation()
  const rules = useRules<GreyluneRules>()!
  const tilted = rules.remind<number[]>(Memory.Tilted) ?? []
  // Isandre is the last card to have gone down: she has just been tilted to answer.
  const cards = straightenable(rules, tilted[tilted.length - 1])
  return <HeaderText code="straighten-tilted" values={{ cards: cardList(t, i18n.language, rules, cards) }} />
}

const cardName = (t: TFunction, rules: GreyluneRules, card: number) =>
  t(`village-card.${rules.material(MaterialType.VillageCard).getItem<VillageCardId>(card).id.front}.name`)

/** "Tommy ou Bran", in the language of the player. */
const cardList = (t: TFunction, language: string, rules: GreyluneRules, cards: number[]) =>
  new Intl.ListFormat(language, { type: 'disjunction' }).format(cards.map((card) => cardName(t, rules, card)))

const straightens = (rules: GreyluneRules, move: CustomMove): boolean => {
  const { card, option } = reactionData(move)
  const front = rules.material(MaterialType.VillageCard).getItem<VillageCardId>(card).id.front!
  return villageCardData[front].reaction?.options[option]?.type === ReactionType.StraightenTilted
}

/** What Isandre may stand back up: every card gone down in the window but herself. */
const straightenable = (rules: GreyluneRules, isandre: number): number[] =>
  (rules.remind<number[]>(Memory.Tilted) ?? []).filter((card) => card !== isandre)
