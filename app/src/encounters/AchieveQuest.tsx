/** @jsxImportSource @emotion/react */
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { QuestMarkerIcon } from '../components/Icons'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

/**
 * What the Heroic Quest lying where the Adventurer stopped wears, while the player may take it instead
 * of an Encounter (see `ResolveEncounterRule`): the offer to achieve it. It carries the player's own
 * Quest marker, because that is what achieving it lays on the shield under the tile.
 */
export const AchieveQuestButton = ({ move, player }: { move: CustomMove; player?: PlayerColor }) => {
  const { t } = useTranslation()
  return (
    <GreyluneMenuButton x={2} y={-1} move={move} label={t('action.achieve')} labelPosition="right">
      <QuestMarkerIcon player={player} />
    </GreyluneMenuButton>
  )
}
