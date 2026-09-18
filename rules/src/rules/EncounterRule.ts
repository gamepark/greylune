import { Effect, Gain, GainType, isCheck, Requirement } from '../material/Effect'
import { EncounterCard, EncounterCardId, encounterCardData } from '../material/EncounterCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { incomeTokenGains } from '../material/Tokens'
import { GreyluneMaterial, GreyluneMove, GreyluneRule } from './GreyluneRule'
import { RuleId } from './RuleId'

/** Which requirement of which side of the card, when a Potion lets one of them be waved away. */
export type Ignored = { outcome: number; requirement: number }

/** What a move to resolve an Encounter says: the card, the sides paid for, the conditions waved away. */
export type ResolveOutcomeData = { card: number; outcomes: number[]; ignored?: Ignored[] }

/**
 * What both halves of meeting an Encounter need to know: what a card can be resolved for, and what
 * resolving it does. The two halves are two rules — {@link ResolveEncounterRule} names the card,
 * {@link ChooseOutcomeRule} names the sides — and neither can do without the other's reading of the
 * card: the first offers a card only if it can be resolved at all, which is the very list the second
 * lays out.
 */
export abstract class EncounterRule extends GreyluneRule {
  /** How many conditions a Potion lets the player wave away for the length of this adventure. */
  get ignores(): number {
    return this.remind<number>(Memory.IgnoredConditions) ?? 0
  }

  /** The front of an Encounter, which is where everything it asks and everything it gives is read. */
  protected front(card: number): EncounterCard {
    return this.encounterCards.getItem<EncounterCardId>(card).id.front!
  }

  /**
   * Every way this Encounter can be resolved: one side, the other, both, and what may be waved away.
   *
   * A side the player's boards already satisfy is not one of the ways, it is part of all of them: it
   * asks for nothing, so leaving it behind would be taking less for exactly the same price, and a
   * button offering that is a button offering a mistake. So the Ours met on both counts is not asked
   * which of its two rewards it hands over, and the Vallée of a player standing on 1 Force is only
   * ever asked whether they also send a Villager. What is left to choose is what has to be paid for.
   *
   * The same goes for a side a Potion makes free: once the Villager the Vallée asks for is waved
   * away, both sides cost a player standing on 1 Force what one of them does, and taking one alone
   * would again be taking less for the same price. A way is left out whenever another one takes more
   * sides and asks nothing this one does not.
   *
   * Two ways that ask for the same thing and pay the same thing are offered once — the Labyrinthe
   * prints the same half twice, and a player with a single Villager would otherwise be handed two
   * buttons saying exactly the same thing and asked to pick one.
   *
   * A way waving nothing away carries no `ignored` at all, rather than an `ignored` worth nothing: a
   * move travels as JSON, which drops a key set to `undefined`, and what comes back would then no
   * longer be equal to the move this list holds — the move the player just chose would be refused.
   */
  protected encounterMoves(card: number): ResolveOutcomeData[] {
    const front = this.front(card)
    const outcomes = encounterCardData[front].outcomes
    const free = outcomes.map((_, outcome) => outcome).filter((outcome) => this.isFree(front, outcome))
    const subsets = (outcomes.length > 1 ? [[0], [1], [0, 1]] : [[0]]).filter((subset) => free.every((outcome) => subset.includes(outcome)))
    const ways: ResolveOutcomeData[] = subsets.flatMap((subset) =>
      this.ignoreVariants(front, subset).map((ignored) => (ignored.length ? { card, outcomes: subset, ignored } : { card, outcomes: subset }))
    )
    const offers = ways.map((way) => this.offerOf(front, way))
    return ways
      .filter((_, index) => offers.indexOf(offers[index]) === index)
      .filter((way) => !ways.some((other) => this.takesMoreForNoMore(front, other, way)))
  }

  /** Whether `better` takes every side `way` takes and more, asking for nothing `way` does not. */
  private takesMoreForNoMore(front: EncounterCard, better: ResolveOutcomeData, way: ResolveOutcomeData): boolean {
    if (better.outcomes.length <= way.outcomes.length || !way.outcomes.every((outcome) => better.outcomes.includes(outcome))) return false
    const asked = outcomeRequirements(front, way.outcomes, way.ignored).map((requirement) => JSON.stringify(requirement))
    return outcomeRequirements(front, better.outcomes, better.ignored).every((requirement) => {
      const index = asked.indexOf(JSON.stringify(requirement))
      if (index < 0) return false
      asked.splice(index, 1)
      return true
    })
  }

  /**
   * Whether a side of the card costs the player nothing at all: it asks for nothing but "have at
   * least", and they have at least that much. What a Potion lends counts — it is lent for the whole
   * adventure and is spent by nothing here — but a condition waved away does not: waiving one is
   * spending the favour, and a side is only free while it is free of that too.
   */
  private isFree(front: EncounterCard, outcome: number): boolean {
    const requirements = encounterCardData[front].outcomes[outcome].requirements ?? []
    return requirements.every(isCheck) && this.canPay(requirements)
  }

  /** What a way costs and what it pays, which is all a player can tell one way from another by. */
  private offerOf(front: EncounterCard, data: ResolveOutcomeData): string {
    const requirements = outcomeRequirements(front, data.outcomes, data.ignored)
    const gains = outcomeGains(front, data.outcomes)
    return JSON.stringify([requirements, gains])
  }

  /**
   * The lists of conditions the player may wave away for a subset of sides, and still pay the rest.
   * Without a Potion or Ariok there is exactly one: the empty list.
   *
   * A favour is only ever offered where it is worth something. A price — coins, Villagers, Force or
   * Magic to spend — always is: waving it away keeps what the player would have paid, whether they
   * could pay it or not. A "have at least" is only worth waving away when the subset could not be
   * paid for without it: waving away a condition the player meets anyway would spend the Potion on
   * nothing.
   *
   * And once drunk, a favour is not kept for later — setting off again forgets it. So a list that
   * leaves a price paid which one more waiver would have kept is not offered: it is the same sides,
   * for more.
   */
  private ignoreVariants(front: EncounterCard, subset: number[]): Ignored[][] {
    const printed = encounterCardData[front].outcomes
    const all = subset.flatMap((outcome) => (printed[outcome].requirements ?? []).map((_, requirement) => ({ outcome, requirement })))
    const isPrice = (entry: Ignored) => !isCheck(printed[entry.outcome].requirements![entry.requirement])
    const variants = subsetsUpTo(all, this.ignores)
      .filter((ignored) => this.canPay(outcomeRequirements(front, subset, ignored)))
      .filter((ignored) =>
        ignored.every((entry) => isPrice(entry) || !this.canPay(outcomeRequirements(front, subset, without(ignored, entry))))
      )
    return variants.filter((ignored) => !variants.some((other) => other.length > ignored.length && ignored.every((entry) => other.includes(entry))))
  }

  /**
   * The conditions are paid, the rewards queued and the card pushed under the personal board.
   *
   * The Income token the card may carry is lifted off it first, and taken straight to the row it
   * will be paid from every Autumn. It is a piece lying on the card, so anything else would carry it
   * along: it would follow the card under the personal board and then have to cross it back, which
   * is not what taking a token off a card looks like. What it pays on the spot is queued where the
   * token itself stood among the rewards, so the order the card reads in is the order it pays in —
   * the road excepted, which always goes last (see {@link roadLast}).
   */
  protected resolve(data: ResolveOutcomeData): GreyluneMove[] {
    const front = this.front(data.card)
    const requirements = outcomeRequirements(front, data.outcomes, data.ignored)
    const gains = roadLast(outcomeGains(front, data.outcomes))
    const income = this.incomeOn(data.card)
    // The token is printed in the reward of one side: the other side leaves it where it lies.
    const taken = income.length > 0 && gains.some((gain) => gain.type === GainType.IncomeToken)
    this.pushGains(gains.flatMap((gain) => (gain.type === GainType.IncomeToken ? (taken ? incomeTokenGains[gain.token] : []) : [gain])))
    return [
      ...this.payRequirements(requirements.filter((requirement) => !isCheck(requirement))),
      ...(taken ? income.moveItems({ type: LocationType.IncomeTokenSpace, player: this.player }) : []),
      this.encounterCards.index(data.card).moveItem({ type: LocationType.UntoldStories, player: this.player }),
      this.startRule(RuleId.ResolveEffects)
    ]
  }

  /**
   * The Income token laid on a card, if the card carries one: it is created on the card when the card
   * is revealed, and handed over with it.
   */
  private incomeOn(card: number): GreyluneMaterial {
    return this.material(MaterialType.IncomeToken).location(LocationType.CardIncome).parent(card)
  }
}

/**
 * What a way of resolving an Encounter really asks for: everything the sides it takes are printed
 * with, less the conditions a Potion waves away. A waiver names a requirement by where it sits on
 * its side, so this is the one place that reading is written down — the buttons of the row read a
 * move the same way the rule that answers it does (see `EncounterActions` in the app).
 */
export const outcomeRequirements = (front: EncounterCard, outcomes: number[], ignored: Ignored[] = []): Requirement[] =>
  outcomes.flatMap((outcome) =>
    (encounterCardData[front].outcomes[outcome].requirements ?? []).filter(
      (_, requirement) => !ignored.some((entry) => entry.outcome === outcome && entry.requirement === requirement)
    )
  )

/** What it hands over: everything the sides it takes are printed with, in the order the card reads. */
export const outcomeGains = (front: EncounterCard, outcomes: number[]): Gain[] =>
  outcomes.flatMap((outcome) => encounterCardData[front].outcomes[outcome].gains ?? [])

/** The two together, which is what a button showing what it costs and what it pays is made of. */
export const outcomeEffect = (front: EncounterCard, data: ResolveOutcomeData): Effect => ({
  requirements: outcomeRequirements(front, data.outcomes, data.ignored),
  gains: outcomeGains(front, data.outcomes)
})

/**
 * The road goes last, whatever order the two sides of the card print it in.
 *
 * A journey is not a reward handed over, it is a whole Encounter resolved at the other end of it, so
 * everything the card already owes has to be in the player's hands before the Adventurer sets off:
 * 3 points crossing the 8 hand out a Bonus token they would rather spend here than out on the road.
 * The Tour solitaire and the Relais print their own rewards in that order; the Vallée pays the
 * points on one side and the road on the other, and only a player taking both sides ever needs this.
 */
const roadLast = (gains: Gain[]): Gain[] => [
  ...gains.filter((gain) => gain.type !== GainType.Travel),
  ...gains.filter((gain) => gain.type === GainType.Travel)
]

/** A list without one of its entries, the one and only one that is that very entry. */
const without = <T>(items: T[], item: T): T[] => items.filter((entry) => entry !== item)

/** Every subset of `items` of at most `size` entries, the empty one included. */
const subsetsUpTo = <T>(items: T[], size: number): T[][] => {
  if (size <= 0 || !items.length) return [[]]
  const [head, ...tail] = items
  return [...subsetsUpTo(tail, size), ...subsetsUpTo(tail, size - 1).map((subset) => [head, ...subset])]
}
