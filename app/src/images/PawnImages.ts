import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { playerVillagers, Villager } from '@gamepark/greylune/material/Villager'
import { getEnumValues } from '@gamepark/rules-api'
import AdventurerBlue from './pawns/AdventurerBlue.png'
import AdventurerOrange from './pawns/AdventurerOrange.png'
import AdventurerRed from './pawns/AdventurerRed.png'
import AdventurerPurple from './pawns/AdventurerPurple.png'
import QuestMarkerBlue from './pawns/QuestMarkerBlue.png'
import QuestMarkerOrange from './pawns/QuestMarkerOrange.png'
import QuestMarkerRed from './pawns/QuestMarkerRed.png'
import QuestMarkerPurple from './pawns/QuestMarkerPurple.png'
import ScoreMarkerBlue from './pawns/ScoreMarkerBlue.png'
import ScoreMarkerOrange from './pawns/ScoreMarkerOrange.png'
import ScoreMarkerRed from './pawns/ScoreMarkerRed.png'
import ScoreMarkerPurple from './pawns/ScoreMarkerPurple.png'
import SeasonMarkerBlue from './pawns/SeasonMarkerBlue.png'
import SeasonMarkerOrange from './pawns/SeasonMarkerOrange.png'
import SeasonMarkerRed from './pawns/SeasonMarkerRed.png'
import SeasonMarkerPurple from './pawns/SeasonMarkerPurple.png'
import VillagerBlue1 from './pawns/VillagerBlue1.png'
import VillagerBlue2 from './pawns/VillagerBlue2.png'
import VillagerBlue3 from './pawns/VillagerBlue3.png'
import VillagerBlue4 from './pawns/VillagerBlue4.png'
import VillagerBlue5 from './pawns/VillagerBlue5.png'
import VillagerBlue6 from './pawns/VillagerBlue6.png'
import VillagerBlue7 from './pawns/VillagerBlue7.png'
import VillagerOrange1 from './pawns/VillagerOrange1.png'
import VillagerOrange2 from './pawns/VillagerOrange2.png'
import VillagerOrange3 from './pawns/VillagerOrange3.png'
import VillagerOrange4 from './pawns/VillagerOrange4.png'
import VillagerOrange5 from './pawns/VillagerOrange5.png'
import VillagerOrange6 from './pawns/VillagerOrange6.png'
import VillagerOrange7 from './pawns/VillagerOrange7.png'
import VillagerRed1 from './pawns/VillagerRed1.png'
import VillagerRed2 from './pawns/VillagerRed2.png'
import VillagerRed3 from './pawns/VillagerRed3.png'
import VillagerRed4 from './pawns/VillagerRed4.png'
import VillagerRed5 from './pawns/VillagerRed5.png'
import VillagerRed6 from './pawns/VillagerRed6.png'
import VillagerRed7 from './pawns/VillagerRed7.png'
import VillagerPurple1 from './pawns/VillagerPurple1.png'
import VillagerPurple2 from './pawns/VillagerPurple2.png'
import VillagerPurple3 from './pawns/VillagerPurple3.png'
import VillagerPurple4 from './pawns/VillagerPurple4.png'
import VillagerPurple5 from './pawns/VillagerPurple5.png'
import VillagerPurple6 from './pawns/VillagerPurple6.png'
import VillagerPurple7 from './pawns/VillagerPurple7.png'
import MagicMarker from './pawns/MagicMarker.png'
import StrengthMarker from './pawns/StrengthMarker.png'

export const adventurerImages: Record<PlayerColor, string> = {
  [PlayerColor.Blue]: AdventurerBlue,
  [PlayerColor.Orange]: AdventurerOrange,
  [PlayerColor.Red]: AdventurerRed,
  [PlayerColor.Purple]: AdventurerPurple
}

export const questMarkerImages: Record<PlayerColor, string> = {
  [PlayerColor.Blue]: QuestMarkerBlue,
  [PlayerColor.Orange]: QuestMarkerOrange,
  [PlayerColor.Red]: QuestMarkerRed,
  [PlayerColor.Purple]: QuestMarkerPurple
}

export const scoreMarkerImages: Record<PlayerColor, string> = {
  [PlayerColor.Blue]: ScoreMarkerBlue,
  [PlayerColor.Orange]: ScoreMarkerOrange,
  [PlayerColor.Red]: ScoreMarkerRed,
  [PlayerColor.Purple]: ScoreMarkerPurple
}

export const seasonMarkerImages: Record<PlayerColor, string> = {
  [PlayerColor.Blue]: SeasonMarkerBlue,
  [PlayerColor.Orange]: SeasonMarkerOrange,
  [PlayerColor.Red]: SeasonMarkerRed,
  [PlayerColor.Purple]: SeasonMarkerPurple
}

/** The 7 figures of each colour, in the order they are punched: index 0 is Villager 1. */
const villagerFigures: Record<PlayerColor, string[]> = {
  [PlayerColor.Blue]: [VillagerBlue1, VillagerBlue2, VillagerBlue3, VillagerBlue4, VillagerBlue5, VillagerBlue6, VillagerBlue7],
  [PlayerColor.Orange]: [VillagerOrange1, VillagerOrange2, VillagerOrange3, VillagerOrange4, VillagerOrange5, VillagerOrange6, VillagerOrange7],
  [PlayerColor.Red]: [VillagerRed1, VillagerRed2, VillagerRed3, VillagerRed4, VillagerRed5, VillagerRed6, VillagerRed7],
  [PlayerColor.Purple]: [VillagerPurple1, VillagerPurple2, VillagerPurple3, VillagerPurple4, VillagerPurple5, VillagerPurple6, VillagerPurple7]
}

/** Keyed by the Villager id itself, so a Villager always shows the figure it is: 11 to 17, 21 to 27... */
export const villagerImages: Record<Villager, string> = Object.fromEntries(
  getEnumValues(PlayerColor).flatMap((player) => playerVillagers(player).map((villager, figure) => [villager, villagerFigures[player][figure]]))
)

export { MagicMarker, StrengthMarker }
