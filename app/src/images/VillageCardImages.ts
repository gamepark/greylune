import { Period } from '@gamepark/greylune/material/Period'
import { VillageCard } from '@gamepark/greylune/material/VillageCard'
import Building1En from './cards/village/en/Building1.jpg'
import Building2En from './cards/village/en/Building2.jpg'
import Building3En from './cards/village/en/Building3.jpg'
import Building4En from './cards/village/en/Building4.jpg'
import Building5En from './cards/village/en/Building5.jpg'
import Building6En from './cards/village/en/Building6.jpg'
import Building7En from './cards/village/en/Building7.jpg'
import Building8En from './cards/village/en/Building8.jpg'
import Building9En from './cards/village/en/Building9.jpg'
import Building10En from './cards/village/en/Building10.jpg'
import Building11En from './cards/village/en/Building11.jpg'
import Building12En from './cards/village/en/Building12.jpg'
import Building13En from './cards/village/en/Building13.jpg'
import Building14En from './cards/village/en/Building14.jpg'
import Building15En from './cards/village/en/Building15.jpg'
import Building16En from './cards/village/en/Building16.jpg'
import Item1En from './cards/village/en/Item1.jpg'
import Item2En from './cards/village/en/Item2.jpg'
import Item3En from './cards/village/en/Item3.jpg'
import Item4En from './cards/village/en/Item4.jpg'
import Item5En from './cards/village/en/Item5.jpg'
import Item6En from './cards/village/en/Item6.jpg'
import Item7En from './cards/village/en/Item7.jpg'
import Item8En from './cards/village/en/Item8.jpg'
import Item9En from './cards/village/en/Item9.jpg'
import Item10En from './cards/village/en/Item10.jpg'
import Item11En from './cards/village/en/Item11.jpg'
import Item12En from './cards/village/en/Item12.jpg'
import Item13En from './cards/village/en/Item13.jpg'
import Item14En from './cards/village/en/Item14.jpg'
import Item15En from './cards/village/en/Item15.jpg'
import Item16En from './cards/village/en/Item16.jpg'
import Item17En from './cards/village/en/Item17.jpg'
import Item18En from './cards/village/en/Item18.jpg'
import Item19En from './cards/village/en/Item19.jpg'
import Item20En from './cards/village/en/Item20.jpg'
import Item21En from './cards/village/en/Item21.jpg'
import Item22En from './cards/village/en/Item22.jpg'
import Companion1En from './cards/village/en/Companion1.jpg'
import Companion2En from './cards/village/en/Companion2.jpg'
import Companion3En from './cards/village/en/Companion3.jpg'
import Companion4En from './cards/village/en/Companion4.jpg'
import Companion5En from './cards/village/en/Companion5.jpg'
import Companion6En from './cards/village/en/Companion6.jpg'
import Companion7En from './cards/village/en/Companion7.jpg'
import Companion8En from './cards/village/en/Companion8.jpg'
import Companion9En from './cards/village/en/Companion9.jpg'
import Companion10En from './cards/village/en/Companion10.jpg'
import Companion11En from './cards/village/en/Companion11.jpg'
import Building1Fr from './cards/village/fr/Building1.jpg'
import Building2Fr from './cards/village/fr/Building2.jpg'
import Building3Fr from './cards/village/fr/Building3.jpg'
import Building4Fr from './cards/village/fr/Building4.jpg'
import Building5Fr from './cards/village/fr/Building5.jpg'
import Building6Fr from './cards/village/fr/Building6.jpg'
import Building7Fr from './cards/village/fr/Building7.jpg'
import Building8Fr from './cards/village/fr/Building8.jpg'
import Building9Fr from './cards/village/fr/Building9.jpg'
import Building10Fr from './cards/village/fr/Building10.jpg'
import Building11Fr from './cards/village/fr/Building11.jpg'
import Building12Fr from './cards/village/fr/Building12.jpg'
import Building13Fr from './cards/village/fr/Building13.jpg'
import Building14Fr from './cards/village/fr/Building14.jpg'
import Building15Fr from './cards/village/fr/Building15.jpg'
import Building16Fr from './cards/village/fr/Building16.jpg'
import Item1Fr from './cards/village/fr/Item1.jpg'
import Item2Fr from './cards/village/fr/Item2.jpg'
import Item3Fr from './cards/village/fr/Item3.jpg'
import Item4Fr from './cards/village/fr/Item4.jpg'
import Item5Fr from './cards/village/fr/Item5.jpg'
import Item6Fr from './cards/village/fr/Item6.jpg'
import Item7Fr from './cards/village/fr/Item7.jpg'
import Item8Fr from './cards/village/fr/Item8.jpg'
import Item9Fr from './cards/village/fr/Item9.jpg'
import Item10Fr from './cards/village/fr/Item10.jpg'
import Item11Fr from './cards/village/fr/Item11.jpg'
import Item12Fr from './cards/village/fr/Item12.jpg'
import Item13Fr from './cards/village/fr/Item13.jpg'
import Item14Fr from './cards/village/fr/Item14.jpg'
import Item15Fr from './cards/village/fr/Item15.jpg'
import Item16Fr from './cards/village/fr/Item16.jpg'
import Item17Fr from './cards/village/fr/Item17.jpg'
import Item18Fr from './cards/village/fr/Item18.jpg'
import Item19Fr from './cards/village/fr/Item19.jpg'
import Item20Fr from './cards/village/fr/Item20.jpg'
import Item21Fr from './cards/village/fr/Item21.jpg'
import Item22Fr from './cards/village/fr/Item22.jpg'
import Companion1Fr from './cards/village/fr/Companion1.jpg'
import Companion2Fr from './cards/village/fr/Companion2.jpg'
import Companion3Fr from './cards/village/fr/Companion3.jpg'
import Companion4Fr from './cards/village/fr/Companion4.jpg'
import Companion5Fr from './cards/village/fr/Companion5.jpg'
import Companion6Fr from './cards/village/fr/Companion6.jpg'
import Companion7Fr from './cards/village/fr/Companion7.jpg'
import Companion8Fr from './cards/village/fr/Companion8.jpg'
import Companion9Fr from './cards/village/fr/Companion9.jpg'
import Companion10Fr from './cards/village/fr/Companion10.jpg'
import Companion11Fr from './cards/village/fr/Companion11.jpg'
import VillageBack1 from './cards/village/backs/VillageBack1.jpg'
import VillageBack2 from './cards/village/backs/VillageBack2.jpg'
import VillageBack3 from './cards/village/backs/VillageBack3.jpg'

export const villageCardBacks: Record<Period, string> = {
  [Period.I]: VillageBack1,
  [Period.II]: VillageBack2,
  [Period.III]: VillageBack3
}

export const villageCardImagesEn: Record<VillageCard, string> = {
  [VillageCard.TravelersGuildI]: Building1En,
  [VillageCard.ScoutsGuildI]: Building2En,
  [VillageCard.RivenOak]: Building3En,
  [VillageCard.GoldenLion]: Building4En,
  [VillageCard.MagicalSchool]: Building5En,
  [VillageCard.Smithy]: Building6En,
  [VillageCard.TravelersGuildII]: Building7En,
  [VillageCard.ScoutsGuildII]: Building8En,
  [VillageCard.HallOfTheHeroes]: Building9En,
  [VillageCard.TownHall]: Building10En,
  [VillageCard.SilverWolf]: Building11En,
  [VillageCard.JollyBoar]: Building12En,
  [VillageCard.Fortress]: Building13En,
  [VillageCard.TravelersGuildIII]: Building14En,
  [VillageCard.Library]: Building15En,
  [VillageCard.ScarletDragon]: Building16En,
  [VillageCard.JadeStatue]: Item1En,
  [VillageCard.Tommy]: Item2En,
  [VillageCard.HundredLeagueBoots]: Item3En,
  [VillageCard.WizardsStaff]: Item4En,
  [VillageCard.MysteriousMap]: Item5En,
  [VillageCard.ManaPotion]: Item6En,
  [VillageCard.StrengthPotion]: Item7En,
  [VillageCard.ShortSword]: Item8En,
  [VillageCard.GoldStatue]: Item9En,
  [VillageCard.Snowmane]: Item10En,
  [VillageCard.Horn]: Item11En,
  [VillageCard.TreasureMap]: Item12En,
  [VillageCard.CharismaPotion]: Item13En,
  [VillageCard.EndurancePotion]: Item14En,
  [VillageCard.FlyingPotion]: Item15En,
  [VillageCard.Bladechant]: Item16En,
  [VillageCard.InvisibilityPotion]: Item17En,
  [VillageCard.RubisStatue]: Item18En,
  [VillageCard.Mandolin]: Item19En,
  [VillageCard.BagOfHolding]: Item20En,
  [VillageCard.PhilosopherStone]: Item21En,
  [VillageCard.MagicRing]: Item22En,
  [VillageCard.Kael]: Companion1En,
  [VillageCard.Elwen]: Companion2En,
  [VillageCard.Dorian]: Companion3En,
  [VillageCard.Ariok]: Companion4En,
  [VillageCard.Selia]: Companion5En,
  [VillageCard.Neris]: Companion6En,
  [VillageCard.Bran]: Companion7En,
  [VillageCard.Lucan]: Companion8En,
  [VillageCard.Isandre]: Companion9En,
  [VillageCard.Seren]: Companion10En,
  [VillageCard.Mira]: Companion11En
}

export const villageCardImagesFr: Record<VillageCard, string> = {
  [VillageCard.TravelersGuildI]: Building1Fr,
  [VillageCard.ScoutsGuildI]: Building2Fr,
  [VillageCard.RivenOak]: Building3Fr,
  [VillageCard.GoldenLion]: Building4Fr,
  [VillageCard.MagicalSchool]: Building5Fr,
  [VillageCard.Smithy]: Building6Fr,
  [VillageCard.TravelersGuildII]: Building7Fr,
  [VillageCard.ScoutsGuildII]: Building8Fr,
  [VillageCard.HallOfTheHeroes]: Building9Fr,
  [VillageCard.TownHall]: Building10Fr,
  [VillageCard.SilverWolf]: Building11Fr,
  [VillageCard.JollyBoar]: Building12Fr,
  [VillageCard.Fortress]: Building13Fr,
  [VillageCard.TravelersGuildIII]: Building14Fr,
  [VillageCard.Library]: Building15Fr,
  [VillageCard.ScarletDragon]: Building16Fr,
  [VillageCard.JadeStatue]: Item1Fr,
  [VillageCard.Tommy]: Item2Fr,
  [VillageCard.HundredLeagueBoots]: Item3Fr,
  [VillageCard.WizardsStaff]: Item4Fr,
  [VillageCard.MysteriousMap]: Item5Fr,
  [VillageCard.ManaPotion]: Item6Fr,
  [VillageCard.StrengthPotion]: Item7Fr,
  [VillageCard.ShortSword]: Item8Fr,
  [VillageCard.GoldStatue]: Item9Fr,
  [VillageCard.Snowmane]: Item10Fr,
  [VillageCard.Horn]: Item11Fr,
  [VillageCard.TreasureMap]: Item12Fr,
  [VillageCard.CharismaPotion]: Item13Fr,
  [VillageCard.EndurancePotion]: Item14Fr,
  [VillageCard.FlyingPotion]: Item15Fr,
  [VillageCard.Bladechant]: Item16Fr,
  [VillageCard.InvisibilityPotion]: Item17Fr,
  [VillageCard.RubisStatue]: Item18Fr,
  [VillageCard.Mandolin]: Item19Fr,
  [VillageCard.BagOfHolding]: Item20Fr,
  [VillageCard.PhilosopherStone]: Item21Fr,
  [VillageCard.MagicRing]: Item22Fr,
  [VillageCard.Kael]: Companion1Fr,
  [VillageCard.Elwen]: Companion2Fr,
  [VillageCard.Dorian]: Companion3Fr,
  [VillageCard.Ariok]: Companion4Fr,
  [VillageCard.Selia]: Companion5Fr,
  [VillageCard.Neris]: Companion6Fr,
  [VillageCard.Bran]: Companion7Fr,
  [VillageCard.Lucan]: Companion8Fr,
  [VillageCard.Isandre]: Companion9Fr,
  [VillageCard.Seren]: Companion10Fr,
  [VillageCard.Mira]: Companion11Fr
}

