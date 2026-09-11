/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { MaterialRules, MoveItem } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { VillagerIcon } from '../components/Icons'
import { sealButtonSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'

/**
 * Exploiting a Building that works off a Seal: the player picks one of the Seals lying on it, and it
 * goes to the discard (see `ActivateCardRule`). The token is what is chosen, so the token wears the
 * button — beside it rather than over it, the value printed on it being the whole of the choice.
 *
 * It carries the Villager, like the button of the card that led here (see `VillageCardMenu`): it is
 * still the Villager's activation, and this is its last half.
 */
export const ActivateSealButton = ({ move, rules }: { move: MoveItem; rules: MaterialRules }) => {
  const { t } = useTranslation()
  const seal = rules.material(MaterialType.Seal).getItem(move.itemIndex)
  const column = rules
    .material(MaterialType.Seal)
    .location(LocationType.CardSeal)
    .parent(seal.location.parent)
    .getItems()
    .map((item) => item.location.x ?? 0)
  const { x, y } = sealButtonSpot(seal.location.x ?? 0, (Math.min(...column) + Math.max(...column)) / 2)
  return (
    <GreyluneMenuButton x={x} y={y} labelPosition="right" move={move} label={t('action.activate')}>
      <VillagerIcon />
    </GreyluneMenuButton>
  )
}
