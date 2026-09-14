import { force, magic } from '@gamepark/greylune/material/Effect'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { SkillMarker } from '@gamepark/greylune/rules/GreyluneRule'
import { MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { GainLabel } from '../components/Gains'
import { skillMarkerMenuSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

/**
 * Force or Magic, on a card printing the two gems side by side (see `ChooseSkillRule`).
 *
 * The tracks give no space to drop a marker on, so each marker wears the offer to climb its own track,
 * a step above it, like the Magic of the special action. The two tracks stand side by side, so the
 * Force label is laid to the left and the Magic one to the right, away from each other.
 */
export const ChooseSkillMenu = ({ marker, move, count }: { marker: SkillMarker; move: MaterialMove; count: number }) => {
  const { t } = useTranslation()
  const isForce = marker === MaterialType.StrengthMarker
  return (
    <GreyluneMenuButton
      {...skillMarkerMenuSpot}
      move={move}
      label={t(isForce ? 'action.gain-force' : 'action.gain-magic', { count })}
      labelPosition={isForce ? 'left' : 'right'}
    >
      <GainLabel gain={isForce ? force(count) : magic(count)} />
    </GreyluneMenuButton>
  )
}
