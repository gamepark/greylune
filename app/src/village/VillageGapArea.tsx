import { useDroppable } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { borderRadiusCss, LocationDescription, sizeCss, transformCss, useLegalMoves, useMaterialContext, usePlay } from '@gamepark/react-game'
import { Location, MaterialMove } from '@gamepark/rules-api'
import { HTMLAttributes, MouseEvent, PointerEvent, Ref, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colors, rgbOf } from '../theme/colors'

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
    else play(moves[0])
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

/**
 * The colours the Village is painted in: the parchment of the cards, the ink they are lettered with
 * and the gold of their frames — the game's own three, taken from the theme. A gap is a hole in that
 * grid, so the button drawn in it is cut from the same cloth rather than laid over it: a slip of
 * parchment, lettered in ink, that the light catches once it is aimed at.
 */
const ink = rgbOf(colors.ink)
const parchment = rgbOf(colors.parchment)
const gold = rgbOf(colors.gold)
const parchmentDeep = rgbOf(colors.parchmentDeep)
const parchmentLight = rgbOf(colors.parchmentLight)

/** At rest: a slip of parchment slid into the free space, quiet enough to leave the Village legible. */
const gapAreaCss = css`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 0.06em solid rgba(${gold}, 0.7);
  background: linear-gradient(to bottom, rgba(${parchment}, 0.82), rgba(${parchmentDeep}, 0.86));
  box-shadow:
    0 0.05em 0.15em rgba(0, 0, 0, 0.35),
    inset 0 0 0.3em rgba(${gold}, 0.3);
  color: rgba(${ink}, 0.85);
  transition:
    background 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out,
    color 0.15s ease-in-out;
`

/** Aimed at: the parchment turns fresh, the gold frame takes the light and the ink goes black. */
const armedCss = css`
  border-color: rgb(${gold});
  background: linear-gradient(to bottom, rgba(${parchmentLight}, 0.97), rgba(${parchment}, 0.97));
  box-shadow:
    0 0 0.5em 0.1em rgba(${gold}, 0.8),
    inset 0 0 0.45em rgba(255, 255, 255, 0.75);
  color: rgb(${ink});
  cursor: pointer;
`

const labelCss = css`
  font-size: 0.8em;
  font-weight: bold;
  line-height: 1;
  letter-spacing: 0.03em;
  white-space: nowrap;
  text-shadow: 0 0.03em 0.06em rgba(255, 255, 255, 0.6);
`

const rotatedLabelCss = css`
  transform: rotate(-90deg);
`
