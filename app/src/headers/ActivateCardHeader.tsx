import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { Seal } from '@gamepark/greylune/material/Tokens'
import { ActivateCardRule, ChooseAbilityData } from '@gamepark/greylune/rules/ActivateCardRule'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { HeaderText, PlayMoveButton, useLegalMove, useRules } from '@gamepark/react-game'
import { isCustomMoveType, MaterialMove } from '@gamepark/rules-api'
import { SealIcon } from '../components/Icons'
import { Alternatives } from './Alternatives'

/** The value Selia lets the player name for the Seal just spent. */
const names = (value: Seal) => (move: MaterialMove) =>
  isCustomMoveType(CustomMoveType.ChooseAbility)(move) && (move.data as ChooseAbilityData).value === value

/**
 * A Villager is being spent on a card (see {@link ActivateCardRule}).
 *
 * A Building that works off a Seal is exploited by picking one of its Seals, and the Seals lying on it
 * wear the button for it: the bar only says which of the pieces to look at. Once the Seal is gone and
 * Selia has been tilted for it, nothing on the table stands for the value to name any more — the token
 * is in the discard — so the values close the sentence, each drawn as the token it would make the
 * Seal worth, and a value the player cannot pay drops out of it.
 */
export const ActivateCardHeader = () => {
  const rules = useRules<GreyluneRules>()!
  const rule = new ActivateCardRule(rules.game)
  if (rule.sealSpent) return <SealValueHeader />
  return <HeaderText code={rule.sealAbility >= 0 ? 'activate-seal' : 'activate-card'} />
}

const SealValueHeader = () => {
  const one = useLegalMove(names(Seal.One))
  const two = useLegalMove(names(Seal.Two))
  const three = useLegalMove(names(Seal.Three))
  return (
    <>
      <HeaderText code="seal-value" />
      <Alternatives>
        {one && <SealValueButton move={one} value={Seal.One} />}
        {two && <SealValueButton move={two} value={Seal.Two} />}
        {three && <SealValueButton move={three} value={Seal.Three} />}
      </Alternatives>
    </>
  )
}

const SealValueButton = ({ move, value }: { move: MaterialMove; value: Seal }) => (
  <PlayMoveButton move={move}>
    <SealIcon value={value} />
  </PlayMoveButton>
)
