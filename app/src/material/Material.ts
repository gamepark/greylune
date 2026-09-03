import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { MainBoardDescription, PlayerBoardDescription, SeasonBoardDescription } from './Boards'
import { EncounterCardDescription, EncounterCardDescriptionFr, VillageCardDescription, VillageCardDescriptionFr } from './Cards'
import {
  AdventurerDescription,
  MagicMarkerDescription,
  QuestMarkerDescription,
  ScoreMarkerDescription,
  SeasonMarkerDescription,
  StrengthMarkerDescription,
  VillagerDescription
} from './Pawns'
import { EventTileDescription, QuestTileDescription } from './Tiles'
import {
  BonusTokenDescription,
  CoinDescription,
  FirstPlayerTokenDescription,
  IncomeTokenDescription,
  SealDescription,
  VpTokenDescription
} from './Tokens'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.VillageCard]: new VillageCardDescription(),
  [MaterialType.EncounterCard]: new EncounterCardDescription(),
  [MaterialType.EventTile]: new EventTileDescription(),
  [MaterialType.QuestTile]: new QuestTileDescription(),
  [MaterialType.MainBoard]: new MainBoardDescription(),
  [MaterialType.SeasonBoard]: new SeasonBoardDescription(),
  [MaterialType.PlayerBoard]: new PlayerBoardDescription(),
  [MaterialType.Adventurer]: new AdventurerDescription(),
  [MaterialType.Villager]: new VillagerDescription(),
  [MaterialType.SeasonMarker]: new SeasonMarkerDescription(),
  [MaterialType.ScoreMarker]: new ScoreMarkerDescription(),
  [MaterialType.QuestMarker]: new QuestMarkerDescription(),
  [MaterialType.StrengthMarker]: new StrengthMarkerDescription(),
  [MaterialType.MagicMarker]: new MagicMarkerDescription(),
  [MaterialType.BonusToken]: new BonusTokenDescription(),
  [MaterialType.Coin]: new CoinDescription(),
  [MaterialType.Seal]: new SealDescription(),
  [MaterialType.IncomeToken]: new IncomeTokenDescription(),
  [MaterialType.VpToken]: new VpTokenDescription(),
  [MaterialType.FirstPlayerToken]: new FirstPlayerTokenDescription()
}

/** Only the cards carry printed text: everything else is language-neutral. */
export const MaterialI18n: Record<string, Partial<Record<MaterialType, MaterialDescription>>> = {
  fr: {
    [MaterialType.VillageCard]: new VillageCardDescriptionFr(),
    [MaterialType.EncounterCard]: new EncounterCardDescriptionFr()
  }
}
