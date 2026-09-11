import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { HeaderText, PlayMoveButton, useLegalMove, useLegalMoves, useRules } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { isUseReaction, reactionData } from '../reactions/ReactionActions'

/**
 * The window a Companion or a Potion may step into (see {@link ReactionRule}). The cards are the
 * player's own and are answered with on the table; the bar only says that the window is open, and
 * gives the one thing the table cannot: closing it.
 *
 * When a single card can answer, the bar names it — "Activez Selia ou passez" — so the player knows
 * which card to look for rather than being asked to look through all of theirs.
 */
export const ReactionHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()!
  const pass = useLegalMove(isCustomMoveType(CustomMoveType.Pass))
  const reactions = useLegalMoves<CustomMove>(isUseReaction)
  const cards = new Set(reactions.map((move) => reactionData(move).card))
  const components = { pass: <PlayMoveButton move={pass} /> }
  if (cards.size !== 1) return <HeaderText code="reaction" components={components} />
  const front = rules.material(MaterialType.VillageCard).getItem<VillageCardId>([...cards][0]).id.front
  return <HeaderText code="reaction-card" values={{ card: t(`village-card.${front}.name`) }} components={components} />
}
