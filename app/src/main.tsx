import { GreyluneOptionsSpecV2 } from '@gamepark/greylune/GreyluneOptions'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { GreyluneSetup } from '@gamepark/greylune/GreyluneSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material, MaterialI18n } from './material/Material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="greylune"
      Rules={GreyluneRules}
      optionsSpec={GreyluneOptionsSpecV2}
      GameSetup={GreyluneSetup}
      material={Material}
      materialI18n={MaterialI18n}
      locators={Locators}
      animations={gameAnimations}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
