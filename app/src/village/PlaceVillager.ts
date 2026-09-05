import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialContext } from '@gamepark/react-game'
import { isMoveItemType, Location, MaterialMove, MoveItem } from '@gamepark/rules-api'
import { isEqual, uniqWith } from 'es-toolkit'

type GreyluneContext = MaterialContext<PlayerColor, MaterialType, LocationType>
type GreyluneMove = MaterialMove<PlayerColor, MaterialType, LocationType>

/** Walking one of one's own Villagers into a gap of the Village grid. */
const isPlaceVillager = (move: GreyluneMove): move is MoveItem<PlayerColor, MaterialType, LocationType> =>
  isMoveItemType(MaterialType.Villager)(move) && move.location.type === LocationType.VillageGap

/**
 * The gaps the player may walk a Villager into right now, and nothing at all the rest of the time:
 * when it is somebody else's turn, when the action they are taking is another one, or when they are
 * only watching. That is what the Village shows as open spaces, and it is also what tells the
 * Villagers already standing there to let the pointer through.
 *
 * The answer is read off the rules rather than off the rule ids, so a new way of placing a Villager
 * is offered here the day it is written, without this having to hear about it. The display asks the
 * question once per render and once per Villager on the table, so it is cached against the rules
 * object, which the display itself renews on every change of the game state.
 */
export const gapsToPlaceVillager = ({ rules, player }: GreyluneContext): Location<PlayerColor, LocationType>[] => {
  const cached = cache.get(rules)
  if (cached && cached.player === player) return cached.gaps
  const gaps =
    player === undefined
      ? []
      : uniqWith(
          rules
            .getLegalMoves(player)
            .filter(isPlaceVillager)
            .map((move) => ({ type: LocationType.VillageGap, player, x: move.location.x, y: move.location.y })),
          isEqual
        )
  cache.set(rules, { player, gaps })
  return gaps
}

const cache = new WeakMap<object, { player?: PlayerColor; gaps: Location<PlayerColor, LocationType>[] }>()
