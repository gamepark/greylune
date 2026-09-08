import { CustomMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { AdventurerIcon, TravelIcon } from '../components/Icons'
import { adventurerStaySpot, areaBoardOffset } from '../locators/TableLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { AdventurerMove, travelDestination } from './TravelMoves'

/**
 * How far the Adventurer goes, offered on the map rather than in the bar above it: a journey is read
 * off the board — which banner, how many bends of the road — and it is answered there too.
 *
 * The two offers are one decision and are drawn as one kind of thing: a disc on the ground the pawn
 * would stand on. The road is on the ones that send it somewhere, because that is what they spend;
 * the Adventurer itself is on the one that keeps it where it is, because that is all it is about.
 */

/**
 * The areas within reach, each wearing the offer to walk the Adventurer there.
 *
 * An area is a stretch of ground printed on the main board and carries no piece of its own to hang a
 * button on, so the buttons are hung on the board and walk back out to each area (see
 * {@link areaBoardOffset}) — the same way the camp is answered on the Season board. Each stands on
 * the open ground itself, which is both what the button means and where the pawn will end up: the
 * player aims at the space they are choosing. Their labels are written towards the middle of the
 * board, the map having nothing to spare beyond its banners.
 */
export const TravelMenu = ({ moves }: { moves: AdventurerMove[] }) => {
  const { t } = useTranslation()
  return (
    <>
      {moves.map((move) => {
        const area = travelDestination(move)
        const { x, y } = areaBoardOffset(area)
        return (
          <GreyluneMenuButton key={area} x={x} y={y} move={move} label={t('action.travel')}>
            <TravelIcon />
          </GreyluneMenuButton>
        )
      })}
    </>
  )
}

/**
 * Going no further, worn by the Adventurer itself.
 *
 * This is the one offer of the journey that is about a piece rather than about a place, and it is
 * the piece that carries it: the area the pawn stands in is already answered — by the pawn being
 * there — and a button laid on that ground would say the same thing twice. It stands a hair to the
 * side of the pawn (see {@link adventurerStaySpot}), close enough to read as its own and clear of
 * the Adventurers sharing the area.
 */
export const StayPutMenu = ({ move }: { move: CustomMove }) => {
  const { t } = useTranslation()
  return (
    <GreyluneMenuButton x={adventurerStaySpot.x} y={adventurerStaySpot.y} move={move} label={t('action.stay')} labelPosition="left">
      <AdventurerIcon />
    </GreyluneMenuButton>
  )
}
