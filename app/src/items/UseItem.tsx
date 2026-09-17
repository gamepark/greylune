/** @jsxImportSource @emotion/react */
import { VillageCard, villageCardData } from '@gamepark/greylune/material/VillageCard'
import { CustomMove } from '@gamepark/rules-api'
import { EffectLabel } from '../components/Effect'
import { TiltIcon } from '../components/Icons'
import { itemActionSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { itemActionData } from './ItemActions'

/**
 * The button an Object of the player's own wears while it can be tilted (see `itemActionMoves`).
 *
 * It carries the hooked arrow the cards themselves print in front of every use of an Object, because
 * that is what pressing it does — the card goes down on its side — and it is the same for all of
 * them. An Object offering 2 options wears 2 buttons, stacked the way the sides of an Encounter are.
 * Their labels open to the left: the column of Objects stands against the right edge of the table.
 */
export const ItemCardMenu = ({ front, moves, count, players }: { front: VillageCard; moves: CustomMove[]; count: number; players: number }) => (
  <>
    {moves.map((move, index) => (
      <GreyluneMenuButton
        key={index}
        {...itemActionSpot(count, players, index, moves.length)}
        move={move}
        labelPosition="left"
        label={<UseItemLabel front={front} ability={itemActionData(move).ability} />}
      >
        <TiltIcon />
      </GreyluneMenuButton>
    ))}
  </>
)

/**
 * What a button says, which is what every button offering an effect says (see {@link EffectLabel}):
 * what the option is paid with on top of the tilt, an arrow, and what it hands over.
 *
 * The tilt is left out, being what every option of every Object costs and what the button already
 * wears; so is a card given up, which has no symbol of its own. An option paid for with the tilt
 * alone is therefore only what it gives. The 2 Objects paying in points counted on what the player
 * owns say nothing at all, cost included: both offer that one option, so their button is
 * unambiguous, and the card under it says the rest.
 */
const UseItemLabel = ({ front, ability }: { front: VillageCard; ability: number }) => <EffectLabel {...villageCardData[front].abilities![ability]} />
