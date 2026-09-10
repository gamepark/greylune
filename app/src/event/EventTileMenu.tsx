/** @jsxImportSource @emotion/react */
import { EventTile, eventTileData, isFestival } from '@gamepark/greylune/material/EventTile'
import { Trans, useTranslation } from 'react-i18next'
import { EffectArrow } from '../components/Effect'
import { GainsLabel } from '../components/Gains'
import { VillagerIcon } from '../components/Icons'
import { festivalSpaceSpot } from '../locators/TableLayout'
import { helpIcons } from '../material/help/HelpLayout'
import { GreyluneMenuButton } from '../theme/GreyluneMenuButton'
import { moveOfSelectedVillager, useSelectedVillager } from '../villagers/SelectVillager'
import { EventOption, eventOptions, GreyluneMove, joinEventMoves } from './EventMoves'

/**
 * What the Event of the year asks of the player who is looking at it, drawn on the tile itself.
 *
 * Taking part is two decisions, and the tile only ever shows the one that is due. First "Participer",
 * a single button whatever the tile offers: it walks a Villager — the one the player aimed at, or
 * else any of theirs — into the middle of the scroll. Then, if the tile leaves anything to choose,
 * one button per option, and pressing one sends the Villager to the space that pays for it. A tile
 * with a single option never shows that second step: the rules settle it on their own (see
 * `EventRule`).
 *
 * Every one of them carries the same Villager pawn, because every one of them does the same thing —
 * put that pawn down — and what changes from one to the next is only where.
 */
export const EventTileMenu = ({ tile, legalMoves }: { tile: EventTile; legalMoves: GreyluneMove[] }) => {
  const { t } = useTranslation()
  const selected = useSelectedVillager()
  const options = eventOptions(legalMoves)
  const join = joinEventMoves(legalMoves)

  if (options.length) {
    return isFestival(tile) ? <FestivalSpaceButtons tile={tile} options={options} /> : <OptionButtons tile={tile} options={options} />
  }

  if (!join.length) return null
  return (
    <GreyluneMenuButton x={0} y={-3} move={moveOfSelectedVillager(join, selected)} label={t('Participate')} labelPosition="right">
      <VillagerIcon />
    </GreyluneMenuButton>
  )
}

/**
 * The options of every tile but the Festival, listed over the middle of the scroll.
 *
 * Those tiles print their options as one line of icons at the foot of the scroll and give them no
 * space of their own, so nothing on the tile tells the two apart: the buttons have to say it
 * themselves, and each is lettered the way the tile prints it — what it takes, an arrow, what it
 * gives. No tile has more than 2, so they stack.
 */
const OptionButtons = ({ tile, options }: { tile: EventTile; options: EventOption[] }) => (
  <>
    {options.map(({ option, move }, index) => {
      const { requirements } = eventTileData[tile].abilities[option]
      return (
        <GreyluneMenuButton key={option} x={0} y={(index - (options.length - 1) / 2) * 2.6} move={move} labelPosition="right"
          label={
            <>
              {!!requirements?.length && (
                <>
                  <Trans i18nKey={`event-tile.${tile}.${option}.requirement`} components={helpIcons} />
                  <EffectArrow />
                </>
              )}
              <Trans i18nKey={`event-tile.${tile}.${option}.reward`} components={helpIcons} />
            </>
          }
        >
          <VillagerIcon />
        </GreyluneMenuButton>
      )
    })}
  </>
)

/**
 * The 5 spaces of the Festival, each one claimed by a button of its own.
 *
 * The tile has already said what the choice is: every space lies between the 2 bonuses it gives. So
 * the button carries nothing but the Villager it offers to put there, and sits a little further out
 * along the line from the middle of the tile, which is what keeps the 5 of them clear of one another.
 * What each one gives is written beside it all the same, on the side it leans towards — the 2 bonuses
 * again, as a figure and a symbol, which is the shortest way of naming them and the only one that
 * needs no sentence written for it (see {@link GainsLabel}).
 */
const FestivalSpaceButtons = ({ tile, options }: { tile: EventTile; options: EventOption[] }) => (
  <>
    {options.map(({ option, move }) => {
      const { x, y } = festivalSpaceSpot(option)
      return (
        <GreyluneMenuButton key={option} x={x} y={y} move={move} labelPosition={x < -0.1 ? 'left' : 'right'}
          label={<GainsLabel gains={eventTileData[tile].abilities[option].gains ?? []} />}
        >
          <VillagerIcon />
        </GreyluneMenuButton>
      )
    })}
  </>
)
