/** @jsxImportSource @emotion/react */
import { useDroppable } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { borderRadiusCss, LocationDescription, sizeCss, transformCss, useMaterialContext } from '@gamepark/react-game'
import { Location, MaterialMove } from '@gamepark/rules-api'
import { HTMLAttributes, ReactNode, Ref } from 'react'
import { colors, rgbOf } from '../theme/colors'

export type ActionAreaProps = {
  location: Location<PlayerColor, LocationType>
  description: LocationDescription<PlayerColor, MaterialType, LocationType>
  /** What letting the Villager go here does, and nothing at all — the space is not drawn — when it does nothing. */
  move?: MaterialMove<PlayerColor, MaterialType, LocationType>
  label: ReactNode
  ref?: Ref<HTMLDivElement>
} & HTMLAttributes<HTMLDivElement>

/**
 * A place to let a Villager go: a card of the Village to spend it on, the tents to take it back to.
 *
 * These are drawn while a Villager is in the air and never otherwise — the framework opens exactly
 * the spaces the pawn's own moves name, as soon as the drag begins. A player who would rather point
 * than carry is answered by a button on the piece itself instead (see `VillageCardMenu` and
 * `CampMenu`), and the words are the same, both being read off the same place.
 *
 * So this is drawn as nothing anybody could press and everything anybody could aim at: the ground
 * darkened over the whole of the space, and what it would give lettered straight onto it — the whole
 * target rather than a point of it, and gold light the moment the pawn comes over it. Nothing is
 * framed, here or inside it: an outline is what a button has, and a second one within it would read
 * as a smaller target inside the target. It lets every pointer through, having none of its own to
 * answer.
 */
export const ActionArea = ({ location, description, move, label, ref, ...props }: ActionAreaProps) => {
  const context = useMaterialContext<PlayerColor, MaterialType, LocationType>()
  const { isOver, setNodeRef } = useDroppable({ id: JSON.stringify(location), disabled: !move, data: location })

  if (!move) return null

  const { width, height } = description.getLocationSize(location, context)

  const setRefs = (element: HTMLDivElement | null) => {
    setNodeRef(element)
    if (typeof ref === 'function') ref(element)
    else if (ref) ref.current = element
  }

  return (
    <div
      ref={setRefs}
      css={[
        dropAreaCss,
        // Lifted: the target has to be read, and what it is laid over is drawn after it.
        transformCss(...description.getLocationTransform(location, { ...context, canDrop: true })),
        sizeCss(width, height),
        borderRadiusCss(description.getBorderRadius(location.id)),
        isOver && litAreaCss
      ]}
      {...props}
    >
      <span css={labelCss}>{label}</span>
    </div>
  )
}

const gold = rgbOf(colors.gold)

const dropAreaCss = css`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition:
    background 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
`

/** The pawn is over it: the whole space turns to gold and takes the light. */
const litAreaCss = css`
  background: rgba(${gold}, 0.3);
  box-shadow: 0 0 0.6em 0.15em rgba(${gold}, 0.8);
`

/**
 * What the space would give, written on the darkened ground itself. Light letters carrying their own
 * shadow, so that they hold over a card, over the tents, and over the gold the space turns when the
 * pawn comes across it.
 */
const labelCss = css`
  font-weight: bold;
  font-size: 0.9em;
  line-height: 1.15;
  letter-spacing: 0.03em;
  max-width: 90%;
  color: rgb(${rgbOf(colors.parchmentLight)});
  text-shadow:
    0 0 0.35em rgba(0, 0, 0, 0.95),
    0 0.06em 0.12em rgba(0, 0, 0, 0.9);
  text-wrap: balance;
  text-align: center;
`
