import { GreyluneSetup } from '@gamepark/greylune/GreyluneSetup'
import { EncounterCard, EncounterCardId } from '@gamepark/greylune/material/EncounterCard'
import { EventTile } from '@gamepark/greylune/material/EventTile'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Period } from '@gamepark/greylune/material/Period'
import { Seal } from '@gamepark/greylune/material/Tokens'
import { VillageCard, VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialItem } from '@gamepark/rules-api'

export const me = PlayerColor.Blue
export const william = PlayerColor.Orange

/**
 * Where the 4 cards the scenario is played on are dealt in the 3x3 grid, `x` being the column and `y`
 * the row. Dorian and the Scouts guild stand apart, and Tommy and the Riven Oak side by side: the gap
 * between those two is where a Villager of the player makes the Riven Oak cost 1 coin to William.
 */
export const tutorialVillage: { card: VillageCard; x: number; y: number }[] = [
  { card: VillageCard.Dorian, x: 1, y: 0 },
  { card: VillageCard.Tommy, x: 1, y: 1 },
  { card: VillageCard.RivenOak, x: 2, y: 1 },
  { card: VillageCard.ScoutsGuildI, x: 0, y: 2 }
]

/**
 * The regular setup, with only what the scenario needs drawn on purpose: the 4 Village cards above, the
 * Tiger and the Sheep among the Encounters of the first year, the Banquet as its Event, and a Seal of 1
 * on the Scouts guild. Everything else is left to chance, the other 5 cards of the grid included.
 *
 * The cards are put in place by exchanging faces with the ones the setup dealt there: a card the setup
 * had removed from the game is simply printed over the one it replaces.
 */
export class TutorialSetup extends GreyluneSetup {
  setupMaterial() {
    super.setupMaterial()
    const villageDeck = this.dealOrder(MaterialType.VillageCard, LocationType.VillageDeck)
    for (const { card, x, y } of tutorialVillage) {
      putOnTop<VillageCardId>(villageDeck, y * 3 + x, (id) => id.front === card, { front: card, back: Period.I })
    }
    const encounterDeck = this.dealOrder(MaterialType.EncounterCard, LocationType.EncounterDeck)
    putOnTop<EncounterCardId>(encounterDeck, 0, (id) => id.front === EncounterCard.Tiger, { front: EncounterCard.Tiger, back: Period.I })
    putOnTop<EncounterCardId>(encounterDeck, 1, (id) => id.front === EncounterCard.Sheep, { front: EncounterCard.Sheep, back: Period.I })
    const eventPile = this.dealOrder(MaterialType.EventTile, LocationType.EventPile)
    putOnTop<EventTile>(eventPile, 0, (id) => id === EventTile.Banquet, EventTile.Banquet)
  }

  /** The Scouts guild lets William travel as far as its Seal is worth: 1, to the Tiger. */
  start() {
    super.start()
    const guild = this.material(MaterialType.VillageCard)
      .id<VillageCardId>((id) => id.front === VillageCard.ScoutsGuildI)
      .getIndex()
    const seal = this.game.items[MaterialType.Seal]!.find((item) => item.location.type === LocationType.CardSeal && item.location.parent === guild)!
    const one = this.game.items[MaterialType.Seal]!.find((item) => item.location.type === LocationType.SealStack && item.id === Seal.One)
    if (seal.id !== Seal.One && one) [seal.id, one.id] = [one.id, seal.id]
  }

  /** The items of a deck, the next one dealt first: a deck is dealt from its highest `x`. */
  private dealOrder(type: MaterialType, location: LocationType): MaterialItem[] {
    return this.game.items[type]!.filter((item) => item.location.type === location).sort((a, b) => b.location.x! - a.location.x!)
  }
}

/** The card wanted is given the place `rank` of the deal, the card that was there taking the place it leaves. */
function putOnTop<Id>(deck: MaterialItem[], rank: number, isWanted: (id: Id) => boolean, wanted: Id) {
  const target = deck[rank]
  const current = deck.find((item) => isWanted(item.id as Id))
  if (current) current.id = target.id
  target.id = wanted
}
