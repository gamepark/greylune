/** @jsxImportSource @emotion/react */
import { VillageCard, villageCardData } from '@gamepark/greylune/material/VillageCard'
import { CustomMove } from '@gamepark/rules-api'
import { TiltIcon } from '../components/Icons'
import { itemActionSpot } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { itemActionData } from './ItemActions'

/**
 * The button an Object of the player's own wears while it can be tilted (see `itemActionMoves`).
 *
 * It carries the hooked arrow the cards themselves print in front of every use of an Object, because
 * that is what pressing it does — the card goes down on its side — and it is the same for all of
 * them. The button stands over the effect it offers (see `itemActionSpot`), so it needs no label: an
 * Object offering 2 options wears 2 buttons, each over its own half of the line, and one the player
 * cannot pay for goes without its button.
 */
export const ItemCardMenu = ({ front, moves }: { front: VillageCard; moves: CustomMove[] }) => (
  <>
    {moves.map((move) => {
      const { ability } = itemActionData(move)
      return (
        <GreyluneMenuButton key={ability} {...itemActionSpot(ability, villageCardData[front].abilities!.length)} move={move}>
          <TiltIcon />
        </GreyluneMenuButton>
      )
    })}
  </>
)
