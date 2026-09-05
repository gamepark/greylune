import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { BonusToken, Coin, IncomeToken, Seal } from '@gamepark/greylune/material/Tokens'
import { VpToken } from '@gamepark/greylune/material/VpToken'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MoneyDescription, TokenDescription } from '@gamepark/react-game'
import { ComponentSize } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import {
  bonusTokenImages,
  coinImages,
  FirstPlayerToken,
  incomeTokenBacks,
  incomeTokenImages,
  sealImages,
  SealBack,
  vpTokenBacks,
  vpTokenImages
} from '../images/TokenImages'
import { sealSize } from '../locators/TableLayout'

export class CoinDescription extends MoneyDescription<PlayerColor, MaterialType, LocationType, Coin> {
  transparency = true
  images = coinImages

  getSize(coin: Coin): ComponentSize {
    return coin === Coin.Five ? { width: 2.32, height: 2.31 } : { width: 1.82, height: 1.82 }
  }

  getBorderRadius(): number {
    return 0
  }

  /**
   * The bank is unlimited, so it never enters the game state. What is shown is a heap: enough pieces
   * of each denomination for the scatter to read as a stock, and not one of them is ever counted.
   */
  staticItems: MaterialItem<PlayerColor, LocationType, Coin>[] = [
    { id: Coin.One, quantity: 10, location: { type: LocationType.CoinReserve } },
    { id: Coin.Five, quantity: 6, location: { type: LocationType.CoinReserve } }
  ]
}

export class SealDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, Seal> {
  width = sealSize.width
  height = sealSize.height
  transparency = true
  images = sealImages
  backImage = SealBack
}

/**
 * The stock shows the symbol side of the tokens; earning one turns it over onto a personal board,
 * income side up, and it never turns back. Which side shows is the location and nothing else, so
 * these tokens carry no `rotation` of their own.
 */
export class IncomeTokenDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, IncomeToken> {
  width = 2.52
  height = 2.17
  transparency = true
  images = incomeTokenImages
  backImages = incomeTokenBacks

  isFlipped(item: Partial<MaterialItem<PlayerColor, LocationType>>): boolean {
    return item.location?.type === LocationType.IncomeTokenStock
  }
}

export class BonusTokenDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, BonusToken> {
  width = 1.86
  height = 2
  transparency = true
  images = bonusTokenImages
}

/** Two double-sided tokens per player, waiting on the board until their owner has the points. */
export class VpTokenDescription extends TokenDescription<PlayerColor, MaterialType, LocationType, VpToken> {
  width = 1.86
  height = 2.3
  transparency = true
  images = vpTokenImages
  backImages = vpTokenBacks

  /** The 25 and the 75 are the sides a token starts on: `rotation` is it turned to 50 or 100. */
  isFlipped(item: Partial<MaterialItem<PlayerColor, LocationType>>): boolean {
    return !!item.location?.rotation
  }
}

export class FirstPlayerTokenDescription extends TokenDescription<PlayerColor, MaterialType, LocationType> {
  width = 3.44
  height = 5.7
  transparency = true
  image = FirstPlayerToken
}
