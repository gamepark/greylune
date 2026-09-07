import { CustomMove, getEnumValues, isCustomMoveType, Location, Material, MaterialMoney, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { BONUS_TOKEN_SCORES, MAX_SKILL, SCORE_TRACK_SIZE } from '../Constants'
import { Memory } from '../Memory'
import { PlayerColor } from '../PlayerColor'
import { bonusToken, Count, Gain, GainType, placeVillager, Requirement, RequirementType, SEAL } from '../material/Effect'
import { EventTile, eventTileData, isFestival } from '../material/EventTile'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { activeVillagers, keepsPotions, playerCoins, playerForce, playerMagic, playerSeason, playerVp, scoreValue } from '../material/PlayerState'
import { Reaction, ReactionEffect, ReactionType, TriggerType } from '../material/Reaction'
import { Coin, coinUnits } from '../material/Tokens'
import { getVillagerPlayer, Villager } from '../material/Villager'
import { isPotion, VillageCard, VillageCardId, villageCardData } from '../material/VillageCard'
import { getVpToken, getVpTokenValue, VpToken, VpTokenValue } from '../material/VpToken'
import { Season } from '../Season'
import { isLastYear } from '../Year'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

export type GreyluneMove = MaterialMove<PlayerColor, MaterialType, LocationType, RuleId>
export type GreyluneMaterial = Material<PlayerColor, MaterialType, LocationType>

/** What a reaction may promise before a price is settled. */
export type CostReduction = {
  force?: number
  villagers?: number
  coins?: number
  /** Neris: the Villagers standing around the card are not paid for. */
  noSurcharge?: boolean
  /** Dorian: the Object bought is worth a victory point. */
  itemVp?: number
  /** Selia: the Seal is spent at whichever value the player names. */
  freeSealValue?: boolean
}

/** One of the answers a player may give to what is happening. */
export type ReactionChoice = { card: number; option: number }

/**
 * What every step of the rules shares.
 *
 * Three things run across a whole action, and they all live here: the queue of gains the action
 * still owes the player, the amounts that are handed over as custom moves so that each one is
 * counted against the state the one before it left, and the reaction windows, which open between
 * two of those and close back onto the queue.
 */
export abstract class GreyluneRule extends PlayerTurnRule<PlayerColor, MaterialType, LocationType, RuleId> {
  // ------------------------------------------------------------------ the material

  get villageCards(): GreyluneMaterial {
    return this.material(MaterialType.VillageCard)
  }

  get encounterCards(): GreyluneMaterial {
    return this.material(MaterialType.EncounterCard)
  }

  get villagers(): GreyluneMaterial {
    return this.material(MaterialType.Villager)
  }

  /**
   * The player's own Villagers, wherever they stand. Whose a figure is, is sculpted into it and not
   * written on the place it is put down (see {@link Villager}), which is what lets it be asked for in
   * the places that belong to nobody — the Event tile holds one Villager of each player, and holds
   * them the same way.
   */
  get myVillagers(): GreyluneMaterial {
    return this.villagers.id<Villager>((villager) => getVillagerPlayer(villager) === this.player)
  }

  get activeVillagers(): GreyluneMaterial {
    return activeVillagers(this, this.player)
  }

  get adventurer(): GreyluneMaterial {
    return this.material(MaterialType.Adventurer).id(this.player)
  }

  /** The Companions and Objects of the player, the only cards that can be tilted. */
  playerCard(index: number): VillageCard {
    return this.villageCards.getItem<VillageCardId>(index).id.front!
  }

  // ------------------------------------------------------------------ what the player has

  get coins(): number {
    return playerCoins(this, this.player)
  }

  get force(): number {
    return playerForce(this, this.player)
  }

  get magic(): number {
    return playerMagic(this, this.player)
  }

  get season(): Season {
    return playerSeason(this, this.player)
  }

  /** Force lent by a Potion for the length of one adventure: it counts, and it cannot be spent. */
  get temporaryForce(): number {
    return this.remind<number>(Memory.TemporaryForce) ?? 0
  }

  get temporaryMagic(): number {
    return this.remind<number>(Memory.TemporaryMagic) ?? 0
  }

  // ------------------------------------------------------------------ the Event of the year

  /** The tile of the year: the one on top of the pile, and the only one turned face up. */
  get tileOfTheYear(): GreyluneMaterial {
    return this.material(MaterialType.EventTile).location(LocationType.EventPile).rotation(true)
  }

  get eventTile(): EventTile | undefined {
    return this.tileOfTheYear.getItem()?.id as EventTile | undefined
  }

  /**
   * Where a Villager placed on the Event stands: on the tile itself, which is what `parent` says.
   * The tile is one of a pile, and a pile is drawn as a single stack whatever it holds, so a Villager
   * whose location does not name it would be laid out against the stack rather than against the card
   * on top of it, and end up under the pile instead of on the scroll.
   */
  get eventSpace(): Location<PlayerColor, LocationType> {
    return { type: LocationType.EventSpace, parent: this.tileOfTheYear.getIndex() }
  }

  /** Once a year for each player, whichever season they spend it in (rulebook p.6). */
  get hasUsedEvent(): boolean {
    return this.myVillagers.location(LocationType.EventSpace).length > 0
  }

  /**
   * What the Event of the year still offers this player: the options they can pay for, minus — on
   * the Festival, and only there — the spaces somebody is already standing on.
   *
   * A Villager that has walked onto the tile but not yet chosen stands in the middle of it, on no
   * option at all, so it takes nothing away from anybody.
   */
  get eventOptions(): number[] {
    const tile = this.eventTile
    if (tile === undefined) return []
    const taken = this.villagers.location(LocationType.EventSpace).getItems().map((item) => item.location.x)
    return eventTileData[tile].abilities.flatMap((ability, option) =>
      this.canPay(ability.requirements) && !(isFestival(tile) && taken.includes(option)) ? [option] : []
    )
  }

  // ------------------------------------------------------------------ the queue of gains

  get gains(): Gain[] {
    return this.remind<Gain[]>(Memory.Gains) ?? []
  }

  /** Gains fall in behind what the action already owes; a bonus that interrupts jumps the queue. */
  pushGains(gains: Gain[], first = false): void {
    if (gains.length) this.memorize(Memory.Gains, first ? [...gains, ...this.gains] : [...this.gains, ...gains])
  }

  /** Nothing left to do but hand out what is owed, and then pass the turn. */
  endOfAction(): GreyluneMove[] {
    return [this.startRule(RuleId.ResolveEffects)]
  }

  /** How much a gain is worth here and now: a number, or the Seal the activation is spending. */
  amount(count: Count): number {
    return count === SEAL ? (this.remind<number>(Memory.SealValue) ?? 0) : count
  }

  // ------------------------------------------------------------------ handing gains over

  /**
   * Every amount is handed over as a custom move rather than as the moves it comes down to. The
   * history then reads "gains 2 Force" instead of a marker sliding, and — what matters more — the
   * coins, the track and the score are counted when the move is played, against the state the gain
   * before it left behind.
   */
  gainMove(gain: Gain): GreyluneMove | undefined {
    switch (gain.type) {
      case GainType.Coins:
        return this.customMove(CustomMoveType.GainCoins, this.amount(gain.count))
      case GainType.Vp:
        return this.customMove(CustomMoveType.GainVp, this.amount(gain.count))
      case GainType.Force:
        return this.customMove(CustomMoveType.GainForce, this.amount(gain.count))
      case GainType.Magic:
        return this.customMove(CustomMoveType.GainMagic, this.amount(gain.count))
      case GainType.Villager:
        return this.customMove(CustomMoveType.GainVillagers, this.amount(gain.count))
      case GainType.Score:
        return this.customMove(CustomMoveType.GainVp, scoreValue(this, this.player, gain.score))
      default:
        return undefined
    }
  }

  onCustomMove(move: CustomMove): GreyluneMove[] {
    if (isCustomMoveType(CustomMoveType.GainCoins)(move)) return [...this.gainCoins(move.data as number), ...this.resume()]
    if (isCustomMoveType(CustomMoveType.GainVp)(move)) return [...this.gainVp(move.data as number), ...this.resume()]
    if (isCustomMoveType(CustomMoveType.GainForce)(move)) return this.gainSkill(move.data as number, true)
    if (isCustomMoveType(CustomMoveType.GainMagic)(move)) return this.gainSkill(move.data as number, false)
    if (isCustomMoveType(CustomMoveType.GainVillagers)(move)) return [...this.gainVillagers(move.data as number), ...this.resume()]
    return []
  }

  /**
   * The coins of the player, counted out afresh every time. A step must therefore never settle two
   * payments at once — the same coins would be spent twice — which is why a card and the ability it
   * pays for are added up before anything is handed over (see {@link coinCost}).
   */
  private get money(): MaterialMoney<PlayerColor, MaterialType, LocationType, Coin> {
    return this.material(MaterialType.Coin).location(LocationType.PlayerCoins).player(this.player).money(coinUnits)
  }

  gainCoins(amount: number): GreyluneMove[] {
    return this.money.addMoney(amount, { type: LocationType.PlayerCoins, player: this.player })
  }

  payCoins(amount: number): GreyluneMove[] {
    return this.money.removeMoney(amount, { type: LocationType.PlayerCoins, player: this.player })
  }

  /**
   * The score moves on, the marker wrapping round the 25 spaces of the track and the token standing
   * for the laps: a player holds one token at a time, the 25 taken off the table for the 75 (rulebook
   * p.13).
   * Crossing 8, and then 20, is what a Bonus token is spent on, and that jumps the queue.
   */
  gainVp(amount: number): GreyluneMove[] {
    const total = playerVp(this, this.player) + amount
    const tokens = this.material(MaterialType.BonusToken).location(LocationType.BonusTokens).player(this.player).length
    if (total >= BONUS_TOKEN_SCORES[0] && tokens === 3) this.pushGains([bonusToken], true)
    if (total >= BONUS_TOKEN_SCORES[1] && tokens >= 2) this.pushGains([bonusToken], true)
    return [...this.setVpToken(total), ...this.moveScoreMarker(total)]
  }

  private moveScoreMarker(total: number): GreyluneMove[] {
    const marker = this.material(MaterialType.ScoreMarker).id(this.player)
    const x = total - vpTokenFor(total)
    return marker.getItem()?.location.x === x ? [] : [marker.moveItem({ type: LocationType.ScoreTrack, x })]
  }

  /**
   * The token the score calls for, taken out of its pile or turned over. A score never comes back down,
   * so the token it replaces is taken off the table rather than handed back to a pile it would only
   * leave once: the 25 is gone for good the moment the 75 comes out.
   */
  private setVpToken(total: number): GreyluneMove[] {
    const value = vpTokenFor(total)
    const held = this.material(MaterialType.VpToken).location(LocationType.PlayerVpTokens).player(this.player).getItem()
    const heldValue = held
      ? getVpTokenValue(held.id as VpToken) === VpTokenValue.Vp25
        ? held.location.rotation
          ? 50
          : 25
        : held.location.rotation
          ? 100
          : 75
      : 0
    if (value === heldValue) return []
    const moves: GreyluneMove[] = []
    const wanted: VpTokenValue = value >= 75 ? VpTokenValue.Vp75 : VpTokenValue.Vp25
    if (held && getVpTokenValue(held.id as VpToken) !== wanted) {
      moves.push(this.material(MaterialType.VpToken).location(LocationType.PlayerVpTokens).player(this.player).deleteItem())
    }
    if (value === 0) return moves
    const token = this.material(MaterialType.VpToken).id(getVpToken(this.player, wanted))
    const flipped = value === 50 || value === 100
    moves.push(token.moveItem({ type: LocationType.PlayerVpTokens, player: this.player, rotation: flipped }))
    return moves
  }

  /**
   * A track stops at 5. Lucan turns one skill into the other, so the window opens on the way back to
   * the queue, and only when the marker actually moved.
   */
  gainSkill(amount: number, isForce: boolean): GreyluneMove[] {
    const level = isForce ? this.force : this.magic
    const target = Math.min(MAX_SKILL, level + amount)
    if (target === level) return this.resume()
    const marker = this.material(isForce ? MaterialType.StrengthMarker : MaterialType.MagicMarker).player(this.player)
    const move = marker.moveItem({ type: isForce ? LocationType.StrengthTrack : LocationType.MagicTrack, player: this.player, x: target })
    this.memorize(Memory.CurrentGain, { type: isForce ? GainType.Force : GainType.Magic, count: amount })
    return [move, ...this.resume([TriggerType.GainSkill])]
  }

  /** Villagers come out of the reserve. A player who has none left gains nothing (rulebook p.8). */
  gainVillagers(amount: number): GreyluneMove[] {
    return this.villagers.location(LocationType.VillagerReserve).player(this.player).limit(amount).moveItems({
      type: LocationType.ActiveVillagers,
      player: this.player
    })
  }

  // ------------------------------------------------------------------ paying

  /**
   * Whether the player can meet a requirement, counting what a Potion lends and what a reaction has
   * already promised. A rule about to offer an action asks with the reductions its Companions could
   * still promise, so that a card only a Companion can pay for is offered all the same.
   */
  canPay(requirements: Requirement[] = [], reduction: CostReduction = this.costReduction): boolean {
    return requirements.every((requirement) => this.canPayOne(requirement, reduction))
  }

  private canPayOne(requirement: Requirement, reduction: CostReduction = this.costReduction): boolean {
    const count = requirement.count ?? 1
    switch (requirement.type) {
      case RequirementType.Force:
        return this.force + this.temporaryForce >= count
      case RequirementType.Magic:
        return this.magic + this.temporaryMagic >= count
      case RequirementType.Skills:
        return this.force + this.temporaryForce + this.magic + this.temporaryMagic >= count
      case RequirementType.SpendCoins:
        return this.coins >= Math.max(0, count - (reduction.coins ?? 0))
      case RequirementType.SpendForce:
        return this.force >= Math.max(0, count - (reduction.force ?? 0))
      case RequirementType.SpendMagic:
        return this.magic >= count
      case RequirementType.SpendVillagers:
        return this.activeVillagers.length >= Math.max(0, count - (reduction.villagers ?? 0))
      case RequirementType.ReturnVillager:
        return this.activeVillagers.length >= 1
      case RequirementType.DiscardItem:
        return this.material(MaterialType.VillageCard).location(LocationType.Items).player(this.player).length >= 1
      case RequirementType.TellStories:
        return this.encounterCards.location(LocationType.UntoldStories).player(this.player).length >= count
      default:
        // Tilt, DiscardCard and the Seals are checked against the card itself, by whoever holds it.
        return true
    }
  }

  /**
   * What a requirement takes. The three "have at least" ones take nothing, and the ones that leave
   * a choice — an Object to discard, stories to move — are handled by the rule that asks for them.
   */
  payRequirements(requirements: Requirement[] = []): GreyluneMove[] {
    return requirements.flatMap((requirement) => this.payOne(requirement))
  }

  /** What a list of requirements asks for in coins: a Seal is worth what it was spent at. */
  coinCost(requirements: Requirement[] = []): number {
    const reduction = this.costReduction
    return requirements.reduce((total, requirement) => {
      if (requirement.type === RequirementType.SpendCoins) return total + Math.max(0, (requirement.count ?? 1) - (reduction.coins ?? 0))
      if (requirement.type === RequirementType.SealCoins) return total + (this.remind<number>(Memory.SealValue) ?? 0)
      return total
    }, 0)
  }

  private payOne(requirement: Requirement): GreyluneMove[] {
    const count = requirement.count ?? 1
    const reduction = this.costReduction
    switch (requirement.type) {
      case RequirementType.SpendCoins:
      case RequirementType.SealCoins:
        return this.payCoins(this.coinCost([requirement]))
      case RequirementType.SpendForce:
        return this.spendSkill(Math.max(0, count - (reduction.force ?? 0)), true)
      case RequirementType.SpendMagic:
        return this.spendSkill(count, false)
      case RequirementType.SpendVillagers:
        return this.spendVillagers(Math.max(0, count - (reduction.villagers ?? 0)))
      case RequirementType.ReturnVillager:
        return this.activeVillagers.limit(1).moveItems({ type: LocationType.VillagerReserve, player: this.player })
      default:
        return []
    }
  }

  spendSkill(amount: number, isForce: boolean): GreyluneMove[] {
    if (amount <= 0) return []
    const level = isForce ? this.force : this.magic
    const marker = this.material(isForce ? MaterialType.StrengthMarker : MaterialType.MagicMarker).player(this.player)
    return [
      marker.moveItem({
        type: isForce ? LocationType.StrengthTrack : LocationType.MagicTrack,
        player: this.player,
        x: Math.max(0, level - amount)
      })
    ]
  }

  /** A Villager spent rests in the camp until Autumn (rulebook p.14). */
  spendVillagers(amount: number): GreyluneMove[] {
    if (amount <= 0) return []
    return this.activeVillagers.limit(amount).moveItems({ type: LocationType.Camp, player: this.player })
  }

  // ------------------------------------------------------------------ reactions

  get costReduction(): CostReduction {
    return this.remind<CostReduction>(Memory.CostReduction) ?? {}
  }

  reduceCost(reduction: CostReduction): void {
    this.memorize(Memory.CostReduction, { ...this.costReduction, ...reduction })
  }

  /**
   * The Companions and Potions that can answer what is happening, and the option each of them
   * offers. A card that is already tilted, or that the player cannot pay for, is not among them.
   */
  reactionChoices(triggers: TriggerType[]): ReactionChoice[] {
    const choices: ReactionChoice[] = []
    for (const card of this.playerCards.getIndexes()) {
      const reaction = villageCardData[this.playerCard(card)].reaction
      if (!reaction || !reaction.triggers.some((trigger) => triggers.includes(trigger))) continue
      if (!this.canReact(card, reaction)) continue
      reaction.options.forEach((_, option) => choices.push({ card, option }))
    }
    return choices
  }

  private canReact(card: number, reaction: Reaction): boolean {
    const item = this.villageCards.getItem(card)
    for (const requirement of reaction.requirements) {
      if (requirement.type === RequirementType.Tilt && item.location.rotation === true) return false
      if (!this.canPayOne(requirement)) return false
    }
    // Isandre may not answer her own tilting: she would straighten herself, over and over.
    return !(reaction.triggers.includes(TriggerType.TiltCard) && this.remind<number>(Memory.LastTilted) === card)
  }

  get playerCards(): GreyluneMaterial {
    return this.villageCards.player(this.player).location((location) => location.type === LocationType.Items || location.type === LocationType.Companions)
  }

  /**
   * The best each available answer could still promise, taken together: what a rule must reckon
   * with before deciding that an action is out of the player's reach.
   */
  potentialReduction(triggers: TriggerType[]): CostReduction {
    const reduction: CostReduction = { ...this.costReduction }
    for (const card of new Set(this.reactionChoices(triggers).map((choice) => choice.card))) {
      for (const option of villageCardData[this.playerCard(card)].reaction!.options) {
        switch (option.type) {
          case ReactionType.ReduceForceCost:
            reduction.force = (reduction.force ?? 0) + 1
            break
          case ReactionType.ReduceVillagerCost:
            reduction.villagers = (reduction.villagers ?? 0) + 1
            break
          case ReactionType.CheaperItem:
            reduction.coins = (reduction.coins ?? 0) + 1
            break
          case ReactionType.ChooseSealValue:
            reduction.freeSealValue = true
            break
        }
      }
    }
    return reduction
  }

  /**
   * Back to the queue, through a reaction window when there is anything to answer with. The window
   * is only ever opened when the player has a card for it: nobody is asked to pass on nothing.
   */
  resume(triggers: TriggerType[] = []): GreyluneMove[] {
    return this.openReactions(triggers, RuleId.ResolveEffects)
  }

  openReactions(triggers: TriggerType[], next: RuleId): GreyluneMove[] {
    if (!triggers.length || !this.reactionChoices(triggers).length) return [this.startRule(next)]
    this.memorize(Memory.Trigger, triggers)
    this.memorize(Memory.Resume, next)
    return [this.startRule(RuleId.Reaction)]
  }

  reactionEffect(card: number, option: number): ReactionEffect {
    return villageCardData[this.playerCard(card)].reaction!.options[option]
  }

  /**
   * A Companion is tilted; a Potion is emptied and goes back in the box, unless Selia is there to
   * tilt it instead (rulebook p.15). Either way a card just went down, and Isandre may say so — so
   * the window a tilt happens in grows a trigger it was not opened for.
   */
  useReaction(card: number, option: number): GreyluneMove[] {
    const tiltedBefore = this.remind<number>(Memory.LastTilted)
    return [...this.payReactionCost(card), ...this.applyReaction(card, option, tiltedBefore)]
  }

  private payReactionCost(card: number): GreyluneMove[] {
    const front = this.playerCard(card)
    const reaction = villageCardData[front].reaction!
    const moves: GreyluneMove[] = []
    let tilted = false
    for (const requirement of reaction.requirements) {
      switch (requirement.type) {
        case RequirementType.Tilt:
          moves.push(this.villageCards.index(card).rotateItem(true))
          tilted = true
          break
        case RequirementType.DiscardCard:
          if (isPotion(front) && keepsPotions(this, this.player)) {
            moves.push(this.villageCards.index(card).rotateItem(true))
            tilted = true
          } else {
            moves.push(this.villageCards.index(card).deleteItem())
          }
          break
        default:
          moves.push(...this.payRequirements([requirement]))
      }
    }
    if (tilted) {
      this.memorize(Memory.LastTilted, card)
      const triggers = this.remind<TriggerType[]>(Memory.Trigger) ?? []
      if (!triggers.includes(TriggerType.TiltCard)) this.memorize(Memory.Trigger, [...triggers, TriggerType.TiltCard])
    }
    return moves
  }

  private applyReaction(card: number, option: number, tiltedBefore?: number): GreyluneMove[] {
    const effect = this.reactionEffect(card, option)
    switch (effect.type) {
      case ReactionType.ExtraTravel:
        this.memorize(Memory.TravelLeft, (this.remind<number>(Memory.TravelLeft) ?? 0) + effect.count)
        return []
      case ReactionType.PlaceVillager:
        this.pushGains([placeVillager], true)
        return []
      case ReactionType.TemporarySkills:
        if (effect.force) this.memorize(Memory.TemporaryForce, this.temporaryForce + effect.force)
        if (effect.magic) this.memorize(Memory.TemporaryMagic, this.temporaryMagic + effect.magic)
        return []
      case ReactionType.IgnoreCondition:
        this.memorize(Memory.IgnoredConditions, (this.remind<number>(Memory.IgnoredConditions) ?? 0) + 1)
        return []
      case ReactionType.StoryValue3:
        this.memorize(Memory.StoryBoost, (this.remind<number>(Memory.StoryBoost) ?? 0) + 1)
        return []
      case ReactionType.ReduceForceCost:
        this.reduceCost({ force: (this.costReduction.force ?? 0) + 1 })
        return []
      case ReactionType.ReduceVillagerCost:
        this.reduceCost({ villagers: (this.costReduction.villagers ?? 0) + 1 })
        return []
      case ReactionType.CheaperItem:
        this.reduceCost({ coins: (this.costReduction.coins ?? 0) + 1, itemVp: (this.costReduction.itemVp ?? 0) + 1 })
        return []
      case ReactionType.ExtraCoins:
        // Handed over there and then rather than queued: they are what pays for the card being bought.
        return this.gainCoins(effect.count)
      case ReactionType.NoSurcharge:
        this.reduceCost({ noSurcharge: true })
        return []
      case ReactionType.ChooseSealValue:
        this.reduceCost({ freeSealValue: true })
        return []
      case ReactionType.OtherSkill: {
        // Lucan: whichever of the two has just been gained, the player gains 1 of the other.
        const gain = this.remind<Gain>(Memory.CurrentGain)
        this.pushGains([{ type: gain?.type === GainType.Force ? GainType.Magic : GainType.Force, count: 1 }], true)
        return []
      }
      case ReactionType.StraightenTilted:
        // Isandre: the card that had just gone down stands up again — never the one she went down for.
        return tiltedBefore === undefined ? [] : [this.villageCards.index(tiltedBefore).rotateItem(false)]
    }
  }

  // ------------------------------------------------------------------ the turn, the year, the game

  /**
   * The next player of the round who still has something to do: those who have reached Autumn are
   * skipped, and when there is nobody left the year is over.
   */
  nextActivePlayer(): PlayerColor | undefined {
    const players = this.game.players
    const start = players.indexOf(this.player)
    for (let step = 1; step <= players.length; step++) {
      const player = players[(start + step) % players.length]
      if (playerSeason(this, player) !== Season.Autumn) return player
    }
    return undefined
  }

  /** The rule a player takes their turn in, which is the season they are in. */
  seasonRule(player: PlayerColor): RuleId {
    return playerSeason(this, player) === Season.Spring ? RuleId.Spring : RuleId.Summer
  }

  /** The action is over: the memory it needed is dropped and the turn passes, or the year ends. */
  endOfTurn(): GreyluneMove[] {
    this.forgetAction()
    const next = this.nextActivePlayer()
    if (next !== undefined) return [this.startPlayerTurn(this.seasonRule(next), next)]
    return isLastYear(this) ? [this.endGame()] : [this.startRule(RuleId.Winter)]
  }

  /**
   * The memory is emptied between two turns. Nothing in it outlives an action — which year is being
   * played is read off the Encounter deck — so the whole enum is dropped rather than a list that
   * would have to be kept in step with it.
   */
  forgetAction(): void {
    for (const key of getEnumValues(Memory)) this.forget(key)
  }
}

/** The token a score calls for: none below 25, then one lap of the track for each 25 up to 100. */
export const vpTokenFor = (total: number): number => Math.min(100, Math.floor(total / SCORE_TRACK_SIZE) * SCORE_TRACK_SIZE)
