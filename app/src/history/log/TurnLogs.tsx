/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { cardOnSlot, gapOf, gapSlots } from '@gamepark/greylune/material/Village'
import { getVillageCardType, VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { getVillagerPlayer, Villager } from '@gamepark/greylune/material/Villager'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { Season } from '@gamepark/greylune/Season'
import { EventRule } from '@gamepark/greylune/rules/EventRule'
import { VillagerActionData } from '@gamepark/greylune/rules/SummerRule'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { CustomMove, MoveItem } from '@gamepark/rules-api'
import { SeasonIcon } from '../../components/Icons'
import { villagerImages } from '../../images/PawnImages'
import { logIconCss } from '../logCss'
import { LogText } from '../LogText'
import { EventTileName, PiecePicture, VillageCardName } from '../MaterialLinks'

/** What a player spends their turn on: one action of the season they are in, or moving on to the next one. */

/** The season marker walks one step down the track: moving on is free, and cannot be taken back. */
export const SeasonLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const owner = new GreyluneRules(context.game).material(MaterialType.SeasonMarker).getItem<PlayerColor>(move.itemIndex).id
  const player = usePlayerName(owner)
  const season = move.location.id as Season
  return (
    <LogText
      code={season === Season.Summer ? 'log.summer' : 'log.autumn'}
      values={{ player }}
      components={{ season: <SeasonIcon season={season} css={logIconCss} /> }}
    />
  )
}

/**
 * The Villager being placed, as the figure it is: each player owns 7 sculpted differently, and the one
 * placed is the one that is then read on the table.
 */
const placedVillager = (move: MoveItem, context: MaterialLogProps['context']) => {
  const villager = new GreyluneRules(context.game).material(MaterialType.Villager).getItem<Villager>(move.itemIndex).id
  return { owner: getVillagerPlayer(villager), figure: <PiecePicture src={villagerImages[villager]} /> }
}

/**
 * Spring, or an effect putting a Villager back: between 2 neighbouring cards of the Village, or
 * between a card and an empty slot — a gap with nothing left on either side is offered to nobody
 * (see `PlaceVillagerRule`). Where in the grid is the whole of the move, so the journal names the
 * cards the Villager was stood between rather than the Village it is somewhere in. They are read as
 * they stood at the time, left to right or top to bottom, the way the gap runs.
 */
export const PlaceVillagerLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const { owner, figure } = placedVillager(move, context)
  const player = usePlayerName(owner)
  const rules = new GreyluneRules(context.game)
  const [first, second] = gapSlots(gapOf(move.location)).flatMap((slot) => cardOnSlot(rules, slot).getItems<VillageCardId>())
  if (second === undefined) {
    return <LogText code="log.place-villager.beside" values={{ player }} components={{ villager: figure, card: <VillageCardName id={first?.id} /> }} />
  }
  return (
    <LogText
      code="log.place-villager.between"
      values={{ player }}
      components={{ villager: figure, card1: <VillageCardName id={first.id} />, card2: <VillageCardName id={second.id} /> }}
    />
  )
}

/** A Villager walks onto the Event of the year. What it takes there is written down under it, as it is gained. */
export const EventLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const { owner, figure } = placedVillager(move, context)
  const player = usePlayerName(owner)
  const tile = new EventRule(context.game).eventTile
  return <LogText code="log.event" values={{ player }} components={{ villager: figure, tile: <EventTileName tile={tile} /> }} />
}

/** The special space of the personal board, once a year. What it is taken for is written down under it. */
export const SpecialActionLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const { owner, figure } = placedVillager(move, context)
  const player = usePlayerName(owner)
  return <LogText code="log.special-action" values={{ player }} components={{ villager: figure }} />
}

const villageCardId = (context: MaterialLogProps['context'], card?: number) =>
  card === undefined ? undefined : new GreyluneRules(context.game).material(MaterialType.VillageCard).getItem<VillageCardId>(card).id

/**
 * Summer, "Gagner des pièces": a Villager leaves the Village, and the card it names pays for the company
 * it kept. A Villager whose two cards are gone is taken back all the same, for nothing.
 */
export const CoinsAroundLog = ({ move, context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  const { card } = move.data as VillagerActionData
  const id = villageCardId(context, card)
  if (id === undefined) return <LogText code="log.withdraw" values={{ player }} />
  return <LogText code="log.coins-around" values={{ player }} components={{ card: <VillageCardName id={id} /> }} />
}

/**
 * Summer, "Activer une carte": a Building is exploited, an Object bought, a Companion recruited. The verb
 * is the rulebook's, and the card tells which one: the price and what the card gives are written down
 * under it, once the Companions that could lower the price have had their say.
 */
export const ActivateCardLog = ({ move, context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  const id = villageCardId(context, (move.data as VillagerActionData).card)
  if (id?.front === undefined) return null
  return <LogText code={`log.activate.${getVillageCardType(id.front)}`} values={{ player }} components={{ card: <VillageCardName id={id} /> }} />
}

/** Summer, "Utiliser un Objet": the card is tilted, or emptied if it is a Potion. */
export const UseItemLog = ({ move, context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  const id = villageCardId(context, (move.data as { card: number }).card)
  return <LogText code="log.use-item" values={{ player }} components={{ card: <VillageCardName id={id} /> }} />
}
