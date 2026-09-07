import { useDroppable } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { borderRadiusCss, LocationDescription, sizeCss, transformCss, useLegalMoves, useMaterialContext, usePlay } from '@gamepark/react-game'
import { isMoveItemType, Location, MaterialMove, MoveItem } from '@gamepark/rules-api'
import { HTMLAttributes, MouseEvent, PointerEvent, Ref, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parchmentLabelCss, parchmentLitCss, parchmentSurfaceCss } from '../theme/parchment'
import { moveOfSelectedVillager, useSelectedVillager } from '../villagers/SelectVillager'

type VillageGapAreaProps = {
  location: Location<PlayerColor, LocationType>
  description: LocationDescription<PlayerColor, MaterialType, LocationType>
  ref?: Ref<HTMLDivElement>
} & HTMLAttributes<HTMLDivElement>

/**
 * A gap open to one of the player's Villagers, drawn on the strip of table between its two cards.
 *
 * It is a button, and a button has to be seen to be pressed: as soon as it is armed it comes forward
 * over everything standing in the gap already — the Villagers there let the pointer through while
 * this is offered (see {@link VillagerDescription}), so the whole strip answers the click and no pawn
 * ever swallows it.
 *
 * Which Villager it takes is the one the player aimed at, if they aimed at one, and otherwise any of
 * theirs: the two halves of the decision are made in either order (see `SelectVillager`).
 *
 * A mouse arms it by hovering, and the click that follows places. A finger has no hover to give, so
 * the first tap does the arming and the second one places; a tap anywhere else disarms, which is
 * exactly what makes the first tap safe. The two are told apart by the pointer that sends the click,
 * not by the size of the screen: the same page answers a mouse and a finger the way each expects.
 */
export const VillageGapArea = ({ location, description, ref, ...props }: VillageGapAreaProps) => {
  const { t } = useTranslation()
  const context = useMaterialContext<PlayerColor, MaterialType, LocationType>()
  const play = usePlay()
  const moves = useLegalMoves<MaterialMove<PlayerColor, MaterialType, LocationType>>((move) => description.isMoveToLocation(move, location, context))
  const selected = useSelectedVillager()
  const [armed, setArmed] = useState(false)
  const area = useRef<HTMLDivElement | null>(null)
  const { isOver, setNodeRef } = useDroppable({ id: JSON.stringify(location), disabled: !moves.length, data: location })

  /** Anything the player touches outside the strip puts it back to rest, another gap included. */
  useEffect(() => {
    if (!armed) return
    const disarm = (event: globalThis.PointerEvent) => {
      if (!area.current?.contains(event.target as Node)) setArmed(false)
    }
    document.addEventListener('pointerdown', disarm)
    return () => document.removeEventListener('pointerdown', disarm)
  }, [armed])

  if (!moves.length) return null

  const active = armed || isOver
  const { width, height } = description.getLocationSize(location, context)
  /** A gap between two columns is a tall strip: the label reads up it rather than across it. */
  const upright = Number.isInteger(location.x ?? 0)

  const setRefs = (element: HTMLDivElement | null) => {
    area.current = element
    setNodeRef(element)
    if (typeof ref === 'function') ref(element)
    else if (ref) ref.current = element
  }

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const pointer = event.nativeEvent instanceof globalThis.PointerEvent ? event.nativeEvent.pointerType : 'mouse'
    if (!armed && (pointer === 'touch' || pointer === 'pen')) setArmed(true)
    else play(moveOfSelectedVillager(moves.filter(isVillagerMove), selected))
  }

  return (
    <div
      ref={setRefs}
      css={[
        gapAreaCss,
        transformCss(...description.getLocationTransform(location, { ...context, canDrop: active })),
        sizeCss(width, height),
        borderRadiusCss(description.getBorderRadius(location.id)),
        active && armedCss
      ]}
      onPointerEnter={(event: PointerEvent<HTMLDivElement>) => event.pointerType === 'mouse' && setArmed(true)}
      onPointerLeave={(event: PointerEvent<HTMLDivElement>) => event.pointerType === 'mouse' && setArmed(false)}
      onClick={onClick}
      {...props}
    >
      <span css={[labelCss, !upright && rotatedLabelCss]}>{t('Place')}</span>
    </div>
  )
}

const isVillagerMove = (move: MaterialMove<PlayerColor, MaterialType, LocationType>): move is MoveItem<PlayerColor, MaterialType, LocationType> =>
  isMoveItemType(MaterialType.Villager)(move)

/**
 * A gap is a hole in the grid of cards, so the button drawn in it is cut from the same cloth as the
 * Village rather than laid over it: the parchment, ink and gold every button on the table is made of
 * (see {@link parchmentSurfaceCss}).
 */
const gapAreaCss = css`
  ${parchmentSurfaceCss};
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`

const armedCss = parchmentLitCss

const labelCss = css`
  ${parchmentLabelCss};
  font-size: 0.8em;
  white-space: nowrap;
`

const rotatedLabelCss = css`
  transform: rotate(-90deg);
`
