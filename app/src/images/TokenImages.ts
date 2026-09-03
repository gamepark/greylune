import { getVpToken, VpToken, VpTokenValue } from '@gamepark/greylune/material/VpToken'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { getEnumValues } from '@gamepark/rules-api'
import { BonusToken, Coin, IncomeToken, Seal } from '@gamepark/greylune/material/Tokens'
import BonusBackBlue from './tokens/BonusBackBlue.png'
import BonusBackOrange from './tokens/BonusBackOrange.png'
import BonusBackRed from './tokens/BonusBackRed.png'
import BonusBackPurple from './tokens/BonusBackPurple.png'
import BonusCoin from './tokens/BonusCoin.png'
import BonusSkill from './tokens/BonusSkill.png'
import BonusVillager from './tokens/BonusVillager.png'
import Coin1 from './tokens/Coin1.png'
import Coin5 from './tokens/Coin5.png'
import FirstPlayerToken from './tokens/FirstPlayerToken.png'
import IncomeToken1 from './tokens/IncomeToken1.png'
import IncomeToken1Back from './tokens/IncomeToken1Back.png'
import IncomeToken2 from './tokens/IncomeToken2.png'
import IncomeToken2Back from './tokens/IncomeToken2Back.png'
import IncomeToken3 from './tokens/IncomeToken3.png'
import IncomeToken3Back from './tokens/IncomeToken3Back.png'
import IncomeToken4 from './tokens/IncomeToken4.png'
import IncomeToken4Back from './tokens/IncomeToken4Back.png'
import IncomeToken5 from './tokens/IncomeToken5.png'
import IncomeToken5Back from './tokens/IncomeToken5Back.png'
import IncomeToken6 from './tokens/IncomeToken6.png'
import IncomeToken6Back from './tokens/IncomeToken6Back.png'
import IncomeToken7 from './tokens/IncomeToken7.png'
import IncomeToken7Back from './tokens/IncomeToken7Back.png'
import IncomeToken8 from './tokens/IncomeToken8.png'
import IncomeToken8Back from './tokens/IncomeToken8Back.png'
import Seal1 from './tokens/Seal1.png'
import Seal2 from './tokens/Seal2.png'
import Seal3 from './tokens/Seal3.png'
import SealBack from './tokens/SealBack.png'
import Vp25Blue from './tokens/Vp25Blue.png'
import Vp25Orange from './tokens/Vp25Orange.png'
import Vp25Red from './tokens/Vp25Red.png'
import Vp25Purple from './tokens/Vp25Purple.png'
import Vp50Blue from './tokens/Vp50Blue.png'
import Vp50Orange from './tokens/Vp50Orange.png'
import Vp50Red from './tokens/Vp50Red.png'
import Vp50Purple from './tokens/Vp50Purple.png'
import Vp75Blue from './tokens/Vp75Blue.png'
import Vp75Orange from './tokens/Vp75Orange.png'
import Vp75Red from './tokens/Vp75Red.png'
import Vp75Purple from './tokens/Vp75Purple.png'
import Vp100Blue from './tokens/Vp100Blue.png'
import Vp100Orange from './tokens/Vp100Orange.png'
import Vp100Red from './tokens/Vp100Red.png'
import Vp100Purple from './tokens/Vp100Purple.png'

export const coinImages: Record<Coin, string> = {
  [Coin.One]: Coin1,
  [Coin.Five]: Coin5
}

export const sealImages: Record<Seal, string> = {
  [Seal.One]: Seal1,
  [Seal.Two]: Seal2,
  [Seal.Three]: Seal3
}

export const incomeTokenImages: Record<IncomeToken, string> = {
  [IncomeToken.Income1]: IncomeToken1,
  [IncomeToken.Income2]: IncomeToken2,
  [IncomeToken.Income3]: IncomeToken3,
  [IncomeToken.Income4]: IncomeToken4,
  [IncomeToken.Income5]: IncomeToken5,
  [IncomeToken.Income6]: IncomeToken6,
  [IncomeToken.Income7]: IncomeToken7,
  [IncomeToken.Income8]: IncomeToken8
}

export const incomeTokenBacks: Record<IncomeToken, string> = {
  [IncomeToken.Income1]: IncomeToken1Back,
  [IncomeToken.Income2]: IncomeToken2Back,
  [IncomeToken.Income3]: IncomeToken3Back,
  [IncomeToken.Income4]: IncomeToken4Back,
  [IncomeToken.Income5]: IncomeToken5Back,
  [IncomeToken.Income6]: IncomeToken6Back,
  [IncomeToken.Income7]: IncomeToken7Back,
  [IncomeToken.Income8]: IncomeToken8Back
}

export const bonusTokenImages: Record<BonusToken, string> = {
  [BonusToken.Coin]: BonusCoin,
  [BonusToken.Skill]: BonusSkill,
  [BonusToken.Villager]: BonusVillager
}

export const bonusTokenBacks: Record<PlayerColor, string> = {
  [PlayerColor.Blue]: BonusBackBlue,
  [PlayerColor.Orange]: BonusBackOrange,
  [PlayerColor.Red]: BonusBackRed,
  [PlayerColor.Purple]: BonusBackPurple
}

/** The 2 sides of a player's tokens: the 25 turns over to 50, the 75 to 100. */
const vpTokenFronts: Record<PlayerColor, Record<VpTokenValue, string>> = {
  [PlayerColor.Blue]: { [VpTokenValue.Vp25]: Vp25Blue, [VpTokenValue.Vp75]: Vp75Blue },
  [PlayerColor.Orange]: { [VpTokenValue.Vp25]: Vp25Orange, [VpTokenValue.Vp75]: Vp75Orange },
  [PlayerColor.Red]: { [VpTokenValue.Vp25]: Vp25Red, [VpTokenValue.Vp75]: Vp75Red },
  [PlayerColor.Purple]: { [VpTokenValue.Vp25]: Vp25Purple, [VpTokenValue.Vp75]: Vp75Purple }
}

const vpTokenReverses: Record<PlayerColor, Record<VpTokenValue, string>> = {
  [PlayerColor.Blue]: { [VpTokenValue.Vp25]: Vp50Blue, [VpTokenValue.Vp75]: Vp100Blue },
  [PlayerColor.Orange]: { [VpTokenValue.Vp25]: Vp50Orange, [VpTokenValue.Vp75]: Vp100Orange },
  [PlayerColor.Red]: { [VpTokenValue.Vp25]: Vp50Red, [VpTokenValue.Vp75]: Vp100Red },
  [PlayerColor.Purple]: { [VpTokenValue.Vp25]: Vp50Purple, [VpTokenValue.Vp75]: Vp100Purple }
}

const byVpToken = (faces: Record<PlayerColor, Record<VpTokenValue, string>>): Record<VpToken, string> =>
  Object.fromEntries(
    getEnumValues(PlayerColor).flatMap((player) =>
      getEnumValues(VpTokenValue).map((value) => [getVpToken(player, value), faces[player][value]])
    )
  )

export const vpTokenImages = byVpToken(vpTokenFronts)
export const vpTokenBacks = byVpToken(vpTokenReverses)

export { FirstPlayerToken, SealBack }
