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

/** The 3 Bonus tokens a player spends when crossing 8 and 20 points. */
export enum BonusToken {
  Coin = 1,
  Skill,
  Villager
}

/**
 * Coins are not distinct pieces of material: a coin item is a denomination plus a quantity, and
 * `MaterialMoney` adds, spends and makes change across the denominations on its own. The bank being
 * unlimited, nothing else has to be counted.
 *
 * Highest denomination first: `MaterialMoney` walks the units in that order to make change. Passed
 * to `this.material(MaterialType.Coin).money(coins)`.
 */
export const coins = [Coin.Five, Coin.One]
