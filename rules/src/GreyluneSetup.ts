import { MaterialGameSetup } from '@gamepark/rules-api'
import { GreyluneOptions } from './GreyluneOptions'
import { GreyluneRules } from './GreyluneRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class GreyluneSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, GreyluneOptions> {
  Rules = GreyluneRules

  setupMaterial(_options: GreyluneOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
