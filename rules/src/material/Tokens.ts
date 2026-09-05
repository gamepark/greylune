import { coins, force, Gain, magic, villager, vp } from './Effect'

/** Coins are punched in two denominations; the bank is unlimited. */
export enum Coin {
  One = 1,
  Five = 5
}

/** Seal tokens limit how often a Building can be exploited, and are worth their value when spent. */
export enum Seal {
  One = 1,
  Two,
  Three
}

/** The 8 Income tokens. Each one has a front (the income it grants) and a distinct back. */
export enum IncomeToken {
  Income1 = 1,
  Income2,
  Income3,
  Income4,
  Income5,
  Income6,
  Income7,
  Income8
}

/**
 * What an Income token pays: once when the Encounter it lies on is resolved, and again every Autumn
 * for the rest of the game (rulebook p.18).
 *
 * The token an Encounter carries is the one whose *back* is drawn on its reward scroll, and the two
 * sides are paired by the punchboard. That pairing and the appendix agree on 7 of the 8 tokens; on
 * the 8th they do not. The appendix credits both the Coopery and the Unicorn with 2 victory points,
 * which the punched tokens cannot pay: only one 2 is printed, and two 1s. So the unicorn, which the
 * board pairs with a 1, is worth 1 here.
 */
export const incomeTokenGains: Record<IncomeToken, Gain[]> = {
  /** Tree, on the World-tree. */
  [IncomeToken.Income1]: [vp(1)],
  /** Barrels, on the Coopery. */
  [IncomeToken.Income2]: [vp(2)],
  /** Helmet, on the Training. */
  [IncomeToken.Income3]: [force()],
  /** Sword, on the Ambush. */
  [IncomeToken.Income4]: [coins(1)],
  /** Pickaxe, on the Mine. */
  [IncomeToken.Income5]: [coins(2)],
  /** Wagon, on the Caravan. */
  [IncomeToken.Income6]: [coins(4)],
  /** Sheep. */
  [IncomeToken.Income7]: [coins(1)],
  /** Unicorn. */
  [IncomeToken.Income8]: [vp(1)]
}

/** The 3 Bonus tokens a player spends when crossing 8 and 20 points. */
export enum BonusToken {
  Coin = 1,
  Skill,
  Villager
}

export const bonusTokenGains: Record<BonusToken, Gain[]> = {
  [BonusToken.Coin]: [coins(5)],
  [BonusToken.Skill]: [force(), magic()],
  [BonusToken.Villager]: [villager()]
}

/**
 * Coins are not distinct pieces of material: a coin item is a denomination plus a quantity, and
 * `MaterialMoney` adds, spends and makes change across the denominations on its own. The bank being
 * unlimited, nothing else has to be counted.
 *
 * Highest denomination first: `MaterialMoney` walks the units in that order to make change. Passed
 * to `this.material(MaterialType.Coin).money(coins)`.
 */
export const coinUnits = [Coin.Five, Coin.One]
