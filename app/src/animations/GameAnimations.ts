import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ItemContext, MaterialGameAnimations } from '@gamepark/react-game'
import { Coordinates, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { areaOf } from '../locators/Seats'
import { spread } from '../locators/spread'
import { storiesCeiling, storiesGap, storiesMaxGap, storiesPush, untoldStoriesSpot } from '../locators/TableLayout'

export const gameAnimations = new MaterialGameAnimations<PlayerColor, MaterialType, LocationType>()

/**
 * The Villager stepping from the middle of the Festival onto the space it settles on.
 *
 * The move is the player's own second click, and it is a short one — one space of the same tile,
 * never more than an em — so the default travel time reads as a hesitation rather than as a walk.
 * A fifth of a second is long enough to see which space was taken and short enough not to be waited
 * for. Walking onto the tile in the first place keeps the usual duration: that one crosses the table.
 */
gameAnimations
  .configure((move) => isMoveItemType(MaterialType.Villager)(move) && move.location.type === LocationType.EventSpace && move.location.x !== undefined)
  .duration(200)

/** Where the flight ends and the push begins: the card spends the last quarter of it sliding in. */
const SLIDE_START = 0.75

/**
 * An Encounter won is not laid beside the personal board but pushed under its top edge, until only
 * the top quarter of it is left showing (see {@link untoldStoriesSpot}). Flown straight at that spot,
 * three quarters of the card would vanish on the frame it lands, which reads as the card falling into
 * a hole rather than as a hand pushing it home.
 *
 * So it flies to the point {@link storiesPush} above its slot instead — where it lies flush with the
 * edge it is about to go under, nothing hidden yet — comes back down to table level there, and only
 * then slides straight down into place, disappearing under the board and under the Stories already
 * there as it goes. `ease-in` carries the flight and the waypoint's `ease-out` the push, so the two
 * read as one motion. The band only affords the whole push to the first Story of a fan; the ones
 * after it start at {@link storiesCeiling}, which is as high as the row above allows.
 *
 * The card reaches its full depth at the waypoint rather than at the end, or it would be pushed in
 * *over* the Stories it is meant to slide under and only slip behind them on the very last frame.
 *
 * The waypoint is given as an offset rather than as a spot: an Income token still lying on the card
 * rides the same trajectory, and an offset is the only form of it that keeps the token on its corner
 * of the card instead of sending it to the middle — depth included.
 */
gameAnimations
  .configure((move) => isMoveItemType(MaterialType.EncounterCard)(move) && move.location.type === LocationType.UntoldStories)
  .trajectory((context, move) => {
    const flight = storyFlight(context, move)
    if (!flight) return {}
    const { from, to, pushFrom } = flight
    return {
      easing: 'ease-in',
      elevation: { landAt: SLIDE_START },
      waypoints: [
        {
          at: SLIDE_START,
          offset: {
            x: (1 - SLIDE_START) * (to.x - from.x),
            y: (1 - SLIDE_START) * (to.y - from.y) - (to.y - pushFrom),
            z: (1 - SLIDE_START) * (to.z - from.z)
          },
          easing: 'ease-out'
        }
      ]
    }
  })

/**
 * A Story told crosses from one half of the band to the other without ever leaving the board it is
 * tucked under, so it slides flat along its edge. Lifting it would take it over the board for the
 * length of the move and drop it back under at the very end, which is the one thing the card never
 * does once it has been pushed in.
 */
gameAnimations
  .configure((move) => isMoveItemType(MaterialType.EncounterCard)(move) && move.location.type === LocationType.ToldStories)
  .flat()

/**
 * Where the card leaves from, where it lands, and the height it is pushed in from. The new Story is
 * the last of its fan, a whole spread above the first one, and the fan it joins is the one that is
 * there now plus itself — the move has not been played yet.
 */
const storyFlight = (
  context: ItemContext<PlayerColor, MaterialType, LocationType>,
  move: MaterialMove<PlayerColor, MaterialType, LocationType>
): { from: Coordinates; to: Coordinates; pushFrom: number } | undefined => {
  if (!isMoveItemType(MaterialType.EncounterCard)(move) || move.location.type !== LocationType.UntoldStories) return
  const player = move.location.player as PlayerColor
  const card = context.rules.material(MaterialType.EncounterCard).getItem(move.itemIndex)
  const spot = context.locators[card.location.type]?.getItemCoordinates(card, {
    ...context,
    type: MaterialType.EncounterCard,
    index: move.itemIndex,
    displayIndex: 0
  })
  if (!spot) return
  const from = { x: spot.x ?? 0, y: spot.y ?? 0, z: spot.z ?? 0 }
  const area = areaOf(context, player)
  const anchor = untoldStoriesSpot(area)
  const gaps = context.rules.material(MaterialType.EncounterCard).location(LocationType.UntoldStories).player(player).length
  const to = { x: anchor.x, y: anchor.y + spread(storiesGap.y!, gaps, storiesMaxGap.y), z: anchor.z + gaps * storiesGap.z! }
  return { from, to, pushFrom: Math.max(to.y - storiesPush, storiesCeiling(area)) }
}
