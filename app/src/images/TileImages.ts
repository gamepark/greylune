import { EventTile } from '@gamepark/greylune/material/EventTile'
import { QuestTile } from '@gamepark/greylune/material/QuestTile'
import EventTile1 from './tiles/EventTile1.png'
import EventTile2 from './tiles/EventTile2.png'
import EventTile3 from './tiles/EventTile3.png'
import EventTile4 from './tiles/EventTile4.png'
import EventTile5 from './tiles/EventTile5.png'
import EventTile6 from './tiles/EventTile6.png'
import EventTileBack from './tiles/EventTileBack.png'
import QuestTile1 from './tiles/QuestTile1.png'
import QuestTile2 from './tiles/QuestTile2.png'
import QuestTile3 from './tiles/QuestTile3.png'
import QuestTile4 from './tiles/QuestTile4.png'
import QuestTile5 from './tiles/QuestTile5.png'
import QuestTile6 from './tiles/QuestTile6.png'
import QuestTile7 from './tiles/QuestTile7.png'
import QuestTile8 from './tiles/QuestTile8.png'
import QuestTile9 from './tiles/QuestTile9.png'
import QuestTileBack from './tiles/QuestTileBack.png'

export const eventTileImages: Record<EventTile, string> = {
  [EventTile.Banquet]: EventTile1,
  [EventTile.Festival]: EventTile2,
  [EventTile.GreatFair]: EventTile3,
  [EventTile.MagicShow]: EventTile4,
  [EventTile.Gathering]: EventTile5,
  [EventTile.Tournament]: EventTile6
}

export const questTileImages: Record<QuestTile, string> = {
  [QuestTile.Giant]: QuestTile1,
  [QuestTile.Dragon]: QuestTile2,
  [QuestTile.Wraiths]: QuestTile3,
  [QuestTile.BardTournament]: QuestTile4,
  [QuestTile.Donation]: QuestTile5,
  [QuestTile.Undeads]: QuestTile6,
  [QuestTile.DeadlyTrap]: QuestTile7,
  [QuestTile.Ransom]: QuestTile8,
  [QuestTile.Wedding]: QuestTile9
}

export { EventTileBack, QuestTileBack }
